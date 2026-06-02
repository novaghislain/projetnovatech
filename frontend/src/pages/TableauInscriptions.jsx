import React, { useEffect, useState } from 'react';
import { getReservationsByUser, cancelReservation, getFormations } from '../services/formationService';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Calendar, Clock, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Home.css';

const TableauInscriptions = () => {
  const auth = useAuth();
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    if (auth.user?.email) setReservations(getReservationsByUser(auth.user.email));
  }, [auth.user]);

  const handleCancel = (id) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette inscription ?')) return;
    cancelReservation(id);
    setReservations(getReservationsByUser(auth.user.email));
  };

  const formations = getFormations();

  return (
    <div className="page-transition" style={{ backgroundColor: 'var(--color-bg-light)', minHeight: '80vh', padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/mon-espace" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', textDecoration: 'none', marginBottom: '1rem', fontWeight: 600 }}>
            <ArrowLeft size={18} /> Retour à mon espace
          </Link>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--color-primary)', margin: 0 }}>Mes Inscriptions</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', marginTop: '0.5rem' }}>Gérez vos formations réservées et accédez à vos cours.</p>
        </div>

        {reservations.length === 0 ? (
          <div style={{ backgroundColor: 'var(--color-white)', padding: '4rem 2rem', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border)', textAlign: 'center' }}>
            <div style={{ backgroundColor: 'rgba(212,160,23,0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--color-accent)' }}>
              <BookOpen size={40} />
            </div>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>Vous n'êtes inscrit à aucune formation</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>Parcourez notre catalogue et trouvez la formation idéale pour développer vos compétences.</p>
            <Link to="/formations" className="btn btn-primary">Découvrir les formations</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {reservations.map(r => {
              const f = formations.find(x => x.id === r.formationId) || { title: 'Formation introuvable', category: 'Inconnu', duration: '-' };
              
              return (
                <div key={r.id} style={{ background: 'var(--color-white)', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                  
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flex: 1 }}>
                    <div style={{ backgroundColor: 'var(--color-bg-light)', width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                      <BookOpen size={32} />
                    </div>
                    <div>
                      <div style={{ display: 'inline-block', backgroundColor: 'rgba(212,160,23,0.1)', color: 'var(--color-accent)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        {f.category}
                      </div>
                      <h3 style={{ fontSize: '1.3rem', margin: '0 0 0.5rem 0', color: 'var(--color-primary)' }}>{f.title}</h3>
                      
                      <div style={{ display: 'flex', gap: '1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> {f.duration}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14} /> Inscrit le {new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => handleCancel(r.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-error)', borderColor: 'var(--color-error)', backgroundColor: 'transparent' }}>
                      <Trash2 size={16} /> Annuler
                    </button>
                    <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      Accéder au cours
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableauInscriptions;
