import { useState } from "react";
import { HEAT_LEVELS } from "../data/playerStats";
import { calcLevel } from "../data/levels";

export default function SettingsPage({ player, onReset, onHeal, onRestoreEnergy }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmName,  setConfirmName]  = useState("");

  const level   = calcLevel(player?.xp || 0);
  const health  = player?.health  || 100;
  const energy  = player?.energy  || 0;
  const maxEnergy = player?.maxEnergy || 100;
  const cash    = player?.cash    || 0;

  // Heal cost: $500 per 10% health missing
  const healthMissing = 100 - health;
  const healCost      = Math.ceil(healthMissing / 10) * 500;
  // Energy restore: $200 per 10 energy missing
  const energyMissing = maxEnergy - energy;
  const energyCost    = Math.ceil(energyMissing / 10) * 200;

  const handleReset = () => {
    if (confirmName.trim().toUpperCase() !== (player?.name || "").toUpperCase()) return;
    onReset?.();
  };

  return (
    <div className="settings-page animate-in">
      <div className="page-header">
        <h2>Settings</h2>
        <span className="mono muted" style={{ fontSize: "0.7em" }}>
          Character management, recovery, and save controls.
        </span>
      </div>

      {/* ── Character Status ── */}
      <div className="settings-section">
        <div className="settings-section-label">Character Overview</div>
        <div className="status-grid">
          {[
            { label: "Name",      val: player?.name  || "—",                    color: "var(--amber)" },
            { label: "ID",        val: player?.id    || "—",                    color: "var(--text-muted)" },
            { label: "Level",     val: level,                                    color: "var(--amber)" },
            { label: "XP",        val: (player?.xp || 0).toLocaleString(),       color: "#5a7ec8" },
            { label: "Faction",   val: player?.factionId || "Independent",       color: "#a85fd4" },
            { label: "Created",   val: player?.createdAt ? new Date(player.createdAt).toLocaleDateString() : "—", color: "var(--text-muted)" },
          ].map(({ label, val, color }) => (
            <div key={label} className="status-cell">
              <span className="label">{label}</span>
              <span className="mono" style={{ color }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recovery ── */}
      <div className="settings-section">
        <div className="settings-section-label">Recovery</div>
        <div className="recovery-cards">

          {/* Health recovery */}
          <div className={`recovery-card ${health >= 100 ? "maxed" : ""}`}>
            <div className="recovery-header">
              <span className="recovery-icon">❤️</span>
              <div>
                <div className="recovery-title">Health Recovery</div>
                <div className="mono muted" style={{ fontSize: "0.68em" }}>
                  +1 HP / 10 min passively · Pay to recover instantly
                </div>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div className="mono" style={{
                  color: health > 60 ? "#3d8c5a" : health > 30 ? "#e67e22" : "#c0392b",
                  fontSize: "1.2em"
                }}>{health}%</div>
              </div>
            </div>
            <div className="progress-bar" style={{ height: 6, margin: "8px 0" }}>
              <div className="progress-fill" style={{
                width: `${health}%`,
                background: health > 60 ? "#3d8c5a" : health > 30 ? "#e67e22" : "#c0392b",
                transition: "width 0.4s"
              }} />
            </div>
            {health < 100 ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="mono muted" style={{ fontSize: "0.72em" }}>
                  Restore to 100% — ${healCost.toLocaleString()}
                </span>
                <button
                  className="btn btn-primary"
                  style={{ fontSize: "0.7em", padding: "5px 14px" }}
                  disabled={cash < healCost}
                  onClick={() => onHeal?.(healCost)}
                >
                  ▶ Heal Now
                </button>
              </div>
            ) : (
              <div className="mono" style={{ fontSize: "0.72em", color: "#3d8c5a" }}>✓ Fully healed</div>
            )}
          </div>

          {/* Energy restore */}
          <div className={`recovery-card ${energy >= maxEnergy ? "maxed" : ""}`}>
            <div className="recovery-header">
              <span className="recovery-icon">⚡</span>
              <div>
                <div className="recovery-title">Energy Restore</div>
                <div className="mono muted" style={{ fontSize: "0.68em" }}>
                  +1 energy / 3 min passively · Pay to restore instantly
                </div>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div className="mono" style={{ color: "#3d8c5a", fontSize: "1.2em" }}>
                  {energy}/{maxEnergy}
                </div>
              </div>
            </div>
            <div className="progress-bar" style={{ height: 6, margin: "8px 0" }}>
              <div className="progress-fill green" style={{ width: `${(energy / maxEnergy) * 100}%`, transition: "width 0.4s" }} />
            </div>
            {energy < maxEnergy ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="mono muted" style={{ fontSize: "0.72em" }}>
                  Restore to full — ${energyCost.toLocaleString()}
                </span>
                <button
                  className="btn btn-primary"
                  style={{ fontSize: "0.7em", padding: "5px 14px" }}
                  disabled={cash < energyCost}
                  onClick={() => onRestoreEnergy?.(energyCost)}
                >
                  ▶ Restore Now
                </button>
              </div>
            ) : (
              <div className="mono" style={{ fontSize: "0.72em", color: "#3d8c5a" }}>✓ Fully restored</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Save Info ── */}
      <div className="settings-section">
        <div className="settings-section-label">Save Data</div>
        <div className="save-info-card">
          <div className="mono muted" style={{ fontSize: "0.78em", lineHeight: 2 }}>
            <div>▸ Save key: <span className="amber">shattered_player_v4</span></div>
            <div>▸ Storage: <span style={{ color: "var(--text-secondary)" }}>Browser localStorage (local only)</span></div>
            <div>▸ Auto-save: <span style={{ color: "#3d8c5a" }}>Active — saves on every state change</span></div>
            <div>▸ Server sync: <span style={{ color: "var(--text-secondary)" }}>When server is running on port 3001</span></div>
          </div>
          <button
            className="btn"
            style={{ marginTop: 12, fontSize: "0.72em" }}
            onClick={() => {
              const data = JSON.stringify(player, null, 2);
              const blob = new Blob([data], { type: "application/json" });
              const url  = URL.createObjectURL(blob);
              const a    = document.createElement("a");
              a.href = url; a.download = `shattered_${player?.name || "save"}_${Date.now()}.json`;
              a.click(); URL.revokeObjectURL(url);
            }}
          >
            ▶ Export Save File
          </button>
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div className="settings-section danger-zone">
        <div className="settings-section-label" style={{ color: "#c0392b" }}>Danger Zone</div>

        {!confirmReset ? (
          <div className="danger-card">
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "0.9em", letterSpacing: "0.08em", textTransform: "uppercase", color: "#c0392b" }}>
                New Game
              </div>
              <p className="dim" style={{ fontSize: "0.82em", marginTop: 4, lineHeight: 1.5 }}>
                Permanently delete <strong>{player?.name}</strong> and all progress. This cannot be undone.
                Level {level} · {(player?.totalEarned || 0).toLocaleString()} total earned · {(player?.crimesSucceeded || 0)} crimes.
              </p>
            </div>
            <button
              className="btn btn-danger"
              style={{ marginTop: 12, fontSize: "0.72em" }}
              onClick={() => setConfirmReset(true)}
            >
              ▶ Delete Character & Start Over
            </button>
          </div>
        ) : (
          <div className="danger-confirm animate-in">
            <div className="mono" style={{ fontSize: "0.72em", color: "#c0392b", marginBottom: 10 }}>
              ⚠ Type your operative name to confirm deletion:
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="confirm-input"
                placeholder={`Type "${player?.name}" to confirm`}
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value.toUpperCase())}
                autoFocus
              />
              <button
                className="btn btn-danger"
                style={{ fontSize: "0.72em", whiteSpace: "nowrap" }}
                disabled={confirmName.trim() !== (player?.name || "").toUpperCase()}
                onClick={handleReset}
              >
                Delete
              </button>
              <button
                className="btn"
                style={{ fontSize: "0.72em" }}
                onClick={() => { setConfirmReset(false); setConfirmName(""); }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .settings-page { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
        .page-header { display: flex; flex-direction: column; gap: 4px; }
        .page-header h2 { font-size: 1.2em; letter-spacing: 0.15em; }
        .settings-section { background: var(--bg-card); border: 1px solid var(--border); padding: 16px; display: flex; flex-direction: column; gap: 10px; }
        .settings-section-label { font-family: var(--font-mono); font-size: 0.62em; text-transform: uppercase; letter-spacing: 0.2em; color: var(--amber-dim); border-bottom: 1px solid var(--border); padding-bottom: 6px; }
        .danger-zone { border-color: rgba(192,57,43,0.3); }
        .status-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .status-cell { background: var(--bg-raised); padding: 8px 10px; display: flex; flex-direction: column; gap: 3px; }
        .recovery-cards { display: flex; flex-direction: column; gap: 10px; }
        .recovery-card { background: var(--bg-raised); border: 1px solid var(--border); padding: 12px 14px; }
        .recovery-card.maxed { opacity: 0.7; }
        .recovery-header { display: flex; align-items: flex-start; gap: 10px; }
        .recovery-icon { font-size: 1.1em; flex-shrink: 0; margin-top: 2px; }
        .recovery-title { font-family: var(--font-display); font-size: 0.88em; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
        .save-info-card { background: var(--bg-raised); border: 1px solid var(--border); padding: 12px 14px; }
        .danger-card { background: rgba(192,57,43,0.05); border: 1px solid rgba(192,57,43,0.2); padding: 14px; }
        .danger-confirm { background: rgba(192,57,43,0.05); border: 1px solid #c0392b; padding: 14px; }
        .confirm-input { flex: 1; background: var(--bg-card); border: 1px solid var(--border); border-bottom: 2px solid #c0392b; color: var(--text-primary); font-family: var(--font-display); font-size: 0.9em; letter-spacing: 0.12em; padding: 7px 10px; outline: none; text-transform: uppercase; }
      `}</style>
    </div>
  );
}
