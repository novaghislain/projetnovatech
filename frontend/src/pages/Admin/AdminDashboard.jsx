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
  Settings,
  Download,
  User
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

import AdminUsers from './AdminUsers';
import AdminContent from './AdminContent';
import AdminInscriptions from './AdminInscriptions';
import AdminMessages from './AdminMessages';
import AdminFormateurs from './AdminFormateurs';
import AdminCandidatures from './AdminCandidatures';
import AdminMetaPixel from './AdminMetaPixel';
import Parametres from '../Parametres';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL, getImageUrl } from '../../config';
import { ToastProvider } from '../../components/Toast';


const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(user?.role === 'admin_restreint' ? 'formations' : 'dashboard');
  const [stats, setStats] = useState({ activeFormations: 0, totalUsers: 0, totalRevenue: 0 });
  const [extendedStats, setExtendedStats] = useState({ revenueThisMonth: 0, newUsersThisMonth: 0, pendingMessages: 0, pendingCandidatures: 0, activeInscriptions: 0 });
  const [payments, setPayments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // --- Finances State ---
  const [financialStats, setFinancialStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionTotal, setTransactionTotal] = useState(0);
  const [financePage, setFinancePage] = useState(1);
  const [financeSearch, setFinanceSearch] = useState('');
  const [financeSearchInput, setFinanceSearchInput] = useState('');
  const [financeMethod, setFinanceMethod] = useState('');
  const [financeLoading, setFinanceLoading] = useState(false);

  // ── Sliding indicator sidebar ──
  const sidebarRef = useRef(null);
  const navRef = useRef(null);
  const itemRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 50 });

  const navItems = [
    { tab: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { tab: 'formations', icon: BookOpen, label: 'Formations' },
    { tab: 'inscriptions', icon: Users, label: 'Inscriptions' },
    { tab: 'finances', icon: CreditCard, label: 'Finances' },
    { tab: 'meta-pixel', icon: BarChart3, label: 'Marketing › Meta Pixel' },
    { tab: 'contenu', icon: Edit, label: 'Contenu' },
    { tab: 'messages', icon: Edit, label: 'Messages' },
    { tab: 'utilisateurs', icon: Users, label: 'Utilisateurs' },
    { tab: 'formateurs', icon: Users, label: 'Formateurs' },
    { tab: 'candidatures', icon: CheckCircle, label: 'Candidatures' },
    { tab: 'profile_settings', icon: User, label: 'Paramètres du Profil' },
  ].filter(item => {
    if (user?.role === 'admin_restreint') {
      return item.tab === 'formations';
    }
    return true;
  });

  const updateIndicator = useCallback((tab) => {
    const el = itemRefs.current[tab];
    const wrap = navRef.current;
    if (el && wrap) {
      const wrapRect = wrap.getBoundingClientRect();
      const itemRect = el.getBoundingClientRect();
      setIndicatorStyle({
        top: el.offsetTop,
        height: el.offsetHeight,
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

  const fetchFinanceData = async () => {
    try {
      setFinanceLoading(true);
      const token = localStorage.getItem('nv_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Fetch financial stats
      const statsRes = await fetch(`${API_URL}/api/admin/financial-stats`, { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setFinancialStats(statsData);
      }

      // 2. Fetch transactions
      const queryParams = new URLSearchParams({
        page: financePage,
        limit: 10,
        search: financeSearch,
        method: financeMethod
      });

      const txRes = await fetch(`${API_URL}/api/admin/transactions?${queryParams}`, { headers });
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData.transactions || []);
        setTransactionTotal(txData.total || 0);
      }
    } catch (err) {
      console.error('Error fetching finance data:', err);
    } finally {
      setFinanceLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'finances') {
      fetchFinanceData();
    }
  }, [activeTab, financePage, financeMethod, financeSearch]);

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
    'profile_settings': 'Paramètres du Profil',
  };

  return (
    <div className="admin-layout">
      {/* MOBILE HEADER */}
      <div className="mobile-header">
        <img src="/4x.png" alt="FormationNova" onClick={() => window.location.href = '/'} />
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
          <img src="/4x.png" alt="FormationNova" onClick={() => window.location.href = '/'} />
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
                <img src={getImageUrl(user.avatar)} alt="Avatar" />
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
                      <div style={{ width: '100%', height: 260, minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={computedRevenueData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 10}} dy={10} />
                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 10}} dx={-4} width={30} />
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 10}} dx={4} width={30} />
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

          {activeTab === 'utilisateurs' && <AdminUsers />}
          {activeTab === 'formateurs' && <AdminFormateurs />}
          {activeTab === 'candidatures' && <AdminCandidatures />}
          {activeTab === 'profile_settings' && <Parametres />}
          {activeTab === 'contenu' && <AdminContent />}
          {activeTab === 'messages' && <AdminMessages />}
          {activeTab === 'meta-pixel' && <AdminMetaPixel />}
          {activeTab === 'inscriptions' && <AdminInscriptions />}

          {/* TAB: FINANCES */}
          {activeTab === 'finances' && (
            <div className="fade-in">
              {/* Financial KPI stats grid */}
              {financeLoading && !financialStats ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <div className="spin" style={{ margin: '0 auto 1rem', width: 32, height: 32, border: '3px solid var(--gray)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
                  <p>Chargement des statistiques financières...</p>
                </div>
              ) : (
                <>
                  <div className="kpi-grid">
                    <div className="stat-card primary">
                      <div className="stat-icon">
                        <TrendingUp size={24} />
                      </div>
                      <div className="stat-info">
                        <div className="stat-value">{(financialStats?.totalRevenue || 0).toLocaleString()} FCFA</div>
                        <div className="stat-label">Revenus Totaux</div>
                      </div>
                    </div>
                    <div className="stat-card accent">
                      <div className="stat-icon">
                        <CreditCard size={24} />
                      </div>
                      <div className="stat-info">
                        <div className="stat-value">{(financialStats?.monthRevenue || 0).toLocaleString()} FCFA</div>
                        <div className="stat-label">Revenus ce mois</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon blue">
                        <Users size={24} />
                      </div>
                      <div className="stat-info">
                        <div className="stat-value">{financialStats?.totalTransactions || 0}</div>
                        <div className="stat-label">Inscriptions Confirmées</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon green">
                        <CheckCircle size={24} />
                      </div>
                      <div className="stat-info">
                        <div className="stat-value">{Math.round(financialStats?.avgAmount || 0).toLocaleString()} FCFA</div>
                        <div className="stat-label">Panier Moyen</div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods Breakdown */}
                  <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.03)', marginBottom: '24px', border: '1px solid #f1f5f9' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--dark)', fontWeight: 700, fontSize: '0.95rem' }}>Modes de paiement</h4>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                      {financialStats?.byMethod?.map(m => (
                        <div key={m.paymentMethod} style={{ background: '#f8fafc', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', minWidth: '150px' }}>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                            {m.paymentMethod || 'Inconnu'}
                          </div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--dark)', marginTop: '4px' }}>
                            {m.total?.toLocaleString()} FCFA
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                            {m.count} paiement(s)
                          </div>
                        </div>
                      ))}
                      {(!financialStats?.byMethod || financialStats.byMethod.length === 0) && (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9rem' }}>Aucune donnée par mode de paiement.</span>
                      )}
                    </div>
                  </div>

                  {/* Chart for Monthly evolution */}
                  {financialStats?.byMonth && financialStats.byMonth.length > 0 && (
                    <div className="chart-container">
                      <div className="chart-header">
                        <h3>Évolution Mensuelle des Revenus (6 derniers mois)</h3>
                      </div>
                      <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                          <LineChart data={financialStats.byMonth} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dx={-10} />
                            <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} activeDot={{r: 6}} name="Revenus (FCFA)" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Transactions List */}
              <div className="table-container" style={{ borderTop: '4px solid #1A1A2E' }}>
                <div className="table-header" style={{ background: 'none', borderBottom: '1px solid #f1f5f9', padding: '1.25rem 1.5rem' }}>
                  <h3 style={{ color: 'var(--dark)', fontSize: '1.05rem', fontWeight: 700 }}>Historique des Transactions</h3>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <form onSubmit={(e) => { e.preventDefault(); setFinanceSearch(financeSearchInput); setFinancePage(1); }} style={{ display: 'flex', gap: '0.5rem' }}>
                      <div className="search-box" style={{ width: '240px', padding: '6px 15px', borderRadius: '8px', marginBottom: 0 }}>
                        <Search size={16} color="#9CA3AF" />
                        <input 
                          type="text" 
                          placeholder="Rechercher..." 
                          value={financeSearchInput}
                          onChange={(e) => setFinanceSearchInput(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="tab-btn" style={{ padding: '0.4rem 1rem', borderRadius: '8px' }}>
                        Filtrer
                      </button>
                    </form>
                    <select 
                      className="form-control" 
                      style={{ width: '150px', marginBottom: 0, padding: '0.4rem', borderRadius: '8px' }} 
                      value={financeMethod} 
                      onChange={(e) => { setFinanceMethod(e.target.value); setFinancePage(1); }}
                    >
                      <option value="">Tous les modes</option>
                      <option value="FedaPay Mobile Money">Mobile Money</option>
                      <option value="FedaPay">FedaPay</option>
                      <option value="FedaPay Card">Carte Bancaire</option>
                    </select>
                  </div>
                </div>

                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID Inscription</th>
                        <th>Transaction FedaPay</th>
                        <th>Apprenant & Client</th>
                        <th>Formation</th>
                        <th>Type</th>
                        <th>Montant Payé</th>
                        <th>Méthode</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financeLoading ? (
                        <tr>
                          <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>Chargement...</td>
                        </tr>
                      ) : transactions.length === 0 ? (
                        <tr>
                          <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>Aucune transaction trouvée.</td>
                        </tr>
                      ) : (
                        transactions.map(trx => {
                          const token = localStorage.getItem('nv_token');
                          // Determine Learner/Client name
                          const learnerName = (trx.childFirstName || trx.childLastName)
                            ? `${trx.childFirstName || ''} ${trx.childLastName || ''}`.trim()
                            : (trx.guestFirstName || trx.guestLastName)
                              ? `${trx.guestFirstName || ''} ${trx.guestLastName || ''}`.trim()
                              : `${trx.userFirstName || 'N/A'} ${trx.userLastName || ''}`.trim();

                          // Determine Client email/info
                          const clientInfo = trx.parentName 
                            ? `Parent: ${trx.parentName}` 
                            : (trx.userEmail || trx.guestEmail || trx.parentEmail || '');

                          return (
                            <tr key={trx.id}>
                              <td style={{ fontWeight: 600 }}>#{trx.id}</td>
                              <td style={{ fontFamily: 'monospace', color: '#6B7280' }}>
                                {trx.transactionId || 'N/A'}
                              </td>
                              <td>
                                <div style={{ fontWeight: 600 }}>{learnerName}</div>
                                {clientInfo && (
                                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                                    {clientInfo}
                                  </div>
                                )}
                              </td>
                              <td>{trx.formationTitle}</td>
                              <td>
                                <span className={`status-badge ${trx.paymentType === 'full' ? 'active' : 'pending'}`} style={{ padding: '2px 8px', fontSize: '0.75rem' }}>
                                  {trx.paymentType === 'full' ? 'Complet' : 'Mensuel'}
                                </span>
                              </td>
                              <td>
                                <div style={{ fontWeight: 700 }}>
                                  {(trx.amountPaid || trx.amount)?.toLocaleString()} FCFA
                                </div>
                                {trx.paymentType === 'partial' && (
                                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                    sur {trx.totalAmount?.toLocaleString()} FCFA
                                  </div>
                                )}
                              </td>
                              <td>
                                <span style={{ background: '#F3F4F6', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600 }}>
                                  {trx.paymentMethod || 'Mobile Money'}
                                </span>
                              </td>
                              <td>{new Date(trx.createdAt).toLocaleDateString()}</td>
                              <td style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                {trx.paymentProof && (
                                  <button
                                    onClick={() => window.open(getImageUrl(trx.paymentProof), '_blank')}
                                    style={{ background: 'none', border: 'none', color: '#10B981', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                    title="Voir la preuve de paiement"
                                  >
                                    <Eye size={16} /> Preuve
                                  </button>
                                )}
                                <button
                                  onClick={() => window.open(`${API_URL}/api/invoices/${trx.id}?token=${token}`, '_blank')}
                                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                  title="Facture PDF"
                                >
                                  <Download size={16} /> Facture
                                </button>
                                <button
                                  onClick={() => handleDeletePayment(trx.id)}
                                  style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', padding: '4px' }}
                                  title="Supprimer la transaction"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination footer */}
                {transactionTotal > 10 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <button 
                      disabled={financePage === 1}
                      onClick={() => setFinancePage(p => Math.max(1, p - 1))}
                      className="tab-btn"
                      style={{ padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.8rem', opacity: financePage === 1 ? 0.5 : 1, cursor: financePage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                      Précédent
                    </button>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Page <strong>{financePage}</strong> sur <strong>{Math.ceil(transactionTotal / 10)}</strong> ({transactionTotal} transactions)
                    </span>
                    <button 
                      disabled={financePage * 10 >= transactionTotal}
                      onClick={() => setFinancePage(p => p + 1)}
                      className="tab-btn"
                      style={{ padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.8rem', opacity: financePage * 10 >= transactionTotal ? 0.5 : 1, cursor: financePage * 10 >= transactionTotal ? 'not-allowed' : 'pointer' }}
                    >
                      Suivant
                    </button>
                  </div>
                )}
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
