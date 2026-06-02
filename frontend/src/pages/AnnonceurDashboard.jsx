import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

const AnnonceurDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="page-transition" style={{ backgroundColor: 'var(--color-bg-light)', minHeight: '100vh', padding: '4rem 0' }}>
      <div className="container">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>Espace Annonceur Tiers</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', marginBottom: '3rem' }}>
          Bienvenue, {user?.firstName}. Créez et suivez vos campagnes publicitaires.
        </p>

        <div style={{ padding: '3rem', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>Bientôt disponible</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Le module de création et facturation publicitaire est en cours de développement.</p>
        </div>
      </div>
    </div>
  );
};

export default AnnonceurDashboard;
