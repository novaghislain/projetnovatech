const express = require('express');
const bcrypt = require('bcryptjs');
const { sendEmail } = require('./emailService');
const fs = require('fs');
const path = require('path');

module.exports = function(db, authenticateToken) {
  const router = express.Router();

  // Middleware additionnel pour vérifier si l'utilisateur est admin
  const requireAdmin = (req, res, next) => {
    db.get("SELECT role FROM Users WHERE id = ?", [req.user.id], (err, user) => {
      if (err) return res.status(500).json({ error: "Erreur serveur" });
      if (!user || (user.role !== 'admin' && user.role !== 'admin_restreint')) return res.status(403).json({ error: "Accès refusé. Administrateur uniquement." });
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
    db.all("SELECT id, firstName, lastName, email, phone, role, status, createdAt FROM Users ORDER BY createdAt DESC", [], (err, rows) => {
      if (err) return res.status(500).json({ error: "Erreur serveur" });
      res.json(rows);
    });
  });

  router.post('/users', async (req, res) => {
    const { firstName, lastName, email, phone, password, role, status } = req.body;
    if (!firstName || !email || !password) {
      return res.status(400).json({ error: 'Le prénom, email et mot de passe sont requis' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const userRole = role || 'apprenant';
      const userStatus = status || 'active';

      db.run(
        `INSERT INTO Users (firstName, lastName, email, phone, password, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [firstName, lastName || '', email.toLowerCase(), phone || '', hashedPassword, userRole, userStatus],
        function (err) {
          if (err) {
            if (err.message.includes('UNIQUE')) {
              return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
            }
            return res.status(500).json({ error: 'Erreur lors de la création du compte.' });
          }
          res.json({ success: true, id: this.lastID });
        }
      );
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur lors de la création de l'utilisateur" });
    }
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
      SELECT e.id, e.id as transactionId, e.amountPaid as amount, e.totalAmount, e.paymentMethod, e.paymentType, e.createdAt, e.status, e.paymentProof, 
             COALESCE(u.firstName, e.guestFirstName) as firstName, 
             COALESCE(u.lastName, e.guestLastName) as lastName, 
             COALESCE(u.email, e.parentEmail, e.guestEmail) as email,
             f.title
      FROM Enrollments e
      LEFT JOIN Users u ON e.userId = u.id
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
                      subject: `Une place se libère ! Inscription active - FormationNova`,
                      html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                          <h2 style="color: #10b981;">Bonne nouvelle !</h2>
                          <p>Bonjour ${nextEnrollment.parentName || 'Parent'},</p>
                          <p>Une place vient de se libérer pour la formation <strong>${nextEnrollment.courseTitle}</strong>.</p>
                          <p>L'inscription de votre enfant <strong>${childName || 'Apprenant'}</strong> a été automatiquement activée.</p>
                          <p>Vous pouvez désormais accéder à son espace de cours en ligne.</p>
                          <hr style="border: none; border-top: 1px solid #e5e7eb;" />
                          <p style="color: #9ca3af; font-size: 12px;">FormationNova - Cotonou, Bénin</p>
                        </div>
                      `
                    }).catch(e => console.error("Erreur envoi email promotion:", e.message));

                    const { sendSMS } = require('./smsService');
                    const smsText = `Bonne nouvelle ! Une place s'est liberee pour ${nextEnrollment.courseTitle}. L'inscription de votre enfant est active. FormationNova.`;
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

          // Envoyer l'email d'approbation
          db.get(
            "SELECT e.*, f.title as courseTitle FROM Enrollments e JOIN Formations f ON e.courseId = f.id WHERE e.id = ?",
            [enrollmentId],
            (err, enrollData) => {
              if (!err && enrollData) {
                const { sendEmail } = require('./emailService');
                const childName = enrollData.childFirstName ? `${enrollData.childFirstName} ${enrollData.childLastName || ''}`.trim() : "Apprenant";
                const parentName = enrollData.parentName || enrollData.guestFirstName || "Parent";
                const emailToUse = enrollData.parentEmail || enrollData.guestEmail || enrollData.email;
                if (emailToUse) {
                  sendEmail({
                    to: emailToUse,
                    subject: "Paiement Approuvé - FormationNova",
                    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
                        <h2 style="color: #10b981;">Paiement Approuvé !</h2>
                        <p>Bonjour ${parentName},</p>
                        <p>Nous avons bien reçu et validé votre paiement pour la formation <strong>${enrollData.courseTitle}</strong>.</p>
                        <p>L'inscription de <strong>${childName}</strong> est maintenant <strong>ACTIVE</strong>.</p>
                        <p>Vous pouvez dès à présent vous connecter à votre espace pour accéder à la formation.</p>
                        <br/>
                        <a href="https://formationnova.vercel.app/login" style="background-color:#10b981;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">Accéder à mon espace</a>
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 30px; margin-bottom: 20px;" />
                        <p style="color: #9ca3af; font-size: 12px; text-align: center;">FormationNova - Cotonou, Bénin</p>
                      </div>
                    `
                  }).catch(e => console.error("Erreur envoi email approbation:", e.message));
                }
              }
            }
          );
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
                      subject: `Une place se libère ! Inscription active - FormationNova`,
                      html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                          <h2 style="color: #10b981;">Bonne nouvelle !</h2>
                          <p>Bonjour ${nextEnrollment.parentName || 'Parent'},</p>
                          <p>Une place vient de se libérer pour la formation <strong>${nextEnrollment.courseTitle}</strong>.</p>
                          <p>L'inscription de votre enfant <strong>${childName || 'Apprenant'}</strong> a été automatiquement activée.</p>
                          <p>Vous pouvez désormais accéder à son espace de cours en ligne.</p>
                          <hr style="border: none; border-top: 1px solid #e5e7eb;" />
                          <p style="color: #9ca3af; font-size: 12px;">FormationNova - Cotonou, Bénin</p>
                        </div>
                      `
                    }).catch(e => console.error("Erreur envoi email promotion:", e.message));

                    const { sendSMS } = require('./smsService');
                    const smsText = `Bonne nouvelle ! Une place s'est liberee pour ${nextEnrollment.courseTitle}. L'inscription de votre enfant est active. FormationNova.`;
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

  async function translateText(text, targetLang = 'en') {
    if (!text) return '';
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const data = await res.json();
      return data[0].map(item => item[0]).join('');
    } catch (err) {
      console.error("Translation error:", err);
      return '';
    }
  }

  router.post('/formations', async (req, res) => {
    const { title, titleEn, description, descriptionEn, category, categoryEn, ageGroup, level, duration, price, registrationFee, maxParticipants, status, imageUrl, imageUrls, isFull,
            whatsappLink, meetLink, startDate, endDate, enrollmentEndDate, location, isOnline, format, locationMode, formateurId, contactInstruction } = req.body;
    const slug = title ? title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';
    
    let finalDescriptionEn = descriptionEn;
    if (!finalDescriptionEn && description) {
      finalDescriptionEn = await translateText(description, 'en');
    }
    
    let finalTitleEn = titleEn;
    if (!finalTitleEn && title) {
      finalTitleEn = await translateText(title, 'en');
    }
    
    let finalCategoryEn = categoryEn;
    if (!finalCategoryEn && category) {
      finalCategoryEn = await translateText(category, 'en');
    }

    const query = `
      INSERT INTO Formations (title, titleEn, slug, description, descriptionEn, category, categoryEn, ageGroup, level, duration, price, registrationFee, maxParticipants, status, imageUrl, imageUrls, isFull,
                              whatsappLink, meetLink, startDate, endDate, enrollmentEndDate, location, isOnline, format, locationMode, formateurId, contactInstruction)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(query, [title, finalTitleEn || '', slug, description, finalDescriptionEn || '', category, finalCategoryEn || '', ageGroup, level || 'Tous niveaux', duration, price, registrationFee || 0, maxParticipants, status || 'published', imageUrl, imageUrls || '[]', isFull ? 1 : 0,
                   whatsappLink || '', meetLink || '', startDate || '', endDate || '', enrollmentEndDate || '', location || '', isOnline ? 1 : 0, format || 'en_ligne', locationMode || 'en_ligne', formateurId || null, contactInstruction || ''], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    });
  });

  router.put('/formations/:id', async (req, res) => {
    const { title, titleEn, description, descriptionEn, category, categoryEn, ageGroup, level, duration, price, registrationFee, maxParticipants, status, imageUrl, imageUrls, isFull,
            whatsappLink, meetLink, startDate, endDate, enrollmentEndDate, location, isOnline, format, locationMode, formateurId, contactInstruction } = req.body;
    const slug = title ? title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';
    
    let finalDescriptionEn = descriptionEn;
    if (!finalDescriptionEn && description) {
      finalDescriptionEn = await translateText(description, 'en');
    }
    
    let finalTitleEn = titleEn;
    if (!finalTitleEn && title) {
      finalTitleEn = await translateText(title, 'en');
    }
    
    let finalCategoryEn = categoryEn;
    if (!finalCategoryEn && category) {
      finalCategoryEn = await translateText(category, 'en');
    }

    const query = `
      UPDATE Formations SET title=?, titleEn=?, slug=?, description=?, descriptionEn=?, category=?, categoryEn=?, ageGroup=?, level=?, duration=?, price=?, registrationFee=?, maxParticipants=?, status=?, imageUrl=?, imageUrls=?, isFull=?,
                            whatsappLink=?, meetLink=?, startDate=?, endDate=?, enrollmentEndDate=?, location=?, isOnline=?, format=?, locationMode=?, formateurId=?, contactInstruction=?
      WHERE id=?
    `;
    db.run(query, [title, finalTitleEn || '', slug, description, finalDescriptionEn || '', category, finalCategoryEn || '', ageGroup, level || 'Tous niveaux', duration, price, registrationFee || 0, maxParticipants, status, imageUrl, imageUrls || '[]', isFull ? 1 : 0,
                   whatsappLink || '', meetLink || '', startDate || '', endDate || '', enrollmentEndDate || '', location || '', isOnline ? 1 : 0, format || 'en_ligne', locationMode || 'en_ligne', formateurId || null, contactInstruction || '',
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

  // 5. Categories CRUD
  router.get('/categories', (req, res) => {
    db.all("SELECT c.*, (SELECT COUNT(*) FROM Formations WHERE category = c.name AND status != 'draft') as courseCount FROM Categories c ORDER BY c.name ASC", (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  router.post('/categories', (req, res) => {
    const { name, description } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Le nom est requis.' });
    const slug = name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    db.run("INSERT INTO Categories (name, slug, description) VALUES (?, ?, ?)",
      [name.trim(), slug, description || ''],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Cette catégorie existe déjà.' });
          return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, id: this.lastID });
      }
    );
  });

  router.put('/categories/:id', (req, res) => {
    const { name, description } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Le nom est requis.' });
    const slug = name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    db.run("UPDATE Categories SET name=?, slug=?, description=? WHERE id=?",
      [name.trim(), slug, description || '', req.params.id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      }
    );
  });

  router.delete('/categories/:id', (req, res) => {
    const catId = req.params.id;
    db.get("SELECT name FROM Categories WHERE id = ?", [catId], (err, cat) => {
      if (err || !cat) return res.status(404).json({ error: 'Catégorie introuvable.' });
      db.get("SELECT COUNT(*) as count FROM Formations WHERE category = ? AND status != 'draft'", [cat.name], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row.count > 0) return res.status(400).json({ error: `Impossible de supprimer : ${row.count} formation(s) utilisent cette catégorie.` });
        db.run("DELETE FROM Categories WHERE id = ?", [catId], (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true });
        });
      });
    });
  });

  // 6. Sessions CRUD
  router.get('/sessions', (req, res) => {
    const query = `
      SELECT s.*, f.title as formationTitle
      FROM Sessions s
      JOIN Formations f ON s.formationId = f.id
      ORDER BY s.startDate DESC
    `;
    db.all(query, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  router.post('/sessions', (req, res) => {
    const { formationId, startDate, endDate, maxPlaces, status } = req.body;
    if (!formationId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Formation, date de début et date de fin requis.' });
    }
    db.run(
      `INSERT INTO Sessions (formationId, startDate, endDate, maxPlaces, status) VALUES (?, ?, ?, ?, ?)`,
      [formationId, startDate, endDate, maxPlaces || 20, status || 'planifiee'],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
      }
    );
  });

  router.put('/sessions/:id', (req, res) => {
    const { formationId, startDate, endDate, maxPlaces, status } = req.body;
    db.run(
      `UPDATE Sessions SET formationId=?, startDate=?, endDate=?, maxPlaces=?, status=? WHERE id=?`,
      [formationId, startDate, endDate, maxPlaces, status, req.params.id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      }
    );
  });

  router.delete('/sessions/:id', (req, res) => {
    db.run("DELETE FROM Sessions WHERE id = ?", [req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });

  // 7. Testimonials (Témoignages)
  router.post('/testimonials', (req, res) => {
    const { authorName, age, courseName, comment, rating, avatar, mediaUrl, mediaType } = req.body;
    db.run(
      "INSERT INTO Testimonials (authorName, age, courseName, comment, rating, avatar, mediaUrl, mediaType) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [authorName, age, courseName, comment, rating || 5, avatar || '/2x.png', mediaUrl || '', mediaType || 'none'],
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
    const { title, imageUrl, category, mediaType } = req.body;
    db.run(
      "INSERT INTO Gallery (title, imageUrl, category, mediaType) VALUES (?, ?, ?, ?)",
      [title, imageUrl, category || 'Autre', mediaType || 'image'],
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
        subject: `Re: ${message.subject || 'Votre message - FormationNova'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">FormationNova</h2>
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
            <p style="color: #9ca3af; font-size: 12px;">FormationNova - Cotonou, Bénin</p>
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

  router.post('/formateurs', async (req, res) => {
    const { nom, prenom, email, telephone, specialite, bio, photo, status, password } = req.body;
    if (!nom || !prenom) return res.status(400).json({ error: 'Nom et prénom requis.' });
    if (!email) return res.status(400).json({ error: 'L\'adresse email est requise.' });

    const lowerEmail = email.toLowerCase().trim();

    db.get("SELECT * FROM Users WHERE email = ?", [lowerEmail], async (err, user) => {
      if (err) return res.status(500).json({ error: "Erreur serveur" });

      const insertFormateur = () => {
        db.run(
          `INSERT INTO Formateurs (nom, prenom, email, telephone, specialite, bio, photo, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [nom, prenom, lowerEmail, telephone, specialite, bio, photo, status || 'actif'],
          function(err) {
            if (err) {
              if (err.message.includes('UNIQUE')) {
                return res.status(400).json({ error: 'Un formateur avec cet email existe déjà.' });
              }
              return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, id: this.lastID });
          }
        );
      };

      if (user) {
        // User already exists, update their role to formateur
        db.run("UPDATE Users SET role = 'formateur' WHERE id = ?", [user.id], (updateErr) => {
          if (updateErr) return res.status(500).json({ error: updateErr.message });
          insertFormateur();
        });
      } else {
        // User does not exist, create the account
        try {
          const defaultPassword = password || 'password123';
          const hashedPassword = await bcrypt.hash(defaultPassword, 10);
          db.run(
            `INSERT INTO Users (firstName, lastName, email, phone, password, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [prenom, nom, lowerEmail, telephone || '', hashedPassword, 'formateur', 'active'],
            function(insertErr) {
              if (insertErr) {
                return res.status(500).json({ error: "Erreur lors de la création du compte utilisateur : " + insertErr.message });
              }
              insertFormateur();
            }
          );
        } catch (hashError) {
          return res.status(500).json({ error: "Erreur lors du hachage du mot de passe." });
        }
      }
    });
  });

  router.put('/formateurs/:id', (req, res) => {
    const { nom, prenom, email, telephone, specialite, bio, photo, status, password } = req.body;
    const formateurId = req.params.id;
    if (!email) return res.status(400).json({ error: 'L\'adresse email est requise.' });

    const lowerEmail = email.toLowerCase().trim();

    db.get("SELECT email FROM Formateurs WHERE id = ?", [formateurId], (err, oldFormateur) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!oldFormateur) return res.status(404).json({ error: "Formateur introuvable." });

      const oldEmail = oldFormateur.email;

      const proceedUpdateFormateur = () => {
        db.run(
          `UPDATE Formateurs SET nom=?, prenom=?, email=?, telephone=?, specialite=?, bio=?, photo=?, status=? WHERE id=?`,
          [nom, prenom, lowerEmail, telephone, specialite, bio, photo, status, formateurId],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
          }
        );
      };

      // Find the corresponding user in the Users table by oldEmail
      db.get("SELECT * FROM Users WHERE email = ?", [oldEmail.toLowerCase()], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });

        if (user) {
          // If we want to change their password or details:
          let updateSql = "UPDATE Users SET firstName = ?, lastName = ?, email = ?, phone = ?, role = 'formateur'";
          let params = [prenom, nom, lowerEmail, telephone || ''];

          if (password && password.trim().length >= 6) {
            try {
              const hashedPassword = await bcrypt.hash(password, 10);
              updateSql += ", password = ?";
              params.push(hashedPassword);
            } catch (hashErr) {
              return res.status(500).json({ error: "Erreur lors du hachage du mot de passe." });
            }
          }

          updateSql += " WHERE id = ?";
          params.push(user.id);

          db.run(updateSql, params, (updateUserErr) => {
            if (updateUserErr) return res.status(500).json({ error: updateUserErr.message });
            proceedUpdateFormateur();
          });
        } else {
          // If the user doesn't exist, create it
          try {
            const defaultPassword = password || 'password123';
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);
            db.run(
              `INSERT INTO Users (firstName, lastName, email, phone, password, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [prenom, nom, lowerEmail, telephone || '', hashedPassword, 'formateur', 'active'],
              function(insertErr) {
                if (insertErr) return res.status(500).json({ error: insertErr.message });
                proceedUpdateFormateur();
              }
            );
          } catch (hashError) {
            return res.status(500).json({ error: "Erreur de hachage" });
          }
        }
      });
    });
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

  // 13. General Settings GET & PUT
  router.get('/settings', (req, res) => {
    db.get("SELECT * FROM GeneralSettings WHERE id = 1", [], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      
      let lastSave = null;
      try {
        const dbFilePath = path.resolve(__dirname, 'database.sqlite');
        if (fs.existsSync(dbFilePath)) {
          const stats = fs.statSync(dbFilePath);
          lastSave = stats.mtime;
        }
      } catch (statErr) {
        console.error("Error fetching db modification time:", statErr);
      }
      
      res.json({
        ...(row || {}),
        lastBackup: lastSave ? lastSave.toISOString() : null
      });
    });
  });

  router.put('/settings', (req, res) => {
    const { siteName, contactEmail, contactPhone, themeColor, fontFamily, registrationStatus, defaultRole, seoTitle, seoDescription, seoKeywords, smtpUser, smtpPass, contactReceiverEmail, smtpHost, smtpPort } = req.body;
    db.run(
      `UPDATE GeneralSettings SET 
        siteName = ?, contactEmail = ?, contactPhone = ?, themeColor = ?, 
        fontFamily = ?, registrationStatus = ?, defaultRole = ?,
        seoTitle = ?, seoDescription = ?, seoKeywords = ?,
        smtpUser = ?, smtpPass = ?, contactReceiverEmail = ?, smtpHost = ?, smtpPort = ?
       WHERE id = 1`,
      [siteName, contactEmail, contactPhone, themeColor, fontFamily, registrationStatus, defaultRole, seoTitle, seoDescription, seoKeywords, smtpUser, smtpPass, contactReceiverEmail, smtpHost, smtpPort],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      }
    );
  });

  return router;
};
