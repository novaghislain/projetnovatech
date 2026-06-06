import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Image as ImageIcon, X, AlertTriangle, BookOpen } from 'lucide-react';
import AdminCourseBuilder from './AdminCourseBuilder';
import { API_URL, getImageUrl } from '../../config';

const mockCategories = ['Développement', 'Intelligence Artificielle', 'Bureautique', 'Design Graphique'];

const AdminFormations = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Builder State
  const [builderFormation, setBuilderFormation] = useState(null); // { id, title }
  
  // Form state
  const [formData, setFormData] = useState({
    id: null, title: '', description: '', category: mockCategories[0], price: '', duration: '', ageGroup: '', maxParticipants: '', status: 'draft', imageUrl: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    try {
      const token = localStorage.getItem('nv_token');
      const response = await fetch(`${API_URL}/api/admin/formations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Erreur de récupération");
      const data = await response.json();
      setFormations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFormations = formations.filter(f => {
    const matchesSearch = f.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCat === 'All' || f.category === filterCat;
    return matchesSearch && matchesCat;
  });

  const handleOpenModal = (formation = null) => {
    if (formation) {
      setFormData(formation);
    } else {
      setFormData({ id: null, title: '', description: '', category: mockCategories[0], price: '', duration: '', ageGroup: '', maxParticipants: '', status: 'draft', imageUrl: '', isFull: false });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title || formData.title.length < 5) newErrors.title = 'Le titre doit faire au moins 5 caractères.';
    if (!formData.price || isNaN(formData.price)) newErrors.price = 'Veuillez entrer un prix valide.';
    if (!formData.maxParticipants || isNaN(formData.maxParticipants)) newErrors.maxParticipants = 'Veuillez entrer un nombre de places valide.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('nv_token');
      const method = formData.id ? 'PUT' : 'POST';
      const url = formData.id ? `${API_URL}/api/admin/formations/${formData.id}` : `${API_URL}/api/admin/formations`;
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error("Erreur lors de l'enregistrement");
      await fetchFormations();
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('nv_token');
      const response = await fetch(`${API_URL}/api/admin/formations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Erreur de suppression");
      await fetchFormations();
      setDeleteConfirm(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const token = localStorage.getItem('nv_token');
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setFormData({...formData, imageUrl: data.imageUrl});
      } else {
        alert("Erreur lors de l'upload de l'image.");
      }
    } catch (err) {
      alert("Erreur réseau.");
    }
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
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center' }}>Chargement...</td></tr>
              ) : filteredFormations.map(f => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: '#eee', overflow: 'hidden' }}>
                        {f.imageUrl && <img src={getImageUrl(f.imageUrl)} alt={f.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div>
                        <div>{f.title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: 'normal' }}>{f.duration} • {f.ageGroup}</div>
                      </div>
                    </div>
                  </td>
                  <td>{f.category}</td>
                  <td>{f.price?.toLocaleString()} FCFA</td>
                  <td>{f.enrolled} / {f.maxParticipants}</td>
                  <td>
                    <span className={`status-badge ${f.status === 'published' ? 'active' : 'pending'}`}>
                      {f.status === 'published' ? 'Publié' : (f.status === 'full' ? 'Complet' : 'Brouillon')}
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
              {!loading && filteredFormations.length === 0 && (
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
          <div className="admin-modal" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
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
                  <input type="text" className="form-control" value={formData.duration || ''} onChange={e => setFormData({...formData, duration: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Tranche d'âge</label>
                  <input type="text" className="form-control" value={formData.ageGroup || ''} onChange={e => setFormData({...formData, ageGroup: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Places max *</label>
                  <input type="number" className="form-control" value={formData.maxParticipants} onChange={e => setFormData({...formData, maxParticipants: e.target.value})} />
                  {errors.maxParticipants && <div style={{ color: '#ff4d4f', fontSize: '0.8rem', marginTop: '4px' }}>{errors.maxParticipants}</div>}
                </div>
              </div>

              <div className="form-group">
                <label>Statut de la formation</label>
                <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié (En ligne)</option>
                  <option value="full">Complet (obsolète, utiliser la case ci-dessous)</option>
                </select>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="isFullCheckbox" 
                  checked={formData.isFull || false} 
                  onChange={e => setFormData({...formData, isFull: e.target.checked})} 
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="isFullCheckbox" style={{ margin: 0, cursor: 'pointer', fontWeight: 600, color: '#dc2626' }}>
                  Marquer manuellement comme "COMPLET"
                </label>
              </div>

              <div className="form-group">
                <label>Image de couverture (URL ou /image.jpg)</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input type="text" className="form-control" placeholder="URL de l'image" value={formData.imageUrl || ''} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                  <button className="admin-btn admin-btn-outline" onClick={() => document.getElementById('imageUpload').click()}><ImageIcon size={16} /> Uploader</button>
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
