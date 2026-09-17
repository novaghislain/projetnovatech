// Determine the base URL dynamically based on the current hostname
// This ensures that when accessing via a phone (e.g. 192.168.x.x), it points to the correct backend IP instead of localhost
export const API_URL = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL
  : `${window.location.protocol}//${window.location.hostname}:5001`;

export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://localhost:5001')) return url.replace('http://localhost:5001', API_URL);
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads') || url.startsWith('/api/images')) return `${API_URL}${url}`;
  return url;
};
