import React, { useState } from "react";
import { Plus, Search, Filter, Eye, Printer, ShoppingBag } from "lucide-react";
import { formatFCFA } from "../mockDataPhase2";
import { useLFDData } from "../../../contexts/LFDDataContext";
import LFDModal from "../../../components/LFD/LFDModal";

const Ventes = () => {
  const { ventes, addVente } = useLFDData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ client: "", montant: "", articles: 1, statut: "Paye" });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newVente = {
      id: `V-00${ventes.length + 1}`,
      date: new Date().toISOString(),
      client: formData.client || "Client Anonyme",
      montant: Number(formData.montant) || 0,
      statut: formData.statut,
      articles: Number(formData.articles) || 1
    };
    addVente(newVente);
    setIsModalOpen(false);
    setFormData({ client: "", montant: "", articles: 1, statut: "Paye" });
  };

  return (
    <div className="lfd-page" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--lfd-surface)" }}>Ventes au comptoir</h1>
          <p style={{ color: "var(--lfd-text-dim)", fontSize: "0.9rem" }}>Gérez les ventes quotidiennes et les transactions rapides.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="lfd-btn lfd-btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>
          <Plus size={18} /> Nouvelle Vente
        </button>
      </div>

      <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(26,26,46,0.05)" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
            <Search size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--lfd-text-muted)" }} />
            <input type="text" placeholder="Rechercher une vente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "100%", padding: "10px 10px 10px 38px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", outline: "none" }} />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--lfd-surface-3)", color: "var(--lfd-text-muted)", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>ID</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Date</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Client</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Articles</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Montant</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Statut</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ventes.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes((searchTerm || '').toLowerCase()))).map((vente) => (
                <tr key={vente.id} style={{ borderBottom: "1px solid var(--lfd-content-bg)" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--lfd-surface)" }}>{vente.id}</td>
                  <td style={{ padding: "12px 16px", color: "var(--lfd-text-dim)" }}>{new Date(vente.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</td>
                  <td style={{ padding: "12px 16px" }}>{vente.client}</td>
                  <td style={{ padding: "12px 16px" }}>{vente.articles}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 700 }}>{formatFCFA(vente.montant)}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: vente.statut === "Paye" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", color: vente.statut === "Paye" ? "#059669" : "#D97706" }}>
                      {vente.statut}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--lfd-text-muted)" }} title="Voir Détails"><Eye size={18} /></button>
                    <button 
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--lfd-text-muted)", marginLeft: '8px' }}
                      title="Voir Écriture Comptable"
                      onClick={() => alert(`Voir l'écriture comptable pour la vente ${vente.id} (À implémenter)`)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <LFDModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Enregistrer une nouvelle vente">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8, color: "var(--lfd-surface)" }}>Nom du client</label>
            <input type="text" placeholder="Ex: Client Comptoir 3" value={formData.client} onChange={(e) => setFormData({...formData, client: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8, color: "var(--lfd-surface)" }}>Montant total (FCFA)</label>
              <input type="number" required value={formData.montant} onChange={(e) => setFormData({...formData, montant: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", outline: "none" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8, color: "var(--lfd-surface)" }}>Nombre d'articles</label>
              <input type="number" min="1" value={formData.articles} onChange={(e) => setFormData({...formData, articles: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", outline: "none" }} />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8, color: "var(--lfd-surface)" }}>Statut</label>
            <select value={formData.statut} onChange={(e) => setFormData({...formData, statut: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", outline: "none" }}>
              <option value="Paye">Payé</option>
              <option value="A credit">À crédit</option>
            </select>
          </div>
          <button type="submit" style={{ marginTop: 10, padding: "12px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
            <ShoppingBag size={18} /> Valider la Vente
          </button>
        </form>
      </LFDModal>
    </div>
  );
};
export default Ventes;

