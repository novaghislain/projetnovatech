import React, { useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { getFormationById, reserveFormation } from '../services/formationService';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Users, Calendar, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';
import './Home.css';

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

  if (!formation) return (
    <div className="container section-padding" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h2 style={{ color: 'var(--color-primary)' }}>Formation introuvable</h2>
      <p style={{ color: 'var(--color-text-muted)' }}>La formation que vous cherchez n'existe pas ou a été retirée.</p>
      <Link to="/formations" className="btn btn-primary" style={{ marginTop: '1rem' }}>Retour au catalogue</Link>
    </div>
  );

  // Mock sessions for demo
  const sessions = [
    { id: 's1', date: '5 Juillet 2026 - 10:00' },
    { id: 's2', date: '12 Juillet 2026 - 14:00' },
  ];

  const handleReserve = async (e) => {
    e.preventDefault();
    if (!auth.user) {
      navigate('/connexion', { state: { from: location.pathname, autoReserve: { formationId: formation.id, childName, phone, session } } });
      return;
    }
    setLoading(true);
    try {
      await reserveFormation(formation.id, auth.user);
      navigate('/mon-espace/inscriptions');
    } catch (err) {
      // If reservation failed due to auth or business rule, redirect to login preserving intent
      if (err?.code === 'AUTH_REQUIRED') {
        navigate('/connexion', { state: { from: location.pathname, autoReserve: { formationId: formation.id, childName, phone, session } } });
        return;
      }
      console.error('Réservation échouée', err);
    } finally { setLoading(false); }
  };

  const isFull = typeof formation.spots === 'number' && formation.spots <= 0;

  return (
    <div className="page-transition" style={{ backgroundColor: 'var(--color-bg-light)', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* HERO BANNER */}
      <div style={{ position: 'relative', height: '350px', width: '100%' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${formation.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(16, 24, 40, 0.9), rgba(16, 24, 40, 0.4))' }} />
        </div>
        <div className="container" style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: 'white' }}>
          <Link to="/formations" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', marginBottom: '1.5rem', fontWeight: 600 }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem', alignItems: 'start' }}>
          
          {/* LEFT CONTENT */}
          <div style={{ backgroundColor: 'var(--color-white)', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>À propos de cette formation</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2.5rem' }}>
              Cette formation est spécialement conçue pour les jeunes souhaitant découvrir le monde du numérique à travers des projets concrets et amusants. L'apprentissage se fait étape par étape avec un encadrement personnalisé.
            </p>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>Ce que votre enfant va apprendre</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1rem', marginBottom: '3rem' }}>
              {[
                "Comprendre la logique de base",
                "Réaliser son premier projet complet",
                "Développer sa créativité",
                "Travailler en équipe sur des défis pratiques"
              ].map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: 1.5 }}>
                  <CheckCircle2 size={24} color="var(--color-accent)" style={{ flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>Prérequis</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Aucun prérequis technique n'est nécessaire. L'apprenant doit simplement savoir lire, écrire et avoir envie de découvrir de nouvelles choses !
            </p>
          </div>

          {/* RIGHT SIDEBAR (STICKY) */}
          <aside style={{ position: 'sticky', top: '2rem' }}>
            <div style={{ backgroundColor: 'var(--color-white)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>{formation.price}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isFull ? 'var(--color-error)' : 'var(--color-text-muted)', marginBottom: '2rem', fontWeight: 600 }}>
                {isFull ? (
                  <span style={{ backgroundColor: 'var(--color-error)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}>COMPLET</span>
                ) : (
                  <>Il ne reste que <span style={{ color: 'var(--color-accent)' }}>{formation.spots} place(s)</span> !</>
                )}
              </div>

              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary)', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>Réserver une place</h3>
              
              <form onSubmit={handleReserve} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Prénom et nom de l'enfant *</label>
                  <input value={childName} onChange={e => setChildName(e.target.value)} placeholder="Ex: Lucas Dupont" required style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontFamily: 'inherit' }} disabled={isFull} />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Téléphone parent *</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ex: 01 23 45 67 89" required style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontFamily: 'inherit' }} disabled={isFull} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Session souhaitée *</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <select value={session} onChange={e => setSession(e.target.value)} style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontFamily: 'inherit', appearance: 'none', backgroundColor: 'var(--color-white)' }} disabled={isFull}>
                      {sessions.map(s => <option key={s.id} value={s.id}>{s.date}</option>)}
                    </select>
                  </div>
                </div>

                <button className="btn btn-primary" type="submit" disabled={loading || isFull} style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.05rem', marginTop: '1rem' }}>
                  {loading ? 'Réservation en cours...' : isFull ? 'Places épuisées' : 'Valider l\'inscription'}
                </button>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center', margin: 0 }}>
                  Aucun paiement n'est requis immédiatement (démo).
                </p>
              </form>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--color-white)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <ShieldCheck size={32} color="var(--color-accent)" />
              <div>
                <strong style={{ display: 'block', color: 'var(--color-primary)', fontSize: '0.95rem' }}>Paiement 100% sécurisé</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Remboursement possible sous 7 jours</span>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
};

export default FormationDetails;
