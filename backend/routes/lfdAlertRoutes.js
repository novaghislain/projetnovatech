const express = require('express');
const router = express.Router();
const { getSql, runSql, allSql } = require('../lfdDb');
const { authenticateLfdToken, requireLfdPermission } = require('../middlewares/lfdAuth');

// Lister les alertes
router.get('/', authenticateLfdToken, requireLfdPermission('alert.read'), async (req, res) => {
  try {
    const statusFilter = req.query.status || 'NEW'; // NEW, RESOLVED
    const alerts = await allSql(`SELECT * FROM LFD_Alerts WHERE status = ? ORDER BY id DESC`, [statusFilter]);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

// Résoudre une alerte
router.post('/:id/resolve', authenticateLfdToken, requireLfdPermission('alert.resolve'), async (req, res) => {
  try {
    await runSql(`UPDATE LFD_Alerts SET status = 'RESOLVED', resolved_by = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ?`, [req.user.id, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
