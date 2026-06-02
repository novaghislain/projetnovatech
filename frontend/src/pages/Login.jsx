import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { reserveFormation } from '../services/formationService';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import './Home.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await auth.login({ email, password });
      // if reservation intent exists, perform reservation automatically
      const auto = location.state?.autoReserve;
      if (auto && auto.formationId) {
        try {
          await reserveFormation(auto.formationId, auth.user);
          navigate('/mon-espace/inscriptions');
          return;
        } catch (err) {
          // reservation failed, fall back to original dest
          alert(err.message);
        }
      }
      const dest = location.state?.from || '/mon-espace';
      navigate(dest);
    } catch (err) {
      alert('Erreur de connexion (demo)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-transition" style={{ backgroundColor: 'var(--color-bg-light)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem' }}>
      <div style={{ backgroundColor: 'var(--color-white)', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-border)', width: '100%', maxWidth: '450px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Bon retour !</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>Connectez-vous pour accéder à votre espace d'apprentissage.</p>
        </div>

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

          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontFamily: 'inherit', fontSize: '1rem' }} 
              />
            </div>
            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
              <a href="#" style={{ fontSize: '0.85rem', color: 'var(--color-accent)', textDecoration: 'none' }}>Mot de passe oublié ?</a>
            </div>
          </div>

          <button className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '1.05rem', marginTop: '1rem' }}>
            {loading ? 'Connexion en cours...' : (
              <>Se connecter <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
          Vous n'avez pas encore de compte ?{' '}
          <Link to="/register" style={{ color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}>Créer un compte</Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
