import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getFormationById, reserveFormation } from '../services/formationService';
import { useAuth } from '../contexts/AuthContext';

const FormationDetails = () => {
  const { id } = useParams();
  const formation = getFormationById(id);
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [childName, setChildName] = useState('');
  const [phone, setPhone] = useState('');
  const [session, setSession] = useState('default');
  const [loading, setLoading] = useState(false);

  if (!formation) return <div className="container section-padding"><h2>Formation introuvable</h2></div>;

  // Mock sessions for demo
  const sessions = [
    { id: 's1', date: '2026-07-05 10:00' },
    { id: 's2', date: '2026-07-12 14:00' },
  ];

  const handleReserve = async (e) => {
    e.preventDefault();
    if (!auth.user) {
      // redirect to login and remember return url + reservation intent
      navigate('/connexion', { state: { from: location.pathname, autoReserve: { formationId: formation.id, childName, phone, session } } });
      return;
    }
    setLoading(true);
    try {
      await reserveFormation(formation.id, auth.user);
      navigate('/mon-espace/inscriptions');
    } catch (err) {
      alert(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="container section-padding">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem' }}>
        <div>
          <h1>{formation.title}</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>{formation.category} • {formation.ageGroup}</p>
          <p style={{ marginTop: '1rem' }}>Durée : {formation.duration}</p>
          <p style={{ marginTop: '1rem' }}>Places restantes : {formation.spots}</p>
          <h3 style={{ marginTop: '1.5rem' }}>Description</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>Description détaillée de la formation. Contenu pédagogique, objectifs et compétences visées. (texte demo)</p>
        </div>

        <aside style={{ background: 'var(--color-white)', padding: '1rem', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
          <h3>Réserver une place</h3>
          <form onSubmit={handleReserve} style={{ display: 'grid', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Nom de l'enfant</label>
            <input value={childName} onChange={e => setChildName(e.target.value)} placeholder="Prénom et nom" required />
            <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Téléphone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Téléphone" required />
            <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Session</label>
            <select value={session} onChange={e => setSession(e.target.value)}>
              <option value="default">{sessions[0].date}</option>
              {sessions.map(s => <option key={s.id} value={s.id}>{s.date}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Réservation...' : 'Réserver'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/formations')}>Retour</button>
            </div>
          </form>
          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            <div>Prix : <strong>{formation.price}</strong></div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default FormationDetails;
