import React, { useState, useEffect } from "react";
import { Search, CheckCircle, Clock, FileText, Package, AlertTriangle } from "lucide-react";
import LFDModal from "../../../components/LFD/LFDModal";
import { useLFDAuth } from "../../../contexts/LFDAuthContext";
import { useLFDAlert } from "../../../contexts/LFDAlertContext";
import axios from "axios";

const Magasin = () => {
  const { lfdToken, employee } = useLFDAuth();
  const { showAlert, showConfirm } = useLFDAlert();
  const searchParams = new URLSearchParams(window.location.search);
  const initialTab = searchParams.get('tab') || "preparations";
  const [activeTab, setActiveTab] = useState(initialTab); // preparations, sorties, receptions
  
  const [preparations, setPreparations] = useState([]);
  const [stockReleases, setStockReleases] = useState([]);
  const [receptionsEnAttente, setReceptionsEnAttente] = useState([]); // Commandes à réceptionner
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedPrep, setSelectedPrep] = useState(null);
  const [prepDetails, setPrepDetails] = useState([]);
  const [isPrepModalOpen, setIsPrepModalOpen] = useState(false);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);

  // States for receptions
  const [isReceptionModalOpen, setIsReceptionModalOpen] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [receptionDetails, setReceptionDetails] = useState([]);
  const [receptionLoading, setReceptionLoading] = useState(false);

  const fetchPreparations = async () => {
    try {
      const status = activeTab === "preparations" ? "TO_PREPARE" : "PREPARED";
      const res = await axios.get(`http://localhost:5001/api/lfd/ops/preparations?status=${status}`, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      setPreparations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReleases = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/lfd/ops/stock-releases", {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      setStockReleases(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReceptionsAttente = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/lfd/purchases", {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      // Garder uniquement APPROVED et PARTIALLY_RECEIVED
      const pending = res.data.filter(c => c.status === 'APPROVED' || c.status === 'PARTIALLY_RECEIVED');
      setReceptionsEnAttente(pending);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === "preparations") fetchPreparations();
    if (activeTab === "sorties") fetchReleases();
    if (activeTab === "receptions") fetchReceptionsAttente();
  }, [activeTab, lfdToken]);

  const handleStartPrep = async (prepId) => {
    try {
      await axios.post(`http://localhost:5001/api/lfd/ops/preparations/${prepId}/start`, {}, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      
      const res = await axios.get(`http://localhost:5001/api/lfd/ops/preparations/${prepId}`, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      setSelectedPrep(res.data);
      // init local states
      const items = res.data.items.map(i => ({...i, quantity_prepared: i.quantity_to_prepare}));
      setPrepDetails(items);
      setIsPrepModalOpen(true);
    } catch (err) {
      showAlert("Erreur", err.response?.data?.error || "Erreur de démarrage", "error");
    }
  };

  const handleCompletePrep = async () => {
    try {
      const payload = {
        prepared_items: prepDetails.map(i => ({ id: i.id, quantity_prepared: parseInt(i.quantity_prepared) }))
      };
      await axios.post(`http://localhost:5001/api/lfd/ops/preparations/${selectedPrep.id}/complete`, payload, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      showAlert("Succès", "Préparation terminée avec succès.", "success");
      setIsPrepModalOpen(false);
      fetchPreparations();
    } catch (err) {
      showAlert("Erreur", err.response?.data?.error || "Erreur", "error");
    }
  };

  const handleRelease = async (prepId) => {
    try {
      await axios.post(`http://localhost:5001/api/lfd/ops/preparations/${prepId}/release`, {}, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      showAlert("Succès", "Sortie validée avec succès. Bon de Livraison généré.", "success");
      fetchReleases();
    } catch (err) {
      showAlert("Erreur", err.response?.data?.error || "Erreur lors de la sortie", "error");
    }
  };

  const handleStartReception = async (cmdId) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/lfd/purchases/${cmdId}`, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      setSelectedCommande(res.data);
      // Init les qtes reçues aujourd'hui à 0
      const items = res.data.items.map(i => ({
        ...i,
        quantity_to_receive_today: 0,
        remaining_quantity: i.quantity - i.received_quantity
      })).filter(i => i.remaining_quantity > 0);
      setReceptionDetails(items);
      setIsReceptionModalOpen(true);
    } catch (err) {
      showAlert("Erreur", err.response?.data?.error || "Erreur de chargement", "error");
    }
  };

  const handleConfirmReception = async () => {
    showConfirm(
      "Confirmation",
      "Confirmer la réception de ces produits ? Cette opération modifiera le stock.",
      async () => {
        setReceptionLoading(true);
        try {
          const payload = {
            purchase_order_id: selectedCommande.id,
            items: receptionDetails.map(i => ({ product_id: i.product_id, quantity_received: parseInt(i.quantity_to_receive_today) })).filter(i => i.quantity_received > 0)
          };
          
          if (payload.items.length === 0) {
            showAlert("Attention", "Veuillez saisir au moins une quantité reçue.", "warning");
            setReceptionLoading(false);
            return;
          }

          await axios.post(`http://localhost:5001/api/lfd/receipts`, payload, {
            headers: { Authorization: `Bearer ${lfdToken}` }
          });
          showAlert("Succès", "Réception enregistrée avec succès.", "success");
          setIsReceptionModalOpen(false);
          fetchReceptionsAttente();
        } catch (err) {
          showAlert("Erreur", err.response?.data?.error || "Erreur lors de la réception", "error");
        } finally {
          setReceptionLoading(false);
        }
      }
    );
  };

  return (
    <div className="lfd-page" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--lfd-surface)" }}>Contrôle Magasin</h1>
          <p style={{ color: "var(--lfd-text-dim)", fontSize: "0.9rem" }}>Gérez les préparations et validez les sorties physiques.</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", borderBottom: "2px solid var(--lfd-surface-3)", marginBottom: "20px" }}>
        <button
          style={{ padding: "12px 20px", fontWeight: 600, border: "none", background: "transparent", cursor: "pointer", borderBottom: activeTab === 'preparations' ? "3px solid var(--lfd-accent)" : "3px solid transparent", color: activeTab === 'preparations' ? "var(--lfd-accent)" : "var(--lfd-text-dim)", transition: "all 0.2s" }}
          onClick={() => setActiveTab('preparations')}
        >
          À Préparer (Sorties)
        </button>
        <button
          style={{ padding: "12px 20px", fontWeight: 600, border: "none", background: "transparent", cursor: "pointer", borderBottom: activeTab === 'sorties' ? "3px solid #059669" : "3px solid transparent", color: activeTab === 'sorties' ? "#059669" : "var(--lfd-text-dim)", transition: "all 0.2s" }}
          onClick={() => setActiveTab('sorties')}
        >
          Double Contrôle (Sorties)
        </button>
        <button
          style={{ padding: "12px 20px", fontWeight: 600, border: "none", background: "transparent", cursor: "pointer", borderBottom: activeTab === 'receptions' ? "3px solid #2563EB" : "3px solid transparent", color: activeTab === 'receptions' ? "#2563EB" : "var(--lfd-text-dim)", transition: "all 0.2s" }}
          onClick={() => setActiveTab('receptions')}
        >
          Réceptions Fournisseurs
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(26,26,46,0.05)", overflowX: "auto" }}>
        
        {activeTab === 'preparations' && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--lfd-surface-3)", color: "var(--lfd-text-muted)", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>N° Préparation</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>N° Vente</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Client</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Statut</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {preparations.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--lfd-content-bg)" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--lfd-surface)" }}>{p.preparation_number}</td>
                  <td style={{ padding: "12px 16px", color: "var(--lfd-text-dim)" }}>{p.sale_number}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>{p.customer_name}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: "rgba(245,158,11,0.1)", color: "#D97706" }}>
                      À Préparer
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <button 
                      onClick={() => handleStartPrep(p.id)}
                      className="lfd-btn" style={{ padding: "6px 12px", fontSize: "0.85rem", borderRadius: 6, background: "rgba(99,102,241,0.1)", color: "#4F46E5", border: "1px solid rgba(99,102,241,0.2)", cursor: "pointer", fontWeight: 600 }}
                    >
                      Démarrer
                    </button>
                  </td>
                </tr>
              ))}
              {preparations.length === 0 && (
                <tr><td colSpan="5" style={{ padding: 20, textAlign: "center", color: "var(--lfd-text-dim)" }}>Aucune préparation en attente</td></tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'sorties' && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--lfd-surface-3)", color: "var(--lfd-text-muted)", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>N° Préparation</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>N° Vente</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Préparé Par</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Statut</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stockReleases.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--lfd-content-bg)" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--lfd-surface)" }}>{p.preparation_number}</td>
                  <td style={{ padding: "12px 16px", color: "var(--lfd-text-dim)" }}>{p.sale_number}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>ID: {p.prepared_by}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: "rgba(59,130,246,0.1)", color: "#2563EB", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Clock size={14} /> Attente Contrôle
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    {p.prepared_by === employee?.id ? (
                      <span style={{ fontSize: "0.85rem", color: "#EF4444", fontWeight: 600 }}>Auto-contrôle interdit</span>
                    ) : (
                      <button 
                        onClick={() => handleRelease(p.id)}
                        className="lfd-btn" style={{ padding: "6px 12px", fontSize: "0.85rem", borderRadius: 6, background: "rgba(16,185,129,0.1)", color: "#059669", border: "1px solid rgba(16,185,129,0.2)", cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}
                      >
                        <CheckCircle size={16} /> Valider Sortie
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {stockReleases.length === 0 && (
                <tr><td colSpan="5" style={{ padding: 20, textAlign: "center", color: "var(--lfd-text-dim)" }}>Aucun bon en attente de contrôle croisé</td></tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'receptions' && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--lfd-surface-3)", color: "var(--lfd-text-muted)", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Commande</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Fournisseur</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Statut</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {receptionsEnAttente.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid var(--lfd-content-bg)" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--lfd-surface)" }}>{c.purchase_order_number}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>{c.supplier_name}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: c.status === 'APPROVED' ? "rgba(59,130,246,0.1)" : "rgba(99,102,241,0.1)", color: c.status === 'APPROVED' ? "#2563EB" : "#4F46E5" }}>
                      {c.status === 'APPROVED' ? 'Attente Réception' : 'Réc. Partielle'}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <button 
                      onClick={() => handleStartReception(c.id)}
                      className="lfd-btn" style={{ padding: "6px 12px", fontSize: "0.85rem", borderRadius: 6, background: "rgba(37,99,235,0.1)", color: "#1D4ED8", border: "1px solid rgba(37,99,235,0.2)", cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      <Package size={16} /> Réceptionner
                    </button>
                  </td>
                </tr>
              ))}
              {receptionsEnAttente.length === 0 && (
                <tr><td colSpan="4" style={{ padding: 20, textAlign: "center", color: "var(--lfd-text-dim)" }}>Aucune commande en attente de réception</td></tr>
              )}
            </tbody>
          </table>
        )}

      </div>

      {/* Modal de Préparation */}
      <LFDModal isOpen={isPrepModalOpen} onClose={() => setIsPrepModalOpen(false)} title={`Préparation : ${selectedPrep?.preparation_number}`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: "0.9rem", color: "var(--lfd-text-dim)" }}>Veuillez vérifier les quantités physiques préparées pour chaque article.</p>
          
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", border: "1px solid var(--lfd-surface-3)" }}>
            <thead style={{ background: "var(--lfd-content-bg)" }}>
              <tr style={{ borderBottom: "1px solid var(--lfd-surface-3)" }}>
                <th style={{ padding: "10px", textAlign: "left", fontWeight: 600 }}>Produit</th>
                <th style={{ padding: "10px", textAlign: "right", fontWeight: 600 }}>Qté Commandée</th>
                <th style={{ padding: "10px", textAlign: "right", fontWeight: 600 }}>Qté Préparée</th>
              </tr>
            </thead>
            <tbody>
              {prepDetails.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: "1px solid var(--lfd-surface-3)" }}>
                  <td style={{ padding: "10px" }}>
                    <div style={{ fontWeight: 500, color: "var(--lfd-surface)" }}>{item.product_name}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--lfd-text-dim)" }}>{item.product_code}</div>
                  </td>
                  <td style={{ padding: "10px", textAlign: "right", fontWeight: 700, color: "var(--lfd-surface)" }}>{item.quantity_to_prepare}</td>
                  <td style={{ padding: "10px", textAlign: "right" }}>
                    <input 
                      type="number"
                      min="0"
                      max={item.quantity_to_prepare}
                      value={item.quantity_prepared}
                      onChange={(e) => {
                        const newDetails = [...prepDetails];
                        newDetails[idx].quantity_prepared = e.target.value;
                        setPrepDetails(newDetails);
                      }}
                      style={{ width: "80px", padding: "8px", border: "1px solid var(--lfd-surface-3)", borderRadius: 6, textAlign: "right", outline: "none" }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {prepDetails.some(i => i.quantity_prepared < i.quantity_to_prepare) && (
            <div className="lfd-alert" style={{ background: "rgba(245,158,11,0.1)", color: "#D97706", padding: 12, borderRadius: 8, display: "flex", alignItems: "start", gap: 8, fontSize: "0.9rem", fontWeight: 500 }}>
              <AlertTriangle style={{ flexShrink: 0 }} size={18} />
              <p style={{ margin: 0 }}>Attention : Les quantités préparées sont inférieures aux quantités commandées. Une alerte sera générée.</p>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10, paddingTop: 16, borderTop: "1px solid var(--lfd-surface-3)" }}>
            <button
              onClick={() => setIsPrepModalOpen(false)}
              className="lfd-btn lfd-btn-secondary" style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", background: "transparent", cursor: "pointer", fontWeight: 600, color: "var(--lfd-text-dim)" }}
            >
              Annuler
            </button>
            <button
              onClick={handleCompletePrep}
              className="lfd-btn lfd-btn-primary" style={{ padding: "10px 16px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}
            >
              Terminer la préparation
            </button>
          </div>
        </div>
      </LFDModal>

      {/* Modal de Réception */}
      <LFDModal isOpen={isReceptionModalOpen} onClose={() => setIsReceptionModalOpen(false)} title={`Réception - ${selectedCommande?.purchase_order_number}`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="lfd-alert" style={{ background: "rgba(37,99,235,0.1)", color: "#1D4ED8", padding: 16, borderRadius: 8, fontSize: "0.9rem" }}>
            <p style={{ fontWeight: 700, margin: "0 0 4px 0" }}>Fournisseur : {selectedCommande?.supplier_name}</p>
            <p style={{ margin: 0 }}>Veuillez saisir la quantité réellement reçue aujourd'hui pour chaque produit.</p>
          </div>
          
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", border: "1px solid var(--lfd-surface-3)" }}>
            <thead style={{ background: "var(--lfd-content-bg)" }}>
              <tr style={{ borderBottom: "1px solid var(--lfd-surface-3)" }}>
                <th style={{ padding: "10px", textAlign: "left", fontWeight: 600 }}>Produit</th>
                <th style={{ padding: "10px", textAlign: "center", fontWeight: 600 }}>Commandé</th>
                <th style={{ padding: "10px", textAlign: "center", fontWeight: 600 }}>Déjà Reçu</th>
                <th style={{ padding: "10px", textAlign: "center", fontWeight: 600 }}>Reste</th>
                <th style={{ padding: "10px", textAlign: "right", fontWeight: 600 }}>Reçu aujourd'hui</th>
              </tr>
            </thead>
            <tbody>
              {receptionDetails.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: "1px solid var(--lfd-surface-3)" }}>
                  <td style={{ padding: "10px", fontWeight: 500, color: "var(--lfd-surface)" }}>{item.product_name}</td>
                  <td style={{ padding: "10px", textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ padding: "10px", textAlign: "center", color: "var(--lfd-text-dim)" }}>{item.received_quantity}</td>
                  <td style={{ padding: "10px", textAlign: "center", color: "#EF4444", fontWeight: 600 }}>{item.remaining_quantity}</td>
                  <td style={{ padding: "10px", textAlign: "right" }}>
                    <input 
                      type="number"
                      min="0"
                      max={item.remaining_quantity}
                      value={item.quantity_to_receive_today}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        const newDetails = [...receptionDetails];
                        newDetails[idx].quantity_to_receive_today = Math.min(val, item.remaining_quantity);
                        setReceptionDetails(newDetails);
                      }}
                      style={{ width: "90px", padding: "8px", border: "1px solid var(--lfd-surface-3)", borderRadius: 6, textAlign: "right", outline: "none" }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10, paddingTop: 16, borderTop: "1px solid var(--lfd-surface-3)" }}>
            <button
              onClick={() => setIsReceptionModalOpen(false)}
              className="lfd-btn lfd-btn-secondary" style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", background: "transparent", cursor: "pointer", fontWeight: 600, color: "var(--lfd-text-dim)" }}
            >
              Annuler
            </button>
            <button
              onClick={handleConfirmReception}
              disabled={receptionLoading}
              className="lfd-btn lfd-btn-primary" style={{ padding: "10px 16px", borderRadius: 8, background: "#2563EB", color: "white", border: "none", cursor: "pointer", fontWeight: 600, opacity: receptionLoading ? 0.7 : 1 }}
            >
              {receptionLoading ? "Enregistrement..." : "CONFIRMER RÉCEPTION"}
            </button>
          </div>
        </div>
      </LFDModal>

    </div>
  );
};

export default Magasin;
