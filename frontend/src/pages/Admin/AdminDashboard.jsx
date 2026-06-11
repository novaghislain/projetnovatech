import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Megaphone,
  CreditCard,
  LogOut,
  Users,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  MousePointerClick,
  Menu,
  X,
  BarChart3,
  Search,
  Mail,
  Settings
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import './AdminDashboard.css';

import AdminCategories from './AdminCategories';
import AdminFormations from './AdminFormations';
import AdminSessions from './AdminSessions';
import AdminAds from './AdminAds';
import AdminUsers from './AdminUsers';
import AdminContent from './AdminContent';
import AdminInscriptions from './AdminInscriptions';
import AdminMessages from './AdminMessages';
import AdminFormateurs from './AdminFormateurs';
import AdminCandidatures from './AdminCandidatures';
import AdminMetaPixel from './AdminMetaPixel';
import AdminParametres from './AdminParametres';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { ToastProvider } from '../../components/Toast';


const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [stats, setStats] = useState({ activeFormations: 0, totalUsers: 0, totalRevenue: 0 });
  const [extendedStats, setExtendedStats] = useState({ revenueThisMonth: 0, newUsersThisMonth: 0, pendingMessages: 0, pendingCandidatures: 0, activeInscriptions: 0 });
  const [payments, setPayments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // ── Sliding indicator sidebar ──
  const sidebarRef = useRef(null);
  const navRef = useRef(null);
  const itemRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 50 });

  const navItems = [
    { tab: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { tab: 'formations', icon: BookOpen, label: 'Formations' },
    { tab: 'inscriptions', icon: Users, label: 'Inscriptions' },
    { tab: 'paiements', icon: CreditCard, label: 'Paiements' },
    { tab: 'ads', icon: Megaphone, label: 'Publicités' },
    { tab: 'meta-pixel', icon: BarChart3, label: 'Marketing › Meta Pixel' },
    { tab: 'contenu', icon: Edit, label: 'Contenu' },
    { tab: 'messages', icon: Edit, label: 'Messages' },
    { tab: 'utilisateurs', icon: Users, label: 'Utilisateurs' },
    { tab: 'formateurs', icon: Users, label: 'Formateurs' },
    { tab: 'candidatures', icon: CheckCircle, label: 'Candidatures' },
    { tab: 'parametres', icon: Settings, label: 'Paramètres' },
  ];

  const updateIndicator = useCallback((tab) => {
    const el = itemRefs.current[tab];
    const wrap = navRef.current;
    if (el && wrap) {
      const wrapRect = wrap.getBoundingClientRect();
      const itemRect = el.getBoundingClientRect();
      setIndicatorStyle({
        top: itemRect.top - wrapRect.top,
        height: itemRect.height,
      });
    }
  }, []);

  const setActiveTabAndSlide = (tab) => {
    setActiveTab(tab);
    requestAnimationFrame(() => updateIndicator(tab));
  };

  useEffect(() => {
    updateIndicator(activeTab);
  }, [activeTab, updateIndicator]);

  useEffect(() => {
    const handleResize = () => updateIndicator(activeTab);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab, updateIndicator]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoadingDashboard(true);
        const token = localStorage.getItem('nv_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const statsRes = await fetch(`${API_URL}/api/admin/stats`, { headers });
        if (statsRes.ok) setStats(await statsRes.json());

        const payRes = await fetch(`${API_URL}/api/admin/payments`, { headers });
        if (payRes.ok) {
          const data = await payRes.json();
          setPayments(data);
          // Recent activity = last 5 payments
          setRecentActivity(data.slice(0, 5));
        }

        // Extended stats
        try {
          const now = new Date();
          const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

          const [usersRes, msgRes, candRes, inscRes] = await Promise.all([
            fetch(`${API_URL}/api/admin/users`, { headers }),
            fetch(`${API_URL}/api/admin/messages`, { headers }),
            fetch(`${API_URL}/api/admin/applications`, { headers }),
            fetch(`${API_URL}/api/admin/payments`, { headers }),
          ]);

          let newUsersThisMonth = 0;
          if (usersRes.ok) {
            const users = await usersRes.json();
            newUsersThisMonth = users.filter(u => new Date(u.createdAt) >= new Date(firstOfMonth)).length;
          }

          let pendingMessages = 0;
          if (msgRes.ok) {
            const msgs = await msgRes.json();
            pendingMessages = msgs.filter(m => !m.isRead).length;
          }

          let pendingCandidatures = 0;
          if (candRes.ok) {
            const apps = await candRes.json();
            pendingCandidatures = apps.filter(a => a.status === 'pending').length;
          }

          let activeInscriptions = 0;
          let revenueThisMonth = 0;
          if (inscRes.ok) {
            const ins = await inscRes.json();
            activeInscriptions = ins.filter(e => e.status === 'active').length;
            revenueThisMonth = ins
              .filter(e => e.status === 'active' && new Date(e.createdAt) >= new Date(firstOfMonth))
              .reduce((sum, e) => sum + (e.amount || 0), 0);
          }

          setExtendedStats({ revenueThisMonth, newUsersThisMonth, pendingMessages, pendingCandidatures, activeInscriptions });
        } catch (err) {
          console.error('Extended stats error:', err);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDashboard(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleDeletePayment = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce paiement ?')) {
      try {
        const token = localStorage.getItem('nv_token');
        await fetch(`${API_URL}/api/admin/payments/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        window.location.reload();
      } catch (err) {
        alert("Erreur lors de la suppression : " + err.message);
      }
    }
  };

  const getRevenueData = () => {
    const data = [];
    const today = new Date();
    for (let i = 9; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      data.push({ name: dateStr, revenus: 0, inscriptions: 0 });
    }

    payments.forEach(p => {
      const pDate = new Date(p.createdAt);
      const dateStr = pDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      const existing = data.find(item => item.name === dateStr);
      if (existing) {
        existing.inscriptions += 1;
        existing.revenus += p.amount || 0;
      }
    });

    return data;
  };

  const computedRevenueData = getRevenueData();

  const pageTitle = {
    dashboard: 'Tableau de Bord',
    formations: 'Formations',
    categories: 'Catégories',
    sessions: 'Sessions',
    ads: 'Campagnes Publicitaires',
    finances: 'Rapports Financiers',
    inscriptions: 'Inscriptions',
    contenu: 'Gestion du Contenu',
    messages: 'Messages de Contact',
    candidatures: 'Candidatures Formateurs',
    'meta-pixel': 'Marketing › Meta Pixel',
  };

  return (
    <div className="admin-layout">
      {/* MOBILE HEADER */}
      <div className="mobile-header">
        <img src="/4x.png" alt="Novatech Vision" onClick={() => window.location.href = '/'} />
        <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      {/* OVERLAY */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`} ref={sidebarRef}>
        <div className="sidebar-logo">
          <img src="/4x.png" alt="Novatech Vision" onClick={() => window.location.href = '/'} />
        </div>
        <div className="sidebar-nav-wrap" ref={navRef}
          onScroll={() => updateIndicator(activeTab)}>
          <div className="sidebar-indicator" style={{
            top: `${indicatorStyle.top}px`,
            height: `${indicatorStyle.height}px`,
          }} />
          {navItems.map(item => (
            <div
              key={item.tab}
              ref={el => { if (el) itemRefs.current[item.tab] = el; }}
              className={`menu-item ${activeTab === item.tab ? 'active' : ''}`}
              onClick={() => {
                setActiveTabAndSlide(item.tab);
                setIsSidebarOpen(false);
              }}
              title={item.label}
            >
              <item.icon size={22} />
              <span className="menu-text">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="sidebar-logout" onClick={logout} title="Déconnexion">
          <LogOut size={20} />
          <span className="menu-text">Déconnexion</span>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <ToastProvider>
        {/* TOP HEADER */}
        <div className="top-header">
          <div className="top-header-left">
            <h1>{pageTitle[activeTab] || 'Administration'}</h1>
          </div>
          <div className="top-header-right">
            <div className="search-box">
              <Search size={18} color="#9CA3AF" />
              <input type="text" placeholder="Rechercher..." />
            </div>
            <div className="user-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" />
              ) : (
                user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'A'
              )}
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="admin-content-area">

          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="fade-in">
              {loadingDashboard ? (
                <div className="dashboard-loading">
                  <div className="spin" style={{ width: 32, height: 32, border: '3px solid var(--gray)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
                  <p>Chargement du tableau de bord...</p>
                </div>
              ) : (
                <>
                  {/* KPI ROW 1 */}
                  <div className="kpi-grid">
                    <div className="stat-card primary">
                      <div className="stat-icon">
                        <BookOpen size={24} />
                      </div>
                      <div className="stat-info">
                        <div className="stat-value">{stats.activeFormations}</div>
                        <div className="stat-label">Formations Actives</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon blue">
                        <Users size={24} />
                      </div>
                      <div className="stat-info">
                        <div className="stat-value">{stats.totalUsers}</div>
                        <div className="stat-label">Utilisateurs Inscrits</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon purple">
                        <TrendingUp size={24} />
                      </div>
                      <div className="stat-info">
                        <div className="stat-value">{(stats.totalRevenue || 0).toLocaleString()}</div>
                        <div className="stat-label">Revenus Total (FCFA)</div>
                      </div>
                    </div>
                    <div className="stat-card accent">
                      <div className="stat-icon green">
                        <CreditCard size={24} />
                      </div>
                      <div className="stat-info">
                        <div className="stat-value">{(extendedStats.revenueThisMonth || 0).toLocaleString()}</div>
                        <div className="stat-label">Revenus Ce Mois</div>
                      </div>
                    </div>
                  </div>

                  {/* KPI ROW 2 */}
                  <div className="kpi-grid secondary">
                    <div className="stat-card mini">
                      <div className="stat-icon teal">
                        <Users size={20} />
                      </div>
                      <div className="stat-info">
                        <div className="stat-value" style={{ fontSize: '1.3rem' }}>+{extendedStats.newUsersThisMonth}</div>
                        <div className="stat-label">Nouveaux utilisateurs ce mois</div>
                      </div>
                    </div>
                    <div className="stat-card mini">
                      <div className="stat-icon orange">
                        <BookOpen size={20} />
                      </div>
                      <div className="stat-info">
                        <div className="stat-value" style={{ fontSize: '1.3rem' }}>{extendedStats.activeInscriptions}</div>
                        <div className="stat-label">Inscriptions actives</div>
                      </div>
                    </div>
                    <div className="stat-card mini">
                      <div className="stat-icon red">
                        <Mail size={20} />
                      </div>
                      <div className="stat-info">
                        <div className="stat-value" style={{ fontSize: '1.3rem' }}>{extendedStats.pendingMessages}</div>
                        <div className="stat-label">Messages non lus</div>
                      </div>
                    </div>
                    <div className="stat-card mini">
                      <div className="stat-icon yellow">
                        <CheckCircle size={20} />
                      </div>
                      <div className="stat-info">
                        <div className="stat-value" style={{ fontSize: '1.3rem' }}>{extendedStats.pendingCandidatures}</div>
                        <div className="stat-label">Candidatures en attente</div>
                      </div>
                    </div>
                  </div>

                  {/* CHART + ACTIVITY SIDE BY SIDE */}
                  <div className="dashboard-two-col">
                    <div className="chart-container">
                      <div className="chart-header">
                        <h3>Évolution des Inscriptions & Revenus (10 jours)</h3>
                      </div>
                      <div style={{ width: '100%', height: 280 }}>
                        <ResponsiveContainer>
                          <LineChart data={computedRevenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dx={-10} />
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dx={10} />
                            <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                            <Line yAxisId="left" type="monotone" dataKey="revenus" stroke="#8B5CF6" strokeWidth={3} dot={{r: 4, fill: '#8B5CF6'}} activeDot={{r: 6}} name="Revenus (FCFA)" />
                            <Line yAxisId="right" type="monotone" dataKey="inscriptions" stroke="#3B82F6" strokeWidth={3} dot={{r: 4, fill: '#3B82F6'}} activeDot={{r: 6}} name="Inscriptions" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* ACTIVITY FEED */}
                    <div className="activity-feed">
                      <div className="activity-feed-header">
                        <h3>Activités Récentes</h3>
                        <span className="admin-badge neutral">{recentActivity.length} transactions</span>
                      </div>
                      <div className="activity-list">
                        {recentActivity.length === 0 ? (
                          <div className="empty-state" style={{ padding: '1.5rem' }}>Aucune activité récente</div>
                        ) : (
                          recentActivity.map(a => (
                            <div key={a.id || a.transactionId} className="activity-item">
                              <div className="activity-icon">
                                <CreditCard size={14} />
                              </div>
                              <div className="activity-details">
                                <div className="activity-title">
                                  {a.firstName} {a.lastName} — <span style={{ fontWeight: 500 }}>{a.title}</span>
                                </div>
                                <div className="activity-meta">
                                  <span>{new Date(a.createdAt).toLocaleDateString('fr-FR')}</span>
                                  <span className={`admin-badge ${a.status === 'active' ? 'success' : 'warning'}`} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                                    {a.status === 'active' ? 'Actif' : 'En attente'}
                                  </span>
                                </div>
                              </div>
                              <div className="activity-amount">
                                {a.amount?.toLocaleString()} FCFA
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* QUICK ACTIONS */}
                  <div className="quick-actions">
                    <h3>Actions Rapides</h3>
                    <div className="quick-actions-grid">
                      <button className="quick-action-card" onClick={() => setActiveTabAndSlide('formations')}>
                        <BookOpen size={24} />
                        <span>Nouvelle Formation</span>
                        <small>Créer et publier</small>
                      </button>
                      <button className="quick-action-card" onClick={() => setActiveTabAndSlide('messages')}>
                        <Mail size={24} />
                        <span>Messages</span>
                        <small>{extendedStats.pendingMessages} non lu(s)</small>
                      </button>
                      <button className="quick-action-card" onClick={() => setActiveTabAndSlide('candidatures')}>
                        <CheckCircle size={24} />
                        <span>Candidatures</span>
                        <small>{extendedStats.pendingCandidatures} en attente</small>
                      </button>
                      <button className="quick-action-card" onClick={() => setActiveTabAndSlide('inscriptions')}>
                        <Users size={24} />
                        <span>Inscriptions</span>
                        <small>Voir les apprenants</small>
                      </button>
                      <button className="quick-action-card" onClick={() => setActiveTabAndSlide('meta-pixel')}>
                        <BarChart3 size={24} />
                        <span>Meta Pixel</span>
                        <small>Suivi marketing</small>
                      </button>
                      <button className="quick-action-card" onClick={() => setActiveTabAndSlide('ads')}>
                        <Megaphone size={24} />
                        <span>Publicités</span>
                        <small>Campagnes en cours</small>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* MODULE TABS */}
          {activeTab === 'categories' && <AdminCategories />}
          {activeTab === 'formations' && <AdminFormations />}
          {activeTab === 'sessions' && <AdminSessions />}
          {activeTab === 'ads' && <AdminAds />}
          {activeTab === 'utilisateurs' && <AdminUsers />}
          {activeTab === 'formateurs' && <AdminFormateurs />}
          {activeTab === 'candidatures' && <AdminCandidatures />}
          {activeTab === 'contenu' && <AdminContent />}
          {activeTab === 'messages' && <AdminMessages />}
          {activeTab === 'meta-pixel' && <AdminMetaPixel />}
          {activeTab === 'inscriptions' && <AdminInscriptions />}
          {activeTab === 'parametres' && <AdminParametres />}

          {/* TAB: PAIEMENTS */}
          {activeTab === 'paiements' && (
            <div className="fade-in">
              <div className="kpi-grid">
                <div className="stat-card primary">
                  <div className="stat-icon">
                    <CheckCircle size={24} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">{payments.length}</div>
                    <div className="stat-label">Paiements Validés</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon purple">
                    <CreditCard size={24} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">{(stats.totalRevenue || 0).toLocaleString()}</div>
                    <div className="stat-label">Total Encaissé (FCFA)</div>
                  </div>
                </div>
              </div>

              <div className="table-container">
                <div className="table-header">
                  <h3>Historique des Transactions</h3>
                </div>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID Transaction</th>
                        <th>Apprenant</th>
                        <th>Formation</th>
                        <th>Montant</th>
                        <th>Méthode</th>
                        <th>Date</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(trx => (
                        <tr key={trx.transactionId}>
                          <td style={{ fontFamily: 'monospace', color: '#6B7280' }}>TRX-{trx.transactionId}</td>
                          <td style={{ fontWeight: 600 }}>{trx.firstName} {trx.lastName}</td>
                          <td>{trx.courseTitle}</td>
                          <td>{trx.amount?.toLocaleString()} FCFA</td>
                          <td>
                            <span style={{ background: '#F3F4F6', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                              {trx.paymentMethod || 'Mobile Money'}
                            </span>
                          </td>
                          <td>{new Date(trx.createdAt).toLocaleDateString()}</td>
                          <td>
                            {trx.status === 'active' ? (
                              <span className="status-badge active">
                                <CheckCircle size={12} /> Succès
                              </span>
                            ) : (
                              <span className="status-badge pending">
                                <XCircle size={12} /> En attente
                              </span>
                            )}
                          </td>
                          <td>
                            <button
                              onClick={() => handleDeletePayment(trx.transactionId)}
                              className="btn-danger"
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {payments.length === 0 && (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>Aucune transaction trouvée.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
        </ToastProvider>
      </main>
    </div>
  );
};

export default AdminDashboard;
