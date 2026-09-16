import React, { useState } from "react";
import { Save, Building, MapPin, FileText, CheckCircle2, Lock, KeyRound } from "lucide-react";
import { useLFDAuth } from "../../../contexts/LFDAuthContext";
import axios from "axios";

const Parametres = () => {
  const { lfdToken, setLfdToken, user } = useLFDAuth();
  const [saved, setSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [error, setError] = useState(null);
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError(null);
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    try {
      await axios.put("http://localhost:5001/api/lfd/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      setPasswordSaved(true);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors du changement de mot de passe.");
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="lfd-page" style={{ padding: "20px", maxWidth: "800px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--lfd-surface)" }}>Paramètres de l'entreprise & Sécurité</h1>
        <p style={{ color: "var(--lfd-text-dim)", fontSize: "0.9rem" }}>Configurez les informations globales et gérez la sécurité de votre compte.</p>
      </div>

      {saved && (
        <div style={{ background: "#10B981", color: "white", padding: 12, borderRadius: 8, marginBottom: 20, display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
          <CheckCircle2 size={20} /> Paramètres sauvegardés avec succès !
        </div>
      )}

      {error && <div className="lfd-alert lfd-alert-danger" style={{ marginBottom: 20 }}>{error}</div>}
      {passwordSaved && <div className="lfd-alert" style={{ background: "rgba(16,185,129,0.1)", color: "#059669", padding: 12, borderRadius: 8, marginBottom: 20, display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}><CheckCircle2 size={18} /> Mot de passe modifié avec succès !</div>}

      <form onSubmit={handlePasswordChange} style={{ marginBottom: "24px" }}>
        <div style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 10px rgba(26,26,46,0.05)" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--lfd-surface)", marginBottom: "20px", display: "flex", alignItems: "center", gap: 8 }}>
            <Lock size={20} color="var(--lfd-accent)" /> Sécurité et Mot de passe
          </h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px", maxWidth: "500px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "var(--lfd-text-dim)", marginBottom: 8 }}>Mot de passe actuel</label>
              <input type="password" required value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", outline: "none" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "var(--lfd-text-dim)", marginBottom: 8 }}>Nouveau mot de passe</label>
              <input type="password" required minLength={6} value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", outline: "none" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "var(--lfd-text-dim)", marginBottom: 8 }}>Confirmer le nouveau mot de passe</label>
              <input type="password" required minLength={6} value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", outline: "none" }} />
            </div>
            <div>
              <button type="submit" className="lfd-btn lfd-btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>
                <KeyRound size={18} /> Modifier mon mot de passe
              </button>
            </div>
          </div>
        </div>
      </form>

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

