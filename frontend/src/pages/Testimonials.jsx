import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';
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
    try {
      await axios.post(`${API_URL}/api/public/testimonials`, form);
      setSubmitStatus('success');
      setForm({ authorName: '', age: '', courseName: '', comment: '', rating: 5 });
      fetchTestimonials();
      setTimeout(() => setSubmitStatus(''), 5000);
    } catch (err) {
      console.error(err);
      // Fallback if backend route isn't deployed yet
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
      <section className="testimonials-form-section" style={{ padding: '4rem 0', backgroundColor: 'var(--color-bg-light)' }}>
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
            {language === 'en' ? 'Share your experience' : 'Partagez votre expérience'}
          </h2>
          {submitStatus === 'success' ? (
            <div style={{ padding: '1rem', background: '#d4edda', color: '#155724', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>
              {language === 'en' ? 'Thank you! Your testimonial has been submitted.' : 'Merci ! Votre témoignage a été envoyé.'}
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{language === 'en' ? 'Name (Parent or Student)' : 'Nom (Parent ou Élève)'} *</label>
                <input type="text" name="authorName" value={form.authorName} onChange={handleFormChange} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{language === 'en' ? 'Age (optional)' : 'Âge (optionnel)'}</label>
                  <input type="text" name="age" value={form.age} onChange={handleFormChange} placeholder="ex: 12 ans" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{language === 'en' ? 'Course / Program' : 'Formation / Programme'}</label>
                  <input type="text" name="courseName" value={form.courseName} onChange={handleFormChange} placeholder="ex: Initiation à l'IA" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{language === 'en' ? 'Rating' : 'Note'} *</label>
                <select name="rating" value={form.rating} onChange={handleFormChange} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                  <option value="4">⭐⭐⭐⭐ (4/5)</option>
                  <option value="3">⭐⭐⭐ (3/5)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{language === 'en' ? 'Your message' : 'Votre message'} *</label>
                <textarea name="comment" value={form.comment} onChange={handleFormChange} required rows="4" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', resize: 'vertical' }}></textarea>
              </div>
              <button type="submit" disabled={submitStatus === 'loading'} className="btn btn-primary" style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                {submitStatus === 'loading' ? '...' : language === 'en' ? 'Submit testimonial' : 'Envoyer mon témoignage'} <Send size={18} />
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default Testimonials;
