import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
    </div>
  );
};

export default Testimonials;
