const express = require('express');
const router = express.Router();
const { getSql, allSql, runSql } = require('../lfdDb');
const { authenticateLfdToken, requireLfdPermission } = require('../middlewares/lfdAuth');
const { logLfdAudit } = require('../middlewares/lfdAuth');

// 1. Lister les fournisseurs
router.get('/', authenticateLfdToken, requireLfdPermission('supplier.read'), async (req, res) => {
  try {
    const suppliers = await allSql(`SELECT * FROM LFD_Suppliers ORDER BY name ASC`);
    res.json(suppliers);
  } catch (error) {
    console.error('[LFD SUPPLIERS] Erreur GET /:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// 2. Créer un fournisseur
router.post('/', authenticateLfdToken, requireLfdPermission('supplier.create'), async (req, res) => {
  const { supplier_code, name, contact_name, phone, email, address, tax_identifier, payment_terms_days, credit_limit } = req.body;
  if (!supplier_code || !name) return res.status(400).json({ error: 'Code et nom du fournisseur requis.' });

  try {
    const existing = await getSql(`SELECT id FROM LFD_Suppliers WHERE supplier_code = ?`, [supplier_code]);
    if (existing) return res.status(400).json({ error: 'Ce code fournisseur existe déjà.' });

    const result = await runSql(`
      INSERT INTO LFD_Suppliers (supplier_code, name, contact_name, phone, email, address, tax_identifier, payment_terms_days, credit_limit, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [supplier_code, name, contact_name, phone, email, address, tax_identifier, payment_terms_days || 0, credit_limit || 0, req.user.id]);
    
    const newSupplier = await getSql(`SELECT * FROM LFD_Suppliers WHERE id = ?`, [result.lastID]);
    
    await logLfdAudit(req.user.id, 'CREATE', 'LFD_Suppliers', result.lastID, null, newSupplier, 'Création Fournisseur', req.ip);
    
    res.status(201).json(newSupplier);
  } catch (error) {
    console.error('[LFD SUPPLIERS] Erreur POST /:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// 3. Modifier un fournisseur
router.put('/:id', authenticateLfdToken, requireLfdPermission('supplier.update'), async (req, res) => {
  const { name, contact_name, phone, email, address, tax_identifier, payment_terms_days, credit_limit, status } = req.body;
  
  try {
    const oldSupplier = await getSql(`SELECT * FROM LFD_Suppliers WHERE id = ?`, [req.params.id]);
    if (!oldSupplier) return res.status(404).json({ error: 'Fournisseur introuvable.' });

    await runSql(`
      UPDATE LFD_Suppliers 
      SET name = ?, contact_name = ?, phone = ?, email = ?, address = ?, tax_identifier = ?, payment_terms_days = ?, credit_limit = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name || oldSupplier.name, 
      contact_name !== undefined ? contact_name : oldSupplier.contact_name, 
      phone !== undefined ? phone : oldSupplier.phone, 
      email !== undefined ? email : oldSupplier.email, 
      address !== undefined ? address : oldSupplier.address, 
      tax_identifier !== undefined ? tax_identifier : oldSupplier.tax_identifier, 
      payment_terms_days !== undefined ? payment_terms_days : oldSupplier.payment_terms_days, 
      credit_limit !== undefined ? credit_limit : oldSupplier.credit_limit, 
      status || oldSupplier.status, 
      req.params.id
    ]);
    
    const newSupplier = await getSql(`SELECT * FROM LFD_Suppliers WHERE id = ?`, [req.params.id]);
    
    await logLfdAudit(req.user.id, 'UPDATE', 'LFD_Suppliers', req.params.id, oldSupplier, newSupplier, 'Mise à jour Fournisseur', req.ip);
    
    res.json(newSupplier);
  } catch (error) {
    console.error('[LFD SUPPLIERS] Erreur PUT /:id:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// 4. Statistiques d'un fournisseur
router.get('/:id/stats', authenticateLfdToken, requireLfdPermission('supplier.read'), async (req, res) => {
  try {
    const supplier = await getSql(`SELECT id FROM LFD_Suppliers WHERE id = ?`, [req.params.id]);
    if (!supplier) return res.status(404).json({ error: 'Fournisseur introuvable.' });

    const stats = await getSql(`
      SELECT 
        COUNT(id) as total_orders,
        SUM(total) as total_purchases
      FROM LFD_PurchaseOrders 
      WHERE supplier_id = ? AND status != 'CANCELLED'
    `, [req.params.id]);

    const debt = await getSql(`
      SELECT SUM(remaining_amount) as current_debt
      FROM LFD_Payables
      WHERE supplier_id = ? AND status != 'PAID' AND status != 'CANCELLED'
    `, [req.params.id]);
    
    const overdue = await getSql(`
      SELECT SUM(remaining_amount) as overdue_debt
      FROM LFD_Payables
      WHERE supplier_id = ? AND status != 'PAID' AND status != 'CANCELLED' AND due_date < CURRENT_TIMESTAMP
    `, [req.params.id]);

    res.json({
      total_orders: stats.total_orders || 0,
      total_purchases: stats.total_purchases || 0,
      current_debt: debt.current_debt || 0,
      overdue_debt: overdue.overdue_debt || 0
    });
  } catch (error) {
    console.error('[LFD SUPPLIERS] Erreur GET /:id/stats:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
