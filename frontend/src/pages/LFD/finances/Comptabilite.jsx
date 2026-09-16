import React from "react";
import { Download, FileText, BarChart3, TrendingUp } from "lucide-react";
import LFDModal from "../../../components/LFD/LFDModal";

const Comptabilite = () => {
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportType, setExportType] = React.useState("");

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
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--lfd-surface)" }}>Synthèse Comptable</h1>
          <p style={{ color: "var(--lfd-text-dim)", fontSize: "0.9rem" }}>Aperçu financier et exports pour l'expert-comptable.</p>
        </div>
        <button onClick={() => handleExport("Grand Livre")} className="lfd-btn lfd-btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>
          <FileText size={18} /> Exporter Grand Livre
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        {/* CA Card */}
        <div style={{ background: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid var(--lfd-surface-3)", display: "flex", flexDirection: "column", gap: 16, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: "#3B82F6" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ color: "var(--lfd-text-muted)", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Chiffre d'Affaires Mensuel</div>
            <div style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3B82F6", padding: "10px", borderRadius: "12px" }}><TrendingUp size={20} /></div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--lfd-surface)", letterSpacing: "-0.5px" }}>38 750 000 <span style={{ fontSize: "1rem", color: "var(--lfd-text-muted)" }}>FCFA</span></div>
        </div>

        {/* Charges Card */}
        <div style={{ background: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid var(--lfd-surface-3)", display: "flex", flexDirection: "column", gap: 16, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: "#EF4444" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ color: "var(--lfd-text-muted)", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Charges (Achats, Frais)</div>
            <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#EF4444", padding: "10px", borderRadius: "12px" }}><FileText size={20} /></div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 900, color: "#EF4444", letterSpacing: "-0.5px" }}>24 300 000 <span style={{ fontSize: "1rem", color: "var(--lfd-text-muted)" }}>FCFA</span></div>
        </div>

        {/* Marge Card */}
        <div style={{ background: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid var(--lfd-surface-3)", display: "flex", flexDirection: "column", gap: 16, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: "#10B981" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ color: "var(--lfd-text-muted)", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Marge Brute (Estimée)</div>
            <div style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10B981", padding: "10px", borderRadius: "12px" }}><BarChart3 size={20} /></div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 900, color: "#10B981", letterSpacing: "-0.5px" }}>14 450 000 <span style={{ fontSize: "1rem", color: "var(--lfd-text-muted)" }}>FCFA</span></div>
        </div>
      </div>

      <div style={{ background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)", borderRadius: "16px", padding: "40px 20px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid var(--lfd-surface-3)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, background: "rgba(15, 52, 96, 0.05)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--lfd-accent)", marginBottom: 16 }}>
           <FileText size={32} />
        </div>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--lfd-surface)", marginBottom: 12 }}>Clôture Mensuelle & Exports</h2>
        <p style={{ color: "var(--lfd-text-dim)", fontSize: "1rem", maxWidth: 600, margin: "0 auto 32px auto", lineHeight: 1.6 }}>
          Générez les journaux (Ventes, Achats, Caisse, Banque, Opérations Diverses) pour le mois précédent afin de les transmettre rapidement à votre cabinet comptable.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => handleExport("Balance Générale (PDF)")} className="lfd-btn lfd-btn-secondary" style={{ background: "white", border: "1px solid var(--lfd-surface-3)", color: "var(--lfd-surface)", padding: "12px 24px", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
            <Download size={18} /> Balance Générale (PDF)
          </button>
          <button onClick={() => handleExport("Fichier FEC (CSV)")} className="lfd-btn lfd-btn-primary" style={{ background: "var(--lfd-accent)", border: "none", color: "white", padding: "12px 24px", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(15, 52, 96, 0.2)" }}>
            <FileText size={18} /> Fichier FEC (CSV)
          </button>
        </div>
      </div>

      <LFDModal isOpen={isExporting} onClose={() => {}} title="Génération en cours">
        <div style={{ textAlign: "center", padding: "32px 20px" }}>
          <div className="lfd-spinner" style={{ margin: "0 auto 20px auto", width: 40, height: 40, borderWidth: 3, borderColor: "var(--lfd-accent) transparent var(--lfd-accent) transparent" }} />
          <h3 style={{ margin: "0 0 8px 0", fontSize: "1.2rem", color: "var(--lfd-surface)" }}>Préparation du document</h3>
          <p style={{ fontSize: "0.95rem", color: "var(--lfd-text-dim)" }}>Génération de <strong>{exportType}</strong> en cours, veuillez patienter...</p>
        </div>
      </LFDModal>
    </div>
  );
};
export default Comptabilite;



