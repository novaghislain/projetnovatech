import React from 'react';
import '../styles/LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">Chargement de l'application...</p>
    </div>
  );
};

export default LoadingScreen;
