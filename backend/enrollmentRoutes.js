const express = require('express');
const { sendEmail } = require('./emailService');
const { enrollmentConfirmation } = require('./emailTemplates');

module.exports = function(db, authenticateToken) {
  const router = express.Router();

  // Route d'inscription
  router.post('/', authenticateToken, (req, res) => {
    const { 
      courseId, childFirstName, childLastName, childAge, 
      parentName, parentPhone, parentEmail, address, 
      paymentType, amount, paymentMethod, transactionId
    } = req.body;
    
    const userId = req.user.id;

    // 1. Vérifier la capacité de la formation
    db.get("SELECT maxParticipants, enrolled, title FROM Formations WHERE id = ?", [courseId], (err, course) => {
      if (err) return res.status(500).json({ error: "Erreur serveur" });
      if (!course) return res.status(404).json({ error: "Formation introuvable" });

      const isFull = course.enrolled >= course.maxParticipants;
      const status = isFull ? 'waitlist' : 'active';

      // 2. Insérer l'inscription
      const query = `
        INSERT INTO Enrollments (
          userId, courseId, amount, transactionId, paymentMethod, status, 
          childFirstName, childLastName, childAge, parentName, parentPhone, parentEmail, address, paymentType
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        userId, courseId, amount, transactionId, paymentMethod, status,
        childFirstName, childLastName, childAge, parentName, parentPhone, parentEmail, address, paymentType
      ];

      db.run(query, params, function(err) {
        if (err) return res.status(500).json({ error: "Erreur lors de l'enregistrement de l'inscription" });
        const enrollId = this.lastID;

        // 3. Mettre à jour le compteur de places si pas sur liste d'attente
        if (!isFull) {
          db.run("UPDATE Formations SET enrolled = enrolled + 1 WHERE id = ?", [courseId], (updateErr) => {
            if (updateErr) console.error("Erreur lors de l'incrémentation des inscrits", updateErr);
            
            // Marquer complet si c'était la dernière place
            if (course.enrolled + 1 >= course.maxParticipants) {
               db.run("UPDATE Formations SET status = 'full' WHERE id = ?", [courseId]);
            }
          });
        }

        res.json({ 
          success: true, 
          status, 
          message: isFull ? "Vous avez été placé(e) sur liste d'attente." : "Inscription confirmée avec succès.",
          enrollmentId: enrollId
        });

        // Email de confirmation (ne pas bloquer la réponse)
        const childName = childFirstName ? `${childFirstName} ${childLastName || ''}`.trim() : null;
        const emailData = enrollmentConfirmation({
          firstName: parentName || req.user.firstName,
          courseTitle: course.title,
          childName
        });
        sendEmail({ to: parentEmail || req.user.email, ...emailData }).catch(err => {
          console.error('Erreur envoi email confirmation:', err.message);
        });
      });
    });
  });

  // Route pour l'historique utilisateur (Tableau de Bord)
  router.get('/my-enrollments', authenticateToken, (req, res) => {
    const query = `
      SELECT e.id, e.amount, e.paymentMethod, e.paymentType, e.status, e.createdAt, 
             e.childFirstName, e.childLastName, e.rating,
             f.id as courseId, f.title as courseTitle, f.isOnline, f.meetLink, f.whatsappLink, f.imageUrl,
             f.startDate, f.endDate, f.duration, f.sessionDuration, f.isLive, f.liveRoomName
      FROM Enrollments e
      JOIN Formations f ON e.courseId = f.id
      WHERE e.userId = ?
      ORDER BY e.id DESC
    `;
    db.all(query, [req.user.id], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  // Route pour poser une question
  router.post('/questions', authenticateToken, (req, res) => {
    const { courseId, text } = req.body;
    if (!courseId || !text) return res.status(400).json({ error: "Champs requis manquants" });

    const studentName = req.user.firstName ? `${req.user.firstName} ${req.user.lastName || ''}`.trim() : 'Apprenant';

    db.run(
      'INSERT INTO CourseQuestions (courseId, studentName, text) VALUES (?, ?, ?)',
      [courseId, studentName, text],
      function(err) {
        if (err) return res.status(500).json({ error: "Erreur serveur lors de l'envoi de la question" });
        res.json({ success: true, questionId: this.lastID });
      }
    );
  });

  // Route pour lire ses propres questions
  router.get('/my-questions', authenticateToken, (req, res) => {
    // Les questions sont liées au nom de l'étudiant pour l'instant
    const studentName = req.user.firstName ? `${req.user.firstName} ${req.user.lastName || ''}`.trim() : 'Apprenant';
    const query = `
      SELECT q.*, f.title as courseTitle 
      FROM CourseQuestions q
      JOIN Formations f ON q.courseId = f.id
      WHERE q.studentName = ?
      ORDER BY q.createdAt DESC
    `;
    db.all(query, [studentName], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      
      // Fetch replies for these questions
      if (rows.length === 0) return res.json(rows);
      
      const questionIds = rows.map(r => r.id);
      db.all(`SELECT * FROM CourseQuestionReplies WHERE questionId IN (${questionIds.join(',')}) ORDER BY createdAt ASC`, [], (err, replies) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const rowsWithReplies = rows.map(row => ({
          ...row,
          replies: replies.filter(r => r.questionId === row.id)
        }));
        
        res.json(rowsWithReplies);
      });
    });
  });

  // Route pour répondre à une question existante (Apprenant)
  router.post('/questions/:id/reply', authenticateToken, (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Le texte de la réponse est requis" });

    db.run(
      'INSERT INTO CourseQuestionReplies (questionId, senderRole, text) VALUES (?, ?, ?)',
      [req.params.id, 'student', text],
      function(err) {
        if (err) return res.status(500).json({ error: "Erreur serveur" });
        
        // Mettre à jour le statut de la question principale
        db.run("UPDATE CourseQuestions SET status = 'pending' WHERE id = ?", [req.params.id], (err) => {
           res.json({ success: true });
        });
      }
    );
  });

  // Route pour noter une formation
  router.post('/enrollments/:id/rate', authenticateToken, (req, res) => {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: "Note invalide" });

    db.run(
      'UPDATE Enrollments SET rating = ? WHERE id = ? AND userId = ?',
      [rating, req.params.id, req.user.id],
      function(err) {
        if (err) return res.status(500).json({ error: "Erreur serveur" });
        res.json({ success: true });
      }
    );
  });

  // Route pour supprimer une inscription
  router.delete('/:id', authenticateToken, (req, res) => {
    db.get("SELECT courseId, status FROM Enrollments WHERE id = ? AND userId = ?", [req.params.id, req.user.id], (err, enrollment) => {
      if (err || !enrollment) return res.status(404).json({ error: "Inscription introuvable" });

      db.run("DELETE FROM Enrollments WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: "Erreur serveur" });
        
        if (enrollment.status !== 'waitlist') {
          db.run("UPDATE Formations SET enrolled = max(0, enrolled - 1), status = 'active' WHERE id = ?", [enrollment.courseId]);
        }
        res.json({ success: true });
      });
    });
  });

  return router;
};
