const express = require('express');

module.exports = (db, authenticateToken) => {
  const router = express.Router();

  router.get('/dashboard', authenticateToken, (req, res) => {
    if (req.user.role !== 'formateur' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // 1. Get the formateur profile for this user (if not admin)
    if (!isAdmin) {
      getFormateurId(userId, (err, formateurId) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        fetchCourses(formateurId);
      });
    } else {
      // Admin sees everything
      fetchCourses(null);
    }

    function fetchCourses(formateurId) {
      const query = formateurId ? 'SELECT * FROM Formations WHERE formateurId = ?' : 'SELECT * FROM Formations';
      const params = formateurId ? [formateurId] : [];
      
      db.all(query, params, (err, courses) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });

        const totalCourses = courses.length;
        const courseIds = courses.map(c => c.id);
        const ratingQuery = courseIds.length > 0 
          ? `SELECT AVG(rating) as avgRating FROM Enrollments WHERE rating IS NOT NULL AND courseId IN (${courseIds.join(',')})` 
          : `SELECT 0 as avgRating`;

        db.get(ratingQuery, [], (err, ratingData) => {
          if (err) return res.status(500).json({ error: 'Erreur rating' });
          const avgRating = ratingData.avgRating ? parseFloat(ratingData.avgRating).toFixed(1) : 0;

          // Fetch students
          const studentsQuery = courseIds.length > 0 
            ? `SELECT Enrollments.id as enrollmentId, Users.firstName, Users.lastName, Users.email, 
                      Enrollments.guestFirstName, Enrollments.guestLastName, Enrollments.guestEmail,
                      Formations.title as courseTitle, Enrollments.createdAt as date, Enrollments.amount, Enrollments.progress, Enrollments.exercises 
               FROM Enrollments 
               LEFT JOIN Users ON Enrollments.userId = Users.id 
               JOIN Formations ON Enrollments.courseId = Formations.id 
               WHERE Enrollments.courseId IN (${courseIds.join(',')})`
            : `SELECT 1 WHERE 0`; // dummy query if no courses

          db.all(studentsQuery, [], (err, studentsData) => {
          if (err) return res.status(500).json({ error: 'Erreur base de données (students)' });

          const totalStudents = studentsData.length;

          // Fetch questions
          db.all('SELECT CourseQuestions.*, Formations.title as courseTitle FROM CourseQuestions JOIN Formations ON CourseQuestions.courseId = Formations.id WHERE Formations.id IN (' + (courseIds.length > 0 ? courseIds.join(',') : '0') + ') ORDER BY CourseQuestions.createdAt DESC', (err, questionsData) => {
            if (err) return res.status(500).json({ error: 'Erreur base de données (questions)' });

            const questionIds = questionsData.map(q => q.id);
            const qIdsStr = questionIds.length > 0 ? questionIds.join(',') : '0';
            
            db.all(`SELECT * FROM CourseQuestionReplies WHERE questionId IN (${qIdsStr}) ORDER BY createdAt ASC`, [], (err, replies) => {
              if (err) return res.status(500).json({ error: 'Erreur base de données (replies)' });

              const coursePromises = courses.map(c => {
                return new Promise((resolveCourse) => {
                  // 1. Get total lessons in this course
                  const totalLessonsQuery = `
                    SELECT COUNT(*) as total FROM Lessons 
                    WHERE chapterId IN (
                      SELECT id FROM Chapters 
                      WHERE moduleId IN (
                        SELECT id FROM Modules WHERE formationId = ?
                      )
                    )
                  `;
                  db.get(totalLessonsQuery, [c.id], (err, totalRow) => {
                    const totalLessons = totalRow ? totalRow.total : 0;
                    if (totalLessons === 0) {
                      return resolveCourse({
                        ...c,
                        progress: 0
                      });
                    }

                    // 2. Get active student enrollments for this course
                    const activeEnrollmentsQuery = `
                      SELECT userId FROM Enrollments WHERE courseId = ? AND status = 'active'
                    `;
                    db.all(activeEnrollmentsQuery, [c.id], (err, enrollments) => {
                      if (err || !enrollments || enrollments.length === 0) {
                        return resolveCourse({
                          ...c,
                          progress: 0
                        });
                      }

                      const userIds = enrollments.map(e => e.userId);
                      
                      // 3. For these users, count completed lessons
                      const completedQuery = `
                        SELECT userId, COUNT(*) as completed FROM LessonProgress
                        WHERE courseId = ? AND userId IN (${userIds.join(',')})
                        GROUP BY userId
                      `;
                      db.all(completedQuery, [c.id], (err, progressRows) => {
                        if (err) {
                          return resolveCourse({
                            ...c,
                            progress: 0
                          });
                        }

                        const progressMap = {};
                        progressRows.forEach(row => {
                          progressMap[row.userId] = row.completed;
                        });

                        let sumProgress = 0;
                        userIds.forEach(userId => {
                          const completed = progressMap[userId] || 0;
                          const progressPercent = Math.round((completed / totalLessons) * 100);
                          sumProgress += progressPercent;
                        });

                        const averageProgress = Math.round(sumProgress / userIds.length);
                        resolveCourse({
                          ...c,
                          progress: averageProgress
                        });
                      });
                    });
                  });
                });
              });

              Promise.all(coursePromises).then(enrichedCourses => {
                res.json({
                  stats: { courses: totalCourses, students: totalStudents, rating: avgRating },
                  courses: enrichedCourses.map(c => ({
                    id: c.id,
                    title: c.title,
                    category: c.category,
                    students: c.enrolled,
                    enrolled: c.enrolled,
                    rating: avgRating,
                    progress: c.progress,
                    nextSession: c.startDate || 'Prochainement',
                    isLive: c.isLive,
                    liveRoomName: c.liveRoomName
                  })),
                  rawCourses: courses,
                  questions: questionsData.map(q => ({
                    id: q.id,
                    student: q.studentName,
                    course: q.courseTitle,
                    text: q.text,
                    answerText: q.answerText,
                    repliedAt: q.repliedAt,
                    time: new Date(q.createdAt).toLocaleDateString(),
                    status: q.status,
                    replies: replies.filter(r => r.questionId === q.id)
                  })),
                  studentsList: studentsData.map(s => ({
                  id: s.enrollmentId,
                  name: s.firstName ? `${s.firstName} ${s.lastName}` : `${s.guestFirstName} ${s.guestLastName} (Guest)`,
                  email: s.email || s.guestEmail,
                  course: s.courseTitle,
                  date: s.date,
                  amount: s.amount,
                  progress: s.progress || 0,
                  exercises: s.exercises || '[]'
                }))
                });
              });
            });
          });
        });
      });
    });
  }
  });

  router.put('/questions/:id/reply', (req, res) => {
    const { answerText } = req.body;
    db.run(
      'INSERT INTO CourseQuestionReplies (questionId, senderRole, text) VALUES (?, ?, ?)',
      [req.params.id, 'formateur', answerText],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        db.run(
          'UPDATE CourseQuestions SET status = ?, answerText = ?, repliedAt = CURRENT_TIMESTAMP WHERE id = ?', 
          ['replied', answerText, req.params.id], 
          function(updateErr) {
            if (updateErr) return res.status(500).json({ error: updateErr.message });
            res.json({ success: true });
          }
        );
      }
    );
  });

  router.delete('/enrollments/:id', (req, res) => {
    db.run('DELETE FROM Enrollments WHERE id = ?', [req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });

  // Gestion du Live Streaming
  router.put('/courses/:id/live/start', authenticateToken, (req, res) => {
    if (req.user.role !== 'formateur' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    const courseId = req.params.id;
    // Generate a unique room name based on course ID and a random string
    const liveRoomName = `Novatech_Live_${courseId}_${Math.random().toString(36).substring(2, 8)}`;
    
    db.run('UPDATE Formations SET isLive = 1, liveRoomName = ? WHERE id = ?', [liveRoomName, courseId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, liveRoomName });
    });
  });

  router.put('/courses/:id/live/stop', authenticateToken, (req, res) => {
    if (req.user.role !== 'formateur' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    const courseId = req.params.id;
    
    db.run('UPDATE Formations SET isLive = 0, liveRoomName = NULL WHERE id = ?', [courseId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });

  // ============================================
  // GESTION DES FORMATIONS (par le formateur)
  // ============================================

  function getFormateurId(userId, callback) {
    db.get('SELECT email FROM Users WHERE id = ?', [userId], (err, user) => {
      if (err || !user) return callback(err, null);
      db.get('SELECT id FROM Formateurs WHERE email = ?', [user.email], (err, row) => {
        // Si aucune fiche formateur n'existe avec cet email, on retourne l'ID utilisateur
        // pour qu'il puisse au moins gérer ses cours via son ID User
        callback(err, row ? row.id : userId);
      });
    });
  }

  // Obtenir les étudiants d'une formation spécifique
  router.get('/courses/:id/students', authenticateToken, (req, res) => {
    if (req.user.role !== 'formateur' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    const courseId = req.params.id;

    const query = `
      SELECT 
        e.id as enrollmentId, e.progress, e.exercises, e.createdAt,
        e.childFirstName, e.childLastName, e.childAge, 
        e.parentName, e.parentEmail, e.parentPhone,
        e.guestFirstName, e.guestLastName, e.guestEmail, e.guestPhone,
        u.firstName, u.lastName, u.email
      FROM Enrollments e
      LEFT JOIN Users u ON e.userId = u.id
      WHERE e.courseId = ?
    `;
    db.all(query, [courseId], (err, students) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(students);
    });
  });

  // Mettre à jour la progression d'un étudiant
  router.put('/enrollments/:id/progress', authenticateToken, (req, res) => {
    if (req.user.role !== 'formateur' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    const enrollmentId = req.params.id;
    const { progress, exercises } = req.body;

    db.run(
      'UPDATE Enrollments SET progress = ?, exercises = ? WHERE id = ?',
      [progress, exercises ? JSON.stringify(exercises) : '[]', enrollmentId],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      }
    );
  });

  // Créer une formation
  router.post('/courses', authenticateToken, (req, res) => {
    if (req.user.role !== 'formateur' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const { title, description, category, ageGroup, level, duration, price, registrationFee, maxParticipants, startDate, endDate, location, isOnline, meetLink, whatsappLink, imageUrl, imageUrls, sessionsPerWeek, sessionDuration, status, format, locationMode } = req.body;
    const slug = title ? title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';
    const urlsString = Array.isArray(imageUrls) ? JSON.stringify(imageUrls) : (imageUrls || '[]');

    const doInsert = (formateurId) => {
      db.run(
        `INSERT INTO Formations (title, slug, description, category, ageGroup, level, duration, price, registrationFee, maxParticipants, startDate, endDate, location, isOnline, meetLink, whatsappLink, imageUrl, imageUrls, sessionsPerWeek, sessionDuration, status, formateurId, format, locationMode)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, slug, description, category, ageGroup || '', level || '', duration || '', price || 0, registrationFee || 0, maxParticipants || 20, startDate || null, endDate || null, location || '', isOnline ? 1 : 0, meetLink || '', whatsappLink || '', imageUrl || '', urlsString, sessionsPerWeek || 1, sessionDuration || '', status || 'published', formateurId || null, format || 'en_ligne', locationMode || 'en_ligne'],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true, id: this.lastID });
        }
      );
    };

    if (req.user.role === 'admin') {
      doInsert(null);
    } else {
      getFormateurId(req.user.id, (err, formateurId) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        doInsert(formateurId);
      });
    }
  });

  // Modifier une formation (seulement les siennes)
  router.put('/courses/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'formateur' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const { title, description, category, ageGroup, level, duration, price, registrationFee, maxParticipants, startDate, endDate, location, isOnline, meetLink, whatsappLink, imageUrl, imageUrls, sessionsPerWeek, sessionDuration, status, format, locationMode } = req.body;
    const courseId = req.params.id;
    const slug = title ? title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';
    const urlsString = Array.isArray(imageUrls) ? JSON.stringify(imageUrls) : (imageUrls || '[]');

    const doUpdate = (formateurId) => {
      // Vérifier que le cours appartient à ce formateur (sauf admin)
      const checkQuery = formateurId
        ? 'SELECT id FROM Formations WHERE id = ? AND formateurId = ?'
        : 'SELECT id FROM Formations WHERE id = ?';
      const checkParams = formateurId ? [courseId, formateurId] : [courseId];

      db.get(checkQuery, checkParams, (err, row) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        if (!row) return res.status(403).json({ error: 'Formation introuvable ou non autorisée' });

        db.run(
          `UPDATE Formations SET title=?, slug=?, description=?, category=?, ageGroup=?, level=?, duration=?, price=?, registrationFee=?, maxParticipants=?, startDate=?, endDate=?, location=?, isOnline=?, meetLink=?, whatsappLink=?, imageUrl=?, imageUrls=?, sessionsPerWeek=?, sessionDuration=?, status=?, format=?, locationMode=? WHERE id=?`,
          [title, slug, description, category, ageGroup || '', level || '', duration || '', price || 0, registrationFee || 0, maxParticipants || 20, startDate || null, endDate || null, location || '', isOnline ? 1 : 0, meetLink || '', whatsappLink || '', imageUrl || '', urlsString, sessionsPerWeek || 1, sessionDuration || '', status || 'published', format || 'en_ligne', locationMode || 'en_ligne', courseId],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
          }
        );
      });
    };

    if (req.user.role === 'admin') {
      doUpdate(null);
    } else {
      getFormateurId(req.user.id, (err, formateurId) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        doUpdate(formateurId);
      });
    }
  });

  // Supprimer une formation (seulement les siennes)
  router.delete('/courses/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'formateur' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const courseId = req.params.id;

    const doDelete = (formateurId) => {
      const checkQuery = formateurId
        ? 'SELECT id FROM Formations WHERE id = ? AND formateurId = ?'
        : 'SELECT id FROM Formations WHERE id = ?';
      const checkParams = formateurId ? [courseId, formateurId] : [courseId];

      db.get(checkQuery, checkParams, (err, row) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        if (!row) return res.status(403).json({ error: 'Formation introuvable ou non autorisée' });

        db.run('DELETE FROM Formations WHERE id = ?', [courseId], (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true });
        });
      });
    };

    if (req.user.role === 'admin') {
      doDelete(null);
    } else {
      getFormateurId(req.user.id, (err, formateurId) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        doDelete(formateurId);
      });
    }
  });

  // Envoyer un message groupé à tous les apprenants d'un cours
  router.post('/courses/:id/message-group', authenticateToken, (req, res) => {
    if (req.user.role !== 'formateur' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const { subject, body } = req.body;
    const courseId = req.params.id;

    if (!subject || !body) {
      return res.status(400).json({ error: 'Sujet et message requis.' });
    }

    // 1. Fetch the course to make sure it exists
    db.get('SELECT title FROM Formations WHERE id = ?', [courseId], (err, course) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });
      if (!course) return res.status(404).json({ error: 'Cours introuvable' });

      // 2. Fetch all student emails enrolled in this course
      const query = `
        SELECT DISTINCT u.email, u.firstName, u.lastName 
        FROM Enrollments e
        JOIN Users u ON e.userId = u.id
        WHERE e.courseId = ? AND (e.status = 'active' OR e.status = 'completed')
      `;

      db.all(query, [courseId], (err, students) => {
        if (err) return res.status(500).json({ error: err.message });
        if (students.length === 0) {
          return res.json({ success: true, message: 'Aucun apprenant inscrit à ce cours.', count: 0 });
        }

        // Import sendEmail from emailService
        const { sendEmail } = require('./emailService');

        // Send emails
        const emailPromises = students.map(student => {
          return sendEmail({
            to: student.email,
            subject: `[${course.title}] ${subject}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 24px;">
                  <h2 style="color: #0f3460; margin: 0;">Novatech Vision</h2>
                  <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0;">Espace de Formation</p>
                </div>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin-bottom: 24px;" />
                <p>Bonjour <strong>${student.firstName} ${student.lastName}</strong>,</p>
                <p>Votre formateur a envoyé un message important concernant le cours <strong>${course.title}</strong> :</p>
                
                <div style="background: #f8fafc; border-left: 4px solid #0f3460; padding: 16px; border-radius: 4px; margin: 20px 0; line-height: 1.6;">
                  <h4 style="margin: 0 0 10px 0; color: #1e293b;">${subject}</h4>
                  <p style="margin: 0; color: #334155; white-space: pre-wrap;">${body}</p>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">Pour répondre à ce message ou poser vos questions, veuillez vous connecter à votre espace apprenant.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">Novatech Vision - Cotonou, Bénin</p>
              </div>
            `
          }).catch(e => console.error(`Error sending group email to ${student.email}:`, e.message));
        });

        Promise.all(emailPromises)
          .then(() => {
            res.json({ success: true, message: `Message groupé envoyé à ${students.length} apprenant(s).`, count: students.length });
          })
          .catch(err => {
            res.status(500).json({ error: 'Erreur lors de l\'envoi des messages: ' + err.message });
          });
      });
    });
  });

  return router;
};
