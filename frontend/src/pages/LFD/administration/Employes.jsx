import { API_URL } from '../../../config';
import React, { useState, useEffect } from "react";
import { Search, Filter, Plus, UserCog, Mail, Phone, Edit2, ShieldAlert, KeyRound, CheckCircle2 } from "lucide-react";
import { useLFDAuth } from "../../../contexts/LFDAuthContext";
import LFDModal from "../../../components/LFD/LFDModal";
import axios from "axios";

const Employes = () => {
  const { lfdToken } = useLFDAuth();
  const [employes, setEmployes] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", phone: "", role_id: "", password: "" });
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchData();
  }, [lfdToken]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/lfd/employees`, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      setEmployes(res.data.employes);
      setRoles(res.data.roles);
      if (res.data.roles && res.data.roles.length > 0) {
        setFormData(prev => ({ ...prev, role_id: res.data.roles[0].id }));
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des employés.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/lfd/employees`, formData, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      setSuccess("Employé créé avec succès !");
      setIsCreateModalOpen(false);
      setFormData({ firstName: "", lastName: "", email: "", phone: "", role_id: roles[0]?.id || "", password: "" });
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la création.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
      await axios.put(`${API_URL}/api/lfd/employees/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la modification du statut.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/lfd/employees/${selectedEmpId}/password`, { newPassword }, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      setSuccess("Mot de passe modifié avec succès !");
      setIsPasswordModalOpen(false);
      setNewPassword("");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors du changement de mot de passe.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const activeEmployees = employes.filter(e => e.status === "ACTIVE").length;

  return (
    <div className="lfd-page" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--lfd-surface)" }}>Employés & Accès</h1>
          <p style={{ color: "var(--lfd-text-dim)", fontSize: "0.9rem" }}>Gérez les utilisateurs de la plateforme LFD et leurs permissions.</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="lfd-btn lfd-btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>
          <Plus size={18} /> Ajouter un employé
        </button>
      </div>

      {error && <div className="lfd-alert lfd-alert-danger" style={{ marginBottom: 20 }}>{error}</div>}
      {success && <div className="lfd-alert" style={{ background: "rgba(16,185,129,0.1)", color: "#059669", padding: 12, borderRadius: 8, marginBottom: 20, display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}><CheckCircle2 size={18} /> {success}</div>}

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
          {loading ? (
            <div className="lfd-loading">Chargement des employés...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--lfd-surface-3)", color: "var(--lfd-text-muted)", textAlign: "left" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Employé</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Contact</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Rôle Système</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Statut</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employes.filter(item => (item.firstName + " " + item.lastName + " " + item.email + " " + item.role_name).toLowerCase().includes(searchTerm.toLowerCase())).map((emp) => (
                  <tr key={emp.id} style={{ borderBottom: "1px solid var(--lfd-content-bg)" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--lfd-surface)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--lfd-surface-3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--lfd-text-muted)", fontWeight: 700, fontSize: "1.1rem" }}>
                          {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ color: "var(--lfd-surface)" }}>{emp.firstName} {emp.lastName}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--lfd-text-dim)", display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                            {emp.employee_code}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--lfd-text-dim)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}><Mail size={12} /> {emp.email}</div>
                      {emp.phone && <div style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 4 }}><Phone size={12} /> {emp.phone}</div>}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: "rgba(15, 52, 96, 0.1)", color: "var(--lfd-accent)" }}>
                        {emp.role_name}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: emp.status === "ACTIVE" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: emp.status === "ACTIVE" ? "#059669" : "#EF4444" }}>
                        {emp.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button onClick={() => { setSelectedEmpId(emp.id); setIsPasswordModalOpen(true); }} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--lfd-accent)", marginRight: 12 }} title="Changer le mot de passe"><KeyRound size={18} /></button>
                      <button onClick={() => toggleStatus(emp.id, emp.status)} style={{ background: "transparent", border: "none", cursor: "pointer", color: emp.status === "ACTIVE" ? "#EF4444" : "#10B981" }} title={emp.status === "ACTIVE" ? "Suspendre l'accès" : "Réactiver l'accès"}>
                        <ShieldAlert size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Création Employé */}
      <LFDModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Créer un compte employé">
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16, padding: 10 }}>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label className="lfd-label">Prénom *</label>
              <input type="text" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="lfd-input" style={{ paddingLeft: 10 }} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="lfd-label">Nom *</label>
              <input type="text" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="lfd-input" style={{ paddingLeft: 10 }} />
            </div>
          </div>
          <div>
            <label className="lfd-label">Adresse Email *</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="lfd-input" style={{ paddingLeft: 10 }} />
          </div>
          <div>
            <label className="lfd-label">Téléphone (Optionnel)</label>
            <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="lfd-input" style={{ paddingLeft: 10 }} />
          </div>
          <div>
            <label className="lfd-label">Rôle Système LFD (Permissions) *</label>
            <select required value={formData.role_id} onChange={(e) => setFormData({...formData, role_id: e.target.value})} className="lfd-input" style={{ paddingLeft: 10 }}>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="lfd-label">Mot de passe provisoire *</label>
            <input type="text" required minLength="6" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="lfd-input" style={{ paddingLeft: 10 }} placeholder="Min. 6 caractères" />
          </div>
          <button type="submit" className="lfd-btn lfd-btn-primary" style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
            <UserCog size={18} /> Créer le compte
          </button>
        </form>
      </LFDModal>

      {/* Modal Changement Mot de Passe */}
      <LFDModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="Modifier le mot de passe">
        <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 16, padding: 10 }}>
          <div style={{ background: "rgba(245, 158, 11, 0.1)", color: "#B45309", padding: "12px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 500 }}>
            Attention, vous êtes sur le point de forcer un nouveau mot de passe pour cet utilisateur. Il devra l'utiliser à sa prochaine connexion.
          </div>
          <div>
            <label className="lfd-label">Nouveau mot de passe *</label>
            <input type="text" required minLength="6" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="lfd-input" style={{ paddingLeft: 10 }} placeholder="Saisir un nouveau mot de passe" />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
            <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="lfd-btn lfd-btn-secondary">Annuler</button>
            <button type="submit" className="lfd-btn lfd-btn-primary">Appliquer la modification</button>
          </div>
        </form>
      </LFDModal>
    </div>
  );
};
export default Employes;

