import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, ChevronDown, ChevronUp, Video, FileText, MoveUp, MoveDown } from 'lucide-react';
import { API_URL } from '../../config';

const AdminCourseBuilder = ({ formationId, formationTitle, onBack }) => {
  const [structure, setStructure] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'module', 'chapter', 'lesson'
  const [editingItem, setEditingItem] = useState(null);
  const [parentId, setParentId] = useState(null);
  const [formData, setFormData] = useState({ title: '', type: 'video', contentUrl: '', orderIndex: 0 });

  useEffect(() => {
    fetchStructure();
  }, [formationId]);

  const fetchStructure = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/courses/${formationId}/structure`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStructure(data);
    } catch (err) {
      console.error(err);
      alert('Erreur lors du chargement de la structure du cours');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, parentIdVal = null, itemToEdit = null) => {
    setModalType(type);
    setParentId(parentIdVal);
    if (itemToEdit) {
      setEditingItem(itemToEdit);
      setFormData({
        title: itemToEdit.title,
        type: itemToEdit.type || 'video',
        contentUrl: itemToEdit.contentUrl || '',
        orderIndex: itemToEdit.orderIndex || 0
      });
    } else {
      setEditingItem(null);
      setFormData({ title: '', type: 'video', contentUrl: '', orderIndex: 0 });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title) return alert('Le titre est requis');

    const isEdit = !!editingItem;
    let url = `${API_URL}/api/`;
    let bodyData = { ...formData };
    
    if (modalType === 'module') {
      url += isEdit ? `modules/${editingItem.id}` : 'modules';
      if (!isEdit) bodyData.formationId = formationId;
    } else if (modalType === 'chapter') {
      url += isEdit ? `chapters/${editingItem.id}` : 'chapters';
      if (!isEdit) bodyData.moduleId = parentId;
    } else if (modalType === 'lesson') {
      url += isEdit ? `lessons/${editingItem.id}` : 'lessons';
      if (!isEdit) bodyData.chapterId = parentId;
    }

    try {
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      if (!res.ok) throw new Error('Erreur de sauvegarde');
      
      setModalOpen(false);
      fetchStructure();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer cet élément ?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/${type}s/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      fetchStructure();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement du programme...</div>;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button className="admin-btn admin-btn-outline" onClick={onBack} style={{ padding: '0.4rem 0.8rem' }}>
          <ArrowLeft size={18} /> Retour
        </button>
        <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>Constructeur de Cours : {formationTitle}</h2>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-header">
          <h3 className="admin-panel-title">Programme de la formation</h3>
          <button className="admin-btn" onClick={() => openModal('module')}>
            <Plus size={18} /> Ajouter un Module
          </button>
        </div>

        {structure.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
            Aucun module n'a été créé pour cette formation. Commencez par ajouter un module !
          </div>
        ) : (
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {structure.map((mod, modIdx) => (
              <div key={mod.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-white)', overflow: 'hidden' }}>
                {/* MODULE HEADER */}
                <div style={{ background: 'var(--color-bg-alt)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.1rem' }}>
                    Module {mod.orderIndex + 1}: {mod.title}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="icon-btn" title="Modifier Module" onClick={() => openModal('module', null, mod)}><Edit2 size={16} /></button>
                    <button className="icon-btn" title="Supprimer Module" onClick={() => handleDelete('module', mod.id)} style={{ color: 'var(--color-alert)' }}><Trash2 size={16} /></button>
                    <button className="admin-btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={() => openModal('chapter', mod.id)}>
                      <Plus size={14} /> Chapitre
                    </button>
                  </div>
                </div>

                {/* CHAPTERS */}
                <div style={{ padding: '1rem' }}>
                  {mod.chapters && mod.chapters.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {mod.chapters.map((chap, chapIdx) => (
                        <div key={chap.id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>
                              Chapitre {chap.orderIndex + 1}: {chap.title}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="icon-btn" title="Modifier Chapitre" onClick={() => openModal('chapter', mod.id, chap)}><Edit2 size={14} /></button>
                              <button className="icon-btn" title="Supprimer Chapitre" onClick={() => handleDelete('chapter', chap.id)} style={{ color: 'var(--color-alert)' }}><Trash2 size={14} /></button>
                              <button className="admin-btn admin-btn-outline" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }} onClick={() => openModal('lesson', chap.id)}>
                                <Plus size={14} /> Leçon
                              </button>
                            </div>
                          </div>

                          {/* LESSONS */}
                          {chap.lessons && chap.lessons.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1rem', borderLeft: '2px solid var(--color-border)' }}>
                              {chap.lessons.map(lesson => (
                                <div key={lesson.id} style={{ background: '#f9f9f9', padding: '0.6rem 1rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                    {lesson.type === 'video' ? <Video size={16} color="var(--color-accent)" /> : <FileText size={16} color="var(--color-accent)" />}
                                    <span>{lesson.title}</span>
                                  </div>
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="icon-btn" style={{ padding: '0.2rem' }} onClick={() => openModal('lesson', chap.id, lesson)}><Edit2 size={14} /></button>
                                    <button className="icon-btn" style={{ padding: '0.2rem', color: 'var(--color-alert)' }} onClick={() => handleDelete('lesson', lesson.id)}><Trash2 size={14} /></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.85rem', color: '#888', fontStyle: 'italic', paddingLeft: '1rem' }}>Aucune leçon dans ce chapitre.</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.9rem', color: '#888', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>
                      Aucun chapitre dans ce module.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header">
              <h4>
                {editingItem ? 'Modifier' : 'Ajouter'} un {modalType === 'module' ? 'Module' : modalType === 'chapter' ? 'Chapitre' : 'Leçon'}
              </h4>
            </div>
            <div className="admin-modal-body">
              <div className="form-group">
                <label>Titre *</label>
                <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Titre..." />
              </div>
              
              <div className="form-group">
                <label>Ordre d'affichage (0, 1, 2...)</label>
                <input type="number" className="form-control" value={formData.orderIndex} onChange={e => setFormData({...formData, orderIndex: parseInt(e.target.value) || 0})} />
              </div>

              {modalType === 'lesson' && (
                <>
                  <div className="form-group">
                    <label>Type de contenu *</label>
                    <select className="form-control" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option value="video">Vidéo (Youtube/Vimeo)</option>
                      <option value="pdf">Document PDF (URL)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>URL du contenu *</label>
                    <input type="text" className="form-control" value={formData.contentUrl} onChange={e => setFormData({...formData, contentUrl: e.target.value})} placeholder="https://..." />
                  </div>
                </>
              )}
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-outline" onClick={() => setModalOpen(false)}>Annuler</button>
              <button className="admin-btn" onClick={handleSave}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourseBuilder;
