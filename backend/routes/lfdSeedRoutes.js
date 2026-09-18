const express = require('express');
const router = express.Router();
const { runSql, getSql } = require('../lfdDb');

router.get('/seed-mock-data', async (req, res) => {
  try {
    console.log('[SEED] Starting to inject mock data...');
    
    // 1. Inject Customers
    await runSql(`INSERT OR IGNORE INTO LFD_Customers (customer_code, name, phone, email, address, status) VALUES (?, ?, ?, ?, ?, ?)`, ['CLI-001', 'Boutique Alpha', '+229 90000001', 'alpha@boutique.com', 'Cotonou', 'ACTIVE']);
    await runSql(`INSERT OR IGNORE INTO LFD_Customers (customer_code, name, phone, email, address, status) VALUES (?, ?, ?, ?, ?, ?)`, ['CLI-002', 'Supermarché Beta', '+229 90000002', 'beta@supermarche.com', 'Porto-Novo', 'ACTIVE']);
    await runSql(`INSERT OR IGNORE INTO LFD_Customers (customer_code, name, phone, email, address, status) VALUES (?, ?, ?, ?, ?, ?)`, ['CLI-003', 'Alimentation Gamma', '+229 90000003', 'gamma@alim.com', 'Parakou', 'ACTIVE']);

    // 2. Inject Product Categories
    await runSql(`INSERT OR IGNORE INTO LFD_ProductCategories (name, description, status) VALUES (?, ?, ?)`, ['Électronique', 'Produits électroniques', 'ACTIVE']);
    await runSql(`INSERT OR IGNORE INTO LFD_ProductCategories (name, description, status) VALUES (?, ?, ?)`, ['Alimentaire', 'Produits alimentaires', 'ACTIVE']);

    const catElec = await getSql(`SELECT id FROM LFD_ProductCategories WHERE name = 'Électronique'`);
    const catAlim = await getSql(`SELECT id FROM LFD_ProductCategories WHERE name = 'Alimentaire'`);

    // 3. Inject Products
    if (catElec && catAlim) {
      await runSql(`INSERT OR IGNORE INTO LFD_Products (product_code, name, category_id, unit, purchase_price, selling_price, minimum_stock, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, ['PROD-001', 'Smartphone', catElec.id, 'Pièce', 50000, 75000, 5, 'ACTIVE']);
      await runSql(`INSERT OR IGNORE INTO LFD_Products (product_code, name, category_id, unit, purchase_price, selling_price, minimum_stock, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, ['PROD-002', 'Ordinateur Portable', catElec.id, 'Pièce', 150000, 200000, 2, 'ACTIVE']);
      await runSql(`INSERT OR IGNORE INTO LFD_Products (product_code, name, category_id, unit, purchase_price, selling_price, minimum_stock, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, ['PROD-003', 'Riz 5kg', catAlim.id, 'Sac', 3000, 4500, 20, 'ACTIVE']);
      await runSql(`INSERT OR IGNORE INTO LFD_Products (product_code, name, category_id, unit, purchase_price, selling_price, minimum_stock, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, ['PROD-004', 'Huile 1L', catAlim.id, 'Bouteille', 1000, 1500, 30, 'ACTIVE']);
    }

    // 4. Inject Stock
    const warehouse = await getSql(`SELECT id FROM LFD_Warehouses WHERE code = 'DEP-01'`);
    if (warehouse) {
      const p1 = await getSql(`SELECT id FROM LFD_Products WHERE product_code = 'PROD-001'`);
      const p2 = await getSql(`SELECT id FROM LFD_Products WHERE product_code = 'PROD-003'`);
      if (p1 && p2) {
        // We just do simple initial entries
        await runSql(`INSERT OR IGNORE INTO LFD_StockMovements (reference, product_id, warehouse_id, movement_type, quantity, reason) VALUES (?, ?, ?, ?, ?, ?)`, ['MVT-INIT-001', p1.id, warehouse.id, 'IN', 50, 'Stock Initial']);
        await runSql(`INSERT OR IGNORE INTO LFD_StockMovements (reference, product_id, warehouse_id, movement_type, quantity, reason) VALUES (?, ?, ?, ?, ?, ?)`, ['MVT-INIT-002', p2.id, warehouse.id, 'IN', 100, 'Stock Initial']);
      }
    }

    // 5. Suppliers
    await runSql(`INSERT OR IGNORE INTO LFD_Suppliers (code, name, email, phone, status) VALUES (?, ?, ?, ?, ?)`, ['FOURN-001', 'Fournisseur Global', 'contact@global.com', '+229 99000001', 'ACTIVE']);
    await runSql(`INSERT OR IGNORE INTO LFD_Suppliers (code, name, email, phone, status) VALUES (?, ?, ?, ?, ?)`, ['FOURN-002', 'Import Export SA', 'import@sa.com', '+229 99000002', 'ACTIVE']);

    res.json({ success: true, message: 'Mock data injected successfully!' });
  } catch (err) {
    console.error('[SEED] Error injecting data:', err);
    res.status(500).json({ error: 'Failed to inject mock data', details: err.message });
  }
});

module.exports = router;
