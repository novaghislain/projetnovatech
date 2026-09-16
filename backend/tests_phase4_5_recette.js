const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const API_URL = 'http://localhost:5001/api/lfd';
const dbPath = path.join(__dirname, 'lfd_database.sqlite');
const db = new sqlite3.Database(dbPath);

const getSql = (query, params = []) => new Promise((resolve, reject) => db.get(query, params, (err, row) => err ? reject(err) : resolve(row)));
const runSql = (query, params = []) => new Promise((resolve, reject) => db.run(query, params, function(err) { err ? reject(err) : resolve(this) }));

let tokens = {};

async function authenticate(email, password = 'password123') {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    return res.data.token;
  } catch (err) {
    console.error(`Erreur auth pour ${email}:`, err.response?.data || err.message);
    throw err;
  }
}

async function startTests() {
  console.log("==================================================");
  console.log(" DÉMARRAGE RECETTE PHASE 4.5 ");
  console.log("==================================================");

  // 1. Authentification
  console.log("[1] Authentification des comptes de test...");
  tokens.director = await authenticate('test_director@lafoidistr.com');
  tokens.billing = await authenticate('test_billing@lafoidistr.com');
  tokens.cashier = await authenticate('test_cashier@lafoidistr.com');
  tokens.warehouse1 = await authenticate('test_warehouse1@lafoidistr.com');
  tokens.warehouse2 = await authenticate('test_warehouse2@lafoidistr.com');
  tokens.delivery = await authenticate('test_delivery@lafoidistr.com');
  tokens.accountant = await authenticate('test_accountant@lafoidistr.com');
  console.log(" ✅ Tous les comptes authentifiés avec succès.");

  // Préparation des données (Client + Produits)
  console.log("[2] Préparation des données de base...");
  let clientRes = await getSql(`SELECT id FROM LFD_Customers WHERE status = 'ACTIVE' LIMIT 1`);
  if (!clientRes) {
    await runSql(`INSERT INTO LFD_Customers (customer_code, name, phone, status, credit_allowed, credit_limit) VALUES ('CLI-RECETTE', 'Client Recette', '00000', 'ACTIVE', 1, 10000000)`);
    clientRes = await getSql(`SELECT id FROM LFD_Customers WHERE status = 'ACTIVE' LIMIT 1`);
  } else {
    await runSql(`UPDATE LFD_Customers SET credit_allowed = 1, credit_limit = 10000000 WHERE id = ?`, [clientRes.id]);
  }
  const clientId = clientRes.id;

  // Créer/Vérifier 3 produits pour le Test 4
  const products = [
    { code: 'PROD-A', name: 'Produit A', pp: 1000, sp: 2000 },
    { code: 'PROD-B', name: 'Produit B', pp: 500, sp: 1500 },
    { code: 'PROD-C', name: 'Produit C', pp: 200, sp: 500 }
  ];
  let pIds = {};
  for (const p of products) {
    let pr = await getSql(`SELECT id FROM LFD_Products WHERE product_code = ?`, [p.code]);
    if (!pr) {
      await runSql(`INSERT INTO LFD_Products (category_id, product_code, name, purchase_price, selling_price, status) VALUES (1, ?, ?, ?, ?, 'ACTIVE')`, [p.code, p.name, p.pp, p.sp]);
      pr = await getSql(`SELECT id FROM LFD_Products WHERE product_code = ?`, [p.code]);
    }
    pIds[p.code] = pr.id;
    // Injecter du stock pour être sûr
    await runSql(`INSERT INTO LFD_StockMovements (reference, product_id, warehouse_id, movement_type, quantity, reason, created_by) VALUES (?, ?, 1, 'ENTRY', 1000, 'INITIAL RECETTE', 1)`, [`IN-RECETTE-${Date.now()}-${p.code}`, pr.id]);
  }
  console.log(" ✅ Produits et stock initialisés.");

  // Ouvrir caisse pour BILLING
  console.log("[3] Ouverture de la caisse pour BILLING...");
  let cashSessionId = null;
  try {
    await axios.post(`${API_URL}/cash/open`, { cash_register_id: 1, opening_balance: 100000 }, { headers: { Authorization: `Bearer ${tokens.billing}` } });
    const sessionRes = await axios.get(`${API_URL}/cash/session`, { headers: { Authorization: `Bearer ${tokens.billing}` } });
    cashSessionId = sessionRes.data.session.id;
    console.log(` ✅ Caisse ouverte: ID ${cashSessionId}`);
  } catch (err) {
    if (err.response?.status === 400 && err.response?.data?.error?.includes('déjà une session')) {
       const sessionRes = await axios.get(`${API_URL}/cash/session`, { headers: { Authorization: `Bearer ${tokens.billing}` } });
       cashSessionId = sessionRes.data.session.id;
       console.log(` ✅ Caisse déjà ouverte: ID ${cashSessionId}`);
    } else {
       console.error("Erreur d'ouverture de caisse:", err.response?.data || err.message);
    }
  }

  // Test 4 : Vente à Crédit complète pour séparer la facturation de la caisse
  console.log("\n--- TEST 4 : VENTE À CRÉDIT (Facturation puis Caisse) ---");
  let saleId = null;
  try {
    const saleData = {
      customer_id: clientId,
      payment_type: 'CREDIT',
      items: [
        { product_id: pIds['PROD-A'], quantity: 10, unit_price: 2000 },
        { product_id: pIds['PROD-B'], quantity: 5, unit_price: 1500 },
        { product_id: pIds['PROD-C'], quantity: 20, unit_price: 500 }
      ]
    };

    // Création
    const saleCreateRes = await axios.post(`${API_URL}/sales`, saleData, { headers: { Authorization: `Bearer ${tokens.billing}` } });
    saleId = saleCreateRes.data.id;
    console.log(` ✅ Facture Brouillon créée: ID ${saleId}`);

    // Validation -> Réservation -> Création Ordre Préparation
    await axios.post(`${API_URL}/sales/${saleId}/validate`, { warehouse_id: 1 }, { headers: { Authorization: `Bearer ${tokens.billing}` } });
    console.log(` ✅ Facture validée. Réservation stock effectuée.`);

    // Check preparation order
    const prepOrder = await getSql(`SELECT id FROM LFD_PreparationOrders WHERE sale_id = ?`, [saleId]);
    if (!prepOrder) throw new Error("Ordre de préparation introuvable");
    const prepId = prepOrder.id;

    // Magasinier 1 : Préparation
    await axios.post(`${API_URL}/ops/preparations/${prepId}/start`, {}, { headers: { Authorization: `Bearer ${tokens.warehouse1}` } });
    const prepDetails = await axios.get(`${API_URL}/ops/preparations/${prepId}`, { headers: { Authorization: `Bearer ${tokens.warehouse1}` } });
    
    const preparedItems = prepDetails.data.items.map(i => ({ id: i.id, quantity_prepared: i.quantity_to_prepare }));
    await axios.post(`${API_URL}/ops/preparations/${prepId}/complete`, { prepared_items: preparedItems }, { headers: { Authorization: `Bearer ${tokens.warehouse1}` } });
    console.log(` ✅ Magasinier 1 a terminé la préparation.`);

    // Magasinier 2 : Sortie
    await axios.post(`${API_URL}/ops/preparations/${prepId}/release`, {}, { headers: { Authorization: `Bearer ${tokens.warehouse2}` } });
    console.log(` ✅ Magasinier 2 a validé la sortie. Bon de livraison généré.`);

    // Livreur : Livraison
    const delivery = await getSql(`SELECT id FROM LFD_Deliveries WHERE sale_id = ?`, [saleId]);
    await axios.post(`${API_URL}/ops/deliveries/${delivery.id}/start`, {}, { headers: { Authorization: `Bearer ${tokens.delivery}` } });
    await axios.post(`${API_URL}/ops/deliveries/${delivery.id}/complete`, { recipient_name: "Test Client" }, { headers: { Authorization: `Bearer ${tokens.delivery}` } });
    console.log(` ✅ Livreur a livré.`);
    
  } catch (err) {
    console.error("Erreur Test 4:", err.response?.data || err.message);
  }

  // Test 7 : Auto-contrôle
  console.log("\n--- TEST 7 : AUTO-CONTRÔLE ---");
  try {
    const saleData = { customer_id: clientId, payment_type: 'CREDIT', items: [{ product_id: pIds['PROD-A'], quantity: 1, unit_price: 2000 }] };
    const saleRes = await axios.post(`${API_URL}/sales`, saleData, { headers: { Authorization: `Bearer ${tokens.billing}` } });
    await axios.post(`${API_URL}/sales/${saleRes.data.id}/validate`, { warehouse_id: 1 }, { headers: { Authorization: `Bearer ${tokens.billing}` } });
    const prepOrder = await getSql(`SELECT id FROM LFD_PreparationOrders WHERE sale_id = ?`, [saleRes.data.id]);
    
    await axios.post(`${API_URL}/ops/preparations/${prepOrder.id}/start`, {}, { headers: { Authorization: `Bearer ${tokens.warehouse1}` } });
    const pD = await axios.get(`${API_URL}/ops/preparations/${prepOrder.id}`, { headers: { Authorization: `Bearer ${tokens.warehouse1}` } });
    await axios.post(`${API_URL}/ops/preparations/${prepOrder.id}/complete`, { prepared_items: pD.data.items.map(i => ({ id: i.id, quantity_prepared: i.quantity_to_prepare })) }, { headers: { Authorization: `Bearer ${tokens.warehouse1}` } });
    
    try {
      await axios.post(`${API_URL}/ops/preparations/${prepOrder.id}/release`, {}, { headers: { Authorization: `Bearer ${tokens.warehouse1}` } });
      console.error(" ❌ Échec: Le Magasinier 1 a pu s'auto-contrôler !");
    } catch(e) {
      if (e.response?.status === 400 && e.response?.data?.error?.includes('propre préparation')) {
        console.log(" ✅ Rejet réussi de l'auto-contrôle par Magasinier 1.");
      } else {
        throw e;
      }
    }

    // Magasinier 2 doit réussir
    await axios.post(`${API_URL}/ops/preparations/${prepOrder.id}/release`, {}, { headers: { Authorization: `Bearer ${tokens.warehouse2}` } });
    console.log(" ✅ Validation réussie par Magasinier 2.");

  } catch(err) {
    console.error("Erreur Test 7:", err.response?.data || err.message);
  }

  // Test 8 : Bypass RBAC
  console.log("\n--- TEST 8 : BYPASS RBAC ---");
  try {
    let failed = false;
    try {
      await axios.post(`${API_URL}/sales`, { customer_id: clientId, sale_type: 'CASH', items: [] }, { headers: { Authorization: `Bearer ${tokens.warehouse1}` } });
      failed = true;
    } catch(e) {
      if (e.response?.status === 403) console.log(" ✅ Magasinier ne peut pas créer de vente (403).");
    }

    try {
      await axios.post(`${API_URL}/ops/preparations/1/start`, {}, { headers: { Authorization: `Bearer ${tokens.cashier}` } });
      failed = true;
    } catch(e) {
      if (e.response?.status === 403) console.log(" ✅ Caissier ne peut pas préparer (403).");
    }

    if(failed) console.error(" ❌ Un bypass RBAC a fonctionné !");
  } catch(err) {
    console.error("Erreur Test 8:", err.message);
  }

  // Test 9 : Paiement partiel et surpaiement (Test 10 & 11)
  console.log("\n--- TEST 9, 10, 11 : PAIEMENT DE CRÉANCE ---");
  try {
    const receivable = await getSql(`SELECT id, remaining_amount FROM LFD_Receivables WHERE sale_id = ?`, [saleId]); // Test 4 sale
    if (receivable) {
      // Ouvert par CASHIER
      let cashSessionId2 = null;
      try {
        await axios.post(`${API_URL}/cash/open`, { cash_register_id: 1, opening_balance: 100000 }, { headers: { Authorization: `Bearer ${tokens.cashier}` } });
      } catch(e) {}
      const s = await axios.get(`${API_URL}/cash/session`, { headers: { Authorization: `Bearer ${tokens.cashier}` } });
      cashSessionId2 = s.data.session.id;

      // Paiement partiel de 1000 FCFA
      await axios.post(`${API_URL}/receivables/${receivable.id}/pay`, { amount: 1000, payment_method: 'CASH', cash_session_id: cashSessionId2 }, { headers: { Authorization: `Bearer ${tokens.cashier}` } });
      const r2 = await getSql(`SELECT remaining_amount, status FROM LFD_Receivables WHERE id = ?`, [receivable.id]);
      console.log(` ✅ Paiement partiel réussi. Reste: ${r2.remaining_amount}. Statut: ${r2.status}`);

      // Surpaiement
      try {
         await axios.post(`${API_URL}/receivables/${receivable.id}/pay`, { amount: r2.remaining_amount + 5000, payment_method: 'CASH', cash_session_id: cashSessionId2 }, { headers: { Authorization: `Bearer ${tokens.cashier}` } });
         console.error(" ❌ Échec: Surpaiement accepté !");
      } catch (e) {
         if(e.response?.status === 400) console.log(" ✅ Surpaiement refusé correctement.");
      }
    }
  } catch (err) {
    console.error("Erreur Test 9:", err.response?.data || err.message);
  }

  console.log("\nTests terminés.");
  db.close();
}

startTests();
