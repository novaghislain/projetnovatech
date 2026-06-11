import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, X } from 'lucide-react';
import { API_URL } from '../../config';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [newCatName, setNewCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState(null);

  const getHeaders = () => {
    const token = localStorage.getItem('nv_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/categories`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('nv_token')}` }
      });
      if (!res.ok) throw new Error('Erreur de chargement');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditingCat(cat);
      setNewCatName(cat.name);
      setCatDescription(cat.description || '');
    } else {
      setEditingCat(null);
      setNewCatName('');
      setCatDescription('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!newCatName.trim()) return;

    try {
      const method = editingCat ? 'PUT' : 'POST';
      const url = editingCat
        ? `${API_URL}/api/admin/categories/${editingCat.id}`
        : `${API_URL}/api/admin/categories`;

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify({ name: newCatName.trim(), description: catDescription.trim() })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      await fetchCategories();
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('nv_token')}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la suppression');
      }
      await fetchCategories();
      setDeleteConfirm(null);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fade-in">
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h3 className="admin-panel-title">Gestion des Catégories</h3>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}><Plus size={18} /> Nouvelle Catégorie</button>
        </div>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom de la Catégorie</th>
                <th>Nombre de Formations</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" className="empty-state">Chargement...</td></tr>
              ) : categories.map(cat => (
                <tr key={cat.id}>
                  <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Tag size={16} color="var(--primary)" /> {cat.name}
                    {cat.description && <span style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 400, marginLeft: '0.3rem' }}>— {cat.description}</span>}
                  </td>
                  <td>{cat.courseCount} formation{cat.courseCount > 1 ? 's' : ''}</td>
                  <td>
                    <div className="action-group">
                      <button className="btn btn-outline" style={{ padding: '0.3rem 0.5rem' }} onClick={() => handleOpenModal(cat)}>
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ opacity: cat.courseCount > 0 ? 0.5 : 1 }}
                        onClick={() => cat.courseCount === 0 && setDeleteConfirm(cat.id)}
                        disabled={cat.courseCount > 0}
                        title={cat.courseCount > 0 ? "Impossible de supprimer une catégorie contenant des formations" : "Supprimer"}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Aucune catégorie trouvée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL AJOUT/EDITION */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h4>{editingCat ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h4>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              <div className="form-group">
                <label>Nom de la catégorie *</label>
                <input
                  type="text"
                  className="form-control"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ex: Marketing Digital"
                  autoFocus
                />
              </div>
              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label>Description (optionnelle)</label>
                <input
                  type="text"
                  className="form-control"
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  placeholder="Ex: Formations liées au marketing digital"
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={!newCatName.trim()}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SUPPRESSION */}
      {deleteConfirm !== null && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '400px' }}>
            <div className="admin-modal-header" style={{ borderBottom: 'none' }}>
              <h4 style={{ color: '#ff4d4f' }}>Confirmer la suppression</h4>
            </div>
            <div className="admin-modal-body">
              <p>Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.</p>
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

export default AdminCategories;
