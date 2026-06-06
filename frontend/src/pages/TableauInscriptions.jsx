import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Calendar, Clock, Download, ArrowLeft, Video, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Home.css';
import { API_URL } from '../config';

const TableauInscriptions = () => {
  const auth = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLiveRoom, setShowLiveRoom] = useState(null);

  useEffect(() => {
    if (auth.user) {
      fetchEnrollments();
    }
  }, [auth.user]);

  const fetchEnrollments = async () => {
    try {
      const token = localStorage.getItem('nv_token');
      const response = await fetch(`${API_URL}/api/enroll/my-enrollments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setEnrollments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEnrollment = async (enrollmentId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette inscription ? Cette action est irréversible.")) return;
    try {
      const token = localStorage.getItem('nv_token');
      const res = await fetch(`${API_URL}/api/enroll/${enrollmentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
      } else {
        alert("Erreur lors de l'annulation");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'annulation");
    }
  };

  const handleRateCourse = async (enrollmentId, ratingValue) => {
    try {
      const token = localStorage.getItem('nv_token');
      const response = await fetch(`${API_URL}/api/enroll/enrollments/${enrollmentId}/rate`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating: ratingValue })
      });
      
      if (response.ok) {
        // Mettre à jour l'état local
        setEnrollments(prev => prev.map(e => e.id === enrollmentId ? { ...e, rating: ratingValue } : e));
      }
    } catch (err) {
      console.error('Erreur lors de la notation', err);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Confirmé</span>;
      case 'waitlist':
        return <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Sur liste d'attente</span>;
      default:
        return <span style={{ backgroundColor: '#e5e7eb', color: '#374151', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{status}</span>;
    }
  };

  if (loading) return <div style={{ padding: '5rem', textAlign: 'center' }}>Chargement...</div>;

  return (
    <div className="page-transition" style={{ backgroundColor: 'var(--color-bg-light)', minHeight: '80vh', padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/mon-espace" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', textDecoration: 'none', marginBottom: '1rem', fontWeight: 600 }}>
            <ArrowLeft size={18} /> Retour à mon espace
          </Link>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--color-primary)', margin: 0 }}>Mes Inscriptions</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', marginTop: '0.5rem' }}>Gérez vos formations réservées, vos paiements, et accédez à vos cours.</p>
        </div>

        {enrollments.length === 0 ? (
          <div style={{ backgroundColor: 'var(--color-white)', padding: '4rem 2rem', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border)', textAlign: 'center' }}>
            <div style={{ backgroundColor: 'rgba(212,160,23,0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--color-accent)' }}>
              <BookOpen size={40} />
            </div>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>Vous n'êtes inscrit à aucune formation</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>Parcourez notre catalogue et trouvez la formation idéale pour développer les compétences de votre enfant.</p>
            <Link to="/" className="btn btn-primary">Découvrir les formations</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {enrollments.map(e => {
              return (
                <div key={e.id} style={{ background: 'var(--color-white)', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                  
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flex: 1, minWidth: '300px' }}>
                    <div style={{ backgroundColor: 'var(--color-bg-light)', width: '90px', height: '90px', borderRadius: '8px', backgroundImage: `url(${e.imageUrl || '/10x.jpg'})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid var(--color-border)' }}></div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        {getStatusBadge(e.status)}
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Apprenant: {e.childFirstName} {e.childLastName}</span>
                      </div>
                      
                      <h3 style={{ fontSize: '1.3rem', margin: '0 0 0.5rem 0', color: 'var(--color-primary)' }}>{e.courseTitle}</h3>
                      
                      <div style={{ display: 'flex', gap: '1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> {e.duration}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14} /> Inscrit le {new Date(e.createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* Course Rating */}
                      {e.status === 'active' && (
                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{e.rating ? 'Votre note :' : 'Noter ce cours :'}</span>
                          <div style={{ display: 'flex', gap: '0.2rem' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                              <button 
                                key={star}
                                onClick={() => !e.rating && handleRateCourse(e.id, star)}
                                style={{ background: 'none', border: 'none', cursor: e.rating ? 'default' : 'pointer', padding: 0, color: star <= (e.rating || 0) ? '#f59e0b' : '#e2e8f0', transition: 'color 0.2s' }}
                              >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill={star <= (e.rating || 0) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '200px' }}>
                    {e.status === 'active' && (
                      <>
                        {e.isLive === 1 && e.liveRoomName && (
                          <button onClick={() => setShowLiveRoom(e.liveRoomName)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', backgroundColor: '#ef4444', borderColor: '#ef4444', color: '#fff' }}>
                            🔴 Rejoindre le Live
                          </button>
                        )}
                        {!!e.isOnline && !e.isLive && e.meetLink && (
                          <a href={e.meetLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                            <Video size={16} /> Lien du cours
                          </a>
                        )}
                        {!!e.whatsappLink && (
                          <a href={e.whatsappLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', backgroundColor: '#25D366', color: 'white', borderColor: '#25D366' }}>
                            <MessageCircle size={16} /> Groupe WhatsApp
                          </a>
                        )}
                        <Link to="/mon-espace/recus" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                          <Download size={16} /> Télécharger le reçu
                        </Link>
                      </>
                    )}
                    {e.status === 'waitlist' && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                        Nous vous contacterons par email ou SMS dès qu'une place se libère.
                      </div>
                    )}
                    <button 
                      onClick={() => handleCancelEnrollment(e.id)} 
                      className="btn" 
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', color: '#ef4444', border: '1px solid #ef4444', background: 'transparent', marginTop: '0.5rem' }}
                    >
                      ❌ Annuler l'inscription
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Jitsi Meet Live Iframe pour Apprenant */}
      {showLiveRoom && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ width: '100%', maxWidth: '1200px', height: '90vh', background: '#000', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '4px solid #ef4444', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: '#1e293b', padding: '0.8rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.2rem' }}>
                <span style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 10px #ef4444' }}></span>
                Live en cours
              </div>
              <button onClick={() => setShowLiveRoom(null)} style={{ background: '#334155', border: 'none', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background = '#475569'} onMouseLeave={e => e.target.style.background = '#334155'}>
                Quitter le Live
              </button>
            </div>
            <iframe 
              src={`https://meet.jit.si/${showLiveRoom}`} 
              allow="camera; microphone; display-capture; autoplay; clipboard-write" 
              style={{ width: '100%', height: '100%', border: 'none' }} 
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default TableauInscriptions;
