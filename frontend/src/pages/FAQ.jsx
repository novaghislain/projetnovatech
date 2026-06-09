import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';
import { useLanguage } from '../contexts/LanguageContext';
import './Home.css';

const faqsFr = [
  { q: 'Quels âges couvrez-vous ?', a: "Nos programmes ciblent les enfants et jeunes de 8 à 18 ans, répartis en groupes d'âge pour garantir une pédagogie adaptée." },
  { q: "Comment s'inscrire ?", a: "Rendez-vous sur la page des formations, choisissez le programme qui vous intéresse et cliquez sur 'S'inscrire'. Le paiement sécurisé validera définitivement votre place." },
  { q: 'Y a-t-il des certificats délivrés ?', a: "Oui, des attestations de réussite sont délivrées à la fin de toutes nos formations longues pour valoriser les compétences acquises." },
  { q: 'Proposez-vous des cours en ligne ?', a: "Oui, nous proposons des sessions en présentiel dans nos locaux et des sessions en ligne interactives pour ceux qui ne peuvent pas se déplacer." },
  { q: 'Puis-je payer en plusieurs fois ?', a: "Actuellement, le paiement intégral est requis à l'inscription pour bloquer votre place, nos groupes étant très limités (10 places max)." },
  { q: "Dois-je fournir un ordinateur à mon enfant ?", a: "Pour les cours en ligne, oui. Pour les cours en présentiel, nous mettons des équipements de pointe à la disposition de chaque apprenant." }
];

const faqsEn = [
  { q: 'What ages do you cover?', a: "Our programs target kids and teens from 8 to 18 years old, divided into age groups to guarantee tailored pedagogy." },
  { q: "How to enroll?", a: "Go to the courses page, choose the program you are interested in and click on 'Enroll'. Safe online payment will confirm your spot." },
  { q: "Are certificates awarded?", a: "Yes, certificates of completion are awarded at the end of all our long training programs to highlight the skills acquired." },
  { q: "Do you offer online courses?", a: "Yes, we offer in-person sessions at our locations and interactive online sessions for those who cannot travel." },
  { q: "Can I pay in installments?", a: "Currently, full payment is required at registration to secure your spot, as our groups are very limited (10 spots max)." },
  { q: "Do I need to provide a computer for my child?", a: "For online courses, yes. For in-person courses, we place state-of-the-art equipment at the disposal of each learner." }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);
  const { language } = useLanguage();

  const [dynamicContent, setDynamicContent] = useState('');
  const [loading, setLoading] = useState(true);

  const faqs = language === 'en' ? faqsEn : faqsFr;

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/public/pages/faq${language === 'en' ? '_en' : ''}`);
        if (response.data && response.data.content) {
          setDynamicContent(response.data.content);
        }
      } catch (err) {
        console.error("Error fetching FAQ page:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [language]);

  const parseMarkdown = (markdown) => {
    if (!markdown) return '';
    let html = markdown;
    html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');
    const paragraphs = html.split(/\n{2,}/);
    return paragraphs.map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<li')) return p;
      return `<p style="margin-bottom: 1rem; line-height: 1.6; color: #444;">${p.replace(/\n/g, '<br/>')}</p>`;
    }).join('');
  };

  if (!loading && dynamicContent) {
    return (
      <div className="page-transition">
        <div className="page-top-bar">
          <div className="container">
            <h1>{language === 'en' ? 'Frequently Asked Questions' : 'Foire aux Questions'}</h1>
            <p className="page-top-desc">
              {language === 'en' 
                ? 'Answers to the most frequently asked questions by parents and learners.'
                : 'Les réponses aux questions les plus fréquemment posées par les parents et les apprenants.'}
            </p>
          </div>
        </div>
        <div className="container" style={{ padding: '4rem 2rem 5rem', maxWidth: '780px', margin: '0 auto' }}>
          <div 
            className="markdown-body"
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              padding: '2.5rem',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.18)'
            }}
            dangerouslySetInnerHTML={{ __html: parseMarkdown(dynamicContent) }}
          />
          <div className="faq-cta" style={{ marginTop: '2rem' }}>
            <p>{language === 'en' ? "Didn't find your answer?" : "Vous n'avez pas trouvé votre réponse ?"}</p>
            <a href="/contact" className="btn btn-primary">{language === 'en' ? 'Contact Us' : 'Contactez-nous'}</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition">

      <div className="page-top-bar">
        <div className="container">
          <h1>{language === 'en' ? 'Frequently Asked Questions' : 'Foire aux Questions'}</h1>
          <p className="page-top-desc">
            {language === 'en' 
              ? 'Answers to the most frequently asked questions by parents and learners.'
              : 'Les réponses aux questions les plus fréquemment posées par les parents et les apprenants.'}
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
          <p>{language === 'en' ? "Didn't find your answer?" : "Vous n'avez pas trouvé votre réponse ?"}</p>
          <a href="/contact" className="btn btn-primary">{language === 'en' ? 'Contact Us' : 'Contactez-nous'}</a>
        </div>
      </div>

    </div>
  );
};

export default FAQ;
