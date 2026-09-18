import { API_URL } from '../../../config';
import React, { useState, useEffect } from 'react';
import { useLFDAuth } from '../../../contexts/LFDAuthContext';
import axios from 'axios';

const formatFCFA = (amount) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount || 0);
};

const BankDeposits = () => {
  const { lfdToken, hasPermission } = useLFDAuth();
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Formulaire de déclaration
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    bank_name: '', deposit_date: new Date().toISOString().split('T')[0], amount: '', cash_session_id: '', slip_reference: '', observation: ''
  });

  const canDeclare = hasPermission('bank.deposit.declare');
  const canVerify = hasPermission('bank.deposit.verify');

  useEffect(() => {
    fetchDeposits();
  }, [lfdToken]);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/lfd/bank-deposits`, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      setDeposits(res.data);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des dépôts bancaires.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeclare = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/lfd/bank-deposits`, {
        ...formData,
        amount: parseInt(formData.amount, 10),
        cash_session_id: formData.cash_session_id ? parseInt(formData.cash_session_id, 10) : null
      }, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      setShowForm(false);
      setFormData({ bank_name: '', deposit_date: new Date().toISOString().split('T')[0], amount: '', cash_session_id: '', slip_reference: '', observation: '' });
      fetchDeposits();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Erreur lors de la déclaration");
    }
  };

  const handleConfirm = async (id) => {
    if (!window.confirm("Confirmer ce dépôt bancaire ? L'argent est bien sur le compte ?")) return;
    try {
      await axios.post(`${API_URL}/api/lfd/bank-deposits/${id}/confirm`, {}, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      fetchDeposits();
    } catch (err) {
      alert(err.response?.data?.error || "Erreur");
    }
  };

  const handleReject = async (id) => {
    const obs = window.prompt("Motif du rejet :");
    if (obs === null) return;
    try {
      await axios.post(`${API_URL}/api/lfd/bank-deposits/${id}/reject`, { observation: obs }, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      fetchDeposits();
    } catch (err) {
      alert(err.response?.data?.error || "Erreur");
    }
  };

  return (
    <div className="lfd-page" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>Dépôts Bancaires</h1>
        {canDeclare && (
          <button className="lfd-btn lfd-btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Fermer' : 'Déclarer un Dépôt'}
          </button>
        )}
      </div>

      {error && <div className="lfd-alert lfd-alert-danger">{error}</div>}

      {showForm && (
        <div className="lfd-card" style={{ marginBottom: 20 }}>
          <h3>Nouveau Dépôt Bancaire</h3>
          <form onSubmit={handleDeclare} style={{ display: 'flex', flexDirection: 'column', gap: 15, marginTop: 15 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
              <div>
                <label className="lfd-label">Nom de la Banque *</label>
                <input type="text" className="lfd-input" value={formData.bank_name} onChange={e => setFormData({...formData, bank_name: e.target.value})} required />
              </div>
              <div>
                <label className="lfd-label">Montant (FCFA) *</label>
                <input type="number" className="lfd-input" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
              </div>
              <div>
                <label className="lfd-label">Date du Dépôt *</label>
                <input type="date" className="lfd-input" value={formData.deposit_date} onChange={e => setFormData({...formData, deposit_date: e.target.value})} required />
              </div>
              <div>
                <label className="lfd-label">Référence Bordereau</label>
                <input type="text" className="lfd-input" value={formData.slip_reference} onChange={e => setFormData({...formData, slip_reference: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="lfd-label">Observation</label>
              <input type="text" className="lfd-input" value={formData.observation} onChange={e => setFormData({...formData, observation: e.target.value})} />
            </div>
            <button type="submit" className="lfd-btn lfd-btn-primary" style={{ width: 'fit-content' }}>Enregistrer</button>
          </form>
        </div>
      )}

      <div className="lfd-card">
        {loading ? <p>Chargement...</p> : (
          <table className="lfd-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Référence</th>
                <th>Banque</th>
                <th>Montant</th>
                <th>Déclaré par</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deposits.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center' }}>Aucun dépôt trouvé</td></tr>
              ) : deposits.map(d => (
                <tr key={d.id}>
                  <td>{new Date(d.deposit_date).toLocaleDateString()}</td>
                  <td>{d.reference}<br/><small>{d.slip_reference}</small></td>
                  <td>{d.bank_name}</td>
                  <td style={{ fontWeight: 'bold' }}>{formatFCFA(d.amount)}</td>
                  <td>{d.declared_by_name}</td>
                  <td>
                    <span className={`lfd-badge lfd-badge-${d.status === 'CONFIRMED' ? 'success' : d.status === 'REJECTED' ? 'danger' : 'warning'}`}>
                      {d.status === 'PENDING' ? 'EN ATTENTE' : d.status === 'CONFIRMED' ? 'CONFIRMÉ' : 'REJETÉ'}
                    </span>
                  </td>
                  <td>
                    {d.status === 'PENDING' && canVerify && (
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="lfd-btn lfd-btn-success lfd-btn-sm" onClick={() => handleConfirm(d.id)}>Confirmer</button>
                        <button className="lfd-btn lfd-btn-danger lfd-btn-sm" onClick={() => handleReject(d.id)}>Rejeter</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BankDeposits;
