require('dotenv').config();
const { runSql, getSql, allSql } = require('./lfdDb');
const crypto = require('crypto');
const axios = require('axios');

const API_URL = 'http://localhost:5001/api/lfd';
const AUTH_URL = 'http://localhost:5001/api/auth';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log("=========================================");
  console.log(" DÉMARRAGE TESTS AUTOMATIQUES PHASE 4");
  console.log("=========================================\n");

  let cashierToken, storekeeperToken, storekeeper2Token, deliveryToken;
  let customerId, productId, warehouseId;
  let cashSessionId, saleId, prepId, releaseId, deliveryId;

  try {
    // 1. Authentification des acteurs
    console.log("[1] Authentification des acteurs...");

    const login = async (email) => {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password: "password123" });
      return res.data.token;
    };
    cashierToken = await login('direction@lafoidistr.com');
    storekeeperToken = await login('direction@lafoidistr.com');
    storekeeper2Token = await login('magasin@lafoidistr.com'); // Un autre user pour le double contrôle
    deliveryToken = await login('direction@lafoidistr.com');

    // 2. Setup (Ouvrir Caisse, créer client et produit)
    console.log("[2] Setup initial (Caisse, Produit, Stock)...");
    
    // Fermer toute session existante
    try { await axios.post(`${API_URL}/cash/close`, { physical_balance: 9999999 }, { headers: { Authorization: `Bearer ${cashierToken}` } }); } catch(e) {}
    
    // Ouvrir caisse
    await axios.post(`${API_URL}/cash/open`, { cash_register_id: 1, opening_balance: 100000 }, { headers: { Authorization: `Bearer ${cashierToken}` } });
    const sessionRes = await axios.get(`${API_URL}/cash/session`, { headers: { Authorization: `Bearer ${cashierToken}` } });
    cashSessionId = sessionRes.data.session.id;

    const empRes = await getSql(`SELECT id FROM LFD_Employees LIMIT 1`);
    const adminId = empRes.id;

    let prodRes = await getSql(`SELECT id FROM LFD_Products WHERE status = 'ACTIVE' LIMIT 1`);
    if (!prodRes) {
      await runSql(`INSERT INTO LFD_Products (category_id, product_code, name, purchase_price, selling_price, status) VALUES (1, 'PROD-T1', 'Test Prod', 1000, 1500, 'ACTIVE')`);
      prodRes = await getSql(`SELECT id FROM LFD_Products WHERE status = 'ACTIVE' LIMIT 1`);
    }
    productId = prodRes.id;
    warehouseId = 1;

    // Ajouter du stock manuel pour éviter de bloquer
    await runSql(`
      INSERT INTO LFD_StockMovements (reference, product_id, warehouse_id, movement_type, quantity, reason, created_by)
      VALUES (?, ?, ?, 'ENTRY', 500, 'TEST PHASE 4 STOCK IN', ?)
    `, [`MVT-TEST-P4-${Date.now()}`, productId, warehouseId, adminId]);

    let custRes = await getSql(`SELECT id FROM LFD_Customers WHERE status = 'ACTIVE' LIMIT 1`);
    if (!custRes) {
      await runSql(`INSERT INTO LFD_Customers (customer_code, name, phone, status) VALUES ('CLI-T1', 'Test Client', '00000000', 'ACTIVE')`);
      custRes = await getSql(`SELECT id FROM LFD_Customers WHERE status = 'ACTIVE' LIMIT 1`);
    }
    customerId = custRes.id;


    // 3. TEST A: Création Vente et Réservation
    console.log("\n--- TEST A: WORKFLOW COMPLET ---");
    console.log("[3] Création et Validation de Vente (Réservation)...");
    
    const draftRes = await axios.post(`${API_URL}/sales`, {
      customer_id: customerId,
      payment_type: 'CASH',
      items: [{ product_id: productId, quantity: 10, discount: 0 }]
    }, { headers: { Authorization: `Bearer ${cashierToken}` } });
    saleId = draftRes.data.id;

    await axios.post(`${API_URL}/sales/${saleId}/validate`, {
      cash_session_id: cashSessionId,
      warehouse_id: warehouseId
    }, { headers: { Authorization: `Bearer ${cashierToken}` } });

    const prepsRes = await axios.get(`${API_URL}/ops/preparations?status=TO_PREPARE`, { headers: { Authorization: `Bearer ${storekeeperToken}` } });
    const prepOrder = prepsRes.data.find(p => p.sale_id === saleId);
    if (!prepOrder) throw new Error("Ordre de préparation introuvable après validation.");
    prepId = prepOrder.id;
    console.log(" ✅ Ordre de préparation généré : " + prepOrder.preparation_number);

    // Vérifier réservation stock
    const resMvts = await allSql(`SELECT * FROM LFD_StockMovements WHERE source_type='SALE' AND movement_type='RESERVE' AND source_id=?`, [saleId]);
    if (resMvts.length === 0) throw new Error("Mouvement de réservation manquant.");


    // 4. TEST A suite: Magasin
    console.log("[4] Préparation par Magasinier 1...");
    await axios.post(`${API_URL}/ops/preparations/${prepId}/start`, {}, { headers: { Authorization: `Bearer ${storekeeperToken}` } });
    
    const prepDetailRes = await axios.get(`${API_URL}/ops/preparations/${prepId}`, { headers: { Authorization: `Bearer ${storekeeperToken}` } });
    const prepItems = prepDetailRes.data.items;

    await axios.post(`${API_URL}/ops/preparations/${prepId}/complete`, {
      prepared_items: [{ id: prepItems[0].id, quantity_prepared: 10 }]
    }, { headers: { Authorization: `Bearer ${storekeeperToken}` } });

    console.log(" ✅ Préparation terminée (Statut PREPARED).");

    // 5. TEST D: Double Contrôle (Magasinier 1 tente de valider)
    console.log("[5] TEST D: Tentative de validation par le préparateur (Doit échouer)...");
    try {
      await axios.post(`${API_URL}/ops/preparations/${prepId}/release`, {}, { headers: { Authorization: `Bearer ${storekeeperToken}` } });
      throw new Error("❌ Le backend a autorisé l'auto-contrôle !");
    } catch (e) {
      if (e.response && e.response.data.error.includes("DOUBLE CONTRÔLE REQUIS")) {
        console.log(" ✅ Auto-contrôle rejeté correctement.");
      } else {
        throw e;
      }
    }

    // 6. TEST A suite: Validation Sortie par Magasinier 2
    console.log("[6] Validation de Sortie par Directeur/Magasinier 2...");
    const releaseRes = await axios.post(`${API_URL}/ops/preparations/${prepId}/release`, {}, { headers: { Authorization: `Bearer ${storekeeper2Token}` } });
    console.log(" ✅ Sortie validée, BL généré.");

    // Vérifier UNRESERVE et EXIT
    const exitMvts = await allSql(`SELECT * FROM LFD_StockMovements WHERE movement_type='EXIT' AND reason LIKE '%Sortie Physique%' AND product_id=?`, [productId]);
    if (exitMvts.length === 0) throw new Error("Mouvement EXIT manquant après sortie.");


    // 7. TEST A suite: Livraison
    console.log("[7] Prise en charge Livraison...");
    const deliveriesRes = await axios.get(`${API_URL}/ops/deliveries`, { headers: { Authorization: `Bearer ${deliveryToken}` } });
    const delivery = deliveriesRes.data.find(d => d.sale_id === saleId);
    deliveryId = delivery.id;

    await axios.post(`${API_URL}/ops/deliveries/${deliveryId}/start`, {}, { headers: { Authorization: `Bearer ${deliveryToken}` } });
    await axios.post(`${API_URL}/ops/deliveries/${deliveryId}/complete`, {
      recipient_name: 'Jean Dupont', recipient_phone: '00000000'
    }, { headers: { Authorization: `Bearer ${deliveryToken}` } });
    console.log(" ✅ Livraison complétée.");

    console.log("\n=========================================");
    console.log(" ✅ TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS");
    console.log("=========================================\n");

  } catch (err) {
    console.error("\n❌ ERREUR DURANT LES TESTS:");
    console.error(err.response?.data?.error || err.message);
  }
}

runTests();
