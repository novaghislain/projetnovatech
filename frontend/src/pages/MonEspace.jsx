import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Award, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Home.css';

const MonEspace = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [questionStatus, setQuestionStatus] = useState('');

  useEffect(() => {
    const fetchMyEnrollments = async () => {
      try {
        const token = localStorage.getItem('nv_token');
        const res = await fetch('http://localhost:5001/api/enroll/my-enrollments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setEnrollments(data);
          if (data.length > 0) setSelectedCourseId(data[0].courseId);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMyEnrollments();
  }, []);

  const handleSendQuestion = async (e) => {
    e.preventDefault();
    if (!selectedCourseId || !questionText) return;
    
    try {
      const token = localStorage.getItem('nv_token');
      const res = await fetch('http://localhost:5001/api/enroll/questions', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ courseId: selectedCourseId, text: questionText })
      });
      if (res.ok) {
        setQuestionStatus('success');
        setQuestionText('');
        setTimeout(() => setQuestionStatus(''), 3000);
      } else {
        setQuestionStatus('error');
      }
    } catch (err) {
      setQuestionStatus('error');
    }
  };
  
  return (
    <div className="page-transition" style={{ backgroundColor: 'var(--color-bg-light)', minHeight: '80vh', padding: '3rem 0' }}>
      <div className="container">
        
        {/* HEADER */}
        <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '2.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem', boxShadow: 'var(--shadow-md)' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Bonjour, {user?.firstName} 👋</h1>
            <p style={{ opacity: 0.9, fontSize: '1.05rem', margin: 0 }}>Bienvenue dans votre espace d'apprentissage Novatech Vision.</p>
          </div>
          <Link to="/formations" className="btn btn-accent" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Explorer les formations <ArrowRight size={18} />
          </Link>
        </div>

        {/* STATS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ backgroundColor: 'var(--color-white)', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ backgroundColor: 'rgba(212,160,23,0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--color-accent)' }}>
              <BookOpen size={28} />
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1 }}>2</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>Formations en cours</div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--color-white)', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ backgroundColor: 'rgba(212,160,23,0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--color-accent)' }}>
              <Clock size={28} />
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1 }}>14h</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>Heures d'apprentissage</div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--color-white)', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ backgroundColor: 'rgba(212,160,23,0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--color-accent)' }}>
              <Award size={28} />
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1 }}>0</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>Certificats obtenus</div>
            </div>
          </div>
        </div>

        {/* QUICK LINKS */}
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>Raccourcis</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <Link to="/mon-espace/inscriptions" style={{ backgroundColor: 'var(--color-white)', padding: '2rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', textDecoration: 'none', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="hover-lift">
            <BookOpen size={32} color="var(--color-primary)" />
            <h3 style={{ color: 'var(--color-primary)', margin: 0 }}>Mes Inscriptions</h3>
            <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.95rem' }}>Gérez vos réservations et accédez à vos cours en ligne.</p>
          </Link>
          
          <div style={{ backgroundColor: 'var(--color-white)', padding: '2rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', opacity: 0.7, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Award size={32} color="var(--color-text-muted)" />
            <h3 style={{ color: 'var(--color-text-muted)', margin: 0 }}>Mes Certificats (Bientôt)</h3>
            <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.95rem' }}>Retrouvez les attestations de vos formations complétées.</p>
          </div>
        </div>

        {/* POSER UNE QUESTION */}
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', margin: '3rem 0 1.5rem 0' }}>Poser une question à un formateur</h2>
        <div style={{ backgroundColor: 'var(--color-white)', padding: '2rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
          {enrollments.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>Vous n'êtes inscrit à aucune formation pour le moment. Vous ne pouvez pas poser de question.</p>
          ) : (
            <form onSubmit={handleSendQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-primary)' }}>Formation concernée</label>
                <select 
                  value={selectedCourseId} 
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none' }}
                >
                  {enrollments.map(e => (
                    <option key={e.id} value={e.courseId}>{e.courseTitle}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-primary)' }}>Votre question</label>
                <textarea 
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Écrivez votre question ici..."
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', minHeight: '120px', resize: 'vertical' }}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '0.8rem 1.5rem' }}>
                Envoyer la question
              </button>
              {questionStatus === 'success' && <p style={{ color: '#10b981', fontWeight: 600 }}>Votre question a été envoyée avec succès !</p>}
              {questionStatus === 'error' && <p style={{ color: '#ef4444', fontWeight: 600 }}>Erreur lors de l'envoi de la question.</p>}
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default MonEspace;
