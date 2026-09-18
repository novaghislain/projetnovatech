const db = require('./db');
const bcrypt = require('bcryptjs');

console.log('[LFD DB] Connexion à la base unifiée (db.js)...');

const runSql = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, (err, result) => {
      if (err) {
        console.error(`[LFD DB] Erreur d'exécution: ${query}`, err.message);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const getSql = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        console.error(`[LFD DB] Erreur d'exécution: ${query}`, err.message);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const allSql = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error(`[LFD DB] Erreur d'exécution: ${query}`, err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Start LFD DB Initialization
initLFDDatabase();

async function initLFDDatabase() {
  try {
    // 1. Activer les clés étrangères
    await runSql(`PRAGMA foreign_keys = ON`);

    // --- RÔLES ET PERMISSIONS ---
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_Roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_Permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        module TEXT NOT NULL,
        action TEXT NOT NULL,
        description TEXT
      )
    `);

    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_RolePermissions (
        role_id INTEGER NOT NULL,
        permission_id INTEGER NOT NULL,
        PRIMARY KEY (role_id, permission_id),
        FOREIGN KEY (role_id) REFERENCES LFD_Roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES LFD_Permissions(id) ON DELETE CASCADE
      )
    `);

    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_Employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_code TEXT UNIQUE,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password_hash TEXT NOT NULL,
        role_id INTEGER,
        status TEXT DEFAULT 'ACTIVE',
        is_demo INTEGER DEFAULT 0,
        avatar TEXT,
        last_login_at DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES LFD_Roles(id) ON DELETE SET NULL
      )
    `);

    // --- AUTRES TABLES MÉTIER ---
    
    // Clients
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_Customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        address TEXT,
        credit_allowed INTEGER DEFAULT 0,
        credit_limit REAL DEFAULT 0,
        current_balance REAL DEFAULT 0,
        status TEXT DEFAULT 'ACTIVE',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Catégories
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_ProductCategories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'ACTIVE'
      )
    `);

    // Produits
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_Products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        category_id INTEGER,
        unit TEXT,
        purchase_price INTEGER NOT NULL DEFAULT 0,
        selling_price INTEGER NOT NULL DEFAULT 0,
        minimum_stock INTEGER DEFAULT 0,
        status TEXT DEFAULT 'ACTIVE',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES LFD_ProductCategories(id) ON DELETE SET NULL
      )
    `);

    // Dépôts
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_Warehouses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        location TEXT,
        status TEXT DEFAULT 'ACTIVE',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Mouvements de Stock
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_StockMovements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT UNIQUE NOT NULL,
        product_id INTEGER NOT NULL,
        warehouse_id INTEGER NOT NULL,
        movement_type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        source_type TEXT,
        source_id INTEGER,
        reason TEXT,
        created_by INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES LFD_Products(id),
        FOREIGN KEY (warehouse_id) REFERENCES LFD_Warehouses(id),
        FOREIGN KEY (created_by) REFERENCES LFD_Employees_New(id)
      )
    `);

    // Ventes
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_Sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_number TEXT UNIQUE NOT NULL,
        customer_id INTEGER NOT NULL,
        sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        subtotal INTEGER DEFAULT 0,
        discount INTEGER DEFAULT 0,
        total INTEGER DEFAULT 0,
        payment_type TEXT,
        status TEXT DEFAULT 'DRAFT',
        created_by INTEGER,
        validated_by INTEGER,
        validated_at DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES LFD_Customers(id),
        FOREIGN KEY (created_by) REFERENCES LFD_Employees_New(id),
        FOREIGN KEY (validated_by) REFERENCES LFD_Employees_New(id)
      )
    `);

    // Lignes de Ventes
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_SaleItems (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price INTEGER NOT NULL,
        discount INTEGER DEFAULT 0,
        line_total INTEGER NOT NULL,
        FOREIGN KEY (sale_id) REFERENCES LFD_Sales(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES LFD_Products(id)
      )
    `);

    // Audit Logs
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_AuditLogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER,
        old_value TEXT,
        new_value TEXT,
        reason TEXT,
        ip_address TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES LFD_Employees(id) ON DELETE SET NULL
      )
    `);

    // --- PHASE 3 : CAISSE & PAIEMENTS ---

    // Caisses
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_CashRegisters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        status TEXT DEFAULT 'ACTIVE',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sessions de Caisse
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_CashSessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cash_register_id INTEGER NOT NULL,
        cashier_id INTEGER NOT NULL,
        opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        opening_balance INTEGER DEFAULT 0,
        closed_at DATETIME,
        theoretical_balance INTEGER DEFAULT 0,
        physical_balance INTEGER DEFAULT 0,
        difference INTEGER DEFAULT 0,
        status TEXT DEFAULT 'OPEN',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cash_register_id) REFERENCES LFD_CashRegisters(id),
        FOREIGN KEY (cashier_id) REFERENCES LFD_Employees(id)
      )
    `);

    // Transactions de Caisse
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_CashTransactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cash_session_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        amount INTEGER NOT NULL,
        source_type TEXT,
        source_id INTEGER,
        description TEXT,
        created_by INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cash_session_id) REFERENCES LFD_CashSessions(id),
        FOREIGN KEY (created_by) REFERENCES LFD_Employees(id)
      )
    `);

    // Paiements
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_Payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payment_number TEXT UNIQUE NOT NULL,
        sale_id INTEGER NOT NULL,
        customer_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        payment_method TEXT NOT NULL,
        cash_session_id INTEGER,
        reference TEXT,
        received_by INTEGER NOT NULL,
        paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sale_id) REFERENCES LFD_Sales(id),
        FOREIGN KEY (customer_id) REFERENCES LFD_Customers(id),
        FOREIGN KEY (cash_session_id) REFERENCES LFD_CashSessions(id),
        FOREIGN KEY (received_by) REFERENCES LFD_Employees(id)
      )
    `);

    // Créances (Crédits Clients)
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_Receivables (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        sale_id INTEGER NOT NULL,
        original_amount INTEGER NOT NULL,
        paid_amount INTEGER DEFAULT 0,
        remaining_amount INTEGER NOT NULL,
        due_date DATETIME,
        status TEXT DEFAULT 'OPEN',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES LFD_Customers(id),
        FOREIGN KEY (sale_id) REFERENCES LFD_Sales(id)
      )
    `);

    // --- PHASE 4 : CONTROLE OPERATIONNEL ---

    // Ordres de Préparation
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_PreparationOrders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        preparation_number TEXT UNIQUE NOT NULL,
        sale_id INTEGER NOT NULL,
        warehouse_id INTEGER NOT NULL,
        status TEXT DEFAULT 'TO_PREPARE',
        assigned_to INTEGER,
        prepared_by INTEGER,
        checked_by INTEGER,
        prepared_at DATETIME,
        checked_at DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sale_id) REFERENCES LFD_Sales(id),
        FOREIGN KEY (warehouse_id) REFERENCES LFD_Warehouses(id),
        FOREIGN KEY (assigned_to) REFERENCES LFD_Employees(id),
        FOREIGN KEY (prepared_by) REFERENCES LFD_Employees(id),
        FOREIGN KEY (checked_by) REFERENCES LFD_Employees(id)
      )
    `);

    // Lignes de Préparation
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_PreparationItems (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        preparation_order_id INTEGER NOT NULL,
        sale_item_id INTEGER NOT NULL,
        quantity_to_prepare INTEGER NOT NULL,
        quantity_prepared INTEGER DEFAULT 0,
        FOREIGN KEY (preparation_order_id) REFERENCES LFD_PreparationOrders(id),
        FOREIGN KEY (sale_item_id) REFERENCES LFD_SaleItems(id)
      )
    `);

    // Bons de Sortie
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_StockReleases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        release_number TEXT UNIQUE NOT NULL,
        sale_id INTEGER NOT NULL,
        preparation_order_id INTEGER NOT NULL,
        warehouse_id INTEGER NOT NULL,
        prepared_by INTEGER NOT NULL,
        checked_by INTEGER NOT NULL,
        released_by INTEGER,
        status TEXT DEFAULT 'PENDING',
        released_at DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sale_id) REFERENCES LFD_Sales(id),
        FOREIGN KEY (preparation_order_id) REFERENCES LFD_PreparationOrders(id),
        FOREIGN KEY (warehouse_id) REFERENCES LFD_Warehouses(id),
        FOREIGN KEY (prepared_by) REFERENCES LFD_Employees(id),
        FOREIGN KEY (checked_by) REFERENCES LFD_Employees(id),
        FOREIGN KEY (released_by) REFERENCES LFD_Employees(id)
      )
    `);

    // Bons de Livraison
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_Deliveries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        delivery_number TEXT UNIQUE NOT NULL,
        sale_id INTEGER NOT NULL,
        stock_release_id INTEGER NOT NULL,
        delivery_agent_id INTEGER,
        recipient_name TEXT,
        recipient_phone TEXT,
        status TEXT DEFAULT 'READY',
        failed_reason TEXT,
        departure_at DATETIME,
        delivered_at DATETIME,
        created_by INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sale_id) REFERENCES LFD_Sales(id),
        FOREIGN KEY (stock_release_id) REFERENCES LFD_StockReleases(id),
        FOREIGN KEY (delivery_agent_id) REFERENCES LFD_Employees(id),
        FOREIGN KEY (created_by) REFERENCES LFD_Employees(id)
      )
    `);

    // Alertes
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_Alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        severity TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'NEW',
        resolved_by INTEGER,
        resolved_at DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (resolved_by) REFERENCES LFD_Employees(id)
      )
    `);

    // --- PHASE 5A : FOURNISSEURS ET ACHATS ---

    // Fournisseurs
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_Suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        supplier_code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        contact_name TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        tax_identifier TEXT,
        payment_terms_days INTEGER DEFAULT 0,
        credit_limit REAL DEFAULT 0,
        status TEXT DEFAULT 'ACTIVE',
        created_by INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES LFD_Employees(id)
      )
    `);

    // Commandes d'Achat (PO)
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_PurchaseOrders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        po_number TEXT UNIQUE NOT NULL,
        supplier_id INTEGER NOT NULL,
        order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        expected_date DATETIME,
        subtotal INTEGER DEFAULT 0,
        discount INTEGER DEFAULT 0,
        total INTEGER DEFAULT 0,
        status TEXT DEFAULT 'DRAFT',
        created_by INTEGER NOT NULL,
        approved_by INTEGER,
        approved_at DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES LFD_Suppliers(id),
        FOREIGN KEY (created_by) REFERENCES LFD_Employees(id),
        FOREIGN KEY (approved_by) REFERENCES LFD_Employees(id)
      )
    `);

    // Lignes de Commande d'Achat
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_PurchaseOrderItems (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        purchase_order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_cost INTEGER NOT NULL,
        discount INTEGER DEFAULT 0,
        line_total INTEGER NOT NULL,
        FOREIGN KEY (purchase_order_id) REFERENCES LFD_PurchaseOrders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES LFD_Products(id)
      )
    `);

    // Réceptions Fournisseurs (Goods Receipts)
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_GoodsReceipts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        receipt_number TEXT UNIQUE NOT NULL,
        purchase_order_id INTEGER NOT NULL,
        supplier_id INTEGER NOT NULL,
        warehouse_id INTEGER NOT NULL,
        receipt_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        received_by INTEGER NOT NULL,
        status TEXT DEFAULT 'RECEIVED',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (purchase_order_id) REFERENCES LFD_PurchaseOrders(id),
        FOREIGN KEY (supplier_id) REFERENCES LFD_Suppliers(id),
        FOREIGN KEY (warehouse_id) REFERENCES LFD_Warehouses(id),
        FOREIGN KEY (received_by) REFERENCES LFD_Employees(id)
      )
    `);

    // Lignes de Réception
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_GoodsReceiptItems (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        goods_receipt_id INTEGER NOT NULL,
        purchase_order_item_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity_received INTEGER NOT NULL,
        unit_cost INTEGER NOT NULL,
        FOREIGN KEY (goods_receipt_id) REFERENCES LFD_GoodsReceipts(id) ON DELETE CASCADE,
        FOREIGN KEY (purchase_order_item_id) REFERENCES LFD_PurchaseOrderItems(id),
        FOREIGN KEY (product_id) REFERENCES LFD_Products(id)
      )
    `);

    // Factures Fournisseurs
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_SupplierInvoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        supplier_invoice_number TEXT NOT NULL,
        supplier_reference TEXT,
        supplier_id INTEGER NOT NULL,
        purchase_order_id INTEGER,
        invoice_date DATETIME,
        due_date DATETIME,
        subtotal INTEGER DEFAULT 0,
        discount INTEGER DEFAULT 0,
        total INTEGER DEFAULT 0,
        paid_amount INTEGER DEFAULT 0,
        remaining_amount INTEGER DEFAULT 0,
        status TEXT DEFAULT 'DRAFT',
        created_by INTEGER NOT NULL,
        validated_by INTEGER,
        validated_at DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES LFD_Suppliers(id),
        FOREIGN KEY (purchase_order_id) REFERENCES LFD_PurchaseOrders(id),
        FOREIGN KEY (created_by) REFERENCES LFD_Employees(id),
        FOREIGN KEY (validated_by) REFERENCES LFD_Employees(id)
      )
    `);
    // Index pour éviter les doublons accidentels de factures (supplier_id + supplier_reference)
    await runSql(`CREATE UNIQUE INDEX IF NOT EXISTS idx_supplier_invoice_ref ON LFD_SupplierInvoices(supplier_id, supplier_reference) WHERE supplier_reference IS NOT NULL AND supplier_reference != ''`);

    // Dettes Fournisseurs
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_Payables (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        supplier_id INTEGER NOT NULL,
        supplier_invoice_id INTEGER NOT NULL,
        original_amount INTEGER NOT NULL,
        paid_amount INTEGER DEFAULT 0,
        remaining_amount INTEGER NOT NULL,
        due_date DATETIME,
        status TEXT DEFAULT 'OPEN',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES LFD_Suppliers(id),
        FOREIGN KEY (supplier_invoice_id) REFERENCES LFD_SupplierInvoices(id)
      )
    `);

    // Paiements Fournisseurs
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_SupplierPayments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payment_number TEXT UNIQUE NOT NULL,
        supplier_id INTEGER NOT NULL,
        supplier_invoice_id INTEGER,
        payable_id INTEGER,
        amount INTEGER NOT NULL,
        payment_method TEXT NOT NULL,
        cash_session_id INTEGER,
        reference TEXT,
        paid_by INTEGER NOT NULL,
        approved_by INTEGER,
        paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES LFD_Suppliers(id),
        FOREIGN KEY (supplier_invoice_id) REFERENCES LFD_SupplierInvoices(id),
        FOREIGN KEY (payable_id) REFERENCES LFD_Payables(id),
        FOREIGN KEY (cash_session_id) REFERENCES LFD_CashSessions(id),
        FOREIGN KEY (paid_by) REFERENCES LFD_Employees(id),
        FOREIGN KEY (approved_by) REFERENCES LFD_Employees(id)
      )
    `);

    // --- PHASE 6 : DEPOTS BANCAIRES ET CONTROLE ---
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_BankDeposits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT UNIQUE NOT NULL,
        bank_name TEXT NOT NULL,
        deposit_date DATETIME NOT NULL,
        amount INTEGER NOT NULL,
        cash_session_id INTEGER,
        slip_reference TEXT,
        observation TEXT,
        status TEXT DEFAULT 'PENDING',
        declared_by INTEGER NOT NULL,
        confirmed_by INTEGER,
        confirmed_at DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cash_session_id) REFERENCES LFD_CashSessions(id),
        FOREIGN KEY (declared_by) REFERENCES LFD_Employees(id),
        FOREIGN KEY (confirmed_by) REFERENCES LFD_Employees(id)
      )
    `);

    // --- PHASE 5B : COMPTABILITÉ ET PARAMÈTRES ---

    // Paramètres Globaux
    await runSql(`
      CREATE TABLE IF NOT EXISTS LFD_Settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        description TEXT,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insérer les paramètres par défaut
    await runSql(`INSERT OR IGNORE INTO LFD_Settings (key, value, description) VALUES (?, ?, ?)`, 
      ['ACCOUNTING_CUTOVER_DATE', '2026-01-01', 'Date à partir de laquelle les écritures comptables sont générées automatiquement']
    );
    await runSql(`INSERT OR IGNORE INTO LFD_Settings (key, value, description) VALUES (?, ?, ?)`, 
      ['AUTO_ENTRY_STATUS', 'DRAFT', 'Statut par défaut des écritures générées automatiquement (DRAFT ou POSTED)']
    );

    // Mappings Comptables par défaut (à faire valider par le comptable)
    // On suppose que les comptes 531 (Caisse), 411 (Clients), 701 (Ventes), 601 (Achats), 401 (Fournisseurs) existent.
    const defaultMappings = [
      { event_type: 'SALE_CASH', debit: '531', credit: '701', desc: 'Vente Comptant (Caisse -> Ventes)' },
      { event_type: 'SALE_CREDIT', debit: '411', credit: '701', desc: 'Vente à Crédit (Créance -> Ventes)' },
      { event_type: 'CUSTOMER_PAYMENT', debit: '531', credit: '411', desc: 'Encaissement Client (Caisse -> Créance)' },
      { event_type: 'SUPPLIER_INVOICE', debit: '601', credit: '401', desc: 'Facture Fournisseur (Achat -> Dette)' },
      { event_type: 'SUPPLIER_PAYMENT', debit: '401', credit: '531', desc: 'Paiement Fournisseur (Dette -> Caisse)' },
      { event_type: 'CASH_EXPENSE', debit: '601', credit: '531', desc: 'Dépense de Caisse (Charge -> Caisse)' }, // A affiner
      { event_type: 'CASH_ADJUSTMENT', debit: '531', credit: '701', desc: 'Ajustement Caisse (Caisse -> Produit divers)' } // A affiner
    ];

    for (const mapping of defaultMappings) {
      const debitAcc = await getSql('SELECT id FROM LFD_Accounts WHERE account_number = ?', [mapping.debit]);
      const creditAcc = await getSql('SELECT id FROM LFD_Accounts WHERE account_number = ?', [mapping.credit]);
      
      if (debitAcc && creditAcc) {
        await runSql(`
          INSERT OR IGNORE INTO LFD_AccountingMappings 
          (event_type, debit_account_id, credit_account_id, description) 
          VALUES (?, ?, ?, ?)
        `, [mapping.event_type, debitAcc.id, creditAcc.id, mapping.desc]);
      }
    }
    const roles = [
      { code: 'SUPER_ADMIN', name: 'Super Administrateur' },
      { code: 'DIRECTOR', name: 'Directeur' },
      { code: 'MANAGER', name: 'Manager' },
      { code: 'CASHIER', name: 'Caissier' },
      { code: 'ACCOUNTANT', name: 'Comptable' },
      { code: 'BILLING_AGENT', name: 'Agent de Facturation' },
      { code: 'WAREHOUSE_AGENT', name: 'Magasinier' },
      { code: 'SALES_AGENT', name: 'Commercial' },
      { code: 'DELIVERY_AGENT', name: 'Livreur' }
    ];

    for (const r of roles) {
      await runSql(`INSERT OR IGNORE INTO LFD_Roles (code, name) VALUES (?, ?)`, [r.code, r.name]);
    }

    const permissions = [
      { code: 'customer.read', module: 'customer', action: 'read' },
      { code: 'customer.create', module: 'customer', action: 'create' },
      { code: 'customer.update', module: 'customer', action: 'update' },
      { code: 'product.read', module: 'product', action: 'read' },
      { code: 'product.create', module: 'product', action: 'create' },
      { code: 'product.update', module: 'product', action: 'update' },
      { code: 'stock.read', module: 'stock', action: 'read' },
      { code: 'stock.entry', module: 'stock', action: 'entry' },
      { code: 'stock.exit', module: 'stock', action: 'exit' },
      { code: 'stock.adjust', module: 'stock', action: 'adjust' },
      { code: 'sale.read', module: 'sale', action: 'read' },
      { code: 'sale.create', module: 'sale', action: 'create' },
      { code: 'sale.validate', module: 'sale', action: 'validate' },
      { code: 'sale.cancel', module: 'sale', action: 'cancel' },
      { code: 'invoice.read', module: 'invoice', action: 'read' },
      { code: 'invoice.create', module: 'invoice', action: 'create' },
      { code: 'invoice.print', module: 'invoice', action: 'print' },
      { code: 'invoice.cancel', module: 'invoice', action: 'cancel' },
      { code: 'cash.read', module: 'cash', action: 'read' },
      { code: 'cash.open', module: 'cash', action: 'open' },
      { code: 'cash.collect', module: 'cash', action: 'collect' },
      { code: 'cash.expense', module: 'cash', action: 'expense' },
      { code: 'cash.close', module: 'cash', action: 'close' },
      { code: 'cash.adjust', module: 'cash', action: 'adjust' },
      { code: 'payment.read', module: 'payment', action: 'read' },
      { code: 'payment.create', module: 'payment', action: 'create' },
      { code: 'credit.read', module: 'credit', action: 'read' },
      { code: 'credit.create', module: 'credit', action: 'create' },
      { code: 'credit.approve', module: 'credit', action: 'approve' },
      { code: 'credit.payment', module: 'credit', action: 'payment' },
      // Nouvelles permissions Phase 4
      { code: 'preparation.read', module: 'preparation', action: 'read' },
      { code: 'preparation.start', module: 'preparation', action: 'start' },
      { code: 'preparation.complete', module: 'preparation', action: 'complete' },
      { code: 'preparation.check', module: 'preparation', action: 'check' },
      { code: 'stock_release.read', module: 'stock_release', action: 'read' },
      { code: 'stock_release.create', module: 'stock_release', action: 'create' },
      { code: 'stock_release.validate', module: 'stock_release', action: 'validate' },
      { code: 'delivery.read', module: 'delivery', action: 'read' },
      { code: 'delivery.assign', module: 'delivery', action: 'assign' },
      { code: 'delivery.start', module: 'delivery', action: 'start' },
      { code: 'delivery.complete', module: 'delivery', action: 'complete' },
      { code: 'delivery.fail', module: 'delivery', action: 'fail' },
      { code: 'delivery.return', module: 'delivery', action: 'return' },
      { code: 'alert.read', module: 'alert', action: 'read' },
      { code: 'alert.resolve', module: 'alert', action: 'resolve' },
      { code: 'operational_control.read', module: 'operational_control', action: 'read' },
      
      // Nouvelles permissions Phase 5A
      { code: 'supplier.read', module: 'supplier', action: 'read' },
      { code: 'supplier.create', module: 'supplier', action: 'create' },
      { code: 'supplier.update', module: 'supplier', action: 'update' },
      { code: 'purchase.read', module: 'purchase', action: 'read' },
      { code: 'purchase.create', module: 'purchase', action: 'create' },
      { code: 'purchase.approve', module: 'purchase', action: 'approve' },
      { code: 'purchase.cancel', module: 'purchase', action: 'cancel' },
      { code: 'receipt.read', module: 'receipt', action: 'read' },
      { code: 'receipt.create', module: 'receipt', action: 'create' },
      { code: 'receipt.validate', module: 'receipt', action: 'validate' },
      { code: 'supplier_invoice.read', module: 'supplier_invoice', action: 'read' },
      { code: 'supplier_invoice.create', module: 'supplier_invoice', action: 'create' },
      { code: 'supplier_invoice.validate', module: 'supplier_invoice', action: 'validate' },
      { code: 'payable.read', module: 'payable', action: 'read' },
      { code: 'supplier_payment.read', module: 'supplier_payment', action: 'read' },
      { code: 'supplier_payment.create', module: 'supplier_payment', action: 'create' },
      { code: 'supplier_payment.approve', module: 'supplier_payment', action: 'approve' },
      
      // Nouvelles permissions Phase 6
      { code: 'bank.deposit.read', module: 'bank_deposit', action: 'read' },
      { code: 'bank.deposit.declare', module: 'bank_deposit', action: 'declare' },
      { code: 'bank.deposit.verify', module: 'bank_deposit', action: 'verify' },
      { code: 'audit.read', module: 'audit', action: 'read' },
      { code: 'direction.read', module: 'direction', action: 'read' },
      { code: 'settings.manage', module: 'settings', action: 'manage' }
    ];

    for (const p of permissions) {
      await runSql(`INSERT OR IGNORE INTO LFD_Permissions (code, module, action) VALUES (?, ?, ?)`, [p.code, p.module, p.action]);
    }

    // Mapping basique des permissions aux rles (exemple)
    const assignPermissions = async (roleCode, permCodes) => {
      const role = await getSql(`SELECT id FROM LFD_Roles WHERE code = ?`, [roleCode]);
      if (!role) return;
      for (const pCode of permCodes) {
        const perm = await getSql(`SELECT id FROM LFD_Permissions WHERE code = ?`, [pCode]);
        if (perm) {
          await runSql(`INSERT OR IGNORE INTO LFD_RolePermissions (role_id, permission_id) VALUES (?, ?)`, [role.id, perm.id]);
        }
      }
    };

    // Attribution globale (Super Admin a tout)
    const allPerms = permissions.map(p => p.code);
    await assignPermissions('SUPER_ADMIN', allPerms);
    await assignPermissions('DIRECTOR', allPerms);
    await assignPermissions('MANAGER', ['bank.deposit.read', 'bank.deposit.declare', 'bank.deposit.verify', 'cash.read', 'alert.read', 'alert.resolve', 'direction.read', 'audit.read']);
    await assignPermissions('CASHIER', ['cash.read', 'cash.open', 'cash.collect', 'cash.close', 'payment.create', 'sale.read', 'bank.deposit.read', 'bank.deposit.declare']);
    await assignPermissions('BILLING_AGENT', ['sale.read', 'sale.create', 'sale.validate', 'invoice.read', 'invoice.create', 'invoice.print', 'customer.read', 'product.read']);
    await assignPermissions('WAREHOUSE_AGENT', ['stock.read', 'stock.entry', 'stock.exit', 'preparation.read', 'preparation.start', 'preparation.complete', 'preparation.check', 'stock_release.read', 'stock_release.create', 'stock_release.validate', 'delivery.return', 'receipt.read', 'receipt.create', 'receipt.validate']);
    await assignPermissions('SALES_AGENT', ['customer.read', 'customer.create', 'product.read', 'sale.create', 'sale.read']);
    await assignPermissions('DELIVERY_AGENT', ['delivery.read', 'delivery.start', 'delivery.complete', 'delivery.fail']);

    // --- MIGRATION DES EMPLOYÉS TERMINÉE ---
    // Les migrations étaient ici et ont été retirées car elles tournaient en boucle.

    // Injecter un employé par défaut si la table est vide (ex: sur une nouvelle base Vercel/Turso)
    const empCount = await getSql(`SELECT COUNT(*) as count FROM LFD_Employees`);
    if (empCount && empCount.count === 0) {
      const superAdminRole = await getSql(`SELECT id FROM LFD_Roles WHERE code = 'SUPER_ADMIN'`);
      if (superAdminRole) {
        const hashedAdminPass = await bcrypt.hash('admin123', 10);
        await runSql(`
          INSERT INTO LFD_Employees (employee_code, firstName, lastName, email, phone, password_hash, role_id, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, ['EMP-001', 'Admin', 'LFD', 'admin@formationnova.com', '+22901000000', hashedAdminPass, superAdminRole.id, 'ACTIVE']);
        console.log('[LFD DB] Employé Admin par défaut injecté.');
      }
    }

    // Création du dépôt par défaut s'il n'existe pas
    await runSql(`INSERT OR IGNORE INTO LFD_Warehouses (code, name, location) VALUES (?, ?, ?)`, ['DEP-01', 'Dépôt Principal', 'Siège']);

    // Création de la caisse par défaut s'il n'existe pas
    await runSql(`INSERT OR IGNORE INTO LFD_CashRegisters (code, name) VALUES (?, ?)`, ['CAISSE-01', 'Caisse Principale']);

    // --- MIGRATION PHASE 3 VERS PHASE 4 ---
    // Les ventes passées de Phase 3 sont en statut PAID ou VALIDATED mais n'ont pas d'ordres de préparation
    // Pour éviter de bloquer le magasinier, on les passe en statut 'DELIVERED'.
    const legacySales = await allSql(`SELECT id, status FROM LFD_Sales WHERE status IN ('PAID', 'VALIDATED')`);
    for (const sale of legacySales) {
      await runSql(`UPDATE LFD_Sales SET status = 'DELIVERED' WHERE id = ?`, [sale.id]);
    }

    console.log('[LFD DB] Initialisation Phase 5A terminée avec succès (Tables + Permissions + Migration).');

  } catch (error) {
    console.error('[LFD DB] Erreur lors de l\'initialisation Phase 4:', error);
  }
}

module.exports = {
  db,
  runSql,
  getSql,
  allSql
};
