import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const GrandLivre = () => {
  const navigate = useNavigate();
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('lfd_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const year = new Date().getFullYear();
      const res = await axios.get(`http://localhost:5001/api/lfd/accounting/ledger?startDate=${year}-01-01&endDate=${year}-12-31`, { headers });
      setLedger(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Chargement du Grand Livre...</div>;

  return (
    <div className="lfd-page">
      <div className="lfd-header-flex">
        <h2>Grand Livre Comptable</h2>
        <button className="lfd-btn lfd-btn-secondary" onClick={() => navigate('/lfd/comptabilite')}>Retour</button>
      </div>

      <div className="lfd-card">
        <table className="lfd-table">
          <thead>
            <tr>
              <th>Compte</th>
              <th>Date</th>
              <th>Journal</th>
              <th>N° Écriture</th>
              <th>Libellé</th>
              <th>Débit</th>
              <th>Crédit</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((line, idx) => (
              <tr key={idx}>
                <td><strong>{line.account_number}</strong></td>
                <td>{line.entry_date}</td>
                <td>{line.journal_code}</td>
                <td>{line.entry_number}</td>
                <td>{line.description}</td>
                <td style={{ color: line.debit > 0 ? '#10b981' : 'inherit' }}>
                  {line.debit > 0 ? line.debit.toLocaleString() : '-'}
                </td>
                <td style={{ color: line.credit > 0 ? '#ef4444' : 'inherit' }}>
                  {line.credit > 0 ? line.credit.toLocaleString() : '-'}
                </td>
              </tr>
            ))}
            {ledger.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center">Aucune écriture trouvée.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GrandLivre;
