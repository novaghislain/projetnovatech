import React, { useState, useEffect } from 'react';
import { Cookie, X, Shield } from 'lucide-react';

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('nv_cookie_consent');
    if (!consent) {
      // Afficher après 1.5s pour ne pas perturber le premier chargement
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = (all = true) => {
    localStorage.setItem('nv_cookie_consent', all ? 'all' : 'essential');
    localStorage.setItem('nv_cookie_date', new Date().toISOString());
    if (all) {
      // Activer Google Analytics + Facebook Pixel
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'granted' });
      }
      if (typeof window.fbq === 'function') {
        window.fbq('consent', 'grant');
      }
    }
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('nv_cookie_consent', 'declined');
    localStorage.setItem('nv_cookie_date', new Date().toISOString());
    // Désactiver le tracking
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied' });
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.97)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      padding: '1.25rem 1.5rem',
      boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
      animation: 'slideUp 0.4s ease-out'
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          
          {/* Icône */}
          <div style={{ background: 'rgba(15,52,96,0.6)', borderRadius: '12px', padding: '0.75rem', flexShrink: 0 }}>
            <Cookie size={24} color="#60a5fa" />
          </div>

          {/* Texte */}
          <div style={{ flex: 1, minWidth: '250px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <Shield size={16} color="#34d399" />
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>
                Votre vie privée nous importe 🛡️
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
              Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser le contenu.
              Conformément au <strong style={{ color: '#e2e8f0' }}>RGPD</strong> et à la protection des données des mineurs,
              vous pouvez choisir quels cookies accepter.{' '}
              <button
                onClick={() => setShowDetails(!showDetails)}
                style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: 0, fontSize: '0.85rem', textDecoration: 'underline' }}
              >
                {showDetails ? 'Masquer' : 'En savoir plus'}
              </button>
            </p>

            {showDetails && (
              <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                {[
                  { name: '🔒 Cookies essentiels', desc: 'Authentification, sécurité, panier. Toujours actifs.', required: true },
                  { name: '📊 Analyse (Analytics)', desc: 'Google Analytics – mesure du trafic anonymisé.', required: false },
                  { name: '🎯 Publicité', desc: 'Facebook Pixel – publicités personnalisées.', required: false },
                ].map(c => (
                  <div key={c.name} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.6rem 0.8rem' }}>
                    <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.2rem' }}>{c.name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{c.desc}</div>
                    {c.required && <div style={{ color: '#34d399', fontSize: '0.7rem', marginTop: '0.2rem' }}>Toujours actif</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
            <button
              onClick={handleDecline}
              style={{
                padding: '0.6rem 1.1rem',
                background: 'transparent',
                color: '#94a3b8',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
            >
              Essentiels uniquement
            </button>
            <button
              onClick={() => handleAccept(true)}
              style={{
                padding: '0.6rem 1.3rem',
                background: 'linear-gradient(135deg, #0F3460, #1A1A2E)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 700,
                boxShadow: '0 4px 15px rgba(15,52,96,0.5)',
                transition: 'all 0.2s'
              }}
            >
              ✓ Tout accepter
            </button>
            <button
              onClick={() => setVisible(false)}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.4rem' }}
              title="Fermer (cookie consent non enregistré)"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
