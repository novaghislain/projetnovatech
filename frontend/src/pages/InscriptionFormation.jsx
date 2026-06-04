import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFormations, reserveFormation } from '../services/formationService';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import './Home.css';

const InscriptionFormation = () => {
  const [formations, setFormations] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const auth = useAuth();

  useEffect(() => { setFormations(getFormations()); }, []);

  const navigate = useNavigate();

  const handleReserve = (f) => {
    if (!auth.user) {
      alert('Connectez-vous pour réserver');
      navigate('/connexion', { state: { from: '/inscription', autoReserve: { course: f } } });
      return;
    }
    
    navigate('/inscription', { state: { course: f } });
  };

  return (
    <div className="page-transition">
      <div className="page-top-bar">
        <div className="container">
          <h1>Catalogue de Formations</h1>
          <p className="page-top-desc">
            Choisissez la formation idéale pour initier votre enfant au numérique dans un cadre sécurisé et encadré par des professionnels.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="formations-page-list">
          {formations.map(f => {
            const isFull = typeof f.spots === 'number' && f.spots <= 0;
            return (
              <div key={f.id} className="formation-card">
                <div className="formation-card-img">
                  <img src={f.image} alt={f.title} />
                  <div className="formation-card-tag">{f.category}</div>
                  {isFull && <div className="formation-card-complet">COMPLET</div>}
                </div>

                <div className="formation-card-body">
                  <div className="formation-card-meta">
                    <span><Clock size={16} /> {f.duration}</span>
                    <span><Users size={16} /> {f.ageGroup}</span>
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.description}</p>
                  
                  <div className="formation-card-foot">
                    <strong>{f.price}</strong>
                    <div className="formation-card-actions">
                      <Link to={`/formations/${f.id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                        Détails
                      </Link>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.5rem 1rem' }}
                        disabled={isFull || loadingId === f.id}
                        onClick={() => handleReserve(f)}
                      >
                        {loadingId === f.id ? '...' : (isFull ? 'Plein' : 'Réserver')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="secure-banner">
          <ShieldCheck size={40} />
          <div>
            <strong>Paiement 100% sécurisé via FedaPay</strong>
            <span>Vos transactions sont cryptées et protégées. Nous ne conservons aucune donnée bancaire.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InscriptionFormation;
