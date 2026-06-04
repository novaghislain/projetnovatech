import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Users, Star, MessageCircle, LogOut, Video, FileText, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import './Home.css';

const FormateurDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showLiveModal, setShowLiveModal] = useState(false);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('nv_token');
        const res = await fetch('http://localhost:5001/api/formateur/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error('Erreur de chargement:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7fe' }}>Chargement des données...</div>;

  const stats = data?.stats || { courses: 0, students: 0, rating: 0 };
  const courses = data?.courses || [];
  const questions = data?.questions || [];

  return (
    <div style={{ backgroundColor: '#f4f7fe', minHeight: '100vh', display: 'flex' }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: '280px', backgroundColor: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>Espace<br/><span style={{ color: '#4285f4' }}>Formateur</span></h2>
        </div>
        
        <nav style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <button 
            onClick={() => setActiveTab('overview')}
            style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '12px', background: activeTab === 'overview' ? '#eff6ff' : 'transparent', color: activeTab === 'overview' ? '#3b82f6' : '#64748b', fontWeight: activeTab === 'overview' ? 700 : 500, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s' }}
          >
            <BookOpen size={20} /> Vue d'ensemble
          </button>
          <button 
            onClick={() => setActiveTab('courses')}
            style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '12px', background: activeTab === 'courses' ? '#eff6ff' : 'transparent', color: activeTab === 'courses' ? '#3b82f6' : '#64748b', fontWeight: activeTab === 'courses' ? 700 : 500, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s' }}
          >
            <Video size={20} /> Mes Cours
          </button>
          <button 
            onClick={() => setActiveTab('students')}
            style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '12px', background: activeTab === 'students' ? '#eff6ff' : 'transparent', color: activeTab === 'students' ? '#3b82f6' : '#64748b', fontWeight: activeTab === 'students' ? 700 : 500, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s' }}
          >
            <Users size={20} /> Apprenants
          </button>
          <button 
            onClick={() => setActiveTab('messages')}
            style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '12px', background: activeTab === 'messages' ? '#eff6ff' : 'transparent', color: activeTab === 'messages' ? '#3b82f6' : '#64748b', fontWeight: activeTab === 'messages' ? 700 : 500, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s' }}
          >
            <MessageCircle size={20} /> Questions 
            {questions.filter(q => q.status === 'pending').length > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '50px', marginLeft: 'auto' }}>
                {questions.filter(q => q.status === 'pending').length}
              </span>
            )}
          </button>
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'linear-gradient(135deg, #1A1A2E, #4285f4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{user?.firstName}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Formateur Expert</div>
            </div>
          </div>
          <button onClick={logout} style={{ width: '100%', padding: '0.8rem', background: '#fff1f2', color: '#e11d48', border: '1px solid #ffe4e6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
        
        {/* HEADER */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: '#0f172a', margin: '0 0 0.5rem 0' }}>Bonjour, {user?.firstName} 👋</h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '1.1rem' }}>Voici l'activité de vos classes aujourd'hui.</p>
          </div>
          <button onClick={() => setShowLiveModal(true)} style={{ padding: '0.8rem 1.5rem', background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
            <Video size={18} /> Lancer un Live
          </button>
        </header>

        {activeTab === 'overview' && (
          <div className="fade-in">
            {/* STATS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1.2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div style={{ background: '#eff6ff', padding: '1.2rem', borderRadius: '16px', color: '#3b82f6' }}><BookOpen size={28} /></div>
                <div><div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{stats.courses}</div><div style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.2rem' }}>Cours actifs</div></div>
              </div>
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1.2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div style={{ background: '#f0fdf4', padding: '1.2rem', borderRadius: '16px', color: '#22c55e' }}><Users size={28} /></div>
                <div><div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{stats.students}</div><div style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.2rem' }}>Apprenants totaux</div></div>
              </div>
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1.2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div style={{ background: '#fef3c7', padding: '1.2rem', borderRadius: '16px', color: '#f59e0b' }}><Star size={28} /></div>
                <div><div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{stats.rating}</div><div style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.2rem' }}>Note moyenne</div></div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
              {/* MES COURS */}
              <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a' }}>Mes Formations</h3>
                  <button style={{ background: 'none', border: 'none', color: '#4285f4', fontWeight: 600, cursor: 'pointer' }}>Voir tout</button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {courses.map(course => (
                    <div key={course.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem', border: '1px solid #f1f5f9', borderRadius: '16px', transition: 'all 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#4285f4'} onMouseLeave={e => e.currentTarget.style.borderColor = '#f1f5f9'}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '50px', height: '50px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4285f4' }}>
                          <FileText size={24} />
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 0.3rem 0', color: '#0f172a', fontSize: '1.05rem' }}>{course.title}</h4>
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Users size={14} /> {course.students} élèves</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f59e0b' }}><Star size={14} /> {course.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <Clock size={14} /> {course.nextSession}
                        </div>
                        <div style={{ width: '120px', height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ width: `${course.progress}%`, height: '100%', background: '#4285f4', borderRadius: '10px' }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* QUESTIONS RÉCENTES */}
              <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.3rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Questions Récentes 
                  {questions.filter(q => q.status === 'pending').length > 0 && (
                    <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.8rem', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                      {questions.filter(q => q.status === 'pending').length}
                    </span>
                  )}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {questions.map(q => (
                    <div key={q.id} style={{ paddingBottom: '1.2rem', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{q.student}</span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{q.time}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#4285f4', fontWeight: 600, marginBottom: '0.5rem' }}>{q.course}</div>
                      <p style={{ margin: '0 0 0.8rem 0', fontSize: '0.9rem', color: '#475569', lineHeight: 1.4 }}>"{q.text}"</p>
                      
                      {q.status === 'pending' ? (
                        <button 
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem('nv_token');
                              await fetch(`http://localhost:5001/api/formateur/questions/${q.id}/reply`, {
                                method: 'PUT',
                                headers: { 'Authorization': `Bearer ${token}` }
                              });
                              window.location.reload();
                            } catch(e) { alert('Erreur'); }
                          }} 
                          style={{ padding: '0.5rem 1rem', background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          Répondre <ChevronRight size={14} />
                        </button>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                          <CheckCircle size={14} /> Répondu
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="fade-in" style={{ background: '#fff', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', color: '#0f172a' }}>Mes Formations</h3>
            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {courses.map(course => (
                <div key={course.id} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{course.title}</h4>
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Users size={16} /> {course.students} Apprenants</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b' }}><Star size={16} /> {course.rating}</span>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem' }}>
                        <span>Progression moyenne</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${course.progress}%`, height: '100%', background: '#4285f4', borderRadius: '10px' }}></div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={14} /> Prochaine session : {course.nextSession}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="fade-in" style={{ background: '#fff', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', color: '#0f172a' }}>Mes Apprenants</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#94a3b8', fontSize: '0.9rem' }}>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Nom</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Email</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Formation</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Date d'inscription</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Montant Payé</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.studentsList || []).map((student, i) => (
                    <tr key={student.id || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: 600, color: '#0f172a' }}>{student.name}</td>
                      <td style={{ padding: '1rem 0.5rem', color: '#64748b' }}>{student.email}</td>
                      <td style={{ padding: '1rem 0.5rem', color: '#4285f4', fontWeight: 500 }}>{student.course}</td>
                      <td style={{ padding: '1rem 0.5rem', color: '#64748b' }}>{new Date(student.date).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem 0.5rem', color: '#10b981', fontWeight: 600 }}>{student.amount ? `${student.amount} FCFA` : 'Gratuit'}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <button 
                          onClick={async () => {
                            if (window.confirm('Voulez-vous vraiment retirer cet apprenant de la formation ?')) {
                              try {
                                const token = localStorage.getItem('nv_token');
                                await fetch(`http://localhost:5001/api/formateur/enrollments/${student.id}`, {
                                  method: 'DELETE',
                                  headers: { 'Authorization': `Bearer ${token}` }
                                });
                                window.location.reload();
                              } catch(e) { alert('Erreur'); }
                            }
                          }}
                          style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                          Retirer
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(data?.studentsList?.length === 0) && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Aucun apprenant pour le moment.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="fade-in" style={{ background: '#fff', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', color: '#0f172a' }}>Toutes les questions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {questions.map(q => (
                <div key={q.id} style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '1.05rem' }}>{q.student}</span>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{q.time}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#4285f4', fontWeight: 600, marginBottom: '0.8rem' }}>Formation : {q.course}</div>
                  <p style={{ margin: '0 0 1.2rem 0', fontSize: '0.95rem', color: '#475569', lineHeight: 1.5 }}>"{q.text}"</p>
                  
                  {q.status === 'pending' ? (
                    <button 
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('nv_token');
                          await fetch(`http://localhost:5001/api/formateur/questions/${q.id}/reply`, {
                            method: 'PUT',
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          window.location.reload();
                        } catch(e) { alert('Erreur'); }
                      }} 
                      style={{ padding: '0.6rem 1.2rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      Répondre <ChevronRight size={16} />
                    </button>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: '#10b981', fontWeight: 600 }}>
                      <CheckCircle size={16} /> Répondu
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Live Chat Modal Mock */}
      {showLiveModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ background: '#0f172a', width: '100%', maxWidth: '1000px', height: '80vh', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 10px #ef4444' }}></div>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>Live Session : Découverte de l'IA</h3>
                <span style={{ background: '#1e293b', color: '#94a3b8', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600 }}>02:45</span>
              </div>
              <button onClick={() => setShowLiveModal(false)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Terminer le Live</button>
            </div>
            
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              <div style={{ flex: 1, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <Video size={64} color="#334155" />
                <div style={{ position: 'absolute', bottom: '2rem', display: 'flex', gap: '1rem' }}>
                  <button style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>🎤</button>
                  <button style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>📷</button>
                  <button style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>⚙️</button>
                </div>
              </div>
              <div style={{ width: '350px', background: '#1e293b', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #334155', color: '#fff', fontWeight: 600 }}>Chat en direct (24 spectateurs)</div>
                <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontSize: '0.9rem' }}><span style={{ color: '#60a5fa', fontWeight: 600 }}>Herlo :</span> <span style={{ color: '#cbd5e1' }}>Bonjour !</span></div>
                  <div style={{ fontSize: '0.9rem' }}><span style={{ color: '#34d399', fontWeight: 600 }}>Lucas :</span> <span style={{ color: '#cbd5e1' }}>Est-ce qu'on aura le replay ?</span></div>
                  <div style={{ fontSize: '0.9rem' }}><span style={{ color: '#f87171', fontWeight: 600 }}>Admin :</span> <span style={{ color: '#cbd5e1' }}>Bienvenue à tous sur ce live !</span></div>
                </div>
                <div style={{ padding: '1rem', borderTop: '1px solid #334155' }}>
                  <input type="text" placeholder="Écrire un message..." style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormateurDashboard;
