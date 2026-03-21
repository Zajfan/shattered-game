import { STAT_DEFINITIONS, HEAT_LEVELS } from "../data/playerStats";

export default function Dashboard({ player, onNavigate }) {
  const heatInfo = HEAT_LEVELS[player.heatLevel ?? 0];
  const topStats = ["muscle", "nerve", "intelligence", "streetSmarts", "connections", "reputation"];

  return (
    <div className="dashboard animate-in">
      {/* ── Case File Header ── */}
      <div className="case-header">
        <div className="case-header-left">
          <div className="case-stamp">CASE FILE</div>
          <h1 className="case-name">{player.name || "UNKNOWN SUBJECT"}</h1>
          <div className="mono muted" style={{ fontSize: "0.75em", marginTop: 4 }}>
            SUBJECT ID: {player.id || "——"} &nbsp;|&nbsp;
            CLASSIFICATION: {heatInfo.label.toUpperCase()} &nbsp;|&nbsp;
            LEVEL {player.level}
          </div>
        </div>
        <div className="case-header-right">
          <div className="faction-badge">
            {player.factionId
              ? `▣ ${player.factionId.toUpperCase()}`
              : "◻ NO AFFILIATION"}
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="section-label">Operative Stats</div>
      <div className="stats-grid">
        {topStats.map((key) => {
          const def = STAT_DEFINITIONS[key];
          const val = player.stats[key];
          const pct = Math.min(100, (val / 100) * 100);
          return (
            <div className="stat-card" key={key}>
              <div className="stat-header">
                <span style={{ fontSize: "0.9em" }}>{def.icon}</span>
                <span className="stat-name">{def.label}</span>
                <span className="mono amber" style={{ fontSize: "0.85em", marginLeft: "auto" }}>{val}</span>
              </div>
              <div className="progress-bar" style={{ marginTop: 6 }}>
                <div className="progress-fill" style={{ width: `${pct}%`, background: def.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Resources ── */}
      <div className="section-label">Resources</div>
      <div className="resources-row">
        <div className="resource-card">
          <span className="label">Cash</span>
          <span className="resource-value amber mono">${player.cash.toLocaleString()}</span>
        </div>
        <div className="resource-card">
          <span className="label">Dirty Cash</span>
          <span className="resource-value mono" style={{ color: "#d4a827" }}>${player.dirtyCash.toLocaleString()}</span>
        </div>
        <div className="resource-card">
          <span className="label">Energy</span>
          <span className="resource-value mono" style={{ color: "#3d8c5a" }}>{player.energy}/{player.maxEnergy}</span>
        </div>
        <div className="resource-card">
          <span className="label">Health</span>
          <span className="resource-value mono" style={{ color: player.health > 50 ? "#3d8c5a" : "#c0392b" }}>
            {player.health}%
          </span>
        </div>
        <div className="resource-card">
          <span className="label">Heat</span>
          <span className="resource-value mono" style={{ color: heatInfo.color }}>{player.heat}%</span>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="section-label">Quick Actions</div>
      <div className="quick-actions">
        <button className="btn" onClick={() => onNavigate("crimes")}>
          ▶ Commit a Crime
        </button>
        <button className="btn" onClick={() => onNavigate("factions")}>
          ▶ Join a Faction
        </button>
        <button className="btn" onClick={() => onNavigate("market")}>
          ▶ Black Market
        </button>
        <button className="btn" onClick={() => onNavigate("territory")}>
          ▶ Territory Map
        </button>
      </div>

      {/* ── Crime Record ── */}
      <div className="section-label">Criminal Record</div>
      <div className="record-row">
        <div className="record-stat">
          <span className="label">Crimes Attempted</span>
          <span className="mono amber">{player.crimesAttempted}</span>
        </div>
        <div className="record-stat">
          <span className="label">Succeeded</span>
          <span className="mono" style={{ color: "#3d8c5a" }}>{player.crimesSucceeded}</span>
        </div>
        <div className="record-stat">
          <span className="label">Arrests</span>
          <span className="mono" style={{ color: "#c0392b" }}>{player.timesArrested}</span>
        </div>
        <div className="record-stat">
          <span className="label">Total Earned</span>
          <span className="mono amber">${player.totalEarned.toLocaleString()}</span>
        </div>
      </div>

      <style>{`
        .dashboard {
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .case-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          border: 1px solid var(--border-accent);
          background: var(--bg-card);
          padding: 16px 20px;
          border-left: 3px solid var(--amber);
        }
        .case-stamp {
          font-family: var(--font-mono);
          font-size: 0.65em;
          letter-spacing: 0.25em;
          color: var(--amber);
          margin-bottom: 4px;
        }
        .case-name {
          font-size: 1.6em;
          letter-spacing: 0.15em;
          color: var(--text-primary);
        }
        .faction-badge {
          font-family: var(--font-mono);
          font-size: 0.7em;
          letter-spacing: 0.1em;
          padding: 6px 12px;
          border: 1px solid var(--border);
          color: var(--text-secondary);
        }
        .section-label {
          font-family: var(--font-mono);
          font-size: 0.65em;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--amber-dim);
          border-bottom: 1px solid var(--border);
          padding-bottom: 6px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          padding: 10px 12px;
        }
        .stat-header {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .stat-name {
          font-family: var(--font-display);
          font-size: 0.8em;
          font-weight: 400;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }
        .resources-row, .record-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .resource-card, .record-stat {
          background: var(--bg-card);
          border: 1px solid var(--border);
          padding: 10px 16px;
          flex: 1;
          min-width: 100px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .resource-value {
          font-size: 1.1em;
        }
        .quick-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  );
}
