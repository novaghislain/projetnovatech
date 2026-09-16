import React from "react";
import { Bell, Menu, RefreshCw } from "lucide-react";
import { useLFDAuth, ROLE_LABELS } from "../../contexts/LFDAuthContext";
import { getLFDDate } from "./mockData";

const LFDHeader = ({ pageTitle, pageSubtitle, onMobileMenuOpen, alertCount = 2 }) => {
  const { lfdUser } = useLFDAuth();
  const today = getLFDDate();

  return (
    <header className="lfd-header">
      <div className="lfd-header-left">
        <button className="lfd-header-toggle" onClick={onMobileMenuOpen} style={{ display:"flex" }}>
          <Menu size={20} />
        </button>
        <div>
          <div className="lfd-header-title">{pageTitle || "Tableau de bord"}</div>
          {pageSubtitle && <div className="lfd-header-subtitle">{pageSubtitle}</div>}
        </div>
      </div>

      <div className="lfd-header-right">
        {/* Date */}
        <div className="lfd-date-badge" style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ textTransform:"capitalize" }}>{today}</span>
        </div>

        {/* Refresh */}
        <button className="lfd-notif-btn" title="Actualiser les donnees" onClick={() => window.location.reload()}>
          <RefreshCw size={16} />
        </button>

        {/* Notifs */}
        <button className="lfd-notif-btn" title={`${alertCount} alertes actives`}>
          <Bell size={16} />
          {alertCount > 0 && <span className="lfd-notif-dot" />}
        </button>

        {/* User chip */}
        {lfdUser && (
          <div className="lfd-user-chip">
            <div className="lfd-user-avatar">{lfdUser.avatar || lfdUser.firstName?.[0] || "?"}</div>
            <div className="lfd-user-info">
              <span className="lfd-user-name">{lfdUser.firstName} {lfdUser.lastName}</span>
              <span className="lfd-user-role-label">{ROLE_LABELS[lfdUser.role] || lfdUser.role}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default LFDHeader;

