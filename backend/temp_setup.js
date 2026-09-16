const {runSql} = require('./lfdDb');
const bcrypt = require('bcryptjs');

(async() => {
  try {
    const hash = await bcrypt.hash('password123', 10);
    await runSql(`INSERT OR IGNORE INTO LFD_Employees (employee_code, firstName, lastName, email, password_hash, role_id, status) VALUES ('MAG-01', 'Magasin', 'Test', 'magasin@lafoidistr.com', ?, 3, 'ACTIVE')`, [hash]);
    console.log('User created');
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
})();
