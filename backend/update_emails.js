const { runSql } = require('./lfdDb.js'); 
async function f() { 
  await runSql("UPDATE LFD_Employees SET email = 'compta@lafoidistr.com' WHERE email = 'comptable@lafoidistr.com'"); 
  await runSql("UPDATE LFD_Employees SET email = 'stock@lafoidistr.com' WHERE email = 'magasin@lafoidistr.com'"); 
  console.log('Updated DB emails'); 
} 
f().catch(console.error);
