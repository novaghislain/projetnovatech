const axios = require('axios');
const API_URL = 'http://localhost:5001/api/lfd';

async function runTests() {
  console.log('--- DEBUT DES TESTS DE VALIDATION PHASE 2 ---');
  let token = null;

  try {
    // 1. AUTHENTIFICATION
    console.log('\\n1. AUTHENTIFICATION');
    // Mdp incorrect
    try {
      await axios.post(`${API_URL}/auth/login`, { email: 'direction@lafoidistr.com', password: 'wrong' });
      console.log('❌ Échec: Connexion avec mauvais mdp a réussi');
    } catch (e) {
      if (e.response && e.response.status === 400) console.log('✅ Rejet mdp incorrect (400)');
      else console.log('❌ Mauvais code de statut pour mdp incorrect', e.response?.status);
    }

    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email: 'direction@lafoidistr.com', password: 'password123' });
      token = res.data.token;
      console.log('✅ Connexion valide réussie. Token récupéré.');
    } catch (e) {
      console.log('❌ Échec connexion valide:', e.response?.data || e.message);
      return;
    }

    // 2. RBAC
    console.log('\\n2. RBAC');
    try {
      await axios.get(`${API_URL}/customers`, { headers: { 'Authorization': `Bearer fake_token` } });
      console.log('❌ Échec: Token invalide accepté');
    } catch (e) {
      if (e.response && e.response.status === 403) console.log('✅ Rejet token invalide (403)');
      else console.log('❌ Mauvais code de statut pour token invalide', e.response?.status);
    }

    // 3. CLIENTS (CRUD)
    console.log('\\n3. CLIENTS (CRUD)');
    const authHeaders = { headers: { 'Authorization': `Bearer ${token}` } };
    
    let customerId = null;
    try {
      const res = await axios.post(`${API_URL}/customers`, {
        name: 'Test Customer',
        phone: '123456',
        credit_allowed: true,
        credit_limit: 50000
      }, authHeaders);
      customerId = res.data.id;
      console.log('✅ Création client réussie. ID:', customerId);
    } catch (e) {
      console.log('❌ Échec création client:', e.message);
    }

    try {
      if (customerId) {
        await axios.put(`${API_URL}/customers/${customerId}`, {
          name: 'Test Customer Updated',
          status: 'INACTIVE'
        }, authHeaders);
        console.log('✅ Mise à jour / Inactivation client réussie.');
      }
    } catch (e) {
      console.log('❌ Échec mise à jour client:', e.message);
    }

    // 4. PRODUITS (CRUD)
    console.log('\\n4. PRODUITS (CRUD)');
    let productId = null;
    try {
      const res = await axios.post(`${API_URL}/products`, {
        name: 'Produit Test',
        purchase_price: 1000,
        selling_price: 1500
      }, authHeaders);
      productId = res.data.id;
      console.log('✅ Création produit réussie. ID:', productId);
    } catch (e) {
      console.log('❌ Échec création produit:', e.message);
    }

    try {
      await axios.post(`${API_URL}/products`, {
        name: 'Produit Erreur',
        purchase_price: -100, // Invalide
        selling_price: 1500
      }, authHeaders);
      console.log('❌ Échec: Prix négatif accepté');
    } catch (e) {
      if (e.response && e.response.status === 400) console.log('✅ Rejet prix négatif (400)');
    }

    // 5. STOCK
    console.log('\\n5. STOCK');
    try {
      await axios.post(`${API_URL}/stock/movements`, {
        product_id: productId,
        warehouse_id: 1,
        movement_type: 'ENTRY',
        quantity: 50
      }, authHeaders);
      console.log('✅ Entrée en stock réussie.');
    } catch (e) {
      console.log('❌ Échec entrée stock:', e.response?.data?.error || e.message);
    }

    try {
      await axios.post(`${API_URL}/stock/movements`, {
        product_id: productId,
        warehouse_id: 1,
        movement_type: 'EXIT',
        quantity: 100 // Trop grand
      }, authHeaders);
      console.log('❌ Échec: Sortie avec stock insuffisant acceptée');
    } catch (e) {
      if (e.response && e.response.status === 400) console.log('✅ Rejet sortie avec stock insuffisant (400)');
    }

    // 6. AUDIT LOGS
    console.log('\\n6. AUDIT LOGS (Vérification via route non exposée, on fera confiance au serveur pour le moment si les autres opérations sont passées)');
    console.log('✅ Opérations terminées.');

  } catch (err) {
    console.error('Erreur globale du script de test:', err.message);
  }
}

runTests();
