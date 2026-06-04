import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Calendar, Clock, Download, ArrowLeft, Video, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Home.css';

const TableauInscriptions = () => {
  const auth = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth.user) {
      fetchEnrollments();
    }
  }, [auth.user]);

  const fetchEnrollments = async () => {
    try {
      const token = localStorage.getItem('nv_token');
      const response = await fetch('http://localhost:5001/api/enroll/my-enrollments', {
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
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '200px' }}>
                    {e.status === 'active' && (
                      <>
                        {e.isOnline && e.meetLink && (
                          <a href={e.meetLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                            <Video size={16} /> Rejoindre le cours
                          </a>
                        )}
                        {e.whatsappLink && (
                          <a href={e.whatsappLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', backgroundColor: '#25D366', color: 'white', borderColor: '#25D366' }}>
                            <MessageCircle size={16} /> Groupe WhatsApp
                          </a>
                        )}
                        <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                          <Download size={16} /> Télécharger le reçu
                        </button>
                      </>
                    )}
                    {e.status === 'waitlist' && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                        Nous vous contacterons par email ou SMS dès qu'une place se libère.
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableauInscriptions;
