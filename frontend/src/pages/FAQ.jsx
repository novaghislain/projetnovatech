import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './Home.css';

const faqs = [
  { q: 'Quels âges couvrez-vous ?', a: "Nos programmes ciblent les enfants et jeunes de 8 à 18 ans, répartis en groupes d'âge pour garantir une pédagogie adaptée." },
  { q: "Comment s'inscrire ?", a: "Rendez-vous sur la page des formations, choisissez le programme qui vous intéresse et cliquez sur 'S'inscrire'. Le paiement sécurisé validera définitivement votre place." },
  { q: 'Y a-t-il des certificats délivrés ?', a: "Oui, des attestations de réussite sont délivrées à la fin de toutes nos formations longues pour valoriser les compétences acquises." },
  { q: 'Proposez-vous des cours en ligne ?', a: "Oui, nous proposons des sessions en présentiel dans nos locaux et des sessions en ligne interactives pour ceux qui ne peuvent pas se déplacer." },
  { q: 'Puis-je payer en plusieurs fois ?', a: "Actuellement, le paiement intégral est requis à l'inscription pour bloquer votre place, nos groupes étant très limités (10 places max)." },
  { q: "Dois-je fournir un ordinateur à mon enfant ?", a: "Pour les cours en ligne, oui. Pour les cours en présentiel, nous mettons des équipements de pointe à la disposition de chaque apprenant." }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="page-transition">

      <div className="page-top-bar">
        <div className="container">
          <h1>Foire aux Questions</h1>
          <p className="page-top-desc">
            Les réponses aux questions les plus fréquemment posées par les parents et les apprenants.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '4rem 2rem 5rem', maxWidth: '780px', margin: '0 auto' }}>
        <div className="faq-list">
          {faqs.map((f, i) => (
            <div className={`faq-item ${openIndex === i ? 'faq-item--open' : ''}`} key={i}>
              <button className="faq-question" onClick={() => toggle(i)}>
                <span>{f.q}</span>
                <ChevronDown size={20} className="faq-chevron" />
              </button>
              <div className="faq-answer">
                <p>{f.a}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="faq-cta">
          <p>Vous n'avez pas trouvé votre réponse ?</p>
          <a href="/contact" className="btn btn-primary">Contactez-nous</a>
        </div>
      </div>

    </div>
  );
};

export default FAQ;
