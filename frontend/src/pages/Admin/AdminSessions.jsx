import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Users, X, Clock } from 'lucide-react';
import { API_URL } from '../../config';

const AdminSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterFormation, setFilterFormation] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    id: null, formationId: '', startDate: '', endDate: '', maxPlaces: '', status: 'planifiee'
  });

  const getHeaders = () => {
    const token = localStorage.getItem('nv_token');
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('nv_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [fRes, sRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/formations`, { headers }),
        fetch(`${API_URL}/api/admin/sessions`, { headers })
      ]);

      if (fRes.ok) {
        const fData = await fRes.json();
        setFormations(fData);
      }
      if (sRes.ok) {
        setSessions(await sRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSessions = sessions.filter(s => {
    return filterFormation === 'All' || s.formationId.toString() === filterFormation;
  });

  const handleOpenModal = (session = null) => {
    if (session) {
      setFormData(session);
    } else {
      setFormData({
        id: null, formationId: formations.length > 0 ? formations[0].id : '',
        startDate: '', endDate: '', maxPlaces: '', status: 'planifiee'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.startDate || !formData.endDate || !formData.maxPlaces) return;
    setSaving(true);
    try {
      const method = formData.id ? 'PUT' : 'POST';
      const url = formData.id
        ? `${API_URL}/api/admin/sessions/${formData.id}`
        : `${API_URL}/api/admin/sessions`;

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Erreur lors de l'enregistrement");
      await fetchData();
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/sessions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('nv_token')}` }
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      await fetchData();
      setDeleteConfirm(null);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fade-in">
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h3 className="admin-panel-title">Gestion des Sessions</h3>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}><Plus size={18} /> Nouvelle Session</button>
        </div>
        
        {/* FILTERS */}
        <div className="filter-bar">
          <select className="form-control" style={{ width: '300px' }} value={filterFormation} onChange={(e) => setFilterFormation(e.target.value)}>
            <option value="All">Toutes les formations</option>
            {formations.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
          </select>
          <span className="admin-badge neutral">{filteredSessions.length} session(s)</span>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Formation</th>
                <th><Calendar size={14} style={{display:'inline', verticalAlign:'middle'}}/> Période</th>
                <th><Users size={14} style={{display:'inline', verticalAlign:'middle'}}/> Inscrits / Max</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="empty-state">Chargement...</td></tr>
              ) : filteredSessions.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{s.formationTitle}</td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>Du {s.startDate} au {s.endDate}</div>
                  </td>
                  <td>{s.enrolled} / {s.maxPlaces}</td>
                  <td>
                    <span className={`status-badge ${s.status === 'ouverte' ? 'active' : s.status === 'complet' ? 'pending' : 'inactive'}`}>
                      {s.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="action-group">
                      <button className="btn btn-outline" style={{ padding: '0.3rem 0.5rem' }} onClick={() => handleOpenModal(s)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn btn-danger" onClick={() => setDeleteConfirm(s.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredSessions.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-state">Aucune session trouvée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL AJOUT/EDITION */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header">
              <h4>{formData.id ? 'Modifier la session' : 'Nouvelle session'}</h4>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              <div className="form-group">
                <label>Formation rattachée *</label>
                <select className="form-control" value={formData.formationId} onChange={(e) => setFormData({...formData, formationId: e.target.value})}>
                  {formations.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date de début *</label>
                  <input type="date" className="form-control" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Date de fin *</label>
                  <input type="date" className="form-control" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Nombre de places maximal *</label>
                <input type="number" className="form-control" value={formData.maxPlaces} onChange={(e) => setFormData({...formData, maxPlaces: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Statut</label>
                <select className="form-control" value={formData.status || 'planifiee'} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                  <option value="planifiee">Planifiée</option>
                  <option value="ouverte">Ouverte</option>
                  <option value="complet">Complète</option>
                </select>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || !formData.startDate || !formData.endDate || !formData.maxPlaces}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SUPPRESSION */}
      {deleteConfirm !== null && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '400px' }}>
            <div className="admin-modal-header" style={{ borderBottom: 'none' }}>
              <h4 style={{ color: '#ff4d4f' }}>Supprimer la session</h4>
            </div>
            <div className="admin-modal-body">
              <p>Voulez-vous vraiment supprimer cette session ? Cette action annulera les inscriptions éventuelles.</p>
            </div>
            <div className="admin-modal-footer" style={{ borderTop: 'none' }}>
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Annuler</button>
              <button className="btn btn-primary" style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(deleteConfirm)}>Oui, supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSessions;
