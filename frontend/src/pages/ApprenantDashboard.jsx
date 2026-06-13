import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  LayoutDashboard, BookOpen, FileText, CreditCard, User, LogOut,
  Menu, X, Clock, Video, MessageCircle, Download, CheckCircle2, ArrowRight,
  TrendingUp, Calendar, Trash2
} from 'lucide-react';
import { Link, useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { API_URL } from '../config';
import { jsPDF } from 'jspdf';
import FedapayWidget from '../components/FedapayWidget';
import './Admin/AdminDashboard.css';

// =======================
// COMPOSANT PRINCIPAL
// =======================
const ApprenantDashboard = () => {
  const { user, logout, updateUserDetails } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const token = localStorage.getItem('nv_token');
        const response = await fetch(`${API_URL}/api/enroll/my-enrollments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setEnrollments(data);
      } catch (err) {
        console.error(err);
      }
    };
    if (user) fetchEnrollments();
  }, [user]);

  // Sync tab with URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/formations')) setActiveTab('courses');
    else if (path.includes('/ressources')) setActiveTab('resources');
    else if (path.includes('/paiements')) setActiveTab('payments');
    else if (path.includes('/compte')) setActiveTab('account');
    else if (path.includes('/devenir-formateur')) setActiveTab('apply');
    else setActiveTab('overview');
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { id: 'overview', path: '/mon-espace', icon: LayoutDashboard, label: t('nav_my_space') },
    { id: 'courses', path: '/mon-espace/formations', icon: BookOpen, label: t('nav_my_enrollments') },
    { id: 'resources', path: '/mon-espace/ressources', icon: FileText, label: t('dash_pedagogical_resources') },
    { id: 'payments', path: '/mon-espace/paiements', icon: CreditCard, label: t('nav_my_payments') },
    { id: 'account', path: '/mon-espace/compte', icon: User, label: t('nav_settings') },
    { id: 'apply', path: '/mon-espace/devenir-formateur', icon: TrendingUp, label: t('dash_become_trainer') },
  ];

  return (
    <div className="admin-layout" style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#f8fafc' }}>
      
      {/* MOBILE HEADER */}
      <div className="mobile-header">
        <img src="/4x.png" alt="FormationNova" style={{ height: '35px', objectFit: 'contain', cursor: 'pointer' }} onClick={() => window.location.href = "/"} />
        <button onClick={() => setMobileMenuOpen(true)} className="mobile-menu-btn">
          <Menu size={24} />
        </button>
      </div>

      {/* OVERLAY */}
      {mobileMenuOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <img src="/4x.png" alt="FormationNova" style={{ height: '40px', objectFit: 'contain', cursor: 'pointer', display: 'block', margin: '0 auto' }} onClick={() => window.location.href = "/"} />
        </div>
        <div className="sidebar-nav-wrap">
          {navItems.map(item => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
              title={item.label}
            >
              <item.icon size={22} />
              <span className="menu-text">{item.label}</span>
            </Link>
          ))}
        </div>
        <div className="sidebar-logout" onClick={handleLogout} title="Déconnexion">
          <LogOut size={20} />
          <span className="menu-text">Déconnexion</span>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content" style={{ maxHeight: '100vh', overflowY: 'auto' }}>
        <div style={{ padding: '2rem 3rem', maxWidth: '1200px', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={<OverviewTab enrollments={enrollments} />} />
            <Route path="/formations" element={<CoursesTab enrollments={enrollments} setEnrollments={setEnrollments} />} />
            <Route path="/ressources" element={<ResourcesTab enrollments={enrollments} />} />
            <Route path="/paiements" element={<PaymentsTab />} />
            <Route path="/compte" element={<AccountTab />} />
            <Route path="/devenir-formateur" element={<BecomeFormateurTab />} />
          </Routes>
        </div>
      </main>

    </div>
  );
};

// =======================
const OverviewTab = ({ enrollments }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  
  const activeCourses = enrollments.filter(e => e.status === 'active');
  const paidCount = enrollments.filter(e => e.amount > 0).length;

  const totalActiveCourses = activeCourses.length;
  const globalProgress = totalActiveCourses > 0
    ? Math.round(activeCourses.reduce((sum, e) => sum + (e.progress || 0), 0) / totalActiveCourses)
    : 0;

  return (
    <div className="fade-in">
      <div style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #0F3460 100%)', color: 'white', padding: '2.5rem', borderRadius: '16px', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 32px rgba(15, 52, 96, 0.2)' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>{t('dash_welcome')} {user?.firstName} 👋</h1>
          <p style={{ margin: 0, opacity: 0.75, fontSize: '0.95rem', color: '#e2e8f0' }}>
            {activeCourses.length} {t('dash_courses_in_progress')} &nbsp;·&nbsp; {paidCount} {t('dash_payments_done')}
          </p>
        </div>
        <Link to="/mon-espace/formations" style={{ padding: '0.8rem 1.5rem', background: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: '50px', textDecoration: 'none', fontWeight: 600, backdropFilter: 'blur(10px)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
          {t('dash_resume_courses')} <ArrowRight size={16} style={{ verticalAlign: 'middle', marginLeft: '0.5rem' }} />
        </Link>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
          <div style={{ color: '#3b82f6', marginBottom: '0.5rem' }}><BookOpen size={24} /></div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1A1A2E' }}>{enrollments.length}</div>
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{t('dash_enrolled_courses')}</div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
          <div style={{ color: '#8b5cf6', marginBottom: '0.5rem' }}><LayoutDashboard size={24} /></div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1A1A2E' }}>{globalProgress} %</div>
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{t('dash_global_progress')}</div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
          <div style={{ color: '#10b981', marginBottom: '0.5rem' }}><CheckCircle2 size={24} /></div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1A1A2E' }}>{t('dash_last_activity')}</div>
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{t('dash_last_activity_today')}</div>
        </div>
      </div>
      <h2 style={{ fontSize: '1.3rem', color: '#1A1A2E', marginBottom: '1rem' }}>{t('dash_notifications')}</h2>
      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        {enrollments.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }}></div>
            <span style={{ color: '#334155' }}>{t('dash_join_live_notification')}</span>
          </div>
        ) : (
          <span style={{ color: '#94a3b8' }}>{t('dash_no_notifications')}</span>
        )}
      </div>
    </div>
  );
};

// =======================
// ONGLET 2 : MES FORMATIONS
// =======================
const CoursesTab = ({ enrollments, setEnrollments }) => {
  const [showLiveRoom, setShowLiveRoom] = useState(null);
  const { t, language } = useLanguage();
 
  const handleCancelEnrollment = async (enrollmentId) => {
    if (!window.confirm(language === 'en' ? "Are you sure you want to cancel this registration?" : "Êtes-vous sûr de vouloir annuler cette inscription ?")) return;
    try {
      const token = localStorage.getItem('nv_token');
      const res = await fetch(`${API_URL}/api/enroll/${enrollmentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
    } catch (err) {
      console.error(err);
    }
  };
 
  const getStatusBadge = (status) => {
    if (status === 'active') return <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700 }}>{language === 'en' ? 'Active' : 'Actif'}</span>;
    if (status === 'waitlist') return <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700 }}>{language === 'en' ? 'Waitlist' : "Liste d'attente"}</span>;
    return <span style={{ backgroundColor: '#e5e7eb', color: '#374151', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700 }}>{status}</span>;
  };
 
  return (
    <div className="fade-in">
      <h2 style={{ fontSize: '1.6rem', color: '#1A1A2E', marginBottom: '1.5rem' }}>{t('dash_my_courses')}</h2>
 
      {enrollments.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
          <BookOpen size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#1A1A2E' }}>{t('dash_no_courses')}</h3>
          <p style={{ color: '#64748b' }}>{t('dash_no_courses_desc')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {enrollments.map(e => (
            <div key={e.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', flex: 1 }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '8px', backgroundImage: `url(${e.imageUrl || '/10x.jpg'})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }}></div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem' }}>
                    {getStatusBadge(e.status)}
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{t('dash_student')} {e.childFirstName} {e.childLastName}</span>
                  </div>
                  <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.2rem', color: '#1A1A2E' }}>{e.courseTitle}</h3>
                  <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> {e.duration?.replace('semaines', language === 'en' ? 'weeks' : 'semaines')}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14} /> {t('dash_enrolled_on')} {new Date(e.createdAt).toLocaleDateString()}</span>
                  </div>
                  {e.status === 'active' && (
                    <div style={{ marginTop: '0.8rem', width: '220px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                        <span>{t('dash_course_progress')}</span>
                        <strong>{e.progress || 0}%</strong>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${e.progress || 0}%`, height: '100%', background: '#0F3460', borderRadius: '10px' }}></div>
                      </div>
                      {e.exercises && e.exercises.length > 0 && (
                        <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>{language === 'en' ? 'Exercises / Tasks' : 'Exercices / Tâches'}:</span>
                          {e.exercises.map((ex, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: ex.completed ? '#10b981' : '#64748b' }}>
                              {ex.completed ? <CheckCircle size={12} color="#10b981" /> : <div style={{ width: '12px', height: '12px', border: '1px solid #cbd5e1', borderRadius: '50%' }}></div>}
                              <span style={{ textDecoration: ex.completed ? 'line-through' : 'none' }}>{ex.title}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
 
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '180px' }}>
                <Link to={language === 'en' ? `/en/lessons/${e.courseId}` : `/mon-espace/lecons/${e.courseId}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: '#0F3460', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 600 }}>
                  {t('dash_view_syllabus')}
                </Link>
                {e.status === 'active' && e.isLive === 1 && e.liveRoomName && (
                  <button onClick={() => setShowLiveRoom(e.liveRoomName)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                    <Video size={16} /> {t('dash_join_live')}
                  </button>
                )}
                {e.status === 'active' && !!e.whatsappLink && (
                  <a href={e.whatsappLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: '#25D366', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 600 }}>
                    <MessageCircle size={16} /> WhatsApp
                  </a>
                )}
                <button onClick={() => handleCancelEnrollment(e.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', cursor: 'pointer', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                  <Trash2 size={14} /> {t('dash_cancel_enrollment')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
 
      {showLiveRoom && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ width: '100%', maxWidth: '1200px', height: '90vh', background: 'black', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem', background: '#1e293b', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'white', fontWeight: 'bold' }}>🔴 Live</span>
              <button onClick={() => setShowLiveRoom(null)} style={{ background: '#334155', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>{t('cancel')}</button>
            </div>
            <iframe src={`https://meet.jit.si/${showLiveRoom}`} allow="camera; microphone" style={{ flex: 1, border: 'none' }} />
          </div>
        </div>
      )}
    </div>
  );
};

// =======================
// ONGLET 3 : RESSOURCES
// =======================
const ResourcesTab = ({ enrollments }) => {
  const { t, language } = useLanguage();
  const [coursesResources, setCoursesResources] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState(null); // { type: 'video' | 'pdf', url: string, title: string }

  useEffect(() => {
    const fetchAllResources = async () => {
      try {
        const token = localStorage.getItem('nv_token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const resourcesMap = {};
        const activeEnrollments = enrollments.filter(e => e.status === 'active');
        
        await Promise.all(activeEnrollments.map(async (e) => {
          const res = await fetch(`${API_URL}/api/courses/${e.courseId}/structure`, { headers });
          if (res.ok) {
            const structure = await res.json();
            // Aplatir toutes les leçons des chapitres et modules
            const lessons = [];
            structure.forEach(m => {
              if (m.chapters) {
                m.chapters.forEach(c => {
                  if (c.lessons) {
                    c.lessons.forEach(l => {
                      lessons.push(l);
                    });
                  }
                });
              }
            });
            resourcesMap[e.courseId] = lessons;
          }
        }));
        
        setCoursesResources(resourcesMap);
      } catch (err) {
        console.error("Error fetching resources:", err);
      } finally {
        setLoading(false);
      }
    };

    if (enrollments.length > 0) {
      fetchAllResources();
    } else {
      setLoading(false);
    }
  }, [enrollments]);

  const activeEnrollments = enrollments.filter(e => e.status === 'active');

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>{t('loading')}</div>;
  }

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: '1.6rem', color: '#1A1A2E', marginBottom: '1.5rem' }}>{t('dash_pedagogical_resources')}</h2>
      
      {activeEnrollments.length === 0 ? (
        <div style={{ color: '#64748b', backgroundColor: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
          {t('dash_no_resources')}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {activeEnrollments.map(e => {
            const lessons = coursesResources[e.courseId] || [];
            
            return (
              <div key={e.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#0F3460', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', fontWeight: 700 }}>
                  {e.courseTitle}
                </h3>
                
                {lessons.length === 0 ? (
                  <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic', padding: '0.5rem 0' }}>
                    {language === 'en' ? 'No pedagogical resources available for this course yet.' : 'Aucune ressource pédagogique disponible pour ce cours pour le moment.'}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {lessons.map(lesson => {
                      const isVideo = lesson.type === 'video';
                      const isPdf = lesson.type === 'pdf';
                      
                      return (
                        <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                          {isPdf ? (
                            <FileText size={24} color="#ef4444" style={{ flexShrink: 0 }} />
                          ) : (
                            <Video size={24} color="#3b82f6" style={{ flexShrink: 0 }} />
                          )}
                          
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: '#1A1A2E' }}>{lesson.title}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              {isVideo 
                                ? (language === 'en' ? 'Video Session' : 'Enregistrement Vidéo') 
                                : (language === 'en' ? 'Course Materials (PDF)' : 'Support de cours (PDF)')}
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => setActiveMedia({ type: lesson.type, url: lesson.contentUrl, title: lesson.title })}
                            style={{ 
                              padding: '0.4rem 0.8rem', 
                              background: '#e2e8f0', 
                              color: '#334155',
                              border: 'none', 
                              borderRadius: '6px', 
                              cursor: 'pointer', 
                              fontWeight: 600,
                              fontSize: '0.85rem'
                            }}
                          >
                            {isVideo 
                              ? (language === 'en' ? 'Watch' : 'Visionner') 
                              : (language === 'en' ? 'Open' : 'Ouvrir')}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* POPUP MODAL POUR VIDEO OU PDF */}
      {activeMedia && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ width: '100%', maxWidth: '1000px', height: '85vh', background: 'white', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '1rem 1.5rem', background: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{activeMedia.title}</span>
              <button 
                onClick={() => setActiveMedia(null)} 
                style={{ background: '#475569', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                {t('cancel')}
              </button>
            </div>
            
            <div style={{ flex: 1, background: '#0f172a', position: 'relative' }}>
              {activeMedia.type === 'video' && activeMedia.url && (
                <iframe
                  src={activeMedia.url}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allowFullScreen
                  allow="autoplay; encrypted-media"
                  title={activeMedia.title}
                />
              )}
              {activeMedia.type === 'pdf' && activeMedia.url && (
                <iframe
                  src={activeMedia.url}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title={activeMedia.title}
                />
              )}
              {!activeMedia.url && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                  {language === 'en' ? 'No media URL available' : 'Aucun lien de média disponible'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =======================
// ONGLET 4 : PAIEMENTS
// =======================
const PaymentsTab = () => {
  const [payments, setPayments] = useState([]);
  const [payingEnrollment, setPayingEnrollment] = useState(null);
  const { user } = useAuth();
  const { t, language } = useLanguage();
  
  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('nv_token');
      const res = await fetch(`${API_URL}/api/enroll/my-enrollments`, { headers: { 'Authorization': `Bearer ${token}` }});
      if (res.ok) setPayments(await res.json());
    } catch (err) {}
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const downloadReceipt = (p) => {
    const token = localStorage.getItem('nv_token');
    window.open(`${API_URL}/api/enroll/enrollments/${p.id}/invoice?token=${token}`, '_blank');
  };

  const handleInstallmentSuccess = async (transactionId) => {
    if (!payingEnrollment) return;
    try {
      const token = localStorage.getItem('nv_token');
      const installmentAmount = Math.ceil((payingEnrollment.courseFullPrice || payingEnrollment.amount * 3) / 3);
      const res = await fetch(`${API_URL}/api/enroll/payments/${payingEnrollment.id}/pay-installment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: installmentAmount,
          paymentMethod: 'FedaPay',
          transactionId
        })
      });
      if (res.ok) {
        alert(language === 'en' ? "Installment paid successfully!" : "Mensualité payée avec succès !");
        setPayingEnrollment(null);
        fetchPayments();
      } else {
        alert(language === 'en' ? "Error validating the payment." : "Erreur lors de la validation du paiement.");
      }
    } catch (err) {
      alert("Error.");
    }
  };

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: '1.6rem', color: '#1A1A2E', marginBottom: '1.5rem' }}>{t('dash_payment_history')}</h2>
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>{t('dash_date')}</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>{t('nav_courses')}</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>{t('dash_type')}</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>{t('dash_installments')}</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>{t('dash_amount_paid')}</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>{t('dash_status')}</th>
              <th style={{ padding: '1rem', textAlign: 'right', color: '#64748b', fontWeight: 600 }}>{t('dash_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {payments.filter(p => p.status !== 'waitlist').map(p => {
              const isMensuel = p.paymentType === 'partial';
              const needsPayment = isMensuel && (p.amountPaid < p.totalAmount);
              return (
                <tr key={p.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{p.courseTitle || 'Formation'}</td>
                  <td style={{ padding: '1rem' }}>{isMensuel ? (language === 'en' ? 'Partial' : 'Partiel') : (language === 'en' ? 'Full' : 'Complet')}</td>
                  <td style={{ padding: '1rem' }}>
                    {isMensuel ? `50%` : '100%'}
                  </td>
                  <td style={{ padding: '1rem' }}>{p.amountPaid || 0} FCFA</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      background: needsPayment ? '#fef3c7' : '#dcfce7', 
                      color: needsPayment ? '#92400e' : '#166534', 
                      padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600 
                    }}>
                      {needsPayment ? t('dash_status_incomplete') : t('dash_status_paid')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {needsPayment && (
                      <button 
                        onClick={() => setPayingEnrollment(p)} 
                        style={{ 
                          background: '#3b82f6', color: 'white', border: 'none', 
                          padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', 
                          fontWeight: 600, fontSize: '0.8rem' 
                        }}
                      >
                        {t('dash_pay_installment')}
                      </button>
                    )}
                    <button 
                      onClick={() => downloadReceipt(p)}
                      style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Download size={16} /> {t('dash_receipt')}
                    </button>
                  </td>
                </tr>
              );
            })}
            {payments.filter(p => p.status !== 'waitlist').length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>{t('dash_no_payments')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {payingEnrollment && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px', boxShadow: '0 4px 24px rgba(0,0,0,0.15)', color: '#1e293b' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1A1A2E' }}>{t('dash_installment_modal_title')}</h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              {language === 'en' 
                ? `You are about to pay the remaining balance for the course "${payingEnrollment.courseTitle}".` 
                : `Vous vous apprêtez à payer le reste à payer pour la formation "${payingEnrollment.courseTitle}".`}
            </p>
            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>{t('dash_installment_amount')}</span>
                <strong>{(payingEnrollment.totalAmount - payingEnrollment.amountPaid)?.toLocaleString()} FCFA</strong>
              </div>
            </div>
            <FedapayWidget 
              amount={payingEnrollment.totalAmount - payingEnrollment.amountPaid}
              description={`Reste à payer - ${payingEnrollment.courseTitle}`}
              customerInfo={{
                email: user?.email,
                firstName: user?.firstName,
                lastName: user?.lastName || '',
                phone: user?.phone || ''
              }}
              onSuccess={handleInstallmentSuccess}
            />
            <button 
              onClick={() => setPayingEnrollment(null)} 
              style={{ width: '100%', padding: '0.8rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '0.8rem', fontWeight: 600 }}
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// =======================
// ONGLET 5 : MON COMPTE
// =======================
const AccountTab = () => {
  const { user, updateUserDetails } = useAuth();
  const { t } = useLanguage();
  const token = localStorage.getItem('nv_token');
  const fileInputRef = useRef(null);

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '', lastName: user?.lastName || '',
    email: user?.email || '', phone: user?.phone || '',
    parentName: user?.parentName || '', parentPhone: user?.parentPhone || ''
  });

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (res.ok) {
        updateUserDetails({ firstName: data.firstName, lastName: data.lastName, phone: data.phone, parentName: data.parentName, parentPhone: data.parentPhone });
        alert(t('dash_alert_profile_success'));
      } else alert(data.error);
    } catch (err) { alert(t('dash_alert_server_error')); }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return alert(t('dash_alert_pwd_mismatch'));
    try {
      const res = await fetch(`${API_URL}/api/user/password`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
      });
      if (res.ok) {
        alert(t('dash_alert_pwd_success'));
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else alert(t('dash_alert_error'));
    } catch (err) { alert(t('dash_alert_server_error')); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await fetch(`${API_URL}/api/user/avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        updateUserDetails({ avatar: data.avatar });
      } else {
        alert(data.error || t('dash_alert_avatar_upload_error'));
      }
    } catch (err) {
      alert(t('dash_alert_server_error'));
    }
  };

  const handleAvatarDelete = async () => {
    if (!window.confirm(t('dash_alert_avatar_delete_confirm'))) return;
    try {
      const res = await fetch(`${API_URL}/api/user/avatar`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        updateUserDetails({ avatar: null });
      }
    } catch (err) {
      alert(t('dash_alert_server_error'));
    }
  };

  return (
    <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      {/* Colonne 1 : Profil */}
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', color: '#1A1A2E' }}>{t('dash_profile_info')}</h3>
        <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white', fontWeight: 'bold' }}>
              {user?.avatar ? <img src={user.avatar} alt="avatar" style={{width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover'}} /> : user?.firstName?.[0] || 'A'}
            </div>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <input type="file" ref={fileInputRef} hidden onChange={handleAvatarChange} accept="image/*" />
              <button type="button" onClick={() => fileInputRef.current.click()} style={{ background: '#f1f5f9', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#0F3460' }}>{t('dash_modify_photo')}</button>
              {user?.avatar && (
                <button type="button" onClick={handleAvatarDelete} style={{ background: '#fee2e2', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#b91c1c' }}>{t('dash_delete_photo')}</button>
              )}
            </div>
          </div>

          <h4 style={{ margin: '0', color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase' }}>{t('dash_student_role')}</h4>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>{t('dash_firstname')}</label>
              <input type="text" value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>{t('dash_lastname')}</label>
              <input type="text" value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }} required />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>{t('dash_email')}</label>
              <input type="email" value={profileForm.email} disabled style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#94a3b8' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>{t('dash_phone')}</label>
              <input type="text" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }} placeholder="+229 00000000" />
            </div>
          </div>

          <h4 style={{ margin: '1rem 0 0 0', color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase' }}>{t('dash_parent_section')}</h4>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>{t('dash_parent_fullname')}</label>
            <input type="text" value={profileForm.parentName} onChange={e => setProfileForm({...profileForm, parentName: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }} placeholder="Ex: Jean Dupont" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>{t('dash_parent_phone')}</label>
            <input type="text" value={profileForm.parentPhone} onChange={e => setProfileForm({...profileForm, parentPhone: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }} placeholder="+229 00000000" />
          </div>

          <button type="submit" style={{ marginTop: '1rem', padding: '0.8rem', background: '#0F3460', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>{t('dash_save_profile')}</button>
        </form>
      </div>

      {/* Colonne 2 : Mot de passe */}
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', color: '#1A1A2E' }}>{t('dash_password_section')}</h3>
        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>{t('dash_current_pwd')}</label>
            <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>{t('dash_new_pwd')}</label>
            <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>{t('dash_confirm_pwd')}</label>
            <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }} required />
          </div>

          <button type="submit" style={{ marginTop: '1rem', padding: '0.8rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>{t('dash_update_pwd')}</button>
        </form>
      </div>
    </div>
  );
};

// =======================
// ONGLET 6 : DEVENIR FORMATEUR
// =======================
const BecomeFormateurTab = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState({ specialite: '', bio: '', photo: '' });
  const [status, setStatus] = useState('loading'); // loading, none, pending, rejected
  const token = localStorage.getItem('nv_token');

  useEffect(() => {
    fetch(`${API_URL}/api/user/application-status`, { headers: { 'Authorization': `Bearer ${token}` }})
      .then(r => r.json())
      .then(data => {
        setStatus(data.status || 'none');
      }).catch(() => setStatus('none'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/user/apply-formateur`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (res.ok) setStatus('pending');
      else alert(t('dash_apply_error'));
    } catch (err) {
      alert(t('dash_alert_server_error'));
    }
  };

  if (status === 'loading') return <div>{t('loading')}</div>;

  if (status === 'pending') {
    return (
      <div className="fade-in" style={{ background: 'white', padding: '3rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
        <CheckCircle2 size={48} color="#f59e0b" style={{ marginBottom: '1rem', display: 'inline-block' }} />
        <h2 style={{ color: '#1A1A2E' }}>{t('dash_apply_pending_title')}</h2>
        <p style={{ color: '#64748b' }}>{t('dash_apply_pending_desc')}</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: '1.6rem', color: '#1A1A2E', marginBottom: '1.5rem' }}>{t('dash_apply_title')}</h2>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>{t('dash_apply_desc')}</p>
        
        {status === 'rejected' && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{t('dash_apply_rejected')}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: 600 }}>{t('dash_apply_specialty')}</label>
            <input type="text" value={form.specialite} onChange={e => setForm({...form, specialite: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder={t('dash_apply_specialty_placeholder')} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: 600 }}>{t('dash_apply_bio')}</label>
            <textarea rows={5} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder={t('dash_apply_bio_placeholder')} required></textarea>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: 600 }}>{t('dash_apply_photo_opt')}</label>
            <input type="text" value={form.photo} onChange={e => setForm({...form, photo: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="https://..." />
          </div>
          <button type="submit" style={{ marginTop: '1rem', padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>{t('dash_apply_submit_btn')}</button>
        </form>
      </div>
    </div>
  );
};

export default ApprenantDashboard;
