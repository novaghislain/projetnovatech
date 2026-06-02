import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Image as ImageIcon, X, AlertTriangle, BookOpen } from 'lucide-react';
import AdminCourseBuilder from './AdminCourseBuilder';

const initialFormations = [
  { id: 1, title: 'Initiation à la Programmation', category: 'Développement', price: 25000, duration: '4 semaines', ageGroup: '10-14 ans', maxPlaces: 20, enrolled: 15, status: 'active', image: '/7x.jpg' },
  { id: 2, title: 'Découverte de l\'IA', category: 'Intelligence Artificielle', price: 30000, duration: '6 semaines', ageGroup: '14-18 ans', maxPlaces: 20, enrolled: 20, status: 'full', image: '/8x.jpeg' },
  { id: 3, title: 'Bureautique Avancée', category: 'Bureautique', price: 20000, duration: '3 semaines', ageGroup: 'Tous âges', maxPlaces: 15, enrolled: 8, status: 'active', image: '/10x.jpg' },
];

const mockCategories = ['Développement', 'Intelligence Artificielle', 'Bureautique', 'Design Graphique'];

const AdminFormations = () => {
  const [formations, setFormations] = useState(initialFormations);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Builder State
  const [builderFormation, setBuilderFormation] = useState(null); // { id, title }
  
  // Form state
  const [formData, setFormData] = useState({
    id: null, title: '', description: '', category: '', price: '', duration: '', ageGroup: '', maxPlaces: '', image: ''
  });
  const [errors, setErrors] = useState({});

  // Filters
  const filteredFormations = formations.filter(f => {
    const matchesSearch = f.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCat === 'All' || f.category === filterCat;
    return matchesSearch && matchesCat;
  });

  const handleOpenModal = (formation = null) => {
    if (formation) {
      setFormData(formation);
    } else {
      setFormData({ id: null, title: '', description: '', category: mockCategories[0], price: '', duration: '', ageGroup: '', maxPlaces: '', image: '' });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title || formData.title.length < 5) newErrors.title = 'Le titre doit faire au moins 5 caractères.';
    if (!formData.price || isNaN(formData.price)) newErrors.price = 'Veuillez entrer un prix valide.';
    if (!formData.maxPlaces || isNaN(formData.maxPlaces)) newErrors.maxPlaces = 'Veuillez entrer un nombre de places valide.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    if (formData.id) {
      setFormations(formations.map(f => f.id === formData.id ? { ...f, ...formData } : f));
    } else {
      const newId = Math.max(0, ...formations.map(f => f.id)) + 1;
      setFormations([...formations, { ...formData, id: newId, enrolled: 0, status: 'active' }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setFormations(formations.filter(f => f.id !== id));
    setDeleteConfirm(null);
  };

  const handleImageUpload = (e) => {
    // Simulation upload image
    setFormData({...formData, image: '/placeholder.jpg'});
  };

  if (builderFormation) {
    return <AdminCourseBuilder formationId={builderFormation.id} formationTitle={builderFormation.title} onBack={() => setBuilderFormation(null)} />;
  }

  return (
    <div className="fade-in">
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h3 className="admin-panel-title">Liste des Formations</h3>
          <button className="admin-btn" onClick={() => handleOpenModal()}><Plus size={18} /> Nouvelle Formation</button>
        </div>
        
        {/* FILTERS */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '300px' }}>
            <Search size={18} color="#888" />
            <input 
              type="text" 
              placeholder="Rechercher une formation..." 
              style={{ border: 'none', outline: 'none', width: '100%' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="form-control" style={{ width: '250px' }} value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
            <option value="All">Toutes les catégories</option>
            {mockCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Formation</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>Inscrits / Places</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFormations.map(f => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: '#eee', overflow: 'hidden' }}>
                        {f.image && <img src={f.image} alt={f.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div>
                        <div>{f.title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: 'normal' }}>{f.duration} • {f.ageGroup}</div>
                      </div>
                    </div>
                  </td>
                  <td>{f.category}</td>
                  <td>{f.price.toLocaleString()} FCFA</td>
                  <td>{f.enrolled} / {f.maxPlaces}</td>
                  <td>
                    <span className={`status-badge ${f.status === 'active' ? 'active' : 'pending'}`}>
                      {f.status === 'active' ? 'Ouverte' : 'Complet'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="admin-btn admin-btn-outline" style={{ padding: '0.3rem 0.5rem', color: 'var(--color-secondary)', borderColor: 'var(--color-secondary)' }} title="Gérer le programme (Cours)" onClick={() => setBuilderFormation({ id: f.id, title: f.title })}>
                        <BookOpen size={16} />
                      </button>
                      <button className="admin-btn admin-btn-outline" style={{ padding: '0.3rem 0.5rem' }} title="Modifier les infos" onClick={() => handleOpenModal(f)}>
                        <Edit size={16} />
                      </button>
                      <button 
                        className="admin-btn admin-btn-outline" 
                        style={{ padding: '0.3rem 0.5rem', color: '#ff4d4f', borderColor: '#ff4d4f' }} 
                        title="Supprimer la formation"
                        onClick={() => setDeleteConfirm(f.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredFormations.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Aucune formation trouvée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORMULAIRE */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '800px' }}>
            <div className="admin-modal-header">
              <h4>{formData.id ? 'Modifier la formation' : 'Nouvelle formation'}</h4>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Titre de la formation *</label>
                  <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  {errors.title && <div style={{ color: '#ff4d4f', fontSize: '0.8rem', marginTop: '4px' }}>{errors.title}</div>}
                </div>
                <div className="form-group">
                  <label>Catégorie *</label>
                  <select className="form-control" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {mockCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows="3" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Prix (FCFA) *</label>
                  <input type="number" className="form-control" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  {errors.price && <div style={{ color: '#ff4d4f', fontSize: '0.8rem', marginTop: '4px' }}>{errors.price}</div>}
                </div>
                <div className="form-group">
                  <label>Durée (ex: 4 semaines)</label>
                  <input type="text" className="form-control" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Tranche d'âge</label>
                  <input type="text" className="form-control" value={formData.ageGroup} onChange={e => setFormData({...formData, ageGroup: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Places max *</label>
                  <input type="number" className="form-control" value={formData.maxPlaces} onChange={e => setFormData({...formData, maxPlaces: e.target.value})} />
                  {errors.maxPlaces && <div style={{ color: '#ff4d4f', fontSize: '0.8rem', marginTop: '4px' }}>{errors.maxPlaces}</div>}
                </div>
              </div>

              <div className="form-group">
                <label>Image de couverture</label>
                <div style={{ border: '2px dashed #ddd', borderRadius: '8px', padding: '2rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => document.getElementById('imageUpload').click()}>
                  <ImageIcon size={32} color="#aaa" style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>Cliquez pour uploader une image</div>
                  <input type="file" id="imageUpload" style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} />
                </div>
              </div>

            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-outline" onClick={() => setIsModalOpen(false)}>Annuler</button>
              <button className="admin-btn" onClick={handleSave}>Enregistrer la formation</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SUPPRESSION */}
      {deleteConfirm !== null && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '450px' }}>
            <div className="admin-modal-header" style={{ borderBottom: 'none' }}>
              <h4 style={{ color: '#ff4d4f', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} /> Confirmer la suppression
              </h4>
            </div>
            <div className="admin-modal-body">
              <p>Êtes-vous sûr de vouloir supprimer définitivement cette formation ?</p>
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>Attention : S'il y a des inscrits à cette formation, il est recommandé de l'archiver plutôt que de la supprimer.</p>
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

export default AdminFormations;
