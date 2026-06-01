import React from 'react';
import './Home.css';

const Apropos = () => {
  return (
    <div className="container section-padding">
      <div className="text-center">
        <h1>À propos de Novatech Vision</h1>
        <p style={{ maxWidth: 800, margin: '1rem auto', color: 'var(--color-text-muted)' }}>
          Novatech Vision est un organisme de formation dédié à l'initiation et à la montée en compétences
          des enfants et jeunes (8-18 ans) sur les technologies numériques. Notre mission est de rendre
          l'informatique accessible, sûre et ludique, via des programmes adaptés aux différents âges.
        </p>
      </div>

      <section style={{ marginTop: '2.5rem' }}>
        <h2>Notre approche</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Pédagogie active, projets pratiques et suivi personnalisé permettent à chaque apprenant de progresser
          à son rythme. Nous combinons ateliers présentiels, sessions en ligne et ressources pédagogiques modernes.
        </p>
      </section>
    </div>
  );
};

export default Apropos;
