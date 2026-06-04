import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Camera, Trash2, User, Upload, Settings, Lock, Save } from 'lucide-react';
import './Home.css';

const Parametres = () => {
  const { user, updateUserDetails } = useAuth();
  
  // States pour la photo
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [msgAvatar, setMsgAvatar] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  // States pour le profil
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [msgProfile, setMsgProfile] = useState({ type: '', text: '' });

  // States pour la sécurité
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingPwd, setLoadingPwd] = useState(false);
  const [msgPwd, setMsgPwd] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [user]);

  // --- Gestion Avatar ---
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setLoadingAvatar(true);
      setMsgAvatar({ type: '', text: '' });

      const token = localStorage.getItem('nv_token');
      const response = await fetch('http://localhost:5001/api/user/avatar', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur lors de l'upload");

      if (updateUserDetails) updateUserDetails({ avatar: data.avatar });
      setMsgAvatar({ type: 'success', text: 'Photo mise à jour avec succès.' });
    } catch (err) {
      setMsgAvatar({ type: 'error', text: err.message });
    } finally {
      setLoadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer votre photo de profil ?')) return;

    try {
      setLoadingAvatar(true);
      setMsgAvatar({ type: '', text: '' });

      const token = localStorage.getItem('nv_token');
      const response = await fetch('http://localhost:5001/api/user/avatar', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur lors de la suppression');

      if (updateUserDetails) updateUserDetails({ avatar: null });
      setMsgAvatar({ type: 'success', text: 'Photo supprimée.' });
    } catch (err) {
      setMsgAvatar({ type: 'error', text: err.message });
    } finally {
      setLoadingAvatar(false);
    }
  };

  // --- Gestion Profil ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoadingProfile(true);
      setMsgProfile({ type: '', text: '' });

      const token = localStorage.getItem('nv_token');
      const response = await fetch('http://localhost:5001/api/user/profile', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ firstName, lastName })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur de mise à jour');

      if (updateUserDetails) updateUserDetails({ firstName, lastName });
      setMsgProfile({ type: 'success', text: 'Profil mis à jour avec succès.' });
    } catch (err) {
      setMsgProfile({ type: 'error', text: err.message });
    } finally {
      setLoadingProfile(false);
    }
  };

  // --- Gestion Sécurité ---
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setMsgPwd({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas.' });
    }

    try {
      setLoadingPwd(true);
      setMsgPwd({ type: '', text: '' });

      const token = localStorage.getItem('nv_token');
      const response = await fetch('http://localhost:5001/api/user/password', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur lors du changement de mot de passe');

      setMsgPwd({ type: 'success', text: 'Mot de passe modifié avec succès.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMsgPwd({ type: 'error', text: err.message });
    } finally {
      setLoadingPwd(false);
    }
  };

  return (
    <div className="page-transition" style={{ backgroundColor: 'var(--color-bg-light)', minHeight: '80vh', padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '1rem', borderRadius: '12px' }}>
            <Settings size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', color: 'var(--color-primary)', margin: 0 }}>Paramètres du compte</h1>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Gérez votre profil et vos informations personnelles</p>
          </div>
        </div>

        {/* 1. PHOTO DE PROFIL */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} /> Photo de profil
          </h2>

          {msgAvatar.text && (
            <div style={{ color: 'white', backgroundColor: msgAvatar.type === 'error' ? '#ef4444' : '#22c55e', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              {msgAvatar.text}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ 
              width: '100px', height: '100px', borderRadius: '50%', 
              backgroundColor: 'var(--color-primary)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              fontSize: '2.5rem', fontWeight: 'bold'
            }}>
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.firstName ? user.firstName.charAt(0).toUpperCase() : <User size={40} />
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
              <button onClick={() => fileInputRef.current.click()} disabled={loadingAvatar} className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={16} /> {loadingAvatar ? 'Chargement...' : 'Modifier la photo'}
              </button>

              {user?.avatar && (
                <button onClick={handleDeleteAvatar} disabled={loadingAvatar} className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fee2e2', color: '#dc2626', borderColor: '#fca5a5' }}>
                  <Trash2 size={16} /> Supprimer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. INFORMATIONS PERSONNELLES */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
           <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={20} /> Informations personnelles
          </h2>
          
          {msgProfile.text && (
            <div style={{ color: 'white', backgroundColor: msgProfile.type === 'error' ? '#ef4444' : '#22c55e', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              {msgProfile.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#444' }}>Prénom</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="form-control" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#444' }}>Nom</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="form-control" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#444' }}>Adresse Email</label>
                <input type="email" value={user?.email || ''} readOnly className="form-control" style={{ backgroundColor: '#f5f5f5', color: '#777', cursor: 'not-allowed' }} />
                <span style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.4rem', display: 'block' }}>L'adresse email ne peut pas être modifiée pour des raisons de sécurité.</span>
              </div>
            </div>
            <button type="submit" disabled={loadingProfile} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={16} /> {loadingProfile ? 'Enregistrement...' : 'Enregistrer le profil'}
            </button>
          </form>
        </div>

        {/* 3. SÉCURITÉ */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
           <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={20} /> Sécurité (Mot de passe)
          </h2>

          {msgPwd.text && (
            <div style={{ color: 'white', backgroundColor: msgPwd.type === 'error' ? '#ef4444' : '#22c55e', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              {msgPwd.text}
            </div>
          )}

          <form onSubmit={handleUpdatePassword}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '1.5rem', maxWidth: '500px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#444' }}>Mot de passe actuel</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="form-control" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#444' }}>Nouveau mot de passe</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="form-control" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#444' }}>Confirmer le nouveau mot de passe</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="form-control" />
              </div>
            </div>
            <button type="submit" disabled={loadingPwd} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#1e293b', color: 'white' }}>
              <Lock size={16} /> {loadingPwd ? 'Mise à jour...' : 'Changer de mot de passe'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Parametres;
