import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, CheckCircle, Clock } from 'lucide-react';
import { getFormations } from '../services/formationService';
import { API_URL } from '../config';

const Paiements = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Try to map course IDs from the frontend service
  const allCourses = getFormations();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('nv_token');
        const response = await fetch(`${API_URL}/api/user/payments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Erreur lors de la récupération des paiements');
        const data = await response.json();
        setPayments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const getCourseTitle = (id) => {
    // Inscription.jsx uses 1, 2, 3. formationService uses f1, f2, f3. 
    // We try to match both.
    const course = allCourses.find(c => String(c.id) === String(id) || String(c.id) === `f${id}`);
    if (course) return course.title;
    
    // Fallback if not found in service
    const hardcoded = {
      '1': 'Initiation à la Programmation',
      '2': "Découverte de l'Intelligence Artificielle",
      '3': 'Maîtrise de la Bureautique',
      '4': 'Création de sites Web (HTML/CSS)'
    };
    return hardcoded[String(id)] || `Formation #${id}`;
  };

  return (
    <div className="page-transition" style={{ backgroundColor: 'var(--color-bg-light)', minHeight: '80vh', padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '1rem', borderRadius: '12px' }}>
            <CreditCard size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', color: 'var(--color-primary)', margin: 0 }}>Mes Paiements</h1>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Historique de vos transactions sur Novatech Vision</p>
          </div>
        </div>

        {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>Chargement...</div>
          ) : payments.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <Clock size={48} color="#ccc" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--color-primary)' }}>Aucun paiement trouvé</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>Vous n'avez pas encore effectué d'achat sur la plateforme.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                    <th style={{ padding: '1.2rem', fontWeight: 600, color: 'var(--color-primary)' }}>Formation</th>
                    <th style={{ padding: '1.2rem', fontWeight: 600, color: 'var(--color-primary)' }}>Montant</th>
                    <th style={{ padding: '1.2rem', fontWeight: 600, color: 'var(--color-primary)' }}>Méthode</th>
                    <th style={{ padding: '1.2rem', fontWeight: 600, color: 'var(--color-primary)' }}>Date</th>
                    <th style={{ padding: '1.2rem', fontWeight: 600, color: 'var(--color-primary)' }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => (
                    <tr key={payment.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '1.2rem', fontWeight: 500 }}>{getCourseTitle(payment.courseId)}</td>
                      <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>{payment.amount.toLocaleString()} FCFA</td>
                      <td style={{ padding: '1.2rem' }}>
                        <span style={{ backgroundColor: '#e2e8f0', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                          {payment.paymentMethod || 'FedaPay'}
                        </span>
                      </td>
                      <td style={{ padding: '1.2rem', color: '#666' }}>
                        {new Date(payment.paymentDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '1.2rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#16a34a', backgroundColor: '#dcfce7', padding: '0.4rem 0.8rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600 }}>
                          <CheckCircle size={14} /> Réussi
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Paiements;
