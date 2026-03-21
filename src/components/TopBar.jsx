import { HEAT_LEVELS } from "../data/playerStats";

export default function TopBar({ player }) {
  const heatInfo = HEAT_LEVELS[player?.heatLevel ?? 0];
  const heatPct = player?.heat ?? 0;

  const formatCash = (n) =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000    ? `$${(n / 1_000).toFixed(1)}K`
    : `$${n}`;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-logo flicker">SHATTERED</span>
        <span className="topbar-sub">Criminal Underworld Simulator</span>
      </div>

      <div className="topbar-center">
        <div className="topbar-stat">
          <span className="label">Cash</span>
          <span className="mono amber">{formatCash(player?.cash ?? 500)}</span>
        </div>
        <div className="topbar-divider" />
        <div className="topbar-stat">
          <span className="label">Dirty</span>
          <span className="mono" style={{ color: "#8c7a3d" }}>{formatCash(player?.dirtyCash ?? 0)}</span>
        </div>
        <div className="topbar-divider" />
        <div className="topbar-stat">
          <span className="label">Energy</span>
          <span className="mono" style={{ color: "#3d8c5a" }}>{player?.energy ?? 100}/{player?.maxEnergy ?? 100}</span>
        </div>
        <div className="topbar-divider" />
        <div className="topbar-stat">
          <span className="label">Health</span>
          <span className="mono" style={{ color: player?.health > 50 ? "#3d8c5a" : "#c0392b" }}>
            {player?.health ?? 100}%
          </span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="heat-widget">
          <span className="label">HEAT</span>
          <div className="heat-bar">
            <div
              className="heat-fill"
              style={{ width: `${heatPct}%`, background: heatInfo.color }}
            />
          </div>
          <span className="mono" style={{ color: heatInfo.color, fontSize: "0.7em" }}>
            {heatInfo.label}
          </span>
        </div>
        <div className="topbar-divider" />
        <div className="topbar-stat">
          <span className="label">Level</span>
          <span className="mono amber">{player?.level ?? 1}</span>
        </div>
        <div className="player-avatar">
          {(player?.name?.[0] ?? "?").toUpperCase()}
        </div>
      </div>

      <style>{`
        .topbar {
          grid-area: topbar;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border);
          gap: 16px;
          overflow: hidden;
        }
        .topbar-logo {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.1em;
          letter-spacing: 0.25em;
          color: var(--amber);
          text-transform: uppercase;
        }
        .topbar-sub {
          font-family: var(--font-mono);
          font-size: 0.6em;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          margin-left: 8px;
        }
        .topbar-left { display: flex; align-items: baseline; gap: 0; }
        .topbar-center {
          display: flex;
          align-items: center;
          gap: 0;
          flex: 1;
          justify-content: center;
        }
        .topbar-right { display: flex; align-items: center; gap: 12px; }
        .topbar-stat { display: flex; flex-direction: column; align-items: center; padding: 0 12px; }
        .topbar-stat .label { font-size: 0.6em; margin-bottom: 1px; }
        .topbar-divider { width: 1px; height: 28px; background: var(--border); }
        .heat-widget { display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 80px; }
        .heat-bar { width: 80px; height: 3px; background: var(--bg-raised); }
        .heat-fill { height: 100%; transition: width 0.4s ease, background 0.4s ease; }
        .player-avatar {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: var(--amber-dim);
          border: 1px solid var(--amber);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.85em;
          color: var(--amber);
          cursor: pointer;
        }
      `}</style>
    </header>
  );
}
