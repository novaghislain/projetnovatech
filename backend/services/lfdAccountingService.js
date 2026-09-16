const { runSql, allSql, db } = require('../lfdDb');
const { runTransaction } = require('../utils/lfdTransaction');
const { logLfdAudit } = require('../middlewares/lfdAuth');

class LfdAccountingService {
  async generateEntryNumber(journalId) {
    const journal = (await allSql('SELECT code FROM LFD_AccountingJournals WHERE id = ?', [journalId]))[0];
    if (!journal) throw new Error('Journal introuvable');
    
    const year = new Date().getFullYear();
    const result = await allSql(
      `SELECT count(*) as count FROM LFD_JournalEntries WHERE journal_id = ? AND entry_date >= ?`, 
      [journalId, `${year}-01-01`]
    );
    const seq = (result[0].count + 1).toString().padStart(5, '0');
    return `${journal.code}-${year}-${seq}`;
  }

  async checkPeriodOpen(date) {
    const periods = await allSql(
      `SELECT * FROM LFD_AccountingPeriods WHERE status = 'OPEN' AND start_date <= ? AND end_date >= ?`,
      [date, date]
    );
    if (periods.length === 0) {
      throw new Error("Période comptable fermée ou inexistante pour cette date.");
    }
  }

  validateDoubleEntry(lines) {
    let totalDebit = 0;
    let totalCredit = 0;
    
    for (const line of lines) {
      if (line.debit < 0 || line.credit < 0) {
        throw new Error("Les montants de débit et crédit doivent être positifs.");
      }
      if (line.debit > 0 && line.credit > 0) {
        throw new Error("Une ligne ne peut pas avoir un débit et un crédit positifs simultanément.");
      }
      totalDebit += (line.debit || 0);
      totalCredit += (line.credit || 0);
    }
    
    if (totalDebit !== totalCredit) {
      throw new Error(`Écriture déséquilibrée: Débit (${totalDebit}) != Crédit (${totalCredit})`);
    }
    if (totalDebit === 0) {
      throw new Error("L'écriture ne peut pas être nulle.");
    }
  }

  async getSetting(key) {
    const rows = await allSql('SELECT value FROM LFD_Settings WHERE key = ?', [key]);
    return rows.length > 0 ? rows[0].value : null;
  }

  async postAccountingEvent(eventType, sourceType, sourceId, amount, details, userId, ipAddress) {
    // 1. Vérifier la Date de Bascule
    const cutoverDateStr = await this.getSetting('ACCOUNTING_CUTOVER_DATE');
    if (!cutoverDateStr) return null; // Pas de configuration
    
    const cutoverDate = new Date(cutoverDateStr);
    const today = new Date();
    if (today < cutoverDate) {
      console.log(`[COMPTA] Événement ${eventType} ignoré (avant cutover date: ${cutoverDateStr})`);
      return null;
    }

    // 2. Vérifier s'il est déjà comptabilisé (Idempotence rapide)
    const existing = await allSql(
      'SELECT id FROM LFD_JournalEntries WHERE event_type = ? AND source_type = ? AND source_id = ? AND status != ?',
      [eventType, sourceType, sourceId, 'REVERSED']
    );
    if (existing.length > 0) {
      throw new Error(`Idempotence violée : L'événement ${eventType} sur ${sourceType} ${sourceId} est déjà comptabilisé.`);
    }

    // 3. Trouver le mapping
    const mappings = await allSql(
      'SELECT * FROM LFD_AccountingMappings WHERE event_type = ? AND status = ?',
      [eventType, 'ACTIVE']
    );
    
    if (mappings.length === 0) {
      console.error(`[COMPTA] ALERTE: Mapping comptable manquant pour l'événement ${eventType}.`);
      throw new Error(`Mapping comptable manquant pour l'événement ${eventType}. Veuillez configurer les comptes associés.`);
    }
    
    const mapping = mappings[0];

    // 4. Déterminer le journal (Operations Diverses par défaut si non spécifié, ou selon type)
    // Pour l'instant, on cherche un journal 'OD' (Opérations Diverses) ou le premier disponible
    const journals = await allSql("SELECT id FROM LFD_AccountingJournals WHERE code = 'OD' OR type = 'GENERAL' LIMIT 1");
    if (journals.length === 0) throw new Error("Aucun journal comptable trouvé pour générer l'écriture.");
    const journal_id = journals[0].id;

    // 5. Créer les lignes
    const lines = [
      {
        account_id: mapping.debit_account_id,
        customer_id: details.customer_id || null,
        supplier_id: details.supplier_id || null,
        description: `DÉBIT - ${mapping.description || eventType} (${sourceType} ${sourceId})`,
        debit: amount,
        credit: 0
      },
      {
        account_id: mapping.credit_account_id,
        customer_id: details.customer_id || null,
        supplier_id: details.supplier_id || null,
        description: `CRÉDIT - ${mapping.description || eventType} (${sourceType} ${sourceId})`,
        debit: 0,
        credit: amount
      }
    ];

    const todayStr = today.toISOString().split('T')[0];

    // 6. Générer l'écriture (l'insertion se fera avec la contrainte de partie double)
    // Note: on n'utilise pas createJournalEntry directement pour pouvoir forcer le statut si besoin,
    // mais réutiliser la logique est mieux.
    const entryData = {
      journal_id: journal_id,
      entry_date: todayStr,
      description: `Auto-généré : ${mapping.description || eventType} (${sourceType} ${sourceId})`,
      source_type: sourceType,
      source_id: sourceId,
      event_type: eventType,
      lines: lines
    };

    const entryId = await this.createJournalEntry(entryData, userId, ipAddress);

    // 7. Statut automatique
    const autoStatus = await this.getSetting('AUTO_ENTRY_STATUS');
    if (autoStatus === 'POSTED') {
      await this.postJournalEntry(entryId, userId, ipAddress);
    }

    return entryId;
  }

  async reverseAccountingEventBySource(sourceType, sourceId, userId, ipAddress) {
    const entries = await allSql(
      'SELECT id, status FROM LFD_JournalEntries WHERE source_type = ? AND source_id = ? AND status != ?',
      [sourceType, sourceId, 'REVERSED']
    );
    
    if (entries.length === 0) {
      console.log(`[COMPTA] Aucune écriture à contrepasser pour ${sourceType} ${sourceId}`);
      return;
    }
    
    for (const entry of entries) {
      if (entry.status === 'POSTED') {
        await this.reverseJournalEntry(entry.id, userId, ipAddress);
      } else {
        // Si elle est encore DRAFT, on peut simplement la passer en REVERSED ou la supprimer
        // Selon les bonnes pratiques on peut juste la marquer annulée.
        await new Promise((resolve, reject) => {
          db.run("UPDATE LFD_JournalEntries SET status = 'REVERSED', description = description || ' (Annulée)' WHERE id = ?", [entry.id], err => err ? reject(err) : resolve());
        });
      }
    }
  }

  async createJournalEntry(data, userId, ipAddress) {
    const { journal_id, entry_date, description, lines, source_type, source_id, event_type } = data;
    
    await this.checkPeriodOpen(entry_date);
    this.validateDoubleEntry(lines);

    return await runTransaction(async () => {
      const entryNumber = await this.generateEntryNumber(journal_id);
      
      const insertEntryQuery = `
        INSERT INTO LFD_JournalEntries 
        (entry_number, journal_id, entry_date, description, source_type, source_id, event_type, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?)
      `;
      
      const result = await new Promise((resolve, reject) => {
        db.run(insertEntryQuery, [
          entryNumber, journal_id, entry_date, description, 
          source_type || null, source_id || null, event_type || null, userId
        ], function(err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              reject(new Error(`Idempotence violée : L'événement ${event_type} sur ${source_type} ${source_id} existe déjà.`));
            } else {
              reject(err);
            }
          } else {
            resolve(this.lastID);
          }
        });
      });
      
      const entryId = result;

      const insertLineQuery = `
        INSERT INTO LFD_JournalEntryLines 
        (journal_entry_id, account_id, customer_id, supplier_id, description, debit, credit)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      for (const line of lines) {
        await new Promise((resolve, reject) => {
          db.run(insertLineQuery, [
            entryId, line.account_id, line.customer_id || null, line.supplier_id || null,
            line.description || null, line.debit || 0, line.credit || 0
          ], err => err ? reject(err) : resolve());
        });
      }

      await logLfdAudit(userId, 'CREATE_ACCOUNTING_ENTRY', 'LFD_JournalEntries', entryId, null, { entryNumber }, "Création écriture", ipAddress);
      
      return entryId;
    });
  }

  async postJournalEntry(entryId, userId, ipAddress) {
    return await runTransaction(async () => {
      const entries = await allSql('SELECT * FROM LFD_JournalEntries WHERE id = ?', [entryId]);
      if (entries.length === 0) throw new Error("Écriture introuvable.");
      
      const entry = entries[0];
      if (entry.status === 'POSTED') throw new Error("L'écriture est déjà postée.");
      if (entry.status === 'REVERSED') throw new Error("L'écriture est contrepassée.");
      
      await this.checkPeriodOpen(entry.entry_date);
      
      const lines = await allSql('SELECT debit, credit FROM LFD_JournalEntryLines WHERE journal_entry_id = ?', [entryId]);
      this.validateDoubleEntry(lines);

      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE LFD_JournalEntries SET status = 'POSTED', validated_by = ?, validated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [userId, entryId],
          err => err ? reject(err) : resolve()
        );
      });

      await logLfdAudit(userId, 'POST_ACCOUNTING_ENTRY', 'LFD_JournalEntries', entryId, { status: entry.status }, { status: 'POSTED' }, "Validation écriture", ipAddress);
      
      return true;
    });
  }

  async reverseJournalEntry(entryId, userId, ipAddress) {
    return await runTransaction(async () => {
      const entries = await allSql('SELECT * FROM LFD_JournalEntries WHERE id = ?', [entryId]);
      if (entries.length === 0) throw new Error("Écriture introuvable.");
      
      const entry = entries[0];
      if (entry.status !== 'POSTED') throw new Error("Seule une écriture POSTED peut être contrepassée.");
      
      const lines = await allSql('SELECT * FROM LFD_JournalEntryLines WHERE journal_entry_id = ?', [entryId]);
      
      const today = new Date().toISOString().split('T')[0];
      await this.checkPeriodOpen(today);

      const entryNumber = await this.generateEntryNumber(entry.journal_id);

      const insertEntryQuery = `
        INSERT INTO LFD_JournalEntries 
        (entry_number, journal_id, entry_date, description, source_type, source_id, event_type, status, created_by, reversal_of_entry_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?)
      `;

      const reversalId = await new Promise((resolve, reject) => {
        db.run(insertEntryQuery, [
          entryNumber, entry.journal_id, today, `Contrepassation de ${entry.entry_number}`,
          null, null, null, userId, entryId
        ], function(err) {
          err ? reject(err) : resolve(this.lastID);
        });
      });

      const insertLineQuery = `
        INSERT INTO LFD_JournalEntryLines 
        (journal_entry_id, account_id, customer_id, supplier_id, description, debit, credit)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      for (const line of lines) {
        await new Promise((resolve, reject) => {
          db.run(insertLineQuery, [
            reversalId, line.account_id, line.customer_id, line.supplier_id,
            line.description, line.credit, line.debit
          ], err => err ? reject(err) : resolve());
        });
      }

      await new Promise((resolve, reject) => {
        db.run(`UPDATE LFD_JournalEntries SET status = 'REVERSED' WHERE id = ?`, [entryId], err => err ? reject(err) : resolve());
      });

      await logLfdAudit(userId, 'REVERSE_ACCOUNTING_ENTRY', 'LFD_JournalEntries', entryId, null, { reversalId }, "Contrepassation écriture", ipAddress);
      
      return reversalId;
    });
  }
}

module.exports = new LfdAccountingService();
