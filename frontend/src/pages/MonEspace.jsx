import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Award, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Home.css';
import { API_URL } from '../config';

const MonEspace = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [myQuestions, setMyQuestions] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [questionStatus, setQuestionStatus] = useState('');
  
  // Trainer Application
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [trainerBio, setTrainerBio] = useState('');
  const [trainerSpecialite, setTrainerSpecialite] = useState('');
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [appSubmitStatus, setAppSubmitStatus] = useState('');
  
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('nv_token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [enrollRes, questionsRes, appRes] = await Promise.all([
          fetch(`${API_URL}/api/enroll/my-enrollments`, { headers }),
          fetch(`${API_URL}/api/enroll/my-questions`, { headers }),
          fetch(`${API_URL}/api/user/application-status`, { headers })
        ]);

        if (enrollRes.ok) {
          const data = await enrollRes.json();
          setEnrollments(data);
          if (data.length > 0) setSelectedCourseId(data[0].courseId);
        }
        
        if (questionsRes.ok) {
          setMyQuestions(await questionsRes.json());
        }
        
        if (appRes.ok) {
          const appData = await appRes.json();
          setApplicationStatus(appData.status);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleSubmitTrainer = async (e) => {
    e.preventDefault();
    if (!trainerBio || !trainerSpecialite) return;
    try {
      const token = localStorage.getItem('nv_token');
      const res = await fetch(`${API_URL}/api/user/apply-formateur`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ specialite: trainerSpecialite, bio: trainerBio })
      });
      if (res.ok) {
        setAppSubmitStatus('success');
        setApplicationStatus('pending');
        setTimeout(() => {
          setShowTrainerModal(false);
          setAppSubmitStatus('');
        }, 2000);
      } else {
        setAppSubmitStatus('error');
      }
    } catch (err) {
      setAppSubmitStatus('error');
    }
  };

  const handleSendQuestion = async (e) => {
    e.preventDefault();
    if (!selectedCourseId || !questionText) return;
    
    try {
      const token = localStorage.getItem('nv_token');
      const res = await fetch(`${API_URL}/api/enroll/questions`, {
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
        
        // Refresh questions
        const newQuestionsRes = await fetch(`${API_URL}/api/enroll/my-questions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (newQuestionsRes.ok) {
          setMyQuestions(await newQuestionsRes.json());
        }
      } else {
        setQuestionStatus('error');
      }
    } catch (err) {
      setQuestionStatus('error');
    }
  };

  const handleSendReply = async (questionId) => {
    if (!replyText.trim()) return;
    try {
      const token = localStorage.getItem('nv_token');
      const res = await fetch(`${API_URL}/api/enroll/questions/${questionId}/reply`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: replyText })
      });
      
      if (res.ok) {
        setReplyText('');
        setReplyingTo(null);
        // Refresh questions
        const newQuestionsRes = await fetch(`${API_URL}/api/enroll/my-questions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (newQuestionsRes.ok) {
          setMyQuestions(await newQuestionsRes.json());
        }
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  try {
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

        {/* DEVENIR FORMATEUR */}
        {user?.role === 'apprenant' && applicationStatus !== 'approved' && (
          <div style={{ marginTop: '3rem', backgroundColor: 'var(--color-primary)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>Partagez vos connaissances</h2>
              <p style={{ opacity: 0.9, margin: 0, maxWidth: '500px' }}>Devenez formateur sur Novatech Vision et aidez des centaines d'élèves à développer leurs compétences. Rejoignez notre équipe d'experts !</p>
            </div>
            
            {applicationStatus === 'pending' ? (
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '0.8rem 1.5rem', borderRadius: '50px', fontWeight: 600 }}>
                ⏳ Candidature en cours d'examen
              </div>
            ) : applicationStatus === 'rejected' ? (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: '0.8rem 1.5rem', borderRadius: '50px', fontWeight: 600, color: '#fca5a5' }}>
                ❌ Candidature non retenue
              </div>
            ) : (
              <button onClick={() => setShowTrainerModal(true)} className="btn btn-accent" style={{ padding: '1rem 2rem', fontSize: '1.05rem' }}>
                Postuler pour devenir Formateur
              </button>
            )}
          </div>
        )}

        {/* MODAL DEVENIR FORMATEUR */}
        {showTrainerModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div style={{ backgroundColor: 'var(--color-white)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>Candidature Formateur</h2>
              <form onSubmit={handleSubmitTrainer} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-primary)' }}>Votre Spécialité</label>
                  <input 
                    type="text" 
                    value={trainerSpecialite}
                    onChange={(e) => setTrainerSpecialite(e.target.value)}
                    placeholder="Ex: Développement Web, Intelligence Artificielle..."
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-primary)' }}>Votre Biographie</label>
                  <textarea 
                    value={trainerBio}
                    onChange={(e) => setTrainerBio(e.target.value)}
                    placeholder="Décrivez votre parcours, vos expériences et pourquoi vous souhaitez enseigner sur Novatech Vision..."
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', minHeight: '150px', resize: 'vertical' }}
                    required
                  ></textarea>
                </div>
                
                {appSubmitStatus === 'success' && <div style={{ color: '#10b981', fontWeight: 600, padding: '1rem', backgroundColor: '#ecfdf5', borderRadius: '8px' }}>✅ Votre candidature a été envoyée avec succès !</div>}
                {appSubmitStatus === 'error' && <div style={{ color: '#ef4444', fontWeight: 600, padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '8px' }}>❌ Erreur lors de l'envoi de la candidature.</div>}
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setShowTrainerModal(false)} className="btn btn-outline" style={{ flex: 1 }}>Annuler</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Soumettre ma candidature</button>
                </div>
              </form>
            </div>
          </div>
        )}

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

        {/* HISTORIQUE DES QUESTIONS */}
        {myQuestions.length > 0 && (
          <>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', margin: '3rem 0 1.5rem 0' }}>Historique de vos questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {myQuestions.map(q => (
                <div key={q.id} style={{ backgroundColor: 'var(--color-white)', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{q.courseTitle}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{new Date(q.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Premier message (Question initiale) */}
                  <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3b82f6', marginBottom: '0.3rem' }}>Vous</div>
                    <p style={{ margin: 0, color: '#334155', lineHeight: 1.5 }}>{q.text}</p>
                  </div>
                  
                  {/* Affichage des réponses (Formateur et Vous) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1rem' }}>
                    {/* Ancien système de réponse formateur pour la rétrocompatibilité si pas de réponses dans le tableau */}
                    {q.answerText && (!q.replies || q.replies.length === 0) && (
                      <div style={{ padding: '1rem', background: '#ecfdf5', borderLeft: '4px solid #10b981', borderRadius: '8px', alignSelf: 'flex-start', maxWidth: '90%' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981', marginBottom: '0.3rem' }}>Formateur</div>
                        <p style={{ margin: 0, color: '#065f46', lineHeight: 1.5 }}>{q.answerText}</p>
                      </div>
                    )}
                    
                    {/* Nouveau système de fil de discussion */}
                    {q.replies && q.replies.map(reply => (
                      <div key={reply.id} style={{ 
                        padding: '1rem', 
                        borderRadius: '8px', 
                        maxWidth: '90%',
                        alignSelf: reply.senderRole === 'student' ? 'flex-end' : 'flex-start',
                        background: reply.senderRole === 'student' ? '#f1f5f9' : '#ecfdf5',
                        borderLeft: reply.senderRole === 'student' ? 'none' : '4px solid #10b981',
                        borderRight: reply.senderRole === 'student' ? '4px solid #3b82f6' : 'none',
                      }}>
                        <div style={{ 
                          fontSize: '0.85rem', 
                          fontWeight: 700, 
                          color: reply.senderRole === 'student' ? '#3b82f6' : '#10b981', 
                          marginBottom: '0.3rem',
                          textAlign: reply.senderRole === 'student' ? 'right' : 'left'
                        }}>
                          {reply.senderRole === 'student' ? 'Vous' : 'Formateur'}
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: '0.5rem', fontWeight: 400 }}>
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p style={{ margin: 0, color: reply.senderRole === 'student' ? '#334155' : '#065f46', lineHeight: 1.5 }}>{reply.text}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Action pour répondre */}
                  {q.status === 'replied' || (q.replies && q.replies.some(r => r.senderRole === 'formateur')) ? (
                    replyingTo === q.id ? (
                      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'flex-end' }}>
                        <textarea 
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Votre réponse..."
                          style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical', minHeight: '80px' }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => { setReplyingTo(null); setReplyText(''); }} className="btn" style={{ padding: '0.5rem 1rem', background: '#e2e8f0', color: '#475569' }}>Annuler</button>
                          <button onClick={() => handleSendReply(q.id)} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Envoyer</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setReplyingTo(q.id)} className="btn btn-outline" style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                        Répondre
                      </button>
                    )
                  ) : (
                    <div style={{ display: 'inline-block', padding: '0.3rem 0.8rem', background: '#fef3c7', color: '#d97706', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600 }}>
                      En attente de réponse du formateur
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
    );
  } catch (renderError) {
    return <div style={{ padding: '2rem', color: 'red' }}><h1>Runtime Error in MonEspace</h1><pre>{renderError.message}</pre><pre>{renderError.stack}</pre></div>;
  }
};

export default MonEspace;
