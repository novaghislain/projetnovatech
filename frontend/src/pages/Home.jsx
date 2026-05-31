import React from 'react';
import { Link } from 'react-router-dom';
import {
  Monitor, Shield, Code2, BrainCircuit, UserCheck,
  GraduationCap, BookOpen, FlaskConical, Award, Clock, ArrowRight,
  Star
} from 'lucide-react';
import './Home.css';

const programs = [
  { icon: <Monitor size={26} />, label: 'Bureautique' },
  { icon: <Shield size={26} />, label: 'Internet & Sécurité' },
  { icon: <Code2 size={26} />, label: 'Programmation' },
  { icon: <BrainCircuit size={26} />, label: 'Intelligence Artificielle' },
  { icon: <UserCheck size={26} />, label: 'Accompagnement personnalisé' },
];

const features = [
  { icon: <GraduationCap size={32} />, title: 'Formateurs qualifiés', desc: 'Des professionnels passionnés par la transmission des connaissances.' },
  { icon: <BookOpen size={32} />, title: 'Programmes adaptés', desc: 'Des contenus conçus spécifiquement pour les enfants et adolescents.' },
  { icon: <FlaskConical size={32} />, title: 'Apprentissage pratique', desc: 'Plus de pratique que de théorie pour des compétences concrètes.' },
  { icon: <Award size={32} />, title: 'Certifications', desc: 'Des attestations de participation et de fin de formation sont délivrées.' },
  { icon: <UserCheck size={32} />, title: 'Suivi individuel', desc: 'Chaque apprenant est accompagné tout au long de son parcours.' },
  { icon: <Clock size={32} />, title: 'Horaires flexibles', desc: 'Formations disponibles en présentiel, à domicile ou en ligne selon vos besoins.' },
];

const testimonials = [
  {
    name: 'Sarah, 12 ans',
    avatar: 'https://i.pravatar.cc/60?img=47',
    quote: "Grâce à Novatech Vision, j'ai appris à utiliser Word, PowerPoint et à créer mes premières présentations. Aujourd'hui, je suis beaucoup plus à l'aise avec l'ordinateur.",
  },
  {
    name: 'Kévin, 15 ans',
    avatar: 'https://i.pravatar.cc/60?img=15',
    quote: "Les cours sont simples à comprendre et très pratiques. J'ai découvert les bases de la programmation et ça m'a donné envie de poursuivre dans ce domaine.",
  },
  {
    name: 'Mme Agossou, Parent',
    avatar: 'https://i.pravatar.cc/60?img=32',
    quote: "Mon fils a gagné en autonomie et en confiance. L'équipe pédagogique est professionnelle et très attentive au suivi des enfants.",
  },
  {
    name: 'David, 17 ans',
    avatar: 'https://i.pravatar.cc/60?img=13',
    quote: "La formation sur l'intelligence artificielle était passionnante. J'ai découvert des outils modernes que je peux utiliser pour mes études.",
  },
];

const galleryImages = [
  'https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=800&auto=format&fit=crop',
];

const stats = [
  { value: '500+', label: 'Enfants formés' },
  { value: '15+', label: 'Formations' },
  { value: '98%', label: 'Parents satisfaits' },
  { value: '10', label: 'Formateurs experts' },
];

const Home = () => {
  return (
    <div className="home-page">

      {/* ══════════ HERO ══════════ */}
      <section className="hero">
        <div className="hero-layout">

          {/* Main hero block (left + center) */}
          <div className="hero-main">
            <img
              src="/7x.jpg"
              alt="Formateur Novatech Vision avec des élèves"
              className="hero-bg-img"
            />
            {/* Dark overlay */}
            <div className="hero-overlay" />

            <div className="hero-text-block">
              <h1>
                Former Aujourd'hui<br />
                <span className="hero-gold">Les Talents Numériques</span><br />
                de Demain
              </h1>
              <p>
                Nous accompagnons les enfants et les jeunes de 8 à 18 ans<br />
                dans l'acquisition des compétences informatiques essentielles.
              </p>

              <div className="hero-programs">
                {programs.map((p, i) => (
                  <div className="hero-program-item" key={i}>
                    <div className="hero-program-icon">{p.icon}</div>
                    <span>{p.label}</span>
                  </div>
                ))}
              </div>

              <Link to="/inscription" className="hero-cta-btn">
                S'inscrire Maintenant <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Right sidebar — Premium Panel */}
          <div className="hero-sidebar">

            {/* Inscription CTA card */}
            <div className="sidebar-card sidebar-card--cta">
              <div className="sidebar-card-header">
                <Clock size={24} />
                <div>
                  <h3 className="sidebar-card-title">Inscriptions ouvertes 2026</h3>
                  <p className="sidebar-card-subtitle">Offrez à votre enfant les compétences du futur !</p>
                </div>
              </div>
              <Link to="/inscription" className="sidebar-card-btn">
                Je réserve ma place
              </Link>
            </div>

            {/* AI Discovery card */}
            <div className="sidebar-card sidebar-card--ai">
              <div className="sidebar-card-content">
                <h3 className="sidebar-card-title">Découvrez l'Intelligence Artificielle pour les jeunes</h3>
                <p className="sidebar-card-subtitle">Comprendre, créer, innover avec les technologies de demain.</p>
                <Link to="/formations/ia" className="sidebar-card-btn-outline">
                  En savoir plus
                </Link>
              </div>
              <div className="sidebar-card-bg-ai">
                <BrainCircuit size={80} />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════ FEATURES STRIP ══════════ */}
      <section className="features-strip">
        <div className="container">
          <div className="features-strip-grid">
            {features.map((f, i) => (
              <div className="strip-item" key={i}>
                <div className="strip-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ KEY FIGURES ══════════ */}
      <section className="key-figures-section section-padding">
        <div className="container text-center">
          <h2 className="section-title">Novatech Vision en Chiffres</h2>
          <p className="section-subtitle">Notre impact et notre engagement envers l'excellence.</p>
          <div className="key-figures-grid">
            {stats.map((stat, i) => (
              <div className="key-figure-item" key={i}>
                <span className="key-figure-value">{stat.value}</span>
                <span className="key-figure-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ GALLERY ══════════ */}
      <section className="gallery-section">
        {galleryImages.map((src, i) => (
          <div className="gallery-item" key={i}>
            <img src={src} alt={`Novatech Vision — Photo ${i + 1}`} />
            <div className="gallery-overlay">
              <img src="/4x.png" alt="Logo" className="gallery-logo" />
            </div>
          </div>
        ))}
      </section>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section className="testimonials-section section-padding">
        <div className="container">
          <div className="testimonials-layout">
            <div className="testimonials-heading">
              <h2>Ce que disent<br />nos apprenants<br />et parents</h2>
              <Link to="/temoignages" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                Voir tous <ArrowRight size={16} />
              </Link>
            </div>

            <div className="testimonials-cards">
              {testimonials.map((t, i) => (
                <div className="testi-card" key={i}>
                  <div className="testi-stars">
                    {[...Array(5)].map((_, s) => <Star key={s} size={13} fill="#D4A017" color="#D4A017" />)}
                  </div>
                  <div className="testi-author">
                    <img src={t.avatar} alt={t.name} />
                    <strong>{t.name}</strong>
                  </div>
                  <p>"{t.quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ CTA BANNER ══════════ */}
      <section className="cta-banner">
        <div className="container cta-banner-inner">
          <div>
            <h2>Prêt à inscrire votre enfant ?</h2>
            <p>Des places limitées — rejoignez Novatech Vision dès aujourd'hui.</p>
          </div>
          <Link to="/inscription" className="btn btn-primary btn-lg">
            S'inscrire maintenant <ArrowRight size={18} />
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;
