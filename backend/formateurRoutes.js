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
      db.get('SELECT id FROM Formateurs WHERE userId = ?', [userId], (err, formateur) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        
        if (!formateur) {
          return res.json({ stats: { courses: 0, students: 0, rating: 0 }, courses: [], questions: [] });
        }
        fetchCourses(formateur.id);
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
            ? `SELECT Enrollments.id as enrollmentId, Users.firstName, Users.lastName, Users.email, Formations.title as courseTitle, Enrollments.createdAt as date, Enrollments.amount 
               FROM Enrollments 
               JOIN Users ON Enrollments.userId = Users.id 
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

              res.json({
                stats: { courses: totalCourses, students: totalStudents, rating: avgRating },
                courses: courses.map(c => ({
                  id: c.id,
                  title: c.title,
                  category: c.category,
                  students: c.enrolled,
                  enrolled: c.enrolled,
                  rating: avgRating,
                  progress: c.maxParticipants > 0 ? Math.round((c.enrolled / c.maxParticipants) * 100) : 0,
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
                  name: `${s.firstName} ${s.lastName}`.trim() || 'Apprenant',
                  email: s.email,
                  course: s.courseTitle,
                  date: s.date,
                  amount: s.amount
                }))
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

  // Helper: récupère l'ID formateur à partir de userId
  const getFormateurId = (userId, callback) => {
    db.get('SELECT id FROM Formateurs WHERE userId = ?', [userId], (err, row) => {
      callback(err, row ? row.id : null);
    });
  };

  // Créer une formation
  router.post('/courses', authenticateToken, (req, res) => {
    if (req.user.role !== 'formateur' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const { title, description, category, ageGroup, level, duration, price, registrationFee, maxParticipants, startDate, endDate, location, isOnline, meetLink, whatsappLink, imageUrl, sessionsPerWeek, sessionDuration, status } = req.body;

    const doInsert = (formateurId) => {
      db.run(
        `INSERT INTO Formations (title, description, category, ageGroup, level, duration, price, registrationFee, maxParticipants, startDate, endDate, location, isOnline, meetLink, whatsappLink, imageUrl, sessionsPerWeek, sessionDuration, status, formateurId)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description, category, ageGroup || '', level || '', duration || '', price || 0, registrationFee || 0, maxParticipants || 20, startDate || null, endDate || null, location || '', isOnline ? 1 : 0, meetLink || '', whatsappLink || '', imageUrl || '', sessionsPerWeek || 1, sessionDuration || '', status || 'published', formateurId || null],
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

    const { title, description, category, ageGroup, level, duration, price, registrationFee, maxParticipants, startDate, endDate, location, isOnline, meetLink, whatsappLink, imageUrl, sessionsPerWeek, sessionDuration, status } = req.body;
    const courseId = req.params.id;

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
          `UPDATE Formations SET title=?, description=?, category=?, ageGroup=?, level=?, duration=?, price=?, registrationFee=?, maxParticipants=?, startDate=?, endDate=?, location=?, isOnline=?, meetLink=?, whatsappLink=?, imageUrl=?, sessionsPerWeek=?, sessionDuration=?, status=? WHERE id=?`,
          [title, description, category, ageGroup || '', level || '', duration || '', price || 0, registrationFee || 0, maxParticipants || 20, startDate || null, endDate || null, location || '', isOnline ? 1 : 0, meetLink || '', whatsappLink || '', imageUrl || '', sessionsPerWeek || 1, sessionDuration || '', status || 'published', courseId],
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

  return router;
};
