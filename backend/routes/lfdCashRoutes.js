const express = require('express');
const router = express.Router();
const { getSql, runSql, allSql } = require('../lfdDb');
const { authenticateLfdToken, requireLfdPermission, logLfdAudit } = require('../middlewares/lfdAuth');

// 1. Récupérer l'état de la caisse courante de l'utilisateur
router.get('/session', authenticateLfdToken, requireLfdPermission('cash.read'), async (req, res) => {
  try {
    const session = await getSql(`
      SELECT * FROM LFD_CashSessions 
      WHERE cashier_id = ? AND status = 'OPEN' 
      ORDER BY id DESC LIMIT 1
    `, [req.user.id]);
    
    if (!session) {
      return res.json({ session: null });
    }

    const transactions = await allSql(`SELECT * FROM LFD_CashTransactions WHERE cash_session_id = ? ORDER BY id DESC`, [session.id]);
    res.json({ session, transactions });
  } catch (error) {
    console.error('[LFD CASH] Erreur GET /session:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// 2. Ouvrir une caisse
router.post('/open', authenticateLfdToken, requireLfdPermission('cash.open'), async (req, res) => {
  const { cash_register_id, opening_balance } = req.body;
  if (!cash_register_id) return res.status(400).json({ error: 'Caisse requise.' });

  try {
    const activeSession = await getSql(`SELECT id FROM LFD_CashSessions WHERE cashier_id = ? AND status = 'OPEN'`, [req.user.id]);
    if (activeSession) return res.status(400).json({ error: 'Vous avez déjà une session de caisse ouverte.' });

    await runSql(`
      INSERT INTO LFD_CashSessions (cash_register_id, cashier_id, opening_balance, theoretical_balance, status)
      VALUES (?, ?, ?, ?, 'OPEN')
    `, [cash_register_id, req.user.id, opening_balance || 0, opening_balance || 0]);

    const session = await getSql(`SELECT * FROM LFD_CashSessions WHERE cashier_id = ? AND status = 'OPEN' ORDER BY id DESC LIMIT 1`, [req.user.id]);
    await logLfdAudit(req.user.id, 'OPEN', 'LFD_CashSessions', session.id, null, session, 'Ouverture Caisse', req.ip);

    res.status(201).json(session);
  } catch (error) {
    console.error('[LFD CASH] Erreur POST /open:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// 3. Clôturer une caisse
router.post('/close', authenticateLfdToken, requireLfdPermission('cash.close'), async (req, res) => {
  const { physical_balance, difference_reason } = req.body;

  try {
    const session = await getSql(`SELECT * FROM LFD_CashSessions WHERE cashier_id = ? AND status = 'OPEN'`, [req.user.id]);
    if (!session) return res.status(400).json({ error: 'Aucune session ouverte.' });

    const difference = physical_balance - session.theoretical_balance;

    await runSql(`
      UPDATE LFD_CashSessions 
      SET closed_at = CURRENT_TIMESTAMP, physical_balance = ?, difference = ?, status = 'CLOSED'
      WHERE id = ?
    `, [physical_balance, difference, session.id]);

    const closedSession = await getSql(`SELECT * FROM LFD_CashSessions WHERE id = ?`, [session.id]);
    await logLfdAudit(req.user.id, 'CLOSE', 'LFD_CashSessions', session.id, session, closedSession, 'Clôture: ' + (difference_reason || ''), req.ip);

    res.json(closedSession);
  } catch (error) {
    console.error('[LFD CASH] Erreur POST /close:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
