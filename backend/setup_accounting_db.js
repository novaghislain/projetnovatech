const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'lfd_database.sqlite');
const db = new sqlite3.Database(dbPath);

const setupAccounting = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('Création des tables comptables...');

      // 1. LFD_Accounts (Plan Comptable)
      db.run(`
        CREATE TABLE IF NOT EXISTS LFD_Accounts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          account_number TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          account_type TEXT NOT NULL, -- ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
          parent_id INTEGER DEFAULT NULL,
          is_postable INTEGER DEFAULT 1,
          status TEXT DEFAULT 'ACTIVE',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (parent_id) REFERENCES LFD_Accounts(id)
        )
      `);

      // 2. LFD_AccountingJournals (Journaux)
      db.run(`
        CREATE TABLE IF NOT EXISTS LFD_AccountingJournals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          journal_type TEXT NOT NULL, -- SALES, PURCHASES, CASH, BANK, GENERAL
          status TEXT DEFAULT 'ACTIVE',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 3. LFD_JournalEntries (Écritures)
      db.run(`
        CREATE TABLE IF NOT EXISTS LFD_JournalEntries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          entry_number TEXT NOT NULL UNIQUE,
          journal_id INTEGER NOT NULL,
          entry_date DATE NOT NULL,
          description TEXT NOT NULL,
          
          -- Source de l'écriture pour traçabilité croisée
          source_type TEXT DEFAULT NULL, -- ex: SALE, PAYMENT, PURCHASE_INVOICE, MANUAL
          source_id INTEGER DEFAULT NULL,
          event_type TEXT DEFAULT NULL,  -- ex: SALE_CASH, CUSTOMER_PAYMENT
          
          status TEXT DEFAULT 'DRAFT', -- DRAFT, POSTED, REVERSED
          
          created_by INTEGER NOT NULL,
          validated_by INTEGER DEFAULT NULL,
          validated_at DATETIME DEFAULT NULL,
          
          reversal_of_entry_id INTEGER DEFAULT NULL,
          
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          
          FOREIGN KEY (journal_id) REFERENCES LFD_AccountingJournals(id),
          FOREIGN KEY (created_by) REFERENCES LFD_Employees(id),
          FOREIGN KEY (validated_by) REFERENCES LFD_Employees(id),
          FOREIGN KEY (reversal_of_entry_id) REFERENCES LFD_JournalEntries(id),
          
          -- Contrainte d'idempotence stricte pour ne pas enregistrer le même événement deux fois
          UNIQUE(source_type, source_id, event_type)
        )
      `);

      // 4. LFD_JournalEntryLines (Lignes d'Écritures)
      db.run(`
        CREATE TABLE IF NOT EXISTS LFD_JournalEntryLines (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          journal_entry_id INTEGER NOT NULL,
          account_id INTEGER NOT NULL,
          
          -- Tiers (Comptes auxiliaires)
          customer_id INTEGER DEFAULT NULL,
          supplier_id INTEGER DEFAULT NULL,
          
          description TEXT DEFAULT NULL,
          
          debit INTEGER DEFAULT 0,
          credit INTEGER DEFAULT 0,
          
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          
          FOREIGN KEY (journal_entry_id) REFERENCES LFD_JournalEntries(id),
          FOREIGN KEY (account_id) REFERENCES LFD_Accounts(id),
          FOREIGN KEY (customer_id) REFERENCES LFD_Customers(id),
          FOREIGN KEY (supplier_id) REFERENCES LFD_Suppliers(id),
          
          CHECK (debit >= 0 AND credit >= 0)
        )
      `);

      // 5. LFD_AccountingMappings (Configuration)
      db.run(`
        CREATE TABLE IF NOT EXISTS LFD_AccountingMappings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_type TEXT NOT NULL UNIQUE,
          
          debit_account_id INTEGER DEFAULT NULL,
          credit_account_id INTEGER DEFAULT NULL,
          
          payment_method TEXT DEFAULT NULL,
          
          description TEXT DEFAULT NULL,
          status TEXT DEFAULT 'ACTIVE',
          
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          
          FOREIGN KEY (debit_account_id) REFERENCES LFD_Accounts(id),
          FOREIGN KEY (credit_account_id) REFERENCES LFD_Accounts(id)
        )
      `);

      // 6. LFD_AccountingPeriods (Périodes Comptables)
      db.run(`
        CREATE TABLE IF NOT EXISTS LFD_AccountingPeriods (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          year INTEGER NOT NULL,
          period_number INTEGER NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          status TEXT DEFAULT 'OPEN', -- OPEN, CLOSED
          
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          
          UNIQUE(year, period_number)
        )
      `);

      resolve();
    });
  });
};

setupAccounting()
  .then(() => {
    console.log('Tables comptables créées avec succès.');
    db.close();
  })
  .catch(err => {
    console.error('Erreur:', err);
    db.close();
  });
