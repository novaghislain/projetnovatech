import React, { useState, useEffect } from "react";
import { FileText, Search, Plus, Trash2, ShoppingBag, Download } from "lucide-react";
import { formatFCFA } from "../mockDataPhase2";
import LFDModal from "../../../components/LFD/LFDModal";
import { useLFDAuth } from "../../../contexts/LFDAuthContext";
import { useLFDAlert } from "../../../contexts/LFDAlertContext";
import axios from "axios";
import { downloadLfdPdf } from "../../../utils/lfdPdfGenerator";

const API_URL = `${API_URL}/api/lfd`;

const Facturation = () => {
  const { lfdToken } = useLFDAuth();
  const { showAlert } = useLFDAlert();
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingSale, setViewingSale] = useState(null);

  const [isAccountingModalOpen, setIsAccountingModalOpen] = useState(false);
  const [accountingEntry, setAccountingEntry] = useState(null);
  const [accountingLoading, setAccountingLoading] = useState(false);

  // Formulaire Nouvelle Vente
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [paymentType, setPaymentType] = useState("CASH");
  const [cart, setCart] = useState([]); // { product_id, quantity, price }
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchInitialData();
  }, [lfdToken]);

  const fetchInitialData = async () => {
    try {
      const headers = { Authorization: `Bearer ${lfdToken}` };
      
      // 1. Clients
      const custRes = await axios.get(`${API_URL}/customers`, { headers });
      setCustomers(custRes.data);
      
      // 2. Produits
      const prodRes = await axios.get(`${API_URL}/products`, { headers });
      setProducts(prodRes.data);
      
      // 3. Ventes existantes (si l'API liste les ventes, sinon on mock)
      try {
        const salesRes = await axios.get(`${API_URL}/sales`, { headers });
        setSales(salesRes.data || []);
      } catch (e) {
        console.log("Impossible de charger les ventes:", e.message);
      }
      
      // 4. Session de caisse active
      try {
        const sessRes = await axios.get(`${API_URL}/cash/session`, { headers });
        setActiveSessionId(sessRes.data.session.id);
      } catch (e) {
        setActiveSessionId(null);
      }
    } catch (err) {
      console.error("Erreur de chargement initial:", err);
    }
  };

  const fetchAccountingEntry = async (saleId) => {
    setAccountingLoading(true);
    setIsAccountingModalOpen(true);
    setAccountingEntry(null);
    try {
      const res = await axios.get(`${API_URL}/accounting/entries/source/SALE/${saleId}`, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      setAccountingEntry(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
         showAlert("Information", "Aucune écriture comptable n'a encore été générée pour cette vente (peut-être qu'elle est en brouillon).", "info");
         setIsAccountingModalOpen(false);
      } else {
         showAlert("Erreur", "Erreur lors de la récupération de l'écriture comptable.", "error");
         setIsAccountingModalOpen(false);
      }
    } finally {
      setAccountingLoading(false);
    }
  };

  const handleDownload = (saleId) => {
    const sale = sales.find(s => s.id === saleId);
    if (sale) {
      const result = downloadLfdPdf('SALE', sale);
      if (result.success) {
        showAlert("Succès", "Facture téléchargée.", "success");
      } else {
        showAlert("Erreur", "Impossible de générer le PDF: " + result.error, "error");
      }
    }
  };

  const addToCart = () => {
    if (!selectedProductId || quantity <= 0) return;
    const product = products.find(p => p.id === Number(selectedProductId));
    if (!product) return;

    const existing = cart.find(item => item.product_id === product.id);
    if (existing) {
      setCart(cart.map(item => item.product_id === product.id ? { ...item, quantity: item.quantity + Number(quantity) } : item));
    } else {
      setCart([...cart, { product_id: product.id, name: product.name, price: product.selling_price, quantity: Number(quantity) }]);
    }
    setSelectedProductId("");
    setQuantity(1);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.product_id !== id));
  };

  const sousTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = sousTotal; // Pas de remise globale gérée dans ce UI simple

  const handleValidateSale = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) return showAlert("Attention", "Veuillez sélectionner un client.", "warning");
    if (cart.length === 0) return showAlert("Attention", "Le panier est vide.", "warning");
    if (paymentType === "CASH" && !activeSessionId) return showAlert("Erreur", "Impossible de valider une vente comptant sans session de caisse ouverte.", "error");

    try {
      const headers = { Authorization: `Bearer ${lfdToken}` };
      
      // 1. Créer le brouillon
      const draftPayload = {
        customer_id: Number(selectedCustomerId),
        payment_type: paymentType,
        items: cart.map(item => ({ product_id: item.product_id, quantity: item.quantity, discount: 0 }))
      };
      
      const draftRes = await axios.post(`${API_URL}/sales`, draftPayload, { headers });
      const saleId = draftRes.data.id;

      // 2. Valider la vente
      await axios.post(`${API_URL}/sales/${saleId}/validate`, {
        cash_session_id: paymentType === "CASH" ? activeSessionId : null,
        warehouse_id: 1 // Dépôt par défaut
      }, { headers });

      showAlert("Succès", "Vente validée avec succès !", "success");
      setIsModalOpen(false);
      setCart([]);
      setSelectedCustomerId("");
      fetchInitialData(); // Recharger les ventes
      
    } catch (err) {
      showAlert("Erreur", "Erreur lors de la vente: " + (err.response?.data?.error || err.message), "error");
    }
  };

  return (
    <div className="lfd-page" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--lfd-surface)" }}>Ventes & Facturation</h1>
          <p style={{ color: "var(--lfd-text-dim)", fontSize: "0.9rem" }}>Interface Agent de Facturation.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="lfd-btn lfd-btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>
          <Plus size={18} /> Nouvelle Vente
        </button>
      </div>

      <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(26,26,46,0.05)" }}>
        <h3 style={{marginTop: 0}}>Historique des ventes</h3>
        <p style={{color: "var(--lfd-text-dim)", fontSize: "0.9rem", marginBottom: 20}}>
          Les ventes validées s'affichent ici.
        </p>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--lfd-surface-3)", color: "var(--lfd-text-muted)", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Numéro</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Date</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Client</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Montant Total</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Type Paiement</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Statut</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr><td colSpan="7" style={{padding: 20, textAlign: 'center'}}>Aucune vente trouvée.</td></tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} style={{ borderBottom: "1px solid var(--lfd-content-bg)" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--lfd-surface)" }}>{sale.sale_number}</td>
                    <td style={{ padding: "12px 16px", color: "var(--lfd-text-dim)" }}>{sale.created_at}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 500 }}>{customers.find(c => c.id === sale.customer_id)?.name || sale.customer_id}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 700 }}>{formatFCFA(sale.total)}</td>
                    <td style={{ padding: "12px 16px", color: "var(--lfd-text-dim)" }}>{sale.payment_type}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: sale.status === "PAID" ? "rgba(16,185,129,0.1)" : sale.status === "DRAFT" ? "rgba(148,163,184,0.1)" : "rgba(245,158,11,0.1)", color: sale.status === "PAID" ? "#059669" : sale.status === "DRAFT" ? "#64748B" : "#D97706" }}>
                        {sale.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button 
                          style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--lfd-text-muted)" }}
                          title="Télécharger Facture"
                          onClick={() => handleDownload(sale.id)}
                        >
                          <Download size={18} />
                        </button>
                        <button 
                          style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--lfd-text-muted)" }}
                          title="Voir Écriture Comptable"
                          onClick={() => fetchAccountingEntry(sale.id)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LFDModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="NOUVELLE VENTE">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Client</label>
            <select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }}>
              <option value="">-- Sélectionner un client --</option>
              {customers.filter(c => c.status === "ACTIVE").map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.credit_allowed ? "(Crédit Autorisé)" : ""}</option>
              ))}
            </select>
          </div>

          <div style={{ background: "var(--lfd-surface-3)", padding: 16, borderRadius: 8 }}>
            <h4 style={{ margin: "0 0 10px 0" }}>Ajouter un produit</h4>
            <div style={{ display: "flex", gap: 10 }}>
              <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }}>
                <option value="">-- Produit --</option>
                {products.filter(p => p.status === "ACTIVE").map(p => (
                  <option key={p.id} value={p.id}>{p.name} - {formatFCFA(p.selling_price)}</option>
                ))}
              </select>
              <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{ width: 80, padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
              <button onClick={addToCart} style={{ padding: "10px 16px", borderRadius: 8, background: "var(--lfd-surface)", color: "white", border: "none", cursor: "pointer" }}>Ajouter</button>
            </div>
          </div>

          <div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--lfd-surface-3)", textAlign: "left" }}>
                  <th style={{ padding: "8px" }}>Produit</th>
                  <th style={{ padding: "8px" }}>Qté</th>
                  <th style={{ padding: "8px" }}>PU</th>
                  <th style={{ padding: "8px", textAlign: "right" }}>Total</th>
                  <th style={{ padding: "8px", textAlign: "center" }}></th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.product_id} style={{ borderBottom: "1px solid var(--lfd-content-bg)" }}>
                    <td style={{ padding: "8px" }}>{item.name}</td>
                    <td style={{ padding: "8px" }}>{item.quantity}</td>
                    <td style={{ padding: "8px" }}>{formatFCFA(item.price)}</td>
                    <td style={{ padding: "8px", textAlign: "right", fontWeight: "bold" }}>{formatFCFA(item.price * item.quantity)}</td>
                    <td style={{ padding: "8px", textAlign: "center" }}>
                      <button onClick={() => removeFromCart(item.product_id)} style={{ color: "#EF4444", background: "none", border: "none", cursor: "pointer" }}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
                {cart.length === 0 && (
                  <tr><td colSpan="5" style={{ padding: 16, textAlign: "center", color: "var(--lfd-text-dim)" }}>Le panier est vide.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ background: "var(--lfd-content-bg)", padding: 16, borderRadius: 8, minWidth: 200 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: "0.9rem" }}>
                <span>Sous-total</span>
                <span>{formatFCFA(sousTotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--lfd-surface-3)", paddingTop: 8, fontWeight: "bold", fontSize: "1.1rem" }}>
                <span>TOTAL</span>
                <span style={{ color: "var(--lfd-accent)" }}>{formatFCFA(total)}</span>
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Mode de paiement</label>
            <div style={{ display: "flex", gap: 20 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="radio" name="paymentType" value="CASH" checked={paymentType === "CASH"} onChange={() => setPaymentType("CASH")} />
                Comptant
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="radio" name="paymentType" value="CREDIT" checked={paymentType === "CREDIT"} onChange={() => setPaymentType("CREDIT")} />
                Crédit
              </label>
            </div>
            {paymentType === "CASH" && !activeSessionId && (
              <p style={{ color: "#EF4444", fontSize: "0.85rem", marginTop: 8 }}>⚠️ Attention : Aucune session de caisse n'est ouverte. Vous ne pourrez pas valider cette vente comptant.</p>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button onClick={handleValidateSale} style={{ flex: 1, padding: "12px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
              <FileText size={18} /> VALIDER LA VENTE
            </button>
          </div>
        </div>
      </LFDModal>

      {/* Modal Écriture Comptable */}
      <LFDModal isOpen={isAccountingModalOpen} onClose={() => setIsAccountingModalOpen(false)} title="Détail de l'écriture comptable">
        {accountingLoading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--lfd-text-dim)" }}>Chargement de la pièce comptable...</div>
        ) : accountingEntry ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, borderBottom: "1px solid var(--lfd-surface-3)", paddingBottom: 15 }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: "1.1rem" }}>Pièce: {accountingEntry.entry_number}</p>
                <p style={{ margin: "4px 0", color: "var(--lfd-text-dim)", fontSize: "0.9rem" }}>{accountingEntry.description}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: accountingEntry.status === "POSTED" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", color: accountingEntry.status === "POSTED" ? "#059669" : "#D97706" }}>
                  {accountingEntry.status}
                </span>
                <p style={{ margin: "4px 0", color: "var(--lfd-text-dim)", fontSize: "0.9rem" }}>{new Date(accountingEntry.entry_date).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--lfd-surface-3)", color: "var(--lfd-text-muted)", textAlign: "left" }}>
                  <th style={{ padding: "8px 4px" }}>Compte</th>
                  <th style={{ padding: "8px 4px", textAlign: "right" }}>Débit</th>
                  <th style={{ padding: "8px 4px", textAlign: "right" }}>Crédit</th>
                </tr>
              </thead>
              <tbody>
                {accountingEntry.lines.map((line, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--lfd-content-bg)" }}>
                    <td style={{ padding: "8px 4px" }}>
                      <span style={{ fontWeight: 600 }}>{line.account_number}</span> - {line.account_name}
                    </td>
                    <td style={{ padding: "8px 4px", textAlign: "right", color: line.debit > 0 ? "var(--lfd-surface)" : "transparent" }}>
                      {line.debit > 0 ? formatFCFA(line.debit) : "-"}
                    </td>
                    <td style={{ padding: "8px 4px", textAlign: "right", color: line.credit > 0 ? "var(--lfd-surface)" : "transparent" }}>
                      {line.credit > 0 ? formatFCFA(line.credit) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ fontWeight: 700, borderTop: "2px solid var(--lfd-surface-3)" }}>
                  <td style={{ padding: "12px 4px", textAlign: "right" }}>Total:</td>
                  <td style={{ padding: "12px 4px", textAlign: "right", color: "var(--lfd-accent)" }}>{formatFCFA(accountingEntry.total_debit)}</td>
                  <td style={{ padding: "12px 4px", textAlign: "right", color: "var(--lfd-accent)" }}>{formatFCFA(accountingEntry.total_credit)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : null}
      </LFDModal>

    </div>
  );
};
export default Facturation;
