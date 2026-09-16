import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { MOCK_SALES_CHART, MOCK_MONTHLY_SALES, formatFCFA } from "../../mockData";
import { TrendingUp } from "lucide-react";

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

const SalesChart = () => {
  const [period, setPeriod] = useState("7j");
  const data = period === "7j" ? MOCK_SALES_CHART : MOCK_MONTHLY_SALES;

  return (
    <div className="lfd-panel">
      <div className="lfd-panel-header">
        <div className="lfd-panel-title">
          <TrendingUp size={16} />
          Evolution des Ventes
        </div>
        <div className="lfd-panel-actions">
          {["7j","9m"].map(p => (
            <button key={p} className={`lfd-tab-btn ${period === p ? "active" : ""}`} onClick={() => setPeriod(p)}>
              {p === "7j" ? "7 jours" : "9 mois"}
            </button>
          ))}
        </div>
      </div>
      <div className="lfd-panel-body">
        <div className="lfd-chart-wrap" style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top:4, right:16, left:16, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey={period === "7j" ? "jour" : "mois"}
                tick={{ fontSize:11, fill:"#94A3B8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(0)}M` : `${(v/1000).toFixed(0)}K`}
                tick={{ fontSize:11, fill:"#94A3B8" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey={period === "7j" ? "ventes" : "ca"}
                name="Chiffre d'affaires"
                stroke="#1A1A2E"
                strokeWidth={2.5}
                dot={{ r:4, fill:"#1A1A2E", strokeWidth:0 }}
                activeDot={{ r:6, fill:"#1A1A2E" }}
              />
              {period === "7j" && (
                <Line
                  type="monotone"
                  dataKey="objectif"
                  name="Objectif"
                  stroke="#E2E8F0"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;

