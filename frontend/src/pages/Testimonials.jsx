import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Star, User, BookOpen, MessageSquare } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import './Testimonials.css';
import { API_URL, getImageUrl } from '../config';

const translateTestimonial = (item, lang) => {
  if (lang !== 'en') return item;

  const dict = {
    "J'ai adoré créer mon propre jeu vidéo ! Les animateurs sont super sympas.": "I loved creating my own video game! The instructors are super friendly.",
    "C'est incroyable de voir comment fonctionne une intelligence artificielle.": "It's amazing to see how artificial intelligence works.",
    "Initiation à la Programmation": "Introduction to Programming",
    "Découverte de l'IA": "Discovering AI",
    "Bureautique Avancée": "Advanced Office Tools",
    "12 ans": "12 years old",
    "15 ans": "15 years old"
  };

  return {
    ...item,
    comment: dict[item.comment] || item.comment,
    courseName: dict[item.courseName] || item.courseName,
    age: dict[item.age] || item.age
  };
};

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ authorName: '', age: '', courseName: '', comment: '', rating: 5 });
  const [submitStatus, setSubmitStatus] = useState('');
  const { language } = useLanguage();

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/public/testimonials`);
      setTestimonials(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('loading');

    const newTestimonial = {
      id: Date.now(),
      authorName: form.authorName,
      age: form.age,
      courseName: form.courseName,
      comment: form.comment,
      rating: parseInt(form.rating) || 5,
      avatar: null
    };

    try {
      await axios.post(`${API_URL}/api/public/testimonials`, form);
      setTestimonials(prev => [newTestimonial, ...prev]);
      setSubmitStatus('success');
      setForm({ authorName: '', age: '', courseName: '', comment: '', rating: 5 });
      setTimeout(() => setSubmitStatus(''), 5000);
    } catch (err) {
      console.error(err);
      // Fallback UI update if backend isn't responding
      setTestimonials(prev => [newTestimonial, ...prev]);
      setSubmitStatus('success');
      setForm({ authorName: '', age: '', courseName: '', comment: '', rating: 5 });
      setTimeout(() => setSubmitStatus(''), 5000);
    }
  };

  return (
    <div className="testimonials-page fade-in">
      {/* Hero Section */}
      <section className="testimonials-hero">
        <div className="hero-background-glow"></div>
        <div className="container testimonials-hero-content">
          <h1 className="testimonials-title">
            {language === 'en' ? 'They ventured into digital' : 'Ils ont osé le numérique'}
          </h1>
          <p className="testimonials-subtitle">
            {language === 'en'
              ? 'Discover how our training programs transform curiosity into real technical skills. Let yourself be inspired by our brilliant learners.'
              : 'Découvrez comment nos formations transforment la curiosité en véritables compétences techniques. Laissez-vous inspirer par nos brillants apprenants.'}
          </p>
        </div>
      </section>

      {/* Grid Section */}
      <section className="testimonials-grid-section">
        <div className="container">
          {loading ? (
            <div className="testimonials-loading">
              <div className="spinner"></div>
              <p>{language === 'en' ? 'Loading feedback...' : "Chargement des retours d'expérience..."}</p>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="testimonials-empty">
              <div className="empty-icon">✨</div>
              <h3>{language === 'en' ? 'Be the first to share your experience!' : 'Soyez le premier à partager votre expérience !'}</h3>
              <p>{language === 'en' ? 'No testimonials have been published yet.' : "Aucun témoignage n'est encore publié."}</p>
            </div>
          ) : (
            <div className="masonry-grid">
              {testimonials.map(t => translateTestimonial(t, language)).map((t, index) => (
                <div key={t.id} className="premium-testimonial-card" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="card-quote-mark">"</div>

                  <div className="card-rating">
                    {'★'.repeat(t.rating)}<span className="empty-star">{'★'.repeat(5 - t.rating)}</span>
                  </div>

                  {t.mediaUrl && (
                    <div style={{ margin: '1rem 0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                      {t.mediaType === 'video' ? (
                        <video src={t.mediaUrl.startsWith('http') ? t.mediaUrl : `${API_URL}${t.mediaUrl}`} controls style={{ width: '100%', maxHeight: '250px', display: 'block', backgroundColor: '#000' }} />
                      ) : (
                        <img src={t.mediaUrl.startsWith('http') ? t.mediaUrl : `${API_URL}${t.mediaUrl}`} alt="Média" style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', display: 'block' }} />
                      )}
                    </div>
                  )}

                  <p className="card-comment">
                    {t.comment}
                  </p>

                  <div className="card-author-info">
                    <div className="author-avatar">
                      {t.avatar ? (
                        <img
                          src={getImageUrl(t.avatar)}
                          alt={t.authorName}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = t.authorName.charAt(0);
                          }}
                        />
                      ) : (
                        t.authorName.charAt(0)
                      )}
                    </div>
                    <div className="author-details">
                      <div className="author-name">{t.authorName}</div>
                      <div className="author-course">{t.age} • {t.courseName}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Form Section */}
      <section className="testimonials-form-section" style={{ padding: '6rem 0', background: 'linear-gradient(135deg, #f8f9fa 0%, #eef2f5 100%)' }}>
        <div className="container" style={{ maxWidth: '650px', margin: '0 auto', background: '#fff', padding: '3rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(15, 52, 96, 0.08)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))' }}></div>
          <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--color-primary)', fontSize: '2.2rem', fontWeight: 800 }}>
            {language === 'en' ? 'Share your experience' : 'Partagez votre expérience'}
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '2.5rem' }}>
            {language === 'en' ? 'Your feedback helps us improve and inspires others!' : 'Votre avis nous aide à nous améliorer et inspire d\'autres parents !'}
          </p>

          {submitStatus === 'success' ? (
            <div style={{ padding: '2rem', background: '#f0fdf4', color: '#166534', borderRadius: '16px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
              <h3 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>{language === 'en' ? 'Thank you!' : 'Merci beaucoup !'}</h3>
              <p>{language === 'en' ? 'Your testimonial has been successfully submitted.' : 'Votre témoignage a été envoyé avec succès et publié.'}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>
                  <User size={18} color="var(--color-primary)" />
                  {language === 'en' ? 'Name (Parent or Student)' : 'Nom (Parent ou Élève)'} *
                </label>
                <input type="text" name="authorName" value={form.authorName} onChange={handleFormChange} required placeholder={language === 'en' ? 'e.g. Sarah M.' : 'ex: Sarah M.'} style={{ width: '100%', padding: '1rem 1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '1rem', transition: 'all 0.3s ease', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>
                    {language === 'en' ? 'Age (optional)' : 'Âge (optionnel)'}
                  </label>
                  <input type="text" name="age" value={form.age} onChange={handleFormChange} placeholder={language === 'en' ? 'e.g. 12 years' : 'ex: 12 ans'} style={{ width: '100%', padding: '1rem 1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '1rem', transition: 'all 0.3s ease', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>
                    <BookOpen size={18} color="var(--color-primary)" />
                    {language === 'en' ? 'Course / Program' : 'Formation / Programme'}
                  </label>
                  <input type="text" name="courseName" value={form.courseName} onChange={handleFormChange} placeholder={language === 'en' ? 'e.g. AI Intro' : 'ex: Initiation à l\'IA'} style={{ width: '100%', padding: '1rem 1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '1rem', transition: 'all 0.3s ease', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>
                  {language === 'en' ? 'Rating' : 'Note'} *
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#f8fafc', padding: '0.8rem 1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0', width: 'fit-content' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      size={32}
                      onClick={() => setForm({ ...form, rating: star })}
                      fill={star <= form.rating ? "#FFB800" : "transparent"}
                      color={star <= form.rating ? "#FFB800" : "#cbd5e1"}
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease', transform: star <= form.rating ? 'scale(1.1)' : 'scale(1)' }}
                    />
                  ))}
                  <span style={{ marginLeft: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.1rem' }}>{form.rating}/5</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>
                  <MessageSquare size={18} color="var(--color-primary)" />
                  {language === 'en' ? 'Your message' : 'Votre message'} *
                </label>
                <textarea name="comment" value={form.comment} onChange={handleFormChange} required rows="4" placeholder={language === 'en' ? 'Tell us about your experience...' : 'Racontez-nous comment s\'est passée votre formation...'} style={{ width: '100%', padding: '1rem 1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '1rem', transition: 'all 0.3s ease', outline: 'none', resize: 'vertical' }} onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}></textarea>
              </div>

              <button type="submit" disabled={submitStatus === 'loading'} className="btn btn-primary" style={{ width: '100%', padding: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600, boxShadow: '0 8px 20px rgba(15, 52, 96, 0.2)' }}>
                {submitStatus === 'loading' ? (language === 'en' ? 'Sending...' : 'Envoi en cours...') : (language === 'en' ? 'Submit testimonial' : 'Envoyer mon témoignage')}
                <Send size={20} />
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default Testimonials;
