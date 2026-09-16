import React, { useState, useEffect } from 'react';
import { useLFDAuth } from '../../../contexts/LFDAuthContext';
import axios from 'axios';

const formatFCFA = (amount) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount || 0);
};

const CrossCheckDashboard = () => {
  const { lfdToken } = useLFDAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [lfdToken]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5001/api/lfd/cross-checks/analysis', {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement de l'analyse.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="lfd-loading">Analyse en cours...</div>;
  if (error) return <div className="lfd-alert lfd-alert-danger">{error}</div>;

  return (
    <div className="lfd-page" style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 20 }}>Contrôles Croisés & Écarts</h1>

      {data.anomalies.length > 0 ? (
        <div className="lfd-card" style={{ marginBottom: 20, borderColor: '#EF4444', borderWidth: 2, borderStyle: 'solid' }}>
          <h2 style={{ color: '#EF4444' }}>⚠️ Anomalies Détectées ({data.anomalies.length})</h2>
          <ul style={{ marginTop: 10 }}>
            {data.anomalies.map((an, idx) => (
              <li key={idx} style={{ marginBottom: 10 }}>
                <strong>[{an.type}]</strong> {an.message}
                <ul style={{ color: 'var(--lfd-text-dim)', marginTop: 5 }}>
                  {an.details.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="lfd-alert lfd-alert-success" style={{ marginBottom: 20 }}>
          Aucune anomalie critique détectée par le système.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        
        {/* VENTES */}
        <div className="lfd-card">
          <h3>Ventes et Encaissements</h3>
          <table className="lfd-table" style={{ marginTop: 15 }}>
            <tbody>
              <tr>
                <td>Nombre de Ventes Validées</td>
                <td style={{ textAlign: 'right' }}>{data.ventes?.total_sales || 0}</td>
              </tr>
              <tr>
                <td>Chiffre d'Affaires Global</td>
                <td style={{ textAlign: 'right' }}>{formatFCFA(data.ventes?.total_amount)}</td>
              </tr>
              <tr>
                <td>Ventes Comptant (Encaissées)</td>
                <td style={{ textAlign: 'right', color: 'var(--lfd-success)' }}>{formatFCFA(data.ventes?.cash_sales)}</td>
              </tr>
              <tr>
                <td>Ventes à Crédit (Créances)</td>
                <td style={{ textAlign: 'right', color: 'var(--lfd-warning)' }}>{formatFCFA(data.ventes?.credit_sales)}</td>
              </tr>
            </tbody>
          </table>
          <p style={{ marginTop: 15, fontSize: '0.85rem', color: 'var(--lfd-text-muted)' }}>
            Les ventes comptant doivent correspondre aux encaissements et aux entrées en caisse.
          </p>
        </div>

        {/* LOGISTIQUE */}
        <div className="lfd-card">
          <h3>Logistique et Stock</h3>
          <table className="lfd-table" style={{ marginTop: 15 }}>
            <tbody>
              <tr>
                <td>Livraisons en attente (Ventes non livrées)</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{data.pendingDeliveries}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* CAISSE */}
        <div className="lfd-card" style={{ gridColumn: 'span 2' }}>
          <h3>Dernières Sessions de Caisse (Contrôle des Écarts)</h3>
          <table className="lfd-table" style={{ marginTop: 15 }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Ouverture</th>
                <th>Fermeture</th>
                <th>Statut</th>
                <th>Solde Théorique</th>
                <th>Solde Physique</th>
                <th>Écart</th>
              </tr>
            </thead>
            <tbody>
              {data.caisseSessions.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center' }}>Aucune session trouvée</td></tr>
              ) : data.caisseSessions.map(session => (
                <tr key={session.id}>
                  <td>#{session.id}</td>
                  <td>{new Date(session.opened_at).toLocaleString()}</td>
                  <td>{session.closed_at ? new Date(session.closed_at).toLocaleString() : '-'}</td>
                  <td>
                    <span className={`lfd-badge lfd-badge-${session.status === 'OPEN' ? 'success' : 'secondary'}`}>
                      {session.status}
                    </span>
                  </td>
                  <td>{formatFCFA(session.theoretical_balance)}</td>
                  <td>{session.actual_balance !== null ? formatFCFA(session.actual_balance) : '-'}</td>
                  <td style={{ 
                    fontWeight: 'bold', 
                    color: session.difference === 0 ? 'var(--lfd-success)' : 'var(--lfd-danger)' 
                  }}>
                    {session.difference !== null ? formatFCFA(session.difference) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: 15, fontSize: '0.85rem', color: 'var(--lfd-text-muted)' }}>
            Un écart négatif indique un manque d'argent. Un écart positif indique un surplus inexpliqué. L'historique des écarts ne doit jamais être supprimé (Audit).
          </p>
        </div>

      </div>
    </div>
  );
};

export default CrossCheckDashboard;
