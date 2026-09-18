import { API_URL } from '../../../config';
import React, { useState, useEffect } from "react";
import { Bell, AlertTriangle, Info, CheckCircle2, Search, Check } from "lucide-react";
import { useLFDAuth } from "../../../contexts/LFDAuthContext";
import axios from "axios";

const Alertes = () => {
  const { lfdToken } = useLFDAuth();
  const [alertes, setAlertes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAlerts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/lfd/alerts`, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      setAlertes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [lfdToken]);

  const handleResolve = async (id) => {
    try {
      await axios.post(`${API_URL}/api/lfd/alerts/${id}/resolve`, {}, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      fetchAlerts();
    } catch (err) {
      alert("Erreur lors de la résolution");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "CRITICAL": return <AlertTriangle size={20} color="#EF4444" />;
      case "WARNING": return <AlertTriangle size={20} color="#F59E0B" />;
      default: return <Info size={20} color="#3B82F6" />;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Centre d'Alertes</h1>
          <p className="text-gray-500 text-sm">Surveillez les événements critiques nécessitant votre attention.</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {alertes.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-xl border border-gray-100 shadow-sm">
            <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
            <h3 className="text-gray-800 font-bold mb-1">Aucune alerte</h3>
            <p className="text-gray-500 text-sm">Tout fonctionne parfaitement.</p>
          </div>
        ) : alertes.map((alerte) => (
          <div key={alerte.id} className="flex items-start gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm" style={{ borderLeft: `4px solid ${alerte.alert_level === 'CRITICAL' ? '#EF4444' : alerte.alert_level === 'WARNING' ? '#F59E0B' : '#3B82F6'}` }}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${alerte.alert_level === 'CRITICAL' ? 'bg-red-50' : alerte.alert_level === 'WARNING' ? 'bg-yellow-50' : 'bg-blue-50'}`}>
              {getIcon(alerte.alert_level)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-gray-800 text-sm">{alerte.title}</h3>
                <span className="text-xs text-gray-400">{new Date(alerte.created_at).toLocaleString()}</span>
              </div>
              <p className="text-gray-500 text-sm">{alerte.message}</p>
              <p className="text-xs text-gray-400 mt-2 border-t pt-2 inline-block">Ref: {alerte.reference_id}</p>
            </div>
            <button onClick={() => handleResolve(alerte.id)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 flex items-center gap-1.5 transition-colors">
              <Check size={14} /> Résoudre
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Alertes;
