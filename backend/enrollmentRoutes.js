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
    db.get("SELECT maxParticipants, enrolled, title, meetLink, whatsappLink FROM Formations WHERE id = ?", [courseId], (err, course) => {
      if (err) return res.status(500).json({ error: "Erreur serveur" });
      if (!course) return res.status(404).json({ error: "Formation introuvable" });

      const isFull = course.enrolled >= course.maxParticipants;
      const status = isFull ? 'waitlist' : 'active';
      
      const isMensuel = paymentType === 'mensuel';
      const actualAmount = isMensuel ? Math.ceil(amount / 3) : amount;
      const installmentsPaid = isFull ? 0 : 1; // 0 payé si sur liste d'attente
      const totalInstallments = isMensuel ? 3 : 1;

      // 2. Insérer l'inscription
      const query = `
        INSERT INTO Enrollments (
          userId, courseId, amount, transactionId, paymentMethod, status, 
          childFirstName, childLastName, childAge, parentName, parentPhone, parentEmail, address, paymentType,
          installmentsPaid, totalInstallments
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        userId, courseId, actualAmount, transactionId, paymentMethod, status,
        childFirstName, childLastName, childAge, parentName, parentPhone, parentEmail, address, paymentType,
        installmentsPaid, totalInstallments
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
          childName,
          meetLink: course.meetLink,
          whatsappLink: course.whatsappLink
        });
        sendEmail({ to: parentEmail || req.user.email, ...emailData }).catch(err => {
          console.error('Erreur envoi email confirmation:', err.message);
        });

        // SMS de confirmation
        const { sendSMS } = require('./smsService');
        if (status === 'active') {
          const smsText = `Bonjour ${parentName || req.user.firstName}, l'inscription de votre enfant a la formation ${course.title} est confirmee. Accedez a votre espace apprenant !`;
          sendSMS({ to: parentPhone || req.user.phone, message: smsText }).catch(err => {
            console.error('Erreur envoi SMS confirmation:', err.message);
          });
        } else if (status === 'waitlist') {
          const smsText = `Bonjour ${parentName || req.user.firstName}, la formation ${course.title} etant complete, vous avez ete ajoute(e) a la liste d'attente. Novatech Vision.`;
          sendSMS({ to: parentPhone || req.user.phone, message: smsText }).catch(err => {
            console.error('Erreur envoi SMS liste d\'attente:', err.message);
          });
        }
      });
    });
  });

  // Route pour l'historique utilisateur (Tableau de Bord)
  router.get('/my-enrollments', authenticateToken, (req, res) => {
    const query = `
      SELECT e.id, e.amount, e.paymentMethod, e.paymentType, e.status, e.createdAt, 
             e.childFirstName, e.childLastName, e.rating, e.installmentsPaid, e.totalInstallments,
             f.id as courseId, f.title as courseTitle, f.isOnline, f.meetLink, f.whatsappLink, f.imageUrl,
             f.startDate, f.endDate, f.duration, f.sessionDuration, f.isLive, f.liveRoomName, f.price as courseFullPrice
      FROM Enrollments e
      JOIN Formations f ON e.courseId = f.id
      WHERE e.userId = ?
      ORDER BY e.id DESC
    `;
    db.all(query, [req.user.id], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      
      if (rows.length === 0) return res.json([]);

      const promises = rows.map(row => {
        return new Promise((resolve) => {
          const totalLessonsQuery = `
            SELECT COUNT(*) as total FROM Lessons 
            WHERE chapterId IN (
              SELECT id FROM Chapters 
              WHERE moduleId IN (
                SELECT id FROM Modules WHERE formationId = ?
              )
            )
          `;
          db.get(totalLessonsQuery, [row.courseId], (err, totalRow) => {
            const total = totalRow ? totalRow.total : 0;

            const completedQuery = `
              SELECT COUNT(*) as completed FROM LessonProgress 
              WHERE userId = ? AND courseId = ?
            `;
            db.get(completedQuery, [req.user.id, row.courseId], (err, compRow) => {
              const completed = compRow ? compRow.completed : 0;
              row.progress = total > 0 ? Math.round((completed / total) * 100) : 0;
              resolve(row);
            });
          });
        });
      });

      Promise.all(promises).then((enrichedRows) => {
        res.json(enrichedRows);
      });
    });
  });

  // Route pour payer la mensualité suivante
  router.post('/payments/:id/pay-installment', authenticateToken, (req, res) => {
    const enrollmentId = req.params.id;
    const { transactionId, paymentMethod, amount } = req.body;

    db.get("SELECT installmentsPaid, totalInstallments, amount FROM Enrollments WHERE id = ? AND userId = ?", [enrollmentId, req.user.id], (err, enrollment) => {
      if (err) return res.status(500).json({ error: "Erreur serveur" });
      if (!enrollment) return res.status(404).json({ error: "Inscription introuvable" });

      if (enrollment.installmentsPaid >= enrollment.totalInstallments) {
        return res.status(400).json({ error: "Toutes les mensualités de cette formation ont déjà été payées." });
      }

      const nextPaidCount = enrollment.installmentsPaid + 1;
      const nextAmount = enrollment.amount + Number(amount);

      db.run(
        "UPDATE Enrollments SET installmentsPaid = ?, amount = ?, transactionId = ?, paymentMethod = ? WHERE id = ?",
        [nextPaidCount, nextAmount, transactionId, paymentMethod, enrollmentId],
        function(err) {
          if (err) return res.status(500).json({ error: "Erreur lors de la mise à jour du paiement" });
          res.json({ success: true, installmentsPaid: nextPaidCount, totalAmount: nextAmount });
        }
      );
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
          // Si l'inscription supprimée était active, on regarde s'il y a quelqu'un en liste d'attente
          db.get(
            "SELECT e.*, f.title as courseTitle FROM Enrollments e JOIN Formations f ON e.courseId = f.id WHERE e.courseId = ? AND e.status = 'waitlist' ORDER BY e.createdAt ASC LIMIT 1",
            [enrollment.courseId],
            (waitlistErr, nextEnrollment) => {
              if (!waitlistErr && nextEnrollment) {
                // On promeut cet étudiant
                db.run("UPDATE Enrollments SET status = 'active', installmentsPaid = 1 WHERE id = ?", [nextEnrollment.id], (promoErr) => {
                  if (!promoErr) {
                    console.log(`[WAITLIST] Étudiant ${nextEnrollment.id} promu à actif pour la formation ${enrollment.courseId}`);
                    // Envoyer un email de notification
                    const childName = nextEnrollment.childFirstName ? `${nextEnrollment.childFirstName} ${nextEnrollment.childLastName || ''}`.trim() : null;
                    sendEmail({
                      to: nextEnrollment.parentEmail || nextEnrollment.email,
                      subject: `Une place se libère ! Inscription active - Novatech Vision`,
                      html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                          <h2 style="color: #10b981;">Bonne nouvelle !</h2>
                          <p>Bonjour ${nextEnrollment.parentName || 'Parent'},</p>
                          <p>Une place vient de se libérer pour la formation <strong>${nextEnrollment.courseTitle}</strong>.</p>
                          <p>L'inscription de votre enfant <strong>${childName || 'Apprenant'}</strong> a été automatiquement activée et retirée de la liste d'attente.</p>
                          <p>Vous pouvez désormais accéder à son espace de cours en ligne.</p>
                          <hr style="border: none; border-top: 1px solid #e5e7eb;" />
                          <p style="color: #9ca3af; font-size: 12px;">Novatech Vision - Cotonou, Bénin</p>
                        </div>
                    }).catch(e => console.error("Erreur envoi email promotion liste d'attente:", e.message));

                    // Envoyer un SMS de notification
                    const { sendSMS } = require('./smsService');
                    const smsText = `Bonne nouvelle ! Une place s'est liberee pour ${nextEnrollment.courseTitle}. L'inscription de votre enfant est active. Novatech Vision.`;
                    sendSMS({ to: nextEnrollment.parentPhone, message: smsText }).catch(err => {
                      console.error('Erreur envoi SMS promotion:', err.message);
                    });
                  }
                });
              } else {
                // Personne en liste d'attente, on décrémente simplement le compteur d'inscrits
                db.run("UPDATE Formations SET enrolled = max(0, enrolled - 1), status = 'active' WHERE id = ?", [enrollment.courseId]);
              }
            }
          );
        }
        res.json({ success: true });
      });
    });
  });

  return router;
};
