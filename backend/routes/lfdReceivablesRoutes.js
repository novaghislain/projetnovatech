const express = require('express');
const router = express.Router();
const { getSql, runSql, allSql, db } = require('../lfdDb');
const { authenticateLfdToken, requireLfdPermission, logLfdAudit } = require('../middlewares/lfdAuth');
const lfdAccountingService = require('../services/lfdAccountingService');
const crypto = require('crypto');

// 1. Lister les créances
router.get('/', authenticateLfdToken, requireLfdPermission('credit.read'), async (req, res) => {
  try {
    const receivables = await allSql(`
      SELECT r.*, c.name as customer_name, s.sale_number 
      FROM LFD_Receivables r
      JOIN LFD_Customers c ON r.customer_id = c.id
      JOIN LFD_Sales s ON r.sale_id = s.id
      ORDER BY r.status ASC, r.id DESC
    `);
    res.json(receivables);
  } catch (error) {
    console.error('[LFD RECEIVABLES] Erreur GET /:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// 2. Enregistrer un paiement sur une créance
router.post('/:id/pay', authenticateLfdToken, requireLfdPermission('credit.payment'), async (req, res) => {
  const { amount, cash_session_id } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Montant invalide.' });
  if (!cash_session_id) return res.status(400).json({ error: 'Session de caisse requise pour encaisser.' });

  try {
    const rec = await getSql(`SELECT * FROM LFD_Receivables WHERE id = ?`, [req.params.id]);
    if (!rec) return res.status(404).json({ error: 'Créance introuvable.' });
    if (rec.status === 'PAID' || rec.status === 'CANCELLED') return res.status(400).json({ error: 'Créance déjà soldée ou annulée.' });
    if (amount > rec.remaining_amount) return res.status(400).json({ error: 'Le montant dépasse le reste à payer.' });

    const session = await getSql(`SELECT id, status FROM LFD_CashSessions WHERE id = ? AND cashier_id = ?`, [cash_session_id, req.user.id]);
    if (!session || session.status !== 'OPEN') return res.status(400).json({ error: 'Session de caisse invalide ou fermée.' });

    // Transaction
    db.serialize(async () => {
      try {
        await runSql('BEGIN TRANSACTION');

        const newPaid = rec.paid_amount + amount;
        const newRemaining = rec.remaining_amount - amount;
        const newStatus = newRemaining === 0 ? 'PAID' : 'PARTIALLY_PAID';

        await runSql(`
          UPDATE LFD_Receivables 
          SET paid_amount = ?, remaining_amount = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [newPaid, newRemaining, newStatus, rec.id]);

        const payNum = `PAY-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        
        await runSql(`
          INSERT INTO LFD_Payments (payment_number, sale_id, customer_id, amount, payment_method, cash_session_id, received_by)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [payNum, rec.sale_id, rec.customer_id, amount, 'CASH', session.id, req.user.id]);

        await runSql(`
          INSERT INTO LFD_CashTransactions (cash_session_id, type, amount, source_type, source_id, description, created_by)
          VALUES (?, 'CUSTOMER_PAYMENT', ?, 'RECEIVABLE', ?, ?, ?)
        `, [session.id, amount, rec.id, 'Paiement créance ' + rec.id, req.user.id]);

        await runSql(`UPDATE LFD_CashSessions SET theoretical_balance = theoretical_balance + ? WHERE id = ?`, [amount, session.id]);

        await logLfdAudit(req.user.id, 'PAY', 'LFD_Receivables', rec.id, rec, { remaining_amount: newRemaining, status: newStatus }, 'Paiement de ' + amount, req.ip);

        // Si la créance est totally paid, mettre à jour le statut de la vente aussi
        if (newStatus === 'PAID') {
          await runSql(`UPDATE LFD_Sales SET status = 'PAID', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, [rec.sale_id]);
        } else {
          await runSql(`UPDATE LFD_Sales SET status = 'PARTIALLY_PAID', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, [rec.sale_id]);
        }

        // --- PHASE 5B: INTEGRATION COMPTABLE AUTOMATIQUE ---
        const paymentRes = await getSql(`SELECT id FROM LFD_Payments WHERE payment_number = ?`, [payNum]);
        if (paymentRes) {
          await lfdAccountingService.postAccountingEvent(
            'CUSTOMER_PAYMENT',
            'PAYMENT',
            paymentRes.id,
            amount,
            { customer_id: rec.customer_id },
            req.user.id,
            req.ip
          );
        }

        await runSql('COMMIT');
        res.json({ success: true, message: 'Paiement enregistré.', newRemaining, status: newStatus });
      } catch (err) {
        await runSql('ROLLBACK');
        console.error('[LFD RECEIVABLES] Erreur Transaction:', err);
        res.status(500).json({ error: "Erreur lors de l'enregistrement du paiement." });
      }
    });
  } catch (error) {
    console.error('[LFD RECEIVABLES] Erreur POST /pay:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
