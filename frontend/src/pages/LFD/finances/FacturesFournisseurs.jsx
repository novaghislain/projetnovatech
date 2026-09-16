import React, { useState, useEffect } from "react";
import { Search, Plus, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import LFDModal from "../../../components/LFD/LFDModal";
import { useLFDAuth } from "../../../contexts/LFDAuthContext";
import axios from "axios";

const formatFCFA = (amount) => {
  if (amount === undefined || amount === null) return "0 FCFA";
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
};

const FacturesFournisseurs = () => {
  const { lfdToken, hasPermission } = useLFDAuth();
  const [factures, setFactures] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [commandes, setCommandes] = useState([]); // Pour lier la facture
  
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    supplier_id: "",
    purchase_order_id: "",
    supplier_reference: "",
    invoice_date: "",
    due_date: "",
    subtotal: 0,
    discount: 0
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Validation
  const [validatingId, setValidatingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, suppRes, cmdRes] = await Promise.all([
        axios.get("http://localhost:5001/api/lfd/supplier-invoices", { headers: { Authorization: `Bearer ${lfdToken}` } }),
        axios.get("http://localhost:5001/api/lfd/suppliers", { headers: { Authorization: `Bearer ${lfdToken}` } }),
        axios.get("http://localhost:5001/api/lfd/purchases", { headers: { Authorization: `Bearer ${lfdToken}` } })
      ]);
      setFactures(invRes.data);
      setFournisseurs(suppRes.data.filter(f => f.is_active));
      setCommandes(cmdRes.data.filter(c => c.status === 'RECEIVED' || c.status === 'PARTIALLY_RECEIVED'));
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lfdToken]);

  const handleOpenAdd = () => {
    setFormData({
      supplier_id: "",
      purchase_order_id: "",
      supplier_reference: "",
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: "",
      subtotal: 0,
      discount: 0
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.supplier_id || formData.subtotal <= 0) {
      return setFormError("Le fournisseur et un sous-total > 0 sont requis.");
    }
    if (!formData.supplier_reference) {
      return setFormError("La référence de la facture fournisseur est requise.");
    }

    setFormLoading(true);
    try {
      await axios.post("http://localhost:5001/api/lfd/supplier-invoices", formData, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 400) {
        setFormError(err.response.data.error || "Données invalides (Possible doublon de référence).");
      } else {
        setFormError("Erreur lors de la création de la facture.");
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleValidate = async (id) => {
    if (!window.confirm("Voulez-vous valider cette facture ? Cela générera la dette dans le compte fournisseur.")) return;
    setValidatingId(id);
    try {
      await axios.post(`http://localhost:5001/api/lfd/supplier-invoices/${id}/validate`, {}, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Erreur de validation");
    } finally {
      setValidatingId(null);
    }
  };

  const filteredFactures = factures.filter(f => 
    (f.invoice_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.supplier_reference || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.supplier_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="lfd-page" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--lfd-surface)" }}>Factures Fournisseurs</h1>
          <p style={{ color: "var(--lfd-text-dim)", fontSize: "0.9rem" }}>Saisissez et validez les factures pour générer la dette.</p>
        </div>
        {hasPermission("supplier_invoice.create") && (
          <button onClick={handleOpenAdd} className="lfd-btn lfd-btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>
            <Plus size={18} /> Nouvelle Facture
          </button>
        )}
      </div>

      <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(26,26,46,0.05)" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
            <Search size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--lfd-text-muted)" }} />
            <input type="text" placeholder="Rechercher (N° LFD, Réf Frn, Nom)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "100%", padding: "10px 10px 10px 38px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", outline: "none" }} />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--lfd-text-dim)" }}>Chargement...</div>
        ) : error ? (
          <div style={{ padding: 40, textAlign: "center", color: "#EF4444" }}>{error}</div>
        ) : filteredFactures.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--lfd-text-dim)" }}>Aucune facture trouvée.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--lfd-surface-3)", color: "var(--lfd-text-muted)", textAlign: "left" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>N° LFD</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Réf. Fournisseur</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Fournisseur</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Date</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Montant TTC</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Statut</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFactures.map((f) => (
                  <tr key={f.id} style={{ borderBottom: "1px solid var(--lfd-content-bg)", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background="#F8FAFC"} onMouseOut={e => e.currentTarget.style.background="transparent"}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--lfd-surface)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--lfd-content-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--lfd-accent)" }}><FileText size={16} /></div>
                        <div>{f.invoice_number}</div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--lfd-surface)" }}>{f.supplier_reference}</td>
                    <td style={{ padding: "12px 16px", color: "var(--lfd-text-dim)", fontWeight: 500 }}>{f.supplier_name}</td>
                    <td style={{ padding: "12px 16px", color: "var(--lfd-text-dim)" }}>{f.invoice_date ? new Date(f.invoice_date).toLocaleDateString('fr-FR') : "-"}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 700 }}>{formatFCFA(f.total_amount)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      {f.status === 'DRAFT' ? (
                        <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: "#FEF3C7", color: "#B45309" }}>BROUILLON</span>
                      ) : (
                        <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: "#D1FAE5", color: "#065F46" }}>VALIDÉ</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      {f.status === 'DRAFT' && hasPermission("supplier_invoice.validate") && (
                        <button 
                          onClick={() => handleValidate(f.id)} 
                          disabled={validatingId === f.id}
                          style={{ background: "var(--lfd-accent)", color: "white", border: "none", padding: "6px 12px", borderRadius: 6, fontWeight: 600, cursor: validatingId === f.id ? "not-allowed" : "pointer", fontSize: "0.8rem" }}
                        >
                          {validatingId === f.id ? "..." : "Valider"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LFDModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Saisie Facture Fournisseur">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {formError && (
            <div style={{ background: "#FEE2E2", color: "#B91C1C", padding: 12, borderRadius: 8, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={16} /> {formError}
            </div>
          )}
          
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Fournisseur *</label>
              <select required value={formData.supplier_id} onChange={(e) => setFormData({...formData, supplier_id: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }}>
                <option value="">-- Sélectionner --</option>
                {fournisseurs.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Réf. Fournisseur *</label>
              <input type="text" required value={formData.supplier_reference} onChange={(e) => setFormData({...formData, supplier_reference: e.target.value})} placeholder="N° Facture original" style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Lier à une Commande (Optionnel)</label>
            <select value={formData.purchase_order_id} onChange={(e) => setFormData({...formData, purchase_order_id: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }}>
              <option value="">-- Aucune --</option>
              {commandes.filter(c => !formData.supplier_id || c.supplier_id == formData.supplier_id).map(c => (
                <option key={c.id} value={c.id}>{c.purchase_order_number} ({formatFCFA(c.total_amount)})</option>
              ))}
            </select>
          </div>
          
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Date Facture</label>
              <input type="date" required value={formData.invoice_date} onChange={(e) => setFormData({...formData, invoice_date: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Date d'échéance</label>
              <input type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Sous-total *</label>
              <input type="number" min="0" required value={formData.subtotal} onChange={(e) => setFormData({...formData, subtotal: parseFloat(e.target.value) || 0})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Remise</label>
              <input type="number" min="0" value={formData.discount} onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
            </div>
          </div>

          <div style={{ background: "#F8FAFC", padding: 15, borderRadius: 8, textAlign: "right", marginTop: 10 }}>
            <div style={{ fontSize: "0.9rem", color: "#64748B" }}>Total à Payer</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--lfd-accent)" }}>{formatFCFA(formData.subtotal - formData.discount)}</div>
          </div>

          <button type="submit" disabled={formLoading} style={{ marginTop: 10, padding: "12px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", fontWeight: 600, cursor: formLoading ? "not-allowed" : "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
            {formLoading ? "Enregistrement..." : "Créer la Facture"}
          </button>
        </form>
      </LFDModal>
    </div>
  );
};
export default FacturesFournisseurs;
