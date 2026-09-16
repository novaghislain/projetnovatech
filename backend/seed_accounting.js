const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'lfd_database.sqlite');
const db = new sqlite3.Database(dbPath);

const seedAccounting = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('Seeding Accounting Data...');

      // 1. Inserer Permissions
      const perms = [
        { code: 'accounting.entry.create', module: 'accounting', action: 'create' },
        { code: 'accounting.entry.post', module: 'accounting', action: 'post' },
        { code: 'report.read', module: 'accounting', action: 'read' }
      ];

      const stmtPerm = db.prepare(`INSERT INTO LFD_Permissions (code, module, action) VALUES (?, ?, ?) ON CONFLICT DO NOTHING`);
      perms.forEach(p => stmtPerm.run(p.code, p.module, p.action));
      stmtPerm.finalize();

      // Mettre les permissions au role ACCOUNTANT
      db.run(`
        INSERT INTO LFD_RolePermissions (role_id, permission_id)
        SELECT r.id, p.id FROM LFD_Roles r, LFD_Permissions p
        WHERE r.code = 'ACCOUNTANT' AND p.code IN ('accounting.entry.create', 'accounting.entry.post', 'report.read')
        ON CONFLICT DO NOTHING
      `);
      
      // Mettre les permissions au role DIRECTOR
      db.run(`
        INSERT INTO LFD_RolePermissions (role_id, permission_id)
        SELECT r.id, p.id FROM LFD_Roles r, LFD_Permissions p
        WHERE r.code = 'DIRECTOR' AND p.code IN ('accounting.entry.create', 'accounting.entry.post', 'report.read')
        ON CONFLICT DO NOTHING
      `);

      // 2. Inserer Journaux par défaut
      const journals = [
        { code: 'VT', name: 'Journal des Ventes', type: 'SALES' },
        { code: 'AC', name: 'Journal des Achats', type: 'PURCHASES' },
        { code: 'CA', name: 'Journal de Caisse', type: 'CASH' },
        { code: 'BQ', name: 'Journal de Banque', type: 'BANK' },
        { code: 'OD', name: 'Opérations Diverses', type: 'GENERAL' }
      ];

      const stmtJournal = db.prepare(`INSERT INTO LFD_AccountingJournals (code, name, journal_type) VALUES (?, ?, ?) ON CONFLICT DO NOTHING`);
      journals.forEach(j => stmtJournal.run(j.code, j.name, j.type));
      stmtJournal.finalize();

      // 3. Inserer Plan Comptable Basique (Classes 1-7)
      const accounts = [
        { num: '411', name: 'Clients', type: 'ASSET' },
        { num: '401', name: 'Fournisseurs', type: 'LIABILITY' },
        { num: '531', name: 'Caisse', type: 'ASSET' },
        { num: '521', name: 'Banque', type: 'ASSET' },
        { num: '701', name: 'Ventes de marchandises', type: 'REVENUE' },
        { num: '601', name: 'Achats de marchandises', type: 'EXPENSE' },
        { num: '445', name: 'TVA', type: 'LIABILITY' }
      ];

      const stmtAcc = db.prepare(`INSERT INTO LFD_Accounts (account_number, name, account_type) VALUES (?, ?, ?) ON CONFLICT DO NOTHING`);
      accounts.forEach(a => stmtAcc.run(a.num, a.name, a.type));
      stmtAcc.finalize();

      // 4. Inserer Période Comptable Actuelle
      const currentYear = new Date().getFullYear();
      db.run(`INSERT INTO LFD_AccountingPeriods (year, period_number, start_date, end_date) 
              VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING`,
              [currentYear, 1, `${currentYear}-01-01`, `${currentYear}-12-31`]);

      resolve();
    });
  });
};

seedAccounting()
  .then(() => {
    console.log('Seeding comptable terminé.');
    db.close();
  })
  .catch(err => {
    console.error('Erreur de seeding:', err);
    db.close();
  });
