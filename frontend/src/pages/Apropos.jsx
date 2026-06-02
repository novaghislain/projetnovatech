import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import './Home.css';

const Apropos = () => {
  return (
    <div className="page-transition" style={{ backgroundColor: '#fafafa', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* HEADER SECTION */}
      <div className="page-header" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 800 }}>À Propos</h1>
          <p style={{ maxWidth: 600, margin: '0 auto', fontSize: '1.2rem', opacity: 0.9 }}>
            Découvrez l'histoire et la mission derrière Novatech Vision.
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '4rem' }}>
        
        {/* PRESENTATION COURTE */}
        <div style={{ display: 'flex', gap: '4rem', alignItems: 'center', justifyContent: 'center', marginBottom: '6rem', flexWrap: 'wrap' }}>
          <img src="/image1.png" alt="Ghislain Jules EDA" style={{ width: '320px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }} />
          <div style={{ maxWidth: '500px' }}>
            <p style={{ lineHeight: 1.9, fontSize: '1.1rem', color: '#4a5568' }}>
              Je suis <strong>Ghislain Jules EDA</strong>.
            </p>
            <p style={{ lineHeight: 1.9, fontSize: '1.1rem', color: '#4a5568', marginTop: '1rem' }}>
              Novatech Vision est un organisme de formation spécialisé dans l'éducation informatique des enfants et jeunes de 8 à 18 ans. 
            </p>
            <p style={{ lineHeight: 1.9, fontSize: '1.1rem', color: '#4a5568', marginTop: '1rem' }}>
              La structure propose des formations axées sur les compétences numériques fondamentales, la maîtrise des outils bureautiques, la navigation internet sécurisée, et l'initiation à l'Intelligence Artificielle.
            </p>
          </div>
        </div>

        {/* MISSION & VISION */}
        <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '6rem' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '3.5rem 3rem', flex: '1 1 400px', maxWidth: '500px', boxShadow: '0 15px 35px rgba(0,0,0,0.04)', borderTop: '5px solid var(--color-accent)' }}>
            <h3 style={{ color: 'var(--color-accent)', fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: 800 }}>Ma Mission</h3>
            <p style={{ color: '#4a5568', lineHeight: 1.8, fontSize: '1.05rem' }}>
              Accompagner les jeunes qui souhaitent découvrir le numérique autrement : avec plus de simplicité, de compréhension et de structure. Mon but est de leur faire gagner du temps et de leur éviter les erreurs classiques d'apprentissage.
            </p>
          </div>
          <div style={{ background: 'white', borderRadius: '24px', padding: '3.5rem 3rem', flex: '1 1 400px', maxWidth: '500px', boxShadow: '0 15px 35px rgba(0,0,0,0.04)', borderTop: '5px solid #2d6a4f' }}>
            <h3 style={{ color: '#2d6a4f', fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: 800 }}>Ma Vision</h3>
            <p style={{ color: '#4a5568', lineHeight: 1.8, fontSize: '1.05rem' }}>
              À travers cette plateforme, je souhaite rendre l'apprentissage informatique plus humain, plus clair et plus accessible à une nouvelle génération tournée vers le digital, l'innovation et l'évolution personnelle.
            </p>
          </div>
        </div>

        {/* VALEURS */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2.2rem', color: '#4a5568', marginBottom: '3rem', fontWeight: 800 }}>
            <span style={{ color: 'var(--color-accent)' }}>Mes Valeurs</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            
            <div style={{ background: 'white', padding: '3rem 2.5rem', borderRadius: '24px', boxShadow: '0 15px 35px rgba(0,0,0,0.04)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--color-accent)' }}>
                <CheckCircle2 size={24} />
              </div>
              <h4 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--color-primary)', fontWeight: 800 }}>Transparence</h4>
              <p style={{ color: '#4a5568', lineHeight: 1.7, fontSize: '1rem' }}>Pas de fausses promesses. L'informatique demande du travail et de la pratique, et je vous dis la vérité sur ce que cela implique.</p>
            </div>

            <div style={{ background: 'white', padding: '3rem 2.5rem', borderRadius: '24px', boxShadow: '0 15px 35px rgba(0,0,0,0.04)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #2d6a4f', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#2d6a4f' }}>
                <CheckCircle2 size={24} />
              </div>
              <h4 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--color-primary)', fontWeight: 800 }}>Discipline</h4>
              <p style={{ color: '#4a5568', lineHeight: 1.7, fontSize: '1rem' }}>C'est la clé de la réussite. Je vous apprends à développer une rigueur professionnelle et inébranlable dès le jeune âge.</p>
            </div>

            <div style={{ background: 'white', padding: '3rem 2.5rem', borderRadius: '24px', boxShadow: '0 15px 35px rgba(0,0,0,0.04)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--color-accent)' }}>
                <CheckCircle2 size={24} />
              </div>
              <h4 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--color-primary)', fontWeight: 800 }}>Bienveillance</h4>
              <p style={{ color: '#4a5568', lineHeight: 1.7, fontSize: '1rem' }}>Un apprentissage dans un cadre sain, motivant et sans jugement, particulièrement adapté pour les jeunes débutants.</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Apropos;
