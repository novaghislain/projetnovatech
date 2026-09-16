import React, { useState, useEffect } from "react";
import { Search, Plus, Edit2, Building2, Phone, Mail, AlertTriangle } from "lucide-react";
import LFDModal from "../../../components/LFD/LFDModal";
import { useLFDAuth } from "../../../contexts/LFDAuthContext";
import axios from "axios";

// Helper function to format FCFA, normally in a utils file
const formatFCFA = (amount) => {
  if (amount === undefined || amount === null) return "0 FCFA";
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
};

const Fournisseurs = () => {
  const { lfdToken, hasPermission } = useLFDAuth();
  const [fournisseurs, setFournisseurs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFournisseur, setEditingFournisseur] = useState(null);
  const [formData, setFormData] = useState({ name: "", contact_name: "", phone: "", email: "", address: "" });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // States for supplier details modal
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsData, setDetailsData] = useState(null);

  const fetchFournisseurs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5001/api/lfd/suppliers", {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      setFournisseurs(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les fournisseurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFournisseurs();
  }, [lfdToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    try {
      if (editingFournisseur) {
        await axios.put(`http://localhost:5001/api/lfd/suppliers/${editingFournisseur.id}`, formData, {
          headers: { Authorization: `Bearer ${lfdToken}` }
        });
      } else {
        await axios.post("http://localhost:5001/api/lfd/suppliers", formData, {
          headers: { Authorization: `Bearer ${lfdToken}` }
        });
      }
      handleCloseModal();
      fetchFournisseurs();
    } catch (err) {
      console.error(err);
      if (err.response) {
        if (err.response.status === 409) setFormError("Ce fournisseur existe déjà (nom dupliqué).");
        else if (err.response.status === 403) setFormError("Vous n'avez pas la permission.");
        else if (err.response.status === 400) setFormError("Données invalides.");
        else setFormError(err.response.data.error || "Une erreur est survenue.");
      } else {
        setFormError("Erreur de connexion au serveur.");
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenEdit = (e, f) => {
    e.stopPropagation(); // Prevents opening details
    setEditingFournisseur(f);
    setFormData({
      name: f.name,
      contact_name: f.contact_name || "",
      phone: f.phone || "",
      email: f.email || "",
      address: f.address || ""
    });
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingFournisseur(null);
    setFormData({ name: "", contact_name: "", phone: "", email: "", address: "" });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFournisseur(null);
    setFormError(null);
  };

  const handleOpenDetails = async (f) => {
    setSelectedFournisseur(f);
    setIsDetailsOpen(true);
    setDetailsLoading(true);
    try {
      const res = await axios.get(`http://localhost:5001/api/lfd/suppliers/${f.id}/stats`, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      setDetailsData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredFournisseurs = fournisseurs.filter(f => 
    (f.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.contact_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="lfd-page" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--lfd-surface)" }}>Fournisseurs</h1>
          <p style={{ color: "var(--lfd-text-dim)", fontSize: "0.9rem" }}>Gérez votre base de fournisseurs et vos dettes.</p>
        </div>
        {hasPermission("supplier.create") && (
          <button onClick={handleOpenAdd} className="lfd-btn lfd-btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>
            <Plus size={18} /> Nouveau Fournisseur
          </button>
        )}
      </div>

      <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(26,26,46,0.05)" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
            <Search size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--lfd-text-muted)" }} />
            <input type="text" placeholder="Rechercher un fournisseur..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "100%", padding: "10px 10px 10px 38px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", outline: "none" }} />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--lfd-text-dim)" }}>Chargement...</div>
        ) : error ? (
          <div style={{ padding: 40, textAlign: "center", color: "#EF4444" }}>{error}</div>
        ) : filteredFournisseurs.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--lfd-text-dim)" }}>Aucun fournisseur trouvé.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--lfd-surface-3)", color: "var(--lfd-text-muted)", textAlign: "left" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Fournisseur</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Contact</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Téléphone</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Statut</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Dette Actuelle</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFournisseurs.map((f) => (
                  <tr key={f.id} onClick={() => handleOpenDetails(f)} style={{ borderBottom: "1px solid var(--lfd-content-bg)", cursor: "pointer", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background="#F8FAFC"} onMouseOut={e => e.currentTarget.style.background="transparent"}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--lfd-surface)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--lfd-content-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--lfd-accent)" }}><Building2 size={16} /></div>
                        <div>
                          <div>{f.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--lfd-text-dim)", fontWeight: 400 }}>Code: FRN-{f.id.toString().padStart(4, '0')}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--lfd-text-dim)" }}>{f.contact_name || "-"}</td>
                    <td style={{ padding: "12px 16px", color: "var(--lfd-text-dim)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Phone size={14} /> {f.phone || "-"}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: f.is_active ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", color: f.is_active ? "#10B981" : "#EF4444" }}>
                        {f.is_active ? "ACTIF" : "INACTIF"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: f.total_debt > 0 ? "#EF4444" : "var(--lfd-text-muted)" }}>{formatFCFA(f.total_debt || 0)}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      {hasPermission("supplier.update") && (
                        <button onClick={(e) => handleOpenEdit(e, f)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--lfd-text-muted)", marginRight: 8 }} title="Modifier"><Edit2 size={18} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LFDModal isOpen={isModalOpen} onClose={handleCloseModal} title={editingFournisseur ? "Modifier le fournisseur" : "Nouveau Fournisseur"}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {formError && (
            <div style={{ background: "#FEE2E2", color: "#B91C1C", padding: 12, borderRadius: 8, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={16} /> {formError}
            </div>
          )}
          
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Nom du fournisseur *</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
          </div>
          
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Nom du contact</label>
            <input type="text" value={formData.contact_name} onChange={(e) => setFormData({...formData, contact_name: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Téléphone</label>
              <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
            </div>
          </div>
          
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Adresse</label>
            <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} rows={2} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", resize: "none" }} />
          </div>

          <button type="submit" disabled={formLoading} style={{ marginTop: 10, padding: "12px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", fontWeight: 600, cursor: formLoading ? "not-allowed" : "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
            {formLoading ? "Enregistrement..." : <><Building2 size={18} /> Sauvegarder</>}
          </button>
        </form>
      </LFDModal>

      {/* Vue detaillée (Historique / KPIs) */}
      <LFDModal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} title={`Fiche Fournisseur : ${selectedFournisseur?.name}`}>
        {detailsLoading ? (
          <div style={{ padding: 20, textAlign: "center" }}>Chargement...</div>
        ) : selectedFournisseur ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, borderBottom: "1px solid #E2E8F0", paddingBottom: 15 }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: "1.1rem" }}>{selectedFournisseur.name}</p>
                <p style={{ margin: "4px 0", color: "#64748B", fontSize: "0.9rem" }}>Code: FRN-{selectedFournisseur.id.toString().padStart(4, '0')}</p>
                <div style={{ display: "flex", gap: 10, marginTop: 10, fontSize: "0.85rem", color: "#475569" }}>
                  {selectedFournisseur.phone && <span style={{ display:"flex", alignItems:"center", gap:4 }}><Phone size={14} /> {selectedFournisseur.phone}</span>}
                  {selectedFournisseur.email && <span style={{ display:"flex", alignItems:"center", gap:4 }}><Mail size={14} /> {selectedFournisseur.email}</span>}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700, background: selectedFournisseur.is_active ? "#D1FAE5" : "#FEE2E2", color: selectedFournisseur.is_active ? "#065F46" : "#991B1B" }}>
                  {selectedFournisseur.is_active ? "STATUT: ACTIF" : "STATUT: INACTIF"}
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginBottom: 20 }}>
              <div style={{ background: "#F8FAFC", padding: 15, borderRadius: 8, border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: "0.85rem", color: "#64748B", fontWeight: 600, marginBottom: 5 }}>Dette Actuelle</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: (detailsData?.total_debt || 0) > 0 ? "#EF4444" : "#0F172A" }}>
                  {formatFCFA(detailsData?.total_debt || 0)}
                </div>
              </div>
              <div style={{ background: "#F8FAFC", padding: 15, borderRadius: 8, border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: "0.85rem", color: "#64748B", fontWeight: 600, marginBottom: 5 }}>Factures Ouvertes</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0F172A" }}>
                  {detailsData?.open_invoices_count || 0}
                </div>
              </div>
            </div>

            <div style={{ fontSize: "0.9rem", color: "#64748B", marginTop: 20, fontStyle: "italic", textAlign: "center" }}>
              L'historique complet (Commandes, Réceptions, Factures, Paiements) est consultable dans les vues dédiées en filtrant par fournisseur.
            </div>
          </div>
        ) : null}
      </LFDModal>
    </div>
  );
};
export default Fournisseurs;
