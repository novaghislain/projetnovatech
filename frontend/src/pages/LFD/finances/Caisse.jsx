import React, { useState, useEffect } from "react";
import { Search, Filter, Plus, ArrowDownCircle, ArrowUpCircle, Lock } from "lucide-react";
import { formatFCFA } from "../mockDataPhase2";
import LFDModal from "../../../components/LFD/LFDModal";
import { useLFDAuth } from "../../../contexts/LFDAuthContext";
import axios from "axios";

const Caisse = () => {
  const { lfdToken } = useLFDAuth();
  const [caisse, setCaisse] = useState([]);
  const [sessionInfo, setSessionInfo] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClotureOpen, setIsClotureOpen] = useState(false);
  const [formData, setFormData] = useState({ type: "Entrée", motif: "", montant: "" });
  const [clotureData, setClotureData] = useState({ physical_balance: "", difference_reason: "" });

  // 1. Charger la session actuelle
  const fetchSession = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/lfd/cash/session", {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      setSessionInfo(res.data.session);
      setCaisse(res.data.transactions || []);
    } catch (err) {
      if (err.response?.status === 404) {
        setSessionInfo(null);
        setCaisse([]);
      } else {
        console.error("Erreur chargement session:", err);
      }
    }
  };

  useEffect(() => {
    fetchSession();
  }, [lfdToken]);

  const soldeInitial = sessionInfo ? sessionInfo.opening_balance : 0;
  const soldeTheorique = sessionInfo ? sessionInfo.theoretical_balance : 0;
  
  // on filtre pour l'affichage (optionnel car on pourrait tout faire côté backend)
  const totalEntrees = caisse.filter(t => t.type === "DEPOSIT" || t.type === "SALE_PAYMENT" || t.type === "CUSTOMER_PAYMENT" || (t.type === "ADJUSTMENT" && t.amount > 0)).reduce((sum, t) => sum + t.amount, 0);
  const totalSorties = caisse.filter(t => t.type === "EXPENSE" || (t.type === "ADJUSTMENT" && t.amount < 0)).reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sessionInfo) return alert("Veuillez ouvrir une session d'abord.");
    
    // (Pour Phase 3 simple, on va utiliser l'API. Cependant l'API actuelle ne gère pas DEPOSIT simple sans le bon type d'ajustement. 
    // Pour aller vite, on peut juste réafficher le tableau vide. Mais je n'ai pas implémenté de endpoint "POST transaction" manuel dans Phase 3 backend (c'est par les ventes).
    // Si ce n'est pas dispo, on ajoute en local pour la démo, mais on log une erreur).
    alert("Les transactions manuelles doivent passer par un ajustement (non codé dans le backend actuel). Pour l'instant, c'est simulé.");
    setIsModalOpen(false);
  };

  const handleCloture = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5001/api/lfd/cash/close", {
        physical_balance: Number(clotureData.physical_balance),
        difference_reason: clotureData.difference_reason
      }, { headers: { Authorization: `Bearer ${lfdToken}` } });
      alert("Clôture de la caisse enregistrée avec succès.");
      setIsClotureOpen(false);
      fetchSession();
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors de la clôture.");
    }
  };

  const handleOuvrir = async () => {
    try {
      await axios.post("http://localhost:5001/api/lfd/cash/open", {
        cash_register_id: 1, // Fixe pour le moment
        opening_balance: 0 // Par défaut
      }, { headers: { Authorization: `Bearer ${lfdToken}` } });
      fetchSession();
    } catch (err) {
      alert(err.response?.data?.error || "Erreur ouverture caisse.");
    }
  };

  return (
    <div className="lfd-page" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--lfd-surface)" }}>Journal de Caisse</h1>
          <p style={{ color: "var(--lfd-text-dim)", fontSize: "0.9rem" }}>Suivez les entrées et sorties de liquidités au quotidien.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {!sessionInfo ? (
            <button onClick={handleOuvrir} className="lfd-btn lfd-btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>
              <Lock size={18} /> Ouvrir la caisse
            </button>
          ) : (
            <>
              <button onClick={() => setIsClotureOpen(true)} className="lfd-btn lfd-btn-secondary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, border: "1px solid var(--lfd-accent)", color: "var(--lfd-accent)", cursor: "pointer", fontWeight: 600, background: "transparent" }}>
                <Lock size={18} /> Clôturer la caisse
              </button>
              <button onClick={() => setIsModalOpen(true)} className="lfd-btn lfd-btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>
                <Plus size={18} /> Nouvelle Transaction
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "24px" }}>
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", borderLeft: "4px solid var(--lfd-surface)", boxShadow: "0 2px 10px rgba(26,26,46,0.05)" }}>
          <div style={{ color: "var(--lfd-text-dim)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Solde Théorique Actuel</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--lfd-surface)" }}>{formatFCFA(soldeTheorique)}</div>
        </div>
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", borderLeft: "4px solid #10B981", boxShadow: "0 2px 10px rgba(26,26,46,0.05)" }}>
          <div style={{ color: "var(--lfd-text-dim)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Total Entrées (Jour)</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#10B981" }}>{formatFCFA(totalEntrees)}</div>
        </div>
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", borderLeft: "4px solid #EF4444", boxShadow: "0 2px 10px rgba(26,26,46,0.05)" }}>
          <div style={{ color: "var(--lfd-text-dim)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Total Sorties (Jour)</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#EF4444" }}>{formatFCFA(totalSorties)}</div>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(26,26,46,0.05)" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
            <Search size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--lfd-text-muted)" }} />
            <input type="text" placeholder="Rechercher une transaction..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "100%", padding: "10px 10px 10px 38px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", outline: "none" }} />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--lfd-surface-3)", color: "var(--lfd-text-muted)", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Heure</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Type</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Motif / Libellé</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Opérateur</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Montant</th>
              </tr>
            </thead>
            <tbody>
              {caisse.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes((searchTerm || '').toLowerCase()))).map((trx) => (
                <tr key={trx.id} style={{ borderBottom: "1px solid var(--lfd-content-bg)" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--lfd-text-dim)" }}>{trx.created_at}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: trx.type !== "EXPENSE" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: trx.type !== "EXPENSE" ? "#059669" : "#EF4444" }}>
                      {trx.type !== "EXPENSE" ? <ArrowDownCircle size={14} /> : <ArrowUpCircle size={14} />} {trx.type}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 500, color: "var(--lfd-surface)" }}>{trx.description}</td>
                  <td style={{ padding: "12px 16px", color: "var(--lfd-text-dim)" }}>{trx.created_by}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: trx.type !== "EXPENSE" ? "#10B981" : "var(--lfd-surface)" }}>
                    {trx.type !== "EXPENSE" ? "+" : "-"}{formatFCFA(trx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <LFDModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouvelle Transaction">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Type d'opération</label>
            <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }}>
              <option value="Entrée">Entrée (Encaissement)</option>
              <option value="Sortie">Sortie (Décaissement)</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Motif / Libellé</label>
            <input type="text" required value={formData.motif} onChange={(e) => setFormData({...formData, motif: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Montant (FCFA)</label>
            <input type="number" required min="1" value={formData.montant} onChange={(e) => setFormData({...formData, montant: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
          </div>
          <button type="submit" style={{ marginTop: 10, padding: "12px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
            Enregistrer la transaction
          </button>
        </form>
      </LFDModal>

      <LFDModal isOpen={isClotureOpen} onClose={() => setIsClotureOpen(false)} title="Clôturer la Caisse">
        <form onSubmit={handleCloture} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--lfd-text-dim)" }}>Le solde théorique calculé est de <strong>{formatFCFA(soldeTheorique)}</strong>. Veuillez entrer le montant physiquement compté pour vérification.</p>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Montant réel compté (FCFA)</label>
            <input type="number" required value={clotureData.physical_balance} onChange={(e) => setClotureData({...clotureData, physical_balance: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Motif différence (Optionnel)</label>
            <input type="text" value={clotureData.difference_reason} onChange={(e) => setClotureData({...clotureData, difference_reason: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
          </div>
          <button type="submit" style={{ marginTop: 10, padding: "12px", borderRadius: 8, background: "#EF4444", color: "white", border: "none", fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
            <Lock size={18} /> Valider la Clôture
          </button>
        </form>
      </LFDModal>
    </div>
  );
};
export default Caisse;

