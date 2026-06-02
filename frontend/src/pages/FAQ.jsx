import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import './Home.css';

const faqs = [
  { q: 'Quels âges couvrez-vous ?', a: "Nos programmes ciblent les enfants et jeunes de 8 à 18 ans, répartis en groupes d'âge pour garantir une pédagogie adaptée." },
  { q: 'Comment s\'inscrire ?', a: "Rendez-vous sur la page des formations, choisissez le programme qui vous intéresse et cliquez sur 'S'inscrire'. Le paiement sécurisé validera définitivement votre place." },
  { q: 'Y a-t-il des certificats délivrés ?', a: "Oui, des attestations de réussite sont délivrées à la fin de toutes nos formations longues pour valoriser les compétences acquises." },
  { q: 'Proposez-vous des cours en ligne ?', a: "Oui, nous proposons des sessions en présentiel dans nos locaux et des sessions en ligne interactives pour ceux qui ne peuvent pas se déplacer." },
  { q: 'Puis-je payer en plusieurs fois ?', a: "Actuellement, le paiement intégral est requis à l'inscription pour bloquer votre place, nos groupes étant très limités (10 places max)." },
  { q: 'Dois-je fournir un ordinateur à mon enfant ?', a: "Pour les cours en ligne, oui. Pour les cours en présentiel, nous mettons des équipements de pointe à la disposition de chaque apprenant." }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div className="page-transition">
      <div className="page-header" style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '4rem 0', textAlign: 'center' }}>
        <div className="container">
          <div className="section-eyebrow" style={{ color: 'var(--color-accent)' }}>Des questions ?</div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Foire aux Questions</h1>
          <p style={{ maxWidth: 800, margin: '0 auto', fontSize: '1.1rem', opacity: 0.9 }}>
            Retrouvez ici les réponses aux questions les plus fréquemment posées par les parents et les apprenants.
          </p>
        </div>
      </div>

      <div className="container section-padding">
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {faqs.map((f, i) => (
            <div 
              key={i} 
              style={{ 
                marginBottom: '1rem', 
                backgroundColor: 'var(--color-white)', 
                borderRadius: '8px', 
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
                boxShadow: openIndex === i ? 'var(--shadow-md)' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              <button 
                onClick={() => toggle(i)}
                style={{ 
                  width: '100%', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '1.5rem', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <HelpCircle size={20} color={openIndex === i ? 'var(--color-accent)' : 'var(--color-text-muted)'} />
                  <strong style={{ fontSize: '1.1rem', color: openIndex === i ? 'var(--color-primary)' : 'inherit' }}>
                    {f.q}
                  </strong>
                </div>
                <ChevronDown 
                  size={20} 
                  color="var(--color-text-muted)" 
                  style={{ transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} 
                />
              </button>
              
              <div 
                style={{ 
                  maxHeight: openIndex === i ? '200px' : '0', 
                  overflow: 'hidden', 
                  transition: 'max-height 0.3s ease',
                  backgroundColor: 'var(--color-bg-light)'
                }}
              >
                <p style={{ padding: '0 1.5rem 1.5rem 3.5rem', margin: 0, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  {f.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
