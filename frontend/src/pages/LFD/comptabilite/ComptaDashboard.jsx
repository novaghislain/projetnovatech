import { API_URL } from '../../../config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ComptaDashboard = () => {
  const navigate = useNavigate();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('lfd_token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_URL}/api/lfd/accounting/journals`, { headers });
      setJournals(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="lfd-page">
      <h2>Tableau de bord Comptabilité</h2>
      
      <div className="lfd-dashboard-actions">
        <button className="lfd-btn lfd-btn-primary" onClick={() => navigate('/gestion/comptabilite/saisie')}>
          Créer une entrée (Saisie)
        </button>
        <button className="lfd-btn lfd-btn-secondary" onClick={() => navigate('/gestion/comptabilite/grand-livre')}>
          Grand Livre
        </button>
        <button className="lfd-btn lfd-btn-secondary" onClick={() => navigate('/gestion/comptabilite/balance')}>
          Balance Générale
        </button>
        <button className="lfd-btn lfd-btn-secondary" onClick={() => navigate('/gestion/comptabilite/parametres')}>
          Paramètres Comptables
        </button>
      </div>

      <div className="lfd-card">
        <h3>Journaux Comptables</h3>
        <table className="lfd-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Nom</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {journals.map(j => (
              <tr key={j.id}>
                <td><strong>{j.code}</strong></td>
                <td>{j.name}</td>
                <td>{j.journal_type}</td>
                <td>
                  <button 
                    className="lfd-btn-small lfd-btn-secondary" 
                    onClick={() => navigate(`/gestion/comptabilite/journaux/${j.id}`)}
                  >
                    Voir écritures
                  </button>
                </td>
              </tr>
            ))}
            {journals.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center">Aucun journal trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComptaDashboard;
