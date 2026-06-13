/**
 * AdminMetaPixel.jsx — Interface d'administration Meta Pixel
 *
 * Permet à l'administrateur de :
 * - Activer/désactiver le Pixel
 * - Configurer l'ID Pixel
 * - Gérer les événements personnalisés
 * - Tester la connexion Pixel
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  ToggleLeft,
  ToggleRight,
  Save,
  Trash2,
  Edit2,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { API_URL } from '../../config';

const AdminMetaPixel = () => {
  const [pixelId, setPixelId] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [customEvents, setCustomEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  // Formulaire événement
  const [showEventForm, setShowEventForm] = useState(false);
  const [editEventId, setEditEventId] = useState(null);
  const [eventForm, setEventForm] = useState({
    eventName: '',
    cssSelector: '',
    actionType: 'click'
  });

  const showMessage = useCallback((text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  }, []);

  // Charger la configuration
  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('nv_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const res = await fetch(`${API_URL}/api/admin/meta-pixel`, { headers });
      if (res.ok) {
        const data = await res.json();
        setPixelId(data.pixelId || '');
        setIsActive(!!data.isActive);
        setUpdatedAt(data.updatedAt || null);
      }

      const eventsRes = await fetch(`${API_URL}/api/admin/meta-pixel/events`, { headers });
      if (eventsRes.ok) {
        setCustomEvents(await eventsRes.json());
      }
    } catch (err) {
      showMessage('Erreur lors du chargement de la configuration.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async () => {
    const finalActive = isActive && pixelId.trim().length > 0;

    if (isActive && !pixelId.trim()) {
      showMessage('Veuillez saisir un ID Meta Pixel avant d\'activer.', 'error');
      return;
    }

    if (pixelId.trim() && !/^\d{15,16}$/.test(pixelId.trim())) {
      showMessage("L'ID Meta Pixel doit contenir 15 à 16 chiffres.", 'error');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('nv_token');
      const res = await fetch(`${API_URL}/api/admin/meta-pixel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pixelId: pixelId.trim(), isActive: finalActive })
      });

      const data = await res.json();
      if (res.ok) {
        setIsActive(finalActive);
        showMessage(data.message || 'Configuration sauvegardée !');
        setUpdatedAt(new Date().toISOString());
      } else {
        showMessage(data.error || 'Erreur lors de la sauvegarde.', 'error');
      }
    } catch (err) {
      showMessage('Erreur réseau.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const token = localStorage.getItem('nv_token');
      const res = await fetch(`${API_URL}/api/admin/meta-pixel/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({ success: false, message: 'Erreur lors du test.' });
    } finally {
      setTesting(false);
    }
  };

  const handleAddEvent = async () => {
    if (!eventForm.eventName.trim() || !eventForm.cssSelector.trim()) {
      showMessage('Le nom et le sélecteur CSS sont requis.', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('nv_token');
      const isEdit = editEventId !== null;
      const url = isEdit
        ? `${API_URL}/api/admin/meta-pixel/events/${editEventId}`
        : `${API_URL}/api/admin/meta-pixel/events`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventForm)
      });

      if (res.ok) {
        showMessage(isEdit ? 'Événement mis à jour.' : 'Événement ajouté.');
        setShowEventForm(false);
        setEditEventId(null);
        setEventForm({ eventName: '', cssSelector: '', actionType: 'click' });

        const eventsRes = await fetch(`${API_URL}/api/admin/meta-pixel/events`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (eventsRes.ok) setCustomEvents(await eventsRes.json());
      } else {
        const data = await res.json();
        showMessage(data.error || 'Erreur.', 'error');
      }
    } catch (err) {
      showMessage('Erreur réseau.', 'error');
    }
  };

  const handleEditEvent = (event) => {
    setEditEventId(event.id);
    setEventForm({
      eventName: event.eventName,
      cssSelector: event.cssSelector,
      actionType: event.actionType
    });
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Supprimer cet événement personnalisé ?')) return;

    try {
      const token = localStorage.getItem('nv_token');
      const res = await fetch(`${API_URL}/api/admin/meta-pixel/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        showMessage('Événement supprimé.');
        setCustomEvents(prev => prev.filter(ev => ev.id !== id));
      } else {
        showMessage('Erreur lors de la suppression.', 'error');
      }
    } catch (err) {
      showMessage('Erreur réseau.', 'error');
    }
  };

  const cancelEventForm = () => {
    setShowEventForm(false);
    setEditEventId(null);
    setEventForm({ eventName: '', cssSelector: '', actionType: 'click' });
  };

  const autoEvents = [
    { name: 'PageView', description: 'Sur chaque chargement de page publique', active: true },
    { name: 'Lead', description: 'Soumission formulaire contact / devis / inscription', active: true },
    { name: 'CompleteRegistration', description: "Création d'un compte utilisateur", active: true },
    { name: 'Purchase', description: 'Validation d\'un paiement', active: true },
  ];

  if (loading) {
    return (
      <div className="fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <RefreshCw size={32} style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* ── Message de confirmation ── */}
      {message && (
        <div className={`notif-bar ${message.type === 'error' ? 'error' : 'success'}`}>
          {message.type === 'error' ? <XCircle size={20} /> : <CheckCircle size={20} />}
          {message.text}
        </div>
      )}

      {/* ── Header ── */}
      <div className="admin-panel" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ margin: '0 0 0.3rem 0', fontSize: '1.4rem', color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <BarChart3 size={26} /> Meta Pixel
            </h2>
            <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9rem' }}>
              Configurez et gérez le suivi Meta Pixel (Facebook) sans modifier le code source.
            </p>
          </div>
          <div className="admin-badge" style={{
            background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(107, 114, 128, 0.12)',
            color: isActive ? '#059669' : '#6B7280',
          }}>
            <div className={`status-dot ${isActive ? 'active' : 'inactive'}`} style={{ marginRight: '0.3rem' }} />
            {isActive ? 'Pixel Actif' : 'Pixel Inactif'}
          </div>
        </div>
      </div>

      {/* ── Section : Paramètres Pixel ── */}
      <div className="admin-panel" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-panel-header">
          <h3 className="admin-panel-title" style={{ margin: 0 }}>Paramètres du Pixel</h3>
          {updatedAt && (
            <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
              Dernière modif : {new Date(updatedAt).toLocaleString('fr-FR')}
            </span>
          )}
        </div>
        <div style={{ padding: '1.5rem' }}>
          {/* Toggle */}
          <div className="admin-panel" style={{
            marginBottom: '1.5rem', padding: '1rem', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--dark)', marginBottom: '0.2rem' }}>Activer le Pixel</div>
              <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                Injecte le script Meta Pixel sur toutes les pages publiques
              </div>
              {!pixelId.trim() && isActive && (
                <div style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <AlertCircle size={12} /> Veuillez d'abord saisir un ID Pixel
                </div>
              )}
            </div>
            <button
              onClick={() => {
                if (!pixelId.trim()) {
                  showMessage('Veuillez d\'abord saisir un ID Pixel.', 'error');
                  return;
                }
                setIsActive(!isActive);
              }}
              className={`toggle-btn ${isActive ? 'on' : !pixelId.trim() ? 'disabled' : 'off'}`}
              title={!pixelId.trim() ? 'Ajoutez un ID Pixel d\'abord' : (isActive ? 'Désactiver' : 'Activer')}
            >
              {isActive ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
            </button>
          </div>

          {/* ID Pixel */}
          <div className="form-group">
            <label className="form-label">ID Meta Pixel</label>
            <input
              type="text"
              className="form-control"
              value={pixelId}
              onChange={(e) => setPixelId(e.target.value)}
              placeholder="Ex: 123456789012345"
              style={{ fontFamily: 'monospace' }}
            />
            <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: '0.3rem' }}>
              ID à 15-16 chiffres trouvé dans le gestionnaire d'événements Meta (facebook.com/events)
            </div>
          </div>

          {/* Boutons */}
          <div className="action-group" style={{ marginTop: '1.5rem' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary"
            >
              <Save size={18} />
              {saving ? 'Sauvegarde...' : 'Enregistrer'}
            </button>
            <button
              onClick={handleTest}
              disabled={testing}
              className="btn btn-outline"
            >
              {testing ? <RefreshCw size={18} className="spin" /> : <BarChart3 size={18} />}
              {testing ? 'Test en cours...' : 'Tester la connexion'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Résultat du test ── */}
      {testResult && (
        <div className="admin-panel" style={{
          marginBottom: '1.5rem',
          borderLeft: `4px solid ${testResult.success ? '#10B981' : '#EF4444'}`
        }}>
          <div style={{ padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
            {testResult.success ? (
              <CheckCircle size={22} style={{ color: '#10B981', flexShrink: 0, marginTop: '0.1rem' }} />
            ) : (
              <AlertCircle size={22} style={{ color: '#EF4444', flexShrink: 0, marginTop: '0.1rem' }} />
            )}
            <div>
              <div style={{ fontWeight: 600, color: testResult.success ? '#10B981' : '#EF4444', marginBottom: '0.2rem' }}>
                {testResult.success ? 'Test réussi' : 'Échec du test'}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>{testResult.message}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Section : Événements automatiques ── */}
      <div className="admin-panel" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-panel-header">
          <h3 className="admin-panel-title" style={{ margin: 0 }}>Événements automatiques</h3>
        </div>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Événement</th>
                <th>Déclencheur</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {autoEvents.map((ev, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: 'var(--dark)' }}>{ev.name}</td>
                  <td style={{ color: '#6B7280', fontSize: '0.9rem' }}>{ev.description}</td>
                  <td>
                    <span className="admin-badge success" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
                      <CheckCircle size={12} /> Automatique
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section : Événements personnalisés ── */}
      <div className="admin-panel" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-panel-header" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 className="admin-panel-title" style={{ margin: 0 }}>Événements personnalisés</h3>
          {!showEventForm && (
            <button className="btn btn-primary" onClick={() => { setShowEventForm(true); setEditEventId(null); setEventForm({ eventName: '', cssSelector: '', actionType: 'click' }); }}>
              <Plus size={16} /> Ajouter
            </button>
          )}
        </div>

        {/* Formulaire d'ajout / édition */}
        {showEventForm && (
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--gray)', background: 'var(--background)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nom de l'événement</label>
                <input
                  type="text"
                  className="form-control"
                  value={eventForm.eventName}
                  onChange={(e) => setEventForm({ ...eventForm, eventName: e.target.value })}
                  placeholder="Ex: ContactWhatsApp"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Sélecteur CSS</label>
                <input
                  type="text"
                  className="form-control"
                  value={eventForm.cssSelector}
                  onChange={(e) => setEventForm({ ...eventForm, cssSelector: e.target.value })}
                  placeholder="Ex: .whatsapp-btn, #call-btn"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Type d'action</label>
                <select
                  className="form-control"
                  value={eventForm.actionType}
                  onChange={(e) => setEventForm({ ...eventForm, actionType: e.target.value })}
                >
                  <option value="click">Clic</option>
                  <option value="submit">Soumission</option>
                  <option value="load">Chargement</option>
                </select>
              </div>
            </div>
            <div className="action-group">
              <button className="btn btn-primary" onClick={handleAddEvent}>
                <Save size={16} />
                {editEventId ? 'Mettre à jour' : 'Ajouter'}
              </button>
              <button className="btn btn-outline" onClick={cancelEventForm}>
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Liste des événements */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Événement</th>
                <th>Sélecteur CSS</th>
                <th>Action</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customEvents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    Aucun événement personnalisé. Cliquez sur "Ajouter" pour en créer un.
                  </td>
                </tr>
              ) : (
                customEvents.map(ev => (
                  <tr key={ev.id}>
                    <td style={{ fontWeight: 600, color: 'var(--dark)' }}>{ev.eventName}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#6B7280' }}>{ev.cssSelector}</td>
                    <td>
                      <span className="info-chip" style={{
                        background: ev.actionType === 'click' ? 'rgba(59, 130, 246, 0.1)' : ev.actionType === 'submit' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                        color: ev.actionType === 'click' ? '#3B82F6' : ev.actionType === 'submit' ? '#D97706' : '#8B5CF6',
                      }}>
                        {ev.actionType === 'click' ? 'Clic' : ev.actionType === 'submit' ? 'Soumission' : 'Chargement'}
                      </span>
                    </td>
                    <td>
                      <span className="admin-badge" style={{
                        background: ev.isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(107, 114, 128, 0.12)',
                        color: ev.isActive ? '#059669' : '#6B7280',
                      }}>
                        {ev.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td>
                      <div className="action-group">
                        <button className="icon-btn" onClick={() => handleEditEvent(ev)} title="Modifier"><Edit2 size={14} /></button>
                        <button className="icon-btn" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteEvent(ev.id)} title="Supprimer"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section : Extensions futures ── */}
      <div className="admin-panel" style={{
        padding: '1.5rem', textAlign: 'center',
        border: '1px dashed var(--gray)'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#6B7280', fontSize: '0.9rem', fontWeight: 600 }}>
          Architecture extensible
        </h4>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#9CA3AF' }}>
          Prochainement : Google Analytics 4 · Tag Manager · TikTok Pixel · LinkedIn Insight Tag
        </p>
      </div>
    </div>
  );
};

export default AdminMetaPixel;
