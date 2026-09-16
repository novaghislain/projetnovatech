import React, { useState } from "react";
import { Search, Filter, Plus, UserCog, Mail, Phone, Edit2, ShieldAlert } from "lucide-react";
import { useLFDData } from "../../../contexts/LFDDataContext";
import LFDModal from "../../../components/LFD/LFDModal";

const Employes = () => {
  const { employes, setEmployes } = useLFDData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nom: "", poste: "", departement: "Vente", email: "", role: "Vendeur" });

  const activeEmployees = employes.filter(e => e.statut === "Actif").length;

  const handleSubmit = (e) => {
    e.preventDefault();
    setEmployes([{
      id: `EMP-00${employes.length + 1}`,
      nom: formData.nom,
      poste: formData.poste,
      departement: formData.departement,
      email: formData.email,
      role: formData.role,
      statut: "Actif"
    }, ...employes]);
    setIsModalOpen(false);
    setFormData({ nom: "", poste: "", departement: "Vente", email: "", role: "Vendeur" });
  };

  const suspendre = (id) => {
    setEmployes(employes.map(e => e.id === id ? { ...e, statut: "Suspendu" } : e));
  }

  return (
    <div className="lfd-page" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--lfd-surface)" }}>Employés & Accès</h1>
          <p style={{ color: "var(--lfd-text-dim)", fontSize: "0.9rem" }}>Gérez les utilisateurs de la plateforme LFD et leurs permissions.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="lfd-btn lfd-btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>
          <Plus size={18} /> Ajouter un employé
        </button>
      </div>

      <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(26,26,46,0.05)" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
            <Search size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--lfd-text-muted)" }} />
            <input type="text" placeholder="Rechercher un employé..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "100%", padding: "10px 10px 10px 38px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", outline: "none" }} />
          </div>
          <div style={{ marginLeft: "auto", fontSize: "0.9rem", color: "var(--lfd-text-dim)", fontWeight: 600 }}>
            {activeEmployees} employés actifs
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--lfd-surface-3)", color: "var(--lfd-text-muted)", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Employé</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Poste / Département</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Rôle Système</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Statut</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employes.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes((searchTerm || '').toLowerCase()))).map((emp) => (
                <tr key={emp.id} style={{ borderBottom: "1px solid var(--lfd-content-bg)" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--lfd-surface)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--lfd-surface-3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--lfd-text-muted)", fontWeight: 700, fontSize: "1.1rem" }}>
                        {emp.nom.charAt(0)}
                      </div>
                      <div>
                        <div style={{ color: "var(--lfd-surface)" }}>{emp.nom}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--lfd-text-dim)", display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                          <Mail size={12} /> {emp.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--lfd-text-dim)" }}>
                    <div style={{ fontWeight: 500, color: "var(--lfd-surface)", marginBottom: 4 }}>{emp.poste}</div>
                    <div style={{ fontSize: "0.8rem" }}>{emp.departement}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: "rgba(15, 52, 96, 0.1)", color: "var(--lfd-accent)" }}>
                      {emp.role}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: emp.statut === "Actif" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: emp.statut === "Actif" ? "#059669" : "#EF4444" }}>
                      {emp.statut}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--lfd-text-muted)", marginRight: 12 }} title="Modifier"><Edit2 size={18} /></button>
                    {emp.statut === "Actif" && (
                      <button onClick={() => suspendre(emp.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#EF4444" }} title="Suspendre l'accès"><ShieldAlert size={18} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <LFDModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Créer un compte employé">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Nom complet</label>
            <input type="text" required value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Adresse Email</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Département</label>
              <select value={formData.departement} onChange={(e) => setFormData({...formData, departement: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }}>
                <option value="Direction">Direction</option>
                <option value="Vente">Vente / Commercial</option>
                <option value="Comptabilité">Comptabilité</option>
                <option value="Logistique">Logistique</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Titre du Poste</label>
              <input type="text" required value={formData.poste} onChange={(e) => setFormData({...formData, poste: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Rôle Système LFD (Permissions)</label>
            <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }}>
              <option value="Administrateur">Administrateur (Accès Total)</option>
              <option value="Comptable">Comptable (Finances, Facturation)</option>
              <option value="Vendeur">Vendeur (Ventes Uniquement)</option>
              <option value="Magasinier">Magasinier (Stocks, Commandes)</option>
            </select>
          </div>
          <button type="submit" style={{ marginTop: 10, padding: "12px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
            <UserCog size={18} /> Créer le compte
          </button>
        </form>
      </LFDModal>
    </div>
  );
};
export default Employes;

