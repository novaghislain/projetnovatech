import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, MessageSquare, X } from 'lucide-react';
import axios from 'axios';

const AdminContent = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [activeTab, setActiveTab] = useState('testimonials'); // 'testimonials' or 'gallery'

  // Modals
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  // Form states
  const [testimonialForm, setTestimonialForm] = useState({ authorName: '', age: '', courseName: '', comment: '', rating: 5, avatar: '' });
  const [galleryForm, setGalleryForm] = useState({ title: '', imageUrl: '', category: 'Classes' });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [testRes, galRes] = await Promise.all([
        axios.get('http://localhost:5001/api/public/testimonials'),
        axios.get('http://localhost:5001/api/public/gallery')
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
      await axios.post('http://localhost:5001/api/admin/testimonials', testimonialForm, getHeaders());
      setShowTestimonialModal(false);
      setTestimonialForm({ authorName: '', age: '', courseName: '', comment: '', rating: 5, avatar: '' });
      fetchContent();
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };
  const deleteTestimonial = async (id) => {
    if (!confirm("Supprimer ce témoignage ?")) return;
    try {
      await axios.delete(`http://localhost:5001/api/admin/testimonials/${id}`, getHeaders());
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
      await axios.post('http://localhost:5001/api/admin/gallery', galleryForm, getHeaders());
      setShowGalleryModal(false);
      setGalleryForm({ title: '', imageUrl: '', category: 'Classes' });
      fetchContent();
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };
  const deleteGalleryImage = async (id) => {
    if (!confirm("Supprimer cette image ?")) return;
    try {
      await axios.delete(`http://localhost:5001/api/admin/gallery/${id}`, getHeaders());
      fetchContent();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fade-in">
      
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`admin-btn ${activeTab === 'testimonials' ? '' : 'admin-btn-outline'}`}
          onClick={() => setActiveTab('testimonials')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <MessageSquare size={18} /> Témoignages
        </button>
        <button 
          className={`admin-btn ${activeTab === 'gallery' ? '' : 'admin-btn-outline'}`}
          onClick={() => setActiveTab('gallery')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ImageIcon size={18} /> Galerie Photos
        </button>
      </div>

      {activeTab === 'testimonials' && (
        <div className="admin-panel fade-in">
          <div className="admin-panel-header">
            <h3 className="admin-panel-title">Témoignages</h3>
            <button className="admin-btn" onClick={() => setShowTestimonialModal(true)}>
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
                  <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>Aucun témoignage.</td></tr>
                ) : testimonials.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.authorName}</td>
                    <td>{t.age}</td>
                    <td>{t.courseName}</td>
                    <td>{'⭐'.repeat(t.rating)}</td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.comment}</td>
                    <td>
                      <button className="admin-btn admin-btn-outline" style={{ color: '#e74c3c', borderColor: '#e74c3c', padding: '0.3rem 0.5rem' }} onClick={() => deleteTestimonial(t.id)}>
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
            <button className="admin-btn" onClick={() => setShowGalleryModal(true)}>
              <Plus size={18} /> Ajouter une Image
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem', padding: '1rem' }}>
            {gallery.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>Aucune image dans la galerie.</div>
            ) : gallery.map(g => (
              <div key={g.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ height: '150px', backgroundImage: `url(${g.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
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
            ))}
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
                  <label>Avatar URL (Optionnel)</label>
                  <input type="text" name="avatar" className="form-control" placeholder="/2x.png" onChange={handleTestimonialChange} />
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
              
              <div className="admin-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowTestimonialModal(false)}>Annuler</button>
                <button type="submit" className="admin-btn admin-btn-primary">Enregistrer le témoignage</button>
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
                  <label>URL de l'image *</label>
                  <input type="url" name="imageUrl" className="form-control" required onChange={handleGalleryChange} placeholder="https://..." />
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
              
              <div className="admin-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowGalleryModal(false)}>Annuler</button>
                <button type="submit" className="admin-btn admin-btn-primary">Ajouter l'image</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminContent;
