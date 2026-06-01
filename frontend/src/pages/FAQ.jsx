import React from 'react';
import './Home.css';

const faqs = [
  { q: 'Quels âges couvrez-vous ?', a: "Nos programmes ciblent les enfants et jeunes de 8 à 18 ans." },
  { q: 'Comment s\'inscrire ?', a: "Rendez-vous sur la page d'inscription et remplissez le formulaire. Vous recevrez un e-mail de confirmation." },
  { q: 'Y a-t-il des certificats ?', a: "Oui, des attestations sont délivrées à la fin de certaines formations." },
  { q: 'Proposez-vous des cours en ligne ?', a: "Oui, nous proposons des sessions en présentiel et en ligne selon le programme." },
];

const FAQ = () => {
  return (
    <div className="container section-padding">
      <div className="text-center">
        <h1>Foire aux Questions</h1>
        <p style={{ maxWidth: 800, margin: '1rem auto', color: 'var(--color-text-muted)' }}>Questions fréquentes sur nos formations et inscriptions.</p>
      </div>

      <div style={{ marginTop: '2rem', maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}>
        {faqs.map((f, i) => (
          <div key={i} style={{ padding: '1rem 0', borderBottom: '1px solid var(--color-border)' }}>
            <strong>{f.q}</strong>
            <p style={{ marginTop: '0.5rem', color: 'var(--color-text-muted)' }}>{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
