import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import './Home.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (auth.user) {
      const role = auth.user.role;
      if (role === 'admin' || role === 'admin_restreint') {
        navigate('/admin', { replace: true });
        return;
      }
      if (role === 'formateur') {
        navigate('/formateur', { replace: true });
        return;
      }

      if (location.state?.formationId && role === 'apprenant') {
        navigate('/inscription', { state: { ...location.state, formationId: location.state.formationId }, replace: true });
        return;
      }
      if (location.state?.from) {
        navigate(location.state.from, { state: { ...location.state }, replace: true });
        return;
      }
      navigate('/mon-espace', { replace: true });
    }
  }, [auth.user, navigate, location.state]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedUser = await auth.login({ email, password });
      // Route based on role
      const role = loggedUser.role;
      if (role === 'admin' || role === 'admin_restreint') {
        navigate('/admin', { replace: true });
        return;
      }
      if (role === 'formateur') {
        navigate('/formateur', { replace: true });
        return;
      }

      // Route based on intent for apprenant
      if (location.state?.formationId && role === 'apprenant') {
        navigate('/inscription', { state: { formationId: location.state.formationId } });
        return;
      }
      if (location.state?.from) {
        navigate(location.state.from);
        return;
      }

      navigate('/mon-espace');

    } catch (err) {
      setError(err.message || 'Erreur de connexion. Vérifiez vos identifiants.');
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
          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #f87171' }}>
              {error}
            </div>
          )}
          
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
                placeholder="Votre mot de passe" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontFamily: 'inherit', fontSize: '1rem' }} 
              />
            </div>
            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
              <Link to="/mot-de-passe-oublie" style={{ fontSize: '0.85rem', color: 'var(--color-accent)', textDecoration: 'none' }}>Mot de passe oublié ?</Link>
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
          <Link to="/register" state={location.state} style={{ color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}>Créer un compte</Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
