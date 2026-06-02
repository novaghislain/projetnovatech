import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Monitor, Shield, Code2, BrainCircuit, UserCheck,
  GraduationCap, BookOpen, FlaskConical, Award, Clock, ArrowRight,
  Star, Send, Mail, Phone, MapPin
} from 'lucide-react';
import AdBanner from '../components/AdBanner';
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
    module: 'Bureautique',
    avatar: 'https://i.pravatar.cc/60?img=47',
    quote: "Grâce à Novatech Vision, j'ai appris à utiliser Word, PowerPoint et à créer mes premières présentations. Aujourd'hui, je suis beaucoup plus à l'aise avec l'ordinateur.",
  },
  {
    name: 'Kévin, 15 ans',
    module: 'Programmation',
    avatar: 'https://i.pravatar.cc/60?img=15',
    quote: "Les cours sont simples à comprendre et très pratiques. J'ai découvert les bases de la programmation et ça m'a donné envie de poursuivre dans ce domaine.",
  },
  {
    name: 'Mme Agossou, Parent',
    module: 'Sécurité & Internet',
    avatar: 'https://i.pravatar.cc/60?img=32',
    quote: "Mon fils a gagné en autonomie et en confiance. L'équipe pédagogique est professionnelle et très attentive au suivi des enfants.",
  },
  {
    name: 'David, 17 ans',
    module: 'Intelligence Artificielle',
    avatar: 'https://i.pravatar.cc/60?img=13',
    quote: "La formation sur l'intelligence artificielle était passionnante. J'ai découvert des outils modernes que je peux utiliser pour mes études.",
  },
];

const galleryImages = [
  '/group-diverse-teens-young-people-doing-activities-together-celebrating-world-youth-skills-day.jpg',
  '/small-black-boy-elearning-computer-home.jpg',
  '/woman-teaching-kids-class.jpg',
  '/9x.jpeg',
];

const stats = [
  { value: '500+', label: 'Enfants formés' },
  { value: '15+', label: 'Formations' },
  { value: '98%', label: 'Parents satisfaits' },
  { value: '10', label: 'Formateurs experts' },
];

const featuredCourses = [
  {
    title: 'Initiation à la Programmation',
    category: 'Programmation',
    ageGroup: '10-14 ans',
    price: '25 000 FCFA',
    duration: '4 semaines',
    spots: '5 places restantes',
    image: '/9x.jpeg',
    icon: <Code2 size={20} />
  },
  {
    title: 'Découverte de l\'Intelligence Artificielle',
    category: 'Intelligence Artificielle',
    ageGroup: '14-18 ans',
    price: '30 000 FCFA',
    duration: '6 semaines',
    spots: 'Complet',
    image: '/8x.jpeg',
    icon: <BrainCircuit size={20} />
  },
  {
    title: 'Maîtrise de la Bureautique',
    category: 'Bureautique',
    ageGroup: '8-12 ans',
    price: '20 000 FCFA',
    duration: '4 semaines',
    spots: '12 places restantes',
    image: '/10x.jpg',
    icon: <Monitor size={20} />
  }
];



const heroBackgrounds = [
  '/7x.jpg',
  '/10x.jpg',
  '/11x.jpg'
];

const Home = () => {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    const bgInterval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % heroBackgrounds.length);
    }, 6000); // Change hero background every 6 seconds

    return () => {
      clearInterval(bgInterval);
    };
  }, []);

  return (
    <div className="home-page">

      {/* ══════════ HERO ══════════ */}
      <section className="hero">
        <div className="hero-layout">

          {/* Main hero block (left + center) */}
          <div className="hero-main">
            {/* Background Carousel */}
            {heroBackgrounds.map((bg, i) => (
              <img
                key={i}
                src={bg}
                alt="Formateur Novatech Vision avec des élèves"
                className={`hero-bg-img ${i === currentBgIndex ? 'active' : ''}`}
              />
            ))}
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

              <Link to="/formations" className="hero-cta-btn">
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



      {/* ══════════ PRÉSENTATION ══════════ */}
      <section className="presentation-section section-padding" style={{ backgroundColor: 'var(--color-bg-light)' }}>
        <div className="container">
          <div className="presentation-content" style={{ display: 'flex', gap: '4rem', alignItems: 'center' }}>
            <div className="presentation-text" style={{ flex: 1 }}>
              <div className="section-eyebrow">Qui sommes-nous ?</div>
              <h2 className="section-title">L'informatique à la portée de vos enfants</h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '1.05rem', lineHeight: 1.7 }}>
                Novatech Vision est un organisme de formation spécialisé dans l'éducation informatique des enfants et jeunes de 8 à 18 ans.
              </p>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: 1.7 }}>
                Notre mission est de préparer la prochaine génération aux défis du monde numérique en leur offrant des compétences solides en bureautique, sécurité internet, et intelligence artificielle, dans un cadre ludique et stimulant.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(212,160,23,0.15)', color: 'var(--color-accent)' }}><Award size={18} /></span>
                  Excellence pédagogique
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(212,160,23,0.15)', color: 'var(--color-accent)' }}><Shield size={18} /></span>
                  Environnement sécurisé
                </li>
              </ul>
            </div>
            <div className="presentation-image" style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ position: 'relative', width: '90%' }}>
                <img src="/10x.jpg" alt="Élèves apprenant l'informatique" style={{ width: '100%', borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 40px rgba(26,26,46,0.15)', display: 'block' }} />
                
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', border: '3px solid var(--color-accent)', borderRadius: 'var(--radius-lg)', zIndex: -1 }}></div>
                <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', backgroundColor: 'var(--color-primary)', color: 'var(--color-white)', padding: '1.5rem 2rem', borderRadius: 'var(--radius-md)', boxShadow: '0 10px 30px rgba(212,160,23,0.3)', display: 'flex', alignItems: 'center', gap: '1.2rem', zIndex: 2 }}>
                  <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--color-accent)', lineHeight: 1 }}>5+</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.4, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Années<br />d'expérience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ BANNIÈRE PUBLICITAIRE ══════════ */}
      <section className="container">
        <AdBanner placement="Accueil" />
      </section>

      {/* ══════════ FORMATIONS EN VEDETTE ══════════ */}
      <section className="featured-courses-section section-padding" style={{ backgroundColor: 'var(--color-white)' }}>
        <div className="container">
          <div className="text-center">
            <div className="section-eyebrow">Nos Formations</div>
            <h2 className="section-title">Formations en vedette</h2>
            <p className="section-subtitle" style={{ margin: '0 auto 3rem' }}>Découvrez nos programmes les plus populaires conçus pour vos enfants.</p>
          </div>
          
          <div className="courses-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {featuredCourses.map((course, i) => (
              <div className="course-card" key={i} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-light)', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column' }}>
                <div className="course-card-img" style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                  <img src={course.image} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: 'var(--color-white)', padding: '0.4rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', boxShadow: 'var(--shadow-sm)' }}>
                    {course.category}
                  </div>
                </div>
                <div className="course-card-content" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>{course.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><UserCheck size={16} /> {course.ageGroup}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={16} /> {course.duration}</span>
                  </div>
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '1.2rem' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{course.spots}</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>{course.price}</strong>
                    </div>
                    <Link to="/formations" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
                      S'inscrire
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center" style={{ marginTop: '3rem' }}>
            <Link to="/formations" className="btn btn-secondary">Voir toutes les formations</Link>
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
          </div>
        ))}
      </section>

      {/* ══════════ POURQUOI NOUS CHOISIR ══════════ */}
      <section className="why-us-section section-padding" style={{ backgroundColor: 'var(--color-bg-alt)' }}>
        <div className="container">
          <div className="text-center">
            <div className="section-eyebrow">Nos Atouts</div>
            <h2 className="section-title">Pourquoi nous choisir ?</h2>
            <p className="section-subtitle" style={{ margin: '0 auto 3rem' }}>L'environnement idéal pour le développement des compétences de vos enfants.</p>
          </div>
          
          <div className="features-strip-grid" style={{ gap: '2rem' }}>
            {features.map((f, i) => (
              <div className="strip-item" key={i} style={{ backgroundColor: 'var(--color-white)' }}>
                <div className="strip-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
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
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong>{t.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 600 }}>{t.module}</span>
                    </div>
                  </div>
                  <p>"{t.quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ QUICK CONTACT & SOCIAL ══════════ */}
      <section className="contact-quick-section section-padding" style={{ backgroundColor: 'var(--color-white)', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="contact-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
            
            <div className="contact-info-block">
              <div className="section-eyebrow">Restons connectés</div>
              <h2 className="section-title">Rejoignez la communauté</h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: 1.7 }}>
                Suivez nos actualités, nos événements et interagissez avec nous sur les réseaux sociaux. Nous sommes disponibles pour répondre à toutes vos questions.
              </p>
              
              <div className="social-links-grid" style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
                <a href="#" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '45px', height: '45px', backgroundColor: 'var(--color-bg-light)', color: 'var(--color-primary)', borderRadius: '50%', transition: 'all 0.3s' }} className="social-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="#" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '45px', height: '45px', backgroundColor: 'var(--color-bg-light)', color: 'var(--color-primary)', borderRadius: '50%', transition: 'all 0.3s' }} className="social-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </a>
                <a href="#" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '45px', height: '45px', backgroundColor: 'var(--color-bg-light)', color: 'var(--color-primary)', borderRadius: '50%', transition: 'all 0.3s' }} className="social-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
                <a href="#" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '45px', height: '45px', backgroundColor: 'var(--color-bg-light)', color: 'var(--color-primary)', borderRadius: '50%', transition: 'all 0.3s' }} className="social-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-text-muted)' }}>
                  <span style={{ color: 'var(--color-accent)' }}><Phone size={20} /></span>
                  +229 0191348557
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-text-muted)' }}>
                  <span style={{ color: 'var(--color-accent)' }}><Mail size={20} /></span>
                  contact@novatechvision.com
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-text-muted)' }}>
                  <span style={{ color: 'var(--color-accent)' }}><MapPin size={20} /></span>
                  Cotonou, Bénin
                </div>
              </div>
            </div>

            <div className="contact-form-block" style={{ backgroundColor: 'var(--color-bg-light)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>Formulaire de contact rapide</h3>
              <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <input type="text" placeholder="Votre nom complet" style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontFamily: 'var(--font-body)' }} />
                </div>
                <div>
                  <input type="email" placeholder="Votre adresse email" style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontFamily: 'var(--font-body)' }} />
                </div>
                <div>
                  <textarea placeholder="Votre message..." rows={4} style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontFamily: 'var(--font-body)', resize: 'none' }}></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                  Envoyer le message <Send size={18} />
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>



    </div>
  );
};

export default Home;
