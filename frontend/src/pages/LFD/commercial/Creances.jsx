import React, { useState } from "react";
import { Search, Filter, Phone, ArrowRight } from "lucide-react";
import { formatFCFA } from "../mockDataPhase2";
import { useLFDData } from "../../../contexts/LFDDataContext";
import LFDModal from "../../../components/LFD/LFDModal";

const Creances = () => {
  const { creances, setCreances, setCaisse, caisse } = useLFDData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCreance, setSelectedCreance] = useState(null);
  const [montantPaye, setMontantPaye] = useState("");

  const handleOpenPaiement = (c) => {
    setSelectedCreance(c);
    setMontantPaye(c.montant);
    setIsModalOpen(true);
  };

  const handlePaiement = (e) => {
    e.preventDefault();
    if (!selectedCreance) return;
    
    // Mettre à jour la créance (on la retire pour simplifier, ou on réduit le montant)
    const newMontant = selectedCreance.montant - Number(montantPaye);
    if (newMontant <= 0) {
      setCreances(creances.filter(c => c.id !== selectedCreance.id));
    } else {
      setCreances(creances.map(c => c.id === selectedCreance.id ? { ...c, montant: newMontant } : c));
    }

    // Ajouter l'entrée dans la caisse
    setCaisse([{
      id: `TRX-00${caisse.length + 1}`,
      heure: new Date().toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' }),
      motif: `Paiement Créance ${selectedCreance.id} (${selectedCreance.client})`,
      type: "Entrée",
      montant: Number(montantPaye),
      operateur: "Current User"
    }, ...caisse]);

    setIsModalOpen(false);
    setSelectedCreance(null);
  };

  return (
    <div className="lfd-page" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--lfd-surface)" }}>Créances & Dettes</h1>
          <p style={{ color: "var(--lfd-text-dim)", fontSize: "0.9rem" }}>Suivez les dettes clients et gérez les encaissements.</p>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(26,26,46,0.05)" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
            <Search size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--lfd-text-muted)" }} />
            <input type="text" placeholder="Rechercher une créance..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "100%", padding: "10px 10px 10px 38px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", outline: "none" }} />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--lfd-surface-3)", color: "var(--lfd-text-muted)", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Facture</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Client</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Montant Dû</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Échéance</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Statut</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {creances.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes((searchTerm || '').toLowerCase()))).map((creance) => (
                <tr key={creance.id} style={{ borderBottom: "1px solid var(--lfd-content-bg)" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--lfd-surface)" }}>{creance.facture}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>{creance.client}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 700 }}>{formatFCFA(creance.montant)}</td>
                  <td style={{ padding: "12px 16px", color: "var(--lfd-text-dim)" }}>
                    <div>{creance.echeance}</div>
                    {creance.joursRetard > 0 && <div style={{ fontSize: "0.75rem", color: "#EF4444", fontWeight: 600 }}>{creance.joursRetard}j de retard</div>}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: creance.statut === "En retard" ? "rgba(239,68,68,0.1)" : "rgba(148,163,184,0.1)", color: creance.statut === "En retard" ? "#EF4444" : "#64748B" }}>
                      {creance.statut}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--lfd-text-muted)", marginRight: 8 }} title="Contacter"><Phone size={18} /></button>
                    <button onClick={() => handleOpenPaiement(creance)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#10B981", fontWeight: 600, fontSize: "0.85rem" }}>
                      Encaisser
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <LFDModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Enregistrer un Paiement">
        {selectedCreance && (
          <form onSubmit={handlePaiement} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ padding: 16, background: "var(--lfd-content-bg)", borderRadius: 8 }}>
              <p style={{ margin: "0 0 8px 0", fontSize: "0.9rem", color: "var(--lfd-text-dim)" }}>Facture : <strong>{selectedCreance.facture}</strong></p>
              <p style={{ margin: "0 0 8px 0", fontSize: "0.9rem", color: "var(--lfd-text-dim)" }}>Client : <strong>{selectedCreance.client}</strong></p>
              <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "var(--lfd-surface)" }}>Reste dû : {formatFCFA(selectedCreance.montant)}</p>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Montant versé (FCFA)</label>
              <input type="number" max={selectedCreance.montant} required value={montantPaye} onChange={(e) => setMontantPaye(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
            </div>
            <button type="submit" style={{ marginTop: 10, padding: "12px", borderRadius: 8, background: "#10B981", color: "white", border: "none", fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
              Valider l'encaissement
            </button>
          </form>
        )}
      </LFDModal>
    </div>
  );
};
export default Creances;

