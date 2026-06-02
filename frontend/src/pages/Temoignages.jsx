import React from 'react';
import { Quote, Star } from 'lucide-react';
import './Home.css';

const testimonials = [
  { name: 'Sarah, 12 ans', role: 'Apprenante', quote: "Grâce à Novatech j'ai appris plein de choses utiles sur l'ordinateur, comme taper plus vite et faire de beaux exposés pour l'école !", rating: 5 },
  { name: 'Kévin, 15 ans', role: 'Apprenant', quote: "Les cours sont très pratiques. On ne fait pas que de la théorie, on crée vraiment des projets. Ça m'a donné envie de devenir développeur.", rating: 5 },
  { name: 'Mme Agossou', role: 'Parent d\'élève', quote: "Très bon suivi de la part des formateurs. Mon fils est toujours impatient d'aller à ses cours le samedi. L'équipe est très à l'écoute.", rating: 5 },
  { name: 'David, 17 ans', role: 'Apprenant', quote: "L'initiation au design graphique a été une révélation. L'environnement est motivant et le matériel est de très bonne qualité.", rating: 4 },
  { name: 'M. Tossa', role: 'Parent d\'élève', quote: "Je recommande vivement. C'est un excellent investissement pour l'avenir de nos enfants dans ce monde de plus en plus numérique.", rating: 5 },
  { name: 'Aminata, 14 ans', role: 'Apprenante', quote: "J'avais peur que ce soit trop compliqué mais les profs expliquent super bien. J'adore créer mes propres petits jeux et animations.", rating: 5 },
];

const Temoignages = () => {
  return (
    <div className="page-transition">
      <div className="page-header" style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '4rem 0', textAlign: 'center' }}>
        <div className="container">
          <div className="section-eyebrow" style={{ color: 'var(--color-accent)' }}>Ils parlent de nous</div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Témoignages</h1>
          <p style={{ maxWidth: 800, margin: '0 auto', fontSize: '1.1rem', opacity: 0.9 }}>
            Découvrez les retours d'expérience de nos apprenants et de leurs parents.
          </p>
        </div>
      </div>

      <div className="container section-padding">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {testimonials.map((t, i) => (
            <div 
              key={i} 
              style={{ 
                background: 'var(--color-white)', 
                padding: '2.5rem 2rem', 
                borderRadius: 'var(--radius-lg)', 
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--color-border)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <Quote size={40} color="rgba(212,160,23,0.15)" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }} />
              
              <div>
                <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '1.5rem' }}>
                  {[...Array(5)].map((_, index) => (
                    <Star key={index} size={16} fill={index < t.rating ? "var(--color-accent)" : "transparent"} color={index < t.rating ? "var(--color-accent)" : "var(--color-border)"} />
                  ))}
                </div>
                <p style={{ fontStyle: 'italic', color: 'var(--color-text-muted)', lineHeight: 1.7, fontSize: '1.05rem', marginBottom: '2rem' }}>
                  "{t.quote}"
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{t.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-accent)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Temoignages;
