const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const API_URL = 'http://localhost:5001/api/lfd';

const dbPath = path.resolve(__dirname, 'lfd_database.sqlite');
const db = new sqlite3.Database(dbPath);

const queryDB = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

async function runTests() {
  try {
    console.log("--- 0. CONNEXION ---");
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'direction@lafoidistr.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log("Connecté avec succès.");

    // Récupérer un journal
    const journals = await axios.get(`${API_URL}/accounting/journals`, { headers });
    console.log("Journals: ", journals.data);
    const odJournal = Array.isArray(journals.data) ? journals.data.find(j => j.code === 'OD') : journals.data.data.find(j => j.code === 'OD');
    
    // Récupérer des comptes
    const accounts = await axios.get(`${API_URL}/accounting/accounts`, { headers });
    console.log("Accounts: ", accounts.data);
    const caisseAccount = Array.isArray(accounts.data) ? accounts.data.find(a => a.account_number === '531') : accounts.data.data.find(a => a.account_number === '531');
    const venteAccount = Array.isArray(accounts.data) ? accounts.data.find(a => a.account_number === '701') : accounts.data.data.find(a => a.account_number === '701');

    console.log("--- 1. CRÉATION ÉCRITURE DÉBÉSÉQUILIBRÉE (ÉCHEC ATTENDU) ---");
    try {
      await axios.post(`${API_URL}/accounting/entries`, {
        journal_id: odJournal.id,
        entry_date: new Date().toISOString().split('T')[0],
        description: "Test déséquilibré",
        source_type: "MANUAL",
        lines: [
          { account_id: caisseAccount.id, debit: 10000, credit: 0 },
          { account_id: venteAccount.id, debit: 0, credit: 5000 }
        ]
      }, { headers });
      console.log("ERREUR : L'écriture a été acceptée alors qu'elle est déséquilibrée.");
    } catch (e) {
      console.log("SUCCÈS : Écriture déséquilibrée refusée ->", e.response?.data?.error);
    }

    console.log("--- 2. CRÉATION ÉCRITURE VALIDE (DRAFT) ---");
    const entryRes = await axios.post(`${API_URL}/accounting/entries`, {
      journal_id: odJournal.id,
      entry_date: new Date().toISOString().split('T')[0],
      description: "Test valide",
      source_type: "MANUAL",
      source_id: 1000,
      event_type: "TEST_EVENT",
      lines: [
        { account_id: caisseAccount.id, debit: 10000, credit: 0 },
        { account_id: venteAccount.id, debit: 0, credit: 10000 }
      ]
    }, { headers });
    const entryId = entryRes.data.entryId;
    console.log("SUCCÈS : Écriture créée. ID:", entryId);

    console.log("--- 3. TEST IDEMPOTENCE (ÉCHEC ATTENDU) ---");
    try {
      await axios.post(`${API_URL}/accounting/entries`, {
        journal_id: odJournal.id,
        entry_date: new Date().toISOString().split('T')[0],
        description: "Test doublon",
        source_type: "MANUAL",
        source_id: 1000,
        event_type: "TEST_EVENT",
        lines: [
          { account_id: caisseAccount.id, debit: 5000, credit: 0 },
          { account_id: venteAccount.id, debit: 0, credit: 5000 }
        ]
      }, { headers });
      console.log("ERREUR : L'écriture doublon a été acceptée.");
    } catch (e) {
      console.log("SUCCÈS : Doublon refusé par idempotence ->", e.response?.data?.error);
    }

    console.log("--- 4. POST DE L'ÉCRITURE ---");
    await axios.post(`${API_URL}/accounting/entries/${entryId}/post`, {}, { headers });
    console.log("SUCCÈS : Écriture postée.");

    console.log("--- 5. DOUBLE POST DE L'ÉCRITURE (ÉCHEC ATTENDU) ---");
    try {
      await axios.post(`${API_URL}/accounting/entries/${entryId}/post`, {}, { headers });
      console.log("ERREUR : L'écriture a été repostée.");
    } catch (e) {
      console.log("SUCCÈS : Double post refusé ->", e.response?.data?.error);
    }

    console.log("--- 6. BALANCE GÉNÉRALE ---");
    const trialBalance = await axios.get(`${API_URL}/accounting/trial-balance`, { headers });
    console.log("Balance:", trialBalance.data);

    console.log("--- 7. CONTREPASSATION ---");
    const revRes = await axios.post(`${API_URL}/accounting/entries/${entryId}/reverse`, {}, { headers });
    console.log("SUCCÈS : Écriture contrepassée. ID Reversal:", revRes.data.reversalId);

    console.log("--- 8. BALANCE GÉNÉRALE APRÈS CONTREPASSATION ---");
    // Il faut poster la contrepassation pour qu'elle affecte la balance
    await axios.post(`${API_URL}/accounting/entries/${revRes.data.reversalId}/post`, {}, { headers });
    
    const trialBalance2 = await axios.get(`${API_URL}/accounting/trial-balance`, { headers });
    console.log("Balance après contrepassation postée (les soldes doivent être à 0):", trialBalance2.data);

    db.close();
  } catch (error) {
    console.error("ERREUR GLOBALE PENDANT LA RECETTE:", error.response ? error.response.data : error);
    db.close();
  }
}

runTests();
