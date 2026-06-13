import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import './Home.css';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (auth.user) {
      if (location.state?.formationId && auth.user.role === 'apprenant') {
        navigate('/inscription', { state: { ...location.state, formationId: location.state.formationId }, replace: true });
        return;
      }
      const role = auth.user.role;
      if (role === 'admin' || role === 'admin_restreint') navigate('/admin', { replace: true });
      else if (role === 'formateur') navigate('/formateur', { replace: true });
      else navigate('/mon-espace', { replace: true });
    }
  }, [auth.user, navigate, location.state]);

  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = hasLength && hasUpper && hasNumber && hasSpecial;

  const submit = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) return; // Le bouton sera désactivé de toute façon
    setLoading(true);
    try {
      await auth.register({ firstName, email, password });
      // Déclencher l'événement Meta Pixel CompleteRegistration
      try { if (window.fbq) window.fbq('track', 'CompleteRegistration'); } catch(e) {}
      if (location.state?.formationId) {
        navigate('/inscription', { state: { formationId: location.state.formationId } });
        return;
      }
      if (location.state?.from) {
        navigate(location.state.from);
        return;
      }
      const dest = '/mon-espace';
      navigate(dest);
    } catch (err) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-transition" style={{ backgroundColor: 'var(--color-bg-light)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem' }}>
      <div style={{ backgroundColor: 'var(--color-white)', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-border)', width: '100%', maxWidth: '450px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Créer un compte</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>Rejoignez FormationNova et commencez votre apprentissage.</p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #f87171' }}>
              {error}
            </div>
          )}
          
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Prénom</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Ex: Lucas" 
                value={firstName} 
                onChange={e => setFirstName(e.target.value)} 
                required 
                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontFamily: 'inherit', fontSize: '1rem' }} 
              />
            </div>
          </div>

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
            
            {/* Validateur de mot de passe */}
            {password.length > 0 && (
              <div style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: hasLength ? '#10b981' : 'inherit', transition: 'color 0.3s' }}>
                  <CheckCircle size={14} /> Au moins 8 caractères
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: hasUpper ? '#10b981' : 'inherit', transition: 'color 0.3s' }}>
                  <CheckCircle size={14} /> Une lettre majuscule
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: hasNumber ? '#10b981' : 'inherit', transition: 'color 0.3s' }}>
                  <CheckCircle size={14} /> Un chiffre
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: hasSpecial ? '#10b981' : 'inherit', transition: 'color 0.3s' }}>
                  <CheckCircle size={14} /> Un caractère spécial
                </div>
              </div>
            )}
          </div>

          <button 
            className="btn btn-primary" 
            disabled={loading || (!isPasswordValid && password.length > 0)} 
            style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '1.05rem', marginTop: '1rem', opacity: (!isPasswordValid && password.length > 0) ? 0.5 : 1 }}
          >
            {loading ? 'Création en cours...' : (
              <>S'inscrire <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
          Vous avez déjà un compte ?{' '}
          <Link to="/connexion" state={location.state} style={{ color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}>Se connecter</Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
