import React, { useState, useEffect } from 'react';
import { Plus, Eye, MousePointerClick, Trash2, Power, X, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config';

const AdminAds = () => {
  const [ads, setAds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notif, setNotif] = useState(null);
  const [formData, setFormData] = useState({
    advertiserName: '',
    placement: 'header',
    imageUrl: '',
    targetUrl: '',
    startDate: '',
    endDate: ''
  });

  const showNotif = (message, type = 'success') => {
    setNotif({ message, type });
    setTimeout(() => setNotif(null), 4000);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('nv_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchAds = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/ads?admin=true`, {
        headers: getAuthHeaders()
      });
      setAds(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => {
    setFormData({
      advertiserName: '',
      placement: 'header',
      imageUrl: '',
      targetUrl: '',
      startDate: '',
      endDate: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/ads`, formData, {
        headers: getAuthHeaders()
      });
      setShowModal(false);
      resetForm();
      showNotif('✅ Publicité créée avec succès !');
      fetchAds();
    } catch (err) {
      const msg = err.response?.data?.error || 'Erreur lors de la création.';
      showNotif(`❌ ${msg}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await axios.put(`${API_URL}/api/ads/${id}/toggle`, { isActive: !currentStatus }, {
        headers: getAuthHeaders()
      });
      showNotif(currentStatus ? '🔴 Publicité désactivée' : '🟢 Publicité activée');
      fetchAds();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, advertiserName) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer la publicité de "${advertiserName}" ?`)) return;
    try {
      await axios.delete(`${API_URL}/api/ads/${id}`, {
        headers: getAuthHeaders()
      });
      showNotif(`🗑️ Publicité de "${advertiserName}" supprimée`);
      fetchAds();
    } catch (err) {
      showNotif(`❌ Erreur lors de la suppression : ${err.response?.data?.error || err.message}`, 'error');
    }
  };

  const getStatusLabel = (ad) => {
    const isExpired = new Date(ad.endDate) < new Date();
    if (isExpired) return { label: 'Expirée', class: 'inactive' };
    if (ad.isActive) return { label: 'En ligne', class: 'active' };
    return { label: 'Brouillon', class: 'inactive' };
  };

  return (
    <div className="fade-in">
      {/* Notification */}
      {notif && (
        <div className={`notif-bar ${notif.type === 'error' ? 'error' : 'success'}`}>
          {notif.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          {notif.message}
        </div>
      )}

      <div className="admin-panel">
        <div className="admin-panel-header">
          <h3 className="admin-panel-title">
            Campagnes Publicitaires
            {ads.length > 0 && (
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 400, marginLeft: '0.5rem' }}>
                ({ads.length} pub{ads.length > 1 ? 's' : ''})
              </span>
            )}
          </h3>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
            <Plus size={18} /> Créer une Publicité
          </button>
        </div>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Annonceur</th>
                <th>Emplacement</th>
                <th><Eye size={14} style={{display:'inline', verticalAlign:'middle'}}/> Vues</th>
                <th><MousePointerClick size={14} style={{display:'inline', verticalAlign:'middle'}}/> Clics</th>
                <th>CTR</th>
                <th>Expiration</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.length === 0 ? (
                <tr><td colSpan="8" style={{textAlign: 'center', padding: '2rem', color: '#94a3b8'}}>Aucune publicité. Cliquez sur "Créer une Publicité".</td></tr>
              ) : ads.map(ad => {
                const ctr = ad.views > 0 ? ((ad.clicks / ad.views) * 100).toFixed(1) : 0;
                const status = getStatusLabel(ad);
                const isExpired = new Date(ad.endDate) < new Date();

                return (
                  <tr key={ad.id}>
                    <td style={{ fontWeight: 600 }}>{ad.advertiserName}</td>
                    <td><span className="info-chip">{ad.placement}</span></td>
                    <td>{ad.views.toLocaleString()}</td>
                    <td>{ad.clicks.toLocaleString()}</td>
                    <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{ctr}%</td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {new Date(ad.endDate).toLocaleDateString('fr-FR')}
                      {isExpired && <span style={{ color: '#ef4444', marginLeft: '0.3rem' }}>⚠</span>}
                    </td>
                    <td>
                      <span className={`status-badge ${status.class}`}>
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          onClick={() => toggleStatus(ad.id, ad.isActive)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: ad.isActive ? '#ef4444' : '#22c55e',
                            padding: '0.3rem', borderRadius: '6px',
                            transition: 'all 0.2s'
                          }}
                          title={ad.isActive ? "Désactiver" : "Activer"}
                        >
                          <Power size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(ad.id, ad.advertiserName)}
                          className="btn btn-danger"
                          style={{ padding: '0.3rem' }}
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de création */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="admin-modal-header">
              <h4>Nouvelle Publicité</h4>
              <button className="icon-btn" onClick={() => { setShowModal(false); resetForm(); }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="form-group">
                  <label>Nom de l'annonceur *</label>
                  <input type="text" name="advertiserName" className="form-control" required
                    value={formData.advertiserName} onChange={handleChange}
                    placeholder="Ex: Entreprise XYZ" />
                </div>

                <div className="form-group">
                  <label>Emplacement *</label>
                  <select name="placement" className="form-control" value={formData.placement} onChange={handleChange}>
                    <option value="header">Bannière haute (header)</option>
                    <option value="sidebar">Sidebar</option>
                    <option value="inline">Entre les sections</option>
                    <option value="footer">Pied de page</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>URL de l'image (Bannière) *</label>
                  <input type="url" name="imageUrl" className="form-control" required
                    value={formData.imageUrl} onChange={handleChange}
                    placeholder="https://exemple.com/banniere.jpg" />
                </div>

                <div className="form-group">
                  <label>Lien de redirection (Target URL) *</label>
                  <input type="url" name="targetUrl" className="form-control" required
                    value={formData.targetUrl} onChange={handleChange}
                    placeholder="https://exemple.com/offre" />
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Date de début *</label>
                    <input type="date" name="startDate" className="form-control" required
                      value={formData.startDate} onChange={handleChange} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Date de fin *</label>
                    <input type="date" name="endDate" className="form-control" required
                      value={formData.endDate} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => { setShowModal(false); resetForm(); }}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}
                  style={{ opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                  {submitting ? (
                    <><Loader size={18} className="spin" /> Publication en cours...</>
                  ) : (
                    'Publier'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAds;
