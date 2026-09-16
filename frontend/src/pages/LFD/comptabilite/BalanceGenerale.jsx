import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BalanceGenerale = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('lfd_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const year = new Date().getFullYear();
      const res = await axios.get(`http://localhost:5001/api/lfd/accounting/balance?startDate=${year}-01-01&endDate=${year}-12-31`, { headers });
      setBalance(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const totals = balance.reduce((acc, curr) => {
    acc.totalDebit += curr.total_debit;
    acc.totalCredit += curr.total_credit;
    acc.soldeDebit += curr.solde_debit;
    acc.soldeCredit += curr.solde_credit;
    return acc;
  }, { totalDebit: 0, totalCredit: 0, soldeDebit: 0, soldeCredit: 0 });

  if (loading) return <div>Chargement de la balance...</div>;

  return (
    <div className="lfd-page">
      <div className="lfd-header-flex">
        <h2>Balance Générale</h2>
        <button className="lfd-btn lfd-btn-secondary" onClick={() => navigate('/lfd/comptabilite')}>Retour</button>
      </div>

      <div className="lfd-card">
        <table className="lfd-table">
          <thead>
            <tr>
              <th>Compte</th>
              <th>Intitulé</th>
              <th>Total Débit</th>
              <th>Total Crédit</th>
              <th>Solde Débiteur</th>
              <th>Solde Créditeur</th>
            </tr>
          </thead>
          <tbody>
            {balance.map(b => (
              <tr key={b.account_number}>
                <td><strong>{b.account_number}</strong></td>
                <td>{b.account_name}</td>
                <td>{b.total_debit.toLocaleString()} FCFA</td>
                <td>{b.total_credit.toLocaleString()} FCFA</td>
                <td>{b.solde_debit > 0 ? b.solde_debit.toLocaleString() + ' FCFA' : '-'}</td>
                <td>{b.solde_credit > 0 ? b.solde_credit.toLocaleString() + ' FCFA' : '-'}</td>
              </tr>
            ))}
            {balance.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center">Aucune donnée pour la période.</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#f0fdf4', fontWeight: 'bold' }}>
              <td colSpan="2" className="text-right">TOTAUX :</td>
              <td>{totals.totalDebit.toLocaleString()} FCFA</td>
              <td>{totals.totalCredit.toLocaleString()} FCFA</td>
              <td>{totals.soldeDebit.toLocaleString()} FCFA</td>
              <td>{totals.soldeCredit.toLocaleString()} FCFA</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default BalanceGenerale;
