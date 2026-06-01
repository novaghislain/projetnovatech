import React, { useEffect, useState } from 'react';
import { getReservationsByUser, cancelReservation, getFormations } from '../services/formationService';
import { useAuth } from '../contexts/AuthContext';

const TableauInscriptions = () => {
  const auth = useAuth();
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    if (auth.user?.email) setReservations(getReservationsByUser(auth.user.email));
  }, [auth.user]);

  const handleCancel = (id) => {
    if (!confirm('Annuler la réservation ?')) return;
    cancelReservation(id);
    setReservations(getReservationsByUser(auth.user.email));
  };

  const formations = getFormations();

  return (
    <div className="container section-padding">
      <h1>Mes Inscriptions</h1>
      {reservations.length === 0 ? (
        <p>Aucune inscription trouvée.</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {reservations.map(r => {
            const f = formations.find(x => x.id === r.formationId) || {};
            return (
              <div key={r.id} style={{ background: 'var(--color-white)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{f.title}</strong>
                  <div style={{ color: 'var(--color-text-muted)' }}>{f.category} • {f.duration}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Réservé le {new Date(r.createdAt).toLocaleString()}</div>
                </div>
                <div>
                  <button className="btn btn-secondary" onClick={() => handleCancel(r.id)}>Annuler</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TableauInscriptions;
