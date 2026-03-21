import { useState } from "react";
import { STAT_DEFINITIONS } from "../data/playerStats";
import { resolveEscapeRoute } from "../data/encounters";

const TYPE_COLORS = {
  foot_chase:       "#e67e22",
  car_pursuit:      "#c0392b",
  standoff:         "#c0392b",
  sting_operation:  "#8e44ad",
  arrest:           "#2c3e50",
};

export default function EncounterModal({ encounter, player, onResolve, onDismiss }) {
  const [chosen,  setChosen]  = useState(null);
  const [result,  setResult]  = useState(null);
  const [resolving, setResolving] = useState(false);

  const color = TYPE_COLORS[encounter.type] || "#c0392b";

  const handleChoose = (route) => {
    if (chosen || resolving) return;
    setChosen(route);
    setResolving(true);

    setTimeout(() => {
      const resolution = resolveEscapeRoute(route, player);
      if (resolution.blocked) {
        setResult({ blocked: true, reason: resolution.reason });
        setChosen(null);
        setResolving(false);
        return;
      }
      setResult(resolution);
      setResolving(false);
      onResolve?.(encounter, route, resolution);
    }, 900);
  };

  return (
    <div className="encounter-overlay">
      <div className="encounter-modal animate-in" style={{ borderTopColor: color }}>

        {/* Header */}
        <div className="encounter-header">
          <div className="encounter-icon">{encounter.icon}</div>
          <div>
            <div className="mono" style={{ fontSize: "0.6em", letterSpacing: "0.25em", color, marginBottom: 2 }}>
              {encounter.type.replace(/_/g, " ").toUpperCase()} — ENCOUNTER
            </div>
            <h2 className="encounter-title">{encounter.title}</h2>
          </div>
          <div className="encounter-pulse" style={{ background: color }} />
        </div>

        {/* Flavor text */}
        <div className="encounter-flavor">
          <p className="encounter-flavor-text">"{encounter.flavor}"</p>
        </div>

        {/* Player status strip */}
        <div className="encounter-status">
          {[
            { label: "Heat",   val: `${player.heat || 0}%`,                                 color: "#c0392b" },
            { label: "Health", val: `${player.health || 100}%`,                              color: player.health > 50 ? "#3d8c5a" : "#c0392b" },
            { label: "Cash",   val: `$${(player.cash || 0).toLocaleString()}`,               color: "var(--amber)" },
          ].map(({ label, val, color: c }) => (
            <div key={label} className="status-pip">
              <span className="label">{label}</span>
              <span className="mono" style={{ color: c, fontSize: "0.9em" }}>{val}</span>
            </div>
          ))}
        </div>

        {/* Escape Routes */}
        {!result && (
          <div className="escape-routes">
            <div className="mono muted" style={{ fontSize: "0.62em", letterSpacing: "0.18em", marginBottom: 8 }}>
              CHOOSE YOUR MOVE:
            </div>
            {encounter.escapeRoutes.map((route) => {
              const isChosen = chosen?.id === route.id;
              const primaryStat = route.statChecks?.[0]?.stat;
              const statVal = player.stats?.[primaryStat] || 0;

              // Preview success chance
              let previewChance = route.baseSuccessChance;
              for (const check of route.statChecks || []) {
                const val = player.stats?.[check.stat] || 0;
                previewChance += Math.floor(((val - 20) / 10) * 2 * check.weight);
              }
              previewChance = Math.max(5, Math.min(90, previewChance));
              const chanceColor = previewChance >= 55 ? "#3d8c5a" : previewChance >= 35 ? "#d4a827" : "#c0392b";

              return (
                <button
                  key={route.id}
                  className={`escape-btn ${isChosen ? "chosen" : ""}`}
                  onClick={() => handleChoose(route)}
                  disabled={!!chosen}
                >
                  <div className="escape-btn-top">
                    <span className="escape-label">{route.label}</span>
                    <span className="mono" style={{ fontSize: "0.68em", color: chanceColor }}>
                      {previewChance}% success
                    </span>
                  </div>
                  <div className="escape-desc">{route.desc}</div>

                  <div className="escape-meta">
                    {route.statChecks?.slice(0, 2).map((c) => (
                      <span key={c.stat} className="stat-chip">
                        {STAT_DEFINITIONS[c.stat]?.icon} {STAT_DEFINITIONS[c.stat]?.label}: {player.stats?.[c.stat] || 0}
                      </span>
                    ))}
                    {route.cashCost > 0 && (
                      <span className="stat-chip" style={{ color: (player.cash || 0) >= route.cashCost ? "#3d8c5a" : "#c0392b" }}>
                        💰 ${route.cashCost.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {isChosen && resolving && (
                    <div className="escape-resolving mono" style={{ color }}>
                      ▸ Executing...
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`encounter-result animate-in ${result.blocked ? "blocked" : result.success ? "success" : "failure"}`}>
            {result.blocked ? (
              <>
                <div className="mono" style={{ fontSize: "0.68em", letterSpacing: "0.12em", color: "#c0392b", marginBottom: 6 }}>
                  ✗ BLOCKED
                </div>
                <p style={{ fontSize: "0.88em", color: "var(--text-secondary)" }}>{result.reason}</p>
                <button className="btn" style={{ marginTop: 12, width: "100%" }} onClick={() => setResult(null)}>
                  ◀ Choose again
                </button>
              </>
            ) : (
              <>
                <div className="mono" style={{ fontSize: "0.68em", letterSpacing: "0.12em", marginBottom: 6, color: result.success ? "#3d8c5a" : "#c0392b" }}>
                  {result.success ? "▶ ESCAPED" : result.outcome.arrested ? "▶ ARRESTED" : "▶ OUTCOME"}
                </div>
                <p style={{ fontSize: "0.9em", lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: 10 }}>
                  {result.outcome.msg}
                </p>
                <div className="result-deltas">
                  {result.outcome.heatDelta !== 0 && (
                    <span className="delta-tag" style={{ color: result.outcome.heatDelta > 0 ? "#c0392b" : "#3d8c5a" }}>
                      Heat {result.outcome.heatDelta > 0 ? "+" : ""}{result.outcome.heatDelta}%
                    </span>
                  )}
                  {result.outcome.healthDelta !== 0 && (
                    <span className="delta-tag" style={{ color: "#c0392b" }}>
                      Health {result.outcome.healthDelta}%
                    </span>
                  )}
                  {result.outcome.arrested && (
                    <span className="delta-tag" style={{ color: "#8e44ad" }}>Arrested</span>
                  )}
                  {result.outcome.reducedSentence && (
                    <span className="delta-tag" style={{ color: "#3d8c5a" }}>Sentence reduced</span>
                  )}
                  {result.outcome.honorDelta && (
                    <span className="delta-tag" style={{ color: "#d4a827" }}>
                      Honor {result.outcome.honorDelta}
                    </span>
                  )}
                </div>

                <div className="real-data-note" style={{ marginTop: 12 }}>
                  <p style={{ fontSize: "0.7em", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.5 }}>
                    {encounter.realNote}
                  </p>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "11px", marginTop: 14 }}
                  onClick={onDismiss}
                >
                  ▶ Continue
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        .encounter-overlay {
          position: fixed; inset: 0; z-index: 1100;
          background: rgba(0,0,0,0.88);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .encounter-modal {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-top: 3px solid;
          max-width: 520px; width: 100%;
          padding: 22px;
          display: flex; flex-direction: column; gap: 14px;
          box-shadow: 0 0 80px rgba(0,0,0,0.9);
        }
        .encounter-header { display: flex; align-items: flex-start; gap: 12px; }
        .encounter-icon   { font-size: 1.6em; flex-shrink: 0; margin-top: 2px; }
        .encounter-title  { font-family: var(--font-display); font-size: 1.25em; letter-spacing: 0.15em; text-transform: uppercase; }
        .encounter-pulse  { width: 8px; height: 8px; border-radius: 50%; margin-left: auto; margin-top: 6px; animation: pulse-amber 1.5s infinite; flex-shrink: 0; }
        .encounter-flavor { background: var(--bg-card); border-left: 3px solid var(--amber-dim); padding: 11px 14px; }
        .encounter-flavor-text { font-family: var(--font-body); font-size: 0.95em; font-style: italic; color: var(--text-secondary); line-height: 1.7; }
        .encounter-status { display: flex; gap: 0; border: 1px solid var(--border); background: var(--bg-card); }
        .status-pip { flex: 1; padding: 8px 12px; display: flex; flex-direction: column; gap: 2px; border-right: 1px solid var(--border); }
        .status-pip:last-child { border-right: none; }
        .escape-routes { display: flex; flex-direction: column; gap: 6px; }
        .escape-btn {
          background: var(--bg-card); border: 1px solid var(--border);
          padding: 12px 14px; cursor: pointer; text-align: left;
          display: flex; flex-direction: column; gap: 5px;
          transition: all 0.12s;
        }
        .escape-btn:hover:not(:disabled)  { border-color: var(--amber); background: var(--amber-glow); }
        .escape-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .escape-btn.chosen   { border-color: var(--amber); background: var(--amber-glow); }
        .escape-btn-top  { display: flex; justify-content: space-between; align-items: center; }
        .escape-label    { font-family: var(--font-display); font-size: 0.88em; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-primary); }
        .escape-desc     { font-size: 0.82em; color: var(--text-secondary); line-height: 1.4; }
        .escape-meta     { display: flex; gap: 6px; flex-wrap: wrap; }
        .stat-chip       { font-family: var(--font-mono); font-size: 0.62em; padding: 2px 7px; background: var(--bg-raised); border: 1px solid var(--border); color: var(--text-secondary); }
        .escape-resolving{ font-size: 0.72em; letter-spacing: 0.1em; margin-top: 4px; animation: flicker 0.8s infinite; }
        .encounter-result { padding: 14px; border: 1px solid; display: flex; flex-direction: column; gap: 8px; }
        .encounter-result.success { border-color: #3d8c5a; background: rgba(61,140,90,0.06); }
        .encounter-result.failure { border-color: #8c3d3d; background: rgba(140,61,61,0.06); }
        .encounter-result.blocked { border-color: var(--amber-dim); background: var(--amber-glow); }
        .result-deltas { display: flex; flex-wrap: wrap; gap: 6px; }
        .delta-tag { font-family: var(--font-mono); font-size: 0.68em; padding: 2px 8px; background: var(--bg-raised); border: 1px solid var(--border); }
        .real-data-note { padding: 8px; background: var(--bg-raised); border-left: 2px solid var(--amber-dim); }
      `}</style>
    </div>
  );
}
