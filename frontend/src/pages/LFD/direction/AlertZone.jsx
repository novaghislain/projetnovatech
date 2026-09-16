import React, { useState } from "react";
import { AlertTriangle, Info, AlertCircle, ChevronRight, Bell } from "lucide-react";
import { MOCK_ALERTS } from "../mockData";

const AlertIcon = ({ level }) => {
  if (level === "critical") return <AlertCircle size={14} style={{ color:"#EF4444", flexShrink:0, marginTop:1 }} />;
  if (level === "warning")  return <AlertTriangle size={14} style={{ color:"#F59E0B", flexShrink:0, marginTop:1 }} />;
  return <Info size={14} style={{ color:"#3B82F6", flexShrink:0, marginTop:1 }} />;
};

const AlertZone = () => {
  const [filter, setFilter] = useState("all");
  const [alerts] = useState(MOCK_ALERTS);

  const filtered = filter === "all" ? alerts : alerts.filter(a => a.level === filter);
  const criticalCount = alerts.filter(a => a.level === "critical").length;

  return (
    <div className="lfd-panel" style={{ height:"100%" }}>
      <div className="lfd-panel-header">
        <div className="lfd-panel-title">
          <Bell size={16} />
          Alertes Actives
          {criticalCount > 0 && (
            <span style={{ background:"#EF4444", color:"white", fontSize:"0.65rem", fontWeight:700, padding:"2px 7px", borderRadius:20 }}>
              {criticalCount} critique{criticalCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="lfd-panel-actions">
          {["all","critical","warning","info"].map(f => (
            <button key={f} className={`lfd-tab-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
              {f === "all" ? "Tout" : f === "critical" ? "Crit." : f === "warning" ? "Att." : "Info"}
            </button>
          ))}
        </div>
      </div>
      <div className="lfd-panel-body">
        {filtered.length === 0 ? (
          <div className="lfd-empty">Aucune alerte de ce type</div>
        ) : (
          <div className="lfd-alerts-list">
            {filtered.map(alert => (
              <div key={alert.id} className={`lfd-alert-item ${alert.level}`}>
                <div className="lfd-alert-dot" />
                <div className="lfd-alert-content">
                  <div className="lfd-alert-label">
                    <AlertIcon level={alert.level} />
                    {" "}{alert.label}
                  </div>
                  <div className="lfd-alert-msg">{alert.message}</div>
                  <div style={{ fontSize:"0.7rem", color:"#9CA3AF", marginTop:4 }}>
                    {alert.module} • {alert.time}
                  </div>
                </div>
                <ChevronRight size={14} style={{ color:"#CBD5E1", flexShrink:0, marginTop:2 }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertZone;

