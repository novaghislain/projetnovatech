import React, { useState } from "react";
import { Search, Filter, Plus, User, Edit2, ShieldAlert } from "lucide-react";
import { formatFCFA } from "../mockDataPhase2";
import { useLFDData } from "../../../contexts/LFDDataContext";
import LFDModal from "../../../components/LFD/LFDModal";

const Clients = () => {
  const { clients, addClient, updateClient } = useLFDData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({ nom: "", type: "Gros", contact: "", email: "", totalAchats: 0, soldeDu: 0 });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingClient) {
      updateClient(editingClient.id, {
        nom: formData.nom,
        type: formData.type,
        contact: formData.contact || "-",
        email: formData.email || "-",
        totalAchats: Number(formData.totalAchats) || 0,
        soldeDu: Number(formData.soldeDu) || 0
      });
    } else {
      addClient({
        id: `C-00${clients.length + 1}`,
        nom: formData.nom,
        type: formData.type,
        contact: formData.contact || "-",
        email: formData.email || "-",
        totalAchats: Number(formData.totalAchats) || 0,
        soldeDu: Number(formData.soldeDu) || 0
      });
    }
    handleCloseModal();
  };

  const handleOpenEdit = (client) => {
    setEditingClient(client);
    setFormData({
      nom: client.nom,
      type: client.type,
      contact: client.contact !== "-" ? client.contact : "",
      email: client.email !== "-" ? client.email : "",
      totalAchats: client.totalAchats || 0,
      soldeDu: client.soldeDu || 0
    });
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingClient(null);
    setFormData({ nom: "", type: "Gros", contact: "", email: "", totalAchats: 0, soldeDu: 0 });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    setFormData({ nom: "", type: "Gros", contact: "", email: "", totalAchats: 0, soldeDu: 0 });
  };

  return (
    <div className="lfd-page" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--lfd-surface)" }}>Clients</h1>
          <p style={{ color: "var(--lfd-text-dim)", fontSize: "0.9rem" }}>Gérez votre base de données clients et leur historique.</p>
        </div>
        <button onClick={handleOpenAdd} className="lfd-btn lfd-btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>
          <Plus size={18} /> Ajouter un Client
        </button>
      </div>

      <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(26,26,46,0.05)" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
            <Search size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--lfd-text-muted)" }} />
            <input type="text" placeholder="Rechercher un client..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "100%", padding: "10px 10px 10px 38px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", outline: "none" }} />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--lfd-surface-3)", color: "var(--lfd-text-muted)", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Nom / Entreprise</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Type</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Contact</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Total Achats</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Solde Dû</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes((searchTerm || '').toLowerCase()))).map((client) => (
                <tr key={client.id} style={{ borderBottom: "1px solid var(--lfd-content-bg)" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--lfd-surface)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--lfd-content-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--lfd-accent)" }}><User size={16} /></div>
                      <div>
                        <div>{client.nom}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--lfd-text-dim)", fontWeight: 400 }}>{client.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: client.type === "Gros" ? "rgba(15, 52, 96, 0.1)" : "rgba(148,163,184,0.1)", color: client.type === "Gros" ? "var(--lfd-accent)" : "#64748B" }}>
                      {client.type}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--lfd-text-dim)" }}>
                    <div>{client.contact}</div>
                    <div style={{ fontSize: "0.75rem" }}>{client.email}</div>
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>{formatFCFA(client.totalAchats)}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: client.soldeDu > 0 ? "#EF4444" : "var(--lfd-text-muted)" }}>{formatFCFA(client.soldeDu)}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <button onClick={() => handleOpenEdit(client)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--lfd-text-muted)", marginRight: 8 }} title="Modifier"><Edit2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <LFDModal isOpen={isModalOpen} onClose={handleCloseModal} title={editingClient ? "Modifier un Client" : "Ajouter un Client"}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Nom / Raison sociale</label>
            <input type="text" required value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Type de client</label>
            <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }}>
              <option value="Gros">Grossiste / B2B</option>
              <option value="Détail">Détail</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Téléphone</label>
              <input type="text" value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Total Achats (FCFA)</label>
              <input type="number" value={formData.totalAchats} onChange={(e) => setFormData({...formData, totalAchats: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8, color: "#EF4444" }}>Solde Dû (FCFA)</label>
              <input type="number" value={formData.soldeDu} onChange={(e) => setFormData({...formData, soldeDu: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #EF4444", outlineColor: "#EF4444" }} />
            </div>
          </div>
          <button type="submit" style={{ marginTop: 10, padding: "12px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
            <User size={18} /> Sauvegarder
          </button>
        </form>
      </LFDModal>
    </div>
  );
};
export default Clients;

