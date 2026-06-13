import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import './Home.css';

const Apropos = () => {
  const { language } = useLanguage();

  return (
    <div className="page-transition">

      {/* ── En-tête de page ── */}
      <div className="page-top-bar" style={{ animation: 'fadeUp 0.8s ease both' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ animation: 'fadeUp 0.8s ease 0.2s both' }}>
            {language === 'en' ? 'About FormationNova' : 'À Propos de FormationNova'}
          </h1>
          <p className="page-top-desc" style={{ animation: 'fadeUp 0.8s ease 0.4s both' }}>
            {language === 'en' 
              ? 'Discover the mission, values, and people behind FormationNova.' 
              : 'Découvrez la mission, les valeurs et les personnes derrière FormationNova.'}
          </p>
        </div>
      </div>

      {/* Qui sommes-nous */}
      <section className="apropos-intro" style={{ padding: '5rem 0' }}>
        <div className="container apropos-intro-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          <div className="apropos-img" style={{ textAlign: 'center' }}>
            <img 
              src="/image2-removebg-preview.png" 
              alt="Ghislain Jules EDA — Fondateur et Directeur" 
              style={{ 
                width: '100%', 
                maxWidth: '400px', 
                height: 'auto', 
                maxHeight: '450px', 
                objectFit: 'contain', 
                objectPosition: 'bottom center',
                filter: 'drop-shadow(0 20px 30px rgba(15, 52, 96, 0.15))'
              }} 
            />
          </div>
          <div className="apropos-text">
            <h2 style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>
              {language === 'en' ? 'Our Expertise & Our New Vision' : 'Notre Expertise & Notre Nouvelle Vision'}
            </h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              {language === 'en' 
                ? "Founded by Ghislain Jules EDA, its Director, FormationNova is fundamentally a technology company with strong digital expertise: software development, IT automation, and tech equipment. We help businesses optimize their processes through innovative solutions on a daily basis."
                : "Fondée par Ghislain Jules EDA, son Directeur, FormationNova est avant tout une entreprise technologique dotée d'une forte expertise numérique : développement logiciel, automatisation et fourniture d'équipements informatiques."}
            </p>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              {language === 'en'
                ? "Why did we branch into kids' education? Because we noticed a simple fact: in an increasingly digital world, most young people remain mere consumers of technology. With our professional IT background, we decided to step up and share our passion."
                : "Pourquoi nous lancer dans l'éducation des enfants ? Parce que nous avons fait un constat simple : dans un monde hyper-connecté, la majorité des jeunes restent de simples consommateurs de technologie. Forts de notre expérience, nous avons décidé de partager notre passion."}
            </p>
            <p style={{ fontSize: '1.25rem', lineHeight: '1.6', color: 'var(--color-primary)', fontWeight: 700 }}>
              {language === 'en'
                ? "Today, our mission is clear: training kids and teens from 8 to 18 years old to master IT and become the creators of tomorrow."
                : "Aujourd'hui, notre mission est claire : former les jeunes de 8 à 18 ans pour qu'ils maîtrisent l'informatique et deviennent les créateurs de demain."}
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="apropos-mv" style={{ backgroundColor: 'var(--color-bg-light)', padding: '5rem 0' }}>
        <div className="container apropos-mv-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
          <div className="mv-card mv-card--mission" style={{ backgroundColor: '#fff', padding: '3rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <div className="mv-card-head" style={{ marginBottom: '1.5rem' }}>
              <span style={{ backgroundColor: 'var(--color-accent)', color: '#fff', padding: '0.4rem 1rem', borderRadius: '30px', fontWeight: 700, fontSize: '0.9rem' }}>{language === 'en' ? 'Mission' : 'Mission'}</span>
            </div>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>{language === 'en' ? 'What we do' : 'Ce que nous faisons'}</h3>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7' }}>
              {language === 'en'
                ? 'Turn young people into creators rather than just consumers of technology, by teaching them practical skills.'
                : "Faire des jeunes des créateurs plutôt que de simples consommateurs de technologie, en leur transmettant des compétences concrètes."}
            </p>
          </div>
          <div className="mv-card mv-card--vision" style={{ backgroundColor: '#fff', padding: '3rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <div className="mv-card-head" style={{ marginBottom: '1.5rem' }}>
              <span style={{ backgroundColor: 'var(--color-primary)', color: '#fff', padding: '0.4rem 1rem', borderRadius: '30px', fontWeight: 700, fontSize: '0.9rem' }}>{language === 'en' ? 'Vision' : 'Vision'}</span>
            </div>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>{language === 'en' ? 'Where we are going' : 'Vers où nous allons'}</h3>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7' }}>
              {language === 'en'
                ? 'Become the African reference for practical IT training for kids and teens, offering human, clear, and accessible learning.'
                : "Devenir la référence africaine de la formation numérique pour les jeunes, grâce à un apprentissage humain, clair et accessible."}
            </p>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="apropos-valeurs">
        <div className="container">
          <h2>{language === 'en' ? 'Our Core Values' : 'Nos valeurs fondamentales'}</h2>
          <div className="valeurs-grid">
            {[
              {
                titre: language === 'en' ? 'Transparency' : 'Transparence',
                texte: language === 'en'
                  ? "No false promises. IT is learned through practical work."
                  : "Pas de fausses promesses. L'informatique s'apprend par la pratique."
              },
              {
                titre: language === 'en' ? 'Discipline' : 'Discipline',
                texte: language === 'en'
                  ? "Teaching professional rigor from a young age."
                  : "Apprendre la rigueur professionnelle dès le plus jeune âge."
              },
              {
                titre: language === 'en' ? 'Benevolence' : 'Bienveillance',
                texte: language === 'en'
                  ? "A healthy, motivating, and judgment-free learning environment."
                  : "Un cadre d'apprentissage sain, motivant et sans jugement."
              },
            ].map((v, i) => (
              <div className="valeur-item" key={i}>
                <div className="valeur-icon"><CheckCircle2 size={22} /></div>
                <h4>{v.titre}</h4>
                <p>{v.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Apropos;
