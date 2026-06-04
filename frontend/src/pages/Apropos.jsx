import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import './Home.css';

const Apropos = () => {
  return (
    <div className="page-transition">

      <div className="page-top-bar" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Motif décoratif discret */}
        <div style={{ position: 'absolute', top: -100, right: -50, width: 300, height: 300, background: 'radial-gradient(circle, rgba(15,52,96,0.03) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h1>À Propos de Novatech Vision</h1>
          <p className="page-top-desc">
            Découvrez la mission, les valeurs et les personnes derrière Novatech Vision.
          </p>
        </div>
      </div>

      {/* Qui sommes-nous */}
      <section className="apropos-intro">
        <div className="container apropos-intro-inner">
          <div className="apropos-img">
            <img src="/image1.png" alt="Ghislain Jules EDA — Fondateur" />
          </div>
          <div className="apropos-text">
            <h2>Ghislain Jules EDA</h2>
            <p>
              Novatech Vision est un organisme de formation spécialisé dans l'éducation
              informatique des enfants et jeunes de <strong>8 à 18 ans</strong>.
            </p>
            <p>
              La structure propose des formations axées sur les compétences numériques
              fondamentales, la maîtrise des outils bureautiques, la navigation internet
              sécurisée, et l'initiation à l'Intelligence Artificielle.
            </p>
            <p>
              L'objectif est de rendre l'apprentissage informatique plus humain, plus clair
              et plus accessible à une nouvelle génération tournée vers le digital et l'innovation.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="apropos-mv">
        <div className="container apropos-mv-inner">
          <div className="mv-card mv-card--mission">
            <div className="mv-card-head">
              <span>Mission</span>
            </div>
            <h3>Ce que nous faisons</h3>
            <p>
              Accompagner les jeunes qui souhaitent découvrir le numérique autrement :
              avec plus de simplicité, de compréhension et de structure. Notre but est
              de leur faire gagner du temps et de leur éviter les erreurs classiques
              d'apprentissage.
            </p>
          </div>
          <div className="mv-card mv-card--vision">
            <div className="mv-card-head">
              <span>Vision</span>
            </div>
            <h3>Vers où nous allons</h3>
            <p>
              Faire de Novatech Vision la référence de la formation numérique pour les
              jeunes en Afrique — un apprentissage humain, clair et accessible qui
              prépare une génération entière aux défis du monde digital.
            </p>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="apropos-valeurs">
        <div className="container">
          <h2>Nos valeurs fondamentales</h2>
          <div className="valeurs-grid">
            {[
              {
                titre: 'Transparence',
                texte: "Pas de fausses promesses. L'informatique demande du travail et de la pratique, et nous vous le disons clairement."
              },
              {
                titre: 'Discipline',
                texte: "C'est la clé de la réussite. Nous apprenons aux jeunes à développer une rigueur professionnelle dès le plus jeune âge."
              },
              {
                titre: 'Bienveillance',
                texte: "Un apprentissage dans un cadre sain, motivant et sans jugement, particulièrement adapté pour les jeunes débutants."
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
