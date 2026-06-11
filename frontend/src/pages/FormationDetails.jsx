import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Users, Calendar, CheckCircle2, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';

import './Home.css';
import { API_URL } from '../config';

const FormationDetails = () => {
  const { id } = useParams();
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formation, setFormation] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFormation = async () => {
      try {
        const response = await fetch(`${API_URL}/api/public/formations/${id}`);
        if (!response.ok) throw new Error("Formation introuvable");
        const data = await response.json();
        setFormation(data);

        try {
          const sylRes = await fetch(`${API_URL}/api/courses/${data.id}/structure`);
          if (sylRes.ok) {
            setModules(await sylRes.json());
          }
        } catch(e) {}
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

  const getFormatDisplay = () => {
    if (formation.format === 'physique' || formation.format === 'présentiel') {
      return `Présentiel ${formation.location ? '(' + formation.location + ')' : ''}`;
    } else if (formation.format === 'en_ligne' || formation.format === 'hybride') {
      return 'En ligne (Google Meet / WhatsApp)';
    } else if (formation.format === 'masse') {
      return `Camp de vacance / Masse ${formation.location ? '(' + formation.location + ')' : ''}`;
    }
    return formation.isOnline ? 'En ligne' : (formation.location || 'Présentiel');
  };

  const handleEnrollClick = () => {
    navigate('/inscription', { state: { formationId: formation.id } });
  };

  return (
    <div className="page-transition" style={{ backgroundColor: 'var(--color-bg-light)', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* HERO BANNER */}
      <div style={{ position: 'relative', height: '450px', width: '100%' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${formation.imageUrl || '/10x.jpg'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(16, 24, 40, 0.95) 0%, rgba(16, 24, 40, 0.6) 50%, rgba(16, 24, 40, 0.2) 100%)' }} />
        </div>
        <div className="container" style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: 'white', paddingTop: '4rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', marginBottom: '2rem', fontWeight: 600, transition: 'color 0.2s' }}>
            <ArrowLeft size={18} /> Retour aux formations
          </Link>
          <div style={{ display: 'inline-block', backgroundColor: 'var(--color-accent)', color: 'white', padding: '0.5rem 1.2rem', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.5rem', width: 'fit-content', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
            {formation.category}
          </div>
          <h1 style={{ fontSize: '3.5rem', margin: '0 0 1.5rem 0', maxWidth: '800px', lineHeight: 1.1, fontWeight: 800 }}>{formation.title}</h1>
          <div style={{ display: 'flex', gap: '2.5rem', fontSize: '1.15rem', opacity: 0.95, fontWeight: 500 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Clock size={22} color="var(--color-accent)" /> {formation.duration}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Users size={22} color="var(--color-accent)" /> {formation.ageGroup}</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '3rem' }}>

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
                <span>Format : <strong>{getFormatDisplay()}</strong></span>
              </li>
              {formation.sessionsPerWeek && (
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: 1.5 }}>
                  <CheckCircle2 size={24} color="var(--color-accent)" style={{ flexShrink: 0 }} />
                  <span>Rythme : <strong>{formation.sessionsPerWeek} séances par semaine</strong> ({formation.sessionDuration})</span>
                </li>
              )}
            </ul>

            {modules && modules.length > 0 && (
              <div style={{ marginTop: '4rem' }}>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>Programme de la formation</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {modules.map((m, i) => (
                    <details key={m.id} style={{ backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <summary style={{ padding: '1.2rem 1.5rem', fontWeight: 600, color: 'var(--color-primary)', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white' }}>
                        <span style={{ fontSize: '1.1rem' }}>Module {i + 1} : {m.title}</span>
                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, backgroundColor: '#f1f5f9', padding: '0.3rem 0.8rem', borderRadius: '20px' }}>{m.chapters?.length || 0} chapitres</span>
                      </summary>
                      <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', backgroundColor: 'white' }}>
                        {m.chapters?.map((c, j) => (
                          <div key={c.id} style={{ padding: '1rem 0', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>
                              {j + 1}
                            </div>
                            <div>
                              <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1.05rem', color: '#334155' }}>{c.title}</h4>
                              {c.lessons && c.lessons.length > 0 && (
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                                  {c.lessons.length} leçon(s) au programme
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}
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

          </aside>

        </div>
      </div>
    </div>
  );
};

export default FormationDetails;
