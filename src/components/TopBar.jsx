import { HEAT_LEVELS } from "../data/playerStats";

export default function TopBar({ player, serverOnline }) {
  const heatInfo = HEAT_LEVELS[player?.heatLevel ?? 0];
  const heatPct  = player?.heat ?? 0;
  const fmt = (n) => n >= 1_000_000 ? `$${(n/1_000_000).toFixed(1)}M` : n >= 1_000 ? `$${(n/1_000).toFixed(1)}K` : `$${n}`;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-logo flicker">SHATTERED</span>
        <span className="topbar-sub">Criminal Underworld Simulator</span>
      </div>
      <div className="topbar-center">
        {[
          { label: "Cash",   val: fmt(player?.cash ?? 500),        color: "var(--amber)" },
          { label: "Dirty",  val: fmt(player?.dirtyCash ?? 0),     color: "#8c7a3d" },
          { label: "HP",     val: `${player?.health ?? 100}%`,     color: (player?.health ?? 100) > 60 ? "#3d8c5a" : (player?.health ?? 100) > 30 ? "#e67e22" : "#c0392b" },
          { label: "Energy", val: `${player?.energy ?? 100}/${player?.maxEnergy ?? 100}`, color: "#3d8c5a" },
        ].map(({ label, val, color }) => (
          <div key={label} className="topbar-stat">
            <span className="label">{label}</span>
            <span className="mono" style={{ color }}>{val}</span>
            <div className="topbar-divider" />
          </div>
        ))}
      </div>
      <div className="topbar-right">
        {serverOnline !== undefined && (
          <div className="server-dot" title={serverOnline ? "Server online" : "Server offline"} style={{ background: serverOnline ? "#3d8c5a" : "#5a5248" }} />
        )}
        <div className="heat-widget">
          <span className="label">HEAT</span>
          <div className="heat-bar"><div className="heat-fill" style={{ width: `${heatPct}%`, background: heatInfo.color }} /></div>
          <span className="mono" style={{ color: heatInfo.color, fontSize: "0.7em" }}>{heatInfo.label}</span>
        </div>
        <div className="topbar-divider-v" />
        <div className="topbar-stat"><span className="label">Level</span><span className="mono amber">{player?.level ?? 1}</span></div>
        <div className="player-avatar">{(player?.name?.[0] ?? "?").toUpperCase()}</div>
      </div>
      <style>{`
        .topbar { grid-area: topbar; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; background: var(--bg-surface); border-bottom: 1px solid var(--border); gap: 16px; overflow: hidden; }
        .topbar-logo { font-family: var(--font-display); font-weight: 700; font-size: 1.1em; letter-spacing: 0.25em; color: var(--amber); text-transform: uppercase; }
        .topbar-sub  { font-family: var(--font-mono); font-size: 0.6em; color: var(--text-muted); letter-spacing: 0.1em; margin-left: 8px; }
        .topbar-left { display: flex; align-items: baseline; }
        .topbar-center { display: flex; align-items: center; flex: 1; justify-content: center; }
        .topbar-right { display: flex; align-items: center; gap: 10px; }
        .topbar-stat { display: flex; flex-direction: column; align-items: center; padding: 0 10px; position: relative; }
        .topbar-stat .label { font-size: 0.6em; margin-bottom: 1px; }
        .topbar-divider { position: absolute; right: 0; top: 50%; transform: translateY(-50%); width: 1px; height: 24px; background: var(--border); }
        .topbar-divider-v { width: 1px; height: 28px; background: var(--border); }
        .heat-widget { display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 80px; }
        .heat-bar { width: 80px; height: 3px; background: var(--bg-raised); }
        .heat-fill { height: 100%; transition: width 0.4s ease, background 0.4s ease; }
        .player-avatar { width: 28px; height: 28px; border-radius: 2px; background: var(--amber-dim); border: 1px solid var(--amber); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 700; font-size: 0.85em; color: var(--amber); cursor: pointer; }
        .server-dot { width: 6px; height: 6px; border-radius: 50%; transition: background 0.5s; }
      `}</style>
    </header>
  );
}
