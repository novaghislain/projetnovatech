import React, { useEffect } from "react";
import { X } from "lucide-react";

const LFDModal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(26,26,46,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: "20px"
    }}>
      <div style={{
        background: "white", borderRadius: "16px",
        width: "100%", maxWidth: "500px", maxHeight: "90vh",
        display: "flex", flexDirection: "column",
        boxShadow: "0 20px 40px rgba(15,52,96,0.2)"
      }}>
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid var(--lfd-surface-3)",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <h2 style={{ margin: 0, fontSize: "1.25rem", color: "var(--lfd-surface)" }}>{title}</h2>
          <button onClick={onClose} style={{
            background: "transparent", border: "none", cursor: "pointer",
            color: "var(--lfd-text-muted)", padding: "4px", display: "flex",
            alignItems: "center", justifyContent: "center", borderRadius: "50%"
          }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: "24px", overflowY: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default LFDModal;
