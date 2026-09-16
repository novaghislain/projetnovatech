const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'lfd_database.sqlite');
const db = new sqlite3.Database(dbPath);

const getSql = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const runSql = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const TEST_ACCOUNTS = [
  { role_code: 'SUPER_ADMIN', email: 'admin@lafoidistr.com', firstName: 'Super', lastName: 'Admin' },
  { role_code: 'DIRECTOR', email: 'direction@lafoidistr.com', firstName: 'Directeur', lastName: 'Général' },
  { role_code: 'MANAGER', email: 'manager@lafoidistr.com', firstName: 'Manager', lastName: 'Opérationnel' },
  { role_code: 'BILLING_AGENT', email: 'facturation@lafoidistr.com', firstName: 'Agent', lastName: 'Facturation' },
  { role_code: 'CASHIER', email: 'caisse@lafoidistr.com', firstName: 'Caissier', lastName: 'Principal' },
  { role_code: 'WAREHOUSE_AGENT', email: 'magasin@lafoidistr.com', firstName: 'Agent', lastName: 'Magasin' },
  { role_code: 'DELIVERY_AGENT', email: 'livraison@lafoidistr.com', firstName: 'Agent', lastName: 'Livraison' },
  { role_code: 'SALES_AGENT', email: 'commercial@lafoidistr.com', firstName: 'Agent', lastName: 'Commercial' },
  { role_code: 'ACCOUNTANT', email: 'comptable@lafoidistr.com', firstName: 'Agent', lastName: 'Comptable' }
];

async function setupAccounts() {
  try {
    const password_hash = await bcrypt.hash('password123', 10);
    
    for (const acc of TEST_ACCOUNTS) {
      const role = await getSql(`SELECT id FROM LFD_Roles WHERE code = ?`, [acc.role_code]);
      if (!role) {
        console.error(`Role ${acc.role_code} not found!`);
        continue;
      }
      
      const existing = await getSql(`SELECT id FROM LFD_Employees WHERE email = ?`, [acc.email]);
      if (existing) {
        await runSql(`UPDATE LFD_Employees SET role_id = ?, password_hash = ?, status = 'ACTIVE' WHERE email = ?`, [role.id, password_hash, acc.email]);
        console.log(`Updated ${acc.email}`);
      } else {
        await runSql(`INSERT INTO LFD_Employees (employee_code, firstName, lastName, email, password_hash, role_id, status) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`, 
          [`TEST-${Math.floor(Math.random()*10000)}`, acc.firstName, acc.lastName, acc.email, password_hash, role.id]);
        console.log(`Created ${acc.email}`);
      }
    }
    console.log("Test accounts setup completed.");
  } catch (err) {
    console.error(err);
  } finally {
    db.close();
  }
}

setupAccounts();
