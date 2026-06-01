import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, Images } from 'lucide-react';
import './Galerie.css';

const allPhotos = [
  {
    src: 'https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=1200&auto=format&fit=crop',
    caption: 'Atelier Bureautique — Session Juin 2025',
    tag: 'Bureautique',
  },
  {
    src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop',
    caption: 'Cours de Programmation — Groupe A',
    tag: 'Programmation',
  },
  {
    src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop',
    caption: 'Travaux en équipe — Projet Final',
    tag: 'Collaboration',
  },
  {
    src: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1200&auto=format&fit=crop',
    caption: 'Remise des Attestations 2025',
    tag: 'Cérémonie',
  },
  {
    src: 'https://images.unsplash.com/photo-1603354350317-6f7aaa5911c5?q=80&w=1200&auto=format&fit=crop',
    caption: 'Session Intelligence Artificielle',
    tag: 'IA',
  },
  {
    src: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=1200&auto=format&fit=crop',
    caption: 'Formation en ligne — Apprenants connectés',
    tag: 'En ligne',
  },
  {
    src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop',
    caption: 'Atelier Sécurité Internet',
    tag: 'Internet & Sécurité',
  },
  {
    src: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop',
    caption: 'Présentation de projet — Groupe C',
    tag: 'Programmation',
  },
  {
    src: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop',
    caption: 'Session de formation collective',
    tag: 'Bureautique',
  },
  {
    src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop',
    caption: 'Travail collaboratif en groupe',
    tag: 'Collaboration',
  },
  {
    src: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop',
    caption: 'Atelier découverte de l\'IA',
    tag: 'IA',
  },
  {
    src: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?q=80&w=1200&auto=format&fit=crop',
    caption: 'Cours de programmation avancée',
    tag: 'Programmation',
  },
];

const tags = ['Tous', ...Array.from(new Set(allPhotos.map(p => p.tag)))];

const Galerie = () => {
  const [activeTag, setActiveTag] = useState('Tous');
  const [lightboxIdx, setLightboxIdx] = useState(null);

  const filtered = activeTag === 'Tous' ? allPhotos : allPhotos.filter(p => p.tag === activeTag);

  const openLightbox = (idx) => setLightboxIdx(idx);
  const closeLightbox = () => setLightboxIdx(null);
  const next = () => setLightboxIdx(i => (i + 1) % filtered.length);
  const prev = () => setLightboxIdx(i => (i - 1 + filtered.length) % filtered.length);

  const handleKey = React.useCallback((e) => {
    if (lightboxIdx === null) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  }, [lightboxIdx]);

  React.useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <div className="galerie-page">

      {/* ── Header ── */}
      <div className="galerie-hero">
        <div className="galerie-hero-content container">
          <div className="galerie-icon-wrap">
            <Images size={32} />
          </div>
          <h1>Notre Galerie</h1>
          <p>Découvrez nos sessions de formation, ateliers et cérémonies en images.</p>
        </div>
      </div>

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
              {tag === 'Tous' ? allPhotos.length : allPhotos.filter(p => p.tag === tag).length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Grid ── */}
      <div className="galerie-grid container">
        {filtered.map((photo, i) => (
          <div
            className="galerie-card"
            key={i}
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

      {/* ── Lightbox ── */}
      {lightboxIdx !== null && (
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
