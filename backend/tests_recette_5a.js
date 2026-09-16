const axios = require('axios');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./lfd_database.sqlite');
const assert = require('assert');

const API_URL = 'http://localhost:5001/api/lfd';

async function queryDB(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function runRecipe() {
  let directorToken, employeeToken;
  try {
    console.log("--- 0. CONNEXION ---");
    let res = await axios.post(`${API_URL}/auth/login`, { email: 'direction@lafoidistr.com', password: 'password123' });
    directorToken = res.data.token;
    
    // Check if an employee exists, else use standard token
    let resEmp = await axios.post(`${API_URL}/auth/login`, { email: 'test_warehouse1@lafoidistr.com', password: 'password123' }).catch(e => null);
    employeeToken = resEmp ? resEmp.data.token : null;

    console.log("Tokens récupérés.");
    const dirInfo = await axios.get(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${directorToken}` } });
    const directorId = dirInfo.data.employee.id;

    // Stocks Initiaux
    const initialStocks = await queryDB(`SELECT product_id, SUM(CASE WHEN movement_type IN ('ENTRY', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'RETURN') THEN quantity ELSE -quantity END) as stock FROM LFD_StockMovements WHERE product_id IN (1, 2) GROUP BY product_id`);
    let initialStockA = initialStocks.find(s => s.product_id === 1)?.stock || 0;
    let initialStockB = initialStocks.find(s => s.product_id === 2)?.stock || 0;
    console.log(`Stock initial Produit 1: ${initialStockA}, Produit 2: ${initialStockB}`);

    const openSessions = await queryDB(`SELECT * FROM LFD_CashSessions WHERE status = 'OPEN' AND cashier_id = ?`, [directorId]);
    const initialSession = openSessions[0];
    const initialCash = initialSession ? initialSession.theoretical_balance : 0;
    console.log(`Caisse initiale Session ID ${initialSession?.id}: ${initialCash} FCFA`);

    const runSuffix = Date.now().toString().slice(-4);
    console.log("--- 1. CRÉATION FOURNISSEUR ---");
    let supplierRes = await axios.post(`${API_URL}/suppliers`, {
      supplier_code: 'F-REC-' + runSuffix,
      name: 'FOURNISSEUR TEST RECETTE 5A ' + runSuffix,
      email: 'contact@fournisseurtest.com',
      phone: '0102030405'
    }, { headers: { Authorization: `Bearer ${directorToken}` } });
    const supplierId = supplierRes.data.id;
    console.log(`Fournisseur créé: ID ${supplierId}`);

    console.log("--- 2. COMMANDE D'ACHAT ---");
    let poRes = await axios.post(`${API_URL}/purchases`, {
      supplier_id: supplierId,
      items: [
        { product_id: 1, quantity: 100, unit_cost: 1000 },
        { product_id: 2, quantity: 50, unit_cost: 1000 }
      ]
    }, { headers: { Authorization: `Bearer ${directorToken}` } });
    const poId = poRes.data.id;
    console.log(`Commande créée: ID ${poId}`);

    console.log("--- 3. APPROBATION ---");
    if (employeeToken) {
      try {
        await axios.post(`${API_URL}/purchases/${poId}/approve`, {}, { headers: { Authorization: `Bearer ${employeeToken}` } });
        console.log("ÉCHEC: L'employé a pu approuver la commande.");
      } catch (err) {
        if (err.response && err.response.status === 403) {
          console.log("SUCCÈS: Non-autorisé obtient bien 403 sur l'approbation.");
        } else {
          console.log("Erreur inattendue sur l'approbation employé", err.message);
        }
      }
    }

    await axios.post(`${API_URL}/purchases/${poId}/approve`, {}, { headers: { Authorization: `Bearer ${directorToken}` } });
    console.log("Commande approuvée par le directeur.");

    // Fetch PO items to get purchase_order_item_id
    let poDetails = await axios.get(`${API_URL}/purchases/${poId}`, { headers: { Authorization: `Bearer ${directorToken}` } });
    let poItems = poDetails.data.items;
    let itemId1 = poItems.find(i => i.product_id === 1).id;
    let itemId2 = poItems.find(i => i.product_id === 2).id;

    console.log("--- 4. PREMIÈRE RÉCEPTION PARTIELLE ---");
    await axios.post(`${API_URL}/receipts`, {
      purchase_order_id: poId,
      warehouse_id: 1,
      items: [
        { purchase_order_item_id: itemId1, quantity_received: 60 },
        { purchase_order_item_id: itemId2, quantity_received: 20 }
      ]
    }, { headers: { Authorization: `Bearer ${directorToken}` } });
    console.log("Réception partielle enregistrée (60, 20).");

    console.log("--- 5. CONTRÔLE STOCK INTERMÉDIAIRE ---");
    const partialStocks = await queryDB(`SELECT product_id, SUM(CASE WHEN movement_type IN ('ENTRY', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'RETURN') THEN quantity ELSE -quantity END) as stock FROM LFD_StockMovements WHERE product_id IN (1, 2) GROUP BY product_id`);
    let partialStockA = partialStocks.find(s => s.product_id === 1)?.stock || 0;
    let partialStockB = partialStocks.find(s => s.product_id === 2)?.stock || 0;
    console.log(`Stock après réception partielle Produit 1: ${partialStockA} (Attendu: ${initialStockA + 60})`);
    console.log(`Stock après réception partielle Produit 2: ${partialStockB} (Attendu: ${initialStockB + 20})`);
    
    let poCheck = await axios.get(`${API_URL}/purchases`, { headers: { Authorization: `Bearer ${directorToken}` } });
    let currentPO = poCheck.data.find(p => p.id === poId);
    console.log(`Statut Commande actuel: ${currentPO.status} (Attendu: PARTIALLY_RECEIVED)`);

    console.log("--- 7. DEUXIÈME RÉCEPTION ---");
    await axios.post(`${API_URL}/receipts`, {
      purchase_order_id: poId,
      warehouse_id: 1,
      items: [
        { purchase_order_item_id: itemId1, quantity_received: 40 },
        { purchase_order_item_id: itemId2, quantity_received: 30 }
      ]
    }, { headers: { Authorization: `Bearer ${directorToken}` } });
    console.log("Deuxième réception enregistrée (40, 30).");

    const finalStocks = await queryDB(`SELECT product_id, SUM(CASE WHEN movement_type IN ('ENTRY', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'RETURN') THEN quantity ELSE -quantity END) as stock FROM LFD_StockMovements WHERE product_id IN (1, 2) GROUP BY product_id`);
    let finalStockA = finalStocks.find(s => s.product_id === 1)?.stock || 0;
    let finalStockB = finalStocks.find(s => s.product_id === 2)?.stock || 0;
    console.log(`Stock final Produit 1: ${finalStockA} (Attendu: ${initialStockA + 100})`);
    console.log(`Stock final Produit 2: ${finalStockB} (Attendu: ${initialStockB + 50})`);

    poCheck = await axios.get(`${API_URL}/purchases`, { headers: { Authorization: `Bearer ${directorToken}` } });
    currentPO = poCheck.data.find(p => p.id === poId);
    console.log(`Statut Commande actuel: ${currentPO.status} (Attendu: RECEIVED)`);

    console.log("--- 8. DOUBLE RÉCEPTION (TENTATIVE) ---");
    try {
      await axios.post(`${API_URL}/receipts`, {
        purchase_order_id: poId,
        warehouse_id: 1,
        items: [ { purchase_order_item_id: itemId1, quantity_received: 10 } ]
      }, { headers: { Authorization: `Bearer ${directorToken}` } });
      console.log("ÉCHEC: La double réception a marché.");
    } catch (err) {
      console.log("SUCCÈS: La double réception a été refusée (Attendu). " + (err.response?.data?.error || err.message));
    }

    console.log("--- 9. FACTURE FOURNISSEUR ---");
    let invoiceRes = await axios.post(`${API_URL}/supplier-invoices`, {
      supplier_id: supplierId,
      purchase_order_id: poId,
      supplier_reference: 'TEST-FAC-5A-' + runSuffix,
      invoice_date: new Date().toISOString().split('T')[0],
      subtotal: 150000,
      discount: 0
    }, { headers: { Authorization: `Bearer ${directorToken}` } });
    let invoiceId = invoiceRes.data.id;
    console.log(`Facture créée: ID ${invoiceId}`);

    console.log("--- 10. DOUBLON FACTURE ---");
    try {
      await axios.post(`${API_URL}/supplier-invoices`, {
        supplier_id: supplierId,
        purchase_order_id: poId,
        supplier_reference: 'TEST-FAC-5A-' + runSuffix,
        invoice_date: new Date().toISOString().split('T')[0],
        subtotal: 150000,
        discount: 0
      }, { headers: { Authorization: `Bearer ${directorToken}` } });
      console.log("ÉCHEC: Le doublon de facture a fonctionné.");
    } catch (err) {
      console.log("SUCCÈS: Le doublon de facture a été refusé. " + (err.response?.data?.error || err.message));
    }

    console.log("--- 11. DETTE FOURNISSEUR ---");
    await axios.post(`${API_URL}/supplier-invoices/${invoiceId}/validate`, {}, { headers: { Authorization: `Bearer ${directorToken}` } });
    console.log(`Facture ${invoiceId} validée. Dette générée.`);

    let payablesRes = await axios.get(`${API_URL}/payables`, { headers: { Authorization: `Bearer ${directorToken}` } });
    let currentPayable = payablesRes.data.find(p => p.supplier_id === supplierId);
    console.log(`Dette créée: ${currentPayable.original_amount} FCFA. Reste à payer: ${currentPayable.remaining_amount} FCFA.`);
    let payableId = currentPayable.id;

    console.log("--- 12. PAIEMENT PARTIEL ---");
    await axios.post(`${API_URL}/payables/${payableId}/pay`, { 
      amount: 40000,
      payment_method: 'CASH',
      cash_session_id: initialSession.id
    }, { headers: { Authorization: `Bearer ${directorToken}` } });
    console.log("Paiement de 40 000 FCFA effectué.");

    payablesRes = await axios.get(`${API_URL}/payables`, { headers: { Authorization: `Bearer ${directorToken}` } });
    currentPayable = payablesRes.data.find(p => p.id === payableId);
    console.log(`Statut Dette: ${currentPayable.status}. Payé: ${currentPayable.paid_amount}. Reste: ${currentPayable.remaining_amount}`);

    console.log("--- 13. IMPACT CAISSE ---");
    const updatedSessions = await queryDB(`SELECT * FROM LFD_CashSessions WHERE id = ?`, [initialSession.id]);
    const currentCash = updatedSessions[0].theoretical_balance;
    console.log(`Caisse actuelle: ${currentCash} FCFA (Attendu: ${initialCash - 40000})`);

    console.log("--- 14. PAIEMENT FINAL ---");
    await axios.post(`${API_URL}/payables/${payableId}/pay`, { 
      amount: 110000,
      payment_method: 'CASH',
      cash_session_id: initialSession.id
    }, { headers: { Authorization: `Bearer ${directorToken}` } });
    console.log("Paiement final de 110 000 FCFA effectué.");

    payablesRes = await axios.get(`${API_URL}/payables`, { headers: { Authorization: `Bearer ${directorToken}` } });
    currentPayable = payablesRes.data.find(p => p.id === payableId);
    console.log(`Statut Dette final: ${currentPayable.status}. Payé: ${currentPayable.paid_amount}. Reste: ${currentPayable.remaining_amount}`);

    console.log("--- 15. SURPAIEMENT ---");
    try {
      await axios.post(`${API_URL}/payables/${payableId}/pay`, { 
        amount: 10000,
        payment_method: 'CASH',
        cash_session_id: initialSession.id
      }, { headers: { Authorization: `Bearer ${directorToken}` } });
      console.log("ÉCHEC: Le surpaiement a fonctionné.");
    } catch(err) {
      console.log("SUCCÈS: Surpaiement refusé. " + (err.response?.data?.error || err.message));
    }

    console.log("--- 18. DASHBOARD ---");
    try {
      let dashRes = await axios.get(`${API_URL}/dashboard/kpi`, { headers: { Authorization: `Bearer ${directorToken}` } });
      console.log(`KPI Dettes Fournisseurs : ${dashRes.data.dettesFournisseurs}`);
    } catch (e) {
      console.log(`Lecture KPI Dashboard impossible: ${e.response?.data?.error || e.message}`);
    }

    console.log("--- 19. AUDIT ---");
    const audits = await queryDB(`SELECT entity_type, action, description, created_at FROM LFD_AuditLogs ORDER BY id DESC LIMIT 15`);
    console.log("Derniers logs d'audit :");
    console.table(audits.map(a => ({ Entity: a.entity_type, Action: a.action, Desc: a.description })));

  } catch (err) {
    console.error("ERREUR GLOBALE PENDANT LA RECETTE:", err.response?.data || err.message);
  } finally {
    db.close();
  }
}

runRecipe();
