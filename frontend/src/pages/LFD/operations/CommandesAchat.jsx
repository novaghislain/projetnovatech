import React, { useState, useEffect } from "react";
import { Search, Plus, ShoppingCart, Trash2, AlertTriangle } from "lucide-react";
import LFDModal from "../../../components/LFD/LFDModal";
import { useLFDAuth } from "../../../contexts/LFDAuthContext";
import axios from "axios";

const formatFCFA = (amount) => {
  if (amount === undefined || amount === null) return "0 FCFA";
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
};

const CommandesAchat = () => {
  const { lfdToken, hasPermission } = useLFDAuth();
  const [commandes, setCommandes] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [produits, setProduits] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formSupplier, setFormSupplier] = useState("");
  const [formItems, setFormItems] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Details & Approval Modal
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsData, setDetailsData] = useState(null); // items
  const [approvalLoading, setApprovalLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cmdRes, suppRes, prodRes] = await Promise.all([
        axios.get("http://localhost:5001/api/lfd/purchases", { headers: { Authorization: `Bearer ${lfdToken}` } }),
        axios.get("http://localhost:5001/api/lfd/suppliers", { headers: { Authorization: `Bearer ${lfdToken}` } }),
        axios.get("http://localhost:5001/api/lfd/products", { headers: { Authorization: `Bearer ${lfdToken}` } })
      ]);
      setCommandes(cmdRes.data);
      setFournisseurs(suppRes.data.filter(f => f.is_active));
      setProduits(prodRes.data);
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
    setFormSupplier("");
    setFormItems([{ product_id: "", quantity: 1, unit_price: 0 }]);
    setIsModalOpen(true);
  };

  const addItemRow = () => {
    setFormItems([...formItems, { product_id: "", quantity: 1, unit_price: 0 }]);
  };

  const removeItemRow = (index) => {
    const newItems = [...formItems];
    newItems.splice(index, 1);
    setFormItems(newItems);
  };

  const updateItemRow = (index, field, value) => {
    const newItems = [...formItems];
    newItems[index][field] = value;
    if (field === 'product_id') {
      const prod = produits.find(p => p.id === parseInt(value));
      if (prod) newItems[index].unit_price = prod.purchase_price || 0;
    }
    setFormItems(newItems);
  };

  const calculateFormTotal = () => {
    return formItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!formSupplier) return setFormError("Sélectionnez un fournisseur.");
    if (formItems.length === 0) return setFormError("Ajoutez au moins un produit.");
    if (formItems.some(i => !i.product_id || i.quantity <= 0)) return setFormError("Produits et quantités invalides.");

    setFormLoading(true);
    try {
      await axios.post("http://localhost:5001/api/lfd/purchases", {
        supplier_id: formSupplier,
        items: formItems
      }, { headers: { Authorization: `Bearer ${lfdToken}` } });
      
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.error || "Erreur lors de la création.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenDetails = async (cmd) => {
    setSelectedCommande(cmd);
    setIsDetailsOpen(true);
    setDetailsLoading(true);
    try {
      const res = await axios.get(`http://localhost:5001/api/lfd/purchases/${cmd.id}`, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      setDetailsData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm("Voulez-vous approuver cette commande d'achat ?")) return;
    setApprovalLoading(true);
    try {
      await axios.post(`http://localhost:5001/api/lfd/purchases/${selectedCommande.id}/approve`, {}, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      setIsDetailsOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Erreur lors de l'approbation.");
    } finally {
      setApprovalLoading(false);
    }
  };

  const filteredCommandes = commandes.filter(c => 
    (c.purchase_order_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.supplier_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case 'DRAFT': return <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: "#FEF3C7", color: "#B45309" }}>BROUILLON</span>;
      case 'APPROVED': return <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: "#DBEAFE", color: "#1D4ED8" }}>APPROUVÉ</span>;
      case 'PARTIALLY_RECEIVED': return <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: "#E0E7FF", color: "#4338CA" }}>RÉC. PARTIELLE</span>;
      case 'RECEIVED': return <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: "#D1FAE5", color: "#065F46" }}>REÇU</span>;
      case 'CANCELLED': return <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: "#FEE2E2", color: "#991B1B" }}>ANNULÉ</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div className="lfd-page" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--lfd-surface)" }}>Commandes d'Achat</h1>
          <p style={{ color: "var(--lfd-text-dim)", fontSize: "0.9rem" }}>Créez et approuvez vos commandes fournisseurs.</p>
        </div>
        {hasPermission("purchase.create") && (
          <button onClick={handleOpenAdd} className="lfd-btn lfd-btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>
            <Plus size={18} /> Nouvelle Commande
          </button>
        )}
      </div>

      <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(26,26,46,0.05)" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
            <Search size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--lfd-text-muted)" }} />
            <input type="text" placeholder="Rechercher (N°, Fournisseur)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "100%", padding: "10px 10px 10px 38px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", outline: "none" }} />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--lfd-text-dim)" }}>Chargement...</div>
        ) : error ? (
          <div style={{ padding: 40, textAlign: "center", color: "#EF4444" }}>{error}</div>
        ) : filteredCommandes.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--lfd-text-dim)" }}>Aucune commande trouvée.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--lfd-surface-3)", color: "var(--lfd-text-muted)", textAlign: "left" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>N° Commande</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Fournisseur</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Date</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Montant</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Statut</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Créé par</th>
                </tr>
              </thead>
              <tbody>
                {filteredCommandes.map((c) => (
                  <tr key={c.id} onClick={() => handleOpenDetails(c)} style={{ borderBottom: "1px solid var(--lfd-content-bg)", cursor: "pointer", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background="#F8FAFC"} onMouseOut={e => e.currentTarget.style.background="transparent"}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--lfd-surface)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--lfd-content-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--lfd-accent)" }}><ShoppingCart size={16} /></div>
                        <div>
                          <div>{c.purchase_order_number}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--lfd-surface)", fontWeight: 500 }}>{c.supplier_name}</td>
                    <td style={{ padding: "12px 16px", color: "var(--lfd-text-dim)" }}>{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 700 }}>{formatFCFA(c.total_amount)}</td>
                    <td style={{ padding: "12px 16px" }}>{getStatusBadge(c.status)}</td>
                    <td style={{ padding: "12px 16px", color: "var(--lfd-text-dim)", fontSize: "0.8rem" }}>{c.creator_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Création Commande */}
      <LFDModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouvelle Commande d'Achat">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {formError && (
            <div style={{ background: "#FEE2E2", color: "#B91C1C", padding: 12, borderRadius: 8, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={16} /> {formError}
            </div>
          )}
          
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Fournisseur *</label>
            <select required value={formSupplier} onChange={(e) => setFormSupplier(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }}>
              <option value="">-- Sélectionner --</option>
              {fournisseurs.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div style={{ background: "#F8FAFC", padding: 15, borderRadius: 8, border: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h4 style={{ margin: 0, fontSize: "0.95rem" }}>Produits</h4>
              <button type="button" onClick={addItemRow} style={{ background: "transparent", color: "var(--lfd-accent)", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 4 }}><Plus size={14}/> Ligne</button>
            </div>
            
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #CBD5E1", textAlign: "left" }}>
                  <th style={{ padding: "8px 4px", width: "40%" }}>Produit</th>
                  <th style={{ padding: "8px 4px", width: "20%" }}>Quantité</th>
                  <th style={{ padding: "8px 4px", width: "30%" }}>Coût Unitaire</th>
                  <th style={{ padding: "8px 4px", width: "10%" }}></th>
                </tr>
              </thead>
              <tbody>
                {formItems.map((item, index) => (
                  <tr key={index}>
                    <td style={{ padding: "4px" }}>
                      <select required value={item.product_id} onChange={(e) => updateItemRow(index, 'product_id', e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: 4, border: "1px solid #CBD5E1" }}>
                        <option value="">Sélectionner</option>
                        {produits.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "4px" }}>
                      <input type="number" min="1" required value={item.quantity} onChange={(e) => updateItemRow(index, 'quantity', parseInt(e.target.value))} style={{ width: "100%", padding: "6px", borderRadius: 4, border: "1px solid #CBD5E1" }} />
                    </td>
                    <td style={{ padding: "4px" }}>
                      <input type="number" min="0" required value={item.unit_price} onChange={(e) => updateItemRow(index, 'unit_price', parseFloat(e.target.value))} style={{ width: "100%", padding: "6px", borderRadius: 4, border: "1px solid #CBD5E1" }} />
                    </td>
                    <td style={{ padding: "4px", textAlign: "center" }}>
                      <button type="button" onClick={() => removeItemRow(index)} style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer" }}><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {formItems.length > 0 && (
              <div style={{ textAlign: "right", marginTop: 10, fontWeight: 700, fontSize: "1.1rem" }}>
                Total: {formatFCFA(calculateFormTotal())}
              </div>
            )}
          </div>

          <button type="submit" disabled={formLoading} style={{ marginTop: 10, padding: "12px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", fontWeight: 600, cursor: formLoading ? "not-allowed" : "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
            {formLoading ? "Enregistrement..." : "Créer Commande (Brouillon)"}
          </button>
        </form>
      </LFDModal>

      {/* Modal Détails & Approbation */}
      <LFDModal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} title={`Commande : ${selectedCommande?.purchase_order_number}`}>
        {detailsLoading ? (
          <div style={{ padding: 20, textAlign: "center" }}>Chargement...</div>
        ) : selectedCommande && detailsData ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, borderBottom: "1px solid #E2E8F0", paddingBottom: 15 }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: "1.1rem" }}>Fournisseur: {selectedCommande.supplier_name}</p>
                <p style={{ margin: "4px 0", color: "#64748B", fontSize: "0.9rem" }}>Date: {new Date(selectedCommande.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                {getStatusBadge(selectedCommande.status)}
                <div style={{ marginTop: 8, fontWeight: 800, fontSize: "1.2rem" }}>{formatFCFA(selectedCommande.total_amount)}</div>
              </div>
            </div>

            {selectedCommande.status === 'DRAFT' && (
              <div style={{ background: "#FEF3C7", padding: 15, borderRadius: 8, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#B45309", fontWeight: 600 }}>En attente d'approbation</span>
                {hasPermission("purchase.approve") && (
                  <button onClick={handleApprove} disabled={approvalLoading} style={{ background: "#B45309", color: "white", border: "none", padding: "8px 16px", borderRadius: 6, fontWeight: 600, cursor: approvalLoading ? "not-allowed" : "pointer" }}>
                    {approvalLoading ? "..." : "APPROUVER"}
                  </button>
                )}
              </div>
            )}

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #CBD5E1", textAlign: "left", color: "#475569" }}>
                  <th style={{ padding: "8px 4px" }}>Produit</th>
                  <th style={{ padding: "8px 4px", textAlign: "center" }}>Commandé</th>
                  <th style={{ padding: "8px 4px", textAlign: "center" }}>Reçu</th>
                  <th style={{ padding: "8px 4px", textAlign: "center" }}>Reste</th>
                  <th style={{ padding: "8px 4px", textAlign: "right" }}>Prix Unitaire</th>
                  <th style={{ padding: "8px 4px", textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {detailsData.items.map(item => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #E2E8F0" }}>
                    <td style={{ padding: "8px 4px", fontWeight: 500 }}>{item.product_name}</td>
                    <td style={{ padding: "8px 4px", textAlign: "center", fontWeight: 600 }}>{item.quantity}</td>
                    <td style={{ padding: "8px 4px", textAlign: "center", color: item.received_quantity > 0 ? "#059669" : "#94A3B8" }}>{item.received_quantity}</td>
                    <td style={{ padding: "8px 4px", textAlign: "center", color: (item.quantity - item.received_quantity) > 0 ? "#EF4444" : "#94A3B8" }}>{item.quantity - item.received_quantity}</td>
                    <td style={{ padding: "8px 4px", textAlign: "right" }}>{formatFCFA(item.unit_price)}</td>
                    <td style={{ padding: "8px 4px", textAlign: "right", fontWeight: 600 }}>{formatFCFA(item.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </LFDModal>
    </div>
  );
};
export default CommandesAchat;
