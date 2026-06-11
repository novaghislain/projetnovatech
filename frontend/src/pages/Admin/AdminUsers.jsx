import React, { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Shield, Edit, Trash2, Plus, X } from 'lucide-react';
import { API_URL } from '../../config';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'apprenant', status: 'active' });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('nv_token');
      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur lors de la création");
      setShowModal(false);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'apprenant', status: 'active' });
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('nv_token');
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Erreur de récupération des utilisateurs");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('nv_token');
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      if (!response.ok) throw new Error("Erreur");
      fetchUsers(); // Refresh
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem('nv_token');
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error("Erreur");
      if (!response.ok) throw new Error("Erreur");
      fetchUsers(); // Refresh
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Voulez-vous vraiment supprimer cet utilisateur définitivement ?")) return;
    try {
      const token = localStorage.getItem('nv_token');
      const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Erreur lors de la suppression");
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.firstName + ' ' + u.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ["ID", "Prenom", "Nom", "Email", "Telephone", "Role", "Statut", "Date Creation"];
    const rows = filteredUsers.map(u => [
      u.id,
      u.firstName,
      u.lastName,
      u.email,
      u.phone || '',
      u.role,
      u.status || 'active',
      new Date(u.createdAt).toLocaleDateString()
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `utilisateurs_novatech_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fade-in">
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h3 className="admin-panel-title">Gestion des Utilisateurs</h3>
        </div>

        {error && <div className="notif-bar error">{error}</div>}

        <div className="filter-bar">
          <div className="search-wrap">
            <Search size={18} />
            <input
              type="text"
              placeholder="Rechercher un utilisateur (nom, email)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setShowModal(true)}
              style={{
                background: '#2563eb', color: 'white', border: 'none',
                padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              <Plus size={16} /> Ajouter Utilisateur
            </button>
            <button 
              onClick={exportToCSV}
              style={{
                background: '#10b981', color: 'white', border: 'none',
                padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              Exporter en CSV
            </button>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email / Téléphone</th>
                <th>Date d'inscription</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="empty-state">Chargement...</td></tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id}>
                  <td style={{ fontWeight: 600 }}>
                    {user.firstName} {user.lastName}
                  </td>
                  <td>
                    <div>{user.email}</div>
                    <div style={{ fontSize: '0.85rem', color: '#888' }}>{user.phone || 'Non renseigné'}</div>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <select 
                      className="form-control" 
                      style={{ padding: '0.3rem', width: 'auto' }}
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      <option value="apprenant">Apprenant</option>
                      <option value="formateur">Formateur</option>
                      <option value="admin">Administrateur</option>
                      <option value="admin_restreint">Admin Restreint</option>
                    </select>
                  </td>
                  <td>
                    {user.status === 'blocked' ? (
                      <span className="status-badge" style={{ background: '#fee2e2', color: '#dc2626' }}>Bloqué</span>
                    ) : (
                      <span className="status-badge active">Actif</span>
                    )}
                  </td>
                  <td>
                    <div className="action-group">
                      {user.status === 'blocked' ? (
                        <button className="btn btn-outline" style={{ color: '#16a34a', borderColor: '#16a34a', padding: '0.3rem 0.5rem' }} onClick={() => handleStatusChange(user.id, 'active')} title="Débloquer">
                          <UserCheck size={16} />
                        </button>
                      ) : (
                        <button className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '0.3rem 0.5rem' }} onClick={() => handleStatusChange(user.id, 'blocked')} title="Bloquer">
                          <UserX size={16} />
                        </button>
                      )}
                      <button className="btn btn-danger" onClick={() => handleDeleteUser(user.id)} title="Supprimer définitivement">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredUsers.length === 0 && (
                <tr><td colSpan="6" className="empty-state">Aucun utilisateur trouvé.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Création Utilisateur */}
      {showModal && (
        <div className="admin-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="admin-modal" style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h4 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Ajouter un utilisateur</h4>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Prénom *</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Nom</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Mot de passe *</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} required minLength={6} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Rôle</label>
                  <select name="role" value={formData.role} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <option value="apprenant">Apprenant</option>
                    <option value="formateur">Formateur</option>
                    <option value="admin">Administrateur Complet</option>
                    <option value="admin_restreint">Admin Restreint (Formations)</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Statut (Restreint ou non)</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <option value="active">Actif (Accès total)</option>
                    <option value="blocked">Bloqué (Restreint)</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
                <button type="submit" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Créer l'utilisateur</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
