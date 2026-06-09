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
    if (!selectedCourseId) return alert(language === 'en' ? 'Please select a course' : 'Veuillez sélectionner une formation');
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
      if (!response.ok) throw new Error(result.error || (language === 'en' ? 'Registration error' : "Erreur d'inscription"));

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
            <div className={`step ${step >= 1 ? 'active' : ''}`}>{t('ins_step1')}</div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>{t('ins_step2')}</div>
          </div>

          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="fade-in">
                
                <div className="form-section">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                    <BookOpen size={20} /> {t('ins_choice')}
                  </h3>
                  <div className="form-group">
                    <label>{t('ins_select_course')}</label>
                    <select className="form-input" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} required>
                      <option value="">{t('ins_choose_opt')}</option>
                      {formations.map(f => (
                        <option key={f.id} value={f.id}>{f.title} ({f.price?.toLocaleString()} FCFA)</option>
                      ))}
                    </select>
                  </div>
                </div>

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

                {!isFull && (
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

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1rem', borderRadius: '12px' }}>
                  {t('ins_next_step')} <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                </button>
              </form>
          )}

          {step === 2 && course && (
            <div className="inscription-payment fade-in">
              <button className="btn btn-outline" onClick={() => setStep(1)} style={{ marginBottom: '2rem' }}>
                ← {t('back')}
              </button>

              <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)', fontSize: '1.3rem', fontWeight: 700 }}>{t('ins_summary')}</h3>
              
              <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '14px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                <p style={{ margin: '0 0 0.6rem 0' }}><strong>{t('ins_course')}</strong> {course.title}</p>
                <p style={{ margin: '0 0 0.6rem 0' }}><strong>{t('ins_student')}</strong> {formData.childFirstName} {formData.childLastName} ({formData.childAge} {language === 'en' ? 'years old' : 'ans'})</p>
                <p style={{ margin: '0 0 0.6rem 0' }}><strong>{t('ins_parent')}</strong> {formData.parentName} ({formData.parentPhone})</p>
                <hr style={{ margin: '1rem 0', borderColor: '#e5e7eb' }} />
                <p style={{ margin: '0', fontSize: '1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>{t('ins_total_to_pay')}</span>
                  <strong style={{ color: 'var(--color-primary)', fontSize: '1.3rem' }}>{course.price?.toLocaleString()} FCFA</strong>
                </p>
              </div>

              {isFull ? (
                <div style={{ backgroundColor: '#fff7ed', padding: '1.5rem', borderRadius: '12px', border: '1px solid #ffedd5' }}>
                  <h4 style={{ color: '#c2410c', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <CheckCircle size={20} /> {t('ins_full_title')}
                  </h4>
                  <p style={{ color: '#9a3412', marginBottom: '1.5rem' }}>
                    {t('ins_full_desc')}
                  </p>
                  <button className="btn btn-primary" onClick={handleWaitlistSubmit} disabled={submitLoading} style={{ width: '100%' }}>
                    {submitLoading ? t('loading') : t('ins_confirm_waitlist')}
                  </button>
                </div>
              ) : (
                <div>
                  <h4 style={{ marginBottom: '1rem', color: '#0f172a' }}>{t('ins_proceed_payment')}</h4>
                  <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                    {t('ins_payment_desc')}
                  </p>
                  <FedapayWidget 
                    amount={formData.paymentType === 'mensuel' ? Math.ceil(course.price / 3) : course.price} 
                    description={`${language === 'en' ? 'Enrollment:' : 'Inscription:'} ${course.title} ${formData.paymentType === 'mensuel' ? (language === 'en' ? '(Installment 1/3)' : '(Mensualité 1/3)') : (language === 'en' ? '(Full payment)' : '(Paiement complet)')}`}
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
