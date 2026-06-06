// Détecte automatiquement l'IP de la machine ou utilise l'environnement
export const API_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5001`;

export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads')) return `${API_URL}${url}`;
  return url;
};
