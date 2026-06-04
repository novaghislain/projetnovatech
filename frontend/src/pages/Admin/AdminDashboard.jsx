import React, { useState, useEffect } from 'react';
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
  MousePointerClick
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
import { useAuth } from '../../contexts/AuthContext';


const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [stats, setStats] = useState({ activeFormations: 0, totalUsers: 0, totalRevenue: 0 });
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('nv_token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Fetch stats
        const statsRes = await fetch('http://localhost:5001/api/admin/stats', { headers });
        if (statsRes.ok) setStats(await statsRes.json());
        
        // Fetch payments
        const payRes = await fetch('http://localhost:5001/api/admin/payments', { headers });
        if (payRes.ok) setPayments(await payRes.json());
      } catch (err) {
        console.error(err);
      }
    };
    fetchAdminData();
  }, []);

  const handleDeletePayment = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce paiement ?')) {
      try {
        const token = localStorage.getItem('nv_token');
        await fetch(`http://localhost:5001/api/admin/payments/${id}`, {
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
    // Génère les 10 derniers jours pour avoir un beau graphique même si c'est vide
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

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <img src="/4x.png" alt="Novatech Vision" />
        </div>
        <nav className="admin-sidebar-nav">
          <div className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} /> Dashboard
          </div>
          
          <div className={`admin-nav-item ${activeTab === 'formations' ? 'active' : ''}`} onClick={() => setActiveTab('formations')}>
            <BookOpen size={20} /> Formations
          </div>
          <div className={`admin-nav-item ${activeTab === 'inscriptions' ? 'active' : ''}`} onClick={() => setActiveTab('inscriptions')}>
            <Users size={20} /> Inscriptions
          </div>
          <div className={`admin-nav-item ${activeTab === 'paiements' ? 'active' : ''}`} onClick={() => setActiveTab('paiements')}>
            <CreditCard size={20} /> Paiements
          </div>
          <div className={`admin-nav-item ${activeTab === 'ads' ? 'active' : ''}`} onClick={() => setActiveTab('ads')}>
            <Megaphone size={20} /> Publicités
          </div>
          <div className={`admin-nav-item ${activeTab === 'contenu' ? 'active' : ''}`} onClick={() => setActiveTab('contenu')}>
            <Edit size={20} /> Contenu (Galerie & Témoignages)
          </div>
          <div className={`admin-nav-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
            <Edit size={20} /> Messages
          </div>
          <div className={`admin-nav-item ${activeTab === 'utilisateurs' ? 'active' : ''}`} onClick={() => setActiveTab('utilisateurs')}>
            <Users size={20} /> Utilisateurs
          </div>
          <div className={`admin-nav-item ${activeTab === 'formateurs' ? 'active' : ''}`} onClick={() => setActiveTab('formateurs')}>
            <Users size={20} /> Formateurs
          </div>
          <div className={`admin-nav-item ${activeTab === 'candidatures' ? 'active' : ''}`} onClick={() => setActiveTab('candidatures')}>
            <CheckCircle size={20} /> Candidatures
          </div>
          <div className={`admin-nav-item ${activeTab === 'parametres' ? 'active' : ''}`} onClick={() => window.location.href = '/parametres'}>
            <Edit size={20} /> Paramètres
          </div>

        </nav>
        <div style={{ padding: '1.5rem 1rem' }}>
          <div className="admin-nav-item" style={{ color: '#ff4d4f' }} onClick={() => window.location.href = '/'}>
            <LogOut size={20} /> Retour au site
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        {/* HEADER */}
        <header className="admin-header">
          <div className="admin-header-title">
            {activeTab === 'dashboard' && 'Tableau de Bord'}
            {activeTab === 'formations' && 'Gestion des Formations'}
            {activeTab === 'categories' && 'Gestion des Catégories'}
            {activeTab === 'sessions' && 'Gestion des Sessions'}
            {activeTab === 'ads' && 'Campagnes Publicitaires'}
            {activeTab === 'finances' && 'Rapports Financiers'}
            {activeTab === 'inscriptions' && 'Gestion des Inscriptions'}
            {activeTab === 'contenu' && 'Gestion du Contenu'}
            {activeTab === 'messages' && 'Messages de Contact'}
            {activeTab === 'candidatures' && 'Candidatures Formateurs'}
          </div>
          <div className="admin-header-user">
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#333' }}>{user?.firstName || 'Admin'} {user?.lastName || ''}</span>
            <div className="admin-avatar" style={{ overflow: 'hidden' }}>
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'AD'
              )}
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="admin-content-scroll">
          
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="fade-in">
              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-icon blue"><BookOpen size={24} /></div>
                  <div className="kpi-info">
                    <div className="kpi-value">{stats.activeFormations}</div>
                    <div className="kpi-label">Formations Actives</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon green"><Users size={24} /></div>
                  <div className="kpi-info">
                    <div className="kpi-value">{stats.totalUsers}</div>
                    <div className="kpi-label">Utilisateurs Inscrits</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon purple"><TrendingUp size={24} /></div>
                  <div className="kpi-info">
                    <div className="kpi-value">{(stats.totalRevenue || 0).toLocaleString()}</div>
                    <div className="kpi-label">Revenus (FCFA)</div>
                  </div>
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-header">
                  <h3 className="admin-panel-title">Évolution des Inscriptions & Revenus (30 jours)</h3>
                </div>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <LineChart data={computedRevenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dx={-10} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dx={10} />
                      <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                      <Line yAxisId="left" type="monotone" dataKey="revenus" stroke="var(--color-accent)" strokeWidth={3} dot={{r: 4, fill: 'var(--color-accent)'}} activeDot={{r: 6}} name="Revenus (FCFA)" />
                      <Line yAxisId="right" type="monotone" dataKey="inscriptions" stroke="#007bff" strokeWidth={3} dot={{r: 4, fill: '#007bff'}} activeDot={{r: 6}} name="Inscriptions" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MODULE 2.2 COMPONENTS */}
          {activeTab === 'categories' && <AdminCategories />}
          {activeTab === 'formations' && <AdminFormations />}
          {activeTab === 'sessions' && <AdminSessions />}

          {/* TAB: PUBLICITES */}
          {activeTab === 'ads' && <AdminAds />}

          {/* TAB: UTILISATEURS */}
          {activeTab === 'utilisateurs' && <AdminUsers />}

          {/* TAB: FORMATEURS */}
          {activeTab === 'formateurs' && <AdminFormateurs />}

          {/* TAB: CANDIDATURES */}
          {activeTab === 'candidatures' && <AdminCandidatures />}

          {/* TAB: CONTENU */}
          {activeTab === 'contenu' && <AdminContent />}

          {/* TAB: MESSAGES */}
          {activeTab === 'messages' && <AdminMessages />}

          {/* TAB: INSCRIPTIONS */}
          {activeTab === 'inscriptions' && <AdminInscriptions />}

          {/* TAB: FINANCES */}
          {activeTab === 'paiements' && (
            <div className="fade-in">
              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-icon green"><CheckCircle size={24} /></div>
                  <div className="kpi-info">
                    <div className="kpi-value">{payments.length}</div>
                    <div className="kpi-label">Paiements Validés</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon"><CreditCard size={24} /></div>
                  <div className="kpi-info">
                    <div className="kpi-value">{(stats.totalRevenue || 0).toLocaleString()}</div>
                    <div className="kpi-label">Total Encaissé (FCFA)</div>
                  </div>
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-header">
                  <h3 className="admin-panel-title">Historique des Transactions</h3>
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
                          <td style={{ fontFamily: 'monospace', color: '#666' }}>TRX-{trx.transactionId}</td>
                          <td style={{ fontWeight: 600 }}>{trx.firstName} {trx.lastName}</td>
                          <td>{trx.courseTitle}</td>
                          <td>{trx.amount?.toLocaleString()} FCFA</td>
                          <td>
                            <span style={{ background: '#f0f0f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                              {trx.paymentMethod || 'Mobile Money'}
                            </span>
                          </td>
                          <td>{new Date(trx.createdAt).toLocaleDateString()}</td>
                          <td>
                            {trx.status === 'active' ? (
                              <span style={{ color: '#28a745', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, fontSize: '0.85rem' }}>
                                <CheckCircle size={14} /> Succès
                              </span>
                            ) : (
                              <span style={{ color: '#d39e00', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, fontSize: '0.85rem' }}>
                                <XCircle size={14} /> En attente
                              </span>
                            )}
                          </td>
                          <td>
                            <button 
                              onClick={() => handleDeletePayment(trx.transactionId)}
                              style={{ padding: '0.3rem 0.5rem', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '4px', cursor: 'pointer' }}
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {payments.length === 0 && (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Aucune transaction trouvée.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
