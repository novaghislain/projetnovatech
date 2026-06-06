import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const PLACEMENT_STYLES = {
  header: {
    container: { margin: '0 0 1.5rem 0', textAlign: 'center' },
    img: { maxWidth: '100%', width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
    label: 'Publicité'
  },
  sidebar: {
    container: { margin: '0 0 1.5rem 0', textAlign: 'center' },
    img: { maxWidth: '100%', width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
    label: 'Publicité'
  },
  inline: {
    container: { margin: '2rem 0', textAlign: 'center' },
    img: { maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
    label: 'Sponsorisé'
  },
  footer: {
    container: { margin: '2rem 0 0 0', textAlign: 'center', padding: '1rem 0', borderTop: '1px solid #e5e7eb' },
    img: { maxWidth: '100%', maxHeight: '100px', objectFit: 'contain', borderRadius: '8px' },
    label: 'Publicité'
  }
};

const AdBanner = ({ placement }) => {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        // 1. Chercher une pub pour cet emplacement précis
        const placementUrl = placement
          ? `${API_URL}/api/ads?placement=${encodeURIComponent(placement)}`
          : `${API_URL}/api/ads`;
        let response = await axios.get(placementUrl);
        let ads = response.data;

        // 2. Fallback : si aucune pub pour cet emplacement, prendre n'importe quelle pub active
        if (ads.length === 0 && placement) {
          const fallbackRes = await axios.get(`${API_URL}/api/ads`);
          ads = fallbackRes.data;
        }

        if (ads.length > 0) {
          const randomAd = ads[Math.floor(Math.random() * ads.length)];
          setAd(randomAd);
          
          // 2. Enregistrer la Vue
          await axios.post(`${API_URL}/api/ads/${randomAd.id}/view`);
        }
      } catch (error) {
        console.error('Erreur de chargement de la pub:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [placement]);

  if (loading) return <div style={{ height: '90px', background: '#f8fafc', borderRadius: '12px' }} />;

  if (!ad) return null;

  const style = PLACEMENT_STYLES[placement] || PLACEMENT_STYLES.header;

  return (
    <div className="ad-banner-container" style={style.container}>
      <span style={{
        display: 'inline-block',
        background: 'rgba(0,0,0,0.5)',
        color: 'white',
        fontSize: '0.7rem',
        padding: '2px 8px',
        borderRadius: '4px',
        marginBottom: '0.3rem',
      }}>
        {style.label}
      </span>
      <a
        href={`${API_URL}/api/ads/${ad.id}/click`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'block' }}
      >
        <img
          src={ad.imageUrl}
          alt={`Publicité ${ad.advertiserName}`}
          style={style.img}
        />
      </a>
    </div>
  );
};

export default AdBanner;
