import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

const LFDAlertContext = createContext(null);

export const LFDAlertProvider = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState(null);

  const showAlert = useCallback((title, message, type = "info") => {
    setAlertConfig({ title, message, type, isConfirm: false });
  }, []);

  const showConfirm = useCallback((title, message, onConfirm, onCancel) => {
    setAlertConfig({ title, message, type: "warning", isConfirm: true, onConfirm, onCancel });
  }, []);

  const closeAlert = () => setAlertConfig(null);

  return (
    <LFDAlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {alertConfig && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 99999, backdropFilter: "blur(4px)"
        }}>
          <div style={{
            background: "white", padding: "24px", borderRadius: "16px",
            width: "90%", maxWidth: "400px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            transform: "scale(1)", transition: "all 0.2s ease-out"
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
              <div style={{
                background: alertConfig.type === "success" ? "rgba(16,185,129,0.1)" : alertConfig.type === "error" ? "rgba(239,68,68,0.1)" : alertConfig.type === "warning" ? "rgba(245,158,11,0.1)" : "rgba(59,130,246,0.1)",
                color: alertConfig.type === "success" ? "#059669" : alertConfig.type === "error" ? "#DC2626" : alertConfig.type === "warning" ? "#D97706" : "#2563EB",
                padding: "10px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                {alertConfig.type === "success" && <CheckCircle2 size={24} />}
                {alertConfig.type === "error" && <X size={24} />}
                {alertConfig.type === "warning" && <AlertTriangle size={24} />}
                {alertConfig.type === "info" && <Info size={24} />}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "1.1rem", fontWeight: 700, color: "#0F172A" }}>
                  {alertConfig.title}
                </h3>
                <p style={{ margin: 0, color: "#64748B", fontSize: "0.95rem", lineHeight: 1.5 }}>
                  {alertConfig.message}
                </p>
              </div>
            </div>
            
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #F1F5F9" }}>
              {alertConfig.isConfirm && (
                <button 
                  onClick={() => {
                    if(alertConfig.onCancel) alertConfig.onCancel();
                    closeAlert();
                  }}
                  style={{
                    padding: "10px 16px", borderRadius: "8px", border: "1px solid #E2E8F0",
                    background: "white", color: "#475569", fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  Annuler
                </button>
              )}
              <button 
                onClick={() => {
                  if(alertConfig.onConfirm) alertConfig.onConfirm();
                  closeAlert();
                }}
                style={{
                  padding: "10px 16px", borderRadius: "8px", border: "none",
                  background: alertConfig.type === "error" ? "#EF4444" : alertConfig.type === "warning" ? "#F59E0B" : "#10B981",
                  color: "white", fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
                }}
              >
                {alertConfig.isConfirm ? "Confirmer" : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </LFDAlertContext.Provider>
  );
};

export const useLFDAlert = () => useContext(LFDAlertContext);
