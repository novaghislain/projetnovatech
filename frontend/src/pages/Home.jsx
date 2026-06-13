import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { translateCategory, translateDuration, translateAgeGroup, translateLevel, translateTitle, translateDescription } from '../utils/translator';
import { Shield, Monitor, Code2, BrainCircuit, UserCheck, ChevronRight, Calendar, GraduationCap, BookOpen, FlaskConical, Award, Clock, ArrowRight, Send, Mail, Phone, MapPin, Layers } from 'lucide-react';

import './Home.css';
import { API_URL, getImageUrl } from '../config';
import CourseImageSlider from '../components/CourseImageSlider';

const Home = () => {
  const { t, language } = useLanguage();
  const auth = useAuth();

  const [presentationVisible, setPresentationVisible] = useState(false);
  const presentationRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setPresentationVisible(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );
    if (presentationRef.current) {
      observer.observe(presentationRef.current);
    }
    return () => {
      if (observer) observer.disconnect();
    };
  }, []);

  const programs = [
    { icon: <Monitor size={26} />, label: t('program_office') },
    { icon: <Shield size={26} />, label: t('program_safety') },
    { icon: <Code2 size={26} />, label: t('program_prog') },
    { icon: <BrainCircuit size={26} />, label: t('program_ai') },
    { icon: <UserCheck size={26} />, label: t('program_coaching') },
  ];

  const features = [
    { icon: <GraduationCap size={32} />, title: t('why_feat1_title'), desc: t('why_feat1_desc') },
    { icon: <BookOpen size={32} />, title: t('why_feat2_title'), desc: t('why_feat2_desc') },
    { icon: <FlaskConical size={32} />, title: t('why_feat3_title'), desc: t('why_feat3_desc') },
    { icon: <Award size={32} />, title: t('why_feat4_title'), desc: t('why_feat4_desc') },
    { icon: <UserCheck size={32} />, title: t('why_feat5_title'), desc: t('why_feat5_desc') },
    { icon: <Clock size={32} />, title: t('why_feat6_title'), desc: t('why_feat6_desc') },
  ];

  const [stats, setStats] = useState([
    { value: '10+', label: t('stats_courses') },
    { value: '98%', label: t('stats_satisfaction') },
    { value: '15+', label: t('stats_experts') }
  ]);

  // ── Hero Carousel ──
  const heroSlides = [
    {
      image: '/7x.jpg',
      title: t('hero_title'),
      accent: t('hero_title_accent'),
      end: t('hero_title_end'),
      desc: t('hero_desc'),
    },
    {
      image: '/12x.jpg',
      title: language === 'fr' ? 'Apprendre' : 'Learning',
      accent: language === 'fr' ? "Le Code & L'IA" : 'Coding & AI',
      end: language === 'fr' ? 'Dès 8 Ans' : 'From Age 8',
      desc: language === 'fr'
        ? "Des cours adaptés à chaque enfant pour découvrir la programmation et l'intelligence artificielle dès le plus jeune âge."
        : 'Courses tailored for every child to discover programming and AI from an early age.',
    },
    {
      image: '/13x.jpg',
      title: language === 'fr' ? 'Éveiller' : 'Awakening',
      accent: language === 'fr' ? 'La Curiosité' : 'The Curiosity',
      end: language === 'fr' ? 'Numérique' : 'Digital',
      desc: language === 'fr'
        ? "Une jeune génération inspirée, curieuse et prête à construire l'Afrique digitale de demain."
        : 'An inspired, curious young generation ready to build the digital Africa of tomorrow.',
    },
  ];
  const [heroSlide, setHeroSlide] = useState(0);

  const goToSlide = useCallback((idx) => {
    setHeroSlide(idx);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const currentSlide = heroSlides[heroSlide];

  const getFormatDisplay = (f) => {
    if (f.format === 'physique' || f.format === 'présentiel') {
      return `Présentiel ${f.location ? '(' + f.location + ')' : ''}`;
    } else if (f.format === 'en_ligne' || f.format === 'hybride') {
      return 'En ligne';
    } else if (f.format === 'masse') {
      return `Masse ${f.location ? '(' + f.location + ')' : ''}`;
    }
    return f.isOnline ? 'En ligne' : (f.location || 'Présentiel');
  };

  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', body: '' });
  const [contactStatus, setContactStatus] = useState('idle');

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const res = await fetch(`${API_URL}/api/public/formations`);
        if (res.ok) {
          const data = await res.json();
          // Take the top 3 featured or recent ones
          setFeaturedCourses(data.slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchFormations();
  }, []);

  const handleContactChange = (e) => setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus('sending');
    try {
      await axios.post(`${API_URL}/api/public/messages`, contactForm);
      setContactStatus('sent');
      setContactForm({ name: '', email: '', subject: '', body: '' });
      setTimeout(() => setContactStatus('idle'), 3000);
    } catch (error) {
      alert("Erreur lors de l'envoi du message.");
      setContactStatus('idle');
    }
  };

  return (
    <div className="home-page">

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-layout">

          {/* Main hero block (left + center) */}
          <div className="hero-main">
            {/* Background Images — Carousel */}
            {heroSlides.map((slide, idx) => (
              <img
                key={idx}
                src={slide.image}
                alt={`Slide ${idx + 1} FormationNova`}
                className={`hero-bg-img${heroSlide === idx ? ' active' : ''}`}
              />
            ))}
            {/* Dark overlay */}
            <div className="hero-overlay" />

            <div className="hero-text-block">
              <h1>
                {currentSlide.title}<br />
                <span className="hero-blue">{currentSlide.accent}</span><br />
                {currentSlide.end}
              </h1>
              <p>
                {currentSlide.desc}
              </p>

              <div className="hero-programs">
                {programs.map((p, i) => (
                  <div className="hero-program-item" key={i}>
                    <div className="hero-program-icon">{p.icon}</div>
                    <span>{p.label}</span>
                  </div>
                ))}
              </div>

              <Link to={language === 'en' ? '/en/courses' : '/formations'} className="hero-cta-btn">
                {t('hero_cta')} <ArrowRight size={18} />
              </Link>
            </div>


          </div>

          {/* Right sidebar — Premium Panel */}
          <div className="hero-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* Registration Card */}
            <div className="sidebar-card sidebar-card--cta" style={{ animation: 'fadeUp 0.8s ease 0.2s both' }}>
              <div className="sidebar-card-content">
                <h3 className="sidebar-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  <Calendar size={22} color="#38bdf8" />
                  {t('hero_card_title')}
                </h3>
                <p className="sidebar-card-subtitle" style={{ marginBottom: '1.2rem', color: 'rgba(255,255,255,0.85)' }}>
                  {t('hero_card_subtitle')}
                </p>
                <Link to="/inscription" className="btn" style={{ background: '#fff', color: 'var(--color-primary)', fontWeight: 600, padding: '0.8rem 1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center', display: 'block', transition: 'all 0.3s ease' }}>
                  {t('hero_card_btn')}
                </Link>
              </div>
            </div>

            {/* AI Discovery card */}
            <div className="sidebar-card sidebar-card--ai" style={{ animation: 'fadeUp 0.8s ease 0.4s both' }}>
              <div className="sidebar-card-content">
                <h3 className="sidebar-card-title">{t('hero_ai_title')}</h3>
                <p className="sidebar-card-subtitle">{t('hero_ai_subtitle')}</p>
                <Link to={language === 'en' ? '/en/courses/decouverte-de-l-ia' : '/formations/decouverte-de-l-ia'} className="sidebar-card-btn-outline">
                  {t('hero_ai_btn')}
                </Link>
              </div>
              <div className="sidebar-card-bg-ai">
                <BrainCircuit size={80} />
              </div>
            </div>

          </div>
        </div>
      </section>



      {/* Presentation Section */}
      <section ref={presentationRef} className="presentation-section section-padding" style={{ backgroundColor: 'var(--color-bg-light)', overflow: 'hidden' }}>
        <div className="container">
          <div className="presentation-content" style={{ display: 'flex', gap: '4rem', alignItems: 'center' }}>
            <div className={`presentation-text presentation-text-anim ${presentationVisible ? 'is-visible' : ''}`} style={{ flex: 1 }}>
              <h2 className="section-title">{t('about_title')}</h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '1.05rem', lineHeight: 1.7 }}>
                {t('about_desc1')}
              </p>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: 1.7 }}>
                {t('about_desc2')}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(15, 52, 96,0.15)', color: '#0F3460' }}><Award size={18} /></span>
                  {t('about_feat1')}
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(15, 52, 96,0.15)', color: '#0F3460' }}><Shield size={18} /></span>
                  {t('about_feat2')}
                </li>
              </ul>
            </div>
            <div className={`presentation-image presentation-img-anim ${presentationVisible ? 'is-visible' : ''}`} style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ position: 'relative', width: '90%' }}>
                <img src="/10x.jpg" alt="Élèves apprenant l'informatique" style={{ width: '100%', borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 40px rgba(26,26,46,0.15)', display: 'block' }} />

                {/* Decorative Elements */}
                <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', backgroundColor: 'var(--color-primary)', color: 'var(--color-white)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', boxShadow: '0 10px 30px rgba(15, 52, 96,0.3)', display: 'flex', alignItems: 'center', gap: '1.2rem', zIndex: 2 }}>
                  <div style={{ backgroundColor: 'var(--color-accent)', padding: '0.8rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Award size={28} color="var(--color-white)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-white)', lineHeight: 1.2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {language === 'en' ? 'Excellence' : 'Excellence'}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.3px' }}>
                      {language === 'en' ? '100% Practical' : '100% Pratique'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Banner */}
      <section className="container">

      </section>

      {/* Featured Courses */}
      <section className="featured-courses-section section-padding" style={{ backgroundColor: 'var(--color-white)' }}>
        <div className="container">
          <div className="text-center">
            <h2 className="section-title">{t('courses_title')}</h2>
            <p className="section-subtitle" style={{ margin: '0 auto 3rem' }}>{t('courses_subtitle')}</p>
          </div>

          <div className="courses-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {featuredCourses.map((course, i) => (
              <div className="course-card" key={i} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-light)', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column' }}>
                <div className="course-card-img" style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                  <CourseImageSlider formation={course} height="180px" />
                  {course.category && (
                    <div style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: 'var(--color-white)', padding: '0.4rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', boxShadow: 'var(--shadow-sm)', zIndex: 2 }}>
                      {translateCategory(course.category, language)}
                    </div>
                  )}
                </div>
                <div className="course-card-content" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>{translateTitle(course.title, language)}</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={16} /> {translateDuration(course.duration, language)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><UserCheck size={16} /> {translateAgeGroup(course.ageGroup, language)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={16} /> {getFormatDisplay(course)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Layers size={16} /> {translateLevel(course.level, language) || t('fd_all_levels')}</span>
                  </div>
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '1.2rem' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                        {course.isFull || course.status === 'full' ? t('courses_full') : `${language === 'en' ? 'Spots' : 'Places'}: ${course.enrolled || 0}/${course.maxParticipants || 15}`}
                      </span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
                        {course.price ? `${course.price.toLocaleString(language === 'en' ? 'en-US' : 'fr-FR')} FCFA` : t('courses_free')}
                      </strong>
                    </div>
                    <Link to={language === 'en' ? `/en/courses/${course.id}` : `/formations/${course.id}`} className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
                      {language === 'en' ? 'See Details' : 'Voir les détails'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center" style={{ marginTop: '3rem' }}>
            <Link to={language === 'en' ? '/en/courses' : '/formations'} className="btn btn-secondary">{t('courses_more')}</Link>
          </div>
        </div>
      </section>





      {/* Statistics / Key Figures */}
      <section className="key-figures-section section-padding">
        <div className="container text-center">
          <h2 className="section-title">{t('stats_title')}</h2>
          <p className="section-subtitle">{t('stats_subtitle')}</p>
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

      {/* Why Choose Us */}
      <section className="why-us-section section-padding" style={{ backgroundColor: 'var(--color-bg-alt)' }}>
        <div className="container">
          <div className="text-center">
            <h2 className="section-title">{t('why_title')}</h2>
            <p className="section-subtitle" style={{ margin: '0 auto 3rem' }}>{t('why_subtitle')}</p>
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



      {/* Quick Contact and Social Media Links */}
      <section className="contact-quick-section section-padding" style={{ backgroundColor: 'var(--color-white)', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="contact-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>

            <div className="contact-info-block">
              <div className="section-eyebrow">{t('contact_eyebrow')}</div>
              <h2 className="section-title">{t('contact_title')}</h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: 1.7 }}>
                {t('contact_desc')}
              </p>

              <div className="social-links-grid" style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
                <a href="https://www.facebook.com/FormationNovavision" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '45px', height: '45px', backgroundColor: 'var(--color-bg-light)', color: 'var(--color-primary)', borderRadius: '50%', transition: 'all 0.3s' }} className="social-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                </a>
                <a href="https://x.com/FormationNovavision" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '45px', height: '45px', backgroundColor: 'var(--color-bg-light)', color: 'var(--color-primary)', borderRadius: '50%', transition: 'all 0.3s' }} className="social-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                </a>
                <a href="https://www.instagram.com/FormationNovavision" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '45px', height: '45px', backgroundColor: 'var(--color-bg-light)', color: 'var(--color-primary)', borderRadius: '50%', transition: 'all 0.3s' }} className="social-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                </a>
                <a href="https://www.linkedin.com/company/FormationNova-vision" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '45px', height: '45px', backgroundColor: 'var(--color-bg-light)', color: 'var(--color-primary)', borderRadius: '50%', transition: 'all 0.3s' }} className="social-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                </a>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-text-muted)' }}>
                  <span style={{ color: 'var(--color-accent)' }}><Phone size={20} /></span>
                  +229 0191348557
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-text-muted)' }}>
                  <span style={{ color: 'var(--color-accent)' }}><Mail size={20} /></span>
                  contact@FormationNovavision.com
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-text-muted)' }}>
                  <span style={{ color: 'var(--color-accent)' }}><MapPin size={20} /></span>
                  Cotonou, Bénin
                </div>
              </div>
            </div>

            <div className="contact-form-block" style={{ backgroundColor: 'var(--color-bg-light)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>{t('contact_form_title')}</h3>
              <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <input type="text" name="name" value={contactForm.name} onChange={handleContactChange} required placeholder={t('contact_form_name')} style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontFamily: 'var(--font-body)' }} />
                </div>
                <div>
                  <input type="email" name="email" value={contactForm.email} onChange={handleContactChange} required placeholder={t('contact_form_email')} style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontFamily: 'var(--font-body)' }} />
                </div>
                <div>
                  <input type="text" name="subject" value={contactForm.subject} onChange={handleContactChange} required placeholder={t('contact_form_subject')} style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontFamily: 'var(--font-body)' }} />
                </div>
                <div>
                  <textarea name="body" value={contactForm.body} onChange={handleContactChange} required placeholder={t('contact_form_body')} rows={4} style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontFamily: 'var(--font-body)', resize: 'none' }}></textarea>
                </div>
                <button type="submit" disabled={contactStatus === 'sending'} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', opacity: contactStatus === 'sending' ? 0.7 : 1 }}>
                  {contactStatus === 'sending' ? t('contact_form_sending') : contactStatus === 'sent' ? t('contact_form_sent') : t('contact_form_submit')} <Send size={18} />
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
