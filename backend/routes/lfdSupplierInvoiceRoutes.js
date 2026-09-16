const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { getSql, allSql, runSql } = require('../lfdDb');
const { authenticateLfdToken, requireLfdPermission } = require('../middlewares/lfdAuth');
const { runTransaction } = require('../utils/lfdTransaction');
const { logLfdAudit } = require('../middlewares/lfdAuth');
const lfdAccountingService = require('../services/lfdAccountingService');

// 1. Lister les factures fournisseurs
router.get('/', authenticateLfdToken, requireLfdPermission('supplier_invoice.read'), async (req, res) => {
  try {
    const invoices = await allSql(`
      SELECT i.*, s.name as supplier_name, po.po_number 
      FROM LFD_SupplierInvoices i
      JOIN LFD_Suppliers s ON i.supplier_id = s.id
      LEFT JOIN LFD_PurchaseOrders po ON i.purchase_order_id = po.id
      ORDER BY i.createdAt DESC
    `);
    res.json(invoices);
  } catch (error) {
    console.error('[LFD SUPPLIER INVOICES] Erreur GET /:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// 2. Créer une facture fournisseur (DRAFT)
router.post('/', authenticateLfdToken, requireLfdPermission('supplier_invoice.create'), async (req, res) => {
  const { supplier_id, supplier_reference, purchase_order_id, invoice_date, due_date, subtotal, discount } = req.body;
  if (!supplier_id || subtotal === undefined) {
    return res.status(400).json({ error: 'Fournisseur et sous-total requis.' });
  }

  try {
    // Vérifier les doublons de référence pour le même fournisseur
    if (supplier_reference) {
      const existing = await getSql(`SELECT id FROM LFD_SupplierInvoices WHERE supplier_id = ? AND supplier_reference = ?`, [supplier_id, supplier_reference]);
      if (existing) {
        return res.status(400).json({ error: 'Une facture avec cette référence fournisseur existe déjà pour ce fournisseur.' });
      }
    }

    const orderDiscount = discount || 0;
    const total = subtotal - orderDiscount;
    const invoiceNum = `FF-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const result = await runSql(`
      INSERT INTO LFD_SupplierInvoices (supplier_invoice_number, supplier_reference, supplier_id, purchase_order_id, invoice_date, due_date, subtotal, discount, total, remaining_amount, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?)
    `, [invoiceNum, supplier_reference || null, supplier_id, purchase_order_id || null, invoice_date || null, due_date || null, subtotal, orderDiscount, total, total, req.user.id]);

    const newInvoice = await getSql(`SELECT * FROM LFD_SupplierInvoices WHERE id = ?`, [result.lastID]);
    await logLfdAudit(req.user.id, 'CREATE', 'LFD_SupplierInvoices', result.lastID, null, { supplier_invoice_number: invoiceNum, total }, 'Création Facture Fournisseur', req.ip);
    
    res.status(201).json(newInvoice);

  } catch (error) {
    console.error('[LFD SUPPLIER INVOICES] Erreur POST /:', error);
    if (error.message.includes('UNIQUE constraint failed: LFD_SupplierInvoices.supplier_id, LFD_SupplierInvoices.supplier_reference')) {
       return res.status(400).json({ error: 'Cette référence facture existe déjà pour ce fournisseur.' });
    }
    res.status(500).json({ error: 'Erreur lors de la création de la facture.' });
  }
});

// 3. Valider une facture fournisseur (Génère la dette LFD_Payables)
router.post('/:id/validate', authenticateLfdToken, requireLfdPermission('supplier_invoice.validate'), async (req, res) => {
  try {
    const invoice = await getSql(`SELECT * FROM LFD_SupplierInvoices WHERE id = ?`, [req.params.id]);
    if (!invoice) return res.status(404).json({ error: 'Facture introuvable.' });
    if (invoice.status !== 'DRAFT') return res.status(400).json({ error: 'Seule une facture DRAFT peut être validée.' });

    await runTransaction(async () => {
      // Mettre à jour la facture
      await runSql(`
        UPDATE LFD_SupplierInvoices 
        SET status = 'VALIDATED', validated_by = ?, validated_at = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [req.user.id, invoice.id]);

      // Créer la dette (Payable)
      await runSql(`
        INSERT INTO LFD_Payables (supplier_id, supplier_invoice_id, original_amount, remaining_amount, due_date)
        VALUES (?, ?, ?, ?, ?)
      `, [invoice.supplier_id, invoice.id, invoice.total, invoice.total, invoice.due_date]);

      await logLfdAudit(req.user.id, 'VALIDATE', 'LFD_SupplierInvoices', invoice.id, { status: 'DRAFT' }, { status: 'VALIDATED' }, 'Validation Facture et Création Dette', req.ip);

      // --- PHASE 5B: INTEGRATION COMPTABLE AUTOMATIQUE ---
      await lfdAccountingService.postAccountingEvent(
        'SUPPLIER_INVOICE',
        'SUPPLIER_INVOICE',
        invoice.id,
        invoice.total,
        { supplier_id: invoice.supplier_id },
        req.user.id,
        req.ip
      );
    });

    res.json({ success: true, message: 'Facture validée avec succès. Dette fournisseur générée.' });

  } catch (error) {
    console.error('[LFD SUPPLIER INVOICES] Erreur POST /:id/validate:', error);
    res.status(500).json({ error: 'Erreur lors de la validation.' });
  }
});

module.exports = router;
