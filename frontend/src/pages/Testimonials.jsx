import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Testimonials.css';
import { API_URL } from '../config';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

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
          <h1 className="testimonials-title">Ils ont osé le numérique</h1>
          <p className="testimonials-subtitle">
            Découvrez comment nos formations transforment la curiosité en véritables compétences techniques. Laissez-vous inspirer par nos brillants apprenants.
          </p>
        </div>
      </section>

      {/* Grid Section */}
      <section className="testimonials-grid-section">
        <div className="container">
          {loading ? (
            <div className="testimonials-loading">
              <div className="spinner"></div>
              <p>Chargement des retours d'expérience...</p>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="testimonials-empty">
              <div className="empty-icon">✨</div>
              <h3>Soyez le premier à partager votre expérience !</h3>
              <p>Aucun témoignage n'est encore publié.</p>
            </div>
          ) : (
            <div className="masonry-grid">
              {testimonials.map((t, index) => (
                <div key={t.id} className="premium-testimonial-card" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="card-quote-mark">"</div>
                  
                  <div className="card-rating">
                    {'★'.repeat(t.rating)}<span className="empty-star">{'★'.repeat(5 - t.rating)}</span>
                  </div>
                  
                  <p className="card-comment">
                    {t.comment}
                  </p>

                  <div className="card-author-info">
                    <div className="author-avatar">
                      {t.avatar ? (
                        <img 
                          src={t.avatar} 
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
