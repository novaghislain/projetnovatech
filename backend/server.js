const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const crypto = require('crypto');
const db = require('./db');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sendEmail } = require('./emailService');
const { generateCertificate } = require('./certificateService');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuration Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.user?.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Clés API Secrètes (à mettre dans un .env en production)
const KKIAPAY_SECRET_KEY = 'sk_dda4ec528f20248b56c654d95880c8f73d4525b863d5f60c0297152277ba3a46';
const JWT_SECRET = 'super_secret_novatech_key_2026';

/**
 * ROUTES D'AUTHENTIFICATION
 */

app.post('/api/auth/register', async (req, res) => {
  const { firstName, lastName, email, phone, password, role } = req.body;
  if (!firstName || !email || !password) {
    return res.status(400).json({ error: 'Le prénom, email et mot de passe sont requis' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'apprenant';

    db.run(
      `INSERT INTO Users (firstName, lastName, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)`,
      [firstName, lastName || '', email.toLowerCase(), phone || '', hashedPassword, userRole],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
          }
          return res.status(500).json({ error: 'Erreur lors de la création du compte.' });
        }

        const token = jwt.sign({ id: this.lastID, email, role: userRole }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
          user: { id: this.lastID, firstName, lastName, email, role: userRole },
          token
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur lors de l'inscription" });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  db.get(`SELECT * FROM Users WHERE email = ?`, [email.toLowerCase()], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur.' });
    if (!user) return res.status(400).json({ error: 'Identifiants incorrects.' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ error: 'Identifiants incorrects.' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, avatar: user.avatar },
      token
    });
  });
});
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis.' });

  db.get(`SELECT id, email FROM Users WHERE email = ?`, [email.toLowerCase()], (err, user) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur.' });
    if (!user) return res.status(404).json({ error: 'Aucun compte associé à cet email.' });

    // Générer un token unique
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000).toISOString(); // +1 heure

    db.run(`UPDATE Users SET resetToken = ?, resetTokenExpiry = ? WHERE id = ?`, 
      [resetToken, resetTokenExpiry, user.id], (err) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur.' });

      const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

      sendEmail({
        to: user.email,
        subject: 'Réinitialisation de votre mot de passe - Novatech Vision',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Réinitialisation de mot de passe</h2>
            <p>Bonjour,</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
            <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">Réinitialiser mon mot de passe</a>
            <p style="color: #6b7280; font-size: 14px;">Ce lien expire dans 1 heure.</p>
            <p style="color: #6b7280; font-size: 14px;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb;" />
            <p style="color: #9ca3af; font-size: 12px;">Novatech Vision - Cotonou, Bénin</p>
          </div>
        `,
      }).then(() => console.log('[EMAIL] Lien de réinitialisation envoyé à', user.email))
        .catch(err => console.error('[EMAIL ERREUR]', err.message));

      res.json({ 
        success: true, 
        message: 'Un lien de réinitialisation a été envoyé à votre adresse email.',
        demoLink: resetLink 
      });
    });
  });
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: 'Données manquantes.' });

  db.get(`SELECT id, resetTokenExpiry FROM Users WHERE resetToken = ?`, [token], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur.' });
    if (!user) return res.status(400).json({ error: 'Lien invalide ou expiré.' });

    if (new Date(user.resetTokenExpiry) < new Date()) {
      return res.status(400).json({ error: 'Ce lien de réinitialisation a expiré.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.run(`UPDATE Users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE id = ?`, 
      [hashedPassword, user.id], (err) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur.' });
      res.json({ success: true, message: 'Mot de passe réinitialisé avec succès.' });
    });
  });
});


/**
 * ROUTES PROFIL UTILISATEUR
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.post('/api/user/avatar', authenticateToken, upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier fourni' });
  }

  const avatarUrl = 'http://localhost:5001/uploads/' + req.file.filename;

  db.run(`UPDATE Users SET avatar = ? WHERE id = ?`, [avatarUrl, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: "Erreur lors de la mise à jour de l'avatar" });
    res.json({ avatar: avatarUrl });
  });
});

app.delete('/api/user/avatar', authenticateToken, (req, res) => {
  db.run(`UPDATE Users SET avatar = NULL WHERE id = ?`, [req.user.id], function(err) {
    if (err) return res.status(500).json({ error: "Erreur lors de la suppression de l'avatar" });
    res.json({ success: true });
  });
});

app.get('/api/user/payments', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM Enrollments WHERE userId = ? ORDER BY id DESC`, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Erreur lors de la récupération des paiements" });
    res.json(rows);
  });
});

app.put('/api/user/profile', authenticateToken, (req, res) => {
  const { firstName, lastName } = req.body;
  if (!firstName || !lastName) {
    return res.status(400).json({ error: "Le prénom et le nom sont requis." });
  }

  db.run(`UPDATE Users SET firstName = ?, lastName = ? WHERE id = ?`, [firstName, lastName, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: "Erreur lors de la mise à jour du profil" });
    res.json({ success: true, firstName, lastName });
  });
});

app.put('/api/user/password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "L'ancien et le nouveau mot de passe sont requis." });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: "Le nouveau mot de passe doit contenir au moins 6 caractères." });
  }

  db.get(`SELECT password FROM Users WHERE id = ?`, [req.user.id], async (err, user) => {
    if (err) return res.status(500).json({ error: "Erreur serveur." });
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé." });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return res.status(400).json({ error: "Le mot de passe actuel est incorrect." });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.run(`UPDATE Users SET password = ? WHERE id = ?`, [hashedPassword, req.user.id], function(err) {
      if (err) return res.status(500).json({ error: "Erreur lors de la mise à jour du mot de passe." });
      res.json({ success: true, message: "Mot de passe mis à jour avec succès." });
    });
  });
});

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
 * ROUTE: Public Messages (Contact Form)
 */
app.post('/api/public/messages', (req, res) => {
  const { name, email, subject, body } = req.body;
  if (!name || !email || !body) return res.status(400).json({ error: 'Champs requis manquants.' });
  
  db.run(`INSERT INTO Messages (name, email, subject, body) VALUES (?, ?, ?, ?)`,
    [name, email, subject, body],
    function(err) {
      if (err) return res.status(500).json({ error: 'Erreur lors de l\'envoi du message.' });
      res.json({ success: true, message: 'Message envoyé avec succès.' });
    }
  );
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
 * ROUTES: Formations Publiques
 */
app.get('/api/public/formations', (req, res) => {
  db.all("SELECT * FROM Formations WHERE status != 'draft' ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/public/formations/:id', (req, res) => {
  db.get("SELECT * FROM Formations WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Formation introuvable" });
    res.json(row);
  });
});

/**
 * ROUTES: Contenu Public (Témoignages & Galerie)
 */
app.get('/api/public/testimonials', (req, res) => {
  db.all("SELECT * FROM Testimonials ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/public/gallery', (req, res) => {
  db.all("SELECT * FROM Gallery ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
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

/**
 * ROUTES: Module 3.1 - Constructeur de Cours
 */

// --- MODULES ---
app.get('/api/courses/:formationId/structure', (req, res) => {
  const { formationId } = req.params;
  
  // 1. Récupérer tous les modules
  db.all(`SELECT * FROM Modules WHERE formationId = ? ORDER BY orderIndex ASC`, [formationId], (err, modules) => {
    if (err) return res.status(500).json({ error: err.message });
    if (modules.length === 0) return res.json([]);

    // 2. Récupérer tous les chapitres de cette formation
    const moduleIds = modules.map(m => m.id);
    const placeholders = moduleIds.map(() => '?').join(',');
    db.all(`SELECT * FROM Chapters WHERE moduleId IN (${placeholders}) ORDER BY orderIndex ASC`, moduleIds, (err, chapters) => {
      if (err) return res.status(500).json({ error: err.message });

      // 3. Récupérer toutes les leçons
      let chapterIds = chapters.map(c => c.id);
      if (chapterIds.length === 0) chapterIds = [-1]; // Eviter syntax error
      const chPlaceholders = chapterIds.map(() => '?').join(',');
      
      db.all(`SELECT * FROM Lessons WHERE chapterId IN (${chPlaceholders}) ORDER BY orderIndex ASC`, chapterIds, (err, lessons) => {
        if (err) return res.status(500).json({ error: err.message });

        // Assemblage de l'arbre
        const tree = modules.map(m => ({
          ...m,
          chapters: chapters.filter(c => c.moduleId === m.id).map(c => ({
            ...c,
            lessons: lessons.filter(l => l.chapterId === c.id)
          }))
        }));

        res.json(tree);
      });
    });
  });
});

app.post('/api/modules', (req, res) => {
  const { formationId, title, orderIndex } = req.body;
  db.run(`INSERT INTO Modules (formationId, title, orderIndex) VALUES (?, ?, ?)`, [formationId, title, orderIndex || 0], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, formationId, title, orderIndex: orderIndex || 0, chapters: [] });
  });
});

app.put('/api/modules/:id', (req, res) => {
  const { title, orderIndex } = req.body;
  db.run(`UPDATE Modules SET title = ?, orderIndex = ? WHERE id = ?`, [title, orderIndex, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.delete('/api/modules/:id', (req, res) => {
  db.run(`DELETE FROM Modules WHERE id = ?`, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// --- CHAPITRES ---
app.post('/api/chapters', (req, res) => {
  const { moduleId, title, orderIndex } = req.body;
  db.run(`INSERT INTO Chapters (moduleId, title, orderIndex) VALUES (?, ?, ?)`, [moduleId, title, orderIndex || 0], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, moduleId, title, orderIndex: orderIndex || 0, lessons: [] });
  });
});

app.put('/api/chapters/:id', (req, res) => {
  const { title, orderIndex } = req.body;
  db.run(`UPDATE Chapters SET title = ?, orderIndex = ? WHERE id = ?`, [title, orderIndex, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.delete('/api/chapters/:id', (req, res) => {
  db.run(`DELETE FROM Chapters WHERE id = ?`, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// --- LECONS ---
app.post('/api/lessons', (req, res) => {
  const { chapterId, title, type, contentUrl, orderIndex } = req.body;
  db.run(`INSERT INTO Lessons (chapterId, title, type, contentUrl, orderIndex) VALUES (?, ?, ?, ?, ?)`, 
    [chapterId, title, type, contentUrl, orderIndex || 0], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, chapterId, title, type, contentUrl, orderIndex: orderIndex || 0 });
  });
});

app.put('/api/lessons/:id', (req, res) => {
  const { title, type, contentUrl, orderIndex } = req.body;
  db.run(`UPDATE Lessons SET title = ?, type = ?, contentUrl = ?, orderIndex = ? WHERE id = ?`, 
    [title, type, contentUrl, orderIndex, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.delete('/api/lessons/:id', (req, res) => {
  db.run(`DELETE FROM Lessons WHERE id = ?`, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});
// --- APPLICATIONS FORMATEUR ---
app.post('/api/user/apply-formateur', authenticateToken, (req, res) => {
  const { specialite, bio, photo } = req.body;
  if (!specialite || !bio) return res.status(400).json({ error: "Spécialité et bio requises." });

  db.run(`INSERT INTO FormateurApplications (userId, specialite, bio, photo) VALUES (?, ?, ?, ?)`,
    [req.user.id, specialite, bio, photo || ''], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, applicationId: this.lastID });
  });
});

app.get('/api/user/application-status', authenticateToken, (req, res) => {
  db.get(`SELECT status FROM FormateurApplications WHERE userId = ? ORDER BY id DESC LIMIT 1`, [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ status: row ? row.status : null });
  });
});


// --- ADMIN ROUTES ---
app.use('/api/admin', require('./adminRoutes')(db, authenticateToken));

// Formateur & Annonceur Routes
app.use('/api/formateur', require('./formateurRoutes')(db, authenticateToken));
app.use('/api/annonceur', require('./annonceurRoutes')(db, authenticateToken));

// --- ENROLLMENT ROUTES ---
app.use('/api/enroll', require('./enrollmentRoutes')(db, authenticateToken));

// --- PROGRESS ROUTES ---
app.post('/api/progress/lessons/:lessonId/complete', authenticateToken, (req, res) => {
  const { lessonId } = req.params;
  const { courseId } = req.body;

  if (!courseId) return res.status(400).json({ error: 'courseId requis.' });

  db.run(`INSERT OR IGNORE INTO LessonProgress (userId, lessonId, courseId) VALUES (?, ?, ?)`,
    [req.user.id, lessonId, courseId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.get('/api/progress/courses/:courseId', authenticateToken, (req, res) => {
  const { courseId } = req.params;

  db.get(`SELECT COUNT(*) as total FROM Lessons WHERE chapterId IN (SELECT id FROM Chapters WHERE moduleId IN (SELECT id FROM Modules WHERE formationId = ?))`,
    [courseId],
    (err, totalRow) => {
      if (err) return res.status(500).json({ error: err.message });

      const total = totalRow?.total || 0;

      db.all(`SELECT lessonId FROM LessonProgress WHERE userId = ? AND courseId = ?`,
        [req.user.id, courseId],
        (err, rows) => {
          if (err) return res.status(500).json({ error: err.message });

          const completedIds = rows.map(r => r.lessonId);
          const completed = completedIds.length;
          const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

          res.json({
            total,
            completed,
            progress,
            completedIds,
          });
        }
      );
    }
  );
});

// --- CERTIFICATE ROUTE ---
app.get('/api/certificates/generate/:courseId', authenticateToken, (req, res) => {
  const { courseId } = req.params;

  db.get(`SELECT COUNT(*) as total FROM Lessons WHERE chapterId IN (SELECT id FROM Chapters WHERE moduleId IN (SELECT id FROM Modules WHERE formationId = ?))`,
    [courseId], (err, totalRow) => {
      if (err) return res.status(500).json({ error: err.message });
      const total = totalRow?.total || 0;

      db.get(`SELECT COUNT(*) as completed FROM LessonProgress WHERE userId = ? AND courseId = ?`,
        [req.user.id, courseId], (err, compRow) => {
          if (err) return res.status(500).json({ error: err.message });

          if (total > 0 && compRow.completed < total) {
            return res.status(400).json({ error: 'Vous devez compléter toutes les leçons pour obtenir le certificat.' });
          }

          db.get(`SELECT firstName, lastName, email FROM Users WHERE id = ?`, [req.user.id], (err, user) => {
            if (err || !user) return res.status(500).json({ error: 'Utilisateur introuvable' });

            db.get(`SELECT title FROM Formations WHERE id = ?`, [courseId], (err, formation) => {
              if (err || !formation) return res.status(404).json({ error: 'Formation introuvable' });

              const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
              const certId = `NOV-${Date.now().toString(36).toUpperCase()}`;

              // Récupérer les modules de la formation
              db.all(`SELECT title FROM Modules WHERE formationId = ?`, [courseId], (err, modules) => {
                const doc = generateCertificate({
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  courseTitle: formation.title,
                  completionDate: date,
                  modules: modules || [],
                  certId,
                });

                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="certificat-${formation.title.toLowerCase().replace(/\s+/g, '-')}.pdf"`);
                doc.pipe(res);
                doc.end();
              });
            });
          });
        }
      );
    }
  );
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur Backend démarré sur http://localhost:${PORT}`);
  console.log(`[En attente des webhooks Kkiapay et FedaPay]`);
});
