const express = require('express');
const router = express.Router();
const { getSql, runSql, allSql, db } = require('../lfdDb');
const { authenticateLfdToken, requireLfdPermission, logLfdAudit } = require('../middlewares/lfdAuth');
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

// ============================================
// 1. PRÉPARATIONS (WAREHOUSE_AGENT)
// ============================================

// Récupérer les ordres de préparation
router.get('/preparations', authenticateLfdToken, requireLfdPermission('preparation.read'), async (req, res) => {
  try {
    const statusFilter = req.query.status || 'TO_PREPARE';
    const preps = await allSql(`
      SELECT p.*, s.sale_number, c.name as customer_name
      FROM LFD_PreparationOrders p
      JOIN LFD_Sales s ON p.sale_id = s.id
      JOIN LFD_Customers c ON s.customer_id = c.id
      WHERE p.status = ?
      ORDER BY p.id ASC
    `, [statusFilter]);
    res.json(preps);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des préparations.' });
  }
});

// Détail d'une préparation (lignes)
router.get('/preparations/:id', authenticateLfdToken, requireLfdPermission('preparation.read'), async (req, res) => {
  try {
    const prep = await getSql(`SELECT * FROM LFD_PreparationOrders WHERE id = ?`, [req.params.id]);
    if (!prep) return res.status(404).json({ error: 'Préparation introuvable.' });

    const items = await allSql(`
      SELECT pi.*, si.unit_price, p.name as product_name, p.product_code 
      FROM LFD_PreparationItems pi
      JOIN LFD_SaleItems si ON pi.sale_item_id = si.id
      JOIN LFD_Products p ON si.product_id = p.id
      WHERE pi.preparation_order_id = ?
    `, [prep.id]);

    res.json({ ...prep, items });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des détails.' });
  }
});

// Démarrer une préparation
router.post('/preparations/:id/start', authenticateLfdToken, requireLfdPermission('preparation.start'), async (req, res) => {
  try {
    const prep = await getSql(`SELECT * FROM LFD_PreparationOrders WHERE id = ?`, [req.params.id]);
    if (!prep) return res.status(404).json({ error: 'Ordre introuvable.' });
    if (prep.status !== 'TO_PREPARE') return res.status(400).json({ error: 'Statut invalide pour démarrer.' });

    await runSql(`UPDATE LFD_PreparationOrders SET status = 'IN_PROGRESS', assigned_to = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, [req.user.id, prep.id]);
    res.json({ success: true, message: 'Préparation démarrée.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Terminer une préparation
router.post('/preparations/:id/complete', authenticateLfdToken, requireLfdPermission('preparation.complete'), async (req, res) => {
  const { prepared_items } = req.body; // array of { id: preparation_item_id, quantity_prepared }
  
  try {
    await runTransaction(async () => {
      const prep = await getSql(`SELECT * FROM LFD_PreparationOrders WHERE id = ?`, [req.params.id]);
      if (!prep) throw new Error('Ordre introuvable.');
      if (prep.status !== 'IN_PROGRESS') throw new Error('La préparation doit être en cours.');
      if (prep.assigned_to !== req.user.id) throw new Error('Vous n\'êtes pas assigné à cette préparation.');

      let hasDifference = false;

      for (let reqItem of prepared_items) {
        const pItem = await getSql(`SELECT * FROM LFD_PreparationItems WHERE id = ? AND preparation_order_id = ?`, [reqItem.id, prep.id]);
        if (!pItem) throw new Error(`Ligne de préparation introuvable.`);
        if (reqItem.quantity_prepared > pItem.quantity_to_prepare) throw new Error(`Quantité préparée supérieure à la commande (Item ID ${reqItem.id}).`);

        if (reqItem.quantity_prepared !== pItem.quantity_to_prepare) hasDifference = true;

        await runSql(`UPDATE LFD_PreparationItems SET quantity_prepared = ? WHERE id = ?`, [reqItem.quantity_prepared, reqItem.id]);
      }

      await runSql(`UPDATE LFD_PreparationOrders SET status = 'PREPARED', prepared_by = ?, prepared_at = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, [req.user.id, prep.id]);
      
      if (hasDifference) {
        // Alerte écart
        await runSql(`
          INSERT INTO LFD_Alerts (type, severity, entity_type, entity_id, message)
          VALUES ('PREPARATION_DISCREPANCY', 'WARNING', 'PREPARATION_ORDER', ?, 'Écart constaté entre quantité commandée et préparée.')
        `, [prep.id]);
      }
      await logLfdAudit(req.user.id, 'COMPLETE', 'LFD_PreparationOrders', prep.id, null, null, 'Préparation terminée', req.ip);
    });
    res.json({ success: true, message: 'Préparation validée.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// ============================================
// 2. BONS DE SORTIE (CONTRÔLE & SORTIE PHYSIQUE)
// ============================================

// Lister les bons de sortie en attente
router.get('/stock-releases', authenticateLfdToken, requireLfdPermission('stock_release.read'), async (req, res) => {
  try {
    // Les préparations en statut 'PREPARED' sont en attente de double contrôle et de création de bon de sortie
    const preps = await allSql(`
      SELECT p.*, s.sale_number 
      FROM LFD_PreparationOrders p 
      JOIN LFD_Sales s ON p.sale_id = s.id 
      WHERE p.status = 'PREPARED'
    `);
    res.json(preps);
  } catch (error) {
    res.status(500).json({ error: 'Erreur.' });
  }
});

// Valider la sortie physique (Double Contrôle)
router.post('/preparations/:id/release', authenticateLfdToken, requireLfdPermission('stock_release.validate'), async (req, res) => {
  try {
    await runTransaction(async () => {
      const prep = await getSql(`SELECT * FROM LFD_PreparationOrders WHERE id = ?`, [req.params.id]);
      if (!prep) throw new Error('Ordre introuvable.');
      if (prep.status !== 'PREPARED') throw new Error('La préparation n\'est pas terminée.');
      if (prep.prepared_by === req.user.id) throw new Error('DOUBLE CONTRÔLE REQUIS: Vous ne pouvez pas contrôler votre propre préparation.');

      const releaseNumber = `BS-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      
      // Mettre à jour l'ordre de préparation
      await runSql(`UPDATE LFD_PreparationOrders SET status = 'RELEASED', checked_by = ?, checked_at = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, [req.user.id, prep.id]);

      // Créer le bon de sortie
      await runSql(`
        INSERT INTO LFD_StockReleases (release_number, sale_id, preparation_order_id, warehouse_id, prepared_by, checked_by, released_by, status, released_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'RELEASED', CURRENT_TIMESTAMP)
      `, [releaseNumber, prep.sale_id, prep.id, prep.warehouse_id, prep.prepared_by, req.user.id, req.user.id]);

      const stockRelease = await getSql(`SELECT id FROM LFD_StockReleases WHERE release_number = ?`, [releaseNumber]);

      // Créer les mouvements de stock réels et annuler la réservation
      const items = await allSql(`SELECT * FROM LFD_PreparationItems WHERE preparation_order_id = ?`, [prep.id]);
      const sale = await getSql(`SELECT sale_number FROM LFD_Sales WHERE id = ?`, [prep.sale_id]);

      for (let item of items) {
        if (item.quantity_prepared > 0) {
          const si = await getSql(`SELECT product_id FROM LFD_SaleItems WHERE id = ?`, [item.sale_item_id]);
          
          // 1. Décrémenter la réservation (UNRESERVE)
          await runSql(`
            INSERT INTO LFD_StockMovements (reference, product_id, warehouse_id, movement_type, quantity, source_type, source_id, reason, created_by)
            VALUES (?, ?, ?, 'UNRESERVE', ?, 'STOCK_RELEASE', ?, ?, ?)
          `, [`MVT-UNRES-${releaseNumber}-${si.product_id}`, si.product_id, prep.warehouse_id, item.quantity_to_prepare, stockRelease.id, 'Résolution Réservation ' + sale.sale_number, req.user.id]);

          // 2. Sortie physique (EXIT) (On sort la quantité *réellement* préparée)
          await runSql(`
            INSERT INTO LFD_StockMovements (reference, product_id, warehouse_id, movement_type, quantity, source_type, source_id, reason, created_by)
            VALUES (?, ?, ?, 'EXIT', ?, 'STOCK_RELEASE', ?, ?, ?)
          `, [`MVT-EXIT-${releaseNumber}-${si.product_id}`, si.product_id, prep.warehouse_id, item.quantity_prepared, stockRelease.id, 'Sortie Physique ' + releaseNumber, req.user.id]);
        }
      }

      // Générer le Bon de Livraison
      const deliveryNumber = `BL-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      await runSql(`
        INSERT INTO LFD_Deliveries (delivery_number, sale_id, stock_release_id, status, created_by)
        VALUES (?, ?, ?, 'READY', ?)
      `, [deliveryNumber, prep.sale_id, stockRelease.id, req.user.id]);

      await logLfdAudit(req.user.id, 'RELEASE', 'LFD_StockReleases', stockRelease.id, null, null, 'Sortie de Stock validée', req.ip);
    });

    res.json({ success: true, message: 'Sortie de stock confirmée et bon de livraison généré.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// ============================================
// 3. LIVRAISONS (DELIVERY_AGENT)
// ============================================

router.get('/deliveries', authenticateLfdToken, requireLfdPermission('delivery.read'), async (req, res) => {
  try {
    const delivs = await allSql(`
      SELECT d.*, s.sale_number, c.name as customer_name 
      FROM LFD_Deliveries d
      JOIN LFD_Sales s ON d.sale_id = s.id
      JOIN LFD_Customers c ON s.customer_id = c.id
      ORDER BY d.id DESC
    `);
    res.json(delivs);
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

router.post('/deliveries/:id/start', authenticateLfdToken, requireLfdPermission('delivery.start'), async (req, res) => {
  try {
    await runSql(`UPDATE LFD_Deliveries SET status = 'IN_DELIVERY', delivery_agent_id = ?, departure_at = CURRENT_TIMESTAMP WHERE id = ?`, [req.user.id, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/deliveries/:id/complete', authenticateLfdToken, requireLfdPermission('delivery.complete'), async (req, res) => {
  const { recipient_name, recipient_phone } = req.body;
  try {
    await runTransaction(async () => {
      await runSql(`
        UPDATE LFD_Deliveries 
        SET status = 'DELIVERED', recipient_name = ?, recipient_phone = ?, delivered_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [recipient_name, recipient_phone, req.params.id]);
      
      const deliv = await getSql(`SELECT sale_id FROM LFD_Deliveries WHERE id = ?`, [req.params.id]);
      // Si la vente était partielle on pourrait gérer d'autres trucs ici.
    });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/deliveries/:id/fail', authenticateLfdToken, requireLfdPermission('delivery.fail'), async (req, res) => {
  const { failed_reason } = req.body;
  try {
    await runTransaction(async () => {
      await runSql(`
        UPDATE LFD_Deliveries 
        SET status = 'FAILED', failed_reason = ? 
        WHERE id = ?
      `, [failed_reason, req.params.id]);

      // Alerte critique
      await runSql(`
        INSERT INTO LFD_Alerts (type, severity, entity_type, entity_id, message)
        VALUES ('DELIVERY_FAILED', 'CRITICAL', 'DELIVERY', ?, ?)
      `, [req.params.id, 'Échec de livraison : ' + failed_reason]);
    });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
