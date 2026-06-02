import React, { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, Users, X, Clock } from 'lucide-react';

const mockFormationsList = [
  { id: 1, title: 'Initiation à la Programmation' },
  { id: 2, title: 'Découverte de l\'IA' },
  { id: 3, title: 'Bureautique Avancée' },
];

const initialSessions = [
  { id: 1, formationId: 1, formationTitle: 'Initiation à la Programmation', startDate: '2026-07-01', endDate: '2026-07-28', maxPlaces: 20, enrolled: 15, status: 'ouverte' },
  { id: 2, formationId: 2, formationTitle: 'Découverte de l\'IA', startDate: '2026-06-15', endDate: '2026-07-30', maxPlaces: 20, enrolled: 20, status: 'complet' },
  { id: 3, formationId: 1, formationTitle: 'Initiation à la Programmation', startDate: '2026-08-01', endDate: '2026-08-28', maxPlaces: 20, enrolled: 0, status: 'planifiée' },
];

const AdminSessions = () => {
  const [sessions, setSessions] = useState(initialSessions);
  const [filterFormation, setFilterFormation] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  const [formData, setFormData] = useState({
    id: null, formationId: mockFormationsList[0].id, startDate: '', endDate: '', maxPlaces: ''
  });

  const filteredSessions = sessions.filter(s => {
    return filterFormation === 'All' || s.formationId.toString() === filterFormation;
  });

  const handleOpenModal = (session = null) => {
    if (session) {
      setFormData(session);
    } else {
      setFormData({ id: null, formationId: mockFormationsList[0].id, startDate: '', endDate: '', maxPlaces: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const formationTitle = mockFormationsList.find(f => f.id.toString() === formData.formationId.toString())?.title;
    
    if (formData.id) {
      setSessions(sessions.map(s => s.id === formData.id ? { ...s, ...formData, formationTitle } : s));
    } else {
      const newId = Math.max(0, ...sessions.map(s => s.id)) + 1;
      setSessions([...sessions, { ...formData, id: newId, enrolled: 0, status: 'planifiée', formationTitle }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setSessions(sessions.filter(s => s.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="fade-in">
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h3 className="admin-panel-title">Gestion des Sessions</h3>
          <button className="admin-btn" onClick={() => handleOpenModal()}><Plus size={18} /> Nouvelle Session</button>
        </div>
        
        {/* FILTERS */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <select className="form-control" style={{ width: '300px' }} value={filterFormation} onChange={(e) => setFilterFormation(e.target.value)}>
            <option value="All">Toutes les formations</option>
            {mockFormationsList.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
          </select>
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
              {filteredSessions.map(s => (
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
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="admin-btn admin-btn-outline" style={{ padding: '0.3rem 0.5rem' }} onClick={() => handleOpenModal(s)}>
                        <Edit size={16} />
                      </button>
                      <button className="admin-btn admin-btn-outline" style={{ padding: '0.3rem 0.5rem', color: '#ff4d4f', borderColor: '#ff4d4f' }} onClick={() => setDeleteConfirm(s.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSessions.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Aucune session trouvée.</td>
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
                  {mockFormationsList.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
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
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-outline" onClick={() => setIsModalOpen(false)}>Annuler</button>
              <button className="admin-btn" onClick={handleSave} disabled={!formData.startDate || !formData.endDate || !formData.maxPlaces}>Enregistrer</button>
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
              <button className="admin-btn admin-btn-outline" onClick={() => setDeleteConfirm(null)}>Annuler</button>
              <button className="admin-btn" style={{ background: '#ff4d4f' }} onClick={() => handleDelete(deleteConfirm)}>Oui, supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSessions;
