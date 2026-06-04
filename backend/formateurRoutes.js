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
        const avgRating = totalCourses > 0 ? 4.8 : 0;

        // Fetch students
        const courseIds = courses.map(c => c.id);
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

            res.json({
              stats: { courses: totalCourses, students: totalStudents, rating: avgRating },
              courses: courses.map(c => ({
                id: c.id,
                title: c.title,
                students: c.enrolled,
                rating: avgRating,
                progress: c.maxParticipants > 0 ? Math.round((c.enrolled / c.maxParticipants) * 100) : 0,
                nextSession: c.startDate || 'Prochainement'
              })),
              questions: questionsData.map(q => ({
                id: q.id,
                student: q.studentName,
                course: q.courseTitle,
                text: q.text,
                time: new Date(q.createdAt).toLocaleDateString(),
                status: q.status
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
    }
  });

  router.put('/questions/:id/reply', (req, res) => {
    db.run('UPDATE CourseQuestions SET status = ? WHERE id = ?', ['replied', req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });

  router.delete('/enrollments/:id', (req, res) => {
    db.run('DELETE FROM Enrollments WHERE id = ?', [req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });

  return router;
};
