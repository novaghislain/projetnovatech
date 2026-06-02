import React, { useState } from 'react';
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

// --- MOCK DATA ---
const revenueData = [
  { name: '01 Juin', revenus: 400000, inscriptions: 12 },
  { name: '05 Juin', revenus: 300000, inscriptions: 8 },
  { name: '10 Juin', revenus: 550000, inscriptions: 18 },
  { name: '15 Juin', revenus: 450000, inscriptions: 15 },
  { name: '20 Juin', revenus: 700000, inscriptions: 25 },
  { name: '25 Juin', revenus: 600000, inscriptions: 20 },
];

const mockAds = [
  { id: 1, advertiser: 'MTN Bénin', placement: 'Accueil (Haut)', views: 15420, clicks: 1240, status: 'active' },
  { id: 2, advertiser: 'Moov Africa', placement: 'Sidebar Formations', views: 8300, clicks: 415, status: 'inactive' },
];

const mockTransactions = [
  { id: 'TRX-1092', user: 'Jean Dupont', amount: '25 000 FCFA', method: 'Kkiapay', date: '25/06/2026', status: 'success' },
  { id: 'TRX-1093', user: 'Marie Claire', amount: '30 000 FCFA', method: 'FedaPay', date: '26/06/2026', status: 'success' },
  { id: 'TRX-1094', user: 'Paul Mensah', amount: '20 000 FCFA', method: 'Mobile Money', date: '26/06/2026', status: 'pending' },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <img src="/4x.png" alt="Novatech Vision" />
        </div>
        <nav className="admin-sidebar-nav">
          <div className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} /> Vue d'ensemble
          </div>
          
          <div style={{ padding: '1rem 1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#888', letterSpacing: '1px' }}>
            GESTION DES COURS
          </div>
          <div className={`admin-nav-item ${activeTab === 'formations' ? 'active' : ''}`} onClick={() => setActiveTab('formations')}>
            <BookOpen size={20} /> Formations
          </div>
          <div className={`admin-nav-item ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
            <BookOpen size={20} /> Catégories
          </div>
          <div className={`admin-nav-item ${activeTab === 'sessions' ? 'active' : ''}`} onClick={() => setActiveTab('sessions')}>
            <BookOpen size={20} /> Sessions
          </div>

          <div style={{ padding: '1rem 1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#888', letterSpacing: '1px' }}>
            MONÉTISATION
          </div>
          <div className={`admin-nav-item ${activeTab === 'ads' ? 'active' : ''}`} onClick={() => setActiveTab('ads')}>
            <Megaphone size={20} /> Publicités
          </div>
          <div className={`admin-nav-item ${activeTab === 'finances' ? 'active' : ''}`} onClick={() => setActiveTab('finances')}>
            <CreditCard size={20} /> Finances
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
          </div>
          <div className="admin-header-user">
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#333' }}>Admin Novatech</span>
            <div className="admin-avatar">AD</div>
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
                    <div className="kpi-value">15</div>
                    <div className="kpi-label">Formations Actives</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon green"><Users size={24} /></div>
                  <div className="kpi-info">
                    <div className="kpi-value">524</div>
                    <div className="kpi-label">Apprenants Inscrits</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon purple"><TrendingUp size={24} /></div>
                  <div className="kpi-info">
                    <div className="kpi-value">3.2M</div>
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
                    <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
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

          {/* TAB: FINANCES */}
          {activeTab === 'finances' && (
            <div className="fade-in">
              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-icon green"><CheckCircle size={24} /></div>
                  <div className="kpi-info">
                    <div className="kpi-value">28</div>
                    <div className="kpi-label">Paiements Validés (Juin)</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon"><CreditCard size={24} /></div>
                  <div className="kpi-info">
                    <div className="kpi-value">3.2M</div>
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
                        <th>Montant</th>
                        <th>Méthode</th>
                        <th>Date</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockTransactions.map(trx => (
                        <tr key={trx.id}>
                          <td style={{ fontFamily: 'monospace', color: '#666' }}>{trx.id}</td>
                          <td style={{ fontWeight: 600 }}>{trx.user}</td>
                          <td>{trx.amount}</td>
                          <td>
                            <span style={{ background: '#f0f0f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                              {trx.method}
                            </span>
                          </td>
                          <td>{trx.date}</td>
                          <td>
                            {trx.status === 'success' ? (
                              <span style={{ color: '#28a745', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, fontSize: '0.85rem' }}>
                                <CheckCircle size={14} /> Succès
                              </span>
                            ) : (
                              <span style={{ color: '#d39e00', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, fontSize: '0.85rem' }}>
                                <XCircle size={14} /> En attente
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
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
