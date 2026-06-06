import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Megaphone, MousePointerClick, Eye, LogOut, BarChart2, PlusCircle, 
  TrendingUp, Calendar, CreditCard, Trash2, Pencil, User, LayoutDashboard, 
  FileText, Download, CheckCircle, Clock, AlertCircle, Menu, X, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './Admin/AdminDashboard.css';

const AD_RATES = {
  'header': 2000,
  'sidebar': 1000,
  'inline': 1500,
  'popup': 2500,
  'footer': 500
};

const AnnonceurDashboard = () => {
  const { user, logout, updateUserDetails } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data states
  const [stats, setStats] = useState({ activeAds: 0, expiredAds: 0, totalViews: 0, totalClicks: 0, totalSpent: 0, nextExpiring: null });
  const [ads, setAds] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [form, setForm] = useState({ 
    title: '', placement: 'header', imageUrl: '', targetUrl: '', 
    startDate: '', endDate: '' 
  });
  const [submitting, setSubmitting] = useState(false);
  const [computedBudget, setComputedBudget] = useState(0);

  const token = localStorage.getItem('nv_token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Profile states
  const fileInputRef = useRef(null);
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    companyName: user?.companyName || ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    setProfileForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      companyName: user?.companyName || ''
    });
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (res.ok) {
        updateUserDetails({ firstName: data.firstName, lastName: data.lastName, companyName: data.companyName, phone: data.phone });
        alert('Profil mis à jour avec succès');
      } else {
        alert(data.error || 'Erreur');
      }
    } catch (err) {
      alert('Erreur serveur');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return alert('Les nouveaux mots de passe ne correspondent pas.');
    }
    try {
      const res = await fetch(`${API_URL}/api/user/password`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Mot de passe mis à jour');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert(data.error || 'Erreur');
      }
    } catch (err) {
      alert('Erreur serveur');
    }
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
        headers
      });
      if (res.ok) {
        updateUserDetails({ avatar: null });
      }
    } catch (err) {
      alert('Erreur serveur');
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [statsRes, adsRes, payRes] = await Promise.all([
        fetch(`${API_URL}/api/annonceur/dashboard`, { headers }),
        fetch(`${API_URL}/api/annonceur/ads`, { headers }),
        fetch(`${API_URL}/api/annonceur/payments`, { headers })
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (adsRes.ok) setAds(await adsRes.json());
      if (payRes.ok) setPayments(await payRes.json());
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calculate budget when form changes
  useEffect(() => {
    if (!form.startDate || !form.endDate) {
      setComputedBudget(AD_RATES[form.placement] * 7); // Default 7 days if no dates
      return;
    }
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (days > 0) {
      setComputedBudget(days * AD_RATES[form.placement]);
    } else {
      setComputedBudget(0);
    }
  }, [form.placement, form.startDate, form.endDate]);

  const handleSubmitAd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, budget: computedBudget };
      const url = editingAd ? `${API_URL}/api/annonceur/ads/${editingAd.id}` : `${API_URL}/api/annonceur/ads`;
      const method = editingAd ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      if (res.ok) {
        setShowCreateModal(false);
        setEditingAd(null);
        setForm({ title: '', placement: 'header', imageUrl: '', targetUrl: '', startDate: '', endDate: '' });
        fetchDashboardData();
        alert('Campagne enregistrée avec succès !');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulatePayment = async (adId) => {
    try {
      const res = await fetch(`${API_URL}/api/annonceur/ads/${adId}/pay`, { method: 'POST', headers });
      if (res.ok) {
        alert('Paiement simulé avec succès ! La publicité est maintenant active.');
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAd = async (adId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette publicité ?')) return;
    try {
      const res = await fetch(`${API_URL}/api/annonceur/ads/${adId}`, { method: 'DELETE', headers });
      if (res.ok) fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRenewAd = async (ad) => {
    setEditingAd(ad);
    setForm({
      title: ad.title,
      placement: ad.placement,
      imageUrl: ad.imageUrl,
      targetUrl: ad.targetUrl,
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    });
    setShowCreateModal(true);
  };

  const openEditModal = (ad) => {
    setEditingAd(ad);
    setForm({
      title: ad.title,
      placement: ad.placement,
      imageUrl: ad.imageUrl,
      targetUrl: ad.targetUrl,
      startDate: ad.startDate ? ad.startDate.split('T')[0] : '',
      endDate: ad.endDate ? ad.endDate.split('T')[0] : ''
    });
    setShowCreateModal(true);
  };

  const downloadInvoice = (payment) => {
    const input = document.getElementById(`invoice-${payment.id}`);
    if (!input) return;
    
    input.style.display = 'block';
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Facture_Novatech_${payment.id}.pdf`);
      input.style.display = 'none';
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Active': { bg: '#dcfce7', color: '#15803d', icon: <CheckCircle size={14} /> },
      'En attente': { bg: '#fef9c3', color: '#a16207', icon: <Clock size={14} /> },
      'Expirée': { bg: '#fee2e2', color: '#b91c1c', icon: <AlertCircle size={14} /> }
    };
    const s = styles[status] || { bg: '#f1f5f9', color: '#64748b', icon: <FileText size={14} /> };
    return (
      <span style={{ background: s.bg, color: s.color, padding: '0.4rem 0.8rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        {s.icon} {status}
      </span>
    );
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#64748b' }}>Chargement de l'espace annonceur...</div>;

  return (
    <div className="admin-layout">
      {/* MOBILE HEADER */}
      <div className="admin-mobile-header">
        <img src="/4x.png" alt="Novatech Vision" style={{ height: '30px', cursor: 'pointer' }} onClick={() => window.location.href = '/'} />
        <button className="admin-mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      {/* OVERLAY */}
      {mobileMenuOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`} style={{ background: '#0f172a' }}>
        <div className="admin-sidebar-header">
          <div className="admin-logo" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <img src="/4x.png" alt="Novatech Vision Logo" style={{ height: '35px', cursor: 'pointer' }} onClick={() => window.location.href = '/'} />
          </div>
          <button className="admin-mobile-close-btn" onClick={() => setMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="admin-nav" style={{ flex: 1, padding: '3rem 1rem 1.5rem 1rem' }}>
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Tableau de bord' },
            { id: 'campaigns', icon: Megaphone, label: 'Mes publicités' },
            { id: 'billing', icon: CreditCard, label: 'Paiements & Factures' },
            { id: 'stats', icon: BarChart2, label: 'Statistiques avancées' },
            { id: 'account', icon: User, label: 'Mon compte' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
              style={{
                padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '12px',
                background: activeTab === item.id ? 'rgba(15, 52, 96, 0.1)' : 'transparent',
                color: activeTab === item.id ? '#0F3460' : '#94a3b8',
                fontWeight: activeTab === item.id ? 600 : 500,
                border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', marginBottom: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'linear-gradient(135deg, #0a2240, #0F3460)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
              <User size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>{user?.firstName || 'Annonceur'}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Espace Annonceur</div>
            </div>
          </div>
          <button onClick={logout} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s hover:bg-white/10' }}>
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main" style={{ background: '#f8fafc' }}>
        <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: '#0f172a', margin: '0 0 0.2rem 0', fontWeight: 800 }}>
              {activeTab === 'overview' && 'Tableau de bord Annonceur'}
              {activeTab === 'campaigns' && 'Mes Campagnes Publicitaires'}
              {activeTab === 'billing' && 'Paiements & Factures'}
              {activeTab === 'stats' && 'Statistiques des Performances'}
              {activeTab === 'account' && 'Mon Profil Annonceur'}
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Gérez vos diffusions et analysez votre retour sur investissement.</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} style={{ background: 'linear-gradient(135deg, #0F3460, #1A1A2E)', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(15, 52, 96, 0.3)', transition: 'transform 0.2s' }}>
            <PlusCircle size={18} /> Créer une publicité
          </button>
        </header>

        <div className="admin-content-scroll">
        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <div className="fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {[
                { label: 'Publicités Actives', value: stats.activeAds, icon: Megaphone, color: '#3b82f6', bg: '#eff6ff' },
                { label: 'Publicités Expirées', value: stats.expiredAds, icon: AlertCircle, color: '#0F3460', bg: '#eff6ff' },
                { label: 'Vues Totales', value: stats.totalViews.toLocaleString(), icon: Eye, color: '#8b5cf6', bg: '#f5f3ff' },
                { label: 'Clics Totaux', value: stats.totalClicks.toLocaleString(), icon: MousePointerClick, color: '#10b981', bg: '#ecfdf5' },
                { label: 'Dépenses Totales', value: `${stats.totalSpent.toLocaleString()} FCFA`, icon: CreditCard, color: '#f59e0b', bg: '#fffbeb' }
              ].map((stat, i) => (
                <div key={i} style={{ background: '#fff', padding: '1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1.2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                  <div style={{ background: stat.bg, padding: '1.2rem', borderRadius: '16px', color: stat.color }}><stat.icon size={28} /></div>
                  <div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{stat.value}</div>
                    <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.3rem', fontWeight: 500 }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {stats.nextExpiring && (
              <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '1.5rem 2rem', borderRadius: '20px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', boxShadow: '0 10px 25px rgba(15, 23, 42, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px' }}><Clock size={24} color="#fcd34d" /></div>
                  <div>
                    <h3 style={{ margin: '0 0 0.3rem 0', fontSize: '1.2rem' }}>Prochaine expiration</h3>
                    <p style={{ margin: 0, color: '#94a3b8' }}>La campagne "{stats.nextExpiring.title}" expire le {new Date(stats.nextExpiring.endDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <button onClick={() => { setActiveTab('campaigns'); handleRenewAd(stats.nextExpiring); }} style={{ background: '#fcd34d', color: '#92400e', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                  Renouveler maintenant
                </button>
              </div>
            )}
            
            <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a' }}>Dernières campagnes</h3>
                <button onClick={() => setActiveTab('campaigns')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  Voir tout <ArrowRight size={16} />
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '1rem', fontWeight: 600 }}>Campagne</th>
                      <th style={{ padding: '1rem', fontWeight: 600 }}>Statut</th>
                      <th style={{ padding: '1rem', fontWeight: 600 }}>Emplacement</th>
                      <th style={{ padding: '1rem', fontWeight: 600 }}>Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ads.slice(0, 5).map(ad => (
                      <tr key={ad.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem', fontWeight: 600, color: '#0f172a' }}>{ad.title}</td>
                        <td style={{ padding: '1rem' }}>{getStatusBadge(ad.status)}</td>
                        <td style={{ padding: '1rem', color: '#64748b' }}>
                          <span style={{ background: '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem' }}>{ad.placement}</span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                            <span style={{ color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Eye size={14} /> {ad.views || 0}</span>
                            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><MousePointerClick size={14} /> {ad.clicks || 0}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {ads.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Aucune campagne pour l'instant.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- CAMPAIGNS TAB --- */}
        {activeTab === 'campaigns' && (
          <div className="fade-in" style={{ background: '#fff', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Titre & Image</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Statut</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Période</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Emplacement</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Budget</th>
                    <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ads.map(ad => (
                    <tr key={ad.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img src={ad.imageUrl} alt="" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} onError={(e)=>{e.target.src='https://placehold.co/60x40?text=Pub'}} />
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{ad.title}</div>
                            <a href={ad.targetUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#3b82f6', textDecoration: 'none' }}>Visiter le lien</a>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>{getStatusBadge(ad.status)}</td>
                      <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                        {ad.startDate ? new Date(ad.startDate).toLocaleDateString('fr-FR') : '-'} <br/>
                        <span style={{ color: '#94a3b8' }}>au {ad.endDate ? new Date(ad.endDate).toLocaleDateString('fr-FR') : '-'}</span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', color: '#475569' }}>
                          {ad.placement}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 700, color: '#0f172a' }}>{ad.budget?.toLocaleString()} FCFA</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          {ad.paymentStatus === 'En attente' && (
                            <button onClick={() => handleSimulatePayment(ad.id)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Payer</button>
                          )}
                          {ad.status === 'Expirée' && (
                            <button onClick={() => handleRenewAd(ad)} style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Renouveler</button>
                          )}
                          <button onClick={() => openEditModal(ad)} style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }}><Pencil size={16} /></button>
                          <button onClick={() => handleDeleteAd(ad.id)} style={{ background: '#eff6ff', color: '#0F3460', border: 'none', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- BILLING TAB --- */}
        {activeTab === 'billing' && (
          <div className="fade-in">
            <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#0f172a' }}>Historique des Transactions</h3>
              {payments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Aucun paiement enregistré pour le moment.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {payments.map(payment => (
                    <div key={payment.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                        <div style={{ background: '#dcfce7', color: '#15803d', padding: '1rem', borderRadius: '50%' }}>
                          <CheckCircle size={24} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.1rem' }}>{payment.title}</div>
                          <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>Payé le {new Date(payment.date).toLocaleDateString('fr-FR')} • Réf: #INV-{payment.id.toString().padStart(4, '0')}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{payment.budget?.toLocaleString()} FCFA</div>
                        <button onClick={() => downloadInvoice(payment)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', border: '1px solid #cbd5e1', padding: '0.6rem 1rem', borderRadius: '10px', color: '#475569', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                          <Download size={18} /> Télécharger PDF
                        </button>
                      </div>

                      {/* Hidden Invoice HTML for PDF generation */}
                      <div id={`invoice-${payment.id}`} style={{ display: 'none', padding: '40px', width: '800px', background: 'white', color: 'black' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0F3460', paddingBottom: '20px', marginBottom: '30px' }}>
                          <div>
                            <h1 style={{ color: '#0F3460', margin: 0 }}>NovaTech</h1>
                            <p style={{ margin: '5px 0' }}>Plateforme d'apprentissage en ligne</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <h2 style={{ margin: 0, color: '#0f172a' }}>FACTURE</h2>
                            <p style={{ margin: '5px 0', color: '#64748b' }}>N° #INV-{payment.id.toString().padStart(6, '0')}</p>
                            <p style={{ margin: '5px 0', color: '#64748b' }}>Date: {new Date(payment.date).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                        <div style={{ marginBottom: '30px' }}>
                          <h3 style={{ color: '#0f172a' }}>Facturé à :</h3>
                          <p style={{ margin: '5px 0' }}><strong>{user?.firstName} {user?.lastName}</strong></p>
                          <p style={{ margin: '5px 0' }}>{user?.email}</p>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                          <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                              <th style={{ padding: '12px', textAlign: 'left' }}>Description de la campagne</th>
                              <th style={{ padding: '12px', textAlign: 'right' }}>Statut</th>
                              <th style={{ padding: '12px', textAlign: 'right' }}>Montant (FCFA)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '15px 12px' }}>Diffusion publicitaire : {payment.title}</td>
                              <td style={{ padding: '15px 12px', textAlign: 'right' }}>{payment.paymentStatus}</td>
                              <td style={{ padding: '15px 12px', textAlign: 'right', fontWeight: 'bold' }}>{payment.budget?.toLocaleString()}</td>
                            </tr>
                          </tbody>
                        </table>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                          <div style={{ width: '300px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                              <span>Sous-total:</span>
                              <span>{payment.budget?.toLocaleString()} FCFA</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', fontWeight: 'bold', fontSize: '1.2em', color: '#0F3460' }}>
                              <span>Total payé:</span>
                              <span>{payment.budget?.toLocaleString()} FCFA</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ marginTop: '50px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9em' }}>
                          <p>Merci pour votre confiance. Pour toute question, contactez support@novatech.com.</p>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- STATS TAB --- */}
        {activeTab === 'stats' && (
          <div className="fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: '#fff', padding: '2rem', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: '#8b5cf6' }}>{stats.totalViews.toLocaleString()}</div>
                <div style={{ color: '#64748b', fontWeight: 600, marginTop: '0.5rem' }}>Total Impressions</div>
              </div>
              <div style={{ background: '#fff', padding: '2rem', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: '#10b981' }}>{stats.totalClicks.toLocaleString()}</div>
                <div style={{ color: '#64748b', fontWeight: 600, marginTop: '0.5rem' }}>Total Clics</div>
              </div>
              <div style={{ background: '#fff', padding: '2rem', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: '#0F3460' }}>
                  {stats.totalViews > 0 ? ((stats.totalClicks / stats.totalViews) * 100).toFixed(2) : 0}%
                </div>
                <div style={{ color: '#64748b', fontWeight: 600, marginTop: '0.5rem' }}>Taux de Clic Moyen (CTR)</div>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', border: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#0f172a' }}>Performances par Campagne (CTR)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {ads.filter(a => a.views > 0).map(ad => {
                  const ctr = ((ad.clicks || 0) / (ad.views || 1)) * 100;
                  return (
                    <div key={ad.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                        <span>{ad.title} <span style={{ color: '#94a3b8', fontWeight: 400 }}>({ad.placement})</span></span>
                        <span style={{ color: '#3b82f6' }}>{ctr.toFixed(2)}%</span>
                      </div>
                      <div style={{ width: '100%', background: '#f1f5f9', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(ctr * 10, 100)}%`, background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', height: '100%', borderRadius: '5px' }}></div>
                      </div>
                    </div>
                  );
                })}
                {ads.filter(a => a.views > 0).length === 0 && <div style={{ color: '#94a3b8', textAlign: 'center' }}>Pas encore de données de performance.</div>}
              </div>
            </div>
          </div>
        )}

        {/* --- ACCOUNT TAB --- */}
        {activeTab === 'account' && (
          <div className="fade-in" style={{ background: '#fff', borderRadius: '20px', padding: '3rem', border: '1px solid #f1f5f9', width: '100%' }}>
            
            {/* Profil Image / En-tête */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #0a2240, #0F3460)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '2rem', boxShadow: '0 10px 25px rgba(15, 52, 96,0.3)', overflow: 'hidden' }}>
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={50} />
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h2 style={{ margin: '0', fontSize: '2rem', color: '#0f172a' }}>Mon Profil Annonceur</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input type="file" ref={fileInputRef} hidden onChange={handleAvatarChange} accept="image/*" />
                  <button onClick={() => fileInputRef.current.click()} style={{ background: '#f1f5f9', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#0F3460' }}>Modifier la photo</button>
                  {user?.avatar && (
                    <button onClick={handleAvatarDelete} style={{ background: '#fee2e2', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#b91c1c' }}>Supprimer</button>
                  )}
                </div>
              </div>
            </div>

            {/* Infos Profil */}
            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Informations personnelles</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#0f172a' }}>Prénom</label>
                  <input type="text" value={profileForm.firstName} onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})} required style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#0f172a' }}>Nom</label>
                  <input type="text" value={profileForm.lastName} onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})} required style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#0f172a' }}>Email Professionnel</label>
                  <input type="email" value={profileForm.email} disabled style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#0f172a' }}>Téléphone</label>
                  <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#0f172a' }}>Entreprise / Marque (Facturation)</label>
                <input type="text" value={profileForm.companyName} onChange={(e) => setProfileForm({...profileForm, companyName: e.target.value})} placeholder="Ex: NovaTech Academy" style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }} />
              </div>
              <button type="submit" style={{ background: '#0F3460', color: '#fff', border: 'none', padding: '1rem', borderRadius: '12px', fontWeight: 700, marginTop: '1rem', cursor: 'pointer' }}>Mettre à jour mes informations</button>
            </form>

            {/* Mot de passe */}
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '3rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Modifier le mot de passe</h3>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#0f172a' }}>Mot de passe actuel</label>
                <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})} required style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#0f172a' }}>Nouveau mot de passe</label>
                  <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} required minLength="6" style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#0f172a' }}>Confirmer le nouveau mot de passe</label>
                  <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} required minLength="6" style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }} />
                </div>
              </div>
              <button type="submit" style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '1rem', borderRadius: '12px', fontWeight: 700, marginTop: '1rem', cursor: 'pointer', alignSelf: 'flex-start', paddingLeft: '2rem', paddingRight: '2rem' }}>Changer mon mot de passe</button>
            </form>

          </div>
        )}

        </div>
      </main>

      {/* CREATE / EDIT MODAL */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="fade-in" style={{ background: '#fff', width: '100%', maxWidth: '800px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {editingAd ? <Pencil size={24} color="#0F3460" /> : <Megaphone size={24} color="#0F3460" />}
                {editingAd ? 'Modifier la campagne' : 'Créer une nouvelle campagne publicitaire'}
              </h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.5rem' }}><X size={24} /></button>
            </div>
            
            <div style={{ padding: '2rem', overflowY: 'auto' }}>
              <form onSubmit={handleSubmitAd} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                  {/* Left Column: Content */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#0f172a' }}>Titre de la publicité <span style={{color: '#0F3460'}}>*</span></label>
                      <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="Ex: Promotion de rentrée" style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#0f172a' }}>Lien de redirection (Target URL) <span style={{color: '#0F3460'}}>*</span></label>
                      <input type="url" value={form.targetUrl} onChange={e => setForm({...form, targetUrl: e.target.value})} required placeholder="https://monsite.com/promo" style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#0f172a' }}>Image de la bannière (URL) <span style={{color: '#0F3460'}}>*</span></label>
                      <input type="url" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} required placeholder="https://monsite.com/image.jpg" style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }} />
                      {form.imageUrl && (
                        <div style={{ marginTop: '1rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', height: '120px' }}>
                          <img src={form.imageUrl} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e)=>{e.target.src='https://placehold.co/800x200?text=Image+Invalide'}} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Settings & Budget */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#0f172a' }}>Emplacement cible</label>
                      <select value={form.placement} onChange={e => setForm({...form, placement: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff' }}>
                        <option value="header">Bannière Haut ({AD_RATES['header']} FCFA/j)</option>
                        <option value="sidebar">Sidebar ({AD_RATES['sidebar']} FCFA/j)</option>
                        <option value="inline">Entre Formations ({AD_RATES['inline']} FCFA/j)</option>
                        <option value="popup">Popup ({AD_RATES['popup']} FCFA/j)</option>
                        <option value="footer">Footer ({AD_RATES['footer']} FCFA/j)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#0f172a' }}>Date de début <span style={{color: '#0F3460'}}>*</span></label>
                      <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }} min={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#0f172a' }}>Date de fin <span style={{color: '#0F3460'}}>*</span></label>
                      <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }} min={form.startDate || new Date().toISOString().split('T')[0]} />
                    </div>

                    <div style={{ marginTop: 'auto', background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '2px solid #0F3460', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Budget Calculé</div>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{computedBudget.toLocaleString()} <span style={{ fontSize: '1rem', color: '#0F3460' }}>FCFA</span></div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>Paiement requis avant activation</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '1rem 2rem', borderRadius: '12px', background: '#f1f5f9', color: '#475569', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
                  <button type="submit" disabled={submitting || computedBudget === 0} style={{ padding: '1rem 2rem', borderRadius: '12px', background: '#0F3460', color: '#fff', border: 'none', fontWeight: 700, cursor: (submitting || computedBudget === 0) ? 'not-allowed' : 'pointer', opacity: (submitting || computedBudget === 0) ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {submitting ? 'Traitement...' : (editingAd ? 'Enregistrer les modifications' : 'Passer au paiement & Créer')} <ArrowRight size={18} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnonceurDashboard;
