import React from 'react';
import './Home.css';

const testimonials = [
  { name: 'Sarah, 12 ans', quote: "Grâce à Novatech j'ai appris plein de choses utiles." },
  { name: 'Kévin, 15 ans', quote: "Les cours sont pratiques et motivants." },
  { name: 'Mme Agossou', quote: "Très bon suivi et équipe à l'écoute." },
];

const Temoignages = () => {
  return (
    <div className="container section-padding">
      <div className="text-center">
        <h1>Témoignages</h1>
        <p style={{ maxWidth: 800, margin: '1rem auto', color: 'var(--color-text-muted)' }}>Retours d'apprenants et de parents.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {testimonials.map((t, i) => (
          <div key={i} style={{ background: 'var(--color-white)', padding: '1rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
            <p style={{ fontStyle: 'italic' }}>&quot;{t.quote}&quot;</p>
            <div style={{ marginTop: '0.75rem', fontWeight: 700 }}>{t.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Temoignages;
