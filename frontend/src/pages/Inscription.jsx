import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FedapayWidget from '../components/FedapayWidget';
import { CheckCircle, ShieldCheck, Lock, CreditCard } from 'lucide-react';
import './Inscription.css';

const Inscription = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  
  const allCourses = [
    { id: 1, title: 'Initiation à la Programmation', price: 25000, image: '/9x.jpeg' },
    { id: 2, title: "Découverte de l'Intelligence Artificielle", price: 30000, image: '/8x.jpeg' },
    { id: 3, title: 'Maîtrise de la Bureautique', price: 20000, image: '/10x.jpg' },
    { id: 4, title: 'Création de sites Web (HTML/CSS)', price: 35000, image: '/11x.jpg' }
  ];

  const [selectedCourseId, setSelectedCourseId] = useState(
    location.state?.course?.id || allCourses[0].id
  );

  const course = allCourses.find(c => c.id === Number(selectedCourseId)) || allCourses[0];

  const [formData, setFormData] = useState({
    firstName: auth?.user?.firstName || '',
    lastName: auth?.user?.lastName || '',
    email: auth?.user?.email || '',
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
      setStep(2);
    }
  };

  useEffect(() => {
    if (!auth.user) {
      navigate('/connexion', { state: { from: location.pathname, autoReserve: { formationId: selectedCourseId, formData } } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!auth.user) return null;

  return (
    <div className="checkout-page-wrapper">
      <div className="checkout-container">
        
        <div className="checkout-header fade-in">
          <h1>Finaliser votre inscription</h1>
          <p>Dernière étape avant d'accéder à votre espace apprenant et vos ressources.</p>
        </div>

        <div className="checkout-grid">
          
          {/* LEFT PANEL: Order Summary & Trust */}
          <div className="checkout-summary-panel fade-in">
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '1rem' }}>
              Récapitulatif de la commande
            </h2>

            <div className="checkout-course-card">
              <img src={course.image} alt={course.title} className="checkout-course-img" />
              <div className="checkout-course-info">
                <h3>{course.title}</h3>
                <div className="checkout-course-price">{course.price.toLocaleString()} FCFA</div>
              </div>
            </div>

            <ul className="checkout-benefits-list">
              <li><CheckCircle size={20} /> Accès immédiat aux ressources</li>
              <li><CheckCircle size={20} /> Suivi personnalisé par nos experts</li>
              <li><CheckCircle size={20} /> Certification reconnue en fin de parcours</li>
              <li><CheckCircle size={20} /> Accès à la communauté Novatech</li>
            </ul>

            <div className="checkout-trust-badge">
              <ShieldCheck size={32} color="var(--color-accent)" />
              <div>
                <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '0.2rem' }}>Paiement 100% Sécurisé</strong>
                <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Vos données sont chiffrées et protégées par FedaPay.</span>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Form & Payment */}
          <div className="checkout-form-panel fade-in" style={{ animationDelay: '0.1s' }}>
            
            {step === 1 && (
              <div className="checkout-step-transition">
                <h3 className="checkout-section-title">
                  <span style={{ background: 'var(--color-bg-light)', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>1</span>
                  Vos informations personnelles
                </h3>
                
                <form onSubmit={handleSubmit}>
                  <div className="checkout-form-group" style={{ backgroundColor: '#f9f9f9', padding: '1.2rem', borderRadius: '8px', border: '1px solid #eee' }}>
                    <label>Formation choisie *</label>
                    <select 
                      className="checkout-form-input" 
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

                  <div className="checkout-form-row">
                    <div className="checkout-form-group">
                      <label>Prénom *</label>
                      <input type="text" name="firstName" className="checkout-form-input" value={formData.firstName} onChange={handleChange} required />
                    </div>
                    <div className="checkout-form-group">
                      <label>Nom *</label>
                      <input type="text" name="lastName" className="checkout-form-input" value={formData.lastName} onChange={handleChange} required />
                    </div>
                  </div>
                  
                  <div className="checkout-form-group">
                    <label>Adresse Email *</label>
                    <input type="email" name="email" className="checkout-form-input" value={formData.email} readOnly style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                  </div>
                  
                  <div className="checkout-form-group">
                    <label>Numéro de téléphone (WhatsApp) *</label>
                    <input type="tel" name="phone" className="checkout-form-input" value={formData.phone} onChange={handleChange} placeholder="Ex: +229 01 02 03 04" required />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1.1rem' }}>
                    Continuer vers le paiement <Lock size={18} style={{ marginLeft: '0.5rem' }}/>
                  </button>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="checkout-step-transition">
                <h3 className="checkout-section-title">
                  <span style={{ background: 'var(--color-bg-light)', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>2</span>
                  Paiement Sécurisé
                </h3>

                <div className="checkout-payment-box">
                  <CreditCard size={48} color="var(--color-primary)" style={{ marginBottom: '1rem' }} />
                  <h4>Règlement via Mobile Money ou Carte</h4>
                  <p>Montant à payer : <strong>{course.price.toLocaleString()} FCFA</strong></p>
                  
                  <FedapayWidget 
                    amount={course.price} 
                    customerInfo={formData} 
                  />
                </div>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <button type="button" className="btn-link" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#888', textDecoration: 'underline', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}>
                    ← Modifier mes informations
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Inscription;
