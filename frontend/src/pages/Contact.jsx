import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import './Home.css';

const Contact = () => {
  return (
    <div className="page-transition">

      {/* En-tête sobre */}
      <div className="page-top-bar">
        <div className="container">
          <h1>Contactez-nous</h1>
          <p className="page-top-desc">
            Notre équipe répond à toutes vos questions concernant nos formations, horaires et modalités d'inscription.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '4rem', paddingBottom: '5rem' }}>
        <div className="contact-page-grid">

          {/* Coordonnées */}
          <div className="contact-page-left">
            <h2>Nos coordonnées</h2>
            <p>Disponibles du lundi au samedi, de 8h à 18h. Réponse garantie sous 24h.</p>

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
                  <span className="coord-label">Téléphone</span>
                  <span className="coord-value">+229 0191348557</span>
                </div>
              </a>
              <div className="coord-item">
                <div className="coord-icon"><MapPin size={20} /></div>
                <div>
                  <span className="coord-label">Adresse</span>
                  <span className="coord-value">Cotonou, Bénin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <form
            className="contact-page-form"
            onSubmit={(e) => { e.preventDefault(); alert('Message envoyé !'); }}
          >
            <h3>Envoyez-nous un message</h3>
            <div className="form-row-2">
              <div className="form-field">
                <label>Nom complet *</label>
                <input type="text" placeholder="Jean Dupont" required />
              </div>
              <div className="form-field">
                <label>Email *</label>
                <input type="email" placeholder="jean@example.com" required />
              </div>
            </div>
            <div className="form-field">
              <label>Message *</label>
              <textarea rows={5} placeholder="Comment pouvons-nous vous aider ?" required></textarea>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }}>
              Envoyer <Send size={16} />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Contact;
