import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFormations, reserveFormation } from '../services/formationService';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import './Home.css';

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
      alert('Réservation confirmée avec succès !');
    } catch (err) {
      alert(err.message);
    } finally { setLoadingId(null); }
  };

  return (
    <div className="page-transition">
      <div className="page-header" style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '4rem 0', textAlign: 'center' }}>
        <div className="container">
          <div className="section-eyebrow" style={{ color: 'var(--color-accent)' }}>Nos Programmes</div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Catalogue de Formations</h1>
          <p style={{ maxWidth: 800, margin: '0 auto', fontSize: '1.1rem', opacity: 0.9 }}>
            Choisissez la formation idéale pour initier votre enfant au numérique dans un cadre sécurisé et encadré par des professionnels.
          </p>
        </div>
      </div>

      <div className="container section-padding">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {formations.map(f => {
            const isFull = typeof f.spots === 'number' && f.spots <= 0;
            return (
              <div key={f.id} style={{ background: 'var(--color-white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-border)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s' }} className="hover-lift">
                
                <div style={{ position: 'relative' }}>
                  <img src={f.image} alt={f.title} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: 'var(--color-white)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', boxShadow: 'var(--shadow-sm)' }}>
                    {f.category}
                  </div>
                  {isFull && (
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ backgroundColor: 'var(--color-error)', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 700 }}>COMPLET</span>
                    </div>
                  )}
                </div>

                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={16} /> {f.duration}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Users size={16} /> {f.ageGroup}</span>
                  </div>
                  
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>{f.title}</h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6, flex: 1 }}>
                    Une immersion complète pour comprendre et maîtriser les concepts clés de cette thématique avec des projets pratiques.
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>{f.spots} places restantes</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-accent)' }}>{f.price}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/formations/${f.id}`} className="btn btn-secondary" style={{ padding: '0.6rem 1rem' }}>Détails</Link>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleReserve(f.id)} 
                        disabled={loadingId === f.id || isFull}
                        style={{ padding: '0.6rem 1rem' }}
                      >
                        {loadingId === f.id ? 'Réservation...' : 'S\'inscrire'}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
        
        <div style={{ marginTop: '4rem', backgroundColor: 'var(--color-bg-light)', padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          <ShieldCheck size={40} color="var(--color-accent)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Paiement Sécurisé</h3>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: 600, margin: '0 auto' }}>
            Tous nos paiements sont traités de manière sécurisée. Vous pouvez régler par Mobile Money (Mtn, Moov, Celtiis) ou par carte bancaire.
          </p>
        </div>

      </div>
    </div>
  );
};

export default InscriptionFormation;
