import React, { useState, useEffect } from "react";
import { Search, CheckCircle, Clock, FileText, Package, AlertTriangle } from "lucide-react";
import LFDModal from "../../../components/LFD/LFDModal";
import { useLFDAuth } from "../../../contexts/LFDAuthContext";
import axios from "axios";

const Magasin = () => {
  const { lfdToken, employee } = useLFDAuth();
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
      alert(err.response?.data?.error || "Erreur de démarrage");
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
      alert("Préparation terminée avec succès.");
      setIsPrepModalOpen(false);
      fetchPreparations();
    } catch (err) {
      alert(err.response?.data?.error || "Erreur");
    }
  };

  const handleRelease = async (prepId) => {
    try {
      await axios.post(`http://localhost:5001/api/lfd/ops/preparations/${prepId}/release`, {}, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      alert("Sortie validée avec succès. Bon de Livraison généré.");
      fetchReleases();
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors de la sortie");
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
      alert(err.response?.data?.error || "Erreur de chargement");
    }
  };

  const handleConfirmReception = async () => {
    if (!window.confirm("Confirmer la réception de ces produits ? Cette opération modifiera le stock.")) return;
    setReceptionLoading(true);
    try {
      const payload = {
        purchase_order_id: selectedCommande.id,
        items: receptionDetails.map(i => ({ product_id: i.product_id, quantity_received: parseInt(i.quantity_to_receive_today) })).filter(i => i.quantity_received > 0)
      };
      
      if (payload.items.length === 0) {
        alert("Veuillez saisir au moins une quantité reçue.");
        setReceptionLoading(false);
        return;
      }

      await axios.post(`http://localhost:5001/api/lfd/receipts`, payload, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      alert("Réception enregistrée avec succès.");
      setIsReceptionModalOpen(false);
      fetchReceptionsAttente();
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors de la réception");
    } finally {
      setReceptionLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Contrôle Magasin</h1>
          <p className="text-gray-500">Gérez les préparations et validez les sorties physiques</p>
        </div>
      </div>

      <div className="flex space-x-4 border-b border-gray-200">
        <button
          className={`py-3 px-6 font-medium ${activeTab === 'preparations' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('preparations')}
        >
          À Préparer (Sorties)
        </button>
        <button
          className={`py-3 px-6 font-medium ${activeTab === 'sorties' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('sorties')}
        >
          Double Contrôle (Sorties)
        </button>
        <button
          className={`py-3 px-6 font-medium ${activeTab === 'receptions' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('receptions')}
        >
          Réceptions Fournisseurs
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {activeTab === 'preparations' && (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="px-6 py-4">N° Préparation</th>
                <th className="px-6 py-4">N° Vente</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {preparations.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{p.preparation_number}</td>
                  <td className="px-6 py-4 text-gray-600">{p.sale_number}</td>
                  <td className="px-6 py-4 text-gray-600">{p.customer_name}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      À Préparer
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleStartPrep(p.id)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium text-sm border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-50"
                    >
                      Démarrer
                    </button>
                  </td>
                </tr>
              ))}
              {preparations.length === 0 && (
                <tr><td colSpan="5" className="text-center py-8 text-gray-500">Aucune préparation en attente</td></tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'sorties' && (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="px-6 py-4">N° Préparation</th>
                <th className="px-6 py-4">N° Vente</th>
                <th className="px-6 py-4">Préparé Par</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stockReleases.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{p.preparation_number}</td>
                  <td className="px-6 py-4 text-gray-600">{p.sale_number}</td>
                  <td className="px-6 py-4 text-gray-600">ID: {p.prepared_by}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex items-center w-max gap-1">
                      <Clock size={14} /> Attente Contrôle
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {p.prepared_by === employee?.id ? (
                      <span className="text-sm text-red-500 font-medium">Auto-contrôle interdit</span>
                    ) : (
                      <button 
                        onClick={() => handleRelease(p.id)}
                        className="text-green-600 hover:text-green-900 font-medium text-sm border border-green-200 px-4 py-2 rounded-lg hover:bg-green-50 flex items-center gap-2 ml-auto"
                      >
                        <CheckCircle size={16} /> Valider Sortie
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {stockReleases.length === 0 && (
                <tr><td colSpan="5" className="text-center py-8 text-gray-500">Aucun bon en attente de contrôle croisé</td></tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'receptions' && (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="px-6 py-4">Commande</th>
                <th className="px-6 py-4">Fournisseur</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {receptionsEnAttente.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{c.purchase_order_number}</td>
                  <td className="px-6 py-4 text-gray-600">{c.supplier_name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${c.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'}`}>
                      {c.status === 'APPROVED' ? 'Attente Réception' : 'Réc. Partielle'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleStartReception(c.id)}
                      className="text-blue-600 hover:text-blue-900 font-medium text-sm border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 flex items-center gap-2 ml-auto"
                    >
                      <Package size={16} /> Réceptionner
                    </button>
                  </td>
                </tr>
              ))}
              {receptionsEnAttente.length === 0 && (
                <tr><td colSpan="4" className="text-center py-8 text-gray-500">Aucune commande en attente de réception</td></tr>
              )}
            </tbody>
          </table>
        )}

      </div>

      {/* Modal de Préparation */}
      <LFDModal isOpen={isPrepModalOpen} onClose={() => setIsPrepModalOpen(false)} title={`Préparation : ${selectedPrep?.preparation_number}`}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Veuillez vérifier les quantités physiques préparées pour chaque article.</p>
          
          <table className="w-full text-left border">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-sm text-gray-600">Produit</th>
                <th className="p-3 text-sm text-gray-600 text-right">Qté Commandée</th>
                <th className="p-3 text-sm text-gray-600 text-right">Qté Préparée</th>
              </tr>
            </thead>
            <tbody>
              {prepDetails.map((item, idx) => (
                <tr key={item.id} className="border-b">
                  <td className="p-3">
                    <div className="font-medium">{item.product_name}</div>
                    <div className="text-xs text-gray-500">{item.product_code}</div>
                  </td>
                  <td className="p-3 text-right font-medium text-gray-800">{item.quantity_to_prepare}</td>
                  <td className="p-3 text-right">
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
                      className="w-20 p-2 border border-gray-300 rounded text-right focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {prepDetails.some(i => i.quantity_prepared < i.quantity_to_prepare) && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2 text-yellow-800 text-sm">
              <AlertTriangle className="shrink-0" size={18} />
              <p>Attention : Les quantités préparées sont inférieures aux quantités commandées. Une alerte sera générée.</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setIsPrepModalOpen(false)}
              className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleCompletePrep}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Terminer la préparation
            </button>
          </div>
        </div>
      </LFDModal>

      {/* Modal de Réception */}
      <LFDModal isOpen={isReceptionModalOpen} onClose={() => setIsReceptionModalOpen(false)} title={`Réception - ${selectedCommande?.purchase_order_number}`}>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-4">
            <p className="font-semibold">Fournisseur : {selectedCommande?.supplier_name}</p>
            <p>Veuillez saisir la quantité réellement reçue aujourd'hui pour chaque produit.</p>
          </div>
          
          <table className="w-full text-left border">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-sm text-gray-600">Produit</th>
                <th className="p-3 text-sm text-gray-600 text-center">Commandé</th>
                <th className="p-3 text-sm text-gray-600 text-center">Déjà Reçu</th>
                <th className="p-3 text-sm text-gray-600 text-center">Reste</th>
                <th className="p-3 text-sm text-gray-600 text-right">Reçu aujourd'hui</th>
              </tr>
            </thead>
            <tbody>
              {receptionDetails.map((item, idx) => (
                <tr key={item.id} className="border-b">
                  <td className="p-3 font-medium">{item.product_name}</td>
                  <td className="p-3 text-center">{item.quantity}</td>
                  <td className="p-3 text-center text-gray-500">{item.received_quantity}</td>
                  <td className="p-3 text-center text-red-600 font-medium">{item.remaining_quantity}</td>
                  <td className="p-3 text-right">
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
                      className="w-24 p-2 border border-gray-300 rounded text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setIsReceptionModalOpen(false)}
              className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirmReception}
              disabled={receptionLoading}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
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
