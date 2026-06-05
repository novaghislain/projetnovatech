import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import './Home.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [demoLink, setDemoLink] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    setDemoLink('');

    try {
      const res = await fetch('http://localhost:5001/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
      } else {
        setError(data.error || 'Une erreur est survenue.');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-transition" style={{ backgroundColor: 'var(--color-bg-light)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem' }}>
      <div style={{ backgroundColor: 'var(--color-white)', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-border)', width: '100%', maxWidth: '450px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Mot de passe oublié</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>
        </div>

        {message ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#10b981', marginBottom: '1.5rem' }}>
              <CheckCircle size={32} />
            </div>
            <h3 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>Vérifiez vos e-mails !</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>{message}</p>
            
            <Link to="/connexion" className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0.9rem' }}>
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Adresse Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="email" 
                  placeholder="prenom@exemple.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontFamily: 'inherit', fontSize: '1rem' }} 
                />
              </div>
            </div>

            {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 600 }}>{error}</div>}

            <button className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '1.05rem', marginTop: '0.5rem' }}>
              {loading ? 'Envoi en cours...' : (
                <>Envoyer le lien <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        )}

        {!message && (
          <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
            Je me souviens de mon mot de passe !{' '}
            <Link to="/connexion" style={{ color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}>Se connecter</Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;
