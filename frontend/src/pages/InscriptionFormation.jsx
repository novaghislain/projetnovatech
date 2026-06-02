import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFormations, reserveFormation } from '../services/formationService';
import { useAuth } from '../contexts/AuthContext';

const InscriptionFormation = () => {
  const [formations, setFormations] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const auth = useAuth();

  useEffect(() => { setFormations(getFormations()); }, []);

  const handleReserve = async (id) => {
    if (!auth.user) return alert('Connectez-vous pour réserver');
    setLoadingId(id);
    try {
      await reserveFormation(id, auth.user);
      setFormations(getFormations());
      alert('Réservation confirmée (demo)');
    } catch (err) {
      alert(err.message);
    } finally { setLoadingId(null); }
  };

  return (
    <div className="container section-padding">
      <div className="text-center">
        <h1>Inscription aux formations</h1>
        <p>Choisissez une formation et réservez votre place.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
        {formations.map(f => (
          <div key={f.id} style={{ background: 'var(--color-white)', padding: '1rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
            <img src={f.image} alt={f.title} style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: '6px' }} />
            <h3 style={{ marginTop: '0.75rem' }}>{f.title}</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>{f.category} • {f.ageGroup}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{f.price}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{f.spots} place(s) restantes</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to={`/formations/${f.id}`} className="btn btn-secondary">Détails</Link>
                <button className="btn btn-primary" onClick={() => handleReserve(f.id)} disabled={loadingId === f.id || (typeof f.spots === 'number' && f.spots <= 0)}>
                  {loadingId === f.id ? 'Réservation...' : 'Réserver'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InscriptionFormation;
