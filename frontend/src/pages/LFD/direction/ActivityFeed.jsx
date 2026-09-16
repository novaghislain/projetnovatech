import React from "react";
import { FileText, DollarSign, Package, Truck, CreditCard, BarChart3, Activity } from "lucide-react";
import { MOCK_ACTIVITY, formatFCFA } from "../mockData";
import { ROLE_LABELS } from "../../../contexts/LFDAuthContext";

const MODULE_ICON = {
  "Facturation": { icon: FileText,    bg:"rgba(14,165,233,0.1)",  color:"#0284C7" },
  "Caisse":      { icon: DollarSign,  bg:"rgba(16,185,129,0.1)",  color:"#059669" },
  "Stock":       { icon: Package,     bg:"rgba(245,158,11,0.1)",  color:"#B45309" },
  "Livraisons":  { icon: Truck,       bg:"rgba(99,102,241,0.1)",  color:"#4F46E5" },
  "Banque":      { icon: CreditCard,  bg:"rgba(139,92,246,0.1)",  color:"#7C3AED" },
  "Commandes":   { icon: BarChart3,   bg:"rgba(236,72,153,0.1)",  color:"#BE185D" },
};

const STATUS_CHIP = {
  success: { label:"Confirme", cls:"success" },
  pending: { label:"En cours", cls:"pending" },
  danger:  { label:"Annule",   cls:"danger" },
  info:    { label:"Info",     cls:"info" },
};

const ActivityFeed = () => {
  const activities = MOCK_ACTIVITY;

  return (
    <div className="lfd-panel" style={{ height:"100%" }}>
      <div className="lfd-panel-header">
        <div className="lfd-panel-title">
          <Activity size={16} />
          Activite Recente
        </div>
        <button className="lfd-tab-btn active" style={{ cursor:"default" }}>Aujourd'hui</button>
      </div>
      <div className="lfd-panel-body" style={{ padding:"8px 22px" }}>
        <div className="lfd-activity-list">
          {activities.map(act => {
            const mod = MODULE_ICON[act.module] || { icon:Activity, bg:"rgba(100,116,139,0.1)", color:"#64748B" };
            const ModIcon = mod.icon;
            const statusInfo = STATUS_CHIP[act.status] || STATUS_CHIP.info;
            return (
              <div key={act.id} className="lfd-activity-item">
                <div className="lfd-activity-time">{act.time}</div>
                <div className="lfd-activity-icon" style={{ background: mod.bg, color: mod.color }}>
                  <ModIcon size={14} />
                </div>
                <div className="lfd-activity-body">
                  <div className="lfd-activity-action">{act.action}</div>
                  <div className="lfd-activity-meta">
                    {act.user}
                    {" · "}
                    <span style={{ color:"#64748B" }}>{act.ref}</span>
                    {" · "}
                    <span className={`lfd-status-chip ${statusInfo.cls}`}>{statusInfo.label}</span>
                  </div>
                </div>
                {act.amount && (
                  <div className="lfd-activity-amount">{formatFCFA(act.amount)}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;

