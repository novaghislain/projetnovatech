import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';
import { useLanguage } from '../contexts/LanguageContext';
import './Home.css';

const Apropos = () => {
  const [dynamicContent, setDynamicContent] = useState('');
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/public/pages/apropos${language === 'en' ? '_en' : ''}`);
        if (response.data && response.data.content) {
          setDynamicContent(response.data.content);
        }
      } catch (err) {
        console.error("Error fetching about page:", err);
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
        <div className="page-top-bar" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -100, right: -50, width: 300, height: 300, background: 'radial-gradient(circle, rgba(15,52,96,0.03) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <h1>{language === 'en' ? 'About Novatech Vision' : 'À Propos de Novatech Vision'}</h1>
            <p className="page-top-desc">{language === 'en' ? 'Discover our mission, values, and commitments.' : 'Découvrez notre mission, nos valeurs et nos engagements.'}</p>
          </div>
        </div>
        <section className="container dynamic-apropos-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem', alignItems: 'center', marginBottom: '4rem' }}>
          <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(15,52,96,0.15)', backgroundColor: '#f8fafc', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '100px', height: '100px', border: '3px solid var(--color-accent)', borderRadius: '24px', zIndex: 0 }}></div>
            <img src="/image1.png" alt="Novatech Vision" style={{ width: '100%', height: '100%', maxHeight: '600px', objectFit: 'cover', objectPosition: 'top center', display: 'block', position: 'relative', zIndex: 1 }} />
          </div>
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
        </section>
      </div>
    );
  }

  return (
    <div className="page-transition">

      <div className="page-top-bar" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Motif décoratif discret */}
        <div style={{ position: 'absolute', top: -100, right: -50, width: 300, height: 300, background: 'radial-gradient(circle, rgba(15,52,96,0.03) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h1>{language === 'en' ? 'About Novatech Vision' : 'À Propos de Novatech Vision'}</h1>
          <p className="page-top-desc">
            {language === 'en' 
              ? 'Discover the mission, values, and people behind Novatech Vision.' 
              : 'Découvrez la mission, les valeurs et les personnes derrière Novatech Vision.'}
          </p>
        </div>
      </div>

      {/* Qui sommes-nous */}
      <section className="apropos-intro">
        <div className="container apropos-intro-inner">
          <div className="apropos-img">
            <img src="/image1.png" alt={language === 'en' ? 'Ghislain Jules EDA — Founder' : 'Ghislain Jules EDA — Fondateur'} />
          </div>
          <div className="apropos-text">
            <h2>Ghislain Jules EDA</h2>
            <p>
              {language === 'en' 
                ? 'Novatech Vision is a training center specialized in computer education for kids and teens from 8 to 18 years old.'
                : "Novatech Vision est un organisme de formation spécialisé dans l'éducation informatique des enfants et jeunes de 8 à 18 ans."}
            </p>
            <p>
              {language === 'en'
                ? 'The center offers training focused on fundamental digital skills, mastery of office tools, safe internet browsing, and introduction to Artificial Intelligence.'
                : "La structure propose des formations axées sur les compétences numériques fondamentales, la maîtrise des outils bureautiques, la navigation internet sécurisée, et l'initiation à l'Intelligence Artificielle."}
            </p>
            <p>
              {language === 'en'
                ? 'The goal is to make computer learning more human, clear, and accessible to a new generation focused on digital technology and innovation.'
                : "L'objectif est de rendre l'apprentissage informatique plus humain, plus clair et plus accessible à une nouvelle génération tournée vers le digital et l'innovation."}
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="apropos-mv">
        <div className="container apropos-mv-inner">
          <div className="mv-card mv-card--mission">
            <div className="mv-card-head">
              <span>{language === 'en' ? 'Mission' : 'Mission'}</span>
            </div>
            <h3>{language === 'en' ? 'What we do' : 'Ce que nous faisons'}</h3>
            <p>
              {language === 'en'
                ? 'Guiding young people who want to discover the digital world differently: with more simplicity, understanding, and structure. Our goal is to save them time and help them avoid classic learning mistakes.'
                : "Accompagner les jeunes qui souhaitent découvrir le numérique autrement : avec plus de simplicité, de compréhension et de structure. Notre but est de leur faire gagner du temps et de leur éviter les erreurs classiques d'apprentissage."}
            </p>
          </div>
          <div className="mv-card mv-card--vision">
            <div className="mv-card-head">
              <span>{language === 'en' ? 'Vision' : 'Vision'}</span>
            </div>
            <h3>{language === 'en' ? 'Where we are going' : 'Vers où nous allons'}</h3>
            <p>
              {language === 'en'
                ? 'Making Novatech Vision the reference for IT training for kids and teens in Africa — a human, clear, and accessible learning path preparing an entire generation for the challenges of the digital world.'
                : "Faire de Novatech Vision la référence de la formation numérique pour les jeunes en Afrique — un apprentissage humain, clair et accessible qui prépare une génération entière aux défis du monde digital."}
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
                  ? "No false promises. IT requires work and practice, and we tell you clearly."
                  : "Pas de fausses promesses. L'informatique demande du travail et de la pratique, et nous vous le disons clairement."
              },
              {
                titre: language === 'en' ? 'Discipline' : 'Discipline',
                texte: language === 'en'
                  ? "This is the key to success. We teach young people professional rigor from an early age."
                  : "C'est la clé de la réussite. Nous apprenons aux jeunes à développer une rigueur professionnelle dès le plus jeune âge."
              },
              {
                titre: language === 'en' ? 'Benevolence' : 'Bienveillance',
                texte: language === 'en'
                  ? "Learning in a healthy, motivating, and non-judgmental environment, especially suited for young beginners."
                  : "Un apprentissage dans un cadre sain, motivant et sans jugement, particulièrement adapté pour les jeunes débutants."
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
