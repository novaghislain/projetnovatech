const axios = require('axios');
const API_URL = 'http://localhost:5001/api/lfd';

async function runTests() {
  console.log('--- DEBUT DES TESTS PHASE 3 (CAISSE & VENTES) ---');
  let token = null;

  try {
    // 0. AUTHENTIFICATION
    console.log('\\n0. AUTHENTIFICATION (Direction)');
    const res = await axios.post(`${API_URL}/auth/login`, { email: 'direction@lafoidistr.com', password: 'password123' });
    token = res.data.token;
    const authHeaders = { headers: { 'Authorization': `Bearer ${token}` } };
    console.log('✅ Connexion valide réussie.');

    // 1. SETUP DE BASE
    let customerId = 1;
    let productId = 1;
    try {
      const custRes = await axios.post(`${API_URL}/customers`, { name: 'Client Test Phase 3', phone: '000', credit_allowed: true, credit_limit: 50000 }, authHeaders);
      customerId = custRes.data.id;
      
      const prodRes = await axios.post(`${API_URL}/products`, { name: 'Produit Test Phase 3', purchase_price: 1000, selling_price: 1500 }, authHeaders);
      productId = prodRes.data.id;

      // Ajouter du stock
      await axios.post(`${API_URL}/stock/movements`, { product_id: productId, warehouse_id: 1, movement_type: 'ENTRY', quantity: 50 }, authHeaders);
      console.log('✅ Setup (Client, Produit, Stock) réussi.');
    } catch (e) {
      console.log('⚠️ Setup existant utilisé ou erreur:', e.response?.data || e.message);
    }

    // 2. CAISSE (Ouvrir session)
    console.log('\\n2. CAISSE');
    let cashSessionId = null;
    try {
      const openRes = await axios.post(`${API_URL}/cash/open`, { cash_register_id: 1, opening_balance: 50000 }, authHeaders);
      cashSessionId = openRes.data.id;
      console.log('✅ Ouverture de caisse réussie. ID session:', cashSessionId);
    } catch (e) {
      if (e.response?.data?.error === 'Vous avez déjà une session de caisse ouverte.') {
        console.log('⚠️ Caisse déjà ouverte, on récupère la session en cours...');
        const sessionRes = await axios.get(`${API_URL}/cash/session`, authHeaders);
        cashSessionId = sessionRes.data.session.id;
      } else {
        console.log('❌ Échec ouverture caisse:', e.response?.data || e.message);
        return;
      }
    }

    // 2. VENTE COMPTANT
    console.log('\\n2. VENTE COMPTANT');
    let saleId = null;
    let saleNumber = null;
    try {
      const draftRes = await axios.post(`${API_URL}/sales`, {
        customer_id: customerId,
        items: [{ product_id: productId, quantity: 2, discount: 0 }],
        payment_type: 'CASH'
      }, authHeaders);
      saleId = draftRes.data.id;
      saleNumber = draftRes.data.sale_number;
      console.log('✅ Brouillon créé avec succès. ID:', saleId);

      await axios.post(`${API_URL}/sales/${saleId}/validate`, {
        cash_session_id: cashSessionId,
        warehouse_id: 1
      }, authHeaders);
      console.log('✅ Vente comptant validée avec succès.');
    } catch (e) {
      console.log('❌ Échec vente comptant:', e.response?.data || e.message);
    }

    // 3. VENTE CRÉDIT
    console.log('\\n3. VENTE CRÉDIT');
    let creditSaleId = null;
    try {
      const draftRes2 = await axios.post(`${API_URL}/sales`, {
        customer_id: customerId,
        items: [{ product_id: productId, quantity: 1, discount: 0 }],
        payment_type: 'CREDIT'
      }, authHeaders);
      creditSaleId = draftRes2.data.id;
      console.log('✅ Brouillon crédit créé avec succès. ID:', creditSaleId);

      await axios.post(`${API_URL}/sales/${creditSaleId}/validate`, {
        warehouse_id: 1
      }, authHeaders);
      console.log('✅ Vente crédit validée avec succès.');
    } catch (e) {
      console.log('❌ Échec vente crédit:', e.response?.data || e.message);
    }

    // 4. CRÉANCES (Paiement)
    console.log('\\n4. CRÉANCES');
    try {
      const recRes = await axios.get(`${API_URL}/receivables`, authHeaders);
      if (recRes.data.length > 0) {
        const receivableId = recRes.data[0].id;
        await axios.post(`${API_URL}/receivables/${receivableId}/pay`, {
          amount: 500,
          cash_session_id: cashSessionId
        }, authHeaders);
        console.log('✅ Paiement partiel de la créance enregistré avec succès.');
      } else {
        console.log('⚠️ Aucune créance trouvée.');
      }
    } catch (e) {
      console.log('❌ Échec paiement créance:', e.response?.data || e.message);
    }

    // 5. CAISSE (Clôture)
    console.log('\\n5. CLÔTURE CAISSE');
    try {
      const sessionRes = await axios.get(`${API_URL}/cash/session`, authHeaders);
      const theoBal = sessionRes.data.session.theoretical_balance;
      console.log('Solde théorique actuel:', theoBal);

      await axios.post(`${API_URL}/cash/close`, {
        physical_balance: theoBal,
        difference_reason: 'Tout est OK'
      }, authHeaders);
      console.log('✅ Caisse clôturée avec succès.');
    } catch (e) {
      console.log('❌ Échec clôture caisse:', e.response?.data || e.message);
    }

  } catch (err) {
    console.error('Erreur globale:', err.response?.data || err.message);
  }
}

runTests();
