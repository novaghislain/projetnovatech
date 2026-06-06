import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Megaphone, MousePointerClick, Eye, LogOut, BarChart2, PlusCircle, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import './Home.css';
import { API_URL } from '../config';

const AnnonceurDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('nv_token');
        const res = await fetch(`${API_URL}/api/annonceur/dashboard`, {
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

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>Chargement des données...</div>;

  const stats = data?.stats || { views: 0, clicks: 0, ctr: '0%' };
  const campaigns = data?.campaigns || [];

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex' }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: '280px', backgroundColor: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>Espace<br/><span style={{ color: '#ef4444' }}>Annonceur</span></h2>
        </div>
        
        <nav style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <button 
            onClick={() => setActiveTab('overview')}
            style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '12px', background: activeTab === 'overview' ? '#fef2f2' : 'transparent', color: activeTab === 'overview' ? '#ef4444' : '#64748b', fontWeight: activeTab === 'overview' ? 700 : 500, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s' }}
          >
            <BarChart2 size={20} /> Vue d'ensemble
          </button>
          <button 
            onClick={() => setActiveTab('campaigns')}
            style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '12px', background: activeTab === 'campaigns' ? '#fef2f2' : 'transparent', color: activeTab === 'campaigns' ? '#ef4444' : '#64748b', fontWeight: activeTab === 'campaigns' ? 700 : 500, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s' }}
          >
            <Megaphone size={20} /> Mes Campagnes
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '12px', background: activeTab === 'billing' ? '#fef2f2' : 'transparent', color: activeTab === 'billing' ? '#ef4444' : '#64748b', fontWeight: activeTab === 'billing' ? 700 : 500, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s' }}
          >
            <CreditCard size={20} /> Facturation
          </button>
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'linear-gradient(135deg, #7f1d1d, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{user?.firstName}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Annonceur Partenaire</div>
            </div>
          </div>
          <button onClick={logout} style={{ width: '100%', padding: '0.8rem', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
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
            <p style={{ color: '#64748b', margin: 0, fontSize: '1.1rem' }}>Suivez les performances de vos publicités en temps réel.</p>
          </div>
          <button style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
            <PlusCircle size={18} /> Créer une campagne
          </button>
        </header>

        {activeTab === 'overview' && (
          <div className="fade-in">
            {/* STATS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1.2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div style={{ background: '#eff6ff', padding: '1.2rem', borderRadius: '16px', color: '#3b82f6' }}><Eye size={28} /></div>
                <div><div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{stats.views.toLocaleString()}</div><div style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.2rem' }}>Vues totales</div></div>
              </div>
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1.2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div style={{ background: '#f0fdf4', padding: '1.2rem', borderRadius: '16px', color: '#22c55e' }}><MousePointerClick size={28} /></div>
                <div><div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{stats.clicks.toLocaleString()}</div><div style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.2rem' }}>Clics enregistrés</div></div>
              </div>
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1.2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div style={{ background: '#fef2f2', padding: '1.2rem', borderRadius: '16px', color: '#ef4444' }}><TrendingUp size={28} /></div>
                <div><div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{stats.ctr}</div><div style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.2rem' }}>Taux de clic moyen (CTR)</div></div>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a' }}>Mes Campagnes Récentes</h3>
                <button style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}>Gérer tout</button>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#94a3b8', fontSize: '0.9rem' }}>
                      <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Nom de la campagne</th>
                      <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Statut</th>
                      <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Vues</th>
                      <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Clics</th>
                      <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>CTR</th>
                      <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Dépense</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map(ad => (
                      <tr key={ad.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                        <td style={{ padding: '1rem 0.5rem', fontWeight: 600, color: '#0f172a' }}>{ad.title}</td>
                        <td style={{ padding: '1rem 0.5rem' }}>
                          <span style={{ 
                            background: ad.status === 'active' ? '#dcfce7' : '#f1f5f9', 
                            color: ad.status === 'active' ? '#15803d' : '#64748b', 
                            padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600 
                          }}>
                            {ad.status === 'active' ? 'En cours' : 'Terminé'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 0.5rem', color: '#64748b' }}>{ad.views.toLocaleString()}</td>
                        <td style={{ padding: '1rem 0.5rem', color: '#64748b' }}>{ad.clicks.toLocaleString()}</td>
                        <td style={{ padding: '1rem 0.5rem', color: '#3b82f6', fontWeight: 600 }}>{ad.ctr}</td>
                        <td style={{ padding: '1rem 0.5rem', color: '#0f172a', fontWeight: 600 }}>{ad.spent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="fade-in" style={{ background: '#fff', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>Toutes mes Campagnes</h3>
              <button style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <PlusCircle size={18} /> Nouvelle Campagne
              </button>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#94a3b8', fontSize: '0.9rem' }}>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Nom de la campagne</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Statut</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Vues</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Clics</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>CTR</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Dépense</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map(ad => (
                    <tr key={ad.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                      <td style={{ padding: '1.2rem 0.5rem', fontWeight: 600, color: '#0f172a' }}>{ad.title}</td>
                      <td style={{ padding: '1.2rem 0.5rem' }}>
                        <span style={{ 
                          background: ad.status === 'active' ? '#dcfce7' : '#f1f5f9', 
                          color: ad.status === 'active' ? '#15803d' : '#64748b', 
                          padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600 
                        }}>
                          {ad.status === 'active' ? 'En cours' : 'Terminé'}
                        </span>
                      </td>
                      <td style={{ padding: '1.2rem 0.5rem', color: '#64748b' }}>{ad.views.toLocaleString()}</td>
                      <td style={{ padding: '1.2rem 0.5rem', color: '#64748b' }}>{ad.clicks.toLocaleString()}</td>
                      <td style={{ padding: '1.2rem 0.5rem', color: '#3b82f6', fontWeight: 600 }}>{ad.ctr}</td>
                      <td style={{ padding: '1.2rem 0.5rem', color: '#0f172a', fontWeight: 600 }}>{ad.spent}</td>
                    </tr>
                  ))}
                  {campaigns.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Aucune campagne pour le moment.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="fade-in" style={{ background: '#fff', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', color: '#0f172a' }}>Facturation & Paiements</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Solde actuel</div>
                  <div style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 800 }}>0 FCFA</div>
                </div>
                <button style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>Recharger</button>
              </div>
              
              <div>
                <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.1rem' }}>Historique des dépenses</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {campaigns.map(ad => (
                    <div key={ad.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', background: '#fef2f2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Megaphone size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{ad.title}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Campagne publicitaire</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>- {ad.spent}</div>
                    </div>
                  ))}
                  {campaigns.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Aucun historique de facturation.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AnnonceurDashboard;
