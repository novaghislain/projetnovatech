import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { reserveFormation } from '../services/formationService';

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
    <div className="container section-padding" style={{ maxWidth: 520 }}>
      <h1>Connexion</h1>
      <form onSubmit={submit} style={{ display: 'grid', gap: '0.75rem' }}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required />
        <button className="btn btn-primary" disabled={loading}>{loading ? 'Connexion...' : 'Se connecter'}</button>
      </form>
    </div>
  );
};

export default Login;
