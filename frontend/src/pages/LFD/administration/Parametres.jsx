import React, { useState } from "react";
import { Save, Building, MapPin, Phone, Mail, FileText, CheckCircle2 } from "lucide-react";

const Parametres = () => {
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="lfd-page" style={{ padding: "20px", maxWidth: "800px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--lfd-surface)" }}>Paramètres de l'entreprise</h1>
        <p style={{ color: "var(--lfd-text-dim)", fontSize: "0.9rem" }}>Configurez les informations globales utilisées sur les factures et documents LFD.</p>
      </div>

      {saved && (
        <div style={{ background: "#10B981", color: "white", padding: 12, borderRadius: 8, marginBottom: 20, display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
          <CheckCircle2 size={20} /> Paramètres sauvegardés avec succès !
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 10px rgba(26,26,46,0.05)", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--lfd-surface)", marginBottom: "20px", display: "flex", alignItems: "center", gap: 8 }}>
            <Building size={20} color="var(--lfd-accent)" /> Identité de l'entreprise
          </h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "var(--lfd-text-dim)", marginBottom: 8 }}>Nom de l'entreprise</label>
              <input type="text" defaultValue="La Foi Distribution" style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", outline: "none", fontWeight: 500 }} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "var(--lfd-text-dim)", marginBottom: 8 }}>Activité / Slogan</label>
              <input type="text" defaultValue="Vente en gros et détail de produits divers" style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", outline: "none" }} />
            </div>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 10px rgba(26,26,46,0.05)", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--lfd-surface)", marginBottom: "20px", display: "flex", alignItems: "center", gap: 8 }}>
            <FileText size={20} color="var(--lfd-accent)" /> Informations Légales & Fiscales
          </h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "var(--lfd-text-dim)", marginBottom: 8 }}>NINEA</label>
              <input type="text" defaultValue="0001234567" style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", outline: "none" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "var(--lfd-text-dim)", marginBottom: 8 }}>Registre de Commerce (RC)</label>
              <input type="text" defaultValue="SN-DKR-2020-B-1234" style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", outline: "none" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "var(--lfd-text-dim)", marginBottom: 8 }}>Taux de TVA par défaut (%)</label>
              <input type="number" defaultValue="18" style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", outline: "none" }} />
            </div>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 10px rgba(26,26,46,0.05)", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--lfd-surface)", marginBottom: "20px", display: "flex", alignItems: "center", gap: 8 }}>
            <MapPin size={20} color="var(--lfd-accent)" /> Coordonnées & Contact
          </h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "var(--lfd-text-dim)", marginBottom: 8 }}>Adresse complète</label>
              <input type="text" defaultValue="Avenue Cheikh Anta Diop, Dakar, Sénégal" style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", outline: "none" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "var(--lfd-text-dim)", marginBottom: 8 }}>Téléphone Principal</label>
              <input type="text" defaultValue="+221 33 800 00 00" style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", outline: "none" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "var(--lfd-text-dim)", marginBottom: 8 }}>Adresse Email Contact</label>
              <input type="email" defaultValue="contact@lafoidistribution.sn" style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", outline: "none" }} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="lfd-btn lfd-btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>
            <Save size={18} /> Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
};
export default Parametres;

