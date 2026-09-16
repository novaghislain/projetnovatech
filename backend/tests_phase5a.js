const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();

const API_URL = 'http://localhost:5001/api/lfd';
const db = new sqlite3.Database('./lfd_database.sqlite');

const getSql = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err); else resolve(row);
    });
  });
};

const runSql = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err); else resolve(this);
    });
  });
};

const accounts = {
  director: { email: 'test_director@lafoidistr.com', password: 'password123' },
  warehouse: { email: 'test_warehouse1@lafoidistr.com', password: 'password123' },
  cashier: { email: 'test_cashier@lafoidistr.com', password: 'password123' },
  billing: { email: 'test_billing@lafoidistr.com', password: 'password123' } // Pour test RBAC
};

let tokens = {};

async function runTests() {
  console.log("==================================================");
  console.log(" DÉMARRAGE RECETTE PHASE 5A - ACHATS & FOURNISSEURS ");
  console.log("==================================================\n");

  try {
    console.log("[1] Authentification...");
    for (const [role, creds] of Object.entries(accounts)) {
      const res = await axios.post(`${API_URL}/auth/login`, creds);
      tokens[role] = res.data.token;
    }
    console.log(" ✅ Authentifiés.");

    console.log("\n[2] Préparation des données de base...");
    const p1 = await getSql(`SELECT id, purchase_price FROM LFD_Products WHERE product_code = 'PROD-A'`);
    if (!p1) throw new Error("Produit PROD-A manquant");
    const warehouse = await getSql(`SELECT id FROM LFD_Warehouses LIMIT 1`);

    // --- TEST A : CYCLE COMPLET ACHAT ---
    console.log("\n--- TEST A : CYCLE COMPLET ACHAT ---");
    
    // 1. Créer Fournisseur
    const suppData = { supplier_code: `F-${Date.now()}`, name: "Fournisseur Test A" };
    const suppRes = await axios.post(`${API_URL}/suppliers`, suppData, { headers: { Authorization: `Bearer ${tokens.director}` } });
    const supplierId = suppRes.data.id;
    console.log(` ✅ Fournisseur créé: ${supplierId}`);

    // 2. Créer Commande (PO)
    const poData = {
      supplier_id: supplierId,
      items: [ { product_id: p1.id, quantity: 1000, unit_cost: 1000 } ]
    };
    const poRes = await axios.post(`${API_URL}/purchases`, poData, { headers: { Authorization: `Bearer ${tokens.director}` } });
    const poId = poRes.data.id;
    console.log(` ✅ Commande DRAFT créée: ${poId}`);

    // 3. Approuver Commande
    await axios.post(`${API_URL}/purchases/${poId}/approve`, {}, { headers: { Authorization: `Bearer ${tokens.director}` } });
    console.log(` ✅ Commande approuvée.`);

    // 4. Réception (TEST B : Partielle)
    console.log("\n--- TEST B & C : RÉCEPTION PARTIELLE ET SUR-RÉCEPTION ---");
    const poFull = await axios.get(`${API_URL}/purchases/${poId}`, { headers: { Authorization: `Bearer ${tokens.director}` } });
    const poItemId = poFull.data.items[0].id;

    // Test C : Sur-réception
    try {
      await axios.post(`${API_URL}/receipts`, {
        purchase_order_id: poId,
        warehouse_id: warehouse.id,
        items: [ { purchase_order_item_id: poItemId, quantity_received: 1050 } ]
      }, { headers: { Authorization: `Bearer ${tokens.warehouse}` } });
      console.error(" ❌ ERREUR: Sur-réception acceptée !");
    } catch(e) {
      if(e.response?.status === 400) console.log(" ✅ Sur-réception refusée correctement.");
    }

    // Réception partielle 600
    const recRes1 = await axios.post(`${API_URL}/receipts`, {
      purchase_order_id: poId,
      warehouse_id: warehouse.id,
      items: [ { purchase_order_item_id: poItemId, quantity_received: 600 } ]
    }, { headers: { Authorization: `Bearer ${tokens.warehouse}` } });
    console.log(` ✅ Réception partielle (600) effectuée: ${recRes1.data.receipt_number}`);
    
    // Vérification stock
    const mvt = await getSql(`SELECT quantity FROM LFD_StockMovements WHERE movement_type = 'ENTRY' AND source_type = 'GOODS_RECEIPT' ORDER BY id DESC LIMIT 1`);
    if(mvt.quantity === 600) console.log(" ✅ Stock incrémenté de 600.");

    // Seconde réception 400 (TEST B suite)
    const recRes2 = await axios.post(`${API_URL}/receipts`, {
      purchase_order_id: poId,
      warehouse_id: warehouse.id,
      items: [ { purchase_order_item_id: poItemId, quantity_received: 400 } ]
    }, { headers: { Authorization: `Bearer ${tokens.warehouse}` } });
    console.log(` ✅ Seconde réception (400) effectuée.`);

    // --- TEST D : FACTURE ET DOUBLONS ---
    console.log("\n--- TEST D : FACTURE FOURNISSEUR ---");
    const invData = {
      supplier_id: supplierId,
      supplier_reference: "FACT-12345",
      purchase_order_id: poId,
      subtotal: 1000000
    };
    const invRes = await axios.post(`${API_URL}/supplier-invoices`, invData, { headers: { Authorization: `Bearer ${tokens.director}` } });
    const invId = invRes.data.id;
    console.log(` ✅ Facture fournisseur créée (DRAFT): ID ${invId}`);

    // Doublon
    try {
      await axios.post(`${API_URL}/supplier-invoices`, invData, { headers: { Authorization: `Bearer ${tokens.director}` } });
      console.error(" ❌ ERREUR: Doublon de facture accepté !");
    } catch(e) {
      if(e.response?.status === 400) console.log(" ✅ Doublon de facture refusé correctement.");
    }

    // Validation facture (Génère la dette)
    await axios.post(`${API_URL}/supplier-invoices/${invId}/validate`, {}, { headers: { Authorization: `Bearer ${tokens.director}` } });
    console.log(` ✅ Facture validée, dette générée.`);

    // --- TEST E & F : PAIEMENT PARTIEL ET SURPAIEMENT ---
    console.log("\n--- TEST E & F : PAIEMENT FOURNISSEUR ---");
    const payable = await getSql(`SELECT id, remaining_amount FROM LFD_Payables WHERE supplier_invoice_id = ?`, [invId]);
    
    // Ouvert par DIRECTOR
    let cashSessionId = null;
    try {
      await axios.post(`${API_URL}/cash/open`, { cash_register_id: 1, opening_balance: 1000000 }, { headers: { Authorization: `Bearer ${tokens.director}` } });
    } catch(e) {}
    const s = await axios.get(`${API_URL}/cash/session`, { headers: { Authorization: `Bearer ${tokens.director}` } });
    cashSessionId = s.data.session.id;

    // Paiement partiel
    await axios.post(`${API_URL}/payables/${payable.id}/pay`, {
      amount: 400000,
      payment_method: 'CASH',
      cash_session_id: cashSessionId
    }, { headers: { Authorization: `Bearer ${tokens.director}` } });
    console.log(` ✅ Paiement partiel de 400 000 FCFA effectué.`);

    // Surpaiement
    try {
      await axios.post(`${API_URL}/payables/${payable.id}/pay`, {
        amount: 800000, // Il reste 600000
        payment_method: 'CASH',
        cash_session_id: cashSessionId
      }, { headers: { Authorization: `Bearer ${tokens.director}` } });
      console.error(" ❌ ERREUR: Surpaiement accepté !");
    } catch(e) {
      if(e.response?.status === 400) console.log(" ✅ Surpaiement refusé correctement.");
    }

    // --- TEST H : RBAC ---
    console.log("\n--- TEST H : BYPASS RBAC ---");
    try {
      await axios.post(`${API_URL}/purchases`, poData, { headers: { Authorization: `Bearer ${tokens.warehouse}` } });
      console.error(" ❌ ERREUR: Magasinier a pu créer une commande d'achat !");
    } catch(e) {
      if(e.response?.status === 403) console.log(" ✅ Magasinier rejeté (403).");
    }

    console.log("\nTests Phase 5A terminés avec succès.");

  } catch(err) {
    console.error("CRASH DU SCRIPT DE TEST:", err.response?.data || err.message);
  } finally {
    db.close();
  }
}

runTests();
