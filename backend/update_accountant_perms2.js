const { runSql, getSql } = require('./lfdDb.js');

async function fixAccountantPerms() {
  const permsToAdd = [
    'customer.read', 'product.read', 'sale.read', 'sale.create', 'sale.validate', 'sale.cancel',
    'payment.read', 'payment.create', 'receipt.read', 'receipt.create', 'receipt.validate',
    'supplier_payment.create', 'supplier_payment.read', 'supplier_payment.approve',
    'supplier_invoice.validate', 'purchase.read', 'purchase.create', 'purchase.approve', 'purchase.cancel',
    'bank.deposit.declare', 'bank.deposit.verify', 'cash.open', 'invoice.print', 'operational_control.read'
  ];

  try {
    const role = await getSql("SELECT id FROM LFD_Roles WHERE code = 'ACCOUNTANT'");
    const roleId = role.id;

    for (const code of permsToAdd) {
      const perm = await getSql("SELECT id FROM LFD_Permissions WHERE code = ?", [code]);
      if (perm) {
        await runSql(`INSERT OR IGNORE INTO LFD_RolePermissions (role_id, permission_id) VALUES (?, ?)`, [roleId, perm.id]);
      } else {
        console.warn('Permission non trouvée en base:', code);
      }
    }
    console.log("Accountant permissions for facturation and others updated successfully!");
  } catch (err) {
    console.error(err);
  }
}

fixAccountantPerms();
