// src/components/WantedBanner.jsx
// Dramatic "WANTED" banner that slides in when heat >= 80%
import { useState, useEffect } from "react";
import { HEAT_LEVELS }         from "../data/playerStats";

export default function WantedBanner({ player, onDismiss }) {
  const [visible,  setVisible]  = useState(false);
  const [lastHeat, setLastHeat] = useState(player?.heat || 0);

  const heat     = player?.heat || 0;
  const heatInfo = HEAT_LEVELS[player?.heatLevel ?? 0];

  // Trigger when heat crosses a threshold for the first time this session
  useEffect(() => {
    const thresholds = [80, 95, 100];
    const crossed = thresholds.some(t => heat >= t && lastHeat < t);
    if (crossed) {
      setVisible(true);
      const id = setTimeout(() => setVisible(false), 6000);
      return () => clearTimeout(id);
    }
    setLastHeat(heat);
  }, [heat]);

  if (!visible || heat < 80) return null;

  const isInterpol = heat >= 95;

  return (
    <div className="wanted-banner animate-in" onClick={() => setVisible(false)}>
      <div className="wanted-inner">
        <div className="wanted-agency mono">
          {isInterpol ? "INTERPOL — RED NOTICE" : "FEDERAL WARRANT ISSUED"}
        </div>
        <div className="wanted-title">WANTED</div>
        <div className="wanted-name">{player?.name || "UNKNOWN"}</div>
        <div className="mono muted" style={{ fontSize: "0.65em", letterSpacing: "0.15em", marginTop: 4 }}>
          THREAT LEVEL: <span style={{ color: heatInfo.color }}>{heatInfo.label.toUpperCase()}</span>
          &nbsp;·&nbsp; HEAT: {heat}%
        </div>
        <div className="wanted-charges mono" style={{ marginTop: 8 }}>
          {heat >= 95
            ? "Charges: RICO, Federal Conspiracy, Organized Crime Leadership"
            : heat >= 90
            ? "Charges: Felony Criminal Enterprise, Armed Robbery, Conspiracy"
            : "Charges: Criminal Enterprise, Robbery, Narcotics Distribution"}
        </div>
        <div className="mono muted" style={{ fontSize: "0.6em", marginTop: 8 }}>
          Click to dismiss · Reduce heat through laundering or laying low
        </div>
      </div>

      <style>{`
        .wanted-banner {
          position: fixed; top: 60px; right: 20px; z-index: 1500;
          cursor: pointer;
          animation: wanted-slide-in 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards;
        }
        @keyframes wanted-slide-in {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .wanted-inner {
          background: var(--bg-surface);
          border: 2px solid #c0392b;
          border-top: 4px solid #c0392b;
          padding: 14px 18px;
          max-width: 280px;
          box-shadow: 0 4px 30px rgba(192,57,43,0.4);
          display: flex; flex-direction: column; align-items: center;
          text-align: center;
          position: relative;
        }
        .wanted-inner::before {
          content: "";
          position: absolute; inset: 0;
          background: repeating-linear-gradient(
            45deg, transparent, transparent 10px,
            rgba(192,57,43,0.03) 10px, rgba(192,57,43,0.03) 20px
          );
          pointer-events: none;
        }
        .wanted-agency {
          font-size: 0.6em; letter-spacing: 0.2em; color: #c0392b;
          border-bottom: 1px solid rgba(192,57,43,0.3);
          padding-bottom: 6px; margin-bottom: 6px; width: 100%;
        }
        .wanted-title {
          font-family: var(--font-display); font-size: 2.2em;
          font-weight: 700; letter-spacing: 0.4em; color: #c0392b;
          text-shadow: 0 0 20px rgba(192,57,43,0.5);
        }
        .wanted-name {
          font-family: var(--font-display); font-size: 1.1em;
          letter-spacing: 0.2em; color: var(--text-primary);
          text-transform: uppercase; margin-top: 2px;
        }
        .wanted-charges {
          font-size: 0.62em; color: var(--text-secondary);
          letter-spacing: 0.04em; line-height: 1.5;
          border-top: 1px solid var(--border); padding-top: 8px; width: 100%;
        }
      `}</style>
    </div>
  );
}
