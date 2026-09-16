const { runSql } = require('./lfdDb');

async function updateSuperAdmin() {
  try {
    await runSql(`UPDATE LFD_Employees SET firstName = 'OKÉ', lastName = 'Mathieu' WHERE email = 'super_admin@lafoidistr.com' OR role_id IN (SELECT id FROM LFD_Roles WHERE code = 'SUPER_ADMIN')`);
    console.log("Super Admin mis à jour avec succès : OKÉ Mathieu !");
    process.exit(0);
  } catch (err) {
    console.error("Erreur :", err);
    process.exit(1);
  }
}

updateSuperAdmin();
