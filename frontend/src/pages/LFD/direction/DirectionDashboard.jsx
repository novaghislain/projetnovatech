import React, { useState, useEffect } from 'react';
import { useLFDAuth } from '../../../contexts/LFDAuthContext';
import { 
  TrendingUp, Wallet, Package, Users, Truck, AlertCircle, ShoppingCart, Landmark, ArrowRight, Activity 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const formatFCFA = (amount) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount || 0);
};

const DirectionDashboard = () => {
  const { lfdToken } = useLFDAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    ventes: { today: 0, month: 0, cash: 0, credit: 0, cancelledCount: 0 },
    encaissements: { today: 0, month: 0 },
    creances: 0,
    caisse_active: 0,
    achats: { month: 0, dettes: 0 },
    depots: { pending: 0, confirmedToday: 0 },
    alertesCount: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, [lfdToken]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5001/api/lfd/dashboard/cockpit', {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement du tableau de bord Direction.");
    } finally {
      setLoading(false);
    }
  };

  const KPICard = ({ title, value, subtext, icon: Icon, colorClass, onClick, alertCount = 0 }) => (
    <div 
      className="lfd-card lfd-kpi-card" 
      onClick={onClick} 
      style={{ cursor: onClick ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', position: 'relative' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--lfd-text-dim)', margin: 0 }}>{title}</h3>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '10px 0 5px 0', color: colorClass ? 'var(--' + colorClass + ')' : 'inherit' }}>
            {value}
          </div>
          {subtext && <div style={{ fontSize: '0.8rem', color: 'var(--lfd-text-muted)' }}>{subtext}</div>}
        </div>
        <div style={{ padding: '10px', background: 'var(--lfd-surface-3)', borderRadius: '50%' }}>
          <Icon size={24} style={{ color: colorClass ? 'var(--' + colorClass + ')' : 'inherit' }} />
        </div>
      </div>
      {alertCount > 0 && (
        <div style={{ position: 'absolute', top: 10, right: 10, background: '#EF4444', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
          {alertCount}
        </div>
      )}
      {onClick && (
        <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--lfd-surface-3)', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--lfd-text-muted)', fontSize: '0.8rem' }}>
          Voir détails <ArrowRight size={14} />
        </div>
      )}
    </div>
  );

  if (loading) return <div className="lfd-loading">Chargement du Cockpit Direction...</div>;

  return (
    <div className="lfd-page" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--lfd-surface)', margin: 0 }}>Cockpit Direction</h1>
          <p style={{ color: 'var(--lfd-text-dim)', fontSize: '0.9rem', marginTop: '5px' }}>Vision globale et contrôle interne.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="lfd-btn lfd-btn-secondary" onClick={() => navigate('/gestion/direction/controles')}>
            <Activity size={16} style={{ marginRight: 8 }} />
            Contrôles Croisés
          </button>
          <button className="lfd-btn lfd-btn-secondary" onClick={() => navigate('/gestion/audit')}>
            Journal d'Audit
          </button>
          <button className="lfd-btn lfd-btn-primary" onClick={() => window.print()}>
            Exporter (PDF)
          </button>
        </div>
      </div>

      {error && <div className="lfd-alert lfd-alert-danger" style={{ marginBottom: 20 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        {/* VENTES & ENCAISSEMENTS */}
        <KPICard 
          title="Ventes (Aujourd'hui)" 
          value={formatFCFA(data.ventes.today)} 
          subtext={`Ce mois : ${formatFCFA(data.ventes.month)}`}
          icon={TrendingUp} 
          onClick={() => navigate('/gestion/ventes')}
        />
        <KPICard 
          title="Encaissements (Aujourd'hui)" 
          value={formatFCFA(data.encaissements.today)} 
          subtext={`Ce mois : ${formatFCFA(data.encaissements.month)}`}
          icon={Wallet} 
          onClick={() => navigate('/gestion/facturation')} 
        />
        
        {/* CAISSE & DEPOTS */}
        <KPICard 
          title="Caisse (Solde Théorique)" 
          value={formatFCFA(data.caisse_active)} 
          subtext="Sessions ouvertes"
          icon={Wallet} 
          onClick={() => navigate('/gestion/caisse')}
        />
        <KPICard 
          title="Dépôts Bancaires en Attente" 
          value={formatFCFA(data.depots.pending)} 
          subtext={`Confirmés adj : ${formatFCFA(data.depots.confirmedToday)}`}
          icon={Landmark} 
          colorClass={data.depots.pending > 0 ? "lfd-text-danger" : ""}
          onClick={() => navigate('/gestion/finances/depots')}
          alertCount={data.depots.pending > 0 ? 1 : 0}
        />

        {/* CLIENTS & DETTES */}
        <KPICard 
          title="Créances Clients" 
          value={formatFCFA(data.creances)} 
          subtext="Montant restant dû"
          icon={Users} 
          colorClass={data.creances > 0 ? "lfd-text-warning" : ""}
          onClick={() => navigate('/gestion/creances')}
        />
        <KPICard 
          title="Dettes Fournisseurs" 
          value={formatFCFA(data.achats.dettes)} 
          subtext={`Achats du mois : ${formatFCFA(data.achats.month)}`}
          icon={ShoppingCart} 
          onClick={() => navigate('/gestion/dettes-fournisseurs')}
        />

        {/* OPERATIONS & ALERTES */}
        <KPICard 
          title="État des Stocks" 
          value="Contrôle" 
          subtext="Consulter les niveaux et mouvements"
          icon={Package} 
          onClick={() => navigate('/gestion/stock')}
        />
        <KPICard 
          title="Alertes & Anomalies" 
          value={data.alertesCount} 
          subtext="Écarts, stock négatif, etc."
          icon={AlertCircle} 
          colorClass={data.alertesCount > 0 ? "lfd-text-danger" : ""}
          onClick={() => navigate('/gestion/alertes')}
        />

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="lfd-card">
          <h3>Détail des Ventes (Période)</h3>
          <table className="lfd-table" style={{ marginTop: 15 }}>
            <tbody>
              <tr>
                <td>Ventes Comptant (Payées)</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatFCFA(data.ventes.cash)}</td>
              </tr>
              <tr>
                <td>Ventes à Crédit</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatFCFA(data.ventes.credit)}</td>
              </tr>
              <tr>
                <td>Factures Annulées</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{data.ventes.cancelledCount}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="lfd-card">
          <h3>Raccourcis Direction</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 15 }}>
            <button className="lfd-btn lfd-btn-secondary" onClick={() => navigate('/gestion/livraisons')}>Suivi des Livraisons</button>
            <button className="lfd-btn lfd-btn-secondary" onClick={() => navigate('/gestion/commandes-achat')}>Suivi des Commandes Fournisseurs</button>
            <button className="lfd-btn lfd-btn-secondary" onClick={() => navigate('/gestion/employes')}>Gestion des Employés & Droits</button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DirectionDashboard;
