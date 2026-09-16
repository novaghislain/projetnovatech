const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { getSql, allSql, runSql } = require('../lfdDb');
const { authenticateLfdToken, requireLfdPermission } = require('../middlewares/lfdAuth');
const { runTransaction } = require('../utils/lfdTransaction');
const { logLfdAudit } = require('../middlewares/lfdAuth');

// 1. Lister les commandes d'achat
router.get('/', authenticateLfdToken, requireLfdPermission('purchase.read'), async (req, res) => {
  try {
    const orders = await allSql(`
      SELECT po.*, s.name as supplier_name, e.firstName, e.lastName
      FROM LFD_PurchaseOrders po
      JOIN LFD_Suppliers s ON po.supplier_id = s.id
      LEFT JOIN LFD_Employees e ON po.created_by = e.id
      ORDER BY po.createdAt DESC
    `);
    res.json(orders);
  } catch (error) {
    console.error('[LFD PURCHASE] Erreur GET /:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// 2. Créer une commande d'achat (DRAFT)
router.post('/', authenticateLfdToken, requireLfdPermission('purchase.create'), async (req, res) => {
  const { supplier_id, expected_date, items, discount } = req.body;
  if (!supplier_id || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Fournisseur et articles requis.' });
  }

  try {
    const supplier = await getSql(`SELECT id FROM LFD_Suppliers WHERE id = ?`, [supplier_id]);
    if (!supplier) return res.status(404).json({ error: 'Fournisseur introuvable.' });

    let subtotal = 0;
    for (let item of items) {
      if (!item.product_id || !item.quantity || !item.unit_cost) {
        return res.status(400).json({ error: 'Chaque article doit avoir un produit, une quantité et un coût unitaire.' });
      }
      subtotal += (item.quantity * item.unit_cost) - (item.discount || 0);
    }
    const orderDiscount = discount || 0;
    const total = subtotal - orderDiscount;

    const poNumber = `ACH-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    await runTransaction(async () => {
      await runSql(`
        INSERT INTO LFD_PurchaseOrders (po_number, supplier_id, expected_date, subtotal, discount, total, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?, 'DRAFT', ?)
      `, [poNumber, supplier_id, expected_date || null, subtotal, orderDiscount, total, req.user.id]);

      const order = await getSql(`SELECT id FROM LFD_PurchaseOrders WHERE po_number = ?`, [poNumber]);

      for (let item of items) {
        const itemDiscount = item.discount || 0;
        const lineTotal = (item.quantity * item.unit_cost) - itemDiscount;
        await runSql(`
          INSERT INTO LFD_PurchaseOrderItems (purchase_order_id, product_id, quantity, unit_cost, discount, line_total)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [order.id, item.product_id, item.quantity, item.unit_cost, itemDiscount, lineTotal]);
      }

      await logLfdAudit(req.user.id, 'CREATE', 'LFD_PurchaseOrders', order.id, null, { po_number: poNumber, total }, 'Création Commande Achat', req.ip);
    });

    const newOrder = await getSql(`SELECT * FROM LFD_PurchaseOrders WHERE po_number = ?`, [poNumber]);
    res.status(201).json(newOrder);

  } catch (error) {
    console.error('[LFD PURCHASE] Erreur POST /:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la commande.' });
  }
});

// 3. Approuver une commande (DRAFT -> APPROVED)
router.post('/:id/approve', authenticateLfdToken, requireLfdPermission('purchase.approve'), async (req, res) => {
  try {
    const order = await getSql(`SELECT * FROM LFD_PurchaseOrders WHERE id = ?`, [req.params.id]);
    if (!order) return res.status(404).json({ error: 'Commande introuvable.' });
    if (order.status !== 'DRAFT') return res.status(400).json({ error: 'Seule une commande DRAFT peut être approuvée.' });

    await runSql(`
      UPDATE LFD_PurchaseOrders 
      SET status = 'APPROVED', approved_by = ?, approved_at = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [req.user.id, order.id]);

    await logLfdAudit(req.user.id, 'APPROVE', 'LFD_PurchaseOrders', order.id, { status: 'DRAFT' }, { status: 'APPROVED' }, 'Approbation Commande Achat', req.ip);

    res.json({ success: true, message: 'Commande approuvée.' });
  } catch (error) {
    console.error('[LFD PURCHASE] Erreur POST /:id/approve:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// 4. Détails d'une commande
router.get('/:id', authenticateLfdToken, requireLfdPermission('purchase.read'), async (req, res) => {
  try {
    const order = await getSql(`
      SELECT po.*, s.name as supplier_name, s.supplier_code 
      FROM LFD_PurchaseOrders po 
      JOIN LFD_Suppliers s ON po.supplier_id = s.id 
      WHERE po.id = ?
    `, [req.params.id]);
    
    if (!order) return res.status(404).json({ error: 'Commande introuvable.' });

    const items = await allSql(`
      SELECT i.*, p.name as product_name, p.product_code 
      FROM LFD_PurchaseOrderItems i 
      JOIN LFD_Products p ON i.product_id = p.id 
      WHERE i.purchase_order_id = ?
    `, [req.params.id]);

    order.items = items;
    res.json(order);
  } catch (error) {
    console.error('[LFD PURCHASE] Erreur GET /:id:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
