const {runSql, getSql} = require('./lfdDb');
(async() => {
  const r = await getSql(`SELECT id FROM LFD_Roles WHERE code = 'WAREHOUSE_AGENT'`);
  await runSql(`UPDATE LFD_Employees SET role_id = ? WHERE email = 'magasin@lafoidistr.com'`, [r.id]);
  console.log('Role updated to', r.id);
  process.exit(0);
})();
