import React, { useState, useEffect } from 'react';
import { useLFDAuth } from '../../../contexts/LFDAuthContext';

const ParametresComptables = () => {
  const { token, hasPermission } = useLFDAuth();
  const [settings, setSettings] = useState({});
  const [mappings, setMappings] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Edit states
  const [editingMappingId, setEditingMappingId] = useState(null);
  const [editDebitId, setEditDebitId] = useState('');
  const [editCreditId, setEditCreditId] = useState('');

  const [dateCutover, setDateCutover] = useState('');
  const [autoStatus, setAutoStatus] = useState('DRAFT');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resSet, resMap, resAcc] = await Promise.all([
        fetch('http://localhost:5000/api/lfd/accounting/settings', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/lfd/accounting/mappings', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/lfd/accounting/accounts', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (resSet.ok && resMap.ok && resAcc.ok) {
        const dataSet = await resSet.json();
        const dataMap = await resMap.json();
        const dataAcc = await resAcc.json();

        setSettings(dataSet);
        setDateCutover(dataSet.ACCOUNTING_CUTOVER_DATE || '');
        setAutoStatus(dataSet.AUTO_ENTRY_STATUS || 'DRAFT');
        
        setMappings(dataMap);
        setAccounts(dataAcc);
      } else {
        setError("Erreur lors du chargement des données.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!hasPermission('accounting.entry.post') && !hasPermission('settings.manage')) {
      setError("Vous n'avez pas la permission de modifier les paramètres.");
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/lfd/accounting/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ACCOUNTING_CUTOVER_DATE: dateCutover,
          AUTO_ENTRY_STATUS: autoStatus
        })
      });

      if (res.ok) {
        setSuccess("Paramètres généraux sauvegardés.");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError("Erreur lors de la sauvegarde.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveMapping = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/lfd/accounting/mappings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          debit_account_id: editDebitId,
          credit_account_id: editCreditId
        })
      });

      if (res.ok) {
        setSuccess("Mapping sauvegardé.");
        setEditingMappingId(null);
        fetchData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError("Erreur lors de la sauvegarde du mapping.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const startEditMapping = (mapping) => {
    setEditingMappingId(mapping.id);
    setEditDebitId(mapping.debit_account_id);
    setEditCreditId(mapping.credit_account_id);
  };

  if (loading) return <div className="lfd-loading">Chargement...</div>;

  return (
    <div className="lfd-dashboard">
      <div className="lfd-dashboard-header">
        <h1>Paramètres Comptables</h1>
      </div>

      {error && <div className="lfd-error-banner">{error}</div>}
      {success && <div className="lfd-success-banner">{success}</div>}

      <div className="lfd-card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Paramètres Généraux</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxWidth: '600px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Date de bascule comptable</label>
            <input 
              type="date" 
              className="lfd-input" 
              value={dateCutover} 
              onChange={(e) => setDateCutover(e.target.value)}
              title="Seuls les événements survenus après cette date généreront des écritures"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Statut par défaut des écritures générées</label>
            <select 
              className="lfd-input" 
              value={autoStatus} 
              onChange={(e) => setAutoStatus(e.target.value)}
            >
              <option value="DRAFT">Brouillon (À valider manuellement)</option>
              <option value="POSTED">Validé (Immédiatement dans le Grand Livre)</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <button className="lfd-btn lfd-btn-primary" onClick={handleSaveSettings}>Enregistrer les paramètres</button>
        </div>
      </div>

      <div className="lfd-card">
        <h2 style={{ marginBottom: '1rem' }}>Mappings Automatiques (Partie Double)</h2>
        <table className="lfd-table">
          <thead>
            <tr>
              <th>Événement</th>
              <th>Description</th>
              <th>Compte Débit</th>
              <th>Compte Crédit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map(m => (
              <tr key={m.id}>
                <td><strong>{m.event_type}</strong></td>
                <td>{m.description}</td>
                
                {editingMappingId === m.id ? (
                  <>
                    <td>
                      <select className="lfd-input" value={editDebitId} onChange={e => setEditDebitId(e.target.value)}>
                        <option value="">-- Sélectionner --</option>
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.account_number} - {a.name}</option>)}
                      </select>
                    </td>
                    <td>
                      <select className="lfd-input" value={editCreditId} onChange={e => setEditCreditId(e.target.value)}>
                        <option value="">-- Sélectionner --</option>
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.account_number} - {a.name}</option>)}
                      </select>
                    </td>
                    <td>
                      <button className="lfd-btn lfd-btn-primary" style={{ marginRight: '0.5rem' }} onClick={() => handleSaveMapping(m.id)}>Sauver</button>
                      <button className="lfd-btn lfd-btn-secondary" onClick={() => setEditingMappingId(null)}>Annuler</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{m.debit_account_number} - {m.debit_account_name}</td>
                    <td>{m.credit_account_number} - {m.credit_account_name}</td>
                    <td>
                      <button className="lfd-btn lfd-btn-secondary" onClick={() => startEditMapping(m)}>Modifier</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParametresComptables;
