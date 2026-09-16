import React from "react";
import {
  LayoutDashboard, TrendingUp, Wallet, Landmark, Package, Users,
  FileText, ShoppingCart, Truck, BarChart3, Bell, Shield, UserCog,
  Settings, LogOut, ChevronRight, Building2, ClipboardList
} from "lucide-react";
import { useLFDAuth, ROLE_LABELS } from "../../contexts/LFDAuthContext";
import { useNavigate } from "react-router-dom";

const NAV_SECTIONS = [
  {
    label: "Direction",
    items: [
      { id:"direction",     icon:LayoutDashboard, label:"Tableau de bord",  path:"/gestion/direction",       perm:"direction.read" },
    ]
  },
  {
    label: "Commercial",
    items: [
      { id:"ventes",        icon:TrendingUp,     label:"Ventes",           path:"/gestion/ventes",          perm:"sale.read" },
      { id:"facturation",   icon:FileText,       label:"Facturation",      path:"/gestion/facturation",     perm:"invoice.read" },
      { id:"clients",       icon:Users,          label:"Clients",          path:"/gestion/clients",         perm:"invoice.read" },
      { id:"creances",      icon:ClipboardList,  label:"Creances",         path:"/gestion/creances",        perm:"credit.read" },
    ]
  },
  {
    label: "Achats",
    items: [
      { id:"fournisseurs",  icon:Building2,      label:"Fournisseurs",     path:"/gestion/fournisseurs",    perm:"supplier.read" },
      { id:"commandes-achat", icon:ShoppingCart, label:"Commandes",        path:"/gestion/commandes-achat", perm:"purchase.read" },
      { id:"receptions",    icon:Package,        label:"Réceptions",       path:"/gestion/magasin?tab=receptions", perm:"receipt.read" },
      { id:"factures-fournisseurs", icon:FileText, label:"Factures",       path:"/gestion/factures-fournisseurs", perm:"supplier_invoice.read" },
      { id:"dettes-fournisseurs", icon:Wallet,   label:"Dettes & Paiements",path:"/gestion/dettes-fournisseurs", perm:"payable.read" },
    ]
  },
  {
    label: "Finances",
    items: [
      { id:"caisse",        icon:Wallet,         label:"Caisse",           path:"/gestion/caisse",          perm:"cash.read" },
      { id:"banque",        icon:Landmark,       label:"Banque",           path:"/gestion/banque",          perm:"bank.read" },
      { id:"depots",        icon:Landmark,       label:"Dépôts Bancaires", path:"/gestion/finances/depots", perm:"bank.deposit.read" },
      { id:"comptabilite",  icon:BarChart3,      label:"Comptabilite",     path:"/gestion/comptabilite",    perm:"accounting.read" },
    ]
  },
  {
    label: "Operations",
    items: [
      { id:"stock",         icon:Package,        label:"Stock",            path:"/gestion/stock",           perm:"stock.read" },
      { id:"magasin",       icon:Package,        label:"Magasin (Sorties)",path:"/gestion/magasin",         perm:"stock_release.read" },
      { id:"commandes",     icon:ShoppingCart,   label:"Commandes Client", path:"/gestion/commandes",       perm:"order.read" },
      { id:"livraisons",    icon:Truck,          label:"Livraisons",       path:"/gestion/livraisons",      perm:"delivery.read" },
    ]
  },
  {
    label: "Controle",
    items: [
      { id:"rapports",      icon:BarChart3,      label:"Rapports",         path:"/gestion/rapports",        perm:"report.read" },
      { id:"alertes",       icon:Bell,           label:"Alertes",          path:"/gestion/alertes",         perm:"report.read" },
      { id:"audit",         icon:Shield,         label:"Audit",            path:"/gestion/audit",           perm:"audit.read" },
    ]
  },
  {
    label: "Administration",
    items: [
      { id:"employes",      icon:UserCog,        label:"Employes",         path:"/gestion/employes",        perm:"employee.read" },
      { id:"parametres",    icon:Settings,       label:"Parametres",       path:"/gestion/parametres",      perm:"settings.read" },
    ]
  },
];

const LFDSidebar = ({ activeId, onNavigate, isOpen, onClose }) => {
  const { lfdUser, logout, hasPermission } = useLFDAuth();
  const navigate = useNavigate();

  const handleNav = (item) => {
    if (item.phase2) { alert("Module en cours de developpement � Phase 2"); return; }
    navigate(item.path);
    if (onNavigate) onNavigate(item.id);
    if (onClose) onClose();
  };

  return (
    <aside className={`lfd-sidebar ${isOpen ? "open" : ""}`}>
      {/* Brand */}
      <div className="lfd-sidebar-brand">
        <div className="lfd-sidebar-logo">
          <div className="lfd-sidebar-logo-icon">LF</div>
          <div className="lfd-sidebar-logo-text">
            <span className="lfd-sidebar-logo-title">La Foi Distribution</span>
            <span className="lfd-sidebar-logo-sub">Gestion Interne</span>
          </div>
        </div>
      </div>



      {/* Navigation */}
      <nav className="lfd-sidebar-nav">
        {NAV_SECTIONS.map(section => {
          const visibleItems = section.items.filter(it => hasPermission(it.perm));
          if (visibleItems.length === 0) return null;
          return (
            <div key={section.label}>
              <div className="lfd-nav-section">{section.label}</div>
              {visibleItems.map(item => (
                <div
                  key={item.id}
                  className={`lfd-nav-item ${activeId === item.id ? "active" : ""} `}
                  onClick={() => handleNav(item)}
                  title={item.label}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                  
                  {activeId === item.id && <ChevronRight size={14} style={{ marginLeft:"auto" }} />}
                </div>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="lfd-sidebar-footer">
        <button className="lfd-logout-btn" onClick={logout}>
          <LogOut size={18} />
          <span>Deconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default LFDSidebar;
