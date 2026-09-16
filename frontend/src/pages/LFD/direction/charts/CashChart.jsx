import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { MOCK_CASH_CHART, formatFCFA } from "../../mockData";
import { Wallet } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#1E293B", border:"1px solid #2D4060", borderRadius:10, padding:"10px 14px", fontSize:"0.8rem" }}>
      <p style={{ color:"#94A3B8", marginBottom:6, fontWeight:600 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, margin:"2px 0" }}>
          {p.name}: {formatFCFA(p.value)}
        </p>
      ))}
    </div>
  );
};

const CashChart = () => {
  return (
    <div className="lfd-panel">
      <div className="lfd-panel-header">
        <div className="lfd-panel-title">
          <Wallet size={16} />
          Encaissements vs Ventes a Credit
        </div>
        <div className="lfd-panel-actions">
          <button className="lfd-tab-btn active">7 jours</button>
        </div>
      </div>
      <div className="lfd-panel-body">
        <div className="lfd-chart-wrap" style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_CASH_CHART} margin={{ top:4, right:16, left:16, bottom:0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="jour" tick={{ fontSize:11, fill:"#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(0)}M` : `${(v/1000).toFixed(0)}K`}
                tick={{ fontSize:11, fill:"#94A3B8" }}
                axisLine={false} tickLine={false} width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(v) => <span style={{ fontSize:"0.75rem", color:"#64748B" }}>{v}</span>}
                wrapperStyle={{ paddingTop:12 }}
              />
              <Bar dataKey="encaissements" name="Encaissements" fill="#1A1A2E" radius={[4,4,0,0]} maxBarSize={32} />
              <Bar dataKey="credit" name="Ventes a credit" fill="#F59E0B" radius={[4,4,0,0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CashChart;

