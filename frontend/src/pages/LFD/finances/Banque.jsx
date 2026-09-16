import React, { useState } from "react";
import { Search, Filter, Landmark, UploadCloud, CheckCircle } from "lucide-react";
import { formatFCFA } from "../mockDataPhase2";
import { useLFDData } from "../../../contexts/LFDDataContext";
import LFDModal from "../../../components/LFD/LFDModal";

const Banque = () => {
  const { banque, setBanque } = useLFDData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ libelle: "", montant: "", type: "Crédit" });

  const soldePrincipal = 45650000 + banque.filter(m => m.type === "Crédit" && m.statut === "Validé").reduce((sum, m) => sum + m.montant, 0) - banque.filter(m => m.type === "Débit" && m.statut === "Validé").reduce((sum, m) => sum + m.montant, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setBanque([{
      id: `B-00${banque.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      libelle: formData.libelle,
      type: formData.type,
      montant: Number(formData.montant),
      statut: "En attente"
    }, ...banque]);
    setIsModalOpen(false);
    setFormData({ libelle: "", montant: "", type: "Crédit" });
  };

  const validerOperation = (id) => {
    setBanque(banque.map(m => m.id === id ? { ...m, statut: "Validé" } : m));
  };

  return (
    <div className="lfd-page" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--lfd-surface)" }}>Comptes Bancaires</h1>
          <p style={{ color: "var(--lfd-text-dim)", fontSize: "0.9rem" }}>Suivez le solde bancaire et validez les virements.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="lfd-btn lfd-btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>
          <UploadCloud size={18} /> Soumettre Reçu / Virement
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "24px" }}>
        <div style={{ background: "linear-gradient(135deg, var(--lfd-primary), var(--lfd-accent))", padding: "24px", borderRadius: "16px", color: "white", boxShadow: "0 10px 30px rgba(15,52,96,0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, opacity: 0.8 }}>Solde Bancaire Actuel</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: 4 }}>{formatFCFA(soldePrincipal)}</div>
            </div>
            <div style={{ width: 48, height: 48, background: "rgba(255,255,255,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><Landmark size={24} /></div>
          </div>
          <div style={{ fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 8, opacity: 0.9 }}>
             Compte ECOBANK : SN012 01234 000000123456 89
          </div>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(26,26,46,0.05)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--lfd-surface-3)", color: "var(--lfd-text-muted)", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Date</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Libellé / Référence</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Type</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Montant</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Statut</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {banque.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes((searchTerm || '').toLowerCase()))).map((mouv) => (
                <tr key={mouv.id} style={{ borderBottom: "1px solid var(--lfd-content-bg)" }}>
                  <td style={{ padding: "12px 16px", color: "var(--lfd-text-dim)" }}>{mouv.date}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 500, color: "var(--lfd-surface)" }}>{mouv.libelle}</td>
                  <td style={{ padding: "12px 16px" }}>{mouv.type}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: mouv.type === "Crédit" ? "#10B981" : "var(--lfd-surface)" }}>
                    {mouv.type === "Crédit" ? "+" : "-"}{formatFCFA(mouv.montant)}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: mouv.statut === "Validé" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", color: mouv.statut === "Validé" ? "#059669" : "#D97706" }}>
                      {mouv.statut}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    {mouv.statut === "En attente" ? (
                      <button onClick={() => validerOperation(mouv.id)} style={{ background: "rgba(16,185,129,0.1)", border: "none", cursor: "pointer", color: "#059669", padding: "6px 12px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: "0.8rem" }}>
                        <CheckCircle size={14} /> Valider
                      </button>
                    ) : (
                      <span style={{ color: "var(--lfd-text-muted)", fontSize: "0.8rem" }}>Traité</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <LFDModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Soumettre un mouvement bancaire">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Nature de l'opération</label>
            <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }}>
              <option value="Crédit">Crédit (Virement reçu, dépôt espèces)</option>
              <option value="Débit">Débit (Virement émis, frais, chèque tiré)</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Libellé complet</label>
            <input type="text" required value={formData.libelle} onChange={(e) => setFormData({...formData, libelle: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Montant exact (FCFA)</label>
            <input type="number" required min="1" value={formData.montant} onChange={(e) => setFormData({...formData, montant: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Preuve / Reçu PDF (Optionnel)</label>
            <input type="file" accept=".pdf,image/*" style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px dashed var(--lfd-surface-3)", background: "var(--lfd-content-bg)" }} />
          </div>
          <button type="submit" style={{ marginTop: 10, padding: "12px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
            Soumettre pour validation
          </button>
        </form>
      </LFDModal>
    </div>
  );
};
export default Banque;

