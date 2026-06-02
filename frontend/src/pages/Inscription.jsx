import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PaymentWidget from '../components/PaymentWidget';
import FedapayWidget from '../components/FedapayWidget';
import './Inscription.css';

const Inscription = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  
  // Liste complète des formations disponibles
  const allCourses = [
    { id: 1, title: 'Initiation à la Programmation', price: 25000, image: '/9x.jpeg' },
    { id: 2, title: "Découverte de l'Intelligence Artificielle", price: 30000, image: '/8x.jpeg' },
    { id: 3, title: 'Maîtrise de la Bureautique', price: 20000, image: '/10x.jpg' },
    { id: 4, title: 'Création de sites Web (HTML/CSS)', price: 35000, image: '/11x.jpg' }
  ];

  // Si l'utilisateur vient d'une page spécifique, on préselectionne, sinon on prend la première (ou aucune)
  const [selectedCourseId, setSelectedCourseId] = useState(
    location.state?.course?.id || allCourses[0].id
  );

  const course = allCourses.find(c => c.id === Number(selectedCourseId)) || allCourses[0];

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCourseChange = (e) => {
    setSelectedCourseId(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!auth.user) {
      navigate('/connexion', { state: { from: location.pathname, autoReserve: { formationId: selectedCourseId, formData } } });
      return;
    }

    if (formData.firstName && formData.lastName && formData.email && formData.phone) {
      setStep(2); // Go to payment step
    }
  };

  useEffect(() => {
    if (!auth.user) {
      // if user landed here directly without being logged, redirect to login preserving intent
      navigate('/connexion', { state: { from: location.pathname, autoReserve: { formationId: selectedCourseId, formData } } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="inscription-container section-padding">
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div className="inscription-header text-center" style={{ marginBottom: '3rem' }}>
          <h1 className="section-title">Finaliser votre inscription</h1>
          <p className="section-subtitle">Vous êtes à deux doigts de débloquer votre accès.</p>
        </div>

        <div className="inscription-card">
          {/* RECAP FORMATION */}
          <div className="course-recap">
            <img src={course.image} alt={course.title} className="recap-img" />
            <div className="recap-info">
              <h3>{course.title}</h3>
              <div className="recap-price">{course.price.toLocaleString()} FCFA</div>
            </div>
          </div>

          <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #eee' }} />

          {/* STEP 1: INFORMATIONS PERSONNELLES */}
          {step === 1 && (
            <div className="fade-in">
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>1. Vos informations</h3>
              <form onSubmit={handleSubmit} className="inscription-form">
                
                {/* CHOIX DE LA FORMATION */}
                <div className="form-group" style={{ backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <label>Quelle formation souhaitez-vous suivre ? *</label>
                  <select 
                    className="form-control" 
                    value={selectedCourseId} 
                    onChange={handleCourseChange}
                    style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}
                  >
                    {allCourses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.title} - {c.price.toLocaleString()} FCFA
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Prénom *</label>
                    <input type="text" name="firstName" className="form-control" value={formData.firstName} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Nom *</label>
                    <input type="text" name="lastName" className="form-control" value={formData.lastName} onChange={handleChange} required />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Adresse Email *</label>
                  <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
                </div>
                
                <div className="form-group">
                  <label>Numéro de téléphone (WhatsApp) *</label>
                  <input type="tel" name="phone" className="form-control" value={formData.phone} onChange={handleChange} placeholder="Ex: +229 01 02 03 04" required />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
                  Continuer vers le paiement
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: PAIEMENT */}
          {step === 2 && (
            <div className="fade-in">
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>2. Paiement sécurisé</h3>
              <p style={{ color: '#666', textAlign: 'center', marginBottom: '2rem' }}>
                Vous allez régler la somme de <strong>{course.price.toLocaleString()} FCFA</strong>. Choisissez votre méthode de paiement préférée :
              </p>
              
              <div className="payment-widget-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <PaymentWidget 
                  amount={course.price} 
                  sandbox={false} 
                  customerInfo={formData} 
                />
                
                <div style={{ margin: '1rem 0', color: '#888', fontWeight: 'bold' }}>OU</div>

                <FedapayWidget 
                  amount={course.price} 
                  customerInfo={formData} 
                />
              </div>

              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button type="button" className="btn-link" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#888', textDecoration: 'underline', cursor: 'pointer' }}>
                  Retour aux informations
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Inscription;
