import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Download, CheckCircle } from 'lucide-react';
import { getFormations } from '../services/formationService';

const Recus = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const allCourses = getFormations();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('nv_token');
        const response = await fetch('http://localhost:5001/api/user/payments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Erreur lors de la récupération des reçus');
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
    const course = allCourses.find(c => String(c.id) === String(id) || String(c.id) === `f${id}`);
    if (course) return course.title;
    
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
            <FileText size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', color: 'var(--color-primary)', margin: 0 }}>Mes Reçus</h1>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Consultez et téléchargez vos factures numériques</p>
          </div>
        </div>

        {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
        {loading && <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>Chargement...</div>}

        {!loading && payments.length === 0 && (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <FileText size={48} color="#ccc" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--color-primary)' }}>Aucun reçu disponible</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>Vos futures factures apparaîtront ici.</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {payments.map(payment => (
            <div key={payment.id} style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', position: 'relative' }}>
              
              {/* Entête du reçu */}
              <div style={{ backgroundColor: 'var(--color-primary)', padding: '1.5rem', color: 'white', textAlign: 'center', borderBottom: '2px dashed rgba(255,255,255,0.3)' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontFamily: 'var(--font-heading)' }}>NOVATECH VISION</h3>
                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Reçu #{payment.transactionId || `NV-${payment.id}2026`}</div>
              </div>

              {/* Corps du reçu */}
              <div style={{ padding: '1.5rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-10px', left: '-10px', width: '20px', height: '20px', backgroundColor: 'var(--color-bg-light)', borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '20px', height: '20px', backgroundColor: 'var(--color-bg-light)', borderRadius: '50%' }}></div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.2rem' }}>Date de paiement</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                    {new Date(payment.paymentDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.2rem' }}>Client</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{user?.firstName} {user?.lastName}</div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>{user?.email}</div>
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Formation</div>
                    <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Montant</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ color: '#555', fontSize: '0.95rem', maxWidth: '60%' }}>{getCourseTitle(payment.courseId)}</div>
                    <div style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{payment.amount.toLocaleString()} F</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>
                    Payé via {payment.paymentMethod || 'Mobile Money'}
                  </div>
                  <CheckCircle size={20} color="#16a34a" />
                </div>
              </div>

              {/* Bouton d'action */}
              <div style={{ padding: '1rem 1.5rem', backgroundColor: '#fdfdfd', borderTop: '1px solid #eee' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  onClick={() => window.print()}
                >
                  <Download size={16} /> Enregistrer PDF
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Recus;
