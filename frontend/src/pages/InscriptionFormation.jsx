import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import './Home.css';
import { API_URL } from '../config';

const InscriptionFormation = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => { 
    const fetchRealFormations = async () => {
      try {
        const res = await fetch(`${API_URL}/api/public/formations`);
        if (res.ok) {
          const data = await res.json();
          setFormations(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRealFormations();
  }, []);

  const handleReserve = (f) => {
    if (!auth.user) {
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
            const isFull = f.isFull || f.status === 'full';
            return (
              <div key={f.id} className="formation-card">
                <div className="formation-card-img">
                  <img src={f.imageUrl || '/placeholder.jpg'} alt={f.title} />
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
                    <strong>{f.price ? f.price.toLocaleString() + ' FCFA' : 'Gratuit'}</strong>
                    <div className="formation-card-actions">
                      <Link to={`/formations/${f.id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                        Détails
                      </Link>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.5rem 1rem' }}
                        disabled={isFull}
                        onClick={() => handleReserve(f)}
                      >
                        {isFull ? 'Plein' : 'S\'inscrire'}
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
