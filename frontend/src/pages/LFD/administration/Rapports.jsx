import React, { useState } from "react";
import { Download, FileText, BarChart3, TrendingUp, Calendar, Filter } from "lucide-react";
import LFDModal from "../../../components/LFD/LFDModal";

const Rapports = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState("");

  const handleExport = (type) => {
    setExportType(type);
    setIsExporting(true);
        setTimeout(() => {
      setIsExporting(false);
      const element = document.createElement("a");
      const file = new Blob(["Document généré par La Foi Distribution (Mock).\nCeci est un fichier de démonstration pour : " + type], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = type.replace(/[^a-z0-9]/gi, '_').toLowerCase() + ".txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1500);
  };

  return (
    <div className="lfd-page" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--lfd-surface)" }}>Rapports & Statistiques</h1>
          <p style={{ color: "var(--lfd-text-dim)", fontSize: "0.9rem" }}>Générez des rapports détaillés sur l'activité de l'entreprise.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", background: "white", color: "var(--lfd-surface)", cursor: "pointer", fontWeight: 600 }}>
            <Calendar size={18} /> Ce mois-ci
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", background: "white", color: "var(--lfd-surface)", cursor: "pointer", fontWeight: 600 }}>
            <Filter size={18} /> Filtres
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
        
        {/* Rapport des Ventes */}
        <div style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 10px rgba(26,26,46,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(15, 52, 96, 0.1)", color: "var(--lfd-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={20} />
            </div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--lfd-surface)", margin: 0 }}>Rapport des Ventes</h2>
          </div>
          <p style={{ color: "var(--lfd-text-dim)", fontSize: "0.9rem", marginBottom: 24, minHeight: 40 }}>
            Analyse détaillée du chiffre d'affaires, des produits les plus vendus et des performances commerciales.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => handleExport("Rapport des Ventes (PDF)")} className="lfd-btn lfd-btn-primary" style={{ flex: 1, padding: "10px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
              <FileText size={16} /> PDF
            </button>
            <button onClick={() => handleExport("Rapport des Ventes (Excel)")} style={{ flex: 1, padding: "10px", borderRadius: 8, background: "#10B981", color: "white", border: "none", fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
              <Download size={16} /> Excel
            </button>
          </div>
        </div>

        {/* Rapport Financier */}
        <div style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 10px rgba(26,26,46,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(16, 185, 129, 0.1)", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BarChart3 size={20} />
            </div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--lfd-surface)", margin: 0 }}>Rapport Financier</h2>
          </div>
          <p style={{ color: "var(--lfd-text-dim)", fontSize: "0.9rem", marginBottom: 24, minHeight: 40 }}>
            Bilan des encaissements, décaissements, créances clients et dettes fournisseurs.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => handleExport("Rapport Financier (PDF)")} className="lfd-btn lfd-btn-primary" style={{ flex: 1, padding: "10px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
              <FileText size={16} /> PDF
            </button>
            <button onClick={() => handleExport("Rapport Financier (Excel)")} style={{ flex: 1, padding: "10px", borderRadius: 8, background: "#10B981", color: "white", border: "none", fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
              <Download size={16} /> Excel
            </button>
          </div>
        </div>

      </div>

      <LFDModal isOpen={isExporting} onClose={() => {}} title="Génération du rapport...">
        <div style={{ textAlign: "center", padding: "20px" }}>
          <div className="lfd-spinner" style={{ margin: "0 auto 20px auto", width: 40, height: 40, border: "4px solid var(--lfd-surface-3)", borderTopColor: "var(--lfd-accent)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <p style={{ fontWeight: 600, color: "var(--lfd-surface)" }}>Création de : {exportType}</p>
          <p style={{ fontSize: "0.9rem", color: "var(--lfd-text-dim)" }}>Calcul des statistiques en cours...</p>
        </div>
      </LFDModal>
    </div>
  );
};
export default Rapports;


