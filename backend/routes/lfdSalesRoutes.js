const express = require('express');
const router = express.Router();
const { getSql, runSql, allSql, db } = require('../lfdDb');
const { authenticateLfdToken, requireLfdPermission, logLfdAudit } = require('../middlewares/lfdAuth');
const lfdAccountingService = require('../services/lfdAccountingService');
const crypto = require('crypto');

// Utilitaire pour exécuter une transaction SQLite de manière sécurisée
const runTransaction = async (callback) => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        await runSql('BEGIN TRANSACTION');
        const result = await callback();
        await runSql('COMMIT');
        resolve(result);
      } catch (error) {
        await runSql('ROLLBACK');
        reject(error);
      }
    });
  });
};

// 1. Récupérer toutes les ventes
router.get('/', authenticateLfdToken, requireLfdPermission('sale.read'), async (req, res) => {
  try {
    const limit = req.query.limit || 100;
    const sales = await allSql(`
      SELECT s.*, c.name as customer_name, e.firstName as created_by_name 
      FROM LFD_Sales s
      LEFT JOIN LFD_Customers c ON s.customer_id = c.id
      LEFT JOIN LFD_Employees e ON s.created_by = e.id
      ORDER BY s.id DESC
      LIMIT ?
    `, [limit]);
    res.json(sales);
  } catch (error) {
    console.error('[LFD SALES] Erreur GET /:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des ventes.' });
  }
});

// 2. Créer une vente (Brouillon)
router.post('/', authenticateLfdToken, requireLfdPermission('sale.create'), async (req, res) => {
  const { customer_id, items, payment_type, discount } = req.body;

  if (!customer_id || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Client et articles requis.' });
  }

  try {
    const customer = await getSql(`SELECT id, status FROM LFD_Customers WHERE id = ?`, [customer_id]);
    if (!customer || customer.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Client introuvable ou inactif.' });
    }

    const saleNumber = `VTE-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    let subtotal = 0;
    const saleDiscount = discount || 0;

    const validatedItems = [];

    // Validation des articles et calculs
    for (let item of items) {
      const product = await getSql(`SELECT id, selling_price, status FROM LFD_Products WHERE id = ?`, [item.product_id]);
      if (!product || product.status !== 'ACTIVE') {
        return res.status(400).json({ error: `Produit ID ${item.product_id} invalide.` });
      }
      
      const qty = parseInt(item.quantity);
      if (qty <= 0) return res.status(400).json({ error: 'Quantité invalide.' });

      const itemDiscount = item.discount || 0;
      // On utilise le prix de vente autorisé dans la DB
      const unitPrice = product.selling_price;
      const lineTotal = (unitPrice * qty) - itemDiscount;

      subtotal += lineTotal;

      validatedItems.push({
        product_id: product.id,
        quantity: qty,
        unit_price: unitPrice,
        discount: itemDiscount,
        line_total: lineTotal
      });
    }

    const total = subtotal - saleDiscount;

    await runTransaction(async () => {
      await runSql(`
        INSERT INTO LFD_Sales (sale_number, customer_id, subtotal, discount, total, payment_type, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?, 'DRAFT', ?)
      `, [saleNumber, customer_id, subtotal, saleDiscount, total, payment_type || 'CASH', req.user.id]);

      const sale = await getSql(`SELECT id FROM LFD_Sales WHERE sale_number = ?`, [saleNumber]);

      for (let item of validatedItems) {
        await runSql(`
          INSERT INTO LFD_SaleItems (sale_id, product_id, quantity, unit_price, discount, line_total)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [sale.id, item.product_id, item.quantity, item.unit_price, item.discount, item.line_total]);
      }
      
      const newSale = await getSql(`SELECT * FROM LFD_Sales WHERE id = ?`, [sale.id]);
      await logLfdAudit(req.user.id, 'CREATE', 'LFD_Sales', sale.id, null, newSale, 'Création Brouillon', req.ip);
    });

    const finalSale = await getSql(`SELECT * FROM LFD_Sales WHERE sale_number = ?`, [saleNumber]);
    res.status(201).json(finalSale);
  } catch (error) {
    console.error('[LFD SALES] Erreur POST /:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la vente.' });
  }
});

// 3. Valider une vente (Stock + Paiement/Créance)
router.post('/:id/validate', authenticateLfdToken, requireLfdPermission('sale.validate'), async (req, res) => {
  const saleId = req.params.id;
  const { cash_session_id, warehouse_id } = req.body; // Caisse en cours et dépôt source

  try {
    const sale = await getSql(`SELECT * FROM LFD_Sales WHERE id = ?`, [saleId]);
    if (!sale) return res.status(404).json({ error: 'Vente introuvable.' });
    if (sale.status !== 'DRAFT') return res.status(400).json({ error: 'Vente déjà validée ou annulée.' });

    const items = await allSql(`SELECT * FROM LFD_SaleItems WHERE sale_id = ?`, [saleId]);
    if (items.length === 0) return res.status(400).json({ error: 'Vente vide.' });

    const customer = await getSql(`SELECT * FROM LFD_Customers WHERE id = ?`, [sale.customer_id]);
    if (!warehouse_id) return res.status(400).json({ error: 'Dépôt source requis pour la sortie de stock.' });

    // Transaction Complète
    await runTransaction(async () => {
      // A. VÉRIFICATION DU STOCK DISPONIBLE (Physique - Réservé)
      for (let item of items) {
        const stockRow = await getSql(`
          SELECT SUM(CASE 
            WHEN movement_type IN ('ENTRY', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'RETURN', 'UNRESERVE') THEN quantity
            WHEN movement_type IN ('EXIT', 'TRANSFER_OUT', 'ADJUSTMENT_OUT', 'RESERVE') THEN -quantity
            ELSE 0 END) as current
          FROM LFD_StockMovements WHERE product_id = ? AND warehouse_id = ?
        `, [item.product_id, warehouse_id]);

        const currentStock = stockRow.current || 0;
        if (currentStock < item.quantity) {
          throw new Error(`Stock disponible insuffisant pour le produit ID ${item.product_id} dans le dépôt sélectionné.`);
        }
      }

      // B. RÉSERVATION DE STOCK ET ORDRE DE PRÉPARATION
      const mvtRefBase = `MVT-RES-${sale.sale_number}`;
      for (let item of items) {
        await runSql(`
          INSERT INTO LFD_StockMovements (reference, product_id, warehouse_id, movement_type, quantity, source_type, source_id, reason, created_by)
          VALUES (?, ?, ?, 'RESERVE', ?, 'SALE', ?, ?, ?)
        `, [`${mvtRefBase}-${item.product_id}`, item.product_id, warehouse_id, item.quantity, sale.id, 'Réservation Vente N° ' + sale.sale_number, req.user.id]);
      }

      // Création de l'ordre de préparation
      const prepNumber = `PREP-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      await runSql(`
        INSERT INTO LFD_PreparationOrders (preparation_number, sale_id, warehouse_id, status)
        VALUES (?, ?, ?, 'TO_PREPARE')
      `, [prepNumber, sale.id, warehouse_id]);

      const prepOrder = await getSql(`SELECT id FROM LFD_PreparationOrders WHERE preparation_number = ?`, [prepNumber]);
      
      for (let item of items) {
        await runSql(`
          INSERT INTO LFD_PreparationItems (preparation_order_id, sale_item_id, quantity_to_prepare)
          VALUES (?, ?, ?)
        `, [prepOrder.id, item.id, item.quantity]);
      }

      // C. PAIEMENT OU CRÉANCE
      if (sale.payment_type === 'CREDIT') {
        if (!customer.credit_allowed) {
          throw new Error("Le client n'est pas autorisé à prendre à crédit.");
        }
        // Vérification limite (très simplifié)
        const debtRow = await getSql(`SELECT SUM(remaining_amount) as debt FROM LFD_Receivables WHERE customer_id = ? AND status != 'PAID'`, [customer.id]);
        const currentDebt = debtRow.debt || 0;
        if (customer.credit_limit > 0 && (currentDebt + sale.total) > customer.credit_limit) {
          throw new Error('Limite de crédit dépassée pour ce client.');
        }

        await runSql(`
          INSERT INTO LFD_Receivables (customer_id, sale_id, original_amount, remaining_amount)
          VALUES (?, ?, ?, ?)
        `, [customer.id, sale.id, sale.total, sale.total]);
        
      } else { // COMPTANT
        if (!cash_session_id) throw new Error('Session de caisse requise pour paiement comptant.');
        
        const session = await getSql(`SELECT id, status FROM LFD_CashSessions WHERE id = ? AND cashier_id = ?`, [cash_session_id, req.user.id]);
        if (!session || session.status !== 'OPEN') throw new Error('Session de caisse invalide ou fermée.');

        const payNum = `PAY-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        
        // Créer le paiement
        await runSql(`
          INSERT INTO LFD_Payments (payment_number, sale_id, customer_id, amount, payment_method, cash_session_id, received_by)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [payNum, sale.id, customer.id, sale.total, 'CASH', session.id, req.user.id]);

        // Transaction dans la caisse
        await runSql(`
          INSERT INTO LFD_CashTransactions (cash_session_id, type, amount, source_type, source_id, description, created_by)
          VALUES (?, 'SALE_PAYMENT', ?, 'SALE', ?, ?, ?)
        `, [session.id, sale.total, sale.id, 'Paiement Vente N° ' + sale.sale_number, req.user.id]);

        // Mise à jour solde théorique de la caisse
        await runSql(`UPDATE LFD_CashSessions SET theoretical_balance = theoretical_balance + ? WHERE id = ?`, [sale.total, session.id]);
      }

      // D. MISE À JOUR DE LA VENTE
      const nextStatus = sale.payment_type === 'CREDIT' ? 'VALIDATED' : 'PAID';
      await runSql(`
        UPDATE LFD_Sales 
        SET status = ?, validated_by = ?, validated_at = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [nextStatus, req.user.id, sale.id]);

      const updatedSale = await getSql(`SELECT * FROM LFD_Sales WHERE id = ?`, [sale.id]);
      await logLfdAudit(req.user.id, 'VALIDATE', 'LFD_Sales', sale.id, sale, updatedSale, 'Validation Vente', req.ip);

      // --- PHASE 5B: INTEGRATION COMPTABLE AUTOMATIQUE ---
      const eventType = sale.payment_type === 'CREDIT' ? 'SALE_CREDIT' : 'SALE_CASH';
      await lfdAccountingService.postAccountingEvent(
        eventType,
        'SALE',
        sale.id,
        sale.total,
        { customer_id: customer.id },
        req.user.id,
        req.ip
      );
    });

    res.json({ success: true, message: 'Vente validée avec succès.' });
  } catch (error) {
    console.error('[LFD SALES] Erreur VALIDATION:', error.message);
    res.status(400).json({ error: error.message || 'Erreur lors de la validation.' });
  }
});

// 4. Annuler une vente
router.post('/:id/cancel', authenticateLfdToken, requireLfdPermission('sale.cancel'), async (req, res) => {
  const saleId = req.params.id;
  const { reason } = req.body;

  if (!reason) return res.status(400).json({ error: "Motif d'annulation requis." });

  try {
    const sale = await getSql(`SELECT * FROM LFD_Sales WHERE id = ?`, [saleId]);
    if (!sale) return res.status(404).json({ error: 'Vente introuvable.' });
    if (sale.status === 'CANCELLED') return res.status(400).json({ error: 'Vente déjà annulée.' });

    await runTransaction(async () => {
      if (sale.status !== 'DRAFT') {
        // Annuler Mouvements de stock (faire un UNRESERVE au lieu de RETURN si pas encore sorti, ou RETURN si sorti)
        // Pour simplifier, on trouve tout mouvement lié à cette vente et on l'inverse.
        // EXIT -> RETURN. RESERVE -> UNRESERVE.
        const mvts = await allSql(`SELECT * FROM LFD_StockMovements WHERE source_type = 'SALE' AND source_id = ?`, [sale.id]);
        for (let mvt of mvts) {
          const invertType = mvt.movement_type === 'RESERVE' ? 'UNRESERVE' : 'RETURN';
          await runSql(`
            INSERT INTO LFD_StockMovements (reference, product_id, warehouse_id, movement_type, quantity, source_type, source_id, reason, created_by)
            VALUES (?, ?, ?, ?, ?, 'SALE_CANCEL', ?, ?, ?)
          `, [mvt.reference + '-INV', mvt.product_id, mvt.warehouse_id, invertType, mvt.quantity, sale.id, 'Annulation Vente: ' + reason, req.user.id]);
        }
        
        // Annuler Préparation et Sorties et Livraisons
        await runSql(`UPDATE LFD_PreparationOrders SET status = 'CANCELLED', updatedAt = CURRENT_TIMESTAMP WHERE sale_id = ?`, [sale.id]);
        await runSql(`UPDATE LFD_StockReleases SET status = 'CANCELLED' WHERE sale_id = ?`, [sale.id]);
        await runSql(`UPDATE LFD_Deliveries SET status = 'CANCELLED', updatedAt = CURRENT_TIMESTAMP WHERE sale_id = ?`, [sale.id]);

        if (sale.payment_type === 'CASH' || sale.status === 'PAID') {
          // Annuler Transaction Caisse (Créer un décaissement inverse REFUND)
          const payments = await allSql(`SELECT * FROM LFD_Payments WHERE sale_id = ?`, [sale.id]);
          for (let p of payments) {
            // Note: on annule sur la session de caisse courante, s'il y en a une, sinon on rejette (très stricte)
            // Pour simplifier on ajuste la même session ou une session active du caissier actuel
            const session = await getSql(`SELECT id FROM LFD_CashSessions WHERE cashier_id = ? AND status = 'OPEN'`, [req.user.id]);
            if (!session) throw new Error('Vous devez avoir une session de caisse ouverte pour annuler un paiement.');
            
            await runSql(`
              INSERT INTO LFD_CashTransactions (cash_session_id, type, amount, source_type, source_id, description, created_by)
              VALUES (?, 'EXPENSE', ?, 'SALE_CANCEL', ?, ?, ?)
            `, [session.id, p.amount, sale.id, 'Remboursement Annulation Vente ' + sale.sale_number, req.user.id]);
            
            await runSql(`UPDATE LFD_CashSessions SET theoretical_balance = theoretical_balance - ? WHERE id = ?`, [p.amount, session.id]);
          }
        }

        if (sale.payment_type === 'CREDIT') {
          // Annuler créance
          await runSql(`UPDATE LFD_Receivables SET status = 'CANCELLED' WHERE sale_id = ?`, [sale.id]);
        }
      }

      await runSql(`UPDATE LFD_Sales SET status = 'CANCELLED', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, [sale.id]);
      
      const updatedSale = await getSql(`SELECT * FROM LFD_Sales WHERE id = ?`, [sale.id]);
      await logLfdAudit(req.user.id, 'CANCEL', 'LFD_Sales', sale.id, sale, updatedSale, 'Annulation: ' + reason, req.ip);

      // --- PHASE 5B: INTEGRATION COMPTABLE AUTOMATIQUE ---
      await lfdAccountingService.reverseAccountingEventBySource('SALE', sale.id, req.user.id, req.ip);
    });

    res.json({ success: true, message: 'Vente annulée.' });
  } catch (error) {
    console.error('[LFD SALES] Erreur ANNULATION:', error);
    res.status(400).json({ error: error.message || "Erreur lors de l'annulation." });
  }
});

// Récupérer détail vente
router.get('/:id', authenticateLfdToken, requireLfdPermission('sale.read'), async (req, res) => {
  try {
    const sale = await getSql(`SELECT * FROM LFD_Sales WHERE id = ?`, [req.params.id]);
    if (!sale) return res.status(404).json({ error: 'Vente introuvable' });
    const items = await allSql(`SELECT si.*, p.name as product_name FROM LFD_SaleItems si JOIN LFD_Products p ON si.product_id = p.id WHERE si.sale_id = ?`, [sale.id]);
    res.json({ ...sale, items });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
