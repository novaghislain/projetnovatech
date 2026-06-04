import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Users, Star, MessageCircle, LogOut, Video, FileText, CheckCircle, Clock, ChevronRight, Plus, Trash2, Edit2, X } from 'lucide-react';
import './Home.css';

const EMPTY_FORM = { title: '', description: '', category: 'Développement', ageGroup: '10-14 ans', level: 'Débutant', duration: '4 semaines', price: '', registrationFee: '', maxParticipants: 20, startDate: '', endDate: '', location: '', isOnline: false, meetLink: '', whatsappLink: '', imageUrl: '', sessionsPerWeek: 2, sessionDuration: '2h', status: 'published' };

const FormateurDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showLiveModal, setShowLiveModal] = useState(false);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [selectedLiveCourse, setSelectedLiveCourse] = useState('');
  const [activeLiveRoom, setActiveLiveRoom] = useState(null);
  const [liveCourseId, setLiveCourseId] = useState(null);

  // Course management state
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null); // null = create, object = edit
  const [courseForm, setCourseForm] = useState(EMPTY_FORM);
  const [courseFormLoading, setCourseFormLoading] = useState(false);

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
        
        // Check if any course is already live
        const liveCourse = result.courses?.find(c => c.isLive);
        if (liveCourse) {
          setActiveLiveRoom(liveCourse.liveRoomName);
          setLiveCourseId(liveCourse.id);
        }
      } catch (err) {
        console.error('Erreur de chargement:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const startLive = async (courseId) => {
    try {
      const token = localStorage.getItem('nv_token');
      const res = await fetch(`http://localhost:5001/api/formateur/courses/${courseId}/live/start`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setActiveLiveRoom(result.liveRoomName);
        setLiveCourseId(courseId);
        setShowLiveModal(false);
      }
    } catch (err) { alert('Erreur lors du démarrage du live'); }
  };

  const stopLive = async () => {
    try {
      const token = localStorage.getItem('nv_token');
      await fetch(`http://localhost:5001/api/formateur/courses/${liveCourseId}/live/stop`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setActiveLiveRoom(null);
      setLiveCourseId(null);
      window.location.reload();
    } catch (err) { alert('Erreur lors de la fermeture du live'); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7fe' }}>Chargement des données...</div>;

  const stats = data?.stats || { courses: 0, students: 0, rating: 0 };
  const courses = data?.courses || [];
  const rawCourses = data?.rawCourses || [];
  const questions = data?.questions || [];

  try {
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
            onClick={() => setActiveTab('manage')}
            style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '12px', background: activeTab === 'manage' ? '#eff6ff' : 'transparent', color: activeTab === 'manage' ? '#3b82f6' : '#64748b', fontWeight: activeTab === 'manage' ? 700 : 500, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s' }}
          >
            <Plus size={20} /> Mes Formations
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
          {!activeLiveRoom ? (
            <button onClick={() => setShowLiveModal(true)} style={{ padding: '0.8rem 1.5rem', background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
              <Video size={18} color="#ef4444" /> Lancer un Live
            </button>
          ) : (
            <button onClick={stopLive} style={{ padding: '0.8rem 1.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)' }}>
              <Video size={18} /> Terminer le Live
            </button>
          )}
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
                      
                      {/* Threaded replies */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1rem', marginTop: '0.5rem' }}>
                        {q.answerText && (!q.replies || q.replies.length === 0) && (
                          <div style={{ padding: '0.8rem', background: '#ecfdf5', borderRadius: '8px', alignSelf: 'flex-start', maxWidth: '90%' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', marginBottom: '0.2rem' }}>Vous</div>
                            <p style={{ margin: 0, color: '#065f46', fontSize: '0.85rem' }}>{q.answerText}</p>
                          </div>
                        )}
                        {q.replies && q.replies.map(reply => (
                          <div key={reply.id} style={{ 
                            padding: '0.8rem', 
                            borderRadius: '8px', 
                            maxWidth: '90%',
                            alignSelf: reply.senderRole === 'formateur' ? 'flex-start' : 'flex-end',
                            background: reply.senderRole === 'formateur' ? '#ecfdf5' : '#f1f5f9',
                          }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: reply.senderRole === 'formateur' ? '#10b981' : '#3b82f6', marginBottom: '0.2rem', textAlign: reply.senderRole === 'formateur' ? 'left' : 'right' }}>
                              {reply.senderRole === 'formateur' ? 'Vous' : 'Apprenant'}
                              <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginLeft: '0.4rem', fontWeight: 400 }}>{new Date(reply.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p style={{ margin: 0, color: reply.senderRole === 'formateur' ? '#065f46' : '#334155', fontSize: '0.85rem' }}>{reply.text}</p>
                          </div>
                        ))}
                      </div>
                      
                      {replyingTo === q.id ? (
                        <div style={{ marginTop: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
                          <textarea 
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Tapez votre réponse ici..."
                            style={{ width: '100%', minHeight: '80px', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '0.8rem', outline: 'none', resize: 'vertical' }}
                          />
                          <div style={{ display: 'flex', gap: '0.8rem' }}>
                            <button 
                              onClick={async () => {
                                if (!replyText) return;
                                try {
                                  const token = localStorage.getItem('nv_token');
                                  await fetch(`http://localhost:5001/api/formateur/questions/${q.id}/reply`, {
                                    method: 'PUT',
                                    headers: { 
                                      'Authorization': `Bearer ${token}`,
                                      'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ answerText: replyText })
                                  });
                                  window.location.reload();
                                } catch(e) { alert('Erreur'); }
                              }} 
                              style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                              Envoyer
                            </button>
                            <button 
                              onClick={() => { setReplyingTo(null); setReplyText(''); }} 
                              style={{ padding: '0.5rem 1rem', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => { setReplyingTo(q.id); setReplyText(''); }} 
                          style={{ padding: '0.5rem 1rem', background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          Répondre <ChevronRight size={14} />
                        </button>
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
                  
                  {/* Threaded replies */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1rem', marginTop: '0.5rem' }}>
                    {q.answerText && (!q.replies || q.replies.length === 0) && (
                      <div style={{ padding: '1rem', background: '#ecfdf5', borderRadius: '8px', alignSelf: 'flex-start', maxWidth: '90%' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981', marginBottom: '0.3rem' }}>Vous</div>
                        <p style={{ margin: 0, color: '#065f46', fontSize: '0.95rem' }}>{q.answerText}</p>
                      </div>
                    )}
                    {q.replies && q.replies.map(reply => (
                      <div key={reply.id} style={{ 
                        padding: '1rem', 
                        borderRadius: '8px', 
                        maxWidth: '90%',
                        alignSelf: reply.senderRole === 'formateur' ? 'flex-start' : 'flex-end',
                        background: reply.senderRole === 'formateur' ? '#ecfdf5' : '#f1f5f9',
                      }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: reply.senderRole === 'formateur' ? '#10b981' : '#3b82f6', marginBottom: '0.3rem', textAlign: reply.senderRole === 'formateur' ? 'left' : 'right' }}>
                          {reply.senderRole === 'formateur' ? 'Vous' : 'Apprenant'}
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: '0.5rem', fontWeight: 400 }}>{new Date(reply.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p style={{ margin: 0, color: reply.senderRole === 'formateur' ? '#065f46' : '#334155', fontSize: '0.95rem' }}>{reply.text}</p>
                      </div>
                    ))}
                  </div>

                  {replyingTo === q.id ? (
                    <div style={{ marginTop: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
                      <textarea 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Tapez votre réponse ici..."
                        style={{ width: '100%', minHeight: '100px', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1rem', outline: 'none', resize: 'vertical' }}
                      />
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                          onClick={async () => {
                            if (!replyText) return;
                            try {
                              const token = localStorage.getItem('nv_token');
                              await fetch(`http://localhost:5001/api/formateur/questions/${q.id}/reply`, {
                                method: 'PUT',
                                headers: { 
                                  'Authorization': `Bearer ${token}`,
                                  'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ answerText: replyText })
                              });
                              window.location.reload();
                            } catch(e) { alert('Erreur'); }
                          }} 
                          style={{ padding: '0.6rem 1.2rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                          Envoyer la réponse
                        </button>
                        <button 
                          onClick={() => { setReplyingTo(null); setReplyText(''); }} 
                          style={{ padding: '0.6rem 1.2rem', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setReplyingTo(q.id); setReplyText(''); }} 
                      style={{ padding: '0.6rem 1.2rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                      Répondre <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== GÉRER LES FORMATIONS ===== */}
        {activeTab === 'manage' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>Mes Formations</h2>
              <button
                onClick={() => { setCourseForm(EMPTY_FORM); setEditingCourse(null); setShowCourseForm(true); }}
                style={{ padding: '0.8rem 1.5rem', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}
              >
                <Plus size={18} /> Ajouter une formation
              </button>
            </div>

            {courses.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '20px', padding: '4rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <BookOpen size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                <h3 style={{ color: '#64748b', marginBottom: '0.5rem' }}>Aucune formation</h3>
                <p style={{ color: '#94a3b8' }}>Cliquez sur "Ajouter une formation" pour créer votre premier cours.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {courses.map(course => (
                  <div key={course.id} style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '200px' }}>
                      <div style={{ width: '54px', height: '54px', background: '#eff6ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 }}>
                        <FileText size={26} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>{course.title}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                          {course.category} &bull; {course.students || 0} apprenants &bull; {course.nextSession}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        onClick={() => {
                          const raw = rawCourses.find(c => c.id === course.id) || course;
                          setCourseForm({
                            title: raw.title || '', description: raw.description || '', category: raw.category || 'Développement',
                            ageGroup: raw.ageGroup || '', level: raw.level || '', duration: raw.duration || '',
                            price: raw.price || '', registrationFee: raw.registrationFee || '', maxParticipants: raw.maxParticipants || 20,
                            startDate: raw.startDate || '', endDate: raw.endDate || '', location: raw.location || '',
                            isOnline: !!raw.isOnline, meetLink: raw.meetLink || '', whatsappLink: raw.whatsappLink || '',
                            imageUrl: raw.imageUrl || '', sessionsPerWeek: raw.sessionsPerWeek || 2, sessionDuration: raw.sessionDuration || '',
                            status: raw.status || 'published'
                          });
                          setEditingCourse(course.id);
                          setShowCourseForm(true);
                        }}
                        style={{ padding: '0.6rem 1.2rem', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <Edit2 size={15} /> Modifier
                      </button>
                      <button
                        onClick={async () => {
                          if (!window.confirm(`Supprimer "${course.title}" ? Cette action est irréversible.`)) return;
                          const token = localStorage.getItem('nv_token');
                          const res = await fetch(`http://localhost:5001/api/formateur/courses/${course.id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          if (res.ok) window.location.reload();
                          else alert('Erreur lors de la suppression');
                        }}
                        style={{ padding: '0.6rem 1.2rem', background: '#fff1f2', color: '#e11d48', border: '1px solid #ffe4e6', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <Trash2 size={15} /> Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ===== MODALE CRÉATION / MODIFICATION FORMATION ===== */}
      {showCourseForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem', overflowY: 'auto' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '680px', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 25px 50px rgba(0,0,0,0.4)', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setShowCourseForm(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
            <h2 style={{ margin: '0 0 2rem 0', color: '#0f172a', fontSize: '1.5rem' }}>{editingCourse ? 'Modifier la formation' : 'Créer une nouvelle formation'}</h2>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setCourseFormLoading(true);
              try {
                const token = localStorage.getItem('nv_token');
                const url = editingCourse
                  ? `http://localhost:5001/api/formateur/courses/${editingCourse}`
                  : 'http://localhost:5001/api/formateur/courses';
                const method = editingCourse ? 'PUT' : 'POST';
                const res = await fetch(url, {
                  method,
                  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify(courseForm)
                });
                const result = await res.json();
                if (result.success || result.id) {
                  setShowCourseForm(false);
                  window.location.reload();
                } else {
                  alert(result.error || 'Erreur');
                }
              } catch(err) { alert('Erreur réseau'); }
              finally { setCourseFormLoading(false); }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

              {[['Titre *', 'title', 'text', true], ['Description', 'description', 'text', false], ['Image URL', 'imageUrl', 'text', false], ['Lien Meet (si en ligne)', 'meetLink', 'text', false], ['Lien WhatsApp', 'whatsappLink', 'text', false], ['Date de début', 'startDate', 'date', false], ['Date de fin', 'endDate', 'date', false], ['Lieu (si présentiel)', 'location', 'text', false]].map(([label, key, type, required]) => (
                <div key={key}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>{label}</label>
                  <input
                    type={type}
                    required={required}
                    value={courseForm[key]}
                    onChange={e => setCourseForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }}
                  />
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>Catégorie</label>
                  <select value={courseForm.category} onChange={e => setCourseForm(f => ({ ...f, category: e.target.value }))} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem' }}>
                    {['Développement', 'Intelligence Artificielle', 'Bureautique', 'Cybersécurité', 'Design', 'Robotique', 'Autre'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>Tranche d'âge</label>
                  <select value={courseForm.ageGroup} onChange={e => setCourseForm(f => ({ ...f, ageGroup: e.target.value }))} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem' }}>
                    {['8-10 ans', '10-12 ans', '12-14 ans', '14-16 ans', '16-18 ans', 'Tous âges'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>Prix (FCFA)</label>
                  <input type="number" value={courseForm.price} onChange={e => setCourseForm(f => ({ ...f, price: e.target.value }))} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>Frais inscription (FCFA)</label>
                  <input type="number" value={courseForm.registrationFee} onChange={e => setCourseForm(f => ({ ...f, registrationFee: e.target.value }))} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>Places max</label>
                  <input type="number" value={courseForm.maxParticipants} onChange={e => setCourseForm(f => ({ ...f, maxParticipants: e.target.value }))} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>Durée totale</label>
                  <input type="text" placeholder="ex: 4 semaines" value={courseForm.duration} onChange={e => setCourseForm(f => ({ ...f, duration: e.target.value }))} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem', background: '#f8fafc', borderRadius: '10px' }}>
                <input type="checkbox" id="isOnlineCheck" checked={courseForm.isOnline} onChange={e => setCourseForm(f => ({ ...f, isOnline: e.target.checked }))} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                <label htmlFor="isOnlineCheck" style={{ fontWeight: 600, color: '#374151', cursor: 'pointer' }}>Cours en ligne (visioconférence)</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowCourseForm(false)} style={{ padding: '0.9rem 1.8rem', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
                <button type="submit" disabled={courseFormLoading} style={{ padding: '0.9rem 1.8rem', background: courseFormLoading ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: courseFormLoading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>
                  {courseFormLoading ? 'Enregistrement...' : (editingCourse ? 'Enregistrer les modifications' : 'Créer la formation')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Course Selection Modal */}
      {showLiveModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', fontSize: '1.3rem' }}>Sélectionnez un cours pour le live</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {courses.map(course => (
                <button 
                  key={course.id}
                  onClick={() => setSelectedLiveCourse(course.id)}
                  style={{ padding: '1rem', background: selectedLiveCourse === course.id ? '#eff6ff' : '#f8fafc', border: selectedLiveCourse === course.id ? '2px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{course.title}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.3rem' }}>{course.enrolled} apprenants inscrits</div>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <button onClick={() => setShowLiveModal(false)} style={{ padding: '0.8rem 1.5rem', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
              <button onClick={() => { if(selectedLiveCourse) startLive(selectedLiveCourse); }} disabled={!selectedLiveCourse} style={{ padding: '0.8rem 1.5rem', background: selectedLiveCourse ? '#3b82f6' : '#94a3b8', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: selectedLiveCourse ? 'pointer' : 'not-allowed' }}>Démarrer</button>
            </div>
          </div>
        </div>
      )}

      {/* Jitsi Meet Live Iframe */}
      {activeLiveRoom && (
        <div style={{ position: 'fixed', top: '2rem', right: '2rem', width: '800px', maxWidth: '90%', height: '500px', background: '#000', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', zIndex: 1000, border: '4px solid #3b82f6', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#3b82f6', padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 5px #ef4444' }}></span>
              Live en cours
            </div>
            <button onClick={stopLive} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Fermer</button>
          </div>
          <iframe 
            src={`https://meet.jit.si/${activeLiveRoom}`} 
            allow="camera; microphone; display-capture; autoplay; clipboard-write" 
            style={{ width: '100%', height: '100%', border: 'none' }} 
          />
        </div>
      )}
    </div>
  );
} catch (renderError) {
  return <div style={{ padding: '2rem', color: 'red' }}><h1>Runtime Error</h1><pre>{renderError.message}</pre><pre>{renderError.stack}</pre></div>;
}
};

export default FormateurDashboard;
