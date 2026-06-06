import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FedapayWidget from '../components/FedapayWidget';
import { CheckCircle, ShieldCheck, User, Users, MapPin, Mail, Phone, CreditCard, BookOpen, ArrowRight, Lock } from 'lucide-react';
import './Inscription.css';
import { API_URL } from '../config';

const Inscription = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  
  const initialFormationId = location.state?.formationId || null;

  const [formations, setFormations] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(initialFormationId || '');
  const [course, setCourse] = useState(null);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  const [formData, setFormData] = useState({
    childFirstName: '',
    childLastName: '',
    childAge: '',
    parentName: auth?.user?.firstName ? `${auth.user.firstName} ${auth.user.lastName}` : '',
    parentPhone: auth?.user?.phone || '',
    parentEmail: auth?.user?.email || '',
    address: '',
    paymentType: 'complet'
  });

  useEffect(() => {
    if (!auth.user) {
      navigate('/register', { state: { from: '/inscription' } });
      return;
    }
    fetchFormations();
  }, [auth.user, navigate]);

  useEffect(() => {
    if (selectedCourseId && formations.length > 0) {
      setCourse(formations.find(f => f.id === Number(selectedCourseId)) || null);
    }
  }, [selectedCourseId, formations]);

  const fetchFormations = async () => {
    try {
      const res = await fetch(`${API_URL}/api/public/formations`);
      const data = await res.json();
      setFormations(data);
      if (!selectedCourseId && data.length > 0) setSelectedCourseId(data[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!selectedCourseId) return alert('Veuillez sélectionner une formation');
    setStep(2);
  };

  const processEnrollment = async (paymentMethod = null, transactionId = null) => {
    setSubmitLoading(true);
    try {
      const token = localStorage.getItem('nv_token');
      const response = await fetch(`${API_URL}/api/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          courseId: selectedCourseId,
          amount: course.price,
          paymentMethod,
          transactionId
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erreur d'inscription");

      if (result.status === 'waitlist') {
        setWaitlistSuccess(true);
      } else {
        navigate('/mon-espace');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handlePaymentComplete = (transactionId) => {
    // Si paiement via FedaPay réussi
    processEnrollment('FedaPay', transactionId);
  };

  const handleWaitlistSubmit = () => {
    // Inscription sans paiement si complet
    processEnrollment();
  };

  if (loading) return <div style={{ padding: '5rem', textAlign: 'center' }}>Chargement...</div>;

  if (waitlistSuccess) {
    return (
      <div className="inscription-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ marginBottom: '1rem' }}>Sur Liste d'Attente</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              La formation sélectionnée est actuellement complète. Vous avez été ajouté(e) avec succès à la liste d'attente. Nous vous contacterons dès qu'une place se libère !
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/mon-espace')}>Aller à mon espace</button>
          </div>
        </div>
      </div>
    );
  }

  const isFull = course && course.enrolled >= course.maxParticipants;

  return (
    <div className="inscription-page page-transition">
      <div className="inscription-layout">
        
        {/* MAIN FORM */}
        <div className="inscription-main">
          <h1 className="inscription-title">Formulaire d'Inscription</h1>
          
          <div className="inscription-steps">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Informations</div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Paiement</div>
          </div>

          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="fade-in">
                
                <div className="form-section">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                    <BookOpen size={20} /> Choix de la Formation
                  </h3>
                  <div className="form-group">
                    <label>Sélectionnez une formation *</label>
                    <select className="form-input" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} required>
                      <option value="">-- Choisir --</option>
                      {formations.map(f => (
                        <option key={f.id} value={f.id}>{f.title} ({f.price?.toLocaleString()} FCFA)</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-section">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                    <User size={20} /> Informations de l'enfant (Apprenant)
                  </h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Prénom *</label>
                      <input className="form-input" name="childFirstName" value={formData.childFirstName} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>Nom *</label>
                      <input className="form-input" name="childLastName" value={formData.childLastName} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Âge de l'enfant *</label>
                    <input type="number" className="form-input" name="childAge" value={formData.childAge} onChange={handleChange} required min="5" max="25" />
                  </div>
                </div>

                <div className="form-section">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                    <Users size={20} /> Informations du Parent / Tuteur
                  </h3>
                  <div className="form-group">
                    <label>Nom complet du parent *</label>
                    <input className="form-input" name="parentName" value={formData.parentName} onChange={handleChange} required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Téléphone *</label>
                      <input type="tel" className="form-input" name="parentPhone" value={formData.parentPhone} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>Email *</label>
                      <input type="email" className="form-input" name="parentEmail" value={formData.parentEmail} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Adresse physique (Ville, Quartier) *</label>
                    <input className="form-input" name="address" value={formData.address} onChange={handleChange} required />
                  </div>
                </div>

                {!isFull && (
                  <div className="form-section">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                      <CreditCard size={20} /> Type de Paiement
                    </h3>
                    <div className="form-group">
                      <select className="form-input" name="paymentType" value={formData.paymentType} onChange={handleChange}>
                        <option value="complet">Paiement complet à l'inscription</option>
                        <option value="mensuel">Paiement mensuel (Si formation &gt; 1 mois)</option>
                      </select>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1rem', borderRadius: '12px' }}>
                  Étape Suivante <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                </button>
              </form>
          )}

          {step === 2 && course && (
            <div className="inscription-payment fade-in">
              <button className="btn btn-outline" onClick={() => setStep(1)} style={{ marginBottom: '2rem' }}>
                ← Retour
              </button>

              <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)', fontSize: '1.3rem', fontWeight: 700 }}>Récapitulatif de votre inscription</h3>
              
              <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '14px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                <p style={{ margin: '0 0 0.6rem 0' }}><strong>Formation :</strong> {course.title}</p>
                <p style={{ margin: '0 0 0.6rem 0' }}><strong>Apprenant :</strong> {formData.childFirstName} {formData.childLastName} ({formData.childAge} ans)</p>
                <p style={{ margin: '0 0 0.6rem 0' }}><strong>Parent :</strong> {formData.parentName} ({formData.parentPhone})</p>
                <hr style={{ margin: '1rem 0', borderColor: '#e5e7eb' }} />
                <p style={{ margin: '0', fontSize: '1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Total à payer :</span>
                  <strong style={{ color: 'var(--color-primary)', fontSize: '1.3rem' }}>{course.price?.toLocaleString()} FCFA</strong>
                </p>
              </div>

              {isFull ? (
                <div style={{ backgroundColor: '#fff7ed', padding: '1.5rem', borderRadius: '12px', border: '1px solid #ffedd5' }}>
                  <h4 style={{ color: '#c2410c', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <CheckCircle size={20} /> Formation complète
                  </h4>
                  <p style={{ color: '#9a3412', marginBottom: '1.5rem' }}>
                    Aucun paiement n'est requis pour le moment. Vous allez être placé(e) sur liste d'attente.
                  </p>
                  <button className="btn btn-primary" onClick={handleWaitlistSubmit} disabled={submitLoading} style={{ width: '100%' }}>
                    {submitLoading ? 'Validation...' : "Confirmer l'inscription sur liste d'attente"}
                  </button>
                </div>
              ) : (
                <div>
                  <h4 style={{ marginBottom: '1rem', color: '#0f172a' }}>Procéder au paiement</h4>
                  <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                    Cliquez sur le bouton ci-dessous pour régler par Mobile Money ou Carte Bancaire via notre partenaire sécurisé.
                  </p>
                  <FedapayWidget 
                    amount={course.price} 
                    description={`Inscription: ${course.title}`}
                    customerInfo={{
                      email: formData.parentEmail,
                      firstName: formData.parentName,
                      lastName: "",
                      phone: formData.parentPhone
                    }}
                    onSuccess={handlePaymentComplete}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="inscription-sidebar">
          <div className="summary-card">
            {course ? (
              <>
                <div style={{ height: '160px', backgroundImage: `url(${course.imageUrl || '/10x.jpg'})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '12px', marginBottom: '1.5rem' }}></div>
                <h3>{course.title}</h3>
                <ul className="summary-details">
                  <li><span>Durée</span><strong>{course.duration || '—'}</strong></li>
                  <li><span>Public</span><strong>{course.ageGroup || '—'}</strong></li>
                  <li><span>Format</span><strong>{course.isOnline ? 'En ligne 💻' : 'Présentiel 🏫'}</strong></li>
                  {isFull && <li><span style={{ color: '#ef4444', fontWeight: 700 }}>⚠ COMPLET — Liste d'attente</span></li>}
                </ul>
                <div className="summary-total">
                  <span>Prix total</span>
                  <strong>{course.price?.toLocaleString()} FCFA</strong>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>
                <BookOpen size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                <p>Sélectionnez une formation pour voir les détails</p>
              </div>
            )}

            <div className="trust-badges">
              <div className="trust-badge">
                <ShieldCheck size={22} />
                <div>
                  <strong>Paiement Sécurisé</strong>
                  <span>Vos données sont chiffrées de bout en bout</span>
                </div>
              </div>
              <div className="trust-badge">
                <Lock size={22} />
                <div>
                  <strong>Confidentialité</strong>
                  <span>Vos informations ne sont jamais partagées</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inscription;
