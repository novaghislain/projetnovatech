import React, { useState } from 'react';
import { Plus, Edit, Trash2, Tag, X } from 'lucide-react';

const initialCategories = [
  { id: 1, name: 'Intelligence Artificielle', courseCount: 2 },
  { id: 2, name: 'Programmation Web', courseCount: 5 },
  { id: 3, name: 'Bureautique', courseCount: 1 },
  { id: 4, name: 'Design Graphique', courseCount: 0 },
];

const AdminCategories = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [newCatName, setNewCatName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditingCat(cat);
      setNewCatName(cat.name);
    } else {
      setEditingCat(null);
      setNewCatName('');
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!newCatName.trim()) return;
    
    if (editingCat) {
      setCategories(categories.map(c => c.id === editingCat.id ? { ...c, name: newCatName } : c));
    } else {
      const newId = Math.max(0, ...categories.map(c => c.id)) + 1;
      setCategories([...categories, { id: newId, name: newCatName, courseCount: 0 }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setCategories(categories.filter(c => c.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="fade-in">
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h3 className="admin-panel-title">Gestion des Catégories</h3>
          <button className="admin-btn" onClick={() => handleOpenModal()}><Plus size={18} /> Nouvelle Catégorie</button>
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
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Tag size={16} color="var(--color-accent)" /> {cat.name}
                  </td>
                  <td>{cat.courseCount} formation{cat.courseCount > 1 ? 's' : ''}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="admin-btn admin-btn-outline" style={{ padding: '0.3rem 0.5rem' }} onClick={() => handleOpenModal(cat)}>
                        <Edit size={16} />
                      </button>
                      <button 
                        className="admin-btn admin-btn-outline" 
                        style={{ padding: '0.3rem 0.5rem', color: '#ff4d4f', borderColor: '#ff4d4f', opacity: cat.courseCount > 0 ? 0.5 : 1 }} 
                        onClick={() => cat.courseCount === 0 && setDeleteConfirm(cat.id)}
                        disabled={cat.courseCount > 0}
                        title={cat.courseCount > 0 ? "Impossible de supprimer une catégorie contenant des formations" : "Supprimer"}
                      >
                        <Trash2 size={16} />
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
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-outline" onClick={() => setIsModalOpen(false)}>Annuler</button>
              <button className="admin-btn" onClick={handleSave} disabled={!newCatName.trim()}>Enregistrer</button>
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
              <button className="admin-btn admin-btn-outline" onClick={() => setDeleteConfirm(null)}>Annuler</button>
              <button className="admin-btn" style={{ background: '#ff4d4f' }} onClick={() => handleDelete(deleteConfirm)}>Oui, supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
