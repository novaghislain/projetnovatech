import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdBanner = ({ placement }) => {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch available ads from backend
    const fetchAd = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/ads');
        const ads = response.data;
        
        // Filtrer par placement si fourni
        const placementAds = placement ? ads.filter(a => a.placement === placement) : ads;

        if (placementAds.length > 0) {
          // Prendre une pub aléatoire parmi celles valides
          const randomAd = placementAds[Math.floor(Math.random() * placementAds.length)];
          setAd(randomAd);
          
          // 2. Enregistrer la Vue
          await axios.post(`http://localhost:5000/api/ads/${randomAd.id}/view`);
        }
      } catch (error) {
        console.error("Erreur de chargement de la pub:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [placement]);

  if (loading || !ad) return null; // Ne rien afficher si pas de pub

  return (
    <div className="ad-banner-container" style={{ margin: '2rem 0', textAlign: 'center', position: 'relative' }}>
      <span style={{ 
        position: 'absolute', 
        top: '10px', 
        right: '10px', 
        background: 'rgba(0,0,0,0.5)', 
        color: 'white', 
        fontSize: '0.7rem', 
        padding: '2px 6px', 
        borderRadius: '4px' 
      }}>Publicité</span>
      
      {/* Le clic passe par notre backend pour le tracking avant la redirection */}
      <a href={`http://localhost:5000/api/ads/${ad.id}/click`} target="_blank" rel="noopener noreferrer">
        <img 
          src={ad.imageUrl} 
          alt={`Publicité ${ad.advertiserName}`} 
          style={{ maxWidth: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
        />
      </a>
    </div>
  );
};

export default AdBanner;
