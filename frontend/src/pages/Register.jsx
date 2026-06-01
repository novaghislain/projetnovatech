import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [firstName, setFirstName] = useState('');
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
  await auth.register({ firstName, email, password });
  const dest = location.state?.from || '/mon-espace';
  navigate(dest);
    } catch (err) {
      alert('Erreur inscription (demo)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section-padding" style={{ maxWidth: 520 }}>
      <h1>Inscription</h1>
      <form onSubmit={submit} style={{ display: 'grid', gap: '0.75rem' }}>
        <input type="text" placeholder="Prénom" value={firstName} onChange={e => setFirstName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required />
        <button className="btn btn-primary" disabled={loading}>{loading ? 'Inscription...' : 'S\'inscrire'}</button>
      </form>
    </div>
  );
};

export default Register;
