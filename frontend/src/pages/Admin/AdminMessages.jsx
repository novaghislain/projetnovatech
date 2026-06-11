import React, { useState, useEffect } from 'react';
import { Mail, Search, Trash2, Reply, X, Send, Inbox, Archive, Eye, EyeOff, Filter } from 'lucide-react';
import { API_URL } from '../../config';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'unread', 'read'
  const [replyModal, setReplyModal] = useState({ show: false, messageId: null, email: '', replyBody: '' });
  const [replyStatus, setReplyStatus] = useState('idle');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem('nv_token');
    return { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } };
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/messages`, getHeaders());
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
      await fetch(`${API_URL}/api/admin/messages/${id}/read`, { method: 'PUT', ...getHeaders() });
      setMessages(messages.map(m => m.id === id ? { ...m, isRead: true } : m));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMessage = async (id) => {
    if(confirm("Supprimer ce message ?")) {
      try {
        await fetch(`${API_URL}/api/admin/messages/${id}`, { method: 'DELETE', ...getHeaders() });
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
      await fetch(`${API_URL}/api/admin/messages/${replyModal.messageId}/reply`, { 
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

  const filtered = messages.filter(m => {
    const matchesSearch = (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.subject || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'unread') return matchesSearch && !m.isRead;
    if (filterStatus === 'read') return matchesSearch && m.isRead;
    return matchesSearch;
  });

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="fade-in">
      <div className="admin-panel">
        <div className="admin-panel-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 className="admin-panel-title" style={{ margin: 0 }}>
              Messages reçus
              {unreadCount > 0 && (
                <span className="admin-badge" style={{ background: 'rgba(239,68,68,0.12)', color: '#dc2626', marginLeft: '0.6rem', fontSize: '0.75rem' }}>
                  {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </h3>
            <div className="search-wrap" style={{ width: '280px' }}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Rechercher (nom, email, sujet)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="filter-bar" style={{ margin: 0 }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[
                { key: 'all', label: 'Tous', icon: Inbox },
                { key: 'unread', label: 'Non lus', icon: EyeOff },
                { key: 'read', label: 'Lus', icon: Eye },
              ].map(f => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.key}
                    className={`btn ${filterStatus === f.key ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                    onClick={() => setFilterStatus(f.key)}
                  >
                    <Icon size={16} />
                    {f.label}
                    {f.key === 'unread' && unreadCount > 0 && (
                      <span style={{ marginLeft: '0.3rem', fontWeight: 700 }}>({unreadCount})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0 0 0.5rem 0' }}>
          {loading ? (
            <div className="empty-state">Chargement des messages...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              {searchTerm || filterStatus !== 'all' ? 'Aucun message trouvé pour ces critères.' : 'Aucun message reçu.'}
            </div>
          ) : filtered.map(msg => (
            <div
              key={msg.id}
              className="admin-panel"
              style={{
                padding: '1.25rem 1.5rem',
                marginBottom: 0,
                borderLeft: msg.isRead ? '4px solid transparent' : '4px solid var(--primary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onClick={() => {
                if (!msg.isRead) markAsRead(msg.id);
                setExpandedId(expandedId === msg.id ? null : msg.id);
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    flexWrap: 'wrap'
                  }}>
                    {!msg.isRead && (
                      <span className="status-dot active" style={{ width: 8, height: 8 }} />
                    )}
                    <div style={{
                      fontWeight: msg.isRead ? 500 : 700,
                      fontSize: '1rem',
                      color: 'var(--dark)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {msg.subject || '(Sans objet)'}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '0.15rem' }}>
                    <span style={{ fontWeight: 600 }}>{msg.name}</span>
                    <span style={{ color: '#9CA3AF' }}> &lt;{msg.email}&gt;</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#9CA3AF', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                  {new Date(msg.date || msg.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </div>

              {/* Message body — expandable */}
              {(expandedId === msg.id) && (
                <div className="fade-in" style={{ marginTop: '0.5rem' }}>
                  <div style={{
                    color: 'var(--text)',
                    lineHeight: 1.7,
                    background: 'var(--background)',
                    padding: '1.2rem',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.body}
                  </div>

                  <div className="action-group" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button className="btn btn-outline" onClick={(e) => {
                      e.stopPropagation();
                      setReplyModal({ show: true, messageId: msg.id, email: msg.email, replyBody: '' });
                    }}>
                      <Reply size={16} /> Répondre
                    </button>
                    <button className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Preview line when collapsed */}
              {expandedId !== msg.id && (
                <div style={{
                  fontSize: '0.85rem',
                  color: '#9CA3AF',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  marginTop: '0.1rem'
                }}>
                  {msg.body && msg.body.length > 100 ? msg.body.slice(0, 100) + '…' : (msg.body || '')}
                </div>
              )}
            </div>
          ))}
        </div>
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
              <div className="admin-modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setReplyModal({ ...replyModal, show: false })}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={replyStatus === 'sending'}>
                  {replyStatus === 'sending' ? 'Envoi...' : replyStatus === 'sent' ? 'Envoyé !' : 'Envoyer la réponse'}
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
