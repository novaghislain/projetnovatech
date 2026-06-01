import React from 'react';
import './Home.css';

const Contact = () => {
  return (
    <div className="container section-padding">
      <div className="text-center">
        <h1>Contactez-nous</h1>
        <p style={{ maxWidth: 800, margin: '1rem auto', color: 'var(--color-text-muted)' }}>
          Pour toute information sur les formations, inscriptions ou partenariats, contactez notre équipe.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        <div>
          <h3>Coordonnées</h3>
          <p>Email: contact@novatechvision.com</p>
          <p>Téléphone: +229 0191348557</p>
          <p>Adresse: Cotonou, Bénin</p>
        </div>

        <div>
          <h3>Envoyer un message</h3>
          <form className="contact-form" onSubmit={(e)=>{ e.preventDefault(); alert('Message envoyé (demo)'); }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input type="text" name="name" placeholder="Votre nom" required style={{ flex: 1 }} />
              <input type="email" name="email" placeholder="Votre email" required style={{ flex: 1 }} />
            </div>
            <textarea name="message" rows={6} placeholder="Votre message" required style={{ width: '100%', marginTop: '1rem' }} />
            <button className="btn btn-primary" type="submit" style={{ marginTop: '1rem' }}>Envoyer</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
