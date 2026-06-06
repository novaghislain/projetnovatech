import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import axios from 'axios';
import './Galerie.css';
import { API_URL } from '../config';

const Galerie = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState('Tous');
  const [lightboxIdx, setLightboxIdx] = useState(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/public/gallery`);
        // Convert API format to the expected format
        const formatted = res.data.map(g => ({
          id: g.id,
          src: g.imageUrl,
          caption: g.title || 'Sans titre',
          tag: g.category || 'Autre'
        }));
        setPhotos(formatted);
      } catch (err) {
        console.error('Error fetching gallery:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const tags = ['Tous', ...Array.from(new Set(photos.map(p => p.tag)))];
  const filtered = activeTag === 'Tous' ? photos : photos.filter(p => p.tag === activeTag);

  const openLightbox = (idx) => setLightboxIdx(idx);
  const closeLightbox = () => setLightboxIdx(null);
  const next = () => setLightboxIdx(i => (i + 1) % filtered.length);
  const prev = () => setLightboxIdx(i => (i - 1 + filtered.length) % filtered.length);

  const handleKey = useCallback((e) => {
    if (lightboxIdx === null) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  }, [lightboxIdx, filtered.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <div className="galerie-page">

      {/* ── Header ── */}
      <div className="page-top-bar">
        <div className="container">
          <h1>Galerie Photo</h1>
          <p className="page-top-desc">Découvrez nos sessions de formation, ateliers et événements en images.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: '#666' }}>Chargement de la galerie...</div>
      ) : photos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: '#666' }}>La galerie est actuellement vide.</div>
      ) : (
        <>
          {/* ── Filter Tags ── */}
          <div className="galerie-filters container">
            {tags.map(tag => (
              <button
                key={tag}
                className={`filter-btn ${activeTag === tag ? 'filter-btn--active' : ''}`}
                onClick={() => setActiveTag(tag)}
              >
                {tag}
                <span className="filter-count">
                  {tag === 'Tous' ? photos.length : photos.filter(p => p.tag === tag).length}
                </span>
              </button>
            ))}
          </div>

          {/* ── Grid ── */}
          <div className="galerie-grid container">
            {filtered.map((photo, i) => (
              <div
                className="galerie-card"
                key={photo.id || i}
                onClick={() => openLightbox(i)}
                role="button"
                tabIndex={0}
                aria-label={`Voir: ${photo.caption}`}
                onKeyDown={e => e.key === 'Enter' && openLightbox(i)}
              >
                <img src={photo.src} alt={photo.caption} loading="lazy" />
                <div className="galerie-card-overlay">
                  <span className="galerie-tag">{photo.tag}</span>
                  <div className="galerie-card-bottom">
                    <ZoomIn size={20} color="#fff" />
                    <span>{photo.caption}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Lightbox ── */}
      {lightboxIdx !== null && filtered[lightboxIdx] && (
        <div className="lb-backdrop" onClick={closeLightbox}>
          <button className="lb-close" onClick={closeLightbox} aria-label="Fermer">
            <X size={22} />
          </button>
          <button
            className="lb-nav lb-nav--prev"
            onClick={e => { e.stopPropagation(); prev(); }}
            aria-label="Précédent"
          >
            <ChevronLeft size={30} />
          </button>

          <div className="lb-content" onClick={e => e.stopPropagation()}>
            <img src={filtered[lightboxIdx].src} alt={filtered[lightboxIdx].caption} />
            <div className="lb-info">
              <span className="galerie-tag">{filtered[lightboxIdx].tag}</span>
              <p>{filtered[lightboxIdx].caption}</p>
              <span className="lb-counter">{lightboxIdx + 1} / {filtered.length}</span>
            </div>
          </div>

          <button
            className="lb-nav lb-nav--next"
            onClick={e => { e.stopPropagation(); next(); }}
            aria-label="Suivant"
          >
            <ChevronRight size={30} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Galerie;
