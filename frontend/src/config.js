// Détecte automatiquement si l'application tourne en local ou en production (Vercel)
const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_URL = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL
  : (isLocal ? `${window.location.protocol}//${window.location.hostname}:5001` : '');

export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://localhost:5001')) return url.replace('http://localhost:5001', API_URL);
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads') || url.startsWith('/api/images')) return `${API_URL}${url}`;
  return url;
};
