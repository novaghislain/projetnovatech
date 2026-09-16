import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SaisieEcriture = () => {
  const navigate = useNavigate();
  const [journals, setJournals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  
  const [formData, setFormData] = useState({
    journal_id: '',
    entry_date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const [lines, setLines] = useState([
    { account_id: '', description: '', debit: 0, credit: 0 },
    { account_id: '', description: '', debit: 0, credit: 0 }
  ]);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('lfd_token');
      const headers = { Authorization: `Bearer ${token}` };
      const [resJournals, resAccounts] = await Promise.all([
        axios.get('http://localhost:5001/api/lfd/accounting/journals', { headers }),
        axios.get('http://localhost:5001/api/lfd/accounting/accounts', { headers })
      ]);
      setJournals(resJournals.data);
      setAccounts(resAccounts.data);
      if (resJournals.data.length > 0) {
        setFormData(prev => ({ ...prev, journal_id: resJournals.data[0].id }));
      }
    } catch (error) {
      console.error(error);
      setError("Erreur de chargement des données.");
    }
  };

  const handleLineChange = (index, field, value) => {
    const newLines = [...lines];
    newLines[index][field] = value;
    
    if (field === 'debit' && value > 0) newLines[index].credit = 0;
    if (field === 'credit' && value > 0) newLines[index].debit = 0;
    
    setLines(newLines);
  };

  const addLine = () => {
    setLines([...lines, { account_id: '', description: '', debit: 0, credit: 0 }]);
  };

  const removeLine = (index) => {
    const newLines = [...lines];
    newLines.splice(index, 1);
    setLines(newLines);
  };

  const calculateTotals = () => {
    let totalDebit = 0;
    let totalCredit = 0;
    lines.forEach(line => {
      totalDebit += Number(line.debit) || 0;
      totalCredit += Number(line.credit) || 0;
    });
    return { totalDebit, totalCredit };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const { totalDebit, totalCredit } = calculateTotals();
    if (totalDebit !== totalCredit) {
      setError(`L'écriture est déséquilibrée (Débit: ${totalDebit}, Crédit: ${totalCredit})`);
      return;
    }
    if (totalDebit === 0) {
      setError("Les montants ne peuvent pas être nuls.");
      return;
    }
    if (lines.some(l => !l.account_id)) {
      setError("Veuillez sélectionner un compte pour toutes les lignes.");
      return;
    }

    try {
      const token = localStorage.getItem('lfd_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const payload = {
        ...formData,
        source_type: "MANUAL",
        source_id: Date.now(), // Unique ID simple pour éviter le blocage idempotence manuel
        event_type: "MANUAL_ENTRY",
        lines: lines.map(l => ({
          ...l,
          debit: Number(l.debit) || 0,
          credit: Number(l.credit) || 0
        }))
      };

      await axios.post('http://localhost:5001/api/lfd/accounting/entries', payload, { headers });
      setSuccess("Écriture créée avec succès !");
      setFormData({ ...formData, description: '' });
      setLines([
        { account_id: '', description: '', debit: 0, credit: 0 },
        { account_id: '', description: '', debit: 0, credit: 0 }
      ]);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la création.");
    }
  };

  const { totalDebit, totalCredit } = calculateTotals();

  return (
    <div className="lfd-page">
      <div className="lfd-header-flex">
        <h2>Saisie d'écriture manuelle</h2>
        <button className="lfd-btn lfd-btn-secondary" onClick={() => navigate('/lfd/comptabilite')}>Retour</button>
      </div>

      {error && <div className="lfd-alert lfd-alert-danger">{error}</div>}
      {success && <div className="lfd-alert lfd-alert-success">{success}</div>}

      <div className="lfd-card">
        <form onSubmit={handleSubmit}>
          <div className="lfd-grid-2">
            <div className="lfd-form-group">
              <label>Date de l'écriture</label>
              <input 
                type="date" 
                className="lfd-input" 
                value={formData.entry_date} 
                onChange={(e) => setFormData({...formData, entry_date: e.target.value})}
                required
              />
            </div>
            <div className="lfd-form-group">
              <label>Journal</label>
              <select 
                className="lfd-input"
                value={formData.journal_id}
                onChange={(e) => setFormData({...formData, journal_id: e.target.value})}
                required
              >
                {journals.map(j => <option key={j.id} value={j.id}>{j.code} - {j.name}</option>)}
              </select>
            </div>
            <div className="lfd-form-group" style={{ gridColumn: 'span 2' }}>
              <label>Libellé de l'écriture</label>
              <input 
                type="text" 
                className="lfd-input" 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>
          </div>

          <h3>Lignes d'écriture</h3>
          <table className="lfd-table">
            <thead>
              <tr>
                <th>Compte</th>
                <th>Libellé de ligne</th>
                <th>Débit</th>
                <th>Crédit</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx}>
                  <td>
                    <select 
                      className="lfd-input"
                      value={line.account_id}
                      onChange={(e) => handleLineChange(idx, 'account_id', e.target.value)}
                      required
                    >
                      <option value="">-- Compte --</option>
                      {accounts.map(a => (
                        <option key={a.id} value={a.id}>{a.account_number} - {a.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input 
                      type="text" 
                      className="lfd-input"
                      value={line.description}
                      onChange={(e) => handleLineChange(idx, 'description', e.target.value)}
                      placeholder="Facultatif"
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      className="lfd-input"
                      value={line.debit}
                      onChange={(e) => handleLineChange(idx, 'debit', e.target.value)}
                      min="0"
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      className="lfd-input"
                      value={line.credit}
                      onChange={(e) => handleLineChange(idx, 'credit', e.target.value)}
                      min="0"
                    />
                  </td>
                  <td>
                    {lines.length > 2 && (
                      <button type="button" className="lfd-btn-small lfd-btn-danger" onClick={() => removeLine(idx)}>X</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="2" className="text-right"><strong>TOTAL :</strong></td>
                <td><strong>{totalDebit.toLocaleString()} FCFA</strong></td>
                <td><strong>{totalCredit.toLocaleString()} FCFA</strong></td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <button type="button" className="lfd-btn lfd-btn-secondary" onClick={addLine}>+ Ajouter une ligne</button>
            <button type="submit" className="lfd-btn lfd-btn-primary">Enregistrer l'écriture (Brouillon)</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaisieEcriture;
