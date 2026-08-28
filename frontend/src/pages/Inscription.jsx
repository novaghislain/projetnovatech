import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FedapayWidget from '../components/FedapayWidget';
import { useLanguage } from '../contexts/LanguageContext';
import { CheckCircle, ShieldCheck, User, Users, MapPin, Mail, Phone, CreditCard, BookOpen, ArrowRight, Lock, ArrowLeft } from 'lucide-react';
import './Inscription.css';
import { API_URL, getImageUrl } from '../config';

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
    childFirstName: auth?.user?.firstName || '',
    childLastName: auth?.user?.lastName || '',
    childAge: '18',
    parentName: auth?.user?.firstName ? `${auth.user.firstName} ${auth.user.lastName}` : '',
    parentPhone: auth?.user?.phone || '',
    parentEmail: auth?.user?.email || '',
    guestFirstName: '',
    guestLastName: '',
    guestEmail: '',
    guestPhone: '',
    address: '',
    paymentType: 'complet',
    transactionId: location.state?.transactionId || null,
    paymentProof: location.state?.paymentProof || null
  });

  const [uploadingProof, setUploadingProof] = useState(false);

  const handleProofUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingProof(true);
    setPaymentError('');

    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await fetch(`${API_URL}/api/public/upload-proof`, {
        method: 'POST',
        body: uploadData
      });

      if (!res.ok) throw new Error(language === 'en' ? 'Upload failed' : 'Échec du chargement de l\'image');

      const data = await res.json();
      if (data.imageUrl) {
        setFormData(prev => ({ ...prev, paymentProof: data.imageUrl }));
      }
    } catch (err) {
      setPaymentError(err.message);
    } finally {
      setUploadingProof(false);
    }
  };

  const isPhysicalCourse = course && course.format && (
    course.format.toLowerCase() === 'physique' || 
    course.format.toLowerCase() === 'présentiel' || 
    course.format.toLowerCase() === 'presentiel' || 
    (course.format.toLowerCase() === 'masse' && course.locationMode && course.locationMode.toLowerCase() === 'physique')
  );
  const [physicalSuccess, setPhysicalSuccess] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [pendingSuccess, setPendingSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [enrollmentId, setEnrollmentId] = useState(null);


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
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const processEnrollment = async (paymentMethod = null, transactionId = null) => {
    setSubmitLoading(true);
    try {
      let token = localStorage.getItem('nv_token');

      const response = await fetch(`${API_URL}/api/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          courseId: selectedCourseId,
          amount: course.registrationFee || 0,
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
      } else if (result.status === 'pending') {
        setPendingSuccess(true);
      } else {
        setEnrollmentId(result.enrollmentId);
        setPaymentSuccess(true);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '5rem', textAlign: 'center' }}>{t('loading')}</div>;

  if (paymentSuccess) {
    return (
      <div className="inscription-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ maxWidth: '650px', textAlign: 'center' }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '3rem', 
            borderRadius: '16px', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: '#dcfce7', marginBottom: '1.5rem' }}>
              <CheckCircle size={48} color="#10b981" />
            </div>
            
            <h2 style={{ marginBottom: '0.75rem', fontWeight: 800, color: '#1A1A2E', fontSize: '1.8rem' }}>
              {language === 'en' ? 'Payment Received!' : 'Paiement Confirmé !'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem', marginBottom: '2rem', lineHeight: '1.5' }}>
              {language === 'en' 
                ? 'Your registration has been successfully processed. A confirmation email with your credentials has been sent.' 
                : 'Votre inscription a été validée avec succès. Un e-mail de confirmation contenant vos accès vous a été envoyé.'}
            </p>

            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '2.5rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                <span style={{ color: '#64748b' }}>{language === 'en' ? 'Course:' : 'Formation :'}</span>
                <strong style={{ color: '#1A1A2E' }}>{course?.title}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                <span style={{ color: '#64748b' }}>{language === 'en' ? 'Student:' : 'Apprenant :'}</span>
                <strong style={{ color: '#1A1A2E' }}>{formData.childFirstName || formData.guestFirstName} {formData.childLastName || formData.guestLastName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                <span style={{ color: '#64748b' }}>{language === 'en' ? 'Transaction ID:' : 'ID Transaction :'}</span>
                <strong style={{ color: '#1A1A2E', fontFamily: 'monospace' }}>{formData.transactionId || 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                <span style={{ color: '#64748b' }}>{language === 'en' ? 'Registration Fee Paid:' : 'Frais d\'inscription payés :'}</span>
                <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>
                  {course?.registrationFee?.toLocaleString()} FCFA
                </strong>
              </div>
            </div>

            {!auth.user && (
              <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#e0f2fe', borderRadius: '12px', color: '#0369a1', textAlign: 'center' }}>
                <h4 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>{language === 'en' ? 'Last Step: Create your account' : 'Dernière étape : Créez votre compte'}</h4>
                <p style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>
                  {language === 'en' ? 'Create an account with the same email to track your enrollment and access the courses.' : 'Créez un compte avec le même email pour suivre votre inscription et accéder aux formations.'}
                </p>
                <Link to={`/register?email=${encodeURIComponent(formData.guestEmail || '')}`} className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px' }}>
                  {language === 'en' ? 'Create my account' : 'Créer mon compte'}
                </Link>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {enrollmentId && formData.transactionId && (
                <a 
                  href={`${API_URL}/api/public/invoices/${enrollmentId}?txId=${formData.transactionId}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-outline" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.5rem',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    border: '2px solid #e2e8f0',
                    color: '#0F3460'
                  }}
                >
                  <CheckCircle size={16} />
                  {language === 'en' ? 'Download PDF Invoice' : 'Télécharger la Facture PDF'}
                </a>
              )}
              
              <button 
                className="btn btn-primary" 
                onClick={() => navigate(language === 'en' ? '/en/mon-espace' : '/mon-espace')}
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  width: '100%'
                }}
              >
                {language === 'en' ? 'Go to my learning space' : 'Accéder à mon espace de cours'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (pendingSuccess) {
    return (
      <div className="inscription-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CheckCircle size={64} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ marginBottom: '1rem', color: '#b45309' }}>{language === 'en' ? 'Registration Pending' : "Inscription en Attente"}</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              {language === 'en' 
                ? 'Your registration request has been received. Your Mobile Money payment is currently pending verification. We will send you an email as soon as it is validated!' 
                : "Votre demande d'inscription a bien été reçue. Votre paiement par Mobile Money est en cours de vérification. Nous vous enverrons un e-mail dès qu'il sera validé !"}
            </p>

            {!auth.user && (
              <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#e0f2fe', borderRadius: '12px', color: '#0369a1', textAlign: 'center' }}>
                <h4 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>{language === 'en' ? 'Last Step: Create your account' : 'Dernière étape : Créez votre compte'}</h4>
                <p style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>
                  {language === 'en' ? 'Create an account with the same email to track your enrollment.' : 'Créez un compte avec le même email pour suivre votre inscription.'}
                </p>
                <Link to={`/register?email=${encodeURIComponent(formData.guestEmail || '')}`} className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px' }}>
                  {language === 'en' ? 'Create my account' : 'Créer mon compte'}
                </Link>
              </div>
            )}

            <button className="btn btn-outline" onClick={() => navigate(language === 'en' ? '/en' : '/')}>{language === 'en' ? 'Back to Home' : 'Retour à l\'accueil'}</button>
          </div>
        </div>
      </div>
    );
  }

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


            {!auth.user && (
              <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#e0f2fe', borderRadius: '12px', color: '#0369a1', textAlign: 'center' }}>
                <h4 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>{language === 'en' ? 'Last Step: Create your account' : 'Dernière étape : Créez votre compte'}</h4>
                <p style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>
                  {language === 'en' ? 'Create an account with the same email to track your enrollment.' : 'Créez un compte avec le même email pour suivre votre inscription.'}
                </p>
                <Link to={`/register?email=${encodeURIComponent(formData.guestEmail || '')}`} className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px' }}>
                  {language === 'en' ? 'Create my account' : 'Créer mon compte'}
                </Link>
              </div>
            )}

            <button className="btn btn-outline" onClick={() => navigate(language === 'en' ? '/en' : '/')}>{language === 'en' ? 'Back to Home' : 'Retour à l\'accueil'}</button>
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
            {!auth.user && (
              <div style={{ marginTop: '2rem', marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#e0f2fe', borderRadius: '12px', color: '#0369a1', textAlign: 'center' }}>
                <h4 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>{language === 'en' ? 'Create your account' : 'Créez votre compte'}</h4>
                <p style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>
                  {language === 'en' ? 'Create an account with the same email to access the portal.' : 'Créez un compte avec le même email pour accéder au portail.'}
                </p>
                <Link to={`/register?email=${encodeURIComponent(formData.guestEmail || '')}`} className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px' }}>
                  {language === 'en' ? 'Create my account' : 'Créer mon compte'}
                </Link>
              </div>
            )}
            <button className="btn btn-outline" onClick={() => navigate(language === 'en' ? '/en' : '/')} style={{ marginTop: '1rem' }}>
              {language === 'en' ? 'Back to Home' : 'Retour à l\'accueil'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isFull = course && course.maxParticipants && course.enrolled >= course.maxParticipants;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* TOP BAR - Remplace la Navbar publique */}
      <div style={{ background: '#1A1A2E', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
        <img src="/4x.png" alt="FormationNova" style={{ height: '55px', objectFit: 'contain', cursor: 'pointer' }} onClick={() => window.location.href = "/"} />
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
          
          {/* Steps UI removed */}

          {step === 1 && (
            <div className="fade-in">
                <div style={{ backgroundColor: 'var(--color-bg-light)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: '1rem', textAlign: 'center' }}>
                    {language === 'en' ? 'Enrollment Details' : 'Détails de l\'inscription'}
                  </h2>

                  {false && (
                    <div className="form-section">
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                        <BookOpen size={20} /> {t('ins_choice')}
                      </h3>
                      <div className="form-group">
                        <select className="form-input" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} required>
                          <option value="">{t('ins_choose_opt')}</option>
                          {formations.map(f => (
                            <option key={f.id} value={f.id}>{f.title} (Frais d'inscription: {f.registrationFee?.toLocaleString() || 0} FCFA)</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {false && course && !isFull && (
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
                          <button className="btn btn-primary" onClick={async () => {
                            await processEnrollment('waitlist');
                          }} style={{ width: '100%' }}>
                            {language === 'en' ? 'Join Waitlist (Free)' : "Rejoindre la liste d'attente (Gratuit)"}
                          </button>
                        </div>
                      ) : course.contactInstruction ? (
                        <div style={{ backgroundColor: '#eff6ff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                          <h4 style={{ color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <BookOpen size={20} /> Modalités d'inscription
                          </h4>
                          <p style={{ color: '#1e3a8a', marginBottom: '0', whiteSpace: 'pre-wrap', fontSize: '1.05rem', lineHeight: '1.5' }}>
                            {course.contactInstruction}
                          </p>
                        </div>
                      ) : (
                        <div>
                          {!auth.user && (
                            <div className="form-section" style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                              <h4 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>{language === 'en' ? 'Your Information' : 'Vos informations'}</h4>
                              <div className="form-row">
                                <div className="form-group">
                                  <label>{language === 'en' ? 'First Name' : 'Prénom'} *</label>
                                  <input className="form-input" name="guestFirstName" value={formData.guestFirstName} onChange={e => {
                                      const val = e.target.value;
                                      setFormData(prev => ({ ...prev, guestFirstName: val, childFirstName: val }));
                                  }} required />
                                </div>
                                <div className="form-group">
                                  <label>{language === 'en' ? 'Last Name' : 'Nom'} *</label>
                                  <input className="form-input" name="guestLastName" value={formData.guestLastName} onChange={e => {
                                      const val = e.target.value;
                                      setFormData(prev => ({ ...prev, guestLastName: val, childLastName: val }));
                                  }} required />
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
                          
                          {(!auth.user && (!formData.guestFirstName || !formData.guestLastName || !formData.guestEmail || !formData.guestPhone)) ? (
                            <button className="btn btn-primary" disabled style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', opacity: 0.5, cursor: 'not-allowed' }}>
                              {language === 'en' ? 'Fill all details first' : "Remplissez toutes les informations d'abord"}
                            </button>
                          ) : (!course.registrationFee || course.registrationFee === 0) ? (
                            <button className="btn btn-primary" onClick={async () => {
                              await processEnrollment(isPhysicalCourse ? 'Gratuit' : 'Gratuit');
                            }} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                              {language === 'en' ? 'Confirm Free Enrollment' : "Confirmer l'inscription gratuite"}
                            </button>
                          ) : (
                          <>
                            {paymentError && (
                              <div style={{ 
                                backgroundColor: '#fef2f2', 
                                border: '1px solid #fca5a5', 
                                padding: '1rem', 
                                borderRadius: '8px', 
                                color: '#b91c1c', 
                                fontSize: '0.95rem', 
                                fontWeight: 600, 
                                marginBottom: '1rem', 
                                textAlign: 'center' 
                              }}>
                                ⚠️ {paymentError}
                              </div>
                            )}

                              <FedapayWidget 
                                amount={course.registrationFee} 
                                description={`Frais d'inscription: ${course.title} #${course.id}`}
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
                                  const txId = resp?.id || resp?.transaction?.id || resp?.transactionId || 'feda_success';
                                  setFormData(prev => ({ ...prev, transactionId: txId }));
                                  setPaymentError('');

                                  // Vérification côté serveur (sécurisé)
                                  try {
                                    const customerInfo = auth.user
                                      ? { email: auth.user.email, firstName: auth.user.firstName, lastName: auth.user.lastName, phone: auth.user.phone }
                                      : { email: formData.guestEmail, firstName: formData.guestFirstName, lastName: formData.guestLastName, phone: formData.guestPhone };

                                    const verifyRes = await fetch(`${API_URL}/api/payments/verify-fedapay`, {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ transactionId: txId, courseId: selectedCourseId, customerInfo })
                                    });
                                    const verifyData = await verifyRes.json();
                                    console.log('[VERIFY]', verifyData);
                                  } catch (verifyErr) {
                                    console.warn('[VERIFY] Erreur vérification serveur (non bloquant):', verifyErr.message);
                                  }

                                  await processEnrollment('FedaPay', txId);
                                }}
                                onFail={() => {
                                  setPaymentError(
                                    language === 'en'
                                      ? 'Payment error / contact support to be able to pay and register now.'
                                      : "Erreur de paiement / contactez le support pour pouvoir payer et vous inscrire maintenant."
                                  );
                                }}
                              />
                          </>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                </div>
            </div>
          )}

          {/* Step 2 removed */}
        </div>

        {/* SIDEBAR */}
        <div className="inscription-sidebar">
          <div className="summary-card">
            {course ? (
              <>
                <div style={{ height: '160px', backgroundImage: `url(${course.imageUrl ? getImageUrl(course.imageUrl) : '/10x.jpg'})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '12px', marginBottom: '1.5rem' }}></div>
                <h3>{course.title}</h3>
                <ul className="summary-details">
                  <li><span>{t('ins_duration')}</span><strong>{course.duration || '—'}</strong></li>
                  <li><span>{t('ins_audience')}</span><strong>{course.ageGroup || '—'}</strong></li>
                  <li><span>{t('ins_format')}</span><strong>{!isPhysicalCourse ? t('ins_online') : t('ins_in_person')}</strong></li>
                  {isFull && <li><span style={{ color: '#ef4444', fontWeight: 700 }}>{t('ins_waitlist_warning')}</span></li>}
                </ul>
                <div className="summary-total" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <span>{t('ins_total_price')}</span>
                  <strong>{course.price?.toLocaleString()} FCFA</strong>
                </div>
                <div className="summary-total" style={{ color: 'var(--color-primary)' }}>
                  <span>{language === 'en' ? 'Registration Fee' : "Frais d'inscription (à payer)"}</span>
                  <strong>{course.registrationFee?.toLocaleString() || 0} FCFA</strong>
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
