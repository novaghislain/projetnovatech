import React, { useState, useEffect } from 'react';
import { Search, Download, Trash2, Eye } from 'lucide-react';
import axios from 'axios';
import { API_URL, getImageUrl } from '../../config';

const AdminInscriptions = () => {
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFormation, setFilterFormation] = useState('all');

  useEffect(() => {
    fetchInscriptions();
  }, []);

  const fetchInscriptions = async () => {
    try {
      const token = localStorage.getItem('nv_token');
      // For now, reuse the /api/admin/payments route since it contains enrollment details
      const response = await axios.get(`${API_URL}/api/admin/payments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setInscriptions(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Voulez-vous vraiment supprimer cet apprenant ?')) {
      try {
        const token = localStorage.getItem('nv_token');
        await axios.delete(`${API_URL}/api/admin/payments/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchInscriptions();
      } catch(err) {
        alert("Erreur lors de la suppression : " + err.message);
      }
    }
  };

  // Extract unique formations for filter
  const formations = [...new Set(inscriptions.map(i => i.title || i.courseTitle || ''))].filter(Boolean).sort();

  const filtered = inscriptions.filter(i => {
    const matchesSearch =
      i.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.title || i.courseTitle || '')?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (filterStatus === 'active') matchesStatus = i.status === 'active';
    else if (filterStatus === 'waitlist') matchesStatus = i.status === 'waitlist' || i.status === 'pending';
    else if (filterStatus === 'inactive') matchesStatus = i.status !== 'active' && i.status !== 'waitlist' && i.status !== 'pending';

    let matchesFormation = true;
    if (filterFormation !== 'all') {
      matchesFormation = i.title === filterFormation || i.courseTitle === filterFormation;
    }

    return matchesSearch && matchesStatus && matchesFormation;
  });

  const exportToCSV = () => {
    const headers = ["ID Inscription", "Prenom", "Nom", "Email", "Formation", "Montant Paye", "Statut", "Date Inscription"];
    const rows = filtered.map(insc => [
      insc.id,
      insc.firstName || '',
      insc.lastName || '',
      insc.email || '',
      insc.title || '',
      insc.amount ? `${insc.amount} / ${insc.totalAmount || insc.amount} FCFA` : 'Gratuit',
      insc.status === 'active' ? 'Actif' : insc.status === 'waitlist' ? 'Liste d\'attente' : 'Inconnu',
      new Date(insc.createdAt).toLocaleDateString('fr-FR')
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `inscriptions_FormationNova_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fade-in">
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h3 className="admin-panel-title">Gestion des Inscriptions</h3>
          <button className="btn btn-primary" onClick={exportToCSV}>
            <Download size={16} /> Exporter CSV
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span className="admin-badge success">{inscriptions.filter(i => i.status === 'active').length} actif(s)</span>
          <span className="admin-badge warning">{inscriptions.filter(i => i.status === 'waitlist' || i.status === 'pending').length} en attente</span>
          <span className="admin-badge neutral">{filtered.length} affiché(s)</span>
        </div>

        <div className="filter-bar">
          <div className="search-wrap">
            <Search size={18} />
            <input
              type="text"
              placeholder="Rechercher (nom, formation, email)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="form-control" style={{ width: '180px', marginBottom: 0 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="waitlist">En attente</option>
            <option value="inactive">Inactifs</option>
          </select>
          <select className="form-control" style={{ width: '220px', marginBottom: 0 }} value={filterFormation} onChange={(e) => setFilterFormation(e.target.value)}>
            <option value="all">Toutes formations</option>
            {formations.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Apprenant</th>
                <th>Formation</th>
                <th>Date d'inscription</th>
                <th>Montant Payé</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="empty-state">Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" className="empty-state">Aucune inscription trouvée.</td></tr>
              ) : (
                filtered.map(insc => (
                  <tr key={insc.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{insc.firstName} {insc.lastName}</div>
                      <div className="admin-badge neutral" style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>{insc.email}</div>
                    </td>
                    <td>{insc.title}</td>
                    <td>{new Date(insc.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td>{insc.amount ? (insc.totalAmount ? `${insc.amount} / ${insc.totalAmount} FCFA` : `${insc.amount} FCFA`) : 'Gratuit'}</td>
                    <td>
                      <span className={`admin-badge ${insc.status === 'active' ? 'success' : 'warning'}`}>
                        {insc.status === 'active' ? 'Actif' : insc.status === 'waitlist' ? 'Liste d\'attente' : insc.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {insc.paymentProof && (
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '0.3rem 0.5rem', color: '#10B981', borderColor: '#10B981' }} 
                            title="Voir la preuve de paiement" 
                            onClick={() => window.open(getImageUrl(insc.paymentProof), '_blank')}
                          >
                            <Eye size={14} />
                          </button>
                        )}
                        <button className="btn btn-danger" style={{ padding: '0.3rem 0.5rem' }} title="Supprimer" onClick={() => handleDelete(insc.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminInscriptions;
