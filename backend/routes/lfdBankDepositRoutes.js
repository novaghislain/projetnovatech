const express = require('express');
const router = express.Router();
const { runSql, getSql, allSql } = require('../lfdDb');
const { authenticateLfdToken, requireLfdPermission } = require('../middlewares/lfdAuth');
const lfdAccountingService = require('../services/lfdAccountingService');

// 1. Déclarer un dépôt bancaire
router.post('/', authenticateLfdToken, requireLfdPermission('bank.deposit.declare'), async (req, res) => {
  try {
    const { bank_name, deposit_date, amount, cash_session_id, slip_reference, observation } = req.body;
    
    if (!bank_name || !deposit_date || !amount) {
      return res.status(400).json({ error: "bank_name, deposit_date et amount sont requis." });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: "Le montant doit être strictement positif." });
    }

    const reference = `DEP-${Date.now()}`;
    
    // Insérer le dépôt
    const insertRes = await runSql(`
      INSERT INTO LFD_BankDeposits (
        reference, bank_name, deposit_date, amount, cash_session_id, slip_reference, observation, declared_by, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
    `, [reference, bank_name, deposit_date, amount, cash_session_id || null, slip_reference || null, observation || null, req.user.id]);
    
    const depositId = insertRes.lastID;

    // Si le dépôt est rattaché à une session de caisse, on enregistre la sortie d'argent
    if (cash_session_id) {
      await runSql(`
        INSERT INTO LFD_CashTransactions (cash_session_id, type, amount, source_type, source_id, description, created_by)
        VALUES (?, 'OUT', ?, 'BANK_DEPOSIT', ?, ?, ?)
      `, [cash_session_id, amount, depositId, `Dépôt bancaire (Réf: ${reference})`, req.user.id]);
    }
    
    // Audit log
    await runSql(`
      INSERT INTO LFD_AuditLogs (employee_id, action, entity_type, entity_id, new_value, reason)
      VALUES (?, 'DECLARE', 'BANK_DEPOSIT', ?, ?, 'Déclaration dépôt bancaire')
    `, [req.user.id, depositId, JSON.stringify({ amount, bank_name })]);

    res.status(201).json({ id: depositId, reference, message: "Dépôt déclaré avec succès." });

  } catch (error) {
    console.error('[BANK DEPOSIT] Erreur lors de la déclaration:', error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// 2. Récupérer la liste des dépôts
router.get('/', authenticateLfdToken, requireLfdPermission('bank.deposit.read'), async (req, res) => {
  try {
    const rows = await allSql(`
      SELECT d.*, 
             u1.firstName || ' ' || u1.lastName as declared_by_name,
             u2.firstName || ' ' || u2.lastName as confirmed_by_name
      FROM LFD_BankDeposits d
      LEFT JOIN LFD_Employees u1 ON d.declared_by = u1.id
      LEFT JOIN LFD_Employees u2 ON d.confirmed_by = u2.id
      ORDER BY d.createdAt DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('[BANK DEPOSIT] Erreur lors de la récupération:', error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// 3. Valider / Confirmer un dépôt
router.post('/:id/confirm', authenticateLfdToken, requireLfdPermission('bank.deposit.verify'), async (req, res) => {
  try {
    const depositId = req.params.id;
    const deposit = await getSql(`SELECT * FROM LFD_BankDeposits WHERE id = ?`, [depositId]);

    if (!deposit) return res.status(404).json({ error: "Dépôt introuvable." });
    if (deposit.status !== 'PENDING') return res.status(400).json({ error: `Le dépôt est déjà ${deposit.status}` });

    await runSql(`
      UPDATE LFD_BankDeposits 
      SET status = 'CONFIRMED', confirmed_by = ?, confirmed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [req.user.id, depositId]);

    // Audit log
    await runSql(`
      INSERT INTO LFD_AuditLogs (employee_id, action, entity_type, entity_id, new_value, reason)
      VALUES (?, 'CONFIRM', 'BANK_DEPOSIT', ?, ?, 'Confirmation dépôt bancaire')
    `, [req.user.id, depositId, JSON.stringify({ status: 'CONFIRMED' })]);

    res.json({ message: "Dépôt confirmé avec succès." });

  } catch (error) {
    console.error('[BANK DEPOSIT] Erreur lors de la confirmation:', error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// 4. Rejeter un dépôt
router.post('/:id/reject', authenticateLfdToken, requireLfdPermission('bank.deposit.verify'), async (req, res) => {
  try {
    const depositId = req.params.id;
    const { observation } = req.body;
    const deposit = await getSql(`SELECT * FROM LFD_BankDeposits WHERE id = ?`, [depositId]);

    if (!deposit) return res.status(404).json({ error: "Dépôt introuvable." });
    if (deposit.status !== 'PENDING') return res.status(400).json({ error: `Le dépôt est déjà ${deposit.status}` });

    await runSql(`
      UPDATE LFD_BankDeposits 
      SET status = 'REJECTED', confirmed_by = ?, confirmed_at = CURRENT_TIMESTAMP, observation = ?
      WHERE id = ?
    `, [req.user.id, observation || deposit.observation, depositId]);

    // Audit log
    await runSql(`
      INSERT INTO LFD_AuditLogs (employee_id, action, entity_type, entity_id, new_value, reason)
      VALUES (?, 'REJECT', 'BANK_DEPOSIT', ?, ?, ?)
    `, [req.user.id, depositId, JSON.stringify({ status: 'REJECTED' }), observation || 'Rejet']);

    res.json({ message: "Dépôt rejeté." });

  } catch (error) {
    console.error('[BANK DEPOSIT] Erreur du rejet:', error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;
