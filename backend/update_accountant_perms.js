const { runSql, getSql } = require('./lfdDb.js');

async function grantAccountantPerms() {
  const permissionsNeeded = [
    'supplier.read', 'supplier.create', 'supplier.update',
    'supplier_invoice.read', 'supplier_invoice.create',
    'payable.read', 'payable.pay',
    'invoice.read', 'invoice.create', 'invoice.edit', 'invoice.validate', 'invoice.cancel',
    'cash.read', 'cash.collect', 'cash.expense', 'cash.close', 'cash.adjust',
    'stock.read', 'stock.inventory', 'stock.adjust',
    'credit.read', 'credit.create', 'credit.approve', 'credit.payment',
    'bank.read', 'bank.deposit', 'bank.reconcile',
    'accounting.read', 'accounting.create', 'accounting.validate',
    'order.read', 'order.create', 'order.validate', 'order.cancel',
    'delivery.read',
    'report.read', 'report.export',
    'audit.read',
    'direction.read',
    'bank.deposit.read'
  ];

  try {
    const role = await getSql("SELECT id FROM LFD_Roles WHERE code = 'ACCOUNTANT'");
    if (!role) {
      console.error("Role ACCOUNTANT not found!");
      return;
    }
    const roleId = role.id;

    for (const permCode of permissionsNeeded) {
      // Create permission if it doesn't exist
      await runSql(`INSERT OR IGNORE INTO LFD_Permissions (code, module, description) VALUES (?, ?, ?)`, [permCode, 'SYSTEM', 'Auto-added']);
      
      const perm = await getSql("SELECT id FROM LFD_Permissions WHERE code = ?", [permCode]);
      if (perm) {
        // Grant to role
        await runSql(`INSERT OR IGNORE INTO LFD_RolePermissions (role_id, permission_id) VALUES (?, ?)`, [roleId, perm.id]);
      }
    }
    console.log("Accountant permissions updated successfully in DB!");
  } catch (error) {
    console.error("Error updating permissions:", error);
  }
}

grantAccountantPerms();
