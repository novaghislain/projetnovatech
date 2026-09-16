import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const LFD_ROLES = {
  SUPER_ADMIN:     "super_admin",
  DIRECTOR:        "director",
  MANAGER:         "manager",
  CASHIER:         "cashier",
  ACCOUNTANT:      "accountant",
  BILLING_AGENT:   "billing_agent",
  WAREHOUSE_AGENT: "warehouse_agent",
  SALES_AGENT:     "sales_agent",
  DELIVERY_AGENT:  "delivery_agent",
};

export const ROLE_LABELS = {
  super_admin:     "Super Admin",
  director:        "Direction",
  manager:         "Manager",
  cashier:         "Caissier",
  accountant:      "Comptable",
  billing_agent:   "Agent de Facturation",
  warehouse_agent: "Magasinier",
  sales_agent:     "Commercial",
  delivery_agent:  "Livreur",
};

const PERMISSIONS_MAP = {
  "invoice.read":       ["super_admin","director","manager","billing_agent","accountant"],
  "invoice.create":     ["director","manager","billing_agent"],
  "invoice.edit":       ["director","manager","billing_agent"],
  "invoice.validate":   ["director","manager"],
  "invoice.cancel":     ["director"],
  "cash.read":          ["super_admin","director","manager","cashier","accountant"],
  "cash.collect":       ["cashier","manager","director"],
  "cash.expense":       ["cashier","manager","director"],
  "cash.close":         ["cashier","manager","director"],
  "cash.adjust":        ["director"],
  "stock.read":         ["super_admin","director","manager","warehouse_agent","accountant"],
  "stock.entry":        ["warehouse_agent","manager","director"],
  "stock.exit":         ["warehouse_agent","manager","director"],
  "stock.transfer":     ["warehouse_agent","manager","director"],
  "stock.inventory":    ["warehouse_agent","manager","director"],
  "stock.adjust":       ["director"],
  "credit.read":        ["super_admin","director","manager","billing_agent","accountant"],
  "credit.create":      ["billing_agent","manager","director"],
  "credit.approve":     ["manager","director"],
  "credit.payment":     ["cashier","manager","director"],
  "bank.read":          ["super_admin","director","accountant"],
  "bank.deposit":       ["accountant","manager","director"],
  "bank.reconcile":     ["accountant","director"],
  "accounting.read":    ["super_admin","director","accountant"],
  "accounting.create":  ["accountant","director"],
  "accounting.validate":["director"],
  "order.read":         ["super_admin","director","manager","sales_agent","warehouse_agent"],
  "order.create":       ["sales_agent","manager","director"],
  "order.validate":     ["manager","director"],
  "order.cancel":       ["director"],
  "delivery.read":      ["super_admin","director","manager","delivery_agent"],
  "delivery.update":    ["delivery_agent","manager","director"],
  "report.read":        ["super_admin","director","manager","accountant"],
  "report.export":      ["super_admin","director","manager"],
  "audit.read":         ["super_admin","director","manager"],
  "direction.read":     ["super_admin","director","manager"],
  "bank.deposit.read":  ["super_admin","director","manager","cashier","accountant"],
  "bank.deposit.declare":["cashier","manager","director"],
  "bank.deposit.verify":["manager","director"],
  "employee.read":      ["super_admin","director","manager"],
  "employee.create":    ["super_admin","director"],
  "employee.update":    ["super_admin","director"],
  "employee.disable":   ["super_admin","director"],
  "user.read":          ["super_admin","director"],
  "user.create":        ["super_admin","director"],
  "user.update":        ["super_admin","director"],
  "user.disable":       ["super_admin","director"],
  "user.permissions":   ["super_admin"],
  "sale.read":          ["super_admin","director","manager","sales_agent","accountant"],
  "sale.create":        ["sales_agent","manager","director"],
  "settings.read":      ["super_admin","director"],
  "settings.update":    ["super_admin"],
  "settings.manage":    ["super_admin","director"],
  // Phase 5A
  "supplier.read":      ["super_admin","director","manager","accountant"],
  "supplier.create":    ["director","manager","accountant"],
  "supplier.update":    ["director","manager","accountant"],
  "purchase.read":      ["super_admin","director","manager"],
  "purchase.create":    ["director","manager"],
  "purchase.approve":   ["director","manager"],
  "supplier_invoice.read": ["super_admin","director","manager","accountant"],
  "supplier_invoice.create": ["director","manager","accountant"],
  "supplier_invoice.validate": ["director","manager"],
  "payable.read":       ["super_admin","director","manager","accountant"],
  "payable.pay":        ["director","manager","accountant"],
  "stock_release.read": ["super_admin","director","manager","warehouse_agent"],
  "stock_release.create": ["director","manager","warehouse_agent"],
  "stock_release.validate": ["director","manager","warehouse_agent"]
};

const DEMO_USERS = [
  { id:1, firstName:"Directeur", lastName:"General", email:"direction@lafoidistr.com", password:"demo2026", role:"director", avatar:"DG" },
  { id:2, firstName:"Marie",     lastName:"Caisse",  email:"caisse@lafoidistr.com",    password:"demo2026", role:"cashier",  avatar:"MC" },
  { id:3, firstName:"Jean",      lastName:"Compta",  email:"compta@lafoidistr.com",    password:"demo2026", role:"accountant", avatar:"JC" },
  { id:4, firstName:"Paul",      lastName:"Magasin", email:"stock@lafoidistr.com",     password:"demo2026", role:"warehouse_agent", avatar:"PM" },
];

const LFDAuthContext = createContext(null);
const API_URL = "http://localhost:5001/api/lfd/auth";

export const LFDAuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [lfdUser, setLFDUser] = useState(() => { try { const r = localStorage.getItem("lfd_user"); return r ? JSON.parse(r) : null; } catch { return null; } });
  const [lfdToken, setLFDToken] = useState(() => localStorage.getItem("lfd_token") || null);

  useEffect(() => { lfdUser ? localStorage.setItem("lfd_user", JSON.stringify(lfdUser)) : localStorage.removeItem("lfd_user"); }, [lfdUser]);
  useEffect(() => { lfdToken ? localStorage.setItem("lfd_token", lfdToken) : localStorage.removeItem("lfd_token"); }, [lfdToken]);

  // Validation du token au démarrage
  useEffect(() => {
    const validateToken = async () => {
      if (!lfdToken) return;
      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: { 'Authorization': `Bearer ${lfdToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLFDUser(data.employee);
        } else {
          logout();
        }
      } catch (err) {
        console.error("Erreur de validation token LFD", err);
      }
    };
    validateToken();
  }, []); // Exécuté une seule fois au montage

  const login = async ({ email, password }) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Identifiants incorrects.");
    }
    
    setLFDToken(data.token); 
    setLFDUser(data.employee); 
    return data.employee;
  };

  const loginAsDemo = async (role) => {
    const found = DEMO_USERS.find(u => u.role === role); 
    if (!found) return;
    try {
      await login({ email: found.email, password: found.password });
    } catch (err) {
      console.error("Erreur login démo:", err);
    }
  };

  const logout = () => { setLFDUser(null); setLFDToken(null); localStorage.removeItem("lfd_user"); localStorage.removeItem("lfd_token"); navigate("/gestion/connexion"); };

  const hasPermission = (perm) => { 
    if (!lfdUser) return false; 
    const role = lfdUser.role ? lfdUser.role.toLowerCase() : "";
    const allowed = PERMISSIONS_MAP[perm]; 
    return allowed ? allowed.includes(role) : false; 
  };
  const hasRole = (...roles) => {
    if (!lfdUser) return false;
    const userRole = lfdUser.role ? lfdUser.role.toLowerCase() : "";
    return roles.map(r => r.toLowerCase()).includes(userRole);
  };
  const can = (p) => hasPermission(p);

  const getDefaultRoute = (r) => {
    const role = r ? r.toLowerCase() : "";
    const map = { director:"/gestion/direction", super_admin:"/gestion/direction", manager:"/gestion/direction", cashier:"/gestion/caisse", accountant:"/gestion/comptabilite", billing_agent:"/gestion/facturation", warehouse_agent:"/gestion/stock", sales_agent:"/gestion/ventes", delivery_agent:"/gestion/livraisons" };
    return map[role] || "/gestion/direction";
  };

  return (
    <LFDAuthContext.Provider value={{ lfdUser, lfdToken, login, loginAsDemo, logout, hasPermission, hasRole, can, getDefaultRoute, isAuthenticated: !!lfdUser, DEMO_USERS: DEMO_USERS.map(({ password: _p, ...u }) => u) }}>
      {children}
    </LFDAuthContext.Provider>
  );
};

export const useLFDAuth = () => { const ctx = useContext(LFDAuthContext); if (!ctx) throw new Error("useLFDAuth must be inside LFDAuthProvider"); return ctx; };
export default LFDAuthContext;
