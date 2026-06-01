import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const MonEspace = () => {
  const { user } = useAuth();
  return (
    <div className="container section-padding">
      <h1>Mon Espace</h1>
      <p>Bienvenue, <strong>{user?.firstName}</strong> ({user?.email})</p>
      <p>Tableau de bord utilisateur (bientôt...)</p>
    </div>
  );
};

export default MonEspace;
