import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, MessageSquare, X, Edit } from 'lucide-react';
import axios from 'axios';
import { API_URL, getImageUrl } from '../../config';

const AdminContent = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [activeTab, setActiveTab] = useState('testimonials'); // 'testimonials' or 'gallery'

  // Modals
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  // Form states
  const [testimonialForm, setTestimonialForm] = useState({ authorName: '', age: '', courseName: '', comment: '', rating: 5, avatar: '', mediaUrl: '', mediaType: 'none' });
  const [galleryForm, setGalleryForm] = useState({ title: '', imageUrl: '', category: 'Classes', mediaType: 'image' });

  // Static pages states
  const [selectedSlug, setSelectedSlug] = useState('apropos');
  const [pageContent, setPageContent] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [pageLoading, setPageLoading] = useState(false);
  const [editorTab, setEditorTab] = useState('edit');

  const fetchPage = async (slug) => {
    setPageLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/public/pages/${slug}`);
      setPageContent(response.data.content);
      setPageTitle(response.data.title);
    } catch (err) {
      console.error(err);
    } finally {
      setPageLoading(false);
    }
  };

  const handleSavePage = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('nv_token');
      await axios.put(`${API_URL}/api/admin/pages/${selectedSlug}`, {
        title: pageTitle,
        content: pageContent
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert("Page mise à jour avec succès !");
    } catch (err) {
      alert("Erreur lors de la sauvegarde : " + err.message);
    }
  };

  useEffect(() => {
    if (activeTab === 'staticPages') {
      fetchPage(selectedSlug);
    }
  }, [selectedSlug, activeTab]);

  const parseMarkdown = (markdown) => {
    if (!markdown) return '';
    let html = markdown;

    // HTML escaping
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--color-accent); text-decoration: underline;">$1</a>');

    // Lists
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    // Paragraphs
    const paragraphs = html.split(/\n{2,}/);
    html = paragraphs.map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<li')) {
        return p;
      }
      return `<p style="margin-bottom: 1rem; line-height: 1.6; color: #444;">${p.replace(/\n/g, '<br/>')}</p>`;
    }).join('');

    return html;
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [testRes, galRes] = await Promise.all([
        axios.get(`${API_URL}/api/public/testimonials`),
        axios.get(`${API_URL}/api/public/gallery`)
      ]);
      setTestimonials(testRes.data);
      setGallery(galRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getHeaders = () => {
    const token = localStorage.getItem('nv_token');
    return { headers: { 'Authorization': `Bearer ${token}` } };
  };

  // Testimonials Logic
  const handleTestimonialChange = (e) => setTestimonialForm({ ...testimonialForm, [e.target.name]: e.target.value });
  const handleTestimonialSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/admin/testimonials`, testimonialForm, getHeaders());
      setShowTestimonialModal(false);
      setTestimonialForm({ authorName: '', age: '', courseName: '', comment: '', rating: 5, avatar: '', mediaUrl: '', mediaType: 'none' });
      fetchContent();
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };
  const deleteTestimonial = async (id) => {
    if (!confirm("Supprimer ce témoignage ?")) return;
    try {
      await axios.delete(`${API_URL}/api/admin/testimonials/${id}`, getHeaders());
      fetchContent();
    } catch (err) {
      alert(err.message);
    }
  };

  // Gallery Logic
  const handleGalleryChange = (e) => setGalleryForm({ ...galleryForm, [e.target.name]: e.target.value });
  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/admin/gallery`, galleryForm, getHeaders());
      setShowGalleryModal(false);
      setGalleryForm({ title: '', imageUrl: '', category: 'Classes', mediaType: 'image' });
      fetchContent();
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };
  const deleteGalleryImage = async (id) => {
    if (!confirm("Supprimer cette image ?")) return;
    try {
      await axios.delete(`${API_URL}/api/admin/gallery/${id}`, getHeaders());
      fetchContent();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fade-in">

      {/* Tabs */}
      <div className="tab-nav">
        <button
          className={`tab-btn ${activeTab === 'testimonials' ? 'active' : ''}`}
          onClick={() => setActiveTab('testimonials')}
        >
          <MessageSquare size={18} /> Témoignages
        </button>
        <button
          className={`tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          <ImageIcon size={18} /> Galerie Photos
        </button>
        <button
          className={`tab-btn ${activeTab === 'staticPages' ? 'active' : ''}`}
          onClick={() => setActiveTab('staticPages')}
        >
          <Edit size={18} /> Pages Statiques
        </button>
      </div>

      {activeTab === 'testimonials' && (
        <div className="admin-panel fade-in">
          <div className="admin-panel-header">
            <h3 className="admin-panel-title">Témoignages</h3>
            <button className="btn btn-primary" onClick={() => setShowTestimonialModal(true)}>
              <Plus size={18} /> Ajouter un Témoignage
            </button>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Auteur</th>
                  <th>Âge</th>
                  <th>Formation</th>
                  <th>Note</th>
                  <th>Commentaire</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {testimonials.length === 0 ? (
                  <tr><td colSpan="6" className="empty-state">Aucun témoignage.</td></tr>
                ) : testimonials.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.authorName}</td>
                    <td>{t.age}</td>
                    <td>{t.courseName}</td>
                    <td>{'⭐'.repeat(t.rating)}</td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.comment}</td>
                    <td>
                      <button className="btn btn-outline" style={{ color: '#e74c3c', borderColor: '#e74c3c', padding: '0.3rem 0.5rem' }} onClick={() => deleteTestimonial(t.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="admin-panel fade-in">
          <div className="admin-panel-header">
            <h3 className="admin-panel-title">Galerie Photos</h3>
            <button className="btn btn-primary" onClick={() => setShowGalleryModal(true)}>
              <Plus size={18} /> Ajouter une Image
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem', padding: '1rem' }}>
            {gallery.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>Aucune image dans la galerie.</div>
            ) : gallery.map(g => {
              const fileUrl = getImageUrl(g.imageUrl);
              const isVideo = g.mediaType === 'video' || /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(g.imageUrl);
              return (
                <div key={g.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  {isVideo ? (
                    <video src={fileUrl} muted playsInline style={{ width: '100%', height: '150px', objectFit: 'cover', backgroundColor: '#000', display: 'block' }} />
                  ) : (
                    <div style={{ height: '150px', backgroundImage: `url(${fileUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                  )}
                  <div style={{ padding: '0.75rem', backgroundColor: '#fff' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>{g.title || 'Sans titre'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{g.category}</div>
                  </div>
                  <button
                    onClick={() => deleteGalleryImage(g.id)}
                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(231, 76, 60, 0.9)', color: 'white', border: 'none', borderRadius: '4px', padding: '0.25rem', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Testimonial Modal */}
      {showTestimonialModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="admin-modal-header">
              <h4>Nouveau Témoignage</h4>
              <button className="icon-btn" onClick={() => setShowTestimonialModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleTestimonialSubmit}>
              <div className="admin-modal-body">
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Prénom / Nom *</label>
                    <input type="text" name="authorName" className="form-control" required onChange={handleTestimonialChange} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Âge (ex: 12 ans)</label>
                    <input type="text" name="age" className="form-control" onChange={handleTestimonialChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Formation suivie *</label>
                  <input type="text" name="courseName" className="form-control" required onChange={handleTestimonialChange} />
                </div>

                <div className="form-group">
                  <label>Photo de profil / Avatar (Optionnel)</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.25rem' }}>
                    {testimonialForm.avatar && (
                      <div style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #ddd', flexShrink: 0 }}>
                        <img
                          src={getImageUrl(testimonialForm.avatar)}
                          alt="Avatar preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control"
                        style={{ marginBottom: 0 }}
                        onChange={async (e) => {
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
                            const data = await res.json();
                            if (data.imageUrl) {
                              setTestimonialForm(f => ({ ...f, avatar: data.imageUrl }));
                            }
                          } catch (err) {
                            alert("Erreur lors de l'upload de l'avatar");
                          }
                        }}
                      />
                    </div>
                    {testimonialForm.avatar && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ color: '#e74c3c', borderColor: '#e74c3c', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                        onClick={() => setTestimonialForm(f => ({ ...f, avatar: '' }))}
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label>Média du témoignage (Photo ou Vidéo)</label>
                  <input type="file" accept="image/*,video/*" className="form-control" onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const isVideo = file.type.startsWith('video/');
                    const formData = new FormData();
                    formData.append('image', file); // Multer uses 'image' key
                    try {
                      const token = localStorage.getItem('nv_token');
                      const res = await fetch(`${API_URL}/api/upload`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: formData
                      });
                      const data = await res.json();
                      if (data.imageUrl) {
                        setTestimonialForm(f => ({ ...f, mediaUrl: data.imageUrl, mediaType: isVideo ? 'video' : 'image' }));
                      }
                    } catch (err) {
                      alert("Erreur lors de l'upload du média");
                    }
                  }} />
                  {testimonialForm.mediaUrl && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'green' }}>
                      Média téléchargé avec succès ({testimonialForm.mediaType})
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Note (sur 5) *</label>
                  <input type="number" name="rating" className="form-control" min="1" max="5" required onChange={handleTestimonialChange} value={testimonialForm.rating} />
                </div>

                <div className="form-group">
                  <label>Commentaire *</label>
                  <textarea name="comment" className="form-control" rows="4" required onChange={handleTestimonialChange}></textarea>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowTestimonialModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer le témoignage</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGalleryModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="admin-modal-header">
              <h4>Nouvelle Image</h4>
              <button className="icon-btn" onClick={() => setShowGalleryModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleGallerySubmit}>
              <div className="admin-modal-body">
                <div className="form-group">
                  <label>Titre (Optionnel)</label>
                  <input type="text" name="title" className="form-control" onChange={handleGalleryChange} />
                </div>

                <div className="form-group">
                  <label>Fichier Média * (Photo ou Vidéo)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="form-control"
                      required={!galleryForm.imageUrl}
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const isVideo = file.type.startsWith('video/');
                        const formData = new FormData();
                        formData.append('image', file); // Multer expects 'image'
                        try {
                          const token = localStorage.getItem('nv_token');
                          const res = await fetch(`${API_URL}/api/upload`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` },
                            body: formData
                          });
                          const data = await res.json();
                          if (data.imageUrl) {
                            setGalleryForm(f => ({ ...f, imageUrl: data.imageUrl, mediaType: isVideo ? 'video' : 'image' }));
                          }
                        } catch (err) {
                          alert("Erreur lors de l'upload du fichier");
                        }
                      }}
                    />
                    {galleryForm.imageUrl && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd', flexShrink: 0 }}>
                          {galleryForm.mediaType === 'video' ? (
                            <video
                              src={getImageUrl(galleryForm.imageUrl)}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              muted
                            />
                          ) : (
                            <img
                              src={getImageUrl(galleryForm.imageUrl)}
                              alt="Aperçu"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          )}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#22c55e', fontWeight: 600 }}>
                          Fichier téléchargé avec succès ({galleryForm.mediaType})
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Catégorie *</label>
                  <select name="category" className="form-control" onChange={handleGalleryChange} value={galleryForm.category}>
                    <option value="Classes">Classes</option>
                    <option value="Événements">Événements</option>
                    <option value="Ateliers">Ateliers</option>
                    <option value="Projets">Projets</option>
                  </select>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowGalleryModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Ajouter l'image</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pages Statiques Tab */}
      {activeTab === 'staticPages' && (
        <div className="admin-panel fade-in">
          <div className="admin-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <h3 className="admin-panel-title" style={{ margin: 0 }}>Gestion des Pages Statiques</h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <select
                className="form-control"
                style={{ width: '250px', marginBottom: 0, padding: '0.5rem' }}
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
              >
                <option value="apropos">À Propos</option>
                <option value="faq">FAQ</option>
                <option value="conditions">Conditions d'utilisation</option>
                <option value="politique">Politique de confidentialité</option>
              </select>
            </div>
          </div>

          {pageLoading ? (
            <div className="empty-state" style={{ padding: '3rem' }}>Chargement du contenu...</div>
          ) : (
            <form onSubmit={handleSavePage} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group">
                <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Titre de la Page</label>
                <input
                  type="text"
                  className="form-control"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  required
                  style={{ maxWidth: '400px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div className="tab-nav" style={{ borderBottom: '1px solid var(--gray)', paddingBottom: 0, marginBottom: '1rem' }}>
                  <button
                    type="button"
                    className={`tab-btn ${editorTab === 'edit' ? 'active' : ''}`}
                    onClick={() => setEditorTab('edit')}
                    style={{ borderBottom: 'none', borderRadius: 0 }}
                  >
                    Éditeur Markdown
                  </button>
                  <button
                    type="button"
                    className={`tab-btn ${editorTab === 'preview' ? 'active' : ''}`}
                    onClick={() => setEditorTab('preview')}
                    style={{ borderBottom: 'none', borderRadius: 0 }}
                  >
                    Aperçu HTML
                  </button>
                </div>

                {editorTab === 'edit' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', minHeight: '400px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem', fontWeight: 600 }}>Markdown</span>
                      <textarea
                        className="form-control"
                        style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.9rem', padding: '1rem', lineHeight: '1.5', resize: 'vertical', minHeight: '350px' }}
                        value={pageContent}
                        onChange={(e) => setPageContent(e.target.value)}
                        placeholder="Écrivez votre contenu en Markdown ici..."
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem', fontWeight: 600 }}>Aperçu en direct</span>
                      <div
                        style={{
                          flex: 1,
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          padding: '1rem',
                          backgroundColor: '#f9f9f9',
                          overflowY: 'auto',
                          maxHeight: '400px',
                          minHeight: '350px'
                        }}
                        dangerouslySetInnerHTML={{ __html: parseMarkdown(pageContent) }}
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '2rem',
                      backgroundColor: '#fff',
                      minHeight: '400px',
                      maxHeight: '600px',
                      overflowY: 'auto'
                    }}
                    className="markdown-body"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(pageContent) }}
                  />
                )}
              </div>

              <div className="action-group" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary">
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminContent;
