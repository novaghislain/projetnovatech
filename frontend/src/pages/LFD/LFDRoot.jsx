import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LFDAuthProvider } from "../../contexts/LFDAuthContext";
import { LFDAlertProvider } from "../../contexts/LFDAlertContext";
import { LFDDataProvider } from "../../contexts/LFDDataContext";
import LFDProtectedRoute from "./LFDProtectedRoute";
import LFDLayout from "./LFDLayout";
import LFDLogin from "./LFDLogin";
import "./lfd.css";

// Lazy loading pour optimiser le bundle
const DirectionDashboard = lazy(() => import("./direction/DirectionDashboard"));
const CrossCheckDashboard = lazy(() => import("./direction/CrossCheckDashboard"));
const Ventes = lazy(() => import("./commercial/Ventes"));
const Facturation = lazy(() => import("./commercial/Facturation"));
const Clients = lazy(() => import("./commercial/Clients"));
const Creances = lazy(() => import("./commercial/Creances"));
const Caisse = lazy(() => import("./finances/Caisse"));
const Banque = lazy(() => import("./finances/Banque"));
const BankDeposits = lazy(() => import("./finances/BankDeposits"));
const ComptaDashboard = lazy(() => import("./comptabilite/ComptaDashboard"));
const SaisieEcriture = lazy(() => import("./comptabilite/SaisieEcriture"));
const GrandLivre = lazy(() => import("./comptabilite/GrandLivre"));
const BalanceGenerale = lazy(() => import("./comptabilite/BalanceGenerale"));
const Journaux = lazy(() => import("./comptabilite/Journaux"));
const ParametresComptables = lazy(() => import("./comptabilite/ParametresComptables"));
const Stock = lazy(() => import("./operations/Stock"));
const Magasin = lazy(() => import("./logistics/Magasin"));
const Commandes = lazy(() => import("./operations/Commandes"));
const Livraisons = lazy(() => import("./logistics/Deliveries"));
const Rapports = lazy(() => import("./administration/Rapports"));
const Alertes = lazy(() => import("./administration/Alertes"));
const Audit = lazy(() => import("./administration/Audit"));
const Employes = lazy(() => import("./administration/Employes"));
const Parametres = lazy(() => import("./administration/Parametres"));

// Modules Phase 5A (Achats & Fournisseurs)
const Fournisseurs = lazy(() => import("./commercial/Fournisseurs"));
const CommandesAchat = lazy(() => import("./operations/CommandesAchat"));
const FacturesFournisseurs = lazy(() => import("./finances/FacturesFournisseurs"));
const DettesFournisseurs = lazy(() => import("./finances/DettesFournisseurs"));

// Placeholder pour modules Phase 2
const Placeholder = ({ module }) => (
  <div className="lfd-app">
    <div className="lfd-placeholder-page">
      <div className="lfd-placeholder-icon">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 12h6M12 9v6"/></svg>
      </div>
            <div className="lfd-placeholder-title">{module}</div>
      <div className="lfd-placeholder-desc">Ce module sera disponible en Phase 2. L'architecture et les permissions sont deja configurees.</div>
      <span className="lfd-placeholder-tag">Phase 2 — En developpement</span>
    </div>
  </div>
);

// Acces refuse
const AccessDenied = () => (
  <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F1F5F9", fontFamily:"Inter,sans-serif" }}>
    <div style={{ textAlign:"center", padding:40 }}>
      <div style={{ fontSize:"3rem", marginBottom:16 }}><span>🔒</span></div>
      <h2 style={{ color:"#0F172A", marginBottom:8 }}><span>Acces refuse</span></h2>
      <p style={{ color:"#64748B" }}><span>Vous n'avez pas les permissions necessaires pour acceder a cette section.</span></p>
      <button onClick={() => window.history.back()} style={{ marginTop:20, padding:"10px 20px", background:"#1A1A2E", color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:600 }}><span>Retour</span></button>
    </div>
  </div>
);

const LFDRoot = () => {
  return (
    <LFDAlertProvider>
      <LFDAuthProvider>
        <LFDDataProvider>
          <Suspense fallback={<div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"#0F172A" }}><div className="lfd-spinner" /></div>}>
            <Routes>
              {/* Page de connexion (publique) */}
              <Route path="connexion" element={<LFDLogin />} />

            {/* Acces refuse */}
            <Route path="acces-refuse" element={<AccessDenied />} />

            {/* Redirection racine */}
            <Route path="" element={<Navigate to="connexion" replace />} />

            {/* Dashboard Direction */}
            <Route path="direction" element={
              <LFDProtectedRoute requiredPermission="direction.read">
                <LFDLayout>
                  <DirectionDashboard />
                </LFDLayout>
              </LFDProtectedRoute>
            } />
            <Route path="direction/controles" element={
              <LFDProtectedRoute requiredPermission="direction.read">
                <LFDLayout>
                  <CrossCheckDashboard />
                </LFDLayout>
              </LFDProtectedRoute>
            } />

            {/* Modules Phase 2 — commerciaux actifs */}
            <Route path="ventes" element={
              <LFDProtectedRoute requiredPermission="invoice.read">
                <LFDLayout>
                  <Ventes />
                </LFDLayout>
              </LFDProtectedRoute>
            } />
            
            <Route path="facturation" element={
              <LFDProtectedRoute requiredPermission="invoice.read">
                <LFDLayout>
                  <Facturation />
                </LFDLayout>
              </LFDProtectedRoute>
            } />

            <Route path="clients" element={
              <LFDProtectedRoute requiredPermission="invoice.read">
                <LFDLayout>
                  <Clients />
                </LFDLayout>
              </LFDProtectedRoute>
            } />
            
            <Route path="creances" element={
              <LFDProtectedRoute requiredPermission="credit.read">
                <LFDLayout>
                  <Creances />
                </LFDLayout>
              </LFDProtectedRoute>
            } />

            {/* --- Phase 5A : Achats et Fournisseurs --- */}
            <Route path="fournisseurs" element={
              <LFDProtectedRoute requiredPermission="supplier.read">
                <LFDLayout>
                  <Fournisseurs />
                </LFDLayout>
              </LFDProtectedRoute>
            } />
            
            <Route path="commandes-achat" element={
              <LFDProtectedRoute requiredPermission="purchase.read">
                <LFDLayout>
                  <CommandesAchat />
                </LFDLayout>
              </LFDProtectedRoute>
            } />

            <Route path="factures-fournisseurs" element={
              <LFDProtectedRoute requiredPermission="supplier_invoice.read">
                <LFDLayout>
                  <FacturesFournisseurs />
                </LFDLayout>
              </LFDProtectedRoute>
            } />

            <Route path="dettes-fournisseurs" element={
              <LFDProtectedRoute requiredPermission="payable.read">
                <LFDLayout>
                  <DettesFournisseurs />
                </LFDLayout>
              </LFDProtectedRoute>
            } />
            {/* ----------------------------------------- */}

            <Route path="caisse" element={
              <LFDProtectedRoute requiredPermission="cash.read">
                <LFDLayout>
                  <Caisse />
                </LFDLayout>
              </LFDProtectedRoute>
            } />
            
            <Route path="banque" element={
              <LFDProtectedRoute requiredPermission="bank.read">
                <LFDLayout>
                  <Banque />
                </LFDLayout>
              </LFDProtectedRoute>
            } />
            
            <Route path="finances/depots" element={
              <LFDProtectedRoute requiredPermission="bank.deposit.read">
                <LFDLayout>
                  <BankDeposits />
                </LFDLayout>
              </LFDProtectedRoute>
            } />

            <Route path="comptabilite" element={
              <LFDProtectedRoute requiredPermission="accounting.read">
                <LFDLayout>
                  <ComptaDashboard />
                </LFDLayout>
              </LFDProtectedRoute>
            } />
            <Route path="comptabilite/saisie" element={
              <LFDProtectedRoute requiredPermission="accounting.create">
                <LFDLayout>
                  <SaisieEcriture />
                </LFDLayout>
              </LFDProtectedRoute>
            } />
            <Route path="comptabilite/grand-livre" element={
              <LFDProtectedRoute requiredPermission="accounting.read">
                <LFDLayout>
                  <GrandLivre />
                </LFDLayout>
              </LFDProtectedRoute>
            } />
            <Route path="comptabilite/balance" element={
              <LFDProtectedRoute requiredPermission="accounting.read">
                <LFDLayout>
                  <BalanceGenerale />
                </LFDLayout>
              </LFDProtectedRoute>
            } />
            <Route path="comptabilite/journaux/:id" element={
              <LFDProtectedRoute requiredPermission="accounting.read">
                <LFDLayout>
                  <Journaux />
                </LFDLayout>
              </LFDProtectedRoute>
            } />
            <Route path="comptabilite/parametres" element={
              <LFDProtectedRoute requiredPermission="accounting.read">
                <LFDLayout>
                  <ParametresComptables />
                </LFDLayout>
              </LFDProtectedRoute>
            } />

            <Route path="stock" element={
              <LFDProtectedRoute requiredPermission="stock.read">
                <LFDLayout>
                  <Stock />
                </LFDLayout>
              </LFDProtectedRoute>
            } />

            <Route path="magasin" element={
              <LFDProtectedRoute requiredPermission="stock_release.read">
                <LFDLayout>
                  <Magasin />
                </LFDLayout>
              </LFDProtectedRoute>
            } />

            <Route path="commandes" element={
              <LFDProtectedRoute requiredPermission="order.read">
                <LFDLayout>
                  <Commandes />
                </LFDLayout>
              </LFDProtectedRoute>
            } />

            <Route path="livraisons" element={
              <LFDProtectedRoute requiredPermission="delivery.read">
                <LFDLayout>
                  <Livraisons />
                </LFDLayout>
              </LFDProtectedRoute>
            } />

            <Route path="rapports" element={
              <LFDProtectedRoute requiredPermission="report.read">
                <LFDLayout>
                  <Rapports />
                </LFDLayout>
              </LFDProtectedRoute>
            } />

            <Route path="alertes" element={
              <LFDProtectedRoute requiredPermission="report.read">
                <LFDLayout>
                  <Alertes />
                </LFDLayout>
              </LFDProtectedRoute>
            } />

            <Route path="audit" element={
              <LFDProtectedRoute requiredPermission="audit.read">
                <LFDLayout>
                  <Audit />
                </LFDLayout>
              </LFDProtectedRoute>
            } />

            <Route path="employes" element={
              <LFDProtectedRoute requiredPermission="settings.manage">
                <LFDLayout>
                  <Employes />
                </LFDLayout>
              </LFDProtectedRoute>
            } />

            <Route path="parametres" element={
              <LFDProtectedRoute requiredPermission="settings.manage">
                <LFDLayout>
                  <Parametres />
                </LFDLayout>
              </LFDProtectedRoute>
            } />

            {/* Fin des routes LFD */}
            <Route path="*" element={<Navigate to="connexion" replace />} />
          </Routes>
        </Suspense>
      </LFDDataProvider>
      </LFDAuthProvider>
    </LFDAlertProvider>
  );
};

export default LFDRoot;
