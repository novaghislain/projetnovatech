import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import './Home.css';

const Contact = () => {
  return (
    <div className="page-transition">
      <div className="page-header" style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '4rem 0', textAlign: 'center' }}>
        <div className="container">
          <div className="section-eyebrow" style={{ color: 'var(--color-accent)' }}>Besoin d'aide ?</div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Contactez-nous</h1>
          <p style={{ maxWidth: 800, margin: '0 auto', fontSize: '1.1rem', opacity: 0.9 }}>
            Notre équipe est à votre disposition pour répondre à toutes vos questions concernant nos formations et modalités d'inscription.
          </p>
        </div>
      </div>

      <div className="container section-padding">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
          
          {/* INFORMATIONS DE CONTACT */}
          <div style={{ paddingRight: '2rem' }}>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: '2rem' }}>Nos Coordonnées</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                <div style={{ backgroundColor: 'rgba(212,160,23,0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--color-accent)' }}>
                  <Mail size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.3rem', color: 'var(--color-primary)' }}>Email</h4>
                  <p style={{ color: 'var(--color-text-muted)' }}>contact@novatechvision.com</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                <div style={{ backgroundColor: 'rgba(212,160,23,0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--color-accent)' }}>
                  <Phone size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.3rem', color: 'var(--color-primary)' }}>Téléphone</h4>
                  <p style={{ color: 'var(--color-text-muted)' }}>+229 0191348557</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                <div style={{ backgroundColor: 'rgba(212,160,23,0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--color-accent)' }}>
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.3rem', color: 'var(--color-primary)' }}>Adresse</h4>
                  <p style={{ color: 'var(--color-text-muted)' }}>Cotonou, Bénin</p>
                </div>
              </div>
            </div>
          </div>

          {/* FORMULAIRE DE CONTACT */}
          <div style={{ backgroundColor: 'var(--color-bg-light)', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '2rem' }}>Envoyez-nous un message</h3>
            <form className="contact-form" onSubmit={(e) => { e.preventDefault(); alert('Message envoyé avec succès !'); }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)' }}>Nom complet *</label>
                  <input type="text" name="name" placeholder="Ex: Jean Dupont" required style={{ padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontFamily: 'inherit' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)' }}>Email *</label>
                  <input type="email" name="email" placeholder="Ex: jean@example.com" required style={{ padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontFamily: 'inherit' }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)' }}>Votre message *</label>
                <textarea name="message" rows={5} placeholder="Comment pouvons-nous vous aider ?" required style={{ padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }} />
              </div>
              <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }}>
                Envoyer le message <Send size={18} />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
