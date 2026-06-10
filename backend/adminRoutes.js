const express = require('express');
const { sendEmail } = require('./emailService');

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
    db.get("SELECT COUNT(*) as count FROM Formations WHERE status IN ('published','active')", (err, row) => {
      stats.activeFormations = row ? row.count : 0;
      db.get("SELECT COUNT(*) as count FROM Users", (err, row) => {
        stats.totalUsers = row ? row.count : 0;
        // Assurer que le revenu est bien calculé à partir des paiements validés
        db.get("SELECT SUM(amount) as sum FROM Enrollments WHERE status = 'active' OR status = 'completed'", (err, row) => {
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
      SELECT e.id, e.id as transactionId, e.amountPaid as amount, e.totalAmount, e.paymentMethod, e.paymentType, e.createdAt, e.status, 
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
    const enrollmentId = req.params.id;

    db.get("SELECT courseId, status FROM Enrollments WHERE id = ?", [enrollmentId], (err, oldEnrollment) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!oldEnrollment) return res.status(404).json({ error: "Inscription introuvable" });

      db.run('UPDATE Enrollments SET status = ? WHERE id = ?', [status, enrollmentId], function(err) {
        if (err) return res.status(500).json({ error: err.message });

        const wasActive = oldEnrollment.status === 'active' || oldEnrollment.status === 'completed';
        const isActiveNow = status === 'active' || status === 'completed';

        if (wasActive && !isActiveNow) {
          db.get(
            "SELECT e.*, f.title as courseTitle FROM Enrollments e JOIN Formations f ON e.courseId = f.id WHERE e.courseId = ? AND e.status = 'waitlist' ORDER BY e.createdAt ASC LIMIT 1",
            [oldEnrollment.courseId],
            (waitlistErr, nextEnrollment) => {
              if (!waitlistErr && nextEnrollment) {
                db.run("UPDATE Enrollments SET status = 'active', installmentsPaid = 1 WHERE id = ?", [nextEnrollment.id], (promoErr) => {
                  if (!promoErr) {
                    console.log(`[WAITLIST] Étudiant ${nextEnrollment.id} promu à actif pour la formation ${oldEnrollment.courseId} suite à désactivation admin`);
                    const childName = nextEnrollment.childFirstName ? `${nextEnrollment.childFirstName} ${nextEnrollment.childLastName || ''}`.trim() : null;
                    sendEmail({
                      to: nextEnrollment.parentEmail || nextEnrollment.email,
                      subject: `Une place se libère ! Inscription active - Novatech Vision`,
                      html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                          <h2 style="color: #10b981;">Bonne nouvelle !</h2>
                          <p>Bonjour ${nextEnrollment.parentName || 'Parent'},</p>
                          <p>Une place vient de se libérer pour la formation <strong>${nextEnrollment.courseTitle}</strong>.</p>
                          <p>L'inscription de votre enfant <strong>${childName || 'Apprenant'}</strong> a été automatiquement activée.</p>
                          <p>Vous pouvez désormais accéder à son espace de cours en ligne.</p>
                          <hr style="border: none; border-top: 1px solid #e5e7eb;" />
                          <p style="color: #9ca3af; font-size: 12px;">Novatech Vision - Cotonou, Bénin</p>
                        </div>
                      `
                    }).catch(e => console.error("Erreur envoi email promotion:", e.message));

                    const { sendSMS } = require('./smsService');
                    const smsText = `Bonne nouvelle ! Une place s'est liberee pour ${nextEnrollment.courseTitle}. L'inscription de votre enfant est active. Novatech Vision.`;
                    sendSMS({ to: nextEnrollment.parentPhone, message: smsText }).catch(err => {
                      console.error('Erreur envoi SMS promotion:', err.message);
                    });
                  }
                });
              } else {
                db.run("UPDATE Formations SET enrolled = max(0, enrolled - 1), status = 'active' WHERE id = ?", [oldEnrollment.courseId]);
              }
            }
          );
        } else if (!wasActive && isActiveNow) {
          db.run("UPDATE Formations SET enrolled = enrolled + 1 WHERE id = ?", [oldEnrollment.courseId], (updateErr) => {
            db.get("SELECT enrolled, maxParticipants FROM Formations WHERE id = ?", [oldEnrollment.courseId], (err, course) => {
              if (!err && course && course.enrolled >= course.maxParticipants) {
                db.run("UPDATE Formations SET status = 'full' WHERE id = ?", [oldEnrollment.courseId]);
              }
            });
          });
        }

        res.json({ success: true });
      });
    });
  });

  router.delete('/payments/:id', (req, res) => {
    const enrollmentId = req.params.id;
    db.get("SELECT courseId, status FROM Enrollments WHERE id = ?", [enrollmentId], (err, enrollment) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!enrollment) return res.status(404).json({ error: "Inscription introuvable" });

      db.run('DELETE FROM Enrollments WHERE id = ?', [enrollmentId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        if (enrollment.status !== 'waitlist') {
          db.get(
            "SELECT e.*, f.title as courseTitle FROM Enrollments e JOIN Formations f ON e.courseId = f.id WHERE e.courseId = ? AND e.status = 'waitlist' ORDER BY e.createdAt ASC LIMIT 1",
            [enrollment.courseId],
            (waitlistErr, nextEnrollment) => {
              if (!waitlistErr && nextEnrollment) {
                db.run("UPDATE Enrollments SET status = 'active', installmentsPaid = 1 WHERE id = ?", [nextEnrollment.id], (promoErr) => {
                  if (!promoErr) {
                    console.log(`[WAITLIST] Étudiant ${nextEnrollment.id} promu à actif pour la formation ${enrollment.courseId} suite à suppression admin`);
                    const childName = nextEnrollment.childFirstName ? `${nextEnrollment.childFirstName} ${nextEnrollment.childLastName || ''}`.trim() : null;
                    sendEmail({
                      to: nextEnrollment.parentEmail || nextEnrollment.email,
                      subject: `Une place se libère ! Inscription active - Novatech Vision`,
                      html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                          <h2 style="color: #10b981;">Bonne nouvelle !</h2>
                          <p>Bonjour ${nextEnrollment.parentName || 'Parent'},</p>
                          <p>Une place vient de se libérer pour la formation <strong>${nextEnrollment.courseTitle}</strong>.</p>
                          <p>L'inscription de votre enfant <strong>${childName || 'Apprenant'}</strong> a été automatiquement activée.</p>
                          <p>Vous pouvez désormais accéder à son espace de cours en ligne.</p>
                          <hr style="border: none; border-top: 1px solid #e5e7eb;" />
                          <p style="color: #9ca3af; font-size: 12px;">Novatech Vision - Cotonou, Bénin</p>
                        </div>
                      `
                    }).catch(e => console.error("Erreur envoi email promotion:", e.message));

                    const { sendSMS } = require('./smsService');
                    const smsText = `Bonne nouvelle ! Une place s'est liberee pour ${nextEnrollment.courseTitle}. L'inscription de votre enfant est active. Novatech Vision.`;
                    sendSMS({ to: nextEnrollment.parentPhone, message: smsText }).catch(err => {
                      console.error('Erreur envoi SMS promotion:', err.message);
                    });
                  }
                });
              } else {
                db.run("UPDATE Formations SET enrolled = max(0, enrolled - 1), status = 'published' WHERE id = ?", [enrollment.courseId]);
              }
            }
          );
        }
        res.json({ success: true });
      });
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
    const { title, description, category, ageGroup, duration, price, maxParticipants, status, imageUrl, isFull,
            whatsappLink, meetLink, startDate, endDate, location, isOnline } = req.body;
    const slug = title ? title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';
    const query = `
      INSERT INTO Formations (title, slug, description, category, ageGroup, duration, price, maxParticipants, status, imageUrl, isFull,
                              whatsappLink, meetLink, startDate, endDate, location, isOnline)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(query, [title, slug, description, category, ageGroup, duration, price, maxParticipants, status || 'published', imageUrl, isFull ? 1 : 0,
                   whatsappLink || '', meetLink || '', startDate || '', endDate || '', location || '', isOnline ? 1 : 0], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    });
  });

  router.put('/formations/:id', (req, res) => {
    const { title, description, category, ageGroup, duration, price, maxParticipants, status, imageUrl, isFull,
            whatsappLink, meetLink, startDate, endDate, location, isOnline } = req.body;
    const slug = title ? title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';
    const query = `
      UPDATE Formations SET title=?, slug=?, description=?, category=?, ageGroup=?, duration=?, price=?, maxParticipants=?, status=?, imageUrl=?, isFull=?,
                            whatsappLink=?, meetLink=?, startDate=?, endDate=?, location=?, isOnline=?
      WHERE id=?
    `;
    db.run(query, [title, slug, description, category, ageGroup, duration, price, maxParticipants, status, imageUrl, isFull ? 1 : 0,
                   whatsappLink || '', meetLink || '', startDate || '', endDate || '', location || '', isOnline ? 1 : 0,
                   req.params.id], (err) => {
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

  // 7. Pages Statiques
  router.put('/pages/:slug', (req, res) => {
    const { title, content } = req.body;
    db.run(
      "UPDATE StaticPages SET title = ?, content = ?, updatedAt = CURRENT_TIMESTAMP WHERE slug = ?",
      [title, content, req.params.slug],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      }
    );
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
    const { replyBody } = req.body;

    db.get("SELECT name, email, subject, body FROM Messages WHERE id = ?", [req.params.id], (err, message) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!message) return res.status(404).json({ error: 'Message introuvable.' });

      sendEmail({
        to: message.email,
        subject: `Re: ${message.subject || 'Votre message - Novatech Vision'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Novatech Vision</h2>
            <p>Bonjour ${message.name},</p>
            <div style="background: #f3f4f6; padding: 16px; border-radius: 6px; margin: 16px 0;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;"><strong>Votre message :</strong></p>
              <p style="margin: 8px 0 0; color: #374151;">${message.body}</p>
            </div>
            <div style="background: #eff6ff; padding: 16px; border-radius: 6px; margin: 16px 0;">
              <p style="margin: 0; color: #2563eb; font-size: 14px;"><strong>Notre réponse :</strong></p>
              <p style="margin: 8px 0 0; color: #374151;">${replyBody}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">N'hésitez pas à nous recontacter si vous avez d'autres questions.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb;" />
            <p style="color: #9ca3af; font-size: 12px;">Novatech Vision - Cotonou, Bénin</p>
          </div>
        `,
      }).then(() => console.log('[EMAIL] Réponse envoyée à', message.email))
        .catch(err => console.error('[EMAIL ERREUR]', err.message));

      db.run("UPDATE Messages SET isRead = 1 WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Email envoyé et message marqué comme lu.' });
      });
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
