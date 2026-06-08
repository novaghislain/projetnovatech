import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, BookOpen, FileText, CreditCard, User, LogOut,
  Menu, X, Clock, Video, MessageCircle, Download, CheckCircle2, ArrowRight,
  TrendingUp, Calendar, Trash2
} from 'lucide-react';
import { Link, useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { API_URL } from '../config';
import './Admin/AdminDashboard.css';

// =======================
// COMPOSANT PRINCIPAL
// =======================
const ApprenantDashboard = () => {
  const { user, logout, updateUserDetails } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
    { id: 'overview', path: '/mon-espace', icon: LayoutDashboard, label: 'Tableau de bord' },
    { id: 'courses', path: '/mon-espace/formations', icon: BookOpen, label: 'Mes formations' },
    { id: 'resources', path: '/mon-espace/ressources', icon: FileText, label: 'Ressources' },
    { id: 'payments', path: '/mon-espace/paiements', icon: CreditCard, label: 'Paiements' },
    { id: 'account', path: '/mon-espace/compte', icon: User, label: 'Mon compte' },
    { id: 'apply', path: '/mon-espace/devenir-formateur', icon: TrendingUp, label: 'Devenir Formateur' },
  ];

  return (
    <div className="admin-layout" style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#f8fafc' }}>
      
      {/* MOBILE HEADER */}
      <div className="mobile-admin-header" style={{ display: 'none', justifyContent: 'space-between', padding: '1rem', background: '#1A1A2E', color: 'white' }}>
        <img src="/4x.png" alt="Logo" style={{ height: '30px' }} />
        <button onClick={() => setMobileMenuOpen(true)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          <Menu size={24} />
        </button>
      </div>

      {/* SIDEBAR */}
      <div className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`} style={{ 
        width: '260px', background: '#1A1A2E', color: 'white', display: 'flex', flexDirection: 'column',
        boxShadow: '4px 0 20px rgba(0,0,0,0.1)', zIndex: 100
      }}>
        {mobileMenuOpen && (
          <button onClick={() => setMobileMenuOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        )}
        
        <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
          <img src="/4x.png" alt="Novatech Vision" style={{ height: '40px' }} />
        </div>

        <nav style={{ padding: '1.5rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map(item => (
            <Link 
              key={item.id} 
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem',
                borderRadius: '8px', textDecoration: 'none', transition: 'all 0.2s',
                background: activeTab === item.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                color: activeTab === item.id ? '#60a5fa' : 'rgba(255,255,255,0.7)',
                borderLeft: activeTab === item.id ? '3px solid #3b82f6' : '3px solid transparent'
              }}
            >
              <item.icon size={20} />
              <span style={{ fontWeight: 500 }}>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {/* Bloc profil en bas */}
          <div style={{ padding: '1.2rem 1.2rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem', flexShrink: 0 }}>
              {user?.avatar
                ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : user?.firstName?.[0] || 'A'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.firstName} {user?.lastName}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>Espace Apprenant</div>
            </div>
          </div>
          {/* Déconnexion */}
          <div style={{ padding: '0 1rem 1.2rem' }}>
            <button onClick={handleLogout} style={{
              display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.7rem 1rem',
              width: '100%', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444', cursor: 'pointer', borderRadius: '8px', transition: 'all 0.2s'
            }}>
              <LogOut size={18} />
              <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, height: '100vh', overflowY: 'auto' }}>
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
      </div>

    </div>
  );
};

// =======================
// ONGLET 1 : TABLEAU DE BORD
// =======================
const OverviewTab = ({ enrollments }) => {
  const { user } = useAuth();
  
  const activeCourses = enrollments.filter(e => e.status === 'active');
  const paidCount = enrollments.filter(e => e.amountPaid > 0).length;

  return (
    <div className="fade-in">
      <div style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #0F3460 100%)', color: 'white', padding: '2.5rem', borderRadius: '16px', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 32px rgba(15, 52, 96, 0.2)' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>Bonjour, {user?.firstName} 👋</h1>
          <p style={{ margin: 0, opacity: 0.75, fontSize: '0.95rem', color: '#e2e8f0' }}>
            {activeCourses.length} formation(s) en cours &nbsp;·&nbsp; {paidCount} paiement(s) effectué(s)
          </p>
        </div>
        <Link to="/mon-espace/formations" style={{ padding: '0.8rem 1.5rem', background: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: '50px', textDecoration: 'none', fontWeight: 600, backdropFilter: 'blur(10px)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
          Reprendre mes cours <ArrowRight size={16} style={{ verticalAlign: 'middle', marginLeft: '0.5rem' }} />
        </Link>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
          <div style={{ color: '#3b82f6', marginBottom: '0.5rem' }}><BookOpen size={24} /></div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1A1A2E' }}>{enrollments.length}</div>
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Formations inscrites</div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
          <div style={{ color: '#8b5cf6', marginBottom: '0.5rem' }}><LayoutDashboard size={24} /></div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1A1A2E' }}>65 %</div>
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Progression globale</div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
          <div style={{ color: '#10b981', marginBottom: '0.5rem' }}><CheckCircle2 size={24} /></div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1A1A2E' }}>Dernière activité</div>
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Aujourd'hui</div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.3rem', color: '#1A1A2E', marginBottom: '1rem' }}>🔔 Notifications importantes</h2>
      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        {enrollments.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }}></div>
            <span style={{ color: '#334155' }}>N'oubliez pas de rejoindre votre prochain cours Live.</span>
          </div>
        ) : (
          <span style={{ color: '#94a3b8' }}>Aucune notification pour le moment.</span>
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

  const handleCancelEnrollment = async (enrollmentId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette inscription ?")) return;
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
    if (status === 'active') return <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700 }}>Actif</span>;
    if (status === 'waitlist') return <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700 }}>Liste d'attente</span>;
    return <span style={{ backgroundColor: '#e5e7eb', color: '#374151', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700 }}>{status}</span>;
  };

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: '1.6rem', color: '#1A1A2E', marginBottom: '1.5rem' }}>Mes Formations</h2>

      {enrollments.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
          <BookOpen size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#1A1A2E' }}>Aucune formation</h3>
          <p style={{ color: '#64748b' }}>Vous n'êtes inscrit à aucune formation pour l'instant.</p>
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
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Élève : {e.childFirstName} {e.childLastName}</span>
                  </div>
                  <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.2rem', color: '#1A1A2E' }}>{e.courseTitle}</h3>
                  <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> {e.duration}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14} /> Inscrit le {new Date(e.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '180px' }}>
                <Link to={`/mon-espace/lecons/${e.courseId}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: '#0F3460', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 600 }}>
                  Voir le programme
                </Link>
                {e.status === 'active' && e.isLive === 1 && e.liveRoomName && (
                  <button onClick={() => setShowLiveRoom(e.liveRoomName)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                    <Video size={16} /> Rejoindre le Live
                  </button>
                )}
                {e.status === 'active' && !!e.whatsappLink && (
                  <a href={e.whatsappLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: '#25D366', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 600 }}>
                    <MessageCircle size={16} /> WhatsApp
                  </a>
                )}
                <button onClick={() => handleCancelEnrollment(e.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', cursor: 'pointer', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                  <Trash2 size={14} /> Annuler inscription
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
              <button onClick={() => setShowLiveRoom(null)} style={{ background: '#334155', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>Fermer</button>
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
  return (
    <div className="fade-in">
      <h2 style={{ fontSize: '1.6rem', color: '#1A1A2E', marginBottom: '1.5rem' }}>Ressources Pédagogiques</h2>
      {enrollments.length === 0 ? (
        <div style={{ color: '#64748b' }}>Inscrivez-vous à une formation pour voir les ressources.</div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {enrollments.map(e => (
            <div key={e.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#0F3460', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>{e.courseTitle}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <FileText size={24} color="#ef4444" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>Support de Cours - Module 1 (PDF)</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Introduction générale</div>
                  </div>
                  <button style={{ padding: '0.4rem 0.8rem', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Ouvrir</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <Video size={24} color="#3b82f6" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>Enregistrement Vidéo - Séance 1</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Durée: 45 min</div>
                  </div>
                  <button style={{ padding: '0.4rem 0.8rem', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Visionner</button>
                </div>
              </div>
            </div>
          ))}
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
  
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('nv_token');
        const res = await fetch(`${API_URL}/api/user/payments`, { headers: { 'Authorization': `Bearer ${token}` }});
        if (res.ok) setPayments(await res.json());
      } catch (err) {}
    };
    fetchPayments();
  }, []);

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: '1.6rem', color: '#1A1A2E', marginBottom: '1.5rem' }}>Historique des Paiements</h2>
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>Formation</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>Montant</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>Statut</th>
              <th style={{ padding: '1rem', textAlign: 'right', color: '#64748b', fontWeight: 600 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{p.courseTitle || 'Formation'}</td>
                <td style={{ padding: '1rem' }}>{p.amountPaid || 0} FCFA</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600 }}>Payé</span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Download size={16} /> Reçu
                  </button>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Aucun paiement trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// =======================
// ONGLET 5 : MON COMPTE
// =======================
const AccountTab = () => {
  const { user, updateUserDetails } = useAuth();
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
        alert('Profil mis à jour');
      } else alert(data.error);
    } catch (err) { alert('Erreur serveur'); }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return alert('Les mots de passe ne correspondent pas.');
    try {
      const res = await fetch(`${API_URL}/api/user/password`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
      });
      if (res.ok) {
        alert('Mot de passe mis à jour');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else alert('Erreur');
    } catch (err) { alert('Erreur serveur'); }
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
        alert(data.error || "Erreur lors de l'upload");
      }
    } catch (err) {
      alert('Erreur serveur');
    }
  };

  const handleAvatarDelete = async () => {
    if (!window.confirm("Supprimer la photo de profil ?")) return;
    try {
      const res = await fetch(`${API_URL}/api/user/avatar`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        updateUserDetails({ avatar: null });
      }
    } catch (err) {
      alert('Erreur serveur');
    }
  };

  return (
    <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      {/* Colonne 1 : Profil */}
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', color: '#1A1A2E' }}>👤 Informations du Profil</h3>
        <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white', fontWeight: 'bold' }}>
              {user?.avatar ? <img src={user.avatar} alt="avatar" style={{width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover'}} /> : user?.firstName?.[0] || 'A'}
            </div>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <input type="file" ref={fileInputRef} hidden onChange={handleAvatarChange} accept="image/*" />
              <button type="button" onClick={() => fileInputRef.current.click()} style={{ background: '#f1f5f9', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#0F3460' }}>Modifier la photo</button>
              {user?.avatar && (
                <button type="button" onClick={handleAvatarDelete} style={{ background: '#fee2e2', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#b91c1c' }}>Supprimer</button>
              )}
            </div>
          </div>

          <h4 style={{ margin: '0', color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase' }}>Apprenant</h4>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Prénom</label>
              <input type="text" value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Nom</label>
              <input type="text" value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }} required />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Email</label>
              <input type="email" value={profileForm.email} disabled style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#94a3b8' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Téléphone apprenant</label>
              <input type="text" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }} placeholder="+229 00000000" />
            </div>
          </div>

          <h4 style={{ margin: '1rem 0 0 0', color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase' }}>Parent / Tuteur</h4>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Nom complet du parent</label>
            <input type="text" value={profileForm.parentName} onChange={e => setProfileForm({...profileForm, parentName: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }} placeholder="Ex: Jean Dupont" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Téléphone du parent</label>
            <input type="text" value={profileForm.parentPhone} onChange={e => setProfileForm({...profileForm, parentPhone: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }} placeholder="+229 00000000" />
          </div>

          <button type="submit" style={{ marginTop: '1rem', padding: '0.8rem', background: '#0F3460', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Enregistrer les modifications</button>
        </form>
      </div>

      {/* Colonne 2 : Mot de passe */}
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', color: '#1A1A2E' }}>🔒 Mot de passe</h3>
        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Mot de passe actuel</label>
            <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Nouveau mot de passe</label>
            <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Confirmer le mot de passe</label>
            <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }} required />
          </div>

          <button type="submit" style={{ marginTop: '1rem', padding: '0.8rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Mettre à jour</button>
        </form>
      </div>
    </div>
  );
};

// =======================
// ONGLET 6 : DEVENIR FORMATEUR
// =======================
const BecomeFormateurTab = () => {
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
      else alert("Erreur lors de l'envoi de la candidature");
    } catch (err) {
      alert("Erreur serveur");
    }
  };

  if (status === 'loading') return <div>Chargement...</div>;

  if (status === 'pending') {
    return (
      <div className="fade-in" style={{ background: 'white', padding: '3rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
        <CheckCircle2 size={48} color="#f59e0b" style={{ marginBottom: '1rem', display: 'inline-block' }} />
        <h2 style={{ color: '#1A1A2E' }}>Candidature en cours d'examen</h2>
        <p style={{ color: '#64748b' }}>Votre candidature pour devenir formateur est actuellement en cours de révision par notre équipe. Nous vous contacterons très prochainement.</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: '1.6rem', color: '#1A1A2E', marginBottom: '1.5rem' }}>Devenir Formateur</h2>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Rejoignez l'équipe pédagogique de Novatech Vision et partagez votre passion avec la nouvelle génération !</p>
        
        {status === 'rejected' && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>Votre précédente candidature n'a pas été retenue. Vous pouvez soumettre une nouvelle demande.</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: 600 }}>Spécialité *</label>
            <input type="text" value={form.specialite} onChange={e => setForm({...form, specialite: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="Ex: Développement Web, Intelligence Artificielle..." required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: 600 }}>Biographie & Motivation *</label>
            <textarea rows={5} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="Présentez-vous brièvement et expliquez pourquoi vous souhaitez devenir formateur..." required></textarea>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: 600 }}>Lien vers photo de profil / portfolio (Optionnel)</label>
            <input type="text" value={form.photo} onChange={e => setForm({...form, photo: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="https://..." />
          </div>
          <button type="submit" style={{ marginTop: '1rem', padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>Soumettre ma candidature</button>
        </form>
      </div>
    </div>
  );
};

export default ApprenantDashboard;
