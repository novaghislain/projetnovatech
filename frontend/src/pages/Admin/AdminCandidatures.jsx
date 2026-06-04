import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';

const AdminCandidatures = () => {
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCandidatures = async () => {
    try {
      const token = localStorage.getItem('nv_token');
      const res = await fetch('http://localhost:5001/api/admin/applications', {
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
      const res = await fetch(`http://localhost:5001/api/admin/applications/${id}/approve`, {
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
      const res = await fetch(`http://localhost:5001/api/admin/applications/${id}/reject`, {
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
      const res = await fetch(`http://localhost:5001/api/admin/applications/${id}`, {
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

  if (loading) return <div style={{ padding: '2rem' }}>Chargement des candidatures...</div>;

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
                  <td>
                    <span style={{ backgroundColor: '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                      {c.specialite}
                    </span>
                  </td>
                  <td>
                    <div style={{ maxWidth: '300px', fontSize: '0.85rem', color: '#475569', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {c.bio}
                    </div>
                  </td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>
                    {c.status === 'pending' && <span style={{ color: '#d97706', fontWeight: 600, fontSize: '0.85rem' }}>⏳ En attente</span>}
                    {c.status === 'approved' && <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>✅ Approuvé</span>}
                    {c.status === 'rejected' && <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.85rem' }}>❌ Rejeté</span>}
                  </td>
                  <td>
                    {c.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <button 
                          onClick={() => handleApprove(c.id)}
                          style={{ padding: '0.4rem 0.6rem', background: '#ecfdf5', color: '#10b981', border: '1px solid #10b981', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          <CheckCircle size={14} /> Approuver
                        </button>
                        <button 
                          onClick={() => handleReject(c.id)}
                          style={{ padding: '0.4rem 0.6rem', background: '#fef2f2', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          <XCircle size={14} /> Rejeter
                        </button>
                      </div>
                    )}
                    <button 
                      onClick={() => handleDelete(c.id)}
                      style={{ padding: '0.4rem 0.6rem', background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600 }}
                      title="Supprimer définitivement"
                    >
                      <Trash2 size={16} /> Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {candidatures.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Aucune candidature trouvée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCandidatures;
