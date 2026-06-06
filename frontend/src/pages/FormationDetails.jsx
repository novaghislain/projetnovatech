import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Users, Calendar, CheckCircle2, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import AdBanner from '../components/AdBanner';
import './Home.css';

const FormationDetails = () => {
  const { id } = useParams();
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFormation = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/public/formations/${id}`);
        if (!response.ok) throw new Error("Formation introuvable");
        const data = await response.json();
        setFormation(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFormation();
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}>Chargement...</div>;

  if (error || !formation) return (
    <div className="container section-padding" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h2 style={{ color: 'var(--color-primary)' }}>Formation introuvable</h2>
      <p style={{ color: 'var(--color-text-muted)' }}>La formation que vous cherchez n'existe pas ou a été retirée.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Retour à l'accueil</Link>
    </div>
  );

  const isFull = formation.enrolled >= formation.maxParticipants;
  const spotsLeft = formation.maxParticipants - formation.enrolled;
  const showWarning = !isFull && spotsLeft <= 5;

  const handleEnrollClick = () => {
    if (!auth.user) {
      navigate('/connexion', { state: { from: '/inscription', autoReserve: { formationId: formation.id } } });
    } else {
      navigate('/inscription', { state: { formationId: formation.id } });
    }
  };

  return (
    <div className="page-transition" style={{ backgroundColor: 'var(--color-bg-light)', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* HERO BANNER */}
      <div style={{ position: 'relative', height: '350px', width: '100%' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${formation.imageUrl || '/10x.jpg'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(16, 24, 40, 0.9), rgba(16, 24, 40, 0.4))' }} />
        </div>
        <div className="container" style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: 'white' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', marginBottom: '1.5rem', fontWeight: 600 }}>
            <ArrowLeft size={18} /> Retour aux formations
          </Link>
          <div style={{ display: 'inline-block', backgroundColor: 'var(--color-accent)', color: 'white', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', width: 'fit-content' }}>
            {formation.category}
          </div>
          <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0', maxWidth: '800px', lineHeight: 1.2 }}>{formation.title}</h1>
          <div style={{ display: 'flex', gap: '2rem', fontSize: '1.1rem', opacity: 0.9 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={20} /> {formation.duration}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={20} /> {formation.ageGroup}</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '3rem' }}>
        <AdBanner placement="header" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem', alignItems: 'start' }}>
          
          {/* LEFT CONTENT */}
          <div style={{ backgroundColor: 'var(--color-white)', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>À propos de cette formation</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2.5rem', whiteSpace: 'pre-line' }}>
              {formation.description || "Cette formation est spécialement conçue pour vous permettre de maîtriser de nouvelles compétences pratiques, étape par étape."}
            </p>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>Détails pratiques</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1rem', marginBottom: '3rem' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: 1.5 }}>
                <CheckCircle2 size={24} color="var(--color-accent)" style={{ flexShrink: 0 }} />
                <span>Niveau : <strong>{formation.level || 'Tous niveaux'}</strong></span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: 1.5 }}>
                <CheckCircle2 size={24} color="var(--color-accent)" style={{ flexShrink: 0 }} />
                <span>Format : <strong>{formation.isOnline ? 'En ligne (Google Meet / WhatsApp)' : (formation.location || 'Présentiel')}</strong></span>
              </li>
              {formation.sessionsPerWeek && (
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: 1.5 }}>
                  <CheckCircle2 size={24} color="var(--color-accent)" style={{ flexShrink: 0 }} />
                  <span>Rythme : <strong>{formation.sessionsPerWeek} séances par semaine</strong> ({formation.sessionDuration})</span>
                </li>
              )}
            </ul>
          </div>

          {/* RIGHT SIDEBAR (STICKY) */}
          <aside style={{ position: 'sticky', top: '2rem' }}>
            <div style={{ backgroundColor: 'var(--color-white)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>{formation.price?.toLocaleString()} FCFA</span>
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                {isFull ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600 }}>
                    <AlertCircle size={16} /> FORMATION COMPLÈTE
                  </div>
                ) : (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: showWarning ? '#ffedd5' : '#dcfce7', color: showWarning ? '#c2410c' : '#166534', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600 }}>
                    <Users size={16} /> Il reste {spotsLeft} place(s) disponible(s)
                  </div>
                )}
                
                <div style={{ width: '100%', height: '6px', backgroundColor: '#f3f4f6', borderRadius: '3px', marginTop: '1rem', overflow: 'hidden' }}>
                  <div style={{ height: '100%', backgroundColor: isFull ? '#dc2626' : (showWarning ? '#ea580c' : '#10b981'), width: `${(formation.enrolled / formation.maxParticipants) * 100}%` }}></div>
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                onClick={handleEnrollClick} 
                style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.05rem', backgroundColor: isFull ? '#475569' : 'var(--color-primary)' }}
              >
                {isFull ? 'Rejoindre la liste d\'attente' : 'S\'inscrire maintenant'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--color-white)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <ShieldCheck size={32} color="var(--color-accent)" />
              <div>
                <strong style={{ display: 'block', color: 'var(--color-primary)', fontSize: '0.95rem' }}>Paiement 100% sécurisé</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Transaction cryptée via Kkiapay / FedaPay</span>
              </div>
            </div>
            <AdBanner placement="sidebar" />
          </aside>

        </div>
      </div>
    </div>
  );
};

export default FormationDetails;
