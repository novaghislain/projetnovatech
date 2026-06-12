import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { API_URL } from '../config';
import { useLanguage } from '../contexts/LanguageContext';
import './Home.css';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', body: '' });
  const [status, setStatus] = useState('idle');
  const { language, t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch(`${API_URL}/api/public/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, subject: 'Message de contact', body: formData.body })
      });
      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', body: '' });
        // Déclencher l'événement Meta Pixel Lead
        try { if (window.fbq) window.fbq('track', 'Lead'); } catch(e) {}
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="page-transition">

      {/* En-tête */}
      <div className="page-top-bar" style={{ animation: 'fadeUp 0.8s ease both' }}>
        <div className="container">
          <h1 style={{ animation: 'fadeUp 0.8s ease 0.2s both' }}>
            {language === 'en' ? 'Contact Us' : 'Contactez-nous'}
          </h1>
          <p className="page-top-desc" style={{ animation: 'fadeUp 0.8s ease 0.4s both' }}>
            {language === 'en' 
              ? 'Our team is here to answer all your questions about our training programs, schedules, and registration details.'
              : "Notre équipe répond à toutes vos questions concernant nos formations, horaires et modalités d'inscription."}
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '4rem', paddingBottom: '5rem' }}>
        <div className="contact-page-grid">

          {/* Coordonnées */}
          <div className="contact-page-left">
            <h2>{language === 'en' ? 'Our Contact Details' : 'Nos coordonnées'}</h2>
            <p>
              {language === 'en'
                ? 'Available Monday to Saturday, from 8am to 6pm. Response guaranteed within 24h.'
                : 'Disponibles du lundi au samedi, de 8h à 18h. Réponse garantie sous 24h.'}
            </p>

            <div className="contact-page-coords">
              <a href="mailto:contact@novatechvision.com" className="coord-item">
                <div className="coord-icon"><Mail size={20} /></div>
                <div>
                  <span className="coord-label">Email</span>
                  <span className="coord-value">contact@novatechvision.com</span>
                </div>
              </a>
              <a href="tel:+2290191348557" className="coord-item">
                <div className="coord-icon"><Phone size={20} /></div>
                <div>
                  <span className="coord-label">{language === 'en' ? 'Phone' : 'Téléphone'}</span>
                  <span className="coord-value">+229 0191348557</span>
                </div>
              </a>
              <div className="coord-item">
                <div className="coord-icon"><MapPin size={20} /></div>
                <div>
                  <span className="coord-label">{language === 'en' ? 'Address' : 'Adresse'}</span>
                  <span className="coord-value">Cotonou, Bénin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <form
            className="contact-page-form"
            onSubmit={handleSubmit}
          >
            <h3>{language === 'en' ? 'Send Us a Message' : 'Envoyez-nous un message'}</h3>
            {status === 'success' && (
              <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #bbf7d0' }}>
                {language === 'en' ? 'Your message has been sent successfully! We will reply very soon.' : 'Votre message a été envoyé avec succès ! Nous vous répondrons très vite.'}
              </div>
            )}
            {status === 'error' && (
              <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fecaca' }}>
                {language === 'en' ? 'Error sending message. Please try again.' : "Erreur lors de l'envoi du message. Veuillez réessayer."}
              </div>
            )}
            <div className="form-row-2">
              <div className="form-field">
                <label>{language === 'en' ? 'Full name *' : 'Nom complet *'}</label>
                <input type="text" placeholder="Jean Dupont" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-field">
                <label>Email *</label>
                <input type="email" placeholder="jean@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>
            </div>
            <div className="form-field">
              <label>Message *</label>
              <textarea rows={5} placeholder={language === 'en' ? 'How can we help you?' : 'Comment pouvons-nous vous aider ?'} value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})} required></textarea>
            </div>
            <button type="submit" disabled={status === 'loading'} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', opacity: status === 'loading' ? 0.7 : 1 }}>
              {status === 'loading' 
                ? (language === 'en' ? 'Sending...' : 'Envoi en cours...') 
                : <>{language === 'en' ? 'Send' : 'Envoyer'} <Send size={16} /></>}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Contact;
