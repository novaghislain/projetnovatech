import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '../config';

const CourseImageSlider = ({ formation, height = '180px' }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [images.length]);

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev + 1) % images.length);
  };
  
  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
  };

  const handleDotClick = (e, idx) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(idx);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height, overflow: 'hidden', backgroundColor: 'var(--color-primary)' }}>
      {images.map((img, idx) => (
        <img 
          key={idx}
          src={img}
          alt={formation?.title || 'Formation image'}
          onError={(e) => { e.target.onerror = null; e.target.src = '/10x.jpg'; }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: currentImageIndex === idx ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
            zIndex: 1
          }}
        />
      ))}
      
      {images.length > 1 && (
        <>
          <button onClick={prevImage} style={{ position: 'absolute', top: '50%', left: '5px', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(0,0,0,0.4)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={nextImage} style={{ position: 'absolute', top: '50%', right: '5px', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(0,0,0,0.4)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
            <ChevronRight size={16} />
          </button>
          <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: '4px' }}>
            {images.map((_, idx) => (
              <div 
                key={idx} 
                onClick={(e) => handleDotClick(e, idx)} 
                style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  backgroundColor: currentImageIndex === idx ? 'var(--color-accent)' : 'rgba(255,255,255,0.6)', 
                  cursor: 'pointer', 
                  transition: 'background-color 0.3s' 
                }} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CourseImageSlider;
