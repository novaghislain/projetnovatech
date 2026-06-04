import React, { useState, useEffect } from 'react';
import { Mail, Search, Trash2, Reply, X, Send } from 'lucide-react';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyModal, setReplyModal] = useState({ show: false, messageId: null, email: '', replyBody: '' });
  const [replyStatus, setReplyStatus] = useState('idle');

  useEffect(() => {
    fetchMessages();
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem('nv_token');
    return { headers: { 'Authorization': `Bearer ${token}` } };
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/admin/messages', getHeaders());
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:5001/api/admin/messages/${id}/read`, { method: 'PUT', ...getHeaders() });
      setMessages(messages.map(m => m.id === id ? { ...m, isRead: true } : m));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMessage = async (id) => {
    if(confirm("Supprimer ce message ?")) {
      try {
        await fetch(`http://localhost:5001/api/admin/messages/${id}`, { method: 'DELETE', ...getHeaders() });
        setMessages(messages.filter(m => m.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    setReplyStatus('sending');
    try {
      await fetch(`http://localhost:5001/api/admin/messages/${replyModal.messageId}/reply`, { 
        method: 'POST', 
        ...getHeaders(),
        body: JSON.stringify({ replyBody: replyModal.replyBody })
      });
      setReplyStatus('sent');
      setTimeout(() => {
        setReplyModal({ show: false, messageId: null, email: '', replyBody: '' });
        setReplyStatus('idle');
      }, 1500);
    } catch (err) {
      alert("Erreur lors de l'envoi");
      setReplyStatus('idle');
    }
  };

  const filtered = messages.filter(m => 
    (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (m.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.subject || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="admin-panel-header">
        <h3 className="admin-panel-title">Messages reçus</h3>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
          <input 
            type="text" 
            className="admin-input" 
            placeholder="Rechercher..." 
            style={{ paddingLeft: '2.5rem', marginBottom: 0 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '8px' }}>Aucun message trouvé.</div>
        ) : filtered.map(msg => (
          <div 
            key={msg.id} 
            style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              borderLeft: msg.isRead ? '4px solid transparent' : '4px solid var(--color-accent)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
            onClick={() => !msg.isRead && markAsRead(msg.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: msg.isRead ? 500 : 700, fontSize: '1.1rem', color: 'var(--color-primary)' }}>{msg.subject}</div>
                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.2rem' }}>De : <span style={{ fontWeight: 600 }}>{msg.name}</span> ({msg.email})</div>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#999' }}>
                {new Date(msg.date).toLocaleString('fr-FR')}
              </div>
            </div>
            
            <p style={{ color: '#444', lineHeight: 1.5, backgroundColor: '#f9f9fa', padding: '1rem', borderRadius: '4px' }}>
              {msg.body}
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
              <button className="admin-btn admin-btn-outline" onClick={(e) => { e.stopPropagation(); setReplyModal({ show: true, messageId: msg.id, email: msg.email, replyBody: '' }); }}>
                <Reply size={16} style={{ marginRight: '0.5rem' }} /> Répondre
              </button>
              <button className="admin-btn admin-btn-outline" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {replyModal.show && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '600px' }}>
            <div className="admin-modal-header">
              <h4>Répondre à {replyModal.email}</h4>
              <button className="icon-btn" onClick={() => setReplyModal({ ...replyModal, show: false })}><X size={20} /></button>
            </div>
            <form onSubmit={handleSendReply}>
              <div className="admin-modal-body">
                <div className="form-group">
                  <label>Votre réponse</label>
                  <textarea 
                    className="form-control" 
                    rows="6" 
                    required 
                    value={replyModal.replyBody}
                    onChange={(e) => setReplyModal({ ...replyModal, replyBody: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="admin-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setReplyModal({ ...replyModal, show: false })}>Annuler</button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={replyStatus === 'sending'}>
                  {replyStatus === 'sending' ? 'Envoi...' : replyStatus === 'sent' ? 'Envoyé !' : 'Envoyer la réponse'}
                  <Send size={16} style={{ marginLeft: '0.5rem' }} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminMessages;
