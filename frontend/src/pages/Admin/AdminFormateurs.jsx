import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, User, Mail, Phone, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { API_URL, getImageUrl } from '../../config';

const specialites = [
  'Développement Web', 'Intelligence Artificielle', 'Bureautique',
  'Robotique', 'Cybersécurité', 'Design Graphique', 'Autre'
];

const emptyForm = {
  nom: '', prenom: '', email: '', telephone: '',
  specialite: specialites[0], bio: '', photo: '', status: 'actif',
  password: ''
};

const AdminFormateurs = () => {
  const [formateurs, setFormateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const token = localStorage.getItem('nv_token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetchFormateurs(); }, []);

  const fetchFormateurs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/formateurs`, { headers });
      if (res.ok) setFormateurs(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const validate = () => {
    const e = {};
    if (!formData.nom.trim()) e.nom = 'Le nom est requis.';
    if (!formData.prenom.trim()) e.prenom = 'Le prénom est requis.';
    if (!formData.email || !formData.email.trim()) {
      e.email = 'L\'adresse email est requise.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = 'Email invalide.';
    }
    if (!formData.id && (!formData.password || formData.password.trim().length < 6)) {
      e.password = 'Le mot de passe doit contenir au moins 6 caractères.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleOpen = (f = null) => {
    setFormData(f ? { ...f, password: '' } : { ...emptyForm });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const method = formData.id ? 'PUT' : 'POST';
      const url = formData.id
        ? `${API_URL}/api/admin/formateurs/${formData.id}`
        : `${API_URL}/api/admin/formateurs`;
      const res = await fetch(url, { method, headers, body: JSON.stringify(formData) });
      if (!res.ok) throw new Error("Erreur lors de l'enregistrement");
      await fetchFormateurs();
      setIsModalOpen(false);
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/formateurs/${id}`, {
        method: 'DELETE', headers
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      await fetchFormateurs();
      setDeleteConfirm(null);
    } catch (err) { alert(err.message); }
  };

  const handleToggleStatus = async (f) => {
    const newStatus = f.status === 'actif' ? 'inactif' : 'actif';
    try {
      await fetch(`${API_URL}/api/admin/formateurs/${f.id}`, {
        method: 'PUT', headers, body: JSON.stringify({ ...f, status: newStatus })
      });
      await fetchFormateurs();
    } catch (err) { alert(err.message); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formDataObj = new FormData();
    formDataObj.append('image', file);
    
    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataObj
      });
      if (res.ok) {
        const data = await res.json();
        setFormData({...formData, photo: data.imageUrl});
      } else {
        alert("Erreur lors de l'upload de l'image.");
      }
    } catch (err) {
      alert("Erreur réseau.");
    }
  };

  return (
    <div className="fade-in">
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h3 className="admin-panel-title">Équipe des Formateurs</h3>
          <button className="btn btn-primary" onClick={() => handleOpen()}>
            <Plus size={18} /> Ajouter un Formateur
          </button>
        </div>

        {loading ? (
          <div className="empty-state">Chargement...</div>
        ) : (
          <div className="module-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {formateurs.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1/-1', background: 'var(--background)', borderRadius: '12px' }}>
                Aucun formateur enregistré. Ajoutez-en un !
              </div>
            ) : formateurs.map(f => (
              <div key={f.id} className="admin-panel" style={{
                padding: '1.5rem',
                marginBottom: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}>
                {/* Avatar + Nom */}
                <div className="action-group">
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: '1.3rem', overflow: 'hidden', flexShrink: 0
                  }}>
                    {f.photo
                      ? <img src={getImageUrl(f.photo)} alt={f.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                      : `${f.prenom.charAt(0)}${f.nom.charAt(0)}`
                    }
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--dark)' }}>
                      {f.prenom} {f.nom}
                    </div>
                    <div className={`admin-badge ${f.status === 'actif' ? 'success' : 'danger'}`} style={{ marginTop: '0.2rem' }}>
                      ● {f.status === 'actif' ? 'Actif' : 'Inactif'}
                    </div>
                  </div>
                </div>

                {/* Spécialité */}
                <div className="lesson-icon" style={{ fontSize: '0.9rem' }}>
                  <BookOpen size={15} />
                  <span>{f.specialite || 'Non définie'}</span>
                </div>

                {/* Infos contact */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem', color: '#6B7280' }}>
                  {f.email && <div className="lesson-icon" style={{ fontSize: '0.85rem' }}><Mail size={14} /> {f.email}</div>}
                  {f.telephone && <div className="lesson-icon" style={{ fontSize: '0.85rem' }}><Phone size={14} /> {f.telephone}</div>}
                </div>

                {/* Bio */}
                {f.bio && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.5, margin: 0, borderTop: '1px solid var(--gray)', paddingTop: '0.75rem' }}>
                    {f.bio.length > 120 ? f.bio.slice(0, 120) + '…' : f.bio}
                  </p>
                )}

                {/* Actions */}
                <div className="action-group" style={{ borderTop: '1px solid var(--gray)', paddingTop: '0.75rem' }}>
                  <button
                    onClick={() => handleToggleStatus(f)}
                    className="btn btn-outline"
                    style={{
                      flex: 1, fontSize: '0.8rem',
                      borderColor: f.status === 'actif' ? 'var(--danger)' : '#86efac',
                      color: f.status === 'actif' ? 'var(--danger)' : '#16a34a',
                    }}
                  >
                    {f.status === 'actif' ? <XCircle size={14} /> : <CheckCircle size={14} />}
                    {f.status === 'actif' ? 'Désactiver' : 'Activer'}
                  </button>
                  <button onClick={() => handleOpen(f)} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem' }} title="Modifier">
                    <Edit size={15} />
                  </button>
                  <button onClick={() => setDeleteConfirm(f.id)} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} title="Supprimer">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL FORMULAIRE */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="admin-modal-header">
              <h4>{formData.id ? 'Modifier le formateur' : 'Nouveau Formateur'}</h4>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">

              <div className="form-row">
                <div className="form-group">
                  <label>Prénom *</label>
                  <input
                    type="text" className="form-control"
                    value={formData.prenom}
                    onChange={e => setFormData({ ...formData, prenom: e.target.value })}
                    placeholder="Ex: Marie"
                  />
                  {errors.prenom && <div style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '4px' }}>{errors.prenom}</div>}
                </div>
                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text" className="form-control"
                    value={formData.nom}
                    onChange={e => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="Ex: Ahouandjinou"
                  />
                  {errors.nom && <div style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '4px' }}>{errors.nom}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email" className="form-control"
                    value={formData.email || ''}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="formateur@novatech.com"
                  />
                  {errors.email && <div style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '4px' }}>{errors.email}</div>}
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="text" className="form-control"
                    value={formData.telephone || ''}
                    onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                    placeholder="+229 01 XX XX XX XX"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  {!formData.id ? 'Mot de passe de connexion *' : 'Nouveau mot de passe de connexion (laisser vide pour ne pas modifier)'}
                </label>
                <input
                  type="password" className="form-control"
                  value={formData.password || ''}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder={!formData.id ? "Min. 6 caractères (ex: password123)" : "Entrez un nouveau mot de passe pour réinitialiser"}
                />
                {errors.password && <div style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '4px' }}>{errors.password}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Spécialité</label>
                  <select
                    className="form-control"
                    value={formData.specialite || specialites[0]}
                    onChange={e => setFormData({ ...formData, specialite: e.target.value })}
                  >
                    {specialites.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Statut</label>
                  <select
                    className="form-control"
                    value={formData.status || 'actif'}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Photo (URL ou Fichier)</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input
                    type="text" className="form-control"
                    value={formData.photo || ''}
                    onChange={e => setFormData({ ...formData, photo: e.target.value })}
                    placeholder="https://... ou /photo.jpg"
                  />
                  <button className="btn btn-outline" onClick={() => document.getElementById('formateurImageUpload').click()} type="button">Uploader</button>
                  <input type="file" id="formateurImageUpload" style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} />
                </div>
              </div>

              <div className="form-group">
                <label>Biographie</label>
                <textarea
                  className="form-control" rows="4"
                  value={formData.bio || ''}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Décrivez le parcours et l'expertise du formateur..."
                />
              </div>

            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Enregistrement...' : (formData.id ? 'Mettre à jour' : 'Ajouter')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SUPPRESSION */}
      {deleteConfirm && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '420px' }}>
            <div className="admin-modal-header">
              <h4>Confirmer la suppression</h4>
              <button className="icon-btn" onClick={() => setDeleteConfirm(null)}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              <p>Cette action est <strong>irréversible</strong>. Le formateur sera définitivement supprimé.</p>
            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Annuler</button>
              <button className="btn btn-primary" style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(deleteConfirm)}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFormateurs;
