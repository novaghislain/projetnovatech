const express = require('express');
const router = express.Router();
const { runSql, allSql } = require('../lfdDb');
const { authenticateLfdToken, requireLfdPermission } = require('../middlewares/lfdAuth');
const lfdAccountingService = require('../services/lfdAccountingService');

// ==========================================
// PARAMÈTRES ET MAPPINGS COMPTABLES
// ==========================================

router.get('/settings', authenticateLfdToken, requireLfdPermission('report.read'), async (req, res) => {
  try {
    const settings = await allSql('SELECT * FROM LFD_Settings');
    const settingsMap = {};
    settings.forEach(s => settingsMap[s.key] = s.value);
    res.json(settingsMap);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/settings', authenticateLfdToken, requireLfdPermission('accounting.entry.post'), async (req, res) => {
  try {
    const keys = Object.keys(req.body);
    for (const key of keys) {
      await runSql('UPDATE LFD_Settings SET value = ?, updatedAt = CURRENT_TIMESTAMP WHERE key = ?', [req.body[key], key]);
    }
    res.json({ success: true, message: 'Paramètres mis à jour.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/mappings', authenticateLfdToken, requireLfdPermission('report.read'), async (req, res) => {
  try {
    const mappings = await allSql(`
      SELECT m.*, 
        d.account_number as debit_account_number, d.name as debit_account_name,
        c.account_number as credit_account_number, c.name as credit_account_name
      FROM LFD_AccountingMappings m
      LEFT JOIN LFD_Accounts d ON m.debit_account_id = d.id
      LEFT JOIN LFD_Accounts c ON m.credit_account_id = c.id
      ORDER BY m.event_type ASC
    `);
    res.json(mappings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/mappings/:id', authenticateLfdToken, requireLfdPermission('accounting.entry.post'), async (req, res) => {
  const { debit_account_id, credit_account_id } = req.body;
  try {
    await runSql(
      'UPDATE LFD_AccountingMappings SET debit_account_id = ?, credit_account_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [debit_account_id, credit_account_id, req.params.id]
    );
    res.json({ success: true, message: 'Mapping mis à jour.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// CONFIGURATION (Plan comptable, Journaux)
// ==========================================

router.get('/accounts', authenticateLfdToken, requireLfdPermission('report.read'), async (req, res) => {
  try {
    const accounts = await allSql('SELECT * FROM LFD_Accounts ORDER BY account_number ASC');
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/journals', authenticateLfdToken, requireLfdPermission('report.read'), async (req, res) => {
  try {
    const journals = await allSql('SELECT * FROM LFD_AccountingJournals ORDER BY code ASC');
    res.json(journals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/periods', authenticateLfdToken, requireLfdPermission('report.read'), async (req, res) => {
  try {
    const periods = await allSql('SELECT * FROM LFD_AccountingPeriods ORDER BY start_date DESC');
    res.json(periods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ÉCRITURES COMPTABLES
// ==========================================

router.post('/entries', authenticateLfdToken, requireLfdPermission('accounting.entry.create'), async (req, res) => {
  try {
    const entryId = await lfdAccountingService.createJournalEntry(req.body, req.user.id, req.ip);
    res.status(201).json({ success: true, entryId, message: "Écriture créée avec succès (DRAFT)." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/entries/:id/post', authenticateLfdToken, requireLfdPermission('accounting.entry.post'), async (req, res) => {
  try {
    await lfdAccountingService.postJournalEntry(req.params.id, req.user.id, req.ip);
    res.json({ success: true, message: "Écriture validée (POSTED)." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/entries/:id/reverse', authenticateLfdToken, requireLfdPermission('accounting.entry.post'), async (req, res) => {
  try {
    const reversalId = await lfdAccountingService.reverseJournalEntry(req.params.id, req.user.id, req.ip);
    res.json({ success: true, reversalId, message: "Écriture contrepassée avec succès." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==========================================
// RAPPORTS COMPTABLES
// ==========================================

router.get('/ledger', authenticateLfdToken, requireLfdPermission('report.read'), async (req, res) => {
  try {
    const query = `
      SELECT 
        a.account_number, a.name as account_name,
        je.entry_date, je.entry_number, je.description as entry_description,
        jel.description as line_description,
        jel.debit, jel.credit
      FROM LFD_JournalEntryLines jel
      JOIN LFD_JournalEntries je ON jel.journal_entry_id = je.id
      JOIN LFD_Accounts a ON jel.account_id = a.id
      WHERE je.status = 'POSTED'
      ORDER BY a.account_number ASC, je.entry_date ASC
    `;
    const ledgerLines = await allSql(query);
    res.json(ledgerLines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/trial-balance', authenticateLfdToken, requireLfdPermission('report.read'), async (req, res) => {
  try {
    const query = `
      SELECT 
        a.account_number, a.name,
        SUM(jel.debit) as total_debit,
        SUM(jel.credit) as total_credit
      FROM LFD_Accounts a
      LEFT JOIN LFD_JournalEntryLines jel ON a.id = jel.account_id
      LEFT JOIN LFD_JournalEntries je ON jel.journal_entry_id = je.id AND je.status = 'POSTED'
      GROUP BY a.id
      HAVING total_debit > 0 OR total_credit > 0
      ORDER BY a.account_number ASC
    `;
    const balanceLines = await allSql(query);
    
    const result = balanceLines.map(line => {
      const solde = (line.total_debit || 0) - (line.total_credit || 0);
      return {
        ...line,
        solde_debiteur: solde > 0 ? solde : 0,
        solde_crediteur: solde < 0 ? Math.abs(solde) : 0
      };
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/journals/:id/entries', authenticateLfdToken, requireLfdPermission('report.read'), async (req, res) => {
  try {
    const query = `
      SELECT je.*, 
             (SELECT SUM(debit) FROM LFD_JournalEntryLines WHERE journal_entry_id = je.id) as total_debit,
             (SELECT SUM(credit) FROM LFD_JournalEntryLines WHERE journal_entry_id = je.id) as total_credit
      FROM LFD_JournalEntries je
      WHERE je.journal_id = ?
      ORDER BY je.entry_date DESC, je.id DESC
    `;
    const entries = await allSql(query, [req.params.id]);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
