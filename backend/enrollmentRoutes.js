const express = require('express');

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
      });
    });
  });

  // Route pour l'historique utilisateur (Tableau de Bord)
  router.get('/my-enrollments', authenticateToken, (req, res) => {
    const query = `
      SELECT e.id, e.amount, e.paymentMethod, e.paymentType, e.status, e.createdAt, 
             e.childFirstName, e.childLastName,
             f.id as courseId, f.title as courseTitle, f.isOnline, f.meetLink, f.whatsappLink, f.imageUrl,
             f.startDate, f.endDate, f.duration, f.sessionDuration
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

  return router;
};
