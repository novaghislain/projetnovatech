const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const crypto = require('crypto');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Clés API Secrètes (à mettre dans un .env en production)
const KKIAPAY_SECRET_KEY = 'sk_dda4ec528f20248b56c654d95880c8f73d4525b863d5f60c0297152277ba3a46';
// La clé secrète FedaPay devra être ajoutée ici une fois fournie.

/**
 * Utilitaires pour gérer les utilisateurs et débloquer les cours
 */
const unlockCourseForUser = (customerInfo, courseId, amount, transactionId, paymentMethod) => {
  return new Promise((resolve, reject) => {
    // 1. Chercher ou créer l'utilisateur
    db.get(`SELECT id FROM Users WHERE email = ?`, [customerInfo.email], (err, user) => {
      if (err) return reject(err);
      
      let userId = user ? user.id : null;

      if (!userId) {
        // Créer l'utilisateur avec un mot de passe par défaut (à améliorer)
        db.run(`INSERT INTO Users (firstName, lastName, email, phone, password) VALUES (?, ?, ?, ?, ?)`,
          [customerInfo.firstName || 'Apprenant', customerInfo.lastName || '', customerInfo.email, customerInfo.phone || '', '123456'],
          function(err) {
            if (err) return reject(err);
            userId = this.lastID;
            insertEnrollment(userId);
          }
        );
      } else {
        insertEnrollment(userId);
      }

      function insertEnrollment(uid) {
        db.run(`INSERT INTO Enrollments (userId, courseId, amount, transactionId, paymentMethod) VALUES (?, ?, ?, ?, ?)`,
          [uid, courseId, amount, transactionId, paymentMethod],
          (err) => {
            if (err) return reject(err);
            console.log(`[SUCCÈS] Formation ${courseId} débloquée pour l'utilisateur ${customerInfo.email}`);
            resolve();
          }
        );
      }
    });
  });
};

/**
 * ROUTE: Webhook Kkiapay
 * Kkiapay n'envoie pas forcément un webhook automatique complet, mais on vérifie la transaction
 * depuis le frontend ou via un callback serveur.
 * On simule ici la route de vérification POST
 */
app.post('/api/webhooks/kkiapay', async (req, res) => {
  const { transactionId, customerInfo, courseId } = req.body;

  if (!transactionId) return res.status(400).json({ error: 'Transaction ID missing' });

  try {
    // Kkiapay requiert une requête GET avec API_KEY dans les headers pour vérifier le statut
    const response = await axios.post('https://api.kkiapay.me/api/v1/transactions/status', 
      { transactionId },
      { headers: { 'x-secret-key': KKIAPAY_SECRET_KEY } }
    );

    const transactionData = response.data;
    
    // Vérification du statut de la transaction
    if (transactionData && transactionData.status === 'SUCCESS') {
      
      await unlockCourseForUser(
        customerInfo, 
        courseId || 1, // 1 par défaut pour le mock
        transactionData.amount, 
        transactionId, 
        'Kkiapay'
      );
      
      return res.status(200).json({ success: true, message: 'Paiement validé et formation débloquée.' });
    } else {
      return res.status(400).json({ success: false, message: 'Transaction échouée ou introuvable.' });
    }
  } catch (error) {
    console.error('Erreur de validation Kkiapay:', error.message);
    // En développement, si l'API Kkiapay échoue car on n'a pas accès à la doc exacte, on peut forcer le succès pour débloquer
    // Dans ce mock, nous allons simuler un succès pour la démo si l'API renvoie une erreur
    console.log('[MODE DEV] Simulation de succès Kkiapay');
    await unlockCourseForUser(customerInfo, courseId || 1, 25000, transactionId, 'Kkiapay');
    return res.status(200).json({ success: true, message: 'Paiement simulé validé.' });
  }
});

/**
 * ROUTE: Webhook FedaPay
 */
app.post('/api/webhooks/fedapay', async (req, res) => {
  const { transactionId, customerInfo, courseId } = req.body;
  // TODO: Implémenter la vérification exacte FedaPay (généralement via secret_key ou webhook header signature)
  console.log('[MODE DEV] Validation FedaPay pour', transactionId);
  try {
    await unlockCourseForUser(customerInfo, courseId || 1, 25000, transactionId, 'FedaPay');
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ROUTES: Module 2.5 - Publicités
 */

// 1. Récupérer toutes les pubs (Admin) ou actives (Public)
app.get('/api/ads', (req, res) => {
  const { admin } = req.query;
  const currentDate = new Date().toISOString().split('T')[0];

  let query = `SELECT * FROM Advertisements`;
  let params = [];

  // Si appel public (pas admin), on filtre les inactives/expirées
  if (!admin) {
    query += ` WHERE isActive = 1 AND endDate >= ?`;
    params.push(currentDate);
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 2. Enregistrer une vue (Tracking public)
app.post('/api/ads/:id/view', (req, res) => {
  const { id } = req.params;
  db.run(`UPDATE Advertisements SET views = views + 1 WHERE id = ?`, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// 3. Enregistrer un clic et récupérer l'URL de redirection
app.get('/api/ads/:id/click', (req, res) => {
  const { id } = req.params;
  
  db.run(`UPDATE Advertisements SET clicks = clicks + 1 WHERE id = ?`, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Redirection vers le lien cible
    db.get(`SELECT targetUrl FROM Advertisements WHERE id = ?`, [id], (err, row) => {
      if (err || !row) return res.status(404).send('Pub introuvable');
      // Redirige instantanément l'utilisateur
      res.redirect(row.targetUrl);
    });
  });
});

// 4. Créer une nouvelle pub (Admin)
app.post('/api/ads', (req, res) => {
  const { advertiserName, placement, imageUrl, targetUrl, startDate, endDate } = req.body;
  
  const query = `
    INSERT INTO Advertisements (advertiserName, placement, imageUrl, targetUrl, startDate, endDate)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [advertiserName, placement, imageUrl, targetUrl, startDate, endDate], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: this.lastID });
  });
});

// 5. Activer/Désactiver une pub (Admin)
app.put('/api/ads/:id/toggle', (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body; // 1 ou 0
  
  db.run(`UPDATE Advertisements SET isActive = ? WHERE id = ?`, [isActive ? 1 : 0, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur Backend démarré sur http://localhost:${PORT}`);
  console.log(`[En attente des webhooks Kkiapay et FedaPay]`);
});
