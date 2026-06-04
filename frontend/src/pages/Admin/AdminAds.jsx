import React, { useState, useEffect } from 'react';
import { Plus, Eye, MousePointerClick, Trash2, Power } from 'lucide-react';
import axios from 'axios';

const AdminAds = () => {
  const [ads, setAds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    advertiserName: '',
    placement: 'Accueil',
    imageUrl: '',
    targetUrl: '',
    startDate: '',
    endDate: ''
  });

  const fetchAds = async () => {
    try {
      // ?admin=true permet de récupérer même les inactives
      const res = await axios.get('http://localhost:5001/api/ads?admin=true');
      setAds(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/ads', formData);
      setShowModal(false);
      fetchAds();
    } catch (err) {
      alert("Erreur lors de la création.");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await axios.put(`http://localhost:5001/api/ads/${id}/toggle`, { isActive: !currentStatus });
      fetchAds();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusLabel = (ad) => {
    const isExpired = new Date(ad.endDate) < new Date();
    if (isExpired) return { label: 'Expirée', class: 'inactive' };
    if (ad.isActive) return { label: 'En ligne', class: 'active' };
    return { label: 'Désactivée', class: 'inactive' };
  };

  return (
    <div className="fade-in">
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h3 className="admin-panel-title">Campagnes Publicitaires</h3>
          <button className="admin-btn" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Ajouter une Pub
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
                <tr><td colSpan="8" style={{textAlign: 'center', padding: '2rem'}}>Aucune publicité trouvée.</td></tr>
              ) : ads.map(ad => {
                const ctr = ad.views > 0 ? ((ad.clicks / ad.views) * 100).toFixed(1) : 0;
                const status = getStatusLabel(ad);
                
                return (
                  <tr key={ad.id}>
                    <td style={{ fontWeight: 600 }}>{ad.advertiserName}</td>
                    <td>{ad.placement}</td>
                    <td>{ad.views.toLocaleString()}</td>
                    <td>{ad.clicks.toLocaleString()}</td>
                    <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{ctr}%</td>
                    <td>{new Date(ad.endDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${status.class}`}>
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => toggleStatus(ad.id, ad.isActive)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: ad.isActive ? '#e74c3c' : '#2ecc71', marginRight: '10px' }}
                        title={ad.isActive ? "Désactiver" : "Activer"}
                      >
                        <Power size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal fade-in">
            <h3 className="admin-modal-title">Nouvelle Publicité</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Nom de l'annonceur</label>
                <input type="text" name="advertiserName" className="admin-input" required onChange={handleChange} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Emplacement</label>
                <select name="placement" className="admin-input" onChange={handleChange}>
                  <option value="Accueil">Accueil</option>
                  <option value="Sidebar">Sidebar Formations</option>
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>URL de l'image (Bannière)</label>
                <input type="url" name="imageUrl" className="admin-input" required onChange={handleChange} placeholder="https://..." />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Lien de redirection (Target URL)</label>
                <input type="url" name="targetUrl" className="admin-input" required onChange={handleChange} placeholder="https://..." />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label>Date de début</label>
                  <input type="date" name="startDate" className="admin-input" required onChange={handleChange} />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Date de fin</label>
                  <input type="date" name="endDate" className="admin-input" required onChange={handleChange} />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="admin-btn">
                  Enregistrer
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
