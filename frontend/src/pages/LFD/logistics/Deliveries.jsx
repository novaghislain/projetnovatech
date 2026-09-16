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
      case "READY": return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Prêt à livrer</span>;
      case "IN_DELIVERY": return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">En Route</span>;
      case "DELIVERED": return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Livré</span>;
      case "FAILED": return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Échec</span>;
      case "CANCELLED": return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Annulé</span>;
      default: return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestion des Livraisons</h1>
          <p className="text-gray-500">Gérez les bons de livraison et les expéditions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deliveries.map(d => (
          <div key={d.id} className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Truck size={18} className="text-indigo-600" />
                  {d.delivery_number}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Lié à la vente : {d.sale_number}</p>
              </div>
              {getStatusBadge(d.status)}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin size={16} className="text-gray-400" />
                <span>Client : <strong>{d.customer_name}</strong></span>
              </div>
              {d.recipient_name && (
                <div className="text-gray-600 text-xs ml-6">Réceptionnaire : {d.recipient_name}</div>
              )}
              {d.failed_reason && (
                <div className="text-red-600 text-xs ml-6 bg-red-50 p-2 rounded">Motif : {d.failed_reason}</div>
              )}
            </div>

            <div className="pt-3 flex gap-2 justify-end border-t border-gray-50">
              {d.status === "READY" && (
                <button 
                  onClick={() => handleStart(d.id)}
                  className="w-full py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  Prendre en charge
                </button>
              )}
              {d.status === "IN_DELIVERY" && (
                <>
                  <button 
                    onClick={() => { setSelectedDeliv(d); setIsFailModalOpen(true); }}
                    className="flex-1 py-2 border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors flex justify-center items-center gap-2"
                  >
                    <XCircle size={16} /> Échec
                  </button>
                  <button 
                    onClick={() => { setSelectedDeliv(d); setIsCompleteModalOpen(true); }}
                    className="flex-1 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex justify-center items-center gap-2"
                  >
                    <CheckCircle size={16} /> Livré
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {deliveries.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
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
