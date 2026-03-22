// src/components/RightPanel.jsx — Live status right panel
import { useState, useEffect } from "react";
import { HEAT_LEVELS }         from "../data/playerStats";
import { calcLevel }           from "../data/levels";
import { secondsRemaining, formatCountdown } from "../hooks/useGameClock";
import { getAllDistrictsFull } from "../data/territories";

function MiniBar({ value, max = 100, color }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ flex: 1, height: 4, background: "var(--bg-raised)", overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 0.4s" }} />
    </div>
  );
}

function LiveTimer({ startedAt, durationMs, label, color }) {
  const [secs, setSecs] = useState(() => secondsRemaining(startedAt, durationMs));
  useEffect(() => {
    const id = setInterval(() => setSecs(secondsRemaining(startedAt, durationMs)), 500);
    return () => clearInterval(id);
  }, [startedAt, durationMs]);

  const pct = Math.max(0, (1 - secs / (durationMs / 1000)) * 100);
  return (
    <div className="rp-timer">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span className="mono muted" style={{ fontSize: "0.65em" }}>{label}</span>
        <span className="mono" style={{ fontSize: "0.65em", color: secs > 0 ? color : "#3d8c5a" }}>
          {secs > 0 ? formatCountdown(secs) : "✓ Done"}
        </span>
      </div>
      <div style={{ height: 3, background: "var(--bg-raised)" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 0.5s" }} />
      </div>
    </div>
  );
}

export default function RightPanel({ player, log, onNavigate }) {
  const [tab, setTab] = useState("status"); // status | log

  const heatInfo   = HEAT_LEVELS[player?.heatLevel ?? 0];
  const level      = calcLevel(player?.xp || 0);
  const heat       = player?.heat    || 0;
  const health     = player?.health  || 100;
  const energy     = player?.energy  || 0;
  const maxEnergy  = player?.maxEnergy || 100;
  const cash       = player?.cash    || 0;
  const dirtyCash  = player?.dirtyCash || 0;

  const allDistricts   = getAllDistrictsFull();
  const ownedDistricts = (player?.ownedDistricts || [])
    .map(id => allDistricts.find(d => d.id === id)).filter(Boolean);
  const weeklyIncome   = ownedDistricts.reduce((s, d) => s + d.passiveIncome, 0);
  const hourlyIncome   = Math.floor(weeklyIncome / (7 * 24));

  const crew        = player?.crew || [];
  const crewPayroll = crew.reduce((s, m) => s + m.weeklyCost, 0);
  const lowLoyalty  = crew.filter(m => m.loyalty <= 2);

  const hasActiveTraining = !!player?.activeTraining;
  const hasCrimeCooldown  = !!player?.activeCrimeTimer;

  const hpColor = health > 60 ? "#3d8c5a" : health > 30 ? "#e67e22" : "#c0392b";

  const fmt = (n) => n >= 1_000_000 ? `$${(n/1_000_000).toFixed(1)}M`
                   : n >= 1_000     ? `$${(n/1_000).toFixed(1)}K`
                   : `$${n}`;

  return (
    <div className="rp-root">
      {/* Tab toggles */}
      <div className="rp-tabs">
        <button className={`rp-tab ${tab === "status" ? "active" : ""}`} onClick={() => setTab("status")}>Status</button>
        <button className={`rp-tab ${tab === "log"    ? "active" : ""}`} onClick={() => setTab("log")}>Log</button>
      </div>

      {/* ── STATUS TAB ── */}
      {tab === "status" && (
        <div className="rp-status">

          {/* Identity strip */}
          <div className="rp-identity">
            <div className="mono amber" style={{ fontSize: "0.78em", letterSpacing: "0.1em" }}>{player?.name || "—"}</div>
            <div className="mono muted" style={{ fontSize: "0.62em" }}>Lv {level} · {player?.factionId || "Independent"}</div>
          </div>

          {/* Vitals */}
          <div className="rp-section">
            <div className="rp-section-label">Vitals</div>
            {[
              { label: "Heat",   val: `${heat}%`,        color: heatInfo.color,  bar: heat,        max: 100,     sub: heatInfo.label },
              { label: "Health", val: `${health}%`,      color: hpColor,         bar: health,      max: 100  },
              { label: "Energy", val: `${energy}/${maxEnergy}`, color: "#3d8c5a", bar: energy,     max: maxEnergy },
            ].map(({ label, val, color, bar, max, sub }) => (
              <div key={label} className="rp-vital-row">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span className="label" style={{ fontSize: "0.62em" }}>{label}{sub ? ` — ${sub}` : ""}</span>
                  <span className="mono" style={{ fontSize: "0.65em", color }}>{val}</span>
                </div>
                <MiniBar value={bar} max={max} color={color} />
              </div>
            ))}
          </div>

          {/* Resources */}
          <div className="rp-section">
            <div className="rp-section-label">Resources</div>
            <div className="rp-resource-grid">
              <div className="rp-res"><span className="label">Cash</span><span className="mono amber" style={{ fontSize: "0.78em" }}>{fmt(cash)}</span></div>
              <div className="rp-res"><span className="label">Dirty</span><span className="mono" style={{ fontSize: "0.78em", color: "#8c7a3d" }}>{fmt(dirtyCash)}</span></div>
              {weeklyIncome > 0 && (
                <div className="rp-res"><span className="label">Income/hr</span><span className="mono" style={{ fontSize: "0.78em", color: "#3d8c5a" }}>+{fmt(hourlyIncome)}</span></div>
              )}
              {crewPayroll > 0 && (
                <div className="rp-res"><span className="label">Payroll/wk</span><span className="mono" style={{ fontSize: "0.78em", color: "#c0392b" }}>-{fmt(crewPayroll)}</span></div>
              )}
            </div>
          </div>

          {/* Active timers */}
          {(hasActiveTraining || hasCrimeCooldown) && (
            <div className="rp-section">
              <div className="rp-section-label">Timers</div>
              {hasActiveTraining && (
                <LiveTimer
                  startedAt={player.activeTraining.startedAt}
                  durationMs={player.activeTraining.durationMs}
                  label={`Training: ${player.activeTraining.activityId?.replace(/_/g, " ")}`}
                  color="#5a7ec8"
                />
              )}
              {hasCrimeCooldown && (
                <LiveTimer
                  startedAt={player.activeCrimeTimer.startedAt}
                  durationMs={player.activeCrimeTimer.durationMs}
                  label="Crime cooldown"
                  color="#e67e22"
                />
              )}
            </div>
          )}

          {/* Crew loyalty */}
          {crew.length > 0 && (
            <div className="rp-section">
              <div className="rp-section-label">Crew ({crew.length})</div>
              {crew.slice(0, 6).map(m => (
                <div key={m.uid} className="rp-crew-row">
                  <span className="mono" style={{ fontSize: "0.7em", color: "var(--text-secondary)" }}>{m.alias}</span>
                  <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: "0.62em", color: m.loyalty <= 2 ? "#c0392b" : "var(--amber-dim)" }}>
                    {"▮".repeat(m.loyalty)}{"▯".repeat(5 - m.loyalty)}
                  </span>
                </div>
              ))}
              {lowLoyalty.length > 0 && (
                <div className="mono" style={{ fontSize: "0.62em", color: "#c0392b", marginTop: 3 }}>
                  ⚠ {lowLoyalty.length} crew with low loyalty
                </div>
              )}
            </div>
          )}

          {/* Heat warning */}
          {heat >= 70 && (
            <div className="rp-heat-warn" style={{ borderColor: heatInfo.color }}>
              <div className="mono" style={{ fontSize: "0.68em", color: heatInfo.color, marginBottom: 4 }}>
                ⚠ {heatInfo.label.toUpperCase()}
              </div>
              <div className="mono muted" style={{ fontSize: "0.62em", lineHeight: 1.8 }}>
                {heat >= 95 && <div>▸ Federal manhunt active</div>}
                {heat >= 80 && heat < 95 && <div>▸ Arrest risk critical</div>}
                {heat >= 70 && heat < 80 && <div>▸ Under active surveillance</div>}
                <div
                  className="rp-link"
                  onClick={() => onNavigate?.("market")}
                >▸ Launder cash →</div>
              </div>
            </div>
          )}

          {/* Quick nav links */}
          <div className="rp-section">
            <div className="rp-section-label">Quick Nav</div>
            <div className="rp-quicknav">
              {[
                { page: "crimes",    label: "Crimes",   color: "#c0392b" },
                { page: "training",  label: "Train",    color: "#5a7ec8" },
                { page: "market",    label: "Market",   color: "#d4a827" },
                { page: "territory", label: "Territory",color: "#3d8c5a" },
              ].map(({ page, label, color }) => (
                <button
                  key={page}
                  className="rp-quickbtn"
                  style={{ borderTopColor: color }}
                  onClick={() => onNavigate?.(page)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── LOG TAB ── */}
      {tab === "log" && (
        <div className="rp-log">
          {log.length === 0 && <div className="mono muted" style={{ fontSize: "0.7em", opacity: 0.5, padding: "8px 0" }}>▸ Awaiting activity...</div>}
        {log.map((e, i) => {
            const match = e.match(/^\[(\d{2}:\d{2})\] (.*)/);
            const time  = match ? match[1] : null;
            const text  = match ? match[2] : e;
            return (
              <div key={i} className="rp-log-entry" style={{ opacity: i === 0 ? 1 : Math.max(0.25, 1 - i * 0.05) }}>
                {time && <span style={{ color: "var(--text-muted)", marginRight: 6, flexShrink: 0 }}>{time}</span>}
                <span>{text}</span>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .rp-root { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
        .rp-tabs { display: flex; gap: 0; border-bottom: 1px solid var(--border); flex-shrink: 0; }
        .rp-tab { flex: 1; font-family: var(--font-mono); font-size: 0.62em; text-transform: uppercase; letter-spacing: 0.1em; background: transparent; border: none; color: var(--text-muted); padding: 8px 0; cursor: pointer; transition: color 0.12s; }
        .rp-tab:hover  { color: var(--text-secondary); }
        .rp-tab.active { color: var(--amber); border-bottom: 2px solid var(--amber); }
        .rp-status { flex: 1; overflow-y: auto; padding: 10px 0; display: flex; flex-direction: column; gap: 12px; }
        .rp-identity { padding: 0 4px 8px; border-bottom: 1px solid var(--border); }
        .rp-section { display: flex; flex-direction: column; gap: 6px; }
        .rp-section-label { font-family: var(--font-mono); font-size: 0.58em; text-transform: uppercase; letter-spacing: 0.18em; color: var(--amber-dim); padding-bottom: 4px; border-bottom: 1px solid var(--border); }
        .rp-vital-row { display: flex; flex-direction: column; gap: 2px; }
        .rp-resource-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
        .rp-res { display: flex; flex-direction: column; gap: 2px; background: var(--bg-raised); padding: 5px 7px; }
        .rp-timer { display: flex; flex-direction: column; }
        .rp-crew-row { display: flex; align-items: center; padding: 2px 0; border-bottom: 1px solid var(--border); }
        .rp-heat-warn { border: 1px solid; padding: 8px 10px; }
        .rp-link { cursor: pointer; color: var(--amber-dim) !important; text-decoration: underline; text-underline-offset: 2px; }
        .rp-link:hover { color: var(--amber) !important; }
        .rp-quicknav { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
        .rp-quickbtn { background: var(--bg-raised); border: 1px solid var(--border); border-top: 2px solid; font-family: var(--font-mono); font-size: 0.62em; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); padding: 6px 4px; cursor: pointer; transition: all 0.1s; }
        .rp-quickbtn:hover { background: var(--bg-card); color: var(--text-secondary); }
        .rp-log { flex: 1; overflow-y: auto; padding: 6px 0; display: flex; flex-direction: column; gap: 2px; }
        .rp-log-entry { font-family: var(--font-mono); font-size: 0.65em; color: var(--text-muted); line-height: 1.9; border-bottom: 1px solid var(--border); padding: 1px 0; display: flex; align-items: baseline; gap: 0; }
      `}</style>
    </div>
  );
}
