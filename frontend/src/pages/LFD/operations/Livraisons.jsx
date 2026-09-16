import React, { useState } from "react";
import { Search, MapPin, Truck, CheckCircle } from "lucide-react";
import { useLFDData } from "../../../contexts/LFDDataContext";
import LFDModal from "../../../components/LFD/LFDModal";

const Livraisons = () => {
  const { livraisons, setLivraisons } = useLFDData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLivraison, setSelectedLivraison] = useState(null);
  const [chauffeur, setChauffeur] = useState("");

  const handleOpenAssign = (liv) => {
    setSelectedLivraison(liv);
    setIsModalOpen(true);
  };

  const handleAssign = (e) => {
    e.preventDefault();
    if (selectedLivraison) {
      setLivraisons(livraisons.map(l => l.id === selectedLivraison.id ? { ...l, chauffeur: chauffeur, statut: "En transit" } : l));
      setIsModalOpen(false);
      setSelectedLivraison(null);
      setChauffeur("");
    }
  };

  const handleComplete = (id) => {
    setLivraisons(livraisons.map(l => l.id === id ? { ...l, statut: "Livre" } : l));
  };

  return (
    <div className="lfd-page" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--lfd-surface)" }}>Expéditions & Livraisons</h1>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(26,26,46,0.05)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--lfd-surface-3)", color: "var(--lfd-text-muted)", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Référence Vente</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Client</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Adresse</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Chauffeur / Véhicule</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Statut</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {livraisons.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes((searchTerm || '').toLowerCase()))).map((liv) => (
                <tr key={liv.id} style={{ borderBottom: "1px solid var(--lfd-content-bg)" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--lfd-surface)" }}>{liv.id}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>{liv.client}</td>
                  <td style={{ padding: "12px 16px", color: "var(--lfd-text-dim)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <MapPin size={14} color="var(--lfd-accent)" /> {liv.adresse}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>{liv.chauffeur}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: liv.statut === "Livre" ? "rgba(16,185,129,0.1)" : liv.statut === "En transit" ? "rgba(14,165,233,0.1)" : "rgba(245,158,11,0.1)", color: liv.statut === "Livre" ? "#059669" : liv.statut === "En transit" ? "#0284C7" : "#D97706" }}>
                      {liv.statut}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    {liv.statut === "En attente" && (
                      <button onClick={() => handleOpenAssign(liv)} style={{ background: "transparent", border: "1px solid var(--lfd-accent)", cursor: "pointer", color: "var(--lfd-accent)", padding: "6px 12px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: "0.8rem" }}>
                        Assigner
                      </button>
                    )}
                    {liv.statut === "En transit" && (
                      <button onClick={() => handleComplete(liv.id)} style={{ background: "rgba(16,185,129,0.1)", border: "none", cursor: "pointer", color: "#059669", padding: "6px 12px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: "0.8rem" }}>
                        <CheckCircle size={14} /> Confirmer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <LFDModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assigner un chauffeur">
        <form onSubmit={handleAssign} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Chauffeur</label>
            <select required value={chauffeur} onChange={(e) => setChauffeur(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }}>
              <option value="">Sélectionnez un chauffeur...</option>
              <option value="Mamadou Diop (Camion A)">Mamadou Diop (Camion A)</option>
              <option value="Ibrahima Fall (Camion B)">Ibrahima Fall (Camion B)</option>
            </select>
          </div>
          <button type="submit" style={{ marginTop: 10, padding: "12px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
            <Truck size={18} /> Lancer l'expédition
          </button>
        </form>
      </LFDModal>
    </div>
  );
};
export default Livraisons;

