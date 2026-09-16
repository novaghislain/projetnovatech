import React, { useState } from "react";
import LFDSidebar from "./LFDSidebar";
import LFDHeader from "./LFDHeader";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard, TrendingUp, Wallet, Landmark, Package, FileText,
  ShoppingCart, Truck, BarChart3, Bell, Menu, X
} from "lucide-react";
import { useLFDAuth } from "../../contexts/LFDAuthContext";

// Bottom nav items (mobile - 5 max)
const BOTTOM_NAV = [
  { id:"direction",   label:"Dashboard",  icon:LayoutDashboard, path:"/gestion/direction" },
  { id:"ventes",      label:"Ventes",     icon:TrendingUp,      path:"/gestion/ventes",  phase2:true },
  { id:"caisse",      label:"Caisse",     icon:Wallet,          path:"/gestion/caisse",  phase2:true },
  { id:"alertes",     label:"Alertes",    icon:Bell,            path:"/gestion/alertes", phase2:true },
];

const getActiveId = (pathname) => {
  if (pathname.includes("/depots")) return "depots";
  if (pathname.includes("/commandes-achat")) return "commandes-achat";
  if (pathname.includes("/factures-fournisseurs")) return "factures-fournisseurs";
  if (pathname.includes("/dettes-fournisseurs")) return "dettes-fournisseurs";
  if (pathname.includes("/magasin?tab=receptions") || pathname.includes("/receptions")) return "receptions";
  
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length >= 2) {
    // If it's a sub-page of comptabilite, keep comptabilite active
    if (parts[1] === "comptabilite") return "comptabilite";
    if (parts[1] === "direction") return "direction";
    return parts[1];
  }
  return "direction";
};

const PAGE_TITLES = {
  direction:    { title:"Tableau de bord Direction", subtitle:"Vue globale de l'activite commerciale" },
  ventes:       { title:"Ventes",           subtitle:"Suivi des transactions commerciales" },
  facturation:  { title:"Facturation",      subtitle:"Gestion des factures et bons" },
  clients:      { title:"Clients",          subtitle:"Base clients et contacts" },
  creances:     { title:"Creances",         subtitle:"Suivi des credits et echeances" },
  caisse:       { title:"Caisse",           subtitle:"Operations d'encaissement et decaissement" },
  banque:       { title:"Banque",           subtitle:"Depots et rapprochements bancaires" },
  comptabilite: { title:"Comptabilite",     subtitle:"Journal et rapports comptables" },
  stock:        { title:"Stock",            subtitle:"Gestion des mouvements de marchandises" },
  magasin:      { title:"Magasin",          subtitle:"Contrôle et préparation des commandes" },
  commandes:    { title:"Commandes",        subtitle:"Preparation et suivi des commandes" },
  livraisons:   { title:"Livraisons",       subtitle:"Planification et suivi des livraisons" },
  rapports:     { title:"Rapports",         subtitle:"Analyses et exports" },
  alertes:      { title:"Alertes",          subtitle:"Notifications et anomalies" },
  audit:        { title:"Audit",            subtitle:"Trace et historique des operations" },
  employes:     { title:"Employes",         subtitle:"Gestion du personnel" },
  parametres:   { title:"Parametres",       subtitle:"Configuration du systeme" },
};

const LFDLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout } = useLFDAuth();
  const activeId = getActiveId(location.pathname);
  const pageInfo = PAGE_TITLES[activeId] || { title:"Gestion", subtitle:"" };

  return (
    <div className="lfd-app">
      <div className="lfd-root">
        {/* Overlay mobile */}
        {sidebarOpen && (
          <div className="lfd-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <LFDSidebar
          activeId={activeId}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Header desktop */}
        <LFDHeader
          pageTitle={pageInfo.title}
          pageSubtitle={pageInfo.subtitle}
          onMobileMenuOpen={() => setSidebarOpen(true)}
          alertCount={2}
        />

        {/* Mobile topbar */}
        <div className="lfd-mobile-topbar">
          <div className="lfd-mobile-topbar-logo">
            <div style={{ width:30, height:30, background:"linear-gradient(135deg,#1A1A2E,#0F3460)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:12, color:"white" }}>LF</div>
            <span>La Foi Distribution</span>
          </div>
          <button className="lfd-mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
        </div>

        {/* Contenu principal */}
        <main className="lfd-main">
          <div className="lfd-page-content">
            {children}
          </div>
        </main>

        {/* Bottom nav mobile */}
        <nav className="lfd-bottom-nav">
          {BOTTOM_NAV.map(item => (
            <div
              key={item.id}
              className={`lfd-bottom-nav-item ${activeId === item.id ? "active" : ""}`}
              onClick={() => {
                if (item.phase2) { alert("Module Phase 2"); return; }
                window.location.href = item.path;
              }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </div>
          ))}
          <div className="lfd-bottom-nav-item" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
            <span>Menu</span>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default LFDLayout;

