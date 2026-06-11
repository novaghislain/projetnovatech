import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FedapayWidget from '../components/FedapayWidget';
import { useLanguage } from '../contexts/LanguageContext';
import { CheckCircle, ShieldCheck, User, Users, MapPin, Mail, Phone, CreditCard, BookOpen, ArrowRight, Lock, ArrowLeft } from 'lucide-react';
import './Inscription.css';
import { API_URL } from '../config';

const Inscription = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const { t, language } = useLanguage();
  
  const initialFormationId = location.state?.formationId || null;

  const [formations, setFormations] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(initialFormationId || '');
  const [course, setCourse] = useState(null);
  
  const [step, setStep] = useState(location.state?.transactionId ? 2 : 1);
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
    guestFirstName: '',
    guestLastName: '',
    guestEmail: '',
    guestPhone: '',
    address: '',
    paymentType: 'complet',
    transactionId: location.state?.transactionId || null
  });

  const isPhysicalCourse = course && (course.format === 'physique' || (course.format === 'masse' && course.locationMode === 'physique'));
  const [physicalSuccess, setPhysicalSuccess] = useState(false);

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

  useEffect(() => {
    fetchFormations();
  }, []);

  useEffect(() => {
    if (selectedCourseId && formations.length > 0) {
      setCourse(formations.find(f => f.id === Number(selectedCourseId)) || null);
    }
  }, [selectedCourseId, formations]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      if (!response.ok) throw new Error(result.error || (language === 'en' ? 'Registration error' : "Erreur d'inscription"));

      if (isPhysicalCourse) {
        setPhysicalSuccess(true);
      } else if (result.status === 'waitlist') {
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

  if (loading) return <div style={{ padding: '5rem', textAlign: 'center' }}>{t('loading')}</div>;

  if (waitlistSuccess) {
    return (
      <div className="inscription-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ marginBottom: '1rem' }}>{language === 'en' ? 'On Waitlist' : "Sur Liste d'Attente"}</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              {language === 'en' 
                ? 'The selected course is currently full. You have been successfully added to the waitlist. We will contact you as soon as a spot opens up!' 
                : "La formation sélectionnée est actuellement complète. Vous avez été ajouté(e) avec succès à la liste d'attente. Nous vous contacterons dès qu'une place se libère !"}
            </p>
            <button className="btn btn-primary" onClick={() => navigate(language === 'en' ? '/en' : '/mon-espace')}>{language === 'en' ? 'Go to my space' : 'Aller à mon espace'}</button>
          </div>
        </div>
      </div>
    );
  }

  if (physicalSuccess) {
    return (
      <div className="inscription-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ marginBottom: '1rem' }}>{language === 'en' ? 'Registration Successful!' : "Inscription Réussie !"}</h2>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              {language === 'en' 
                ? 'Your registration is confirmed. Please join our WhatsApp group to receive further instructions and updates about the physical session.' 
                : "Votre inscription est confirmée. Veuillez rejoindre notre groupe WhatsApp pour recevoir toutes les informations concernant la session en présentiel."}
            </p>
            {course?.whatsappLink ? (
              <a href={course.whatsappLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-block', backgroundColor: '#25D366', borderColor: '#25D366' }}>
                {language === 'en' ? 'Join WhatsApp Group' : 'Rejoindre le groupe WhatsApp'}
              </a>
            ) : (
              <p style={{ color: '#d97706', fontWeight: 600 }}>Le lien WhatsApp sera bientôt disponible. Nous vous contacterons.</p>
            )}
            <br />
            <button className="btn btn-outline" onClick={() => navigate(language === 'en' ? '/en' : '/')} style={{ marginTop: '2rem' }}>
              {language === 'en' ? 'Back to Home' : 'Retour à l\'accueil'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isFull = course && course.enrolled >= course.maxParticipants;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* TOP BAR - Remplace la Navbar publique */}
      <div style={{ background: '#1A1A2E', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
        <img src="/4x.png" alt="Novatech Vision" style={{ height: '36px' }} />
        <button
          onClick={() => navigate(language === 'en' ? '/en/courses' : '/formations')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.5rem 1.2rem', borderRadius: '50px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
        >
          <ArrowLeft size={16} /> {t('back')}
        </button>
      </div>
      <div className="inscription-page page-transition">
      <div className="inscription-layout">
        
        {/* MAIN FORM */}
        <div className="inscription-main">
          <h1 className="inscription-title">{t('ins_title')}</h1>
          
          <div className="inscription-steps">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>{language === 'en' ? '1. Secure Payment' : '1. Paiement sécurisé'}</div>
            {!isPhysicalCourse && (
              <div className={`step ${step >= 2 ? 'active' : ''}`}>{language === 'en' ? '2. Student Information' : '2. Informations de l\'enfant'}</div>
            )}
          </div>

          {step === 1 && (
            <div className="fade-in">
                <div style={{ backgroundColor: 'var(--color-bg-light)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: '1rem', textAlign: 'center' }}>
                    {language === 'en' ? 'Pay before registering' : 'Payez avant de vous inscrire'}
                  </h2>
                  <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '2rem' }}>
                    {language === 'en' ? 'To secure your spot, please complete the payment first. You will provide the student details right after.' : 'Pour sécuriser votre place, veuillez effectuer le paiement en premier. Vous renseignerez les détails de l\'enfant juste après.'}
                  </p>

                  <div className="form-section">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                      <BookOpen size={20} /> {t('ins_choice')}
                    </h3>
                    <div className="form-group">
                      <select className="form-input" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} required>
                        <option value="">{t('ins_choose_opt')}</option>
                        {formations.map(f => (
                          <option key={f.id} value={f.id}>{f.title} ({f.price?.toLocaleString()} FCFA)</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {course && !isFull && (
                    <div className="form-section">
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                        <CreditCard size={20} /> {t('ins_payment_type')}
                      </h3>
                      <div className="form-group">
                        <select className="form-input" name="paymentType" value={formData.paymentType} onChange={handleChange}>
                          <option value="complet">{t('ins_pay_complet')}</option>
                          <option value="mensuel">{t('ins_pay_mensuel')}</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {course && (
                    <div style={{ marginTop: '2rem' }}>
                      {isFull ? (
                        <div style={{ backgroundColor: '#fff7ed', padding: '1.5rem', borderRadius: '12px', border: '1px solid #ffedd5' }}>
                          <h4 style={{ color: '#c2410c', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <CheckCircle size={20} /> {t('ins_full_title')}
                          </h4>
                          <p style={{ color: '#9a3412', marginBottom: '1.5rem' }}>
                            {t('ins_full_desc')}
                          </p>
                          <button className="btn btn-primary" onClick={() => setStep(2)} style={{ width: '100%' }}>
                            {language === 'en' ? 'Join Waitlist (Free)' : "Rejoindre la liste d'attente (Gratuit)"}
                          </button>
                        </div>
                      ) : (
                        <div>
                          {!auth.user && (
                            <div className="form-section" style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                              <h4 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>{language === 'en' ? 'Your Contact Details' : 'Vos informations de contact'}</h4>
                              <div className="form-row">
                                <div className="form-group">
                                  <label>{language === 'en' ? 'First Name' : 'Prénom'} *</label>
                                  <input className="form-input" name="guestFirstName" value={formData.guestFirstName} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                  <label>{language === 'en' ? 'Last Name' : 'Nom'} *</label>
                                  <input className="form-input" name="guestLastName" value={formData.guestLastName} onChange={handleChange} required />
                                </div>
                              </div>
                              <div className="form-row">
                                <div className="form-group">
                                  <label>Email *</label>
                                  <input type="email" className="form-input" name="guestEmail" value={formData.guestEmail} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                  <label>{language === 'en' ? 'WhatsApp Phone' : 'Téléphone WhatsApp'} *</label>
                                  <input type="tel" className="form-input" name="guestPhone" value={formData.guestPhone} onChange={handleChange} required />
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {(!auth.user && (!formData.guestFirstName || !formData.guestEmail || !formData.guestPhone)) ? (
                            <button className="btn btn-primary" disabled style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', opacity: 0.5, cursor: 'not-allowed' }}>
                              {language === 'en' ? 'Fill contact details first' : 'Remplissez vos informations d\'abord'}
                            </button>
                          ) : (!course.price || course.price === 0) ? (
                            <button className="btn btn-primary" onClick={() => setStep(2)} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                              {language === 'en' ? 'Confirm Free Enrollment' : "Confirmer l'inscription gratuite"}
                            </button>
                          ) : (
                            <FedapayWidget 
                              amount={formData.paymentType === 'mensuel' ? Math.ceil(course.price / 2) : course.price} 
                              description={`${language === 'en' ? 'Enrollment:' : 'Inscription:'} ${course.title} ${formData.paymentType === 'mensuel' ? (language === 'en' ? '(Installment 1/2)' : '(1ère tranche 50%)') : (language === 'en' ? '(Full payment)' : '(Paiement complet)')}`}
                              customerInfo={
                                auth.user ? {
                                  email: auth.user.email,
                                  firstName: auth.user.firstName,
                                  lastName: auth.user.lastName,
                                  phone: auth.user.phone
                                } : {
                                  email: formData.guestEmail,
                                  firstName: formData.guestFirstName,
                                  lastName: formData.guestLastName,
                                  phone: formData.guestPhone
                                }
                              }
                              onSuccess={async (resp) => {
                                const txId = resp?.id || resp?.transactionId || 'feda_success';
                                setFormData(prev => ({ ...prev, transactionId: txId }));
                                
                                if (isPhysicalCourse) {
                                  // Pour les formations physiques, on procède directement à l'inscription et on affiche le succès
                                  await processEnrollment('FedaPay', txId);
                                } else {
                                  // Sinon on passe à l'étape 2
                                  setStep(2);
                                }
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )}

                </div>
            </div>
          )}

          {step === 2 && course && (
            <div className="fade-in">
              <button className="btn btn-outline" onClick={() => setStep(1)} style={{ marginBottom: '2rem' }}>
                ← {t('back')}
              </button>

              {!isFull && (
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <CheckCircle size={28} color="#16a34a" style={{ flexShrink: 0 }} />
                  <div>
                    <h4 style={{ color: '#16a34a', margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>{language === 'en' ? 'Payment Successful!' : 'Paiement Réussi !'}</h4>
                    <p style={{ color: '#15803d', margin: 0 }}>
                      {language === 'en' ? 'Your spot is secured.' : 'Votre place est sécurisée.'} {!auth.user ? (language === 'en' ? 'Please log in to continue.' : 'Veuillez vous connecter pour continuer.') : (language === 'en' ? 'Please fill out the student details below to finalize the enrollment.' : 'Veuillez remplir les informations de l\'étudiant ci-dessous pour finaliser l\'inscription.')}
                    </p>
                  </div>
                </div>
              )}

              {!auth.user ? (
                <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <User size={48} color="var(--color-primary)" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
                  <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>
                    {language === 'en' ? 'Authentication Required' : 'Authentification Requise'}
                  </h3>
                  <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                    {language === 'en' ? 'You must be logged in to register a student and access your dashboard.' : 'Vous devez avoir un compte pour enregistrer l\'enfant et accéder à votre espace parent.'}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="btn btn-primary" onClick={() => navigate('/register', { state: { from: '/inscription', transactionId: formData.transactionId, formationId: selectedCourseId } })}>
                      {language === 'en' ? 'Create an account' : 'Créer un compte'}
                    </button>
                    <button className="btn btn-outline" onClick={() => navigate('/login', { state: { from: '/inscription', transactionId: formData.transactionId, formationId: selectedCourseId } })}>
                      {language === 'en' ? 'Log in' : 'Se connecter'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); processEnrollment(isFull ? 'waitlist' : 'FedaPay', formData.transactionId || null); }}>
                <div className="form-section">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                    <User size={20} /> {t('ins_child_info')}
                  </h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('ins_child_firstname')}</label>
                      <input className="form-input" name="childFirstName" value={formData.childFirstName} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>{t('ins_child_lastname')}</label>
                      <input className="form-input" name="childLastName" value={formData.childLastName} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{t('ins_child_age')}</label>
                    <input type="number" className="form-input" name="childAge" value={formData.childAge} onChange={handleChange} required min="5" max="25" />
                  </div>
                </div>

                <div className="form-section">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                    <Users size={20} /> {t('ins_parent_info')}
                  </h3>
                  <div className="form-group">
                    <label>{t('ins_parent_fullname')}</label>
                    <input className="form-input" name="parentName" value={formData.parentName} onChange={handleChange} required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('ins_parent_phone')}</label>
                      <input type="tel" className="form-input" name="parentPhone" value={formData.parentPhone} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>{t('ins_parent_email')}</label>
                      <input type="email" className="form-input" name="parentEmail" value={formData.parentEmail} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{t('ins_address')}</label>
                    <input className="form-input" name="address" value={formData.address} onChange={handleChange} required />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={submitLoading} style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1.1rem', borderRadius: '12px' }}>
                  {submitLoading ? t('loading') : (language === 'en' ? 'Complete Enrollment' : 'Terminer mon inscription')} <CheckCircle size={18} style={{ marginLeft: '0.5rem' }} />
                </button>
              </form>
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
                  <li><span>{t('ins_duration')}</span><strong>{course.duration || '—'}</strong></li>
                  <li><span>{t('ins_audience')}</span><strong>{course.ageGroup || '—'}</strong></li>
                  <li><span>{t('ins_format')}</span><strong>{course.isOnline ? t('ins_online') : t('ins_in_person')}</strong></li>
                  {isFull && <li><span style={{ color: '#ef4444', fontWeight: 700 }}>{t('ins_waitlist_warning')}</span></li>}
                </ul>
                <div className="summary-total">
                  <span>{t('ins_total_price')}</span>
                  <strong>{course.price?.toLocaleString()} FCFA</strong>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>
                <BookOpen size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                <p>{language === 'en' ? 'Select a course to view details' : 'Sélectionnez une formation pour voir les détails'}</p>
              </div>
            )}

            <div className="trust-badges">
              <div className="trust-badge">
                <ShieldCheck size={22} />
                <div>
                  <strong>{t('ins_secure_payment')}</strong>
                  <span>{t('ins_secure_payment_desc')}</span>
                </div>
              </div>
              <div className="trust-badge">
                <Lock size={22} />
                <div>
                  <strong>{t('ins_privacy')}</strong>
                  <span>{t('ins_privacy_desc')}</span>
                </div>
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
