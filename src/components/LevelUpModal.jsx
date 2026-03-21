import { useEffect, useState } from "react";
import { LEVEL_UNLOCKS } from "../data/levels";

export default function LevelUpModal({ newLevel, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const info = LEVEL_UNLOCKS[newLevel] || { label: "Rank Up", unlocks: ["New content unlocked"] };

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="levelup-overlay" onClick={onDismiss}>
      <div className={`levelup-modal ${visible ? "visible" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="levelup-flash" />
        <div className="levelup-badge">
          <span className="levelup-badge-label mono">LEVEL</span>
          <span className="levelup-number">{newLevel}</span>
        </div>
        <div className="levelup-title">{info.label}</div>
        <p className="levelup-subtitle dim">
          You've reached a new tier. The underworld takes notice.
        </p>

        <div className="levelup-unlocks">
          <div className="mono" style={{ fontSize: "0.65em", letterSpacing: "0.2em", color: "var(--amber)", marginBottom: 10 }}>
            UNLOCKED AT THIS LEVEL
          </div>
          {info.unlocks.map((u, i) => (
            <div key={i} className="unlock-row animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="unlock-dot">▸</span>
              <span className="unlock-text">{u}</span>
            </div>
          ))}
        </div>

        <button className="btn btn-primary levelup-cta" onClick={onDismiss}>
          ▶ Continue
        </button>
      </div>

      <style>{`
        .levelup-overlay {
          position: fixed; inset: 0; z-index: 2000;
          background: rgba(0,0,0,0.88);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .levelup-modal {
          background: var(--bg-surface);
          border: 1px solid var(--amber);
          max-width: 420px; width: 100%;
          padding: 32px;
          display: flex; flex-direction: column; align-items: center; gap: 16px;
          text-align: center;
          box-shadow: 0 0 80px rgba(200,146,42,0.3);
          transform: scale(0.85) translateY(20px);
          opacity: 0;
          transition: transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275), opacity 0.3s ease;
        }
        .levelup-modal.visible { transform: scale(1) translateY(0); opacity: 1; }
        .levelup-flash {
          position: absolute; inset: 0; background: var(--amber);
          opacity: 0; animation: levelup-flash 0.5s ease forwards;
          pointer-events: none;
        }
        @keyframes levelup-flash {
          0%   { opacity: 0.3; }
          100% { opacity: 0; }
        }
        .levelup-badge {
          width: 90px; height: 90px;
          border: 3px solid var(--amber);
          border-radius: 50%;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: var(--bg-card);
          box-shadow: 0 0 30px rgba(200,146,42,0.4);
          animation: pulse-amber 2s infinite;
        }
        .levelup-badge-label { font-size: 0.55em; letter-spacing: 0.2em; color: var(--amber-dim); }
        .levelup-number { font-family: var(--font-display); font-size: 2.2em; font-weight: 700; color: var(--amber); line-height: 1; }
        .levelup-title { font-family: var(--font-display); font-size: 1.4em; letter-spacing: 0.2em; text-transform: uppercase; color: var(--text-primary); }
        .levelup-subtitle { font-size: 0.88em; line-height: 1.6; max-width: 300px; }
        .levelup-unlocks { width: 100%; background: var(--bg-card); border: 1px solid var(--border); padding: 14px 16px; text-align: left; }
        .unlock-row { display: flex; align-items: flex-start; gap: 8px; padding: 4px 0; }
        .unlock-dot { color: var(--amber); font-family: var(--font-mono); font-size: 0.75em; margin-top: 3px; flex-shrink: 0; }
        .unlock-text { font-size: 0.85em; color: var(--text-secondary); line-height: 1.4; }
        .levelup-cta { width: 100%; padding: 12px; font-size: 0.85em; }
      `}</style>
    </div>
  );
}
