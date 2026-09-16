import React, { createContext, useContext, useState } from "react";
import { 
  MOCK_VENTES, MOCK_FACTURES, MOCK_CAISSE, MOCK_BANQUE, 
  MOCK_STOCK, MOCK_COMMANDES, MOCK_LIVRAISONS, MOCK_ALERTES, 
  MOCK_EMPLOYES, MOCK_AUDIT, MOCK_CLIENTS, MOCK_CREANCES 
} from "../pages/LFD/mockDataPhase2";

const LFDDataContext = createContext();

export const LFDDataProvider = ({ children }) => {
  const [ventes, setVentes] = useState(MOCK_VENTES || []);
  const [factures, setFactures] = useState(MOCK_FACTURES || []);
  const [caisse, setCaisse] = useState(MOCK_CAISSE || []);
  const [banque, setBanque] = useState(MOCK_BANQUE || []);
  const [stock, setStock] = useState(MOCK_STOCK || []);
  const [commandes, setCommandes] = useState(MOCK_COMMANDES || []);
  const [livraisons, setLivraisons] = useState(MOCK_LIVRAISONS || []);
  const [alertes, setAlertes] = useState(MOCK_ALERTES || []);
  const [employes, setEmployes] = useState(MOCK_EMPLOYES || []);
  const [audit, setAudit] = useState(MOCK_AUDIT || []);
  const [clients, setClients] = useState(MOCK_CLIENTS || []);
  const [creances, setCreances] = useState(MOCK_CREANCES || []);

  const addVente = (vente) => {
    setVentes([vente, ...ventes]);
    // Also log audit
    setAudit([{ id: `AUD-${Date.now()}`, action: "Nouvelle Vente", detail: `Vente ${vente.id} créée`, utilisateur: "Current User", date: new Date().toLocaleString() }, ...audit]);
  };

  const addClient = (client) => {
    setClients([client, ...clients]);
  };

  const updateClient = (id, updatedData) => {
    setClients(clients.map(c => c.id === id ? { ...c, ...updatedData } : c));
  };

  const value = {
    ventes, setVentes, addVente,
    factures, setFactures,
    caisse, setCaisse,
    banque, setBanque,
    stock, setStock,
    commandes, setCommandes,
    livraisons, setLivraisons,
    alertes, setAlertes,
    employes, setEmployes,
    audit, setAudit,
    clients, setClients, addClient, updateClient,
    creances, setCreances
  };

  return <LFDDataContext.Provider value={value}>{children}</LFDDataContext.Provider>;
};

export const useLFDData = () => {
  const context = useContext(LFDDataContext);
  if (!context) throw new Error("useLFDData must be used within LFDDataProvider");
  return context;
};

