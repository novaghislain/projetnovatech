import React, { useState, useEffect } from 'react';
import { Settings, Globe, Shield, Palette, Database } from 'lucide-react';
import { API_URL } from '../../config';

const AdminParametres = () => {
  const [settings, setSettings] = useState({
    siteName: '',
    contactEmail: '',
    contactPhone: '',
    themeColor: '',
    fontFamily: '',
    registrationStatus: 'Ouvertes',
    defaultRole: 'Apprenant'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('nv_token');
      const response = await fetch(`${API_URL}/api/admin/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Erreur de récupération des paramètres");
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      console.error(err);
      setMessage({ text: "Erreur lors du chargement des paramètres", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const token = localStorage.getItem('nv_token');
      const response = await fetch(`${API_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
      if (!response.ok) throw new Error("Erreur lors de l'enregistrement des paramètres");
      setMessage({ text: "Paramètres sauvegardés avec succès !", type: 'success' });
      await fetchSettings();
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    } catch (err) {
      console.error(err);
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '5rem', textAlign: 'center', color: '#666' }}>
        Chargement des paramètres...
      </div>
    );
  }

  return (
    <div className="fade-in">
      <form onSubmit={handleSave} className="admin-panel" style={{ borderTop: '4px solid #1A1A2E' }}>
        <div className="admin-panel-header">
          <h3 className="admin-panel-title">
            <Settings size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Paramètres Généraux
          </h3>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>

        {message.text && (
          <div style={{
            padding: '1.25rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            backgroundColor: message.type === 'success' ? '#def7ec' : '#fde8e8',
            color: message.type === 'success' ? '#03543f' : '#9b1c1c',
            fontWeight: 600,
            fontSize: '0.9rem',
            border: `1px solid ${message.type === 'success' ? '#bcf0da' : '#f8b4b4'}`
          }}>
            {message.type === 'success' ? '✓' : '⚠️'} {message.text}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '0.5rem' }}>

          {/* SECTION 1: Informations Générales */}
          <div style={{
            background: '#F9FAFB',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            border: '1px solid #E5E7EB',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'rgba(139, 92, 246, 0.1)',
                color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Globe size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--dark)' }}>Informations Générales</h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#9CA3AF' }}>Nom du site, email de contact et téléphone</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
              <div style={{ background: 'white', borderRadius: '10px', padding: '0.75rem 1rem', border: '1px solid #E5E7EB' }}>
                <label style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500, display: 'block', marginBottom: '0.2rem' }}>Nom du site</label>
                <input
                  type="text"
                  value={settings.siteName || ''}
                  onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                  style={{ border: 'none', padding: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--dark)', width: '100%', outline: 'none' }}
                  required
                />
              </div>
              <div style={{ background: 'white', borderRadius: '10px', padding: '0.75rem 1rem', border: '1px solid #E5E7EB' }}>
                <label style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500, display: 'block', marginBottom: '0.2rem' }}>Email de contact</label>
                <input
                  type="email"
                  value={settings.contactEmail || ''}
                  onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
                  style={{ border: 'none', padding: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--dark)', width: '100%', outline: 'none' }}
                  required
                />
              </div>
              <div style={{ background: 'white', borderRadius: '10px', padding: '0.75rem 1rem', border: '1px solid #E5E7EB' }}>
                <label style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500, display: 'block', marginBottom: '0.2rem' }}>Téléphone</label>
                <input
                  type="text"
                  value={settings.contactPhone || ''}
                  onChange={e => setSettings({ ...settings, contactPhone: e.target.value })}
                  style={{ border: 'none', padding: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--dark)', width: '100%', outline: 'none' }}
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Apparence */}
          <div style={{
            background: '#F9FAFB',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            border: '1px solid #E5E7EB',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'rgba(139, 92, 246, 0.1)',
                color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Palette size={20} style={{ color: '#8B5CF6' }} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--dark)' }}>Apparence</h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#9CA3AF' }}>Couleurs du thème, police, mise en page</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
              <div style={{ background: 'white', borderRadius: '10px', padding: '0.75rem 1rem', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500, display: 'block', marginBottom: '0.2rem' }}>Couleur principale</label>
                  <input
                    type="text"
                    value={settings.themeColor || ''}
                    onChange={e => setSettings({ ...settings, themeColor: e.target.value })}
                    style={{ border: 'none', padding: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--dark)', outline: 'none', width: '100%' }}
                    required
                  />
                </div>
                <input
                  type="color"
                  value={settings.themeColor || '#8B5CF6'}
                  onChange={e => setSettings({ ...settings, themeColor: e.target.value })}
                  style={{ border: 'none', background: 'none', width: '32px', height: '32px', cursor: 'pointer', padding: 0 }}
                />
              </div>
              <div style={{ background: 'white', borderRadius: '10px', padding: '0.75rem 1rem', border: '1px solid #E5E7EB' }}>
                <label style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500, display: 'block', marginBottom: '0.2rem' }}>Police</label>
                <select
                  value={settings.fontFamily || 'Inter'}
                  onChange={e => setSettings({ ...settings, fontFamily: e.target.value })}
                  style={{ border: 'none', padding: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--dark)', width: '100%', outline: 'none', background: 'none', cursor: 'pointer' }}
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Outfit">Outfit</option>
                  <option value="Open Sans">Open Sans</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: Sécurité & Authentification */}
          <div style={{
            background: '#F9FAFB',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            border: '1px solid #E5E7EB',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'rgba(139, 92, 246, 0.1)',
                color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Shield size={20} style={{ color: '#10B981' }} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--dark)' }}>Sécurité & Authentification</h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#9CA3AF' }}>Inscriptions, rôles utilisateurs, permissions</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
              <div style={{ background: 'white', borderRadius: '10px', padding: '0.75rem 1rem', border: '1px solid #E5E7EB' }}>
                <label style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500, display: 'block', marginBottom: '0.2rem' }}>Inscriptions</label>
                <select
                  value={settings.registrationStatus || 'Ouvertes'}
                  onChange={e => setSettings({ ...settings, registrationStatus: e.target.value })}
                  style={{ border: 'none', padding: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--dark)', width: '100%', outline: 'none', background: 'none', cursor: 'pointer' }}
                >
                  <option value="Ouvertes">Ouvertes</option>
                  <option value="Fermées">Fermées</option>
                </select>
              </div>
              <div style={{ background: 'white', borderRadius: '10px', padding: '0.75rem 1rem', border: '1px solid #E5E7EB' }}>
                <label style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500, display: 'block', marginBottom: '0.2rem' }}>Rôle par défaut</label>
                <select
                  value={settings.defaultRole || 'Apprenant'}
                  onChange={e => setSettings({ ...settings, defaultRole: e.target.value })}
                  style={{ border: 'none', padding: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--dark)', width: '100%', outline: 'none', background: 'none', cursor: 'pointer' }}
                >
                  <option value="Apprenant">Apprenant</option>
                  <option value="Formateur">Formateur</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: Maintenance */}
          <div style={{
            background: '#F9FAFB',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            border: '1px solid #E5E7EB',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'rgba(139, 92, 246, 0.1)',
                color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Database size={20} style={{ color: '#3B82F6' }} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--dark)' }}>Maintenance</h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#9CA3AF' }}>Sauvegarde de la base de données, logs, cache</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
              <div style={{ background: 'white', borderRadius: '10px', padding: '0.75rem 1rem', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500, marginBottom: '0.2rem' }}>Base de données</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--dark)' }}>SQLite</div>
              </div>
              <div style={{ background: 'white', borderRadius: '10px', padding: '0.75rem 1rem', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500, marginBottom: '0.2rem' }}>Dernière sauvegarde</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--dark)' }}>
                  {settings.lastBackup ? new Date(settings.lastBackup).toLocaleString() : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminParametres;
