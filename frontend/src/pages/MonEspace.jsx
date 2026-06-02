import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Award, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Home.css';

const MonEspace = () => {
  const { user } = useAuth();
  
  return (
    <div className="page-transition" style={{ backgroundColor: 'var(--color-bg-light)', minHeight: '80vh', padding: '3rem 0' }}>
      <div className="container">
        
        {/* HEADER */}
        <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '2.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem', boxShadow: 'var(--shadow-md)' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Bonjour, {user?.firstName} 👋</h1>
            <p style={{ opacity: 0.9, fontSize: '1.05rem', margin: 0 }}>Bienvenue dans votre espace d'apprentissage Novatech Vision.</p>
          </div>
          <Link to="/formations" className="btn btn-accent" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Explorer les formations <ArrowRight size={18} />
          </Link>
        </div>

        {/* STATS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ backgroundColor: 'var(--color-white)', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ backgroundColor: 'rgba(212,160,23,0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--color-accent)' }}>
              <BookOpen size={28} />
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1 }}>2</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>Formations en cours</div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--color-white)', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ backgroundColor: 'rgba(212,160,23,0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--color-accent)' }}>
              <Clock size={28} />
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1 }}>14h</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>Heures d'apprentissage</div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--color-white)', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ backgroundColor: 'rgba(212,160,23,0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--color-accent)' }}>
              <Award size={28} />
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1 }}>0</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>Certificats obtenus</div>
            </div>
          </div>
        </div>

        {/* QUICK LINKS */}
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>Raccourcis</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <Link to="/mon-espace/inscriptions" style={{ backgroundColor: 'var(--color-white)', padding: '2rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', textDecoration: 'none', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="hover-lift">
            <BookOpen size={32} color="var(--color-primary)" />
            <h3 style={{ color: 'var(--color-primary)', margin: 0 }}>Mes Inscriptions</h3>
            <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.95rem' }}>Gérez vos réservations et accédez à vos cours en ligne.</p>
          </Link>
          
          <div style={{ backgroundColor: 'var(--color-white)', padding: '2rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', opacity: 0.7, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Award size={32} color="var(--color-text-muted)" />
            <h3 style={{ color: 'var(--color-text-muted)', margin: 0 }}>Mes Certificats (Bientôt)</h3>
            <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.95rem' }}>Retrouvez les attestations de vos formations complétées.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MonEspace;
