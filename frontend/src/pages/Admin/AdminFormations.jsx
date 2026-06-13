import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Image as ImageIcon, X, AlertTriangle, BookOpen } from 'lucide-react';
import AdminCourseBuilder from './AdminCourseBuilder';
import { API_URL, getImageUrl } from '../../config';

const mockCategories = ['IA', 'Développement', 'Informatique Général', 'Bureautique'];

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
  
  const [formateurs, setFormateurs] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    id: null, title: '', description: '', category: mockCategories[0], price: '', registrationFee: '', duration: '', ageGroup: '', level: 'Tous niveaux',
    maxParticipants: '', status: 'draft', imageUrl: '', imageUrls: [], isFull: false,
    whatsappLink: '', meetLink: '', startDate: '', endDate: '', enrollmentEndDate: '', location: '', format: 'en_ligne', locationMode: 'en_ligne',
    formateurId: '', contactInstruction: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchFormations();
    fetchFormateurs();
  }, []);

  const fetchFormateurs = async () => {
    try {
      const token = localStorage.getItem('nv_token');
      const response = await fetch(`${API_URL}/api/admin/formateurs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFormateurs(data);
      }
    } catch (err) {
      console.error("Erreur de récupération des formateurs:", err);
    }
  };

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
      let parsedUrls = [];
      if (formation.imageUrls) {
        try {
          parsedUrls = typeof formation.imageUrls === 'string' ? JSON.parse(formation.imageUrls) : formation.imageUrls;
        } catch (e) {
          parsedUrls = [];
        }
      }
      setFormData({
        ...formation,
        level: formation.level || 'Tous niveaux',
        formateurId: formation.formateurId || '',
        imageUrls: parsedUrls || []
      });
    } else {
      setFormData({
        id: null, title: '', description: '', category: mockCategories[0], price: '', registrationFee: '', duration: '', ageGroup: '', level: 'Tous niveaux',
        maxParticipants: '', status: 'draft', imageUrl: '', imageUrls: [], isFull: false,
        whatsappLink: '', meetLink: '', startDate: '', endDate: '', enrollmentEndDate: '', location: '', format: 'en_ligne', locationMode: 'en_ligne',
        formateurId: '', contactInstruction: ''
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title || formData.title.length < 5) newErrors.title = 'Le titre doit faire au moins 5 caractères.';
    if (!formData.price || isNaN(formData.price)) newErrors.price = 'Veuillez entrer un prix valide.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('nv_token');
      const method = formData.id ? 'PUT' : 'POST';
      const url = formData.id ? `${API_URL}/api/admin/formations/${formData.id}` : `${API_URL}/api/admin/formations`;
      
      const bodyData = {
        ...formData,
        imageUrls: JSON.stringify(formData.imageUrls || [])
      };
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erreur lors de l'enregistrement");
      }
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

  const handleMultipleImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const token = localStorage.getItem('nv_token');
    const uploadedUrls = [];
    
    for (const file of files) {
      const uploadData = new FormData();
      uploadData.append('image', file);
      try {
        const res = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: uploadData
        });
        if (res.ok) {
          const data = await res.json();
          if (data.imageUrl) {
            uploadedUrls.push(data.imageUrl);
          }
        }
      } catch (err) {
        console.error("Upload error", err);
      }
    }
    
    if (uploadedUrls.length > 0) {
      setFormData(prev => {
        const currentUrls = prev.imageUrls || [];
        const newUrls = [...currentUrls, ...uploadedUrls];
        return {
          ...prev,
          imageUrls: newUrls,
          imageUrl: uploadedUrls[0] // Set newest uploaded image as main thumbnail
        };
      });
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
          <button className="btn btn-primary" onClick={() => handleOpenModal()}><Plus size={18} /> Nouvelle Formation</button>
        </div>
        
        {/* FILTERS */}
        <div className="filter-bar">
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div className="search-wrap" style={{ width: '250px' }}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Rechercher une formation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="form-control" style={{ width: '200px', marginBottom: 0 }} value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
              <option value="All">Toutes les catégories</option>
              {mockCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className="admin-badge neutral">{filteredFormations.length} formation(s)</span>
          </div>
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
                        {f.imageUrl && <img src={getImageUrl(f.imageUrl)} alt={f.title} onError={(e) => { e.target.onerror = null; e.target.src = '/10x.jpg'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
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
                    <div className="action-group">
                      <button className="btn btn-outline" style={{ padding: '0.3rem 0.5rem', color: 'var(--primary)', borderColor: 'var(--primary)' }} title="Gérer le programme (Cours)" onClick={() => setBuilderFormation({ id: f.id, title: f.title })}>
                        <BookOpen size={16} />
                      </button>
                      {/* Quick publish/unpublish toggle */}
                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem',
                          color: f.status === 'published' ? '#d97706' : '#16a34a',
                          borderColor: f.status === 'published' ? '#d97706' : '#16a34a'
                        }}
                        title={f.status === 'published' ? 'Mettre en brouillon' : 'Publier la formation'}
                        onClick={async () => {
                          const token = localStorage.getItem('nv_token');
                          const newStatus = f.status === 'published' ? 'draft' : 'published';
                          await fetch(`${API_URL}/api/admin/formations/${f.id}`, {
                            method: 'PUT',
                            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ...f, status: newStatus })
                          });
                          await fetchFormations();
                        }}
                      >
                        {f.status === 'published' ? '⏸ Brouillon' : '▶ Publier'}
                      </button>
                      <button className="btn btn-outline" style={{ padding: '0.3rem 0.5rem' }} title="Modifier les infos" onClick={() => handleOpenModal(f)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn btn-danger" title="Supprimer la formation" onClick={() => setDeleteConfirm(f.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredFormations.length === 0 && (
                <tr><td colSpan="6" className="empty-state">Aucune formation trouvée.</td></tr>
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
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Catégorie *</label>
                  <select className="form-control" value={formData.category || mockCategories[0]} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {mockCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Format de la formation</label>
                  <select className="form-control" value={formData.format || 'en_ligne'} onChange={e => setFormData({...formData, format: e.target.value})}>
                    <option value="en_ligne">En Ligne</option>
                    <option value="physique">Présentiel</option>
                    <option value="masse">En masse</option>
                    <option value="individuelle">Individuel / À domicile</option>
                  </select>
                </div>
                {formData.format === 'masse' && (
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Lieu de la formation de Masse</label>
                    <select className="form-control" value={formData.locationMode || 'en_ligne'} onChange={e => setFormData({...formData, locationMode: e.target.value})}>
                      <option value="en_ligne">En Ligne</option>
                      <option value="physique">Présentiel (Physique)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Description (Français) *</label>
                <textarea className="form-control" rows="3" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <div className="form-group">
                <label>Description (Anglais)</label>
                <textarea className="form-control" rows="3" placeholder="Optionnel : Remplissez si vous voulez que le site soit bilingue" value={formData.descriptionEn || ''} onChange={e => setFormData({...formData, descriptionEn: e.target.value})}></textarea>
              </div>

              <div className="form-group">
                <label>Instructions spéciales d'inscription (ex: Appelez le 01 91 34 85 57 pour inscrire votre enfant. Remplace le bouton de paiement en ligne.)</label>
                <input type="text" className="form-control" placeholder="Laissez vide pour autoriser l'inscription en ligne normale" value={formData.contactInstruction || ''} onChange={e => setFormData({...formData, contactInstruction: e.target.value})} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Prix (FCFA) *</label>
                  <input type="number" className="form-control" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  {errors.price && <div style={{ color: '#ff4d4f', fontSize: '0.8rem', marginTop: '4px' }}>{errors.price}</div>}
                </div>
                <div className="form-group">
                  <label>Frais d'inscription (FCFA)</label>
                  <input type="number" className="form-control" value={formData.registrationFee} onChange={e => setFormData({...formData, registrationFee: e.target.value})} />
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
                  <label>Niveau de la formation *</label>
                  <select className="form-control" value={formData.level || 'Tous niveaux'} onChange={e => setFormData({...formData, level: e.target.value})}>
                    <option value="Tous niveaux">Tous niveaux</option>
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Places max</label>
                  <input type="number" className="form-control" value={formData.maxParticipants} onChange={e => setFormData({...formData, maxParticipants: e.target.value})} />
                  {errors.maxParticipants && <div style={{ color: '#ff4d4f', fontSize: '0.8rem', marginTop: '4px' }}>{errors.maxParticipants}</div>}
                </div>
              </div>

              <div className="form-group">
                <label>Statut de la formation</label>
                <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié (En ligne)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Formateur assigné</label>
                <select className="form-control" value={formData.formateurId || ''} onChange={e => setFormData({...formData, formateurId: e.target.value ? parseInt(e.target.value) : ''})}>
                  <option value="">Aucun (Géré par l'administration)</option>
                  {formateurs.map(f => (
                    <option key={f.id} value={f.id}>{f.prenom} {f.nom} ({f.specialite})</option>
                  ))}
                </select>
              </div>


              <div className="form-group">
                <label>Photos de la formation (Défileront en carrousel sur la page détails) *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      type="button" 
                      className="btn btn-outline" 
                      onClick={() => document.getElementById('multipleImageUpload').click()}
                    >
                      <ImageIcon size={16} style={{ marginRight: '8px' }} /> Sélectionner des photos...
                    </button>
                    <input 
                      type="file" 
                      id="multipleImageUpload" 
                      style={{ display: 'none' }} 
                      accept="image/*" 
                      multiple 
                      onChange={handleMultipleImagesUpload} 
                    />
                  </div>
                  
                  {formData.imageUrls && formData.imageUrls.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                      {formData.imageUrls.map((url, idx) => (
                        <div key={idx} style={{ position: 'relative', width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: formData.imageUrl === url ? '2px solid var(--color-primary)' : '1px solid #e2e8f0' }}>
                          <img src={getImageUrl(url)} alt="preview" onError={(e) => { e.target.onerror = null; e.target.src = '/10x.jpg'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button 
                            type="button"
                            onClick={() => setFormData(prev => {
                              const newUrls = prev.imageUrls.filter((_, i) => i !== idx);
                              const newMain = prev.imageUrl === url ? (newUrls.length > 0 ? newUrls[0] : '') : prev.imageUrl;
                              return { ...prev, imageUrls: newUrls, imageUrl: newMain };
                            })}
                            style={{ 
                              position: 'absolute', 
                              top: '2px', 
                              right: '2px', 
                              background: '#ef4444', 
                              color: 'white', 
                              borderRadius: '50%', 
                              width: '20px', 
                              height: '20px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              border: 'none', 
                              cursor: 'pointer', 
                              fontSize: '12px',
                              fontWeight: 'bold',
                              lineHeight: 1
                            }}
                          >
                            ×
                          </button>
                          {formData.imageUrl === url && (
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(34, 197, 94, 0.9)', color: 'white', fontSize: '9px', textAlign: 'center', padding: '1px 0', fontWeight: 600 }}>
                              Principale
                            </div>
                          )}
                          {formData.imageUrl !== url && (
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, imageUrl: url }))}
                              style={{ position: 'absolute', top: '22px', left: '2px', right: '2px', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '1px 0' }}
                            >
                              Définir princ.
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* === LIENS & INFOS PRATIQUES === */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <h5 style={{ margin: '0 0 1rem 0', color: '#374151', fontSize: '0.95rem', fontWeight: 700 }}>🔗 Liens & Informations Pratiques</h5>
                <div className="form-row">
                  {formData.format !== 'physique' && (
                    <>
                      <div className="form-group">
                        <label>📱 Lien WhatsApp du groupe</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="https://chat.whatsapp.com/..."
                          value={formData.whatsappLink || ''}
                          onChange={e => setFormData({...formData, whatsappLink: e.target.value})}
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>📅 Date de début</label>
                    <input type="date" className="form-control" value={formData.startDate || ''} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>📅 Date de fin</label>
                    <input type="date" className="form-control" value={formData.endDate || ''} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>⏳ Fin des inscriptions</label>
                    <input type="date" className="form-control" value={formData.enrollmentEndDate || ''} onChange={e => setFormData({...formData, enrollmentEndDate: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>📍 Lieu (si présentiel)</label>
                    <input type="text" className="form-control" placeholder="ex: Cotonou, Bénin" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} />
                  </div>
                </div>
                </div>
              </div>

            <div className="admin-modal-footer">
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSave}>Enregistrer la formation</button>
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
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Annuler</button>
              <button className="btn btn-primary" style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(deleteConfirm)}>Oui, supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFormations;
