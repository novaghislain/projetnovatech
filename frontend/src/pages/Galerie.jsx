import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import './Galerie.css';
import { API_URL, getImageUrl } from '../config';
import Testimonials from './Testimonials';

const translateGalleryTag = (tag, lang) => {
  if (lang !== 'en') return tag;
  const dict = {
    'Tous': 'All',
    'Classes': 'Classes',
    'Événements': 'Events',
    'Ateliers': 'Workshops',
    'Autre': 'Other'
  };
  return dict[tag] || tag;
};

const translateGalleryItem = (item, lang) => {
  if (lang !== 'en') return item;
  const dict = {
    'Session Mars 2026': 'March 2026 Session',
    'Remise de Certificats': 'Certificates Award Ceremony',
    'Atelier Robotique': 'Robotics Workshop',
    'Classes': 'Classes',
    'Événements': 'Events',
    'Ateliers': 'Workshops',
    'Autre': 'Other',
    'Sans titre': 'Untitled'
  };
  return {
    ...item,
    caption: dict[item.caption] || item.caption,
    tag: dict[item.tag] || item.tag
  };
};

const Galerie = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState('Tous');
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const { language } = useLanguage();

  const fallbackPhotos = [
    { id: 'g1', src: '/small-black-boy-elearning-computer-home.jpg', caption: 'Initiation au développement', tag: 'Classes', mediaType: 'image' },
    { id: 'g2', src: '/group-diverse-teens-young-people-doing-activities-together-celebrating-world-youth-skills-day.jpg', caption: 'Projet de groupe', tag: 'Événements', mediaType: 'image' },
    { id: 'g3', src: '/woman-teaching-kids-class.jpg', caption: 'Atelier de Robotique', tag: 'Ateliers', mediaType: 'image' },
    { id: 'g4', src: '/bureautique.jpg', caption: 'Cours de Bureautique Avancée', tag: 'Classes', mediaType: 'image' },
    { id: 'g5', src: '/13x.jpg', caption: 'Atelier ludique', tag: 'Événements', mediaType: 'image' },
    { id: 'g6', src: '/image2-removebg-preview.png', caption: 'Mot du Directeur', tag: 'Autre', mediaType: 'image' }
  ];

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/public/gallery`);
        if (res.data && res.data.length > 0) {
          const formatted = res.data.map(g => ({
            id: g.id,
            src: getImageUrl(g.imageUrl),
            caption: g.title || 'Sans titre',
            tag: g.category || 'Autre',
            mediaType: g.mediaType || (/\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(g.imageUrl) ? 'video' : 'image')
          }));
          setPhotos(formatted);
        } else {
          setPhotos(fallbackPhotos);
        }
      } catch (err) {
        console.error('Error fetching gallery:', err);
        setPhotos(fallbackPhotos);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  // Compute tags
  const rawTags = ['Tous', ...Array.from(new Set(photos.map(p => p.tag)))];
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
          <h1>{language === 'en' ? 'Gallery & Testimonials' : 'Galerie & Témoignages'}</h1>
          <p className="page-top-desc">
            {language === 'en' 
              ? 'Discover our training sessions, workshops, and events in pictures, and read what our learners have to say.'
              : 'Découvrez nos sessions de formation, ateliers et événements en images, et lisez ce que nos apprenants en disent.'}
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: '#666' }}>
          {language === 'en' ? 'Loading gallery...' : 'Chargement de la galerie...'}
        </div>
      ) : photos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: '#666' }}>
          {language === 'en' ? 'The gallery is currently empty.' : 'La galerie est actuellement vide.'}
        </div>
      ) : (
        <>
          {/* ── Filter Tags ── */}
          <div className="galerie-filters container">
            {rawTags.map(tag => (
              <button
                key={tag}
                className={`filter-btn ${activeTag === tag ? 'filter-btn--active' : ''}`}
                onClick={() => setActiveTag(tag)}
              >
                {translateGalleryTag(tag, language)}
                <span className="filter-count">
                  {tag === 'Tous' ? photos.length : photos.filter(p => p.tag === tag).length}
                </span>
              </button>
            ))}
          </div>

          {/* ── Grid ── */}
          <div className="galerie-grid container">
            {filtered.map(p => translateGalleryItem(p, language)).map((photo, i) => (
              <div
                className="galerie-card"
                key={photo.id || i}
                onClick={() => openLightbox(i)}
                role="button"
                tabIndex={0}
                aria-label={`Voir: ${photo.caption}`}
                onKeyDown={e => e.key === 'Enter' && openLightbox(i)}
              >
                {photo.mediaType === 'video' ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <video src={photo.src} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.6)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'white', fontSize: '1.2rem', marginLeft: '3px' }}>▶</span>
                    </div>
                  </div>
                ) : (
                  <img 
                    src={photo.src} 
                    alt={photo.caption} 
                    loading="lazy" 
                  />
                )}
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
            {filtered[lightboxIdx].mediaType === 'video' ? (
              <video src={filtered[lightboxIdx].src} controls autoPlay style={{ maxWidth: '100%', maxHeight: '80vh', display: 'block', margin: '0 auto', backgroundColor: '#000' }} />
            ) : (
              <img 
                src={filtered[lightboxIdx].src} 
                alt={filtered[lightboxIdx].caption} 
              />
            )}
            <div className="lb-info">
              <span className="galerie-tag">
                {translateGalleryTag(filtered[lightboxIdx].tag, language)}
              </span>
              <p>{translateGalleryItem(filtered[lightboxIdx], language).caption}</p>
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

      {/* ── Testimonials Section ── */}
      <Testimonials />
    </div>
  );
};

export default Galerie;
