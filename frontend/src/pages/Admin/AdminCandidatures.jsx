import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { API_URL } from '../../config';

const AdminCandidatures = () => {
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCandidatures = async () => {
    try {
      const token = localStorage.getItem('nv_token');
      const res = await fetch(`${API_URL}/api/admin/applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setCandidatures(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidatures();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm("Voulez-vous vraiment approuver cette candidature ? L'utilisateur deviendra Formateur.")) return;
    try {
      const token = localStorage.getItem('nv_token');
      const res = await fetch(`${API_URL}/api/admin/applications/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCandidatures();
      } else {
        alert("Erreur lors de l'approbation.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau.");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Voulez-vous vraiment rejeter cette candidature ?")) return;
    try {
      const token = localStorage.getItem('nv_token');
      const res = await fetch(`${API_URL}/api/admin/applications/${id}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCandidatures();
      } else {
        alert("Erreur lors du rejet.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer définitivement cette candidature ?")) return;
    try {
      const token = localStorage.getItem('nv_token');
      const res = await fetch(`${API_URL}/api/admin/applications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCandidatures();
      } else {
        alert("Erreur lors de la suppression.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau.");
    }
  };

  if (loading) return <div className="empty-state" style={{ padding: '2rem' }}>Chargement des candidatures...</div>;

  return (
    <div className="fade-in">
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h3 className="admin-panel-title">Candidatures "Devenir Formateur"</h3>
        </div>
        
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Candidat</th>
                <th>Spécialité</th>
                <th>Biographie</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidatures.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.firstName} {c.lastName}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{c.email}</div>
                  </td>
                  <td><span className="info-chip">{c.specialite}</span></td>
                  <td>
                    <div style={{ maxWidth: '300px', fontSize: '0.85rem', color: '#475569', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {c.bio}
                    </div>
                  </td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`admin-badge ${c.status === 'approved' ? 'success' : c.status === 'rejected' ? 'danger' : 'warning'}`}>
                      {c.status === 'pending' ? 'En attente' : c.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                    </span>
                  </td>
                  <td>
                    <div className="action-group">
                      {c.status === 'pending' && (
                        <>
                          <button className="btn btn-primary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }} onClick={() => handleApprove(c.id)}>
                            <CheckCircle size={14} /> Approuver
                          </button>
                          <button className="btn btn-outline" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleReject(c.id)}>
                            <XCircle size={14} /> Rejeter
                          </button>
                        </>
                      )}
                      <button className="btn btn-outline" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(c.id)} title="Supprimer définitivement">
                        <Trash2 size={14} /> Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {candidatures.length === 0 && (
                <tr><td colSpan="6" className="empty-state">Aucune candidature trouvée.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCandidatures;
