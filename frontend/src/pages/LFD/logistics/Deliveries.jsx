import React, { useState, useEffect } from "react";
import { Truck, CheckCircle, XCircle, MapPin, Package } from "lucide-react";
import LFDModal from "../../../components/LFD/LFDModal";
import { useLFDAuth } from "../../../contexts/LFDAuthContext";
import axios from "axios";

const Deliveries = () => {
  const { lfdToken, employee } = useLFDAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDeliv, setSelectedDeliv] = useState(null);
  
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isFailModalOpen, setIsFailModalOpen] = useState(false);
  const [completeForm, setCompleteForm] = useState({ recipient_name: "", recipient_phone: "" });
  const [failForm, setFailForm] = useState({ failed_reason: "" });

  const fetchDeliveries = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/lfd/ops/deliveries", {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      setDeliveries(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [lfdToken]);

  const handleStart = async (id) => {
    try {
      await axios.post(`http://localhost:5001/api/lfd/ops/deliveries/${id}/start`, {}, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      fetchDeliveries();
    } catch (err) {
      alert(err.response?.data?.error || "Erreur");
    }
  };

  const handleComplete = async () => {
    if (!completeForm.recipient_name) return alert("Nom du réceptionnaire requis");
    try {
      await axios.post(`http://localhost:5001/api/lfd/ops/deliveries/${selectedDeliv.id}/complete`, completeForm, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      setIsCompleteModalOpen(false);
      setCompleteForm({ recipient_name: "", recipient_phone: "" });
      fetchDeliveries();
    } catch (err) {
      alert(err.response?.data?.error || "Erreur");
    }
  };

  const handleFail = async () => {
    if (!failForm.failed_reason) return alert("Motif d'échec requis");
    try {
      await axios.post(`http://localhost:5001/api/lfd/ops/deliveries/${selectedDeliv.id}/fail`, failForm, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      setIsFailModalOpen(false);
      setFailForm({ failed_reason: "" });
      fetchDeliveries();
    } catch (err) {
      alert(err.response?.data?.error || "Erreur");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "READY": return <span className="lfd-badge lfd-badge-warning">Prêt à livrer</span>;
      case "IN_DELIVERY": return <span className="lfd-badge lfd-badge-info">En Route</span>;
      case "DELIVERED": return <span className="lfd-badge lfd-badge-success">Livré</span>;
      case "FAILED": return <span className="lfd-badge lfd-badge-danger">Échec</span>;
      case "CANCELLED": return <span className="lfd-badge" style={{ background:"#F1F5F9", color:"#64748B" }}>Annulé</span>;
      default: return null;
    }
  };

  return (
    <div className="lfd-page" style={{ padding: "20px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--lfd-surface)" }}>Gestion des Livraisons</h1>
        <p style={{ color: "var(--lfd-text-dim)", fontSize: "0.9rem" }}>Gérez les bons de livraison et les expéditions</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
        {deliveries.map(d => (
          <div key={d.id} className="lfd-card" style={{ display: "flex", flexDirection: "column", gap: "16px", margin: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #F1F5F9", paddingBottom: "12px" }}>
              <div>
                <h3 style={{ fontWeight: 700, color: "var(--lfd-surface)", display: "flex", alignItems: "center", gap: "8px", fontSize: "1.1rem" }}>
                  <Truck size={18} style={{ color: "var(--lfd-accent)" }} />
                  {d.delivery_number}
                </h3>
                <p style={{ fontSize: "0.8rem", color: "var(--lfd-text-dim)", marginTop: "4px" }}>Lié à la vente : {d.sale_number}</p>
              </div>
              {getStatusBadge(d.status)}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.9rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--lfd-text-dark)" }}>
                <MapPin size={16} style={{ color: "var(--lfd-text-dim)" }} />
                <span>Client : <strong>{d.customer_name}</strong></span>
              </div>
              {d.recipient_name && (
                <div style={{ color: "var(--lfd-text-dim)", fontSize: "0.85rem", paddingLeft: "24px" }}>Réceptionnaire : {d.recipient_name}</div>
              )}
              {d.failed_reason && (
                <div style={{ color: "#DC2626", fontSize: "0.85rem", paddingLeft: "24px", background: "rgba(239,68,68,0.1)", padding: "8px", borderRadius: "6px", marginTop: "4px" }}>Motif : {d.failed_reason}</div>
              )}
            </div>

            <div style={{ paddingTop: "12px", borderTop: "1px solid #F1F5F9", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              {d.status === "READY" && (
                <button 
                  onClick={() => handleStart(d.id)}
                  className="lfd-btn lfd-btn-primary" style={{ width: "100%", justifyContent: "center" }}
                >
                  Prendre en charge
                </button>
              )}
              {d.status === "IN_DELIVERY" && (
                <>
                  <button 
                    onClick={() => { setSelectedDeliv(d); setIsFailModalOpen(true); }}
                    className="lfd-btn" style={{ flex: 1, justifyContent: "center", background: "white", border: "1px solid #DC2626", color: "#DC2626" }}
                  >
                    <XCircle size={16} /> Échec
                  </button>
                  <button 
                    onClick={() => { setSelectedDeliv(d); setIsCompleteModalOpen(true); }}
                    className="lfd-btn" style={{ flex: 1, justifyContent: "center", background: "#10B981", color: "white" }}
                  >
                    <CheckCircle size={16} /> Livré
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {deliveries.length === 0 && (
          <div style={{ gridColumn: "1 / -1", padding: "40px", textAlign: "center", color: "var(--lfd-text-dim)", background: "white", borderRadius: "12px", border: "1px dashed #E2E8F0" }}>
            Aucun bon de livraison disponible.
          </div>
        )}
      </div>

      <LFDModal isOpen={isCompleteModalOpen} onClose={() => setIsCompleteModalOpen(false)} title="Confirmer la livraison">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du réceptionnaire *</label>
            <input 
              type="text" 
              value={completeForm.recipient_name}
              onChange={e => setCompleteForm({...completeForm, recipient_name: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="Ex: Jean Dupont"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone (Optionnel)</label>
            <input 
              type="text" 
              value={completeForm.recipient_phone}
              onChange={e => setCompleteForm({...completeForm, recipient_phone: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="Ex: 01020304"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button onClick={() => setIsCompleteModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Annuler</button>
            <button onClick={handleComplete} className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700">Valider</button>
          </div>
        </div>
      </LFDModal>

      <LFDModal isOpen={isFailModalOpen} onClose={() => setIsFailModalOpen(false)} title="Signaler un échec de livraison">
        <div className="space-y-4">
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
            Attention, déclarer un échec déclenchera une alerte et nécessitera un retour en stock de la marchandise.
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motif de l'échec *</label>
            <textarea 
              value={failForm.failed_reason}
              onChange={e => setFailForm({...failForm, failed_reason: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none h-24 resize-none"
              placeholder="Ex: Client absent, Adresse introuvable..."
            ></textarea>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button onClick={() => setIsFailModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Annuler</button>
            <button onClick={handleFail} className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700">Confirmer l'échec</button>
          </div>
        </div>
      </LFDModal>

    </div>
  );
};

export default Deliveries;
