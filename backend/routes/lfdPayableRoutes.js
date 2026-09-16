const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { getSql, allSql, runSql } = require('../lfdDb');
const { authenticateLfdToken, requireLfdPermission } = require('../middlewares/lfdAuth');
const { runTransaction } = require('../utils/lfdTransaction');
const { logLfdAudit } = require('../middlewares/lfdAuth');
const lfdAccountingService = require('../services/lfdAccountingService');

// 1. Lister les dettes fournisseurs (Payables)
router.get('/', authenticateLfdToken, requireLfdPermission('payable.read'), async (req, res) => {
  try {
    const payables = await allSql(`
      SELECT p.*, s.name as supplier_name, i.supplier_invoice_number, i.supplier_reference 
      FROM LFD_Payables p
      JOIN LFD_Suppliers s ON p.supplier_id = s.id
      JOIN LFD_SupplierInvoices i ON p.supplier_invoice_id = i.id
      ORDER BY p.createdAt DESC
    `);
    res.json(payables);
  } catch (error) {
    console.error('[LFD PAYABLES] Erreur GET /:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// 2. Enregistrer un paiement sur une dette fournisseur
router.post('/:id/pay', authenticateLfdToken, requireLfdPermission('supplier_payment.create'), async (req, res) => {
  const { amount, payment_method, cash_session_id, reference } = req.body;
  
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Montant invalide.' });
  if (payment_method === 'CASH' && !cash_session_id) {
    return res.status(400).json({ error: 'Session de caisse requise pour un paiement en espèces.' });
  }

  try {
    await runTransaction(async () => {
      const payable = await getSql(`SELECT * FROM LFD_Payables WHERE id = ?`, [req.params.id]);
      if (!payable) throw new Error('Dette fournisseur introuvable.');
      if (payable.status === 'PAID' || payable.status === 'CANCELLED') {
        throw new Error('Dette déjà soldée ou annulée.');
      }
      if (amount > payable.remaining_amount) {
        throw new Error('Surpaiement interdit. Le montant dépasse le reste à payer.');
      }

      let session = null;
      if (payment_method === 'CASH') {
        session = await getSql(`SELECT id, status FROM LFD_CashSessions WHERE id = ? AND cashier_id = ?`, [cash_session_id, req.user.id]);
        if (!session || session.status !== 'OPEN') {
          throw new Error('Session de caisse invalide ou fermée.');
        }
      }

      const newPaid = payable.paid_amount + amount;
      const newRemaining = payable.remaining_amount - amount;
      const newStatus = newRemaining === 0 ? 'PAID' : 'PARTIALLY_PAID';

      // 1. Mettre à jour la dette
      await runSql(`
        UPDATE LFD_Payables 
        SET paid_amount = ?, remaining_amount = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [newPaid, newRemaining, newStatus, payable.id]);

      // 2. Mettre à jour la facture fournisseur
      await runSql(`
        UPDATE LFD_SupplierInvoices
        SET paid_amount = ?, remaining_amount = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [newPaid, newRemaining, newStatus, payable.supplier_invoice_id]);

      // 3. Créer l'enregistrement de paiement fournisseur
      const payNum = `PAY-F-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      await runSql(`
        INSERT INTO LFD_SupplierPayments (payment_number, supplier_id, supplier_invoice_id, payable_id, amount, payment_method, cash_session_id, reference, paid_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [payNum, payable.supplier_id, payable.supplier_invoice_id, payable.id, amount, payment_method, session ? session.id : null, reference || null, req.user.id]);

      // 4. Sortie de caisse si CASH
      if (payment_method === 'CASH') {
        await runSql(`
          INSERT INTO LFD_CashTransactions (cash_session_id, type, amount, source_type, source_id, description, created_by)
          VALUES (?, 'SUPPLIER_PAYMENT', ?, 'PAYABLE', ?, ?, ?)
        `, [session.id, amount, payable.id, 'Paiement fournisseur Dette ' + payable.id, req.user.id]);

        await runSql(`UPDATE LFD_CashSessions SET theoretical_balance = theoretical_balance - ? WHERE id = ?`, [amount, session.id]);
      }

      // 5. Audit
      await logLfdAudit(req.user.id, 'PAY', 'LFD_Payables', payable.id, { remaining_amount: payable.remaining_amount }, { remaining_amount: newRemaining, status: newStatus }, 'Paiement Fournisseur de ' + amount, req.ip);

      // --- PHASE 5B: INTEGRATION COMPTABLE AUTOMATIQUE ---
      const paymentRes = await getSql(`SELECT id FROM LFD_SupplierPayments WHERE payment_number = ?`, [payNum]);
      if (paymentRes) {
        await lfdAccountingService.postAccountingEvent(
          'SUPPLIER_PAYMENT',
          'SUPPLIER_PAYMENT',
          paymentRes.id,
          amount,
          { supplier_id: payable.supplier_id },
          req.user.id,
          req.ip
        );
      }
    });

    res.json({ success: true, message: 'Paiement enregistré avec succès.' });

  } catch (error) {
    console.error('[LFD PAYABLES] Erreur POST /:id/pay:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
