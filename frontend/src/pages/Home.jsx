import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Monitor, Shield, Code2, BrainCircuit, UserCheck,
  GraduationCap, BookOpen, FlaskConical, Award, Clock, ArrowRight,
  Send, Mail, Phone, MapPin
} from 'lucide-react';
import AdBanner from '../components/AdBanner';
import './Home.css';
import { API_URL } from '../config';

const Home = () => {
  const { t, language } = useLanguage();

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

  const stats = [
    { value: '500+', label: t('stats_students') },
    { value: '15+', label: t('stats_courses') },
    { value: '98%', label: t('stats_satisfaction') },
    { value: '10', label: t('stats_experts') },
  ];

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
            {/* Background Image */}
            <img
              src="/7x.jpg"
              alt="Formateur Novatech Vision avec des élèves"
              className="hero-bg-img active"
            />
            {/* Dark overlay */}
            <div className="hero-overlay" />

            <div className="hero-text-block">
              <h1>
                {t('hero_title')}<br />
                <span className="hero-blue">{t('hero_title_accent')}</span><br />
                {t('hero_title_end')}
              </h1>
              <p>
                {t('hero_desc')}
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
          <div className="hero-sidebar">

            {/* Inscription CTA card */}
            <div className="sidebar-card sidebar-card--cta">
              <div className="sidebar-card-header">
                <Clock size={24} />
                <div>
                  <h3 className="sidebar-card-title">{t('hero_card_title')}</h3>
                  <p className="sidebar-card-subtitle">{t('hero_card_subtitle')}</p>
                </div>
              </div>
              <Link to={language === 'en' ? '/en/enroll' : '/inscription'} className="sidebar-card-btn">
                {t('hero_card_btn')}
              </Link>
            </div>

            {/* AI Discovery card */}
            <div className="sidebar-card sidebar-card--ai">
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
      <section className="presentation-section section-padding" style={{ backgroundColor: 'var(--color-bg-light)' }}>
        <div className="container">
          <div className="presentation-content" style={{ display: 'flex', gap: '4rem', alignItems: 'center' }}>
            <div className="presentation-text" style={{ flex: 1 }}>
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
            <div className="presentation-image" style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ position: 'relative', width: '90%' }}>
                <img src="/10x.jpg" alt="Élèves apprenant l'informatique" style={{ width: '100%', borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 40px rgba(26,26,46,0.15)', display: 'block' }} />

                {/* Decorative Elements */}
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', border: '3px solid var(--color-accent)', borderRadius: 'var(--radius-lg)', zIndex: -1 }}></div>
                <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', backgroundColor: 'var(--color-primary)', color: 'var(--color-white)', padding: '1.5rem 2rem', borderRadius: 'var(--radius-md)', boxShadow: '0 10px 30px rgba(15, 52, 96,0.3)', display: 'flex', alignItems: 'center', gap: '1.2rem', zIndex: 2 }}>
                  <div style={{ fontSize: '3rem', fontWeight: 900, color: '#0F3460', lineHeight: 1 }}>5+</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.4, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{t('about_years')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Banner */}
      <section className="container">
        <AdBanner placement="header" />
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
                  <img src={course.imageUrl || '/placeholder.jpg'} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                        {course.isFull || course.status === 'full' ? t('courses_full') : `Places: ${course.enrolled || 0}/${course.maxParticipants || 15}`}
                      </span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
                        {course.price ? course.price.toLocaleString() + ' FCFA' : t('courses_free')}
                      </strong>
                    </div>
                    <Link to={language === 'en' ? '/en/courses' : '/formations'} className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
                      {t('courses_enroll')}
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
                <a href="https://www.facebook.com/novatechvision" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '45px', height: '45px', backgroundColor: 'var(--color-bg-light)', color: 'var(--color-primary)', borderRadius: '50%', transition: 'all 0.3s' }} className="social-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                </a>
                <a href="https://x.com/novatechvision" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '45px', height: '45px', backgroundColor: 'var(--color-bg-light)', color: 'var(--color-primary)', borderRadius: '50%', transition: 'all 0.3s' }} className="social-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                </a>
                <a href="https://www.instagram.com/novatechvision" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '45px', height: '45px', backgroundColor: 'var(--color-bg-light)', color: 'var(--color-primary)', borderRadius: '50%', transition: 'all 0.3s' }} className="social-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                </a>
                <a href="https://www.linkedin.com/company/novatech-vision" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '45px', height: '45px', backgroundColor: 'var(--color-bg-light)', color: 'var(--color-primary)', borderRadius: '50%', transition: 'all 0.3s' }} className="social-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
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
