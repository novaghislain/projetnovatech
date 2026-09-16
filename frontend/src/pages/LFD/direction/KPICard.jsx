import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const KPICard = ({ icon: Icon, label, value, trend, trendLabel, color = "#1A1A2E", featured = false, style = {} }) => {
  const cssColor = `--lfd-kpi-color: ${color}`;

  const trendDir = trend > 0 ? "up" : trend < 0 ? "down" : "neutral";
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;

  return (
    <div className={`lfd-kpi-card lfd-animate-up ${featured ? "featured" : ""}`} style={{ [cssColor.split(":")[0].slice(2)]: color, ...style }}>
      <div className="lfd-kpi-icon">
        {Icon && <Icon size={22} />}
      </div>
      <div className="lfd-kpi-body">
        <div className="lfd-kpi-value">{value}</div>
        <div className="lfd-kpi-label">{label}</div>
        {trendLabel && (
          <div className={`lfd-kpi-trend ${trendDir}`}>
            <TrendIcon size={12} />
            {trendLabel}
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;

