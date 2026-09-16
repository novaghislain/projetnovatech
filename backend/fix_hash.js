const { runSql } = require('./lfdDb');
const bcrypt = require('bcryptjs');

async function seed() {
  const hash = await bcrypt.hash('password123', 10);
  await runSql(`UPDATE LFD_Employees SET password_hash = ? WHERE email = 'direction@lafoidistr.com'`, [hash]);
  console.log('Done');
}
seed();
