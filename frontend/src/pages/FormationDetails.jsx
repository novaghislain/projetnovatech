import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Clock, Users, Calendar, CheckCircle2, ShieldCheck, ArrowLeft, AlertCircle, ChevronLeft, ChevronRight, Share2, Timer } from 'lucide-react';
import { translateCategory, translateDuration, translateAgeGroup, translateLevel, translateTitle, translateDescription } from '../utils/translator';

import './Home.css';
import { API_URL, getImageUrl } from '../config';

const FormationDetails = () => {
  const { id } = useParams();
  const auth = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [formation, setFormation] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const targetDateStr = formation?.enrollmentEndDate || formation?.startDate;
    if (!targetDateStr) return;
    const target = new Date(targetDateStr).getTime();
    if (isNaN(target)) return;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;
      
      if (distance < 0) {
        setTimeLeft(language === 'en' ? 'Started' : 'Commencé');
        clearInterval(interval);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${days}j ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [formation, language]);

  useEffect(() => {
    const fetchFormation = async () => {
      try {
        const response = await fetch(`${API_URL}/api/public/formations/${id}`);
        if (!response.ok) throw new Error("Formation introuvable");
        const data = await response.json();
        setFormation(data);

        try {
          const sylRes = await fetch(`${API_URL}/api/courses/${data.id}/structure`);
          if (sylRes.ok) {
            setModules(await sylRes.json());
          }
        } catch(e) {}
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFormation();
  }, [id]);

  const images = useMemo(() => {
    if (!formation) return ['/10x.jpg'];
    let urls = [];
    if (formation.imageUrls) {
      try {
        urls = typeof formation.imageUrls === 'string' ? JSON.parse(formation.imageUrls) : formation.imageUrls;
      } catch(e) {}
    }
    if (urls.length === 0 && formation.imageUrl) {
      urls = [formation.imageUrl];
    }
    if (urls.length === 0) {
      urls = ['/10x.jpg'];
    }
    return urls.map(getImageUrl);
  }, [formation]);

  useEffect(() => {
    if (images.length > 1) {
      const timer = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % images.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [images.length]);

  const nextImage = () => setCurrentImageIndex(prev => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}>{language === 'en' ? 'Loading...' : 'Chargement...'}</div>;

  if (error || !formation) return (
    <div className="container section-padding" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h2 style={{ color: 'var(--color-primary)' }}>{language === 'en' ? 'Course not found' : 'Formation introuvable'}</h2>
      <p style={{ color: 'var(--color-text-muted)' }}>{language === 'en' ? 'The course you are looking for does not exist or has been removed.' : 'La formation que vous cherchez n\'existe pas ou a été retirée.'}</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>{language === 'en' ? 'Back to Home' : 'Retour à l\'accueil'}</Link>
    </div>
  );

  const isFull = formation.enrolled >= formation.maxParticipants;
  const spotsLeft = formation.maxParticipants - formation.enrolled;
  const showWarning = !isFull && spotsLeft <= 5;

  const getFormatDisplay = () => {
    if (formation.format === 'physique' || formation.format === 'présentiel') {
      return (language === 'en' ? 'In-person ' : 'Présentiel ') + (formation.location ? '(' + formation.location + ')' : '');
    } else if (formation.format === 'en_ligne' || formation.format === 'hybride') {
      return language === 'en' ? 'Online (Google Meet / WhatsApp)' : 'En ligne (Google Meet / WhatsApp)';
    } else if (formation.format === 'masse') {
      return (language === 'en' ? 'Vacation Camp / Mass ' : 'Camp de vacance / Masse ') + (formation.location ? '(' + formation.location + ')' : '');
    } else if (formation.format === 'individuelle') {
      return language === 'en' ? 'Individual, at home' : 'Individuel, à domicile';
    }
    return formation.isOnline ? (language === 'en' ? 'Online' : 'En ligne') : (formation.location || (language === 'en' ? 'In-person' : 'Présentiel'));
  };

  const handleEnrollClick = () => {
    navigate('/inscription', { state: { formationId: formation.id } });
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url);
    } else {
      // Fallback for non-HTTPS (like local IP testing)
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
      }
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page-transition" style={{ backgroundColor: 'var(--color-bg-light)', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* HERO BANNER */}
      <div style={{ position: 'relative', height: '450px', width: '100%', backgroundColor: 'var(--color-primary)', overflow: 'hidden' }}>
        {images.map((img, idx) => (
          <div key={idx} style={{ 
            position: 'absolute', inset: 0, 
            backgroundImage: `url(${img})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center', 
            backgroundColor: 'var(--color-primary)',
            opacity: currentImageIndex === idx ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
            zIndex: 1
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(16, 24, 40, 0.8) 0%, rgba(16, 24, 40, 0.5) 50%, rgba(16, 24, 40, 0.1) 100%)' }} />
          </div>
        ))}
        {images.length > 1 && (
          <>
            <button onClick={prevImage} style={{ position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ChevronLeft size={24} />
            </button>
            <button onClick={nextImage} style={{ position: 'absolute', top: '50%', right: '20px', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ChevronRight size={24} />
            </button>
            <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: '8px' }}>
              {images.map((_, idx) => (
                <div key={idx} onClick={() => setCurrentImageIndex(idx)} style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: currentImageIndex === idx ? 'var(--color-accent)' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'background-color 0.3s' }} />
              ))}
            </div>
          </>
        )}
        <div className="container" style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: 'white', paddingTop: '4rem', zIndex: 2 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', marginBottom: '2rem', fontWeight: 600, transition: 'color 0.2s' }}>
            <ArrowLeft size={18} /> {t('fd_back')}
          </Link>
          <div style={{ display: 'inline-block', backgroundColor: 'var(--color-accent)', color: 'white', padding: '0.5rem 1.2rem', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.5rem', width: 'fit-content', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
            {translateCategory(formation.category, language)}
          </div>
          <h1 style={{ fontSize: '3.5rem', margin: '0 0 1.5rem 0', maxWidth: '800px', lineHeight: 1.1, fontWeight: 800 }}>{translateTitle(formation.title, language)}</h1>
          <div style={{ display: 'flex', gap: '2.5rem', fontSize: '1.15rem', opacity: 0.95, fontWeight: 500 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Clock size={22} color="var(--color-accent)" /> {translateDuration(formation.duration, language)}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Users size={22} color="var(--color-accent)" /> {translateAgeGroup(formation.ageGroup, language)}</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '3rem' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem', alignItems: 'start' }}>
          
          {/* LEFT CONTENT */}
          <div style={{ backgroundColor: 'var(--color-white)', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>{t('fd_about')}</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2.5rem', whiteSpace: 'pre-line' }}>
              {translateDescription(formation.description, language) || t('fd_default_desc')}
            </p>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>{t('fd_practical')}</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1rem', marginBottom: '3rem' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: 1.5 }}>
                <CheckCircle2 size={24} color="var(--color-accent)" style={{ flexShrink: 0 }} />
                <span>{t('fd_level')} <strong>{translateLevel(formation.level, language) || t('fd_all_levels')}</strong></span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: 1.5 }}>
                <CheckCircle2 size={24} color="var(--color-accent)" style={{ flexShrink: 0 }} />
                <span>{t('fd_format')} <strong>{getFormatDisplay()}</strong></span>
              </li>
              {formation.sessionsPerWeek && (
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: 1.5 }}>
                  <CheckCircle2 size={24} color="var(--color-accent)" style={{ flexShrink: 0 }} />
                  <span>{t('fd_pace')} <strong>{formation.sessionsPerWeek} {t('fd_sessions_week')}</strong> ({formation.sessionDuration})</span>
                </li>
              )}
            </ul>

            {modules && modules.length > 0 && (
              <div style={{ marginTop: '4rem' }}>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>{t('fd_curriculum')}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {modules.map((m, i) => (
                    <details key={m.id} style={{ backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <summary style={{ padding: '1.2rem 1.5rem', fontWeight: 600, color: 'var(--color-primary)', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white' }}>
                        <span style={{ fontSize: '1.1rem' }}>{t('fd_module')} {i + 1} : {m.title}</span>
                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, backgroundColor: '#f1f5f9', padding: '0.3rem 0.8rem', borderRadius: '20px' }}>{m.chapters?.length || 0} {t('fd_chapters')}</span>
                      </summary>
                      <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', backgroundColor: 'white' }}>
                        {m.chapters?.map((c, j) => (
                          <div key={c.id} style={{ padding: '1rem 0', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>
                              {j + 1}
                            </div>
                            <div>
                              <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1.05rem', color: '#334155' }}>{c.title}</h4>
                              {c.lessons && c.lessons.length > 0 && (
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                                  {c.lessons.length} {t('fd_lessons')}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR (STICKY) */}
          <aside style={{ position: 'sticky', top: '2rem' }}>
            <div style={{ backgroundColor: 'var(--color-white)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>{formation.price?.toLocaleString(language === 'en' ? 'en-US' : 'fr-FR')} FCFA</span>
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                {(formation.enrollmentEndDate || formation.startDate) && timeLeft && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: (timeLeft === 'Started' || timeLeft === 'Commencé') ? '#f3f4f6' : '#fef3c7', color: (timeLeft === 'Started' || timeLeft === 'Commencé') ? '#6b7280' : '#b45309', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem', border: (timeLeft === 'Started' || timeLeft === 'Commencé') ? '1px solid #e5e7eb' : '1px solid #fde68a' }}>
                    <Timer size={20} /> 
                    {timeLeft === 'Started' || timeLeft === 'Commencé' 
                      ? (language === 'en' ? 'Registrations closed' : 'Inscriptions terminées')
                      : (language === 'en' ? 'Registrations close in:' : 'Fin des inscriptions :')
                    }
                    {timeLeft !== 'Started' && timeLeft !== 'Commencé' && (
                      <span style={{ fontFamily: 'monospace', fontSize: '1.05rem', marginLeft: 'auto' }}>{timeLeft}</span>
                    )}
                  </div>
                )}
                {isFull ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600 }}>
                    <AlertCircle size={16} /> {t('courses_full')}
                  </div>
                ) : (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: showWarning ? '#ffedd5' : '#dcfce7', color: showWarning ? '#c2410c' : '#166534', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600 }}>
                    <Users size={16} /> {t('fd_spots_left').replace('{spots}', spotsLeft)}
                  </div>
                )}
                
                <div style={{ width: '100%', height: '6px', backgroundColor: '#f3f4f6', borderRadius: '3px', marginTop: '1rem', overflow: 'hidden' }}>
                  <div style={{ height: '100%', backgroundColor: isFull ? '#dc2626' : (showWarning ? '#ea580c' : '#10b981'), width: `${(formation.enrolled / formation.maxParticipants) * 100}%` }}></div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button 
                  onClick={handleEnrollClick}
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', borderRadius: '12px' }}
                >
                  {t('fd_enroll_now')}
                </button>
                <button 
                  onClick={handleCopyLink}
                  className="btn btn-outline" 
                  style={{ width: '100%', padding: '1rem', fontSize: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Share2 size={18} /> {copied ? (language === 'en' ? 'Link Copied!' : 'Lien copié !') : (language === 'en' ? 'Copy Link' : 'Copier le lien')}
                </button>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
};

export default FormationDetails;
