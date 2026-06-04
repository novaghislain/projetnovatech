const express = require('express');

module.exports = function(db, authenticateToken) {
  const router = express.Router();

  // Middleware additionnel pour vérifier si l'utilisateur est admin
  const requireAdmin = (req, res, next) => {
    db.get("SELECT role FROM Users WHERE id = ?", [req.user.id], (err, user) => {
      if (err) return res.status(500).json({ error: "Erreur serveur" });
      if (!user || user.role !== 'admin') return res.status(403).json({ error: "Accès refusé. Administrateur uniquement." });
      next();
    });
  };

  // Appliquer les deux middlewares
  router.use(authenticateToken);
  router.use(requireAdmin);

  // 1. Statistiques Globales
  router.get('/stats', (req, res) => {
    const stats = {};
    db.get("SELECT COUNT(*) as count FROM Formations WHERE status='published'", (err, row) => {
      stats.activeFormations = row ? row.count : 0;
      db.get("SELECT COUNT(*) as count FROM Users", (err, row) => {
        stats.totalUsers = row ? row.count : 0;
        db.get("SELECT SUM(amount) as sum FROM Enrollments WHERE status IN ('active', 'completed')", (err, row) => {
          stats.totalRevenue = row && row.sum ? row.sum : 0;
          res.json(stats);
        });
      });
    });
  });

  // 2. Utilisateurs
  router.get('/users', (req, res) => {
    db.all("SELECT id, firstName, lastName, email, phone, role, status, createdAt FROM Users ORDER BY id DESC", (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  router.put('/users/:id/role', (req, res) => {
    const { role } = req.body;
    db.run("UPDATE Users SET role = ? WHERE id = ?", [role, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });

  router.put('/users/:id/status', (req, res) => {
    const { status } = req.body; // 'active' ou 'blocked'
    db.run("UPDATE Users SET status = ? WHERE id = ?", [status, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });

  router.delete('/users/:id', (req, res) => {
    db.run("DELETE FROM Users WHERE id = ?", [req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });

  // 3. Paiements / Inscriptions
  router.get('/payments', (req, res) => {
    const query = `
      SELECT e.id, e.id as transactionId, e.amount, e.paymentMethod, e.createdAt, e.status, 
             u.firstName, u.lastName, u.email,
             f.title
      FROM Enrollments e
      JOIN Users u ON e.userId = u.id
      JOIN Formations f ON e.courseId = f.id
      ORDER BY e.id DESC
    `;
    db.all(query, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  router.put('/payments/:id/status', (req, res) => {
    const { status } = req.body;
    db.run('UPDATE Enrollments SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });

  router.delete('/payments/:id', (req, res) => {
    db.run('DELETE FROM Enrollments WHERE id = ?', [req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });

  // 4. Formations CRUD
  router.get('/formations', (req, res) => {
    db.all("SELECT * FROM Formations ORDER BY id DESC", (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  router.post('/formations', (req, res) => {
    const { title, description, category, ageGroup, duration, price, maxParticipants, status, imageUrl, isFull } = req.body;
    const query = `
      INSERT INTO Formations (title, description, category, ageGroup, duration, price, maxParticipants, status, imageUrl, isFull)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(query, [title, description, category, ageGroup, duration, price, maxParticipants, status || 'published', imageUrl, isFull ? 1 : 0], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    });
  });

  router.put('/formations/:id', (req, res) => {
    const { title, description, category, ageGroup, duration, price, maxParticipants, status, imageUrl, isFull } = req.body;
    const query = `
      UPDATE Formations SET title=?, description=?, category=?, ageGroup=?, duration=?, price=?, maxParticipants=?, status=?, imageUrl=?, isFull=?
      WHERE id=?
    `;
    db.run(query, [title, description, category, ageGroup, duration, price, maxParticipants, status, imageUrl, isFull ? 1 : 0, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });

  router.delete('/formations/:id', (req, res) => {
    db.run("DELETE FROM Formations WHERE id=?", [req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });

  // 5. Testimonials (Témoignages)
  router.post('/testimonials', (req, res) => {
    const { authorName, age, courseName, comment, rating, avatar } = req.body;
    db.run(
      "INSERT INTO Testimonials (authorName, age, courseName, comment, rating, avatar) VALUES (?, ?, ?, ?, ?, ?)",
      [authorName, age, courseName, comment, rating || 5, avatar || '/2x.png'],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
      }
    );
  });

  router.delete('/testimonials/:id', (req, res) => {
    db.run("DELETE FROM Testimonials WHERE id=?", [req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });

  // 6. Gallery (Galerie)
  router.post('/gallery', (req, res) => {
    const { title, imageUrl, category } = req.body;
    db.run(
      "INSERT INTO Gallery (title, imageUrl, category) VALUES (?, ?, ?)",
      [title, imageUrl, category || 'Autre'],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
      }
    );
  });

  router.delete('/gallery/:id', (req, res) => {
    db.run("DELETE FROM Gallery WHERE id=?", [req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });

  // MESSAGES (CONTACT)
  router.get('/messages', (req, res) => {
    db.all("SELECT * FROM Messages ORDER BY createdAt DESC", (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  router.put('/messages/:id/read', (req, res) => {
    db.run("UPDATE Messages SET isRead = 1 WHERE id = ?", [req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });

  router.post('/messages/:id/reply', (req, res) => {
    // Dans un vrai projet, ici on enverrait un email via nodemailer (ex: transport.sendMail(...))
    // On va simuler l'envoi en mettant à jour le message pour indiquer qu'il a été répondu
    console.log(`[Simulation Email] Réponse envoyée à l'auteur du message ${req.params.id} avec le texte : ${req.body.replyBody}`);
    
    // On le marque aussi comme lu au passage
    db.run("UPDATE Messages SET isRead = 1 WHERE id = ?", [req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Email envoyé et message marqué comme lu.' });
    });
  });

  router.delete('/messages/:id', (req, res) => {
    db.run("DELETE FROM Messages WHERE id = ?", [req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });

  // ── FORMATEURS ──
  router.get('/formateurs', (req, res) => {
    db.all("SELECT * FROM Formateurs ORDER BY id DESC", (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  router.post('/formateurs', (req, res) => {
    const { nom, prenom, email, telephone, specialite, bio, photo, status } = req.body;
    if (!nom || !prenom) return res.status(400).json({ error: 'Nom et prénom requis.' });
    db.run(
      `INSERT INTO Formateurs (nom, prenom, email, telephone, specialite, bio, photo, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nom, prenom, email, telephone, specialite, bio, photo, status || 'actif'],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
      }
    );
  });

  router.put('/formateurs/:id', (req, res) => {
    const { nom, prenom, email, telephone, specialite, bio, photo, status } = req.body;
    db.run(
      `UPDATE Formateurs SET nom=?, prenom=?, email=?, telephone=?, specialite=?, bio=?, photo=?, status=? WHERE id=?`,
      [nom, prenom, email, telephone, specialite, bio, photo, status, req.params.id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      }
    );
  });

  router.delete('/formateurs/:id', (req, res) => {
    db.run("DELETE FROM Formateurs WHERE id = ?", [req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });

  // ── APPLICATIONS FORMATEUR ──
  router.get('/applications', (req, res) => {
    db.all(`
      SELECT a.*, u.firstName, u.lastName, u.email 
      FROM FormateurApplications a 
      JOIN Users u ON a.userId = u.id 
      ORDER BY a.createdAt DESC
    `, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  router.post('/applications/:id/approve', (req, res) => {
    db.get(`SELECT * FROM FormateurApplications WHERE id = ?`, [req.params.id], (err, application) => {
      if (err || !application) return res.status(404).json({ error: "Candidature introuvable." });
      
      db.get(`SELECT firstName, lastName, email, phone FROM Users WHERE id = ?`, [application.userId], (err, user) => {
        if (err || !user) return res.status(404).json({ error: "Utilisateur introuvable." });
        
        // 1. Mettre à jour le statut de la candidature
        db.run(`UPDATE FormateurApplications SET status = 'approved' WHERE id = ?`, [req.params.id], (err) => {
          if (err) return res.status(500).json({ error: err.message });
          
          // 2. Changer le rôle du User
          db.run(`UPDATE Users SET role = 'formateur' WHERE id = ?`, [application.userId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // 3. Créer la fiche publique du formateur
            db.run(`INSERT INTO Formateurs (nom, prenom, email, telephone, specialite, bio, photo) VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [user.lastName, user.firstName, user.email, user.phone || '', application.specialite, application.bio, application.photo || '/default-avatar.png'],
              (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true });
              }
            );
          });
        });
      });
    });
  });

  router.post('/applications/:id/reject', (req, res) => {
    db.run(`UPDATE FormateurApplications SET status = 'rejected' WHERE id = ?`, [req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });

  router.delete('/applications/:id', (req, res) => {
    db.run(`DELETE FROM FormateurApplications WHERE id = ?`, [req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });

  return router;
};
