// Détecte automatiquement l'IP de la machine ou utilise l'environnement
export const API_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5001`;
