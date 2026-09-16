const express = require('express');
const router = express.Router();
const { allSql } = require('../lfdDb');
const { authenticateLfdToken, requireLfdPermission } = require('../middlewares/lfdAuth');

router.get('/', authenticateLfdToken, requireLfdPermission('audit.read'), async (req, res) => {
  try {
    const logs = await allSql(`
      SELECT a.*, 
             u.firstName || ' ' || u.lastName as employee_name,
             u.role_code
      FROM LFD_AuditLogs a
      LEFT JOIN LFD_Employees u ON a.employee_id = u.id
      ORDER BY a.createdAt DESC
      LIMIT 200
    `);

    res.json(logs);
  } catch (error) {
    console.error('[LFD AUDIT] Erreur lors de la récupération des logs:', error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;
