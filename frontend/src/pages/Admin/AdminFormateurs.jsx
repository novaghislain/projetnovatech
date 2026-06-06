import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, User, Mail, Phone, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { API_URL } from '../../config';

const specialites = [
  'Développement Web', 'Intelligence Artificielle', 'Bureautique',
  'Robotique', 'Cybersécurité', 'Design Graphique', 'Autre'
];

const emptyForm = {
  nom: '', prenom: '', email: '', telephone: '',
  specialite: specialites[0], bio: '', photo: '', status: 'actif'
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
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Email invalide.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleOpen = (f = null) => {
    setFormData(f ? { ...f } : { ...emptyForm });
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

  return (
    <div className="fade-in">
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h3 className="admin-panel-title">Équipe des Formateurs</h3>
          <button className="admin-btn" onClick={() => handleOpen()}>
            <Plus size={18} /> Ajouter un Formateur
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>Chargement...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', padding: '1rem 0' }}>
            {formateurs.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#888', background: '#f9f9fb', borderRadius: '12px' }}>
                Aucun formateur enregistré. Ajoutez-en un !
              </div>
            ) : formateurs.map(f => (
              <div key={f.id} style={{
                background: '#fff',
                borderRadius: '16px',
                border: '1px solid #e8ecf0',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                transition: 'box-shadow 0.2s',
              }}>
                {/* Avatar + Nom */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1A1A2E, #4285f4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: '1.3rem', overflow: 'hidden', flexShrink: 0
                  }}>
                    {f.photo
                      ? <img src={f.photo} alt={f.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                      : `${f.prenom.charAt(0)}${f.nom.charAt(0)}`
                    }
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1a1a2e' }}>
                      {f.prenom} {f.nom}
                    </div>
                    <div style={{
                      display: 'inline-block', padding: '0.2rem 0.7rem',
                      borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600,
                      background: f.status === 'actif' ? '#dcfce7' : '#fee2e2',
                      color: f.status === 'actif' ? '#15803d' : '#dc2626',
                      marginTop: '0.2rem'
                    }}>
                      {f.status === 'actif' ? '● Actif' : '● Inactif'}
                    </div>
                  </div>
                </div>

                {/* Spécialité */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4285f4', fontWeight: 600, fontSize: '0.9rem' }}>
                  <BookOpen size={15} />
                  <span>{f.specialite || 'Non définie'}</span>
                </div>

                {/* Infos contact */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem', color: '#666' }}>
                  {f.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={14} /> {f.email}
                    </div>
                  )}
                  {f.telephone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={14} /> {f.telephone}
                    </div>
                  )}
                </div>

                {/* Bio */}
                {f.bio && (
                  <p style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.5, margin: 0, borderTop: '1px solid #f0f0f0', paddingTop: '0.75rem' }}>
                    {f.bio.length > 120 ? f.bio.slice(0, 120) + '…' : f.bio}
                  </p>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f0f0f0', paddingTop: '0.75rem' }}>
                  <button
                    onClick={() => handleToggleStatus(f)}
                    style={{
                      flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid',
                      cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                      background: f.status === 'actif' ? '#fff' : '#f0fdf4',
                      borderColor: f.status === 'actif' ? '#fca5a5' : '#86efac',
                      color: f.status === 'actif' ? '#dc2626' : '#16a34a',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem'
                    }}
                  >
                    {f.status === 'actif' ? <XCircle size={14} /> : <CheckCircle size={14} />}
                    {f.status === 'actif' ? 'Désactiver' : 'Activer'}
                  </button>
                  <button
                    onClick={() => handleOpen(f)}
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', color: '#555' }}
                    title="Modifier"
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(f.id)}
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fff7f7', cursor: 'pointer', color: '#dc2626' }}
                    title="Supprimer"
                  >
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
                  <label>Email</label>
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
                <label>Photo (URL)</label>
                <input
                  type="text" className="form-control"
                  value={formData.photo || ''}
                  onChange={e => setFormData({ ...formData, photo: e.target.value })}
                  placeholder="https://... ou /photo.jpg"
                />
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
              <button className="admin-btn admin-btn-outline" onClick={() => setIsModalOpen(false)}>Annuler</button>
              <button className="admin-btn" onClick={handleSave} disabled={saving}>
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
              <button className="admin-btn admin-btn-outline" onClick={() => setDeleteConfirm(null)}>Annuler</button>
              <button className="admin-btn" style={{ background: '#dc2626', borderColor: '#dc2626' }} onClick={() => handleDelete(deleteConfirm)}>
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
