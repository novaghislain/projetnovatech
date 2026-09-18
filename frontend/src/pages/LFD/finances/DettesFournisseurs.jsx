import { API_URL } from '../../../config';
import React, { useState, useEffect } from "react";
import { Search, CreditCard, CheckCircle, Clock, AlertTriangle, FileText, Building2 } from "lucide-react";
import LFDModal from "../../../components/LFD/LFDModal";
import { useLFDAuth } from "../../../contexts/LFDAuthContext";
import axios from "axios";

const formatFCFA = (amount) => {
  if (amount === undefined || amount === null) return "0 FCFA";
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
};

const DettesFournisseurs = () => {
  const { lfdToken, hasPermission } = useLFDAuth();
  const [dettes, setDettes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("UNPAID"); // UNPAID, PARTIAL, PAID

  // Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedDette, setSelectedDette] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/lfd/payables`, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      setDettes(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les dettes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lfdToken]);

  const handleOpenPayment = (dette) => {
    setSelectedDette(dette);
    const reste = dette.amount - dette.amount_paid;
    setPaymentAmount(reste);
    setPaymentError(null);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    setPaymentError(null);
    const amt = parseFloat(paymentAmount);
    const reste = selectedDette.amount - selectedDette.amount_paid;
    
    if (amt <= 0) return setPaymentError("Le montant doit être > 0.");
    if (amt > reste) return setPaymentError(`Le montant ne peut pas dépasser le reste à payer (${formatFCFA(reste)}).`);

    setPaymentLoading(true);
    try {
      await axios.post(`${API_URL}/api/lfd/payables/${selectedDette.id}/pay`, {
        amount: amt
      }, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      
      alert("Paiement enregistré avec succès.");
      setIsPaymentModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setPaymentError(err.response?.data?.error || "Erreur lors du paiement. Vérifiez la caisse.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const filteredDettes = dettes.filter(d => 
    d.status === activeTab &&
    ((d.supplier_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
     (d.supplier_reference || "").toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case 'UNPAID': return <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: "#FEE2E2", color: "#991B1B" }}>NON PAYÉ</span>;
      case 'PARTIAL': return <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: "#FEF3C7", color: "#B45309" }}>PAIEMENT PARTIEL</span>;
      case 'PAID': return <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: "#D1FAE5", color: "#065F46" }}>PAYÉ</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div className="lfd-page" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--lfd-surface)" }}>Dettes & Paiements Fournisseurs</h1>
          <p style={{ color: "var(--lfd-text-dim)", fontSize: "0.9rem" }}>Réglez les factures validées depuis la caisse principale.</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid var(--lfd-surface-3)", marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab('UNPAID')}
          style={{ padding: "12px 20px", fontWeight: 600, background: "none", border: "none", borderBottom: activeTab === 'UNPAID' ? "3px solid #EF4444" : "3px solid transparent", color: activeTab === 'UNPAID' ? "#EF4444" : "var(--lfd-text-muted)", cursor: "pointer" }}
        >
          Non Payées
        </button>
        <button
          onClick={() => setActiveTab('PARTIAL')}
          style={{ padding: "12px 20px", fontWeight: 600, background: "none", border: "none", borderBottom: activeTab === 'PARTIAL' ? "3px solid #F59E0B" : "3px solid transparent", color: activeTab === 'PARTIAL' ? "#F59E0B" : "var(--lfd-text-muted)", cursor: "pointer" }}
        >
          Partielles
        </button>
        <button
          onClick={() => setActiveTab('PAID')}
          style={{ padding: "12px 20px", fontWeight: 600, background: "none", border: "none", borderBottom: activeTab === 'PAID' ? "3px solid #10B981" : "3px solid transparent", color: activeTab === 'PAID' ? "#10B981" : "var(--lfd-text-muted)", cursor: "pointer" }}
        >
          Soldées
        </button>
      </div>

      <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(26,26,46,0.05)" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
            <Search size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--lfd-text-muted)" }} />
            <input type="text" placeholder="Rechercher (Fournisseur, Réf)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "100%", padding: "10px 10px 10px 38px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", outline: "none" }} />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--lfd-text-dim)" }}>Chargement...</div>
        ) : error ? (
          <div style={{ padding: 40, textAlign: "center", color: "#EF4444" }}>{error}</div>
        ) : filteredDettes.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--lfd-text-dim)" }}>Aucune dette dans cette catégorie.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--lfd-surface-3)", color: "var(--lfd-text-muted)", textAlign: "left" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Fournisseur</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Réf. Facture</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Échéance</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Total Dette</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Déjà Payé</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#EF4444" }}>Reste à Payer</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Statut</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDettes.map((d) => (
                  <tr key={d.id} style={{ borderBottom: "1px solid var(--lfd-content-bg)", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background="#F8FAFC"} onMouseOut={e => e.currentTarget.style.background="transparent"}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--lfd-surface)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--lfd-content-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--lfd-accent)" }}><Building2 size={16} /></div>
                        <div>{d.supplier_name}</div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--lfd-text-dim)" }}>{d.supplier_reference}</td>
                    <td style={{ padding: "12px 16px", color: "var(--lfd-text-dim)" }}>{d.due_date ? new Date(d.due_date).toLocaleDateString('fr-FR') : "-"}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 700 }}>{formatFCFA(d.amount)}</td>
                    <td style={{ padding: "12px 16px", color: "#10B981", fontWeight: 600 }}>{formatFCFA(d.amount_paid)}</td>
                    <td style={{ padding: "12px 16px", color: "#EF4444", fontWeight: 700 }}>{formatFCFA(d.amount - d.amount_paid)}</td>
                    <td style={{ padding: "12px 16px" }}>{getStatusBadge(d.status)}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      {d.status !== 'PAID' && hasPermission("payable.pay") && (
                        <button 
                          onClick={() => handleOpenPayment(d)} 
                          style={{ background: "#3B82F6", color: "white", border: "none", padding: "6px 12px", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}
                        >
                          <CreditCard size={14} /> Payer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LFDModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Effectuer un paiement">
        {selectedDette && (
          <form onSubmit={handleConfirmPayment} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {paymentError && (
              <div style={{ background: "#FEE2E2", color: "#B91C1C", padding: 12, borderRadius: 8, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={16} /> {paymentError}
              </div>
            )}
            
            <div style={{ background: "#F8FAFC", padding: 15, borderRadius: 8, border: "1px solid #E2E8F0", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#64748B", fontSize: "0.9rem" }}>Fournisseur :</span>
                <span style={{ fontWeight: 600 }}>{selectedDette.supplier_name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#64748B", fontSize: "0.9rem" }}>Référence Facture :</span>
                <span style={{ fontWeight: 600 }}>{selectedDette.supplier_reference}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#64748B", fontSize: "0.9rem" }}>Total Dette :</span>
                <span style={{ fontWeight: 600 }}>{formatFCFA(selectedDette.amount)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#64748B", fontSize: "0.9rem" }}>Déjà payé :</span>
                <span style={{ fontWeight: 600, color: "#10B981" }}>{formatFCFA(selectedDette.amount_paid)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #CBD5E1" }}>
                <span style={{ color: "#EF4444", fontSize: "0.95rem", fontWeight: 700 }}>Reste à payer :</span>
                <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#EF4444" }}>{formatFCFA(selectedDette.amount - selectedDette.amount_paid)}</span>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Montant du paiement (FCFA) *</label>
              <input 
                type="number" 
                min="1" 
                max={selectedDette.amount - selectedDette.amount_paid} 
                required 
                value={paymentAmount} 
                onChange={(e) => setPaymentAmount(e.target.value)} 
                style={{ width: "100%", padding: "12px", borderRadius: 8, border: "2px solid #3B82F6", fontSize: "1.1rem", fontWeight: 700 }} 
              />
            </div>
            
            <div style={{ fontSize: "0.85rem", color: "#64748B", display: "flex", alignItems: "center", gap: 6 }}>
              <AlertTriangle size={14} /> Attention : Le paiement sera déduit de la caisse active. Assurez-vous que la caisse est ouverte et suffisamment approvisionnée.
            </div>

            <button type="submit" disabled={paymentLoading} style={{ marginTop: 10, padding: "12px", borderRadius: 8, background: "#3B82F6", color: "white", border: "none", fontWeight: 600, cursor: paymentLoading ? "not-allowed" : "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
              {paymentLoading ? "Traitement..." : "Confirmer le paiement"}
            </button>
          </form>
        )}
      </LFDModal>
    </div>
  );
};
export default DettesFournisseurs;
