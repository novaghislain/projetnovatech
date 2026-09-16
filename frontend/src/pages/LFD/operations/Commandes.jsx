import React, { useState } from "react";
import { Search, ShoppingCart, Check, Truck } from "lucide-react";
import { formatFCFA } from "../mockDataPhase2";
import { useLFDData } from "../../../contexts/LFDDataContext";
import LFDModal from "../../../components/LFD/LFDModal";

const Commandes = () => {
  const { commandes, setCommandes } = useLFDData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ fournisseur: "", total: "", datePrevue: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    setCommandes([{
      id: `BC-00${commandes.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      fournisseur: formData.fournisseur,
      total: Number(formData.total),
      dateLivraisonPrevue: formData.datePrevue,
      statut: "En cours"
    }, ...commandes]);
    setIsModalOpen(false);
    setFormData({ fournisseur: "", total: "", datePrevue: "" });
  };

  const handleReception = (id) => {
    setCommandes(commandes.map(c => c.id === id ? { ...c, statut: "Reçue" } : c));
  };

  return (
    <div className="lfd-page" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--lfd-surface)" }}>Commandes Fournisseurs</h1>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="lfd-btn lfd-btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>
          <ShoppingCart size={18} /> Nouveau Bon de Commande
        </button>
      </div>

      <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(26,26,46,0.05)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--lfd-surface-3)", color: "var(--lfd-text-muted)", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>N° Bon</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Date Commande</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Fournisseur</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Total estimé</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Livraison Prévue</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Statut</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {commandes.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes((searchTerm || '').toLowerCase()))).map((cmd) => (
                <tr key={cmd.id} style={{ borderBottom: "1px solid var(--lfd-content-bg)" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--lfd-surface)" }}>{cmd.id}</td>
                  <td style={{ padding: "12px 16px", color: "var(--lfd-text-dim)" }}>{cmd.date}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>{cmd.fournisseur}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 700 }}>{formatFCFA(cmd.total)}</td>
                  <td style={{ padding: "12px 16px", color: "var(--lfd-text-dim)" }}>{cmd.dateLivraisonPrevue}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: cmd.statut === "Reçue" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", color: cmd.statut === "Reçue" ? "#059669" : "#D97706" }}>
                      {cmd.statut}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    {cmd.statut === "En cours" && (
                      <button onClick={() => handleReception(cmd.id)} style={{ background: "transparent", border: "1px solid #10B981", cursor: "pointer", color: "#10B981", padding: "6px 12px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: "0.8rem" }}>
                        <Check size={14} /> Réceptionner
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <LFDModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Créer un Bon de Commande Fournisseur">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Fournisseur</label>
            <input type="text" required value={formData.fournisseur} onChange={(e) => setFormData({...formData, fournisseur: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Total estimé (FCFA)</label>
            <input type="number" required min="1" value={formData.total} onChange={(e) => setFormData({...formData, total: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Date de livraison prévue</label>
            <input type="date" required value={formData.datePrevue} onChange={(e) => setFormData({...formData, datePrevue: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
          </div>
          <button type="submit" style={{ marginTop: 10, padding: "12px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
            Générer le Bon
          </button>
        </form>
      </LFDModal>
    </div>
  );
};
export default Commandes;

