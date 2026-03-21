import { useState, useEffect } from "react";
import { TRAINING_ACTIVITIES, TRAINING_VENUES, venueUnlockLevel } from "../data/training";
import { STAT_DEFINITIONS } from "../data/playerStats";
import { secondsRemaining, formatCountdown } from "../hooks/useGameClock";

const VENUE_ICONS = {
  [TRAINING_VENUES.GYM]:     "🏋️",
  [TRAINING_VENUES.MENTOR]:  "🧔",
  [TRAINING_VENUES.DARKNET]: "💻",
  [TRAINING_VENUES.RANGE]:   "🎯",
};

const VENUE_DESC = {
  [TRAINING_VENUES.GYM]:     "Physical conditioning. Muscle, nerve, endurance. The body is a weapon.",
  [TRAINING_VENUES.MENTOR]:  "Street education. Connections, situational awareness, manual skills.",
  [TRAINING_VENUES.DARKNET]: "Digital skills. Tech, intelligence, financial schemes. Invisible crimes.",
  [TRAINING_VENUES.RANGE]:   "Weapons proficiency. Firearm handling, stress inoculation, tactical nerve.",
};

function CountdownTick({ startedAt, durationMs }) {
  const [secs, setSecs] = useState(() => secondsRemaining(startedAt, durationMs));
  useEffect(() => {
    const id = setInterval(() => setSecs(secondsRemaining(startedAt, durationMs)), 500);
    return () => clearInterval(id);
  }, [startedAt, durationMs]);
  const pct = Math.max(0, (1 - secs / (durationMs / 1000)) * 100);
  return (
    <div className="countdown-block">
      <div className="progress-bar" style={{ height: 6, margin: "6px 0" }}>
        <div className="progress-fill" style={{ width: `${pct}%`, background: "var(--amber)" }} />
      </div>
      <span className="mono amber" style={{ fontSize: "0.85em" }}>
        {secs > 0 ? formatCountdown(secs) : "✓ Complete"}
      </span>
    </div>
  );
}

export default function TrainingPage({ player, onTrainingAction }) {
  const [venue,    setVenue]    = useState(TRAINING_VENUES.GYM);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const level     = player?.level || 1;
  const energy    = player?.energy || 0;
  const cash      = player?.cash   || 0;
  const active    = player?.activeTraining;
  const isTraining= !!active;

  const activities = TRAINING_ACTIVITIES.filter((a) => a.venue === venue);
  const venueReq   = venueUnlockLevel[venue] || 1;
  const venueOpen  = level >= venueReq;

  const handleStart = (activity) => {
    if (!venueOpen) { setFeedback({ type: "error", msg: `Requires Level ${venueReq}.` }); return; }
    if (isTraining)  { setFeedback({ type: "error", msg: "Already training. Finish current session first." }); return; }
    if (energy < activity.energyCost) { setFeedback({ type: "error", msg: "Not enough energy." }); return; }
    if (cash < activity.cashCost)     { setFeedback({ type: "error", msg: `Need $${activity.cashCost.toLocaleString()}.` }); return; }
    if (level < activity.levelReq)    { setFeedback({ type: "error", msg: `Requires Level ${activity.levelReq}.` }); return; }

    const gain = Math.floor(Math.random() * (activity.gainMax - activity.gainMin + 1)) + activity.gainMin;
    onTrainingAction?.({
      type:     "start",
      activityId: activity.id,
      stat:     activity.trainsStat,
      gain,
      maxEnergyGain: activity.maxEnergyGain || 0,
      energyCost: activity.energyCost,
      cashCost:   activity.cashCost,
      durationMs: activity.durationMs,
      startedAt:  Date.now(),
    });
    setFeedback({ type: "success", msg: `Started: ${activity.label}. Check back in ${activity.durationMs / 1000}s.` });
    setSelected(null);
  };

  const handleCancel = () => {
    onTrainingAction?.({ type: "cancel" });
    setFeedback({ type: "success", msg: "Training cancelled. Energy not refunded." });
  };

  // Build training log display
  const trainingLog = player?.trainingLog || [];

  return (
    <div className="training-page animate-in">
      <div className="page-header">
        <h2>Training</h2>
        <span className="mono muted" style={{ fontSize: "0.7em" }}>
          Sharpen your skills. Every stat can be trained. Time and energy are the cost.
        </span>
      </div>

      {/* Active Training Banner */}
      {isTraining && (
        <div className="active-training-banner animate-in">
          <div>
            <div className="mono" style={{ fontSize: "0.65em", letterSpacing: "0.15em", color: "var(--amber)", marginBottom: 4 }}>
              ▶ TRAINING IN PROGRESS
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "0.95em", letterSpacing: "0.1em" }}>
              {active.activityId?.replace(/_/g, " ").toUpperCase()}
            </div>
            <div className="mono muted" style={{ fontSize: "0.72em", marginTop: 2 }}>
              +{active.gain} {STAT_DEFINITIONS[active.stat]?.label || active.stat} on completion
            </div>
          </div>
          <div style={{ minWidth: 180 }}>
            <CountdownTick startedAt={active.startedAt} durationMs={active.durationMs} />
            <button className="btn btn-danger" style={{ width: "100%", fontSize: "0.65em", marginTop: 6 }} onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Resources */}
      <div className="training-resources">
        {[
          { label: "Energy",  val: `${energy} / ${player?.maxEnergy || 100}`, color: "#3d8c5a" },
          { label: "Cash",    val: `$${cash.toLocaleString()}`,               color: "var(--amber)" },
          { label: "Level",   val: level,                                     color: "var(--amber)" },
        ].map(({ label, val, color }) => (
          <div key={label} className="resource-pill">
            <span className="label">{label}</span>
            <span className="mono" style={{ color }}>{val}</span>
          </div>
        ))}
      </div>

      {feedback && (
        <div className="feedback-bar animate-in"
          style={{ borderColor: feedback.type === "success" ? "#3d8c5a" : "#c0392b", color: feedback.type === "success" ? "#3d8c5a" : "#c0392b" }}
          onClick={() => setFeedback(null)}>
          {feedback.type === "success" ? "✓" : "✗"} {feedback.msg}
          <span className="mono muted" style={{ marginLeft: "auto", fontSize: "0.7em" }}>[dismiss]</span>
        </div>
      )}

      {/* Venue Tabs */}
      <div className="venue-tabs">
        {Object.values(TRAINING_VENUES).map((v) => {
          const req  = venueUnlockLevel[v] || 1;
          const open = level >= req;
          return (
            <button
              key={v}
              className={`venue-tab ${venue === v ? "active" : ""} ${!open ? "locked" : ""}`}
              onClick={() => { setVenue(v); setSelected(null); setFeedback(null); }}
            >
              <span style={{ fontSize: "1em" }}>{VENUE_ICONS[v]}</span>
              <span>{v}</span>
              {!open && <span className="mono" style={{ fontSize: "0.6em", color: "#c0392b" }}>Lv{req}</span>}
            </button>
          );
        })}
      </div>

      <div className="training-layout">
        <div className="training-left">
          {/* Venue header */}
          <div className="venue-header">
            <span style={{ fontSize: "1.4em" }}>{VENUE_ICONS[venue]}</span>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "0.95em", letterSpacing: "0.12em", textTransform: "uppercase" }}>{venue}</div>
              <div className="dim" style={{ fontSize: "0.82em", marginTop: 2 }}>{VENUE_DESC[venue]}</div>
            </div>
            {!venueOpen && (
              <div className="mono" style={{ marginLeft: "auto", fontSize: "0.72em", color: "#c0392b" }}>
                Unlocks at Level {venueReq}
              </div>
            )}
          </div>

          {/* Activity List */}
          <div className="activity-list">
            {activities.map((act) => {
              const statDef   = STAT_DEFINITIONS[act.trainsStat];
              const canAfford = cash >= act.cashCost;
              const hasEnergy = energy >= act.energyCost;
              const hasLevel  = level >= act.levelReq;
              const eligible  = canAfford && hasEnergy && hasLevel && venueOpen && !isTraining;

              return (
                <div
                  key={act.id}
                  className={`activity-card ${selected?.id === act.id ? "selected" : ""} ${!eligible ? "dim-card" : ""}`}
                  onClick={() => setSelected(act)}
                >
                  <div className="activity-card-top">
                    <span style={{ fontSize: "0.9em" }}>{statDef?.icon}</span>
                    <span className="activity-name">{act.label}</span>
                    <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
                      <span className="mono muted" style={{ fontSize: "0.65em" }}>
                        {act.durationMs / 1000}s
                      </span>
                    </div>
                  </div>
                  <p className="dim" style={{ fontSize: "0.82em", lineHeight: 1.5 }}>{act.desc}</p>
                  <div className="activity-meta">
                    <span className="mono" style={{ fontSize: "0.7em", color: statDef?.color || "#3d8c5a" }}>
                      +{act.gainMin}–{act.gainMax} {statDef?.label}
                    </span>
                    <span className="mono muted" style={{ fontSize: "0.68em" }}>
                      ⚡{act.energyCost} {act.cashCost > 0 ? `· $${act.cashCost}` : ""}
                      {!hasLevel ? ` · Lv${act.levelReq} req` : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="training-detail-col">
          {selected ? (
            <div className="training-detail animate-in">
              <div className="panel-header">{selected.label}</div>
              <p style={{ fontSize: "0.88em", lineHeight: 1.7, color: "var(--text-secondary)" }}>
                {selected.desc}
              </p>
              <hr className="dark" />

              {[
                { label: "Trains",    val: STAT_DEFINITIONS[selected.trainsStat]?.label, color: "var(--amber)" },
                { label: "Gain",      val: `+${selected.gainMin}–${selected.gainMax}`,   color: "#3d8c5a" },
                { label: "Duration",  val: `${selected.durationMs / 1000}s real-time`,   color: "var(--text-secondary)" },
                { label: "Energy",    val: `${selected.energyCost} (have: ${energy})`,   color: energy >= selected.energyCost ? "#3d8c5a" : "#c0392b" },
                { label: "Cost",      val: selected.cashCost > 0 ? `$${selected.cashCost.toLocaleString()}` : "Free", color: cash >= selected.cashCost ? "#3d8c5a" : "#c0392b" },
                { label: "Level Req", val: selected.levelReq,  color: level >= selected.levelReq ? "#3d8c5a" : "#c0392b" },
              ].map(({ label, val, color }) => (
                <div className="detail-row" key={label}>
                  <span className="label">{label}</span>
                  <span className="mono" style={{ color, fontSize: "0.8em" }}>{val}</span>
                </div>
              ))}

              {selected.maxEnergyGain > 0 && (
                <div className="detail-row">
                  <span className="label">Max Energy Bonus</span>
                  <span className="mono" style={{ color: "#5a7ec8", fontSize: "0.8em" }}>+{selected.maxEnergyGain}</span>
                </div>
              )}

              <div className="real-data-note" style={{ marginTop: 8 }}>
                <span className="label" style={{ fontSize: "0.6em" }}>Real Data</span>
                <p style={{ fontSize: "0.72em", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.5, marginTop: 4 }}>
                  {selected.realNote}
                </p>
              </div>

              <hr className="dark" />
              <button
                className="btn btn-primary"
                style={{ width: "100%", padding: "12px" }}
                disabled={isTraining || energy < selected.energyCost || cash < selected.cashCost || level < selected.levelReq || !venueOpen}
                onClick={() => handleStart(selected)}
              >
                {isTraining ? "Already Training..." : `▶ Train — ${selected.label}`}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="training-empty">
                <span className="mono muted" style={{ fontSize: "0.75em" }}>Select an activity</span>
              </div>
              {/* Training Log */}
              {trainingLog.length > 0 && (
                <div className="panel">
                  <div className="panel-header">Recent Training</div>
                  {trainingLog.slice(0, 8).map((entry, i) => (
                    <div key={i} className="detail-row">
                      <span className="mono muted" style={{ fontSize: "0.72em" }}>{entry.activityId?.replace(/_/g,' ')}</span>
                      <span className="mono" style={{ fontSize: "0.72em", color: "#3d8c5a" }}>+{entry.gain} {entry.stat}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .training-page { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
        .page-header { display: flex; flex-direction: column; gap: 4px; }
        .page-header h2 { font-size: 1.2em; letter-spacing: 0.15em; }
        .active-training-banner { display: flex; justify-content: space-between; align-items: center; gap: 16px; background: var(--bg-card); border: 1px solid var(--amber); border-left: 3px solid var(--amber); padding: 14px 16px; }
        .training-resources { display: flex; gap: 0; border: 1px solid var(--border); background: var(--bg-card); }
        .resource-pill { flex: 1; padding: 8px 16px; display: flex; flex-direction: column; gap: 2px; border-right: 1px solid var(--border); }
        .resource-pill:last-child { border-right: none; }
        .venue-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
        .venue-tab { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: transparent; border: 1px solid var(--border); color: var(--text-muted); cursor: pointer; font-family: var(--font-display); font-size: 0.8em; letter-spacing: 0.08em; text-transform: uppercase; transition: all 0.12s; }
        .venue-tab:hover  { border-color: var(--amber-dim); color: var(--text-secondary); background: var(--bg-raised); }
        .venue-tab.active { border-color: var(--amber); color: var(--amber); background: var(--amber-glow); }
        .venue-tab.locked { opacity: 0.5; cursor: not-allowed; }
        .training-layout  { display: grid; grid-template-columns: 1fr 290px; gap: 16px; }
        .training-left    { display: flex; flex-direction: column; gap: 10px; }
        .venue-header     { display: flex; align-items: flex-start; gap: 10px; background: var(--bg-card); border: 1px solid var(--border); border-left: 3px solid var(--amber); padding: 12px 14px; }
        .activity-list    { display: flex; flex-direction: column; gap: 6px; }
        .activity-card    { background: var(--bg-card); border: 1px solid var(--border); padding: 11px 14px; cursor: pointer; transition: all 0.12s; display: flex; flex-direction: column; gap: 5px; }
        .activity-card:hover { border-color: var(--amber-dim); background: var(--bg-raised); }
        .activity-card.selected { border-color: var(--amber); background: var(--amber-glow); }
        .activity-card.dim-card { opacity: 0.5; }
        .activity-card-top { display: flex; align-items: center; gap: 8px; }
        .activity-name { font-family: var(--font-display); font-size: 0.88em; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
        .activity-meta { display: flex; justify-content: space-between; align-items: center; }
        .training-detail  { background: var(--bg-card); border: 1px solid var(--border); padding: 16px; display: flex; flex-direction: column; gap: 8px; position: sticky; top: 0; }
        .training-empty   { background: var(--bg-card); border: 1px dashed var(--border); padding: 40px; display: flex; align-items: center; justify-content: center; }
        .detail-row       { display: flex; justify-content: space-between; align-items: center; padding: 3px 0; }
        .real-data-note   { padding: 8px; background: var(--bg-raised); border-left: 2px solid var(--amber-dim); }
        .feedback-bar     { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border: 1px solid; font-family: var(--font-mono); font-size: 0.78em; cursor: pointer; letter-spacing: 0.05em; }
        .countdown-block  { display: flex; flex-direction: column; }
      `}</style>
    </div>
  );
}
