import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, ChevronDown, ChevronUp, Video, FileText, MoveUp, MoveDown, HelpCircle, X } from 'lucide-react';
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

  // Quiz modal state
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizLessonId, setQuizLessonId] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizFormOpen, setQuizFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState({ question: '', options: ['', ''], correctAnswer: 0 });

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

  const openQuizModal = async (lessonId) => {
    setQuizLessonId(lessonId);
    setQuizModalOpen(true);
    setQuizFormOpen(false);
    setEditingQuestion(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/quiz/${lessonId}`);
      if (res.ok) {
        const data = await res.json();
        setQuizQuestions(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({ question: '', options: ['', ''], correctAnswer: 0 });
    setQuizFormOpen(true);
  };

  const editQuestion = (q) => {
    setEditingQuestion(q);
    setQuestionForm({ question: q.question, options: [...q.options], correctAnswer: q.correctAnswer });
    setQuizFormOpen(true);
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm('Supprimer cette question ?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/quiz/question/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setQuizQuestions(prev => prev.filter(q => q.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addOption = () => {
    setQuestionForm(prev => ({ ...prev, options: [...prev.options, ''] }));
  };

  const removeOption = (idx) => {
    setQuestionForm(prev => {
      const opts = prev.options.filter((_, i) => i !== idx);
      let correct = prev.correctAnswer;
      if (correct >= opts.length) correct = opts.length - 1;
      if (correct === idx && idx < opts.length) correct = idx;
      return { ...prev, options: opts, correctAnswer: Math.max(0, correct) };
    });
  };

  const saveQuestion = async () => {
    if (!questionForm.question || questionForm.options.length < 2 || questionForm.options.some(o => !o.trim())) {
      return alert('Question et au moins 2 options requises');
    }
    try {
      const body = {
        question: questionForm.question,
        options: questionForm.options.filter(o => o.trim()),
        correctAnswer: questionForm.correctAnswer,
        orderIndex: quizQuestions.length
      };
      let res;
      if (editingQuestion) {
        res = await fetch(`${API_URL}/api/admin/quiz/question/${editingQuestion.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
      } else {
        res = await fetch(`${API_URL}/api/admin/quiz/${quizLessonId}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
      }
      if (res.ok) {
        setQuizFormOpen(false);
        setEditingQuestion(null);
        const fetchRes = await fetch(`${API_URL}/api/admin/quiz/${quizLessonId}`);
        if (fetchRes.ok) setQuizQuestions(await fetchRes.json());
      } else {
        alert('Erreur lors de l\'enregistrement');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="empty-state">Chargement du programme...</div>;

  return (
    <div className="fade-in">
      <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
        <div className="action-group">
          <button className="btn btn-outline" onClick={onBack} style={{ padding: '0.4rem 0.8rem' }}>
            <ArrowLeft size={18} /> Retour
          </button>
          <h3 style={{ margin: 0, color: 'var(--dark)' }}>Constructeur : {formationTitle}</h3>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-header">
          <h3 className="admin-panel-title">Programme de la formation</h3>
          <button className="btn btn-primary" onClick={() => openModal('module')}>
            <Plus size={18} /> Ajouter un Module
          </button>
        </div>

        {structure.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem' }}>
            Aucun module n'a été créé pour cette formation. Commencez par ajouter un module !
          </div>
        ) : (
          <div className="module-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {structure.map((mod, modIdx) => (
              <div key={mod.id} className="module-card">
                {/* MODULE HEADER */}
                <div className="module-header">
                  <div className="module-title">Module {mod.orderIndex + 1}: {mod.title}</div>
                  <div className="action-group">
                    <button className="icon-btn" title="Modifier Module" onClick={() => openModal('module', null, mod)}><Edit2 size={16} /></button>
                    <button className="icon-btn" title="Supprimer Module" onClick={() => handleDelete('module', mod.id)} style={{ color: 'var(--danger)' }}><Trash2 size={16} /></button>
                    <button className="btn btn-primary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={() => openModal('chapter', mod.id)}>
                      <Plus size={14} /> Chapitre
                    </button>
                  </div>
                </div>

                {/* CHAPTERS */}
                <div className="module-body">
                  {mod.chapters && mod.chapters.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {mod.chapters.map((chap) => (
                        <div key={chap.id} className="chapter-card">
                          <div className="chapter-header">
                            <div className="chapter-title">Chapitre {chap.orderIndex + 1}: {chap.title}</div>
                            <div className="action-group">
                              <button className="icon-btn" title="Modifier Chapitre" onClick={() => openModal('chapter', mod.id, chap)}><Edit2 size={14} /></button>
                              <button className="icon-btn" title="Supprimer Chapitre" onClick={() => handleDelete('chapter', chap.id)} style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                              <button className="btn btn-outline" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }} onClick={() => openModal('lesson', chap.id)}>
                                <Plus size={14} /> Leçon
                              </button>
                            </div>
                          </div>

                          {/* LESSONS */}
                          {chap.lessons && chap.lessons.length > 0 ? (
                            <div className="lesson-list">
                              {chap.lessons.map(lesson => (
                                <div key={lesson.id} className="lesson-item">
                                  <div className="lesson-icon">
                                    {lesson.type === 'video' ? <Video size={15} /> : <FileText size={15} />}
                                    <span>{lesson.title}</span>
                                  </div>
                                  <div className="action-group">
                                    <button className="icon-btn" onClick={() => openModal('lesson', chap.id, lesson)}><Edit2 size={14} /></button>
                                    <button className="icon-btn" style={{ color: 'var(--danger)' }} onClick={() => handleDelete('lesson', lesson.id)}><Trash2 size={14} /></button>
                                    <button className="icon-btn" style={{ color: 'var(--primary)' }} onClick={() => openQuizModal(lesson.id)} title="Gérer le quiz"><HelpCircle size={14} /></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="empty-state" style={{ textAlign: 'left', padding: '0.5rem 0 0 1rem', fontSize: '0.85rem' }}>
                              Aucune leçon dans ce chapitre.
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state" style={{ padding: '1rem' }}>
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
              <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSave}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* QUIZ MODAL */}
      {quizModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '600px' }}>
            <div className="admin-modal-header">
              <h4>Gestion du Quiz</h4>
              <button className="icon-btn" onClick={() => setQuizModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              {quizQuestions.length === 0 && !quizFormOpen && (
                <p style={{ color: '#888', fontStyle: 'italic', marginBottom: '1rem' }}>
                  Aucune question pour cette leçon.
                </p>
              )}

              {!quizFormOpen && (
                <>
                  {quizQuestions.map((q, qi) => (
                    <div key={q.id} style={{ marginBottom: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <strong style={{ fontSize: '0.9rem', color: '#0F3460' }}>Q{qi + 1}: {q.question}</strong>
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          <button className="icon-btn" onClick={() => editQuestion(q)}><Edit2 size={14} /></button>
                          <button className="icon-btn" style={{ color: '#ef4444' }} onClick={() => deleteQuestion(q.id)}><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', color: '#64748b' }}>
                        {q.options.map((opt, oi) => (
                          <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {oi === q.correctAnswer ? <span style={{ color: '#10b981' }}>✓</span> : <span style={{ color: '#94a3b8' }}>○</span>}
                            {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button className="btn btn-primary" onClick={addQuestion} style={{ marginTop: '0.5rem' }}>
                    <Plus size={16} /> Ajouter une question
                  </button>
                </>
              )}

              {quizFormOpen && (
                <div>
                  <div className="form-group">
                    <label>Question *</label>
                    <input type="text" className="form-control" value={questionForm.question}
                      onChange={e => setQuestionForm({...questionForm, question: e.target.value})}
                      placeholder="Ex: Quelle est la capitale de la France ?" />
                  </div>
                  <div className="form-group">
                    <label>Réponses possibles *</label>
                    {questionForm.options.map((opt, oi) => (
                      <div key={oi} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                        <input type="radio" name="correctAnswer" checked={questionForm.correctAnswer === oi}
                          onChange={() => setQuestionForm({...questionForm, correctAnswer: oi})} />
                        <input type="text" className="form-control"
                          value={opt}
                          onChange={e => {
                            const opts = [...questionForm.options];
                            opts[oi] = e.target.value;
                            setQuestionForm({...questionForm, options: opts});
                          }}
                          placeholder={`Option ${oi + 1}`} style={{ flex: 1 }} />
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                          {questionForm.correctAnswer === oi ? '✓ Bonne' : 'Radio = bonne'}
                        </span>
                        {questionForm.options.length > 2 && (
                          <button className="icon-btn" style={{ color: '#ef4444' }} onClick={() => removeOption(oi)}><X size={14} /></button>
                        )}
                      </div>
                    ))}
                    <button className="btn btn-outline" onClick={addOption} style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>
                      <Plus size={14} /> Ajouter une option
                    </button>
                  </div>
                  <div className="action-group" style={{ marginTop: '1rem' }}>
                    <button className="btn btn-outline" onClick={() => setQuizFormOpen(false)}>Annuler</button>
                    <button className="btn btn-primary" onClick={saveQuestion}>
                      {editingQuestion ? 'Enregistrer' : 'Ajouter la question'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourseBuilder;
