import React, { useState, useEffect } from 'react';
import { Search, UserCheck, Clock, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

const AdminInscriptions = () => {
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInscriptions();
  }, []);

  const fetchInscriptions = async () => {
    try {
      const token = localStorage.getItem('nv_token');
      // For now, reuse the /api/admin/payments route since it contains enrollment details
      const response = await axios.get('http://localhost:5001/api/admin/payments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setInscriptions(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('nv_token');
      await axios.put(`http://localhost:5001/api/admin/payments/${id}/status`, { status: newStatus }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchInscriptions();
    } catch (err) {
      alert("Erreur lors de la mise à jour : " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Voulez-vous vraiment supprimer cet apprenant ?')) {
      try {
        const token = localStorage.getItem('nv_token');
        await axios.delete(`http://localhost:5001/api/admin/payments/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchInscriptions();
      } catch(err) {
        alert("Erreur lors de la suppression : " + err.message);
      }
    }
  };

  const filtered = inscriptions.filter(i => 
    i.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="admin-panel-header">
        <h3 className="admin-panel-title">Gestion des Inscriptions</h3>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
          <input 
            type="text" 
            className="admin-input" 
            placeholder="Rechercher (nom, formation)..." 
            style={{ paddingLeft: '2.5rem', marginBottom: 0 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Apprenant</th>
              <th>Formation</th>
              <th>Date d'inscription</th>
              <th>Montant Payé</th>
              <th>Statut Inscription</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>Chargement...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>Aucune inscription trouvée.</td></tr>
            ) : (
              filtered.map(insc => (
                <tr key={insc.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{insc.firstName} {insc.lastName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{insc.email}</div>
                  </td>
                  <td>{insc.title}</td>
                  <td>{new Date(insc.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td>{insc.amount ? `${insc.amount} FCFA` : 'Gratuit'}</td>
                  <td>
                    <span className={`admin-badge ${insc.status === 'active' ? 'success' : insc.status === 'completed' ? 'success' : 'warning'}`}>
                      {insc.status === 'active' ? 'Actif' : insc.status === 'completed' ? 'Payé' : 'En attente'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="admin-btn admin-btn-outline" 
                        title="Valider"
                        style={{ padding: '0.3rem 0.5rem', borderColor: '#10b981', color: '#10b981' }}
                        onClick={() => handleStatusChange(insc.id, 'completed')}
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button 
                        className="admin-btn admin-btn-outline" 
                        title="Refuser/Annuler"
                        style={{ padding: '0.3rem 0.5rem', borderColor: '#f59e0b', color: '#f59e0b' }}
                        onClick={() => handleStatusChange(insc.id, 'failed')}
                      >
                        <XCircle size={16} />
                      </button>
                      <button 
                        className="admin-btn admin-btn-outline" 
                        title="Supprimer"
                        style={{ padding: '0.3rem 0.5rem', borderColor: '#ef4444', color: '#ef4444' }}
                        onClick={() => handleDelete(insc.id)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminInscriptions;
