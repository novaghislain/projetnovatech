import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpen, Award, Clock, ArrowRight, Download, CheckCircle2,
  GraduationCap, MessageSquare, TrendingUp, ChevronRight, UserPlus, Settings,
  ChevronDown, ChevronUp, PlayCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './Home.css';
import { API_URL } from '../config';

const MonEspace = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [questionStatus, setQuestionStatus] = useState('');

  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [trainerBio, setTrainerBio] = useState('');
  const [trainerSpecialite, setTrainerSpecialite] = useState('');
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [appSubmitStatus, setAppSubmitStatus] = useState('');

  const [expandedCourse, setExpandedCourse] = useState(null);

  const downloadCertificate = async (courseId, courseTitle) => {
    try {
      const token = localStorage.getItem('nv_token');
      const res = await fetch(`http://localhost:5001/api/certificates/generate/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) return alert('Vous devez compléter toutes les leçons pour obtenir le certificat.');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificat-${(courseTitle || `formation-${courseId}`).toLowerCase().replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Erreur lors du téléchargement du certificat.');
    }
  };

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
          const withProgress = await Promise.all(data.map(async (e) => {
            try {
              const progRes = await fetch(`http://localhost:5001/api/progress/courses/${e.courseId}/detailed`, { headers });
              if (progRes.ok) {
                const prog = await progRes.json();
                return { ...e, ...prog };
              }
            } catch (_) { }
            return { ...e, progress: 0, completed: 0, total: 0, modules: [], nextLesson: null, lastActivity: '' };
          }));
          setEnrollments(withProgress);
          if (data.length > 0) setSelectedCourseId(data[0].courseId);
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
  const completedCerts = enrollments.filter(e => e.progress === 100);
  const activeCourses = enrollments.filter(e => e.progress < 100 && e.total > 0);

  const statCards = [
    { icon: BookOpen, label: 'Formations en cours', value: activeCourses.length, color: '#3b82f6', bg: '#eff6ff' },
    { icon: GraduationCap, label: 'Leçons complétées', value: enrollments.reduce((s, e) => s + (e.completed || 0), 0), color: '#10b981', bg: '#ecfdf5' },
    { icon: Award, label: 'Certificats obtenus', value: completedCerts.length, color: '#d4a017', bg: '#fffbeb' },
    { icon: TrendingUp, label: 'Progression moyenne', value: `${enrollments.length > 0 ? Math.round(enrollments.reduce((s, e) => s + (e.progress || 0), 0) / enrollments.length) : 0}%`, color: '#8b5cf6', bg: '#f5f3ff' },
  ];

>>>>>>> c9f89b81117c8fc9b1fdabed3411acb256a8eb1e
  try {
    return (
      <div className="page-transition" style={{ backgroundColor: '#f8fafc', minHeight: '80vh', padding: '3rem 0' }}>
        <div className="container">

          {/* HEADER AVATAR & WELCOME */}
          <div style={{
            background: 'linear-gradient(135deg, #1A1A2E 0%, #0F3460 100%)',
            color: 'white', padding: '2.5rem 3rem',
            borderRadius: 'var(--radius-lg)', marginBottom: '2.5rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '2rem', boxShadow: '0 8px 32px rgba(15, 52, 96, 0.25)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
            <div style={{ position: 'absolute', bottom: '-30%', left: '20%', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.8rem', fontWeight: 700, color: 'white',
                boxShadow: '0 4px 16px rgba(59,130,246,0.4)',
                overflow: 'hidden', flexShrink: 0,
              }}>
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user?.firstName?.[0]?.toUpperCase() || 'U'
                )}
              </div>
              <div>
                <h1 style={{ fontSize: '1.8rem', margin: '0 0 0.3rem 0', color: 'white' }}>
                  Bonjour, {user?.firstName} 👋
                </h1>
                <p style={{ opacity: 0.85, fontSize: '1rem', margin: '0 0 0 0' }}>
                  {user?.bio || 'Bienvenue dans votre espace d\'apprentissage'}
                </p>
                <Link to="/parametres" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  marginTop: '0.6rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)',
                  textDecoration: 'none', transition: 'color 0.2s',
                }}>
                  <Settings size={14} /> Modifier le profil
                </Link>
              </div>
            </div>
            <Link to="/formations"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.5rem', borderRadius: '50px',
                background: 'rgba(255,255,255,0.15)', color: 'white',
                fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
                backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.2s', position: 'relative',
              }}
            >
              Explorer les formations <ArrowRight size={16} />
            </Link>
          </div>

          <AdBanner placement="header" />

          {/* STATS CARDS */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.2rem', marginBottom: '3rem',
          }}>
            {statCards.map((s, i) => (
              <div key={i} style={{
                background: 'white', padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
                border: '1px solid #f1f5f9',
                display: 'flex', alignItems: 'center', gap: '1.2rem',
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: s.bg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: s.color, flexShrink: 0,
                }}>
                  <s.icon size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1A1A2E', lineHeight: 1.2 }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.1rem' }}>
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PROGRESS CHART */}
          {enrollments.length > 0 && (
            <div style={{
              background: 'white', padding: '1.5rem 2rem', borderRadius: 'var(--radius-md)',
              marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              border: '1px solid #f1f5f9',
            }}>
              <h3 style={{ fontSize: '1.1rem', color: '#1A1A2E', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={20} /> Progression par formation
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={enrollments.map(e => ({ name: e.courseTitle || `Formation #${e.courseId}`, progression: e.progress || 0 }))} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e5e7eb' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e5e7eb' }} unit="%" />
                  <Tooltip formatter={(val) => `${val}%`} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="progression" radius={[6, 6, 0, 0]} maxBarSize={50}>
                    {enrollments.map((e, i) => (
                      <Cell key={i} fill={e.progress === 100 ? '#10b981' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <AdBanner placement="inline" />

          {/* MES FORMATIONS */}
          {enrollments.length > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <h2 style={{ fontSize: '1.4rem', color: '#1A1A2E', margin: 0 }}>Mes formations</h2>
                <Link to="/mon-espace/inscriptions" style={{ fontSize: '0.9rem', color: '#0F3460', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  Voir tout <ChevronRight size={16} />
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '3rem' }}>
                {enrollments.map(e => (
                  <div key={e.id} style={{
                    background: 'white', borderRadius: 'var(--radius-md)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
                    border: '1px solid #f1f5f9', overflow: 'hidden',
                  }}>
                    {/* En-tête de la carte */}
                    <div style={{
                      padding: '1.2rem 1.5rem',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      flexWrap: 'wrap', gap: '1rem',
                    }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                          <div style={{
                            width: '10px', height: '10px', borderRadius: '50%',
                            background: e.progress === 100 ? '#10b981' : e.total > 0 ? '#3b82f6' : '#94a3b8',
                            flexShrink: 0,
                          }} />
                          <h3 style={{ fontSize: '1rem', margin: 0, color: '#1A1A2E' }}>
                            {e.courseTitle || `Formation #${e.courseId}`}
                          </h3>
                          {e.progress === 100 && (
                            <span style={{
                              fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem',
                              borderRadius: '50px', background: '#ecfdf5', color: '#10b981',
                            }}>Terminée</span>
                          )}
                        </div>
                        {e.total > 0 && (
                          <div style={{ marginTop: '0.6rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.3rem' }}>
                              <span>{e.completed || 0}/{e.total} leçons</span>
                              <span style={{ fontWeight: 600, color: e.progress === 100 ? '#10b981' : '#0F3460' }}>{e.progress || 0}%</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{
                                height: '100%', borderRadius: '3px', transition: 'width 0.5s',
                                background: e.progress === 100
                                  ? 'linear-gradient(90deg, #10b981, #059669)'
                                  : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                                width: `${e.progress || 0}%`,
                              }} />
                            </div>
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                          <span>Inscrit le {new Date(e.createdAt).toLocaleDateString()}</span>
                          {e.lastActivity && (
                            <span>Dernière activité : {new Date(e.lastActivity).toLocaleDateString()}</span>
                          )}
                        </div>

                        {/* Prochaine leçon recommandée */}
                        {e.nextLesson && e.progress < 100 && (
                          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                            <Link to={`/mon-espace/lecons/${e.courseId}?lesson=${e.nextLesson.id}`}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                color: '#3b82f6', fontWeight: 600, textDecoration: 'none',
                                background: '#eff6ff', padding: '0.3rem 0.8rem', borderRadius: '6px',
                              }}
                            >
                              <PlayCircle size={14} /> Continuer : {e.nextLesson.title}
                            </Link>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {/* Bouton détails modules */}
                        {e.modules && e.modules.length > 0 && (
                          <button onClick={() => setExpandedCourse(expandedCourse === e.courseId ? null : e.courseId)}
                            style={{
                              padding: '0.55rem 0.8rem', fontSize: '0.8rem', whiteSpace: 'nowrap',
                              background: '#f8fafc', color: '#64748b',
                              border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem',
                              fontWeight: 500, transition: 'all 0.2s',
                            }}
                          >
                            {expandedCourse === e.courseId ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            Modules
                          </button>
                        )}
                        {e.progress === 100 && (
                          <button
                            onClick={() => downloadCertificate(e.courseId, e.courseTitle)}
                            style={{
                              padding: '0.55rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap',
                              background: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0',
                              borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '0.35rem',
                              fontWeight: 600, transition: 'all 0.2s',
                            }}
                          >
                            <Download size={14} /> Certificat
                          </button>
                        )}
                        <Link
                          to={`/mon-espace/lecons/${e.courseId}`}
                          style={{
                            padding: '0.55rem 1.2rem', fontSize: '0.8rem', whiteSpace: 'nowrap',
                            background: 'linear-gradient(135deg, #0F3460, #1A1A2E)',
                            color: 'white', border: 'none',
                            borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.35rem',
                            fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s',
                          }}
                        >
                          Accéder aux leçons
                        </Link>
                      </div>
                    </div>

                    {/* Détail des modules (expandable) */}
                    {expandedCourse === e.courseId && e.modules && e.modules.length > 0 && (
                      <div style={{
                        borderTop: '1px solid #f1f5f9', padding: '1rem 1.5rem 1.2rem',
                        background: '#fafbfc',
                      }}>
                        {e.modules.map(m => (
                          <div key={m.id} style={{ marginBottom: '0.8rem' }}>
                            <div style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              marginBottom: '0.3rem',
                            }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1A1A2E' }}>
                                {m.title}
                              </span>
                              <span style={{
                                fontSize: '0.75rem', fontWeight: 600,
                                color: m.completed === m.total ? '#10b981' : '#64748b',
                              }}>
                                {m.completed}/{m.total}
                              </span>
                            </div>
                            {/* Mini barre par module */}
                            <div style={{
                              width: '100%', height: '4px', backgroundColor: '#e2e8f0',
                              borderRadius: '2px', overflow: 'hidden',
                            }}>
                              <div style={{
                                height: '100%', borderRadius: '2px',
                                background: m.completed === m.total ? '#10b981' : '#3b82f6',
                                width: `${m.total > 0 ? Math.round((m.completed / m.total) * 100) : 0}%`,
                                transition: 'width 0.4s',
                              }} />
                            </div>
                            {/* Liste des chapitres/leçons */}
                            <div style={{ marginTop: '0.4rem', paddingLeft: '1rem' }}>
                              {m.chapters && m.chapters.map(c => (
                                <div key={c.id} style={{ marginBottom: '0.2rem' }}>
                                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginBottom: '0.15rem' }}>
                                    {c.title}
                                  </div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                                    {c.lessons && c.lessons.map(l => (
                                      <Link
                                        key={l.id}
                                        to={`/mon-espace/lecons/${e.courseId}?lesson=${l.id}`}
                                        style={{
                                          display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                                          padding: '0.15rem 0.5rem', borderRadius: '4px',
                                          fontSize: '0.7rem', textDecoration: 'none',
                                          background: l.completed ? '#ecfdf5' : '#fff',
                                          color: l.completed ? '#10b981' : '#94a3b8',
                                          border: `1px solid ${l.completed ? '#a7f3d0' : '#e2e8f0'}`,
                                        }}
                                      >
                                        {l.completed ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                                        {l.title}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* QUICK LINKS + CERTIFICATS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem', marginBottom: '3rem' }}>
            <Link to="/mon-espace/inscriptions" style={{
              background: 'white', padding: '1.8rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
              border: '1px solid #f1f5f9', textDecoration: 'none',
              display: 'flex', flexDirection: 'column', gap: '0.8rem',
              transition: 'all 0.2s',
            }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                <BookOpen size={22} />
              </div>
              <h3 style={{ fontSize: '1.05rem', margin: 0, color: '#1A1A2E' }}>Mes Inscriptions</h3>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>
                Gérez vos réservations et accédez à vos cours en ligne.
              </p>
            </Link>

            {completedCerts.length > 0 ? (
              <div style={{
                background: 'white', padding: '1.8rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
                border: '1px solid #f1f5f9',
                display: 'flex', flexDirection: 'column', gap: '0.8rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4a017' }}>
                    <Award size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', margin: 0, color: '#1A1A2E' }}>Mes Certificats</h3>
                    <p style={{ color: '#64748b', margin: 0, fontSize: '0.8rem' }}>
                      Téléchargez vos attestations
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {completedCerts.map(e => (
                    <div key={e.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.6rem 0.8rem', background: '#f8fafc', borderRadius: '8px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={16} color="#10b981" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1A1A2E' }}>{e.courseTitle}</span>
                      </div>
                      <button
                        onClick={() => downloadCertificate(e.courseId, e.courseTitle)}
                        style={{
                          padding: '0.35rem 0.8rem', fontSize: '0.75rem',
                          background: '#ecfdf5', color: '#10b981',
                          border: '1px solid #a7f3d0', borderRadius: '6px',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem',
                          fontWeight: 600,
                        }}
                      >
                        <Download size={12} /> PDF
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                background: 'white', padding: '1.8rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
                border: '1px solid #f1f5f9',
                display: 'flex', flexDirection: 'column', gap: '0.8rem',
                opacity: 0.75,
              }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  <Award size={22} />
                </div>
                <h3 style={{ fontSize: '1.05rem', margin: 0, color: '#94a3b8' }}>Mes Certificats</h3>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
                  Complétez une formation à 100% pour obtenir votre certificat.
                </p>
              </div>
            )}
          </div>

          {/* DEVENIR FORMATEUR */}
          {user?.role === 'apprenant' && applicationStatus !== 'approved' && (
            <div style={{
              marginBottom: '3rem', background: 'linear-gradient(135deg, #1A1A2E 0%, #0F3460 100%)',
              padding: '2.2rem 2.5rem', borderRadius: 'var(--radius-lg)',
              color: 'white', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: '2rem',
              boxShadow: '0 8px 24px rgba(15,52,96,0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  background: 'rgba(255,255,255,0.12)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <UserPlus size={26} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.3rem', margin: '0 0 0.3rem 0', color: 'white' }}>
                    Partagez vos connaissances
                  </h2>
                  <p style={{ opacity: 0.85, margin: 0, maxWidth: '450px', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    Devenez formateur sur Novatech Vision et aidez des centaines d'élèves à développer leurs compétences.
                  </p>
                </div>
              </div>

              {applicationStatus === 'pending' ? (
                <div style={{
                  padding: '0.6rem 1.5rem', borderRadius: '50px',
                  background: 'rgba(255,255,255,0.15)', fontWeight: 600, fontSize: '0.9rem',
                }}>
                  ⏳ Candidature en cours
                </div>
              ) : applicationStatus === 'rejected' ? (
                <div style={{
                  padding: '0.6rem 1.5rem', borderRadius: '50px',
                  background: 'rgba(239,68,68,0.2)', fontWeight: 600, fontSize: '0.9rem',
                  color: '#fca5a5',
                }}>
                  ❌ Non retenue
                </div>
              ) : (
                <button onClick={() => setShowTrainerModal(true)}
                  style={{
                    padding: '0.8rem 2rem', borderRadius: '50px',
                    background: 'white', color: '#0F3460', border: 'none',
                    fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    transition: 'all 0.2s',
                  }}
                >
                  <UserPlus size={18} /> Postuler
                </button>
              )}
            </div>
          )}

          {/* MODAL DEVENIR FORMATEUR */}
          {showTrainerModal && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(15,23,42,0.7)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', zIndex: 1000,
              padding: '1rem', backdropFilter: 'blur(4px)',
            }}>
              <div style={{
                background: 'white', padding: '2.5rem', borderRadius: 'var(--radius-lg)',
                width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto',
              }}>
                <h2 style={{ fontSize: '1.6rem', color: '#1A1A2E', marginBottom: '0.5rem' }}>
                  Candidature Formateur
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Rejoignez notre équipe d'experts et enseignez ce qui vous passionne.
                </p>
                <form onSubmit={handleSubmitTrainer} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem', color: '#1A1A2E' }}>
                      Votre Spécialité
                    </label>
                    <input
                      type="text"
                      value={trainerSpecialite}
                      onChange={(e) => setTrainerSpecialite(e.target.value)}
                      placeholder="Ex: Développement Web, Intelligence Artificielle..."
                      style={{
                        width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                        border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem',
                        transition: 'border 0.2s',
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem', color: '#1A1A2E' }}>
                      Votre Biographie
                    </label>
                    <textarea
                      value={trainerBio}
                      onChange={(e) => setTrainerBio(e.target.value)}
                      placeholder="Décrivez votre parcours, vos expériences..."
                      style={{
                        width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                        border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem',
                        minHeight: '120px', resize: 'vertical',
                      }}
                      required
                    />
                  </div>

                  {appSubmitStatus === 'success' && (
                    <div style={{ color: '#10b981', fontWeight: 600, padding: '0.8rem 1rem', background: '#ecfdf5', borderRadius: '8px', fontSize: '0.9rem' }}>
                      ✅ Candidature envoyée avec succès !
                    </div>
                  )}
                  {appSubmitStatus === 'error' && (
                    <div style={{ color: '#ef4444', fontWeight: 600, padding: '0.8rem 1rem', background: '#fef2f2', borderRadius: '8px', fontSize: '0.9rem' }}>
                      ❌ Erreur lors de l'envoi.
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                    <button type="button" onClick={() => setShowTrainerModal(false)}
                      style={{
                        flex: 1, padding: '0.8rem', borderRadius: '8px',
                        border: '1px solid #e2e8f0', background: 'white',
                        color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
                      }}
                    >
                      Annuler
                    </button>
                    <button type="submit"
                      style={{
                        flex: 2, padding: '0.8rem', borderRadius: '8px',
                        border: 'none', background: 'linear-gradient(135deg, #0F3460, #1A1A2E)',
                        color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
                      }}
                    >
                      Soumettre ma candidature
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* POSER UNE QUESTION */}
          <h2 style={{ fontSize: '1.4rem', color: '#1A1A2E', marginBottom: '1.2rem' }}>
            <MessageSquare size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: '#0F3460' }} />
            Poser une question à un formateur
          </h2>
          <div style={{
            background: 'white', padding: '2rem', borderRadius: 'var(--radius-md)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
            border: '1px solid #f1f5f9', marginBottom: '3rem',
          }}>
            {enrollments.length === 0 ? (
              <p style={{ color: '#64748b' }}>
                Vous n'êtes inscrit à aucune formation pour le moment.
              </p>
            ) : (
              <form onSubmit={handleSendQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem', color: '#1A1A2E' }}>
                    Formation concernée
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    style={{
                      width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                      border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem',
                    }}
                  >
                    {enrollments.map(e => (
                      <option key={e.id} value={e.courseId}>{e.courseTitle}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem', color: '#1A1A2E' }}>
                    Votre question
                  </label>
                  <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Écrivez votre question ici..."
                    style={{
                      width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                      border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem',
                      minHeight: '100px', resize: 'vertical',
                    }}
                    required
                  />
                </div>
                <button type="submit"
                  style={{
                    alignSelf: 'flex-start', padding: '0.75rem 1.5rem', borderRadius: '8px',
                    border: 'none', background: 'linear-gradient(135deg, #0F3460, #1A1A2E)',
                    color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}
                >
                  Envoyer la question
                </button>
                {questionStatus === 'success' && (
                  <p style={{ color: '#10b981', fontWeight: 600, margin: 0, fontSize: '0.9rem' }}>
                    Question envoyée avec succès !
                  </p>
                )}
                {questionStatus === 'error' && (
                  <p style={{ color: '#ef4444', fontWeight: 600, margin: 0, fontSize: '0.9rem' }}>
                    Erreur lors de l'envoi.
                  </p>
                )}
              </form>
            )}
          </div>

        </div>
      </div>
    );
  } catch (renderError) {
    return <div style={{ padding: '2rem', color: 'red' }}><h1>Runtime Error in MonEspace</h1><pre>{renderError.message}</pre><pre>{renderError.stack}</pre></div>;
  }
};

export default MonEspace;
