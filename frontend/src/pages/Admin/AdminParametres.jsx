import React, { useState, useEffect } from 'react';
import { Search, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { API_URL } from '../../config';

const ParametresCEO = () => {
  const [settings, setSettings] = useState({
    seoTitle: '',
    seoDescription: '',
    contactReceiverEmail: '',
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPass: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [openSections, setOpenSections] = useState({
    seo: true,
    emails: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('nv_token');
      const res = await fetch(`${API_URL}/api/admin/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Erreur de récupération des paramètres");
      const data = await res.json();
      setSettings(prev => ({ ...prev, ...data }));
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveField = async (fieldName) => {
    setSavingField(fieldName);
    setMessage({ text: '', type: '' });
    
    try {
      const token = localStorage.getItem('nv_token');
      const res = await fetch(`${API_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      
      if (!res.ok) throw new Error("Erreur lors de la sauvegarde");
      
      setMessage({ text: "Paramètre sauvegardé avec succès !", type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSavingField('');
    }
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
        Chargement des paramètres...
      </div>
    );
  }

  const pageTitleStyle = { fontSize: '2rem', fontWeight: '900', marginBottom: '0.5rem', display: 'flex', gap: '8px' };
  const titlePink = { color: '#E11D48' };
  const titleGreen = { color: '#2C5E43' };
  const subtitleStyle = { color: '#6B7280', fontSize: '0.95rem', marginBottom: '2rem' };
  const sectionHeaderStyle = { background: '#FDF2F8', padding: '1rem 1.5rem', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid #FCE7F3' };
  const sectionTitleStyle = { display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', color: '#111827', fontSize: '1rem' };
  const sectionBodyStyle = { background: 'white', padding: '1.5rem', borderRadius: '0 0 12px 12px', border: '1px solid #F3F4F6', borderTop: 'none', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)' };
  const fieldWrapperStyle = { marginBottom: '1.5rem' };
  const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' };
  const inputRowStyle = { display: 'flex', gap: '1rem', alignItems: 'center' };
  const inputStyle = { flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.95rem', outline: 'none', color: '#1F2937' };
  const saveBtnStyle = { background: '#E84587', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' };
  const saveBtnDisabledStyle = { ...saveBtnStyle, background: '#F9A8D4', cursor: 'not-allowed' };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
      <h1 style={pageTitleStyle}>
        <span style={titlePink}>Paramètres</span>
        <span style={titleGreen}>CEO</span>
      </h1>
      <p style={subtitleStyle}>Gérez ici le référencement de votre plateforme et les paramètres d'envoi d'e-mails professionnels.</p>

      {message.text && (
        <div style={{ padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', background: message.type === 'error' ? '#FEF2F2' : '#ECFDF5', color: message.type === 'error' ? '#DC2626' : '#059669', border: `1px solid ${message.type === 'error' ? '#FECACA' : '#A7F3D0'}` }}>
          {message.text}
        </div>
      )}

      <div>
        <div style={sectionHeaderStyle} onClick={() => toggleSection('seo')}>
          <div style={sectionTitleStyle}><Search size={18} color="#4B5563" />Référencement (SEO)</div>
          {openSections.seo ? <ChevronUp size={20} color="#6B7280" /> : <ChevronDown size={20} color="#6B7280" />}
        </div>
        {openSections.seo && (
          <div style={sectionBodyStyle}>
            <div style={fieldWrapperStyle}>
              <label style={labelStyle}>seo_title</label>
              <div style={inputRowStyle}>
                <input type="text" value={settings.seoTitle || ''} onChange={(e) => setSettings({...settings, seoTitle: e.target.value})} style={inputStyle} />
                <button style={savingField === 'seoTitle' ? saveBtnDisabledStyle : saveBtnStyle} onClick={() => handleSaveField('seoTitle')} disabled={savingField === 'seoTitle'}>Sauvegarder</button>
              </div>
            </div>
            <div style={{...fieldWrapperStyle, marginBottom: 0}}>
              <label style={labelStyle}>seo_description</label>
              <div style={inputRowStyle}>
                <input type="text" value={settings.seoDescription || ''} onChange={(e) => setSettings({...settings, seoDescription: e.target.value})} style={inputStyle} />
                <button style={savingField === 'seoDescription' ? saveBtnDisabledStyle : saveBtnStyle} onClick={() => handleSaveField('seoDescription')} disabled={savingField === 'seoDescription'}>Sauvegarder</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <div style={sectionHeaderStyle} onClick={() => toggleSection('emails')}>
          <div style={sectionTitleStyle}><Mail size={18} color="#4B5563" />Configuration de réception des E-mails</div>
          {openSections.emails ? <ChevronUp size={20} color="#6B7280" /> : <ChevronDown size={20} color="#6B7280" />}
        </div>
        {openSections.emails && (
          <div style={sectionBodyStyle}>
            <div style={fieldWrapperStyle}><label style={labelStyle}>E-mail de réception</label><div style={inputRowStyle}><input type="email" value={settings.contactReceiverEmail || ''} onChange={(e) => setSettings({...settings, contactReceiverEmail: e.target.value})} style={inputStyle} /><button style={savingField === 'contactReceiverEmail' ? saveBtnDisabledStyle : saveBtnStyle} onClick={() => handleSaveField('contactReceiverEmail')} disabled={savingField === 'contactReceiverEmail'}>Sauvegarder</button></div></div>
            <div style={fieldWrapperStyle}><label style={labelStyle}>Serveur SMTP</label><div style={inputRowStyle}><input type="text" value={settings.smtpHost || ''} onChange={(e) => setSettings({...settings, smtpHost: e.target.value})} style={inputStyle} /><button style={savingField === 'smtpHost' ? saveBtnDisabledStyle : saveBtnStyle} onClick={() => handleSaveField('smtpHost')} disabled={savingField === 'smtpHost'}>Sauvegarder</button></div></div>
            <div style={fieldWrapperStyle}><label style={labelStyle}>Port SMTP</label><div style={inputRowStyle}><input type="text" value={settings.smtpPort || ''} onChange={(e) => setSettings({...settings, smtpPort: e.target.value})} style={inputStyle} /><button style={savingField === 'smtpPort' ? saveBtnDisabledStyle : saveBtnStyle} onClick={() => handleSaveField('smtpPort')} disabled={savingField === 'smtpPort'}>Sauvegarder</button></div></div>
            <div style={fieldWrapperStyle}><label style={labelStyle}>E-mail expéditeur</label><div style={inputRowStyle}><input type="email" value={settings.smtpUser || ''} onChange={(e) => setSettings({...settings, smtpUser: e.target.value})} style={inputStyle} /><button style={savingField === 'smtpUser' ? saveBtnDisabledStyle : saveBtnStyle} onClick={() => handleSaveField('smtpUser')} disabled={savingField === 'smtpUser'}>Sauvegarder</button></div></div>
            <div style={{...fieldWrapperStyle, marginBottom: 0}}><label style={labelStyle}>Mot de passe d'application</label><div style={inputRowStyle}><input type="password" value={settings.smtpPass || ''} onChange={(e) => setSettings({...settings, smtpPass: e.target.value})} style={inputStyle} /><button style={savingField === 'smtpPass' ? saveBtnDisabledStyle : saveBtnStyle} onClick={() => handleSaveField('smtpPass')} disabled={savingField === 'smtpPass'}>Sauvegarder</button></div></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminParametres;
