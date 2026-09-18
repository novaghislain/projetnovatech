import { API_URL } from '../../../config';
import React, { useState, useEffect } from "react";
import { Search, Download, Shield, ShieldAlert, Monitor, FileText } from "lucide-react";
import { useLFDAuth } from "../../../contexts/LFDAuthContext";
import LFDModal from "../../../components/LFD/LFDModal";
import axios from "axios";

const Audit = () => {
  const { lfdToken } = useLFDAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [lfdToken]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/lfd/audit`, {
        headers: { Authorization: `Bearer ${lfdToken}` }
      });
      setLogs(res.data);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement de l'audit.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      const headers = "Date,Action,Entité,ID,Détails techniques,Raison,Utilisateur\n";
      const csv = logs.map(l => 
        `"${new Date(l.createdAt).toLocaleString()}","${l.action}","${l.entity_type}","${l.entity_id || ''}","${l.new_value || l.old_value || ''}","${l.reason || ''}","${l.employee_name}"`
      ).join("\n");
      const blob = new Blob([headers + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `LFD_Audit_Export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1000);
  };

  const getIcon = (action) => {
    if (action.includes("LOGIN") || action.includes("SESSION")) return <Monitor size={14} color="#3B82F6" />;
    if (action.includes("DELETE") || action.includes("CANCEL") || action.includes("REJECT")) return <ShieldAlert size={14} color="#EF4444" />;
    if (action.includes("CREATE") || action.includes("DECLARE")) return <FileText size={14} color="#10B981" />;
    return <Shield size={14} color="var(--lfd-accent)" />;
  };

  return (
    <div className="lfd-page" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--lfd-surface)" }}>Journal d'Audit Général</h1>
          <p style={{ color: "var(--lfd-text-dim)", fontSize: "0.9rem" }}>Tracez et auditez toutes les actions sensibles effectuées sur LFD.</p>
        </div>
        <button onClick={handleExport} className="lfd-btn lfd-btn-secondary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", background: "white", color: "var(--lfd-surface)", cursor: "pointer", fontWeight: 600 }}>
          <Download size={18} /> Exporter (CSV)
        </button>
      </div>

      {error && <div className="lfd-alert lfd-alert-danger">{error}</div>}

      <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(26,26,46,0.05)" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
            <Search size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--lfd-text-muted)" }} />
            <input type="text" placeholder="Rechercher par utilisateur, action, entité..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "100%", padding: "10px 10px 10px 38px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)", outline: "none" }} />
          </div>
          <button className="lfd-btn lfd-btn-primary" onClick={fetchLogs}>Actualiser</button>
        </div>

        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div className="lfd-loading">Chargement du journal d'audit...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--lfd-surface-3)", color: "var(--lfd-text-muted)", textAlign: "left" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Date & Heure</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Action</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Entité</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>ID</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Détail technique & Raison</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Utilisateur</th>
                </tr>
              </thead>
              <tbody>
                {logs
                  .filter(item => 
                    Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid var(--lfd-content-bg)" }}>
                    <td style={{ padding: "12px 16px", color: "var(--lfd-text-dim)" }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--lfd-surface)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {getIcon(log.action)}
                        {log.action}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--lfd-text-dim)" }}>
                      {log.entity_type}
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 500 }}>
                      #{log.entity_id}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.8rem", color: "var(--lfd-text-dim)" }}>
                      <div style={{ fontFamily: "monospace" }}>{log.new_value || log.old_value || '-'}</div>
                      {log.reason && <div style={{ color: 'var(--lfd-danger)', marginTop: 4 }}>Motif: {log.reason}</div>}
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 500 }}>
                      {log.employee_name} <br/><span style={{ fontSize: '0.75rem', color: 'var(--lfd-text-muted)' }}>({log.role_code})</span>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>Aucune trace d'audit trouvée.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <LFDModal isOpen={isExporting} onClose={() => {}} title="Préparation de l'export d'audit...">
        <div style={{ textAlign: "center", padding: "20px" }}>
          <div className="lfd-spinner" style={{ margin: "0 auto 20px auto", width: 40, height: 40, border: "4px solid var(--lfd-surface-3)", borderTopColor: "var(--lfd-accent)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <p style={{ fontWeight: 600, color: "var(--lfd-surface)" }}>Compilation des journaux sécurisés</p>
          <p style={{ fontSize: "0.9rem", color: "var(--lfd-text-dim)" }}>Veuillez patienter...</p>
        </div>
      </LFDModal>
    </div>
  );
};
export default Audit;
