const express = require('express');
const router = express.Router();
const { getSql, allSql, runSql } = require('../lfdDb');
const { requireLfdPermission, logLfdAudit } = require('../middlewares/lfdAuth');

// Récupérer tous les paramètres
router.get('/', requireLfdPermission('settings.manage'), async (req, res) => {
  try {
    const settingsList = await allSql(`SELECT key, value FROM LFD_Settings`);
    const settings = {};
    settingsList.forEach(s => {
      settings[s.key] = s.value;
    });
    res.json(settings);
  } catch (err) {
    console.error("Erreur récupération paramètres:", err);
    res.status(500).json({ error: "Erreur lors de la récupération des paramètres." });
  }
});

// Mettre à jour des paramètres
router.post('/', requireLfdPermission('settings.manage'), async (req, res) => {
  try {
    const newSettings = req.body;
    for (const [key, value] of Object.entries(newSettings)) {
      await runSql(
        `INSERT INTO LFD_Settings (key, value) VALUES (?, ?) 
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = CURRENT_TIMESTAMP`,
        [key, value]
      );
    }
    await logLfdAudit(req.user.id, 'settings', 'update', null, "Mise à jour des paramètres globaux de l'entreprise");
    res.json({ message: "Paramètres mis à jour avec succès" });
  } catch (err) {
    console.error("Erreur mise à jour paramètres:", err);
    res.status(500).json({ error: "Erreur lors de la mise à jour des paramètres." });
  }
});

module.exports = router;
