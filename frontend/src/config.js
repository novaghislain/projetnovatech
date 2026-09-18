// Determine the base URL dynamically based on the current hostname
// This ensures that when accessing via a phone (e.g. 192.168.x.x), it points to the correct backend IP instead of localhost
export const API_URL = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL
  : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? `${window.location.protocol}//${window.location.hostname}:5001`
    : `${window.location.protocol}//${window.location.hostname}`;

export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith(`${API_URL}`)) return url.replace(`${API_URL}`, API_URL);
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads') || url.startsWith('/api/images')) return `${API_URL}${url}`;
  return url;
};
