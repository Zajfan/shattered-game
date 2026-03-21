import { useState } from "react";
import { ALL_ORGANIZATIONS as organizations } from "../data/organizations";
import { getMissionsForFaction, FACTION_RANKS, getRankForMissions, getNextRank } from "../data/factionMissions";

export default function FactionMissionsPage({ player, onMissionClaim }) {
  const [selected, setSelected] = useState(null);

  const faction = organizations.find((o) => o.id === player?.factionId);
  if (!faction) {
    return (
      <div className="fmissions-page animate-in">
        <div className="page-header"><h2>Faction Operations</h2></div>
        <div className="no-faction-card">
          <div className="panel-header">No Faction</div>
          <p className="dim" style={{ fontSize: "0.88em", lineHeight: 1.7 }}>
            You're operating independently. Join a faction from the Factions page to unlock
            faction-specific missions, rank progression, and exclusive perks.
          </p>
        </div>
        <style>{`.fmissions-page { padding:20px; display:flex; flex-direction:column; gap:16px; } .page-header h2 { font-size:1.2em; letter-spacing:.15em; } .no-faction-card { background: var(--bg-card); border: 1px solid var(--border); padding:20px; }`}</style>
      </div>
    );
  }

  const missions   = getMissionsForFaction(player.factionId);
  const completed  = player?.completedMissions || [];
  const claimable  = missions.filter((m) => m.checkComplete(player) && !completed.includes(m.id));
  const done       = missions.filter((m) => completed.includes(m.id));
  const pending    = missions.filter((m) => !m.checkComplete(player) && !completed.includes(m.id));

  const currentRank = getRankForMissions(completed.length);
  const nextRank    = getNextRank(currentRank);
  const rankPct     = nextRank
    ? Math.min(100, (completed.length / nextRank.minMissions) * 100)
    : 100;

  const handleClaim = (mission) => {
    if (!mission.checkComplete(player) || completed.includes(mission.id)) return;
    onMissionClaim?.({ missionId: mission.id, rewards: mission.rewards });
    setSelected(null);
  };

  const missionStatus = (m) => {
    if (completed.includes(m.id))    return "done";
    if (m.checkComplete(player))     return "claimable";
    return "pending";
  };

  return (
    <div className="fmissions-page animate-in">
      <div className="page-header">
        <h2>Faction Operations</h2>
        <span className="mono muted" style={{ fontSize: "0.7em" }}>
          Complete operations to rank up. Higher ranks unlock perks and exclusive crimes.
        </span>
      </div>

      {/* Faction header */}
      <div className="faction-header-card">
        <div>
          <div className="mono amber" style={{ fontSize: "0.62em", letterSpacing: "0.2em", marginBottom: 3 }}>CURRENT FACTION</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1em", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            {faction.name}
          </div>
          <div className="mono muted" style={{ fontSize: "0.7em", marginTop: 2 }}>{faction.type} · {faction.origin}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="label">Current Rank</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1em", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--amber)" }}>
            {currentRank.label}
          </div>
          <div className="mono muted" style={{ fontSize: "0.68em", marginTop: 2 }}>
            {completed.length} / {missions.length} ops complete
          </div>
        </div>
      </div>

      {/* Rank progression */}
      <div className="rank-progression">
        <div className="rank-track">
          {FACTION_RANKS.map((r, i) => {
            const achieved = completed.length >= r.minMissions;
            const isCurrent = r.rank === currentRank.rank;
            return (
              <div key={r.rank} className={`rank-node ${achieved ? "achieved" : ""} ${isCurrent ? "current" : ""}`}>
                <div className="rank-dot" />
                <div className="rank-label">{r.label}</div>
                <div className="mono muted" style={{ fontSize: "0.6em" }}>{r.minMissions} ops</div>
                {i < FACTION_RANKS.length - 1 && <div className={`rank-line ${achieved ? "achieved" : ""}`} />}
              </div>
            );
          })}
        </div>
        {nextRank && nextRank.rank > currentRank.rank && (
          <div style={{ marginTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span className="label" style={{ fontSize: "0.62em" }}>Progress to {nextRank.label}</span>
              <span className="mono muted" style={{ fontSize: "0.65em" }}>{completed.length} / {nextRank.minMissions} ops</span>
            </div>
            <div className="progress-bar" style={{ height: 5 }}>
              <div className="progress-fill" style={{ width: `${rankPct}%`, background: "var(--amber)" }} />
            </div>
          </div>
        )}
      </div>

      {/* Current rank perks */}
      <div className="panel">
        <div className="panel-header">Active Rank Perks — {currentRank.label}</div>
        {currentRank.perks.map((p) => (
          <div key={p} className="mono muted" style={{ fontSize: "0.78em", padding: "3px 0", borderBottom: "1px solid var(--border)" }}>
            ▸ {p}
          </div>
        ))}
      </div>

      <div className="fmissions-layout">
        <div className="missions-col">
          {/* Ready to claim */}
          {claimable.length > 0 && (
            <>
              <div className="section-label" style={{ color: "#3d8c5a" }}>▶ Ready to Claim ({claimable.length})</div>
              {claimable.map((m) => (
                <MissionCard key={m.id} mission={m} status="claimable" isSelected={selected?.id === m.id} onClick={() => setSelected(m)} />
              ))}
            </>
          )}

          {/* In progress */}
          {pending.length > 0 && (
            <>
              <div className="section-label">In Progress ({pending.length})</div>
              {pending.map((m) => (
                <MissionCard key={m.id} mission={m} status="pending" player={player} isSelected={selected?.id === m.id} onClick={() => setSelected(m)} />
              ))}
            </>
          )}

          {/* Completed */}
          {done.length > 0 && (
            <>
              <div className="section-label" style={{ color: "var(--text-muted)" }}>Completed ({done.length})</div>
              {done.map((m) => (
                <MissionCard key={m.id} mission={m} status="done" isSelected={selected?.id === m.id} onClick={() => setSelected(m)} />
              ))}
            </>
          )}
        </div>

        {/* Detail Panel */}
        <div className="mission-detail-col">
          {selected ? (
            <div className="mission-detail animate-in">
              <div className="panel-header">{selected.title}</div>
              <div className="mono" style={{ fontSize: "0.62em", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 8 }}>
                Operation {selected.order} · {faction.name}
              </div>
              <p style={{ fontSize: "0.88em", lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: 10 }}>
                {selected.desc}
              </p>
              <hr className="dark" />

              <div className="label" style={{ marginBottom: 6 }}>Objectives</div>
              {selected.objectives.map((obj) => (
                <div key={obj} className="objective-row">
                  <span className="mono amber" style={{ fontSize: "0.65em" }}>▸</span>
                  <span className="mono" style={{ fontSize: "0.78em", color: "var(--text-secondary)" }}>{obj}</span>
                </div>
              ))}

              <hr className="dark" />
              <div className="label" style={{ marginBottom: 6 }}>Rewards</div>
              {[
                { label: "Cash",       val: `$${selected.rewards.cash.toLocaleString()}`,  color: "#3d8c5a" },
                { label: "Reputation", val: `+${selected.rewards.rep}`,                    color: "var(--amber)" },
                { label: "XP",         val: `+${selected.rewards.xp}`,                    color: "#5a7ec8" },
                ...(selected.rewards.statBonus
                  ? Object.entries(selected.rewards.statBonus).map(([s, v]) => ({ label: s, val: `+${v} stat`, color: "#d4a827" }))
                  : []),
              ].map(({ label, val, color }) => (
                <div className="detail-row" key={label}>
                  <span className="label">{label}</span>
                  <span className="mono" style={{ color, fontSize: "0.8em" }}>{val}</span>
                </div>
              ))}

              <div className="real-data-note" style={{ marginTop: 10 }}>
                <span className="label" style={{ fontSize: "0.6em" }}>Real Data</span>
                <p style={{ fontSize: "0.72em", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.5, marginTop: 4 }}>
                  {selected.realNote}
                </p>
              </div>

              <hr className="dark" />
              {missionStatus(selected) === "claimable" ? (
                <button className="btn btn-primary" style={{ width: "100%", padding: "12px" }} onClick={() => handleClaim(selected)}>
                  ▶ Claim Rewards
                </button>
              ) : missionStatus(selected) === "done" ? (
                <div className="mono" style={{ textAlign: "center", color: "#3d8c5a", fontSize: "0.78em", padding: "10px" }}>✓ Completed</div>
              ) : (
                <div className="mono muted" style={{ textAlign: "center", fontSize: "0.75em", padding: "10px" }}>Complete objectives to unlock</div>
              )}
            </div>
          ) : (
            <div className="mission-detail-empty">
              <span className="mono muted" style={{ fontSize: "0.75em" }}>Select a mission</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .fmissions-page { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
        .page-header { display: flex; flex-direction: column; gap: 4px; }
        .page-header h2 { font-size: 1.2em; letter-spacing: 0.15em; }
        .faction-header-card { display: flex; justify-content: space-between; align-items: flex-start; background: var(--bg-card); border: 1px solid var(--border); border-left: 3px solid var(--amber); padding: 14px 16px; }
        .rank-progression { background: var(--bg-card); border: 1px solid var(--border); padding: 14px 16px; }
        .rank-track { display: flex; align-items: flex-start; gap: 0; overflow-x: auto; padding-bottom: 4px; }
        .rank-node { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 90px; position: relative; }
        .rank-dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--border); background: var(--bg-raised); }
        .rank-node.achieved .rank-dot { border-color: var(--amber); background: var(--amber); }
        .rank-node.current .rank-dot  { border-color: var(--amber); background: var(--amber); box-shadow: 0 0 8px rgba(200,146,42,0.5); }
        .rank-label { font-family: var(--font-mono); font-size: 0.62em; text-align: center; color: var(--text-muted); text-transform: uppercase; }
        .rank-node.achieved .rank-label { color: var(--amber); }
        .rank-line { position: absolute; top: 5px; left: 50%; width: 90px; height: 2px; background: var(--border); }
        .rank-line.achieved { background: var(--amber-dim); }
        .section-label { font-family: var(--font-mono); font-size: 0.65em; text-transform: uppercase; letter-spacing: 0.2em; color: var(--amber-dim); border-bottom: 1px solid var(--border); padding-bottom: 6px; margin-top: 4px; }
        .fmissions-layout { display: grid; grid-template-columns: 1fr 300px; gap: 16px; }
        .missions-col { display: flex; flex-direction: column; gap: 6px; }
        .mission-detail { background: var(--bg-card); border: 1px solid var(--border); padding: 16px; display: flex; flex-direction: column; gap: 8px; position: sticky; top: 0; }
        .mission-detail-empty { background: var(--bg-card); border: 1px dashed var(--border); padding: 40px; display: flex; align-items: center; justify-content: center; }
        .objective-row { display: flex; align-items: flex-start; gap: 8px; padding: 4px 0; border-bottom: 1px solid var(--border); }
        .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 3px 0; }
        .real-data-note { padding: 8px; background: var(--bg-raised); border-left: 2px solid var(--amber-dim); }
      `}</style>
    </div>
  );
}

function MissionCard({ mission, status, player, isSelected, onClick }) {
  const borderColor = status === "done" ? "var(--border)" : status === "claimable" ? "#3d8c5a" : "var(--border)";
  return (
    <div
      className={`mission-card ${isSelected ? "selected" : ""} status-${status}`}
      style={{ borderLeftColor: borderColor }}
      onClick={onClick}
    >
      <div className="mission-card-top">
        <span className="mission-order mono muted" style={{ fontSize: "0.65em" }}>Op {mission.order}</span>
        <span className="mission-title">{mission.title}</span>
        <span className="mission-status-badge" style={{
          color: status === "done" ? "#3d8c5a" : status === "claimable" ? "#3d8c5a" : "var(--text-muted)",
          fontSize: "0.62em", fontFamily: "var(--font-mono)", marginLeft: "auto"
        }}>
          {status === "done" ? "✓ DONE" : status === "claimable" ? "▶ CLAIM" : "PENDING"}
        </span>
      </div>
      <p className="dim" style={{ fontSize: "0.8em", lineHeight: 1.4 }}>{mission.desc}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {mission.objectives.slice(0, 2).map((o, i) => (
          <span key={i} className="mono muted" style={{ fontSize: "0.62em" }}>▸ {o}</span>
        ))}
      </div>
      <style>{`
        .mission-card { background: var(--bg-card); border: 1px solid var(--border); border-left: 3px solid; padding: 10px 14px; cursor: pointer; display: flex; flex-direction: column; gap: 5px; transition: all 0.12s; }
        .mission-card:hover  { background: var(--bg-raised); border-color: var(--amber-dim); }
        .mission-card.selected { background: var(--amber-glow); border-color: var(--amber); }
        .mission-card.status-done { opacity: 0.65; }
        .mission-card-top { display: flex; align-items: center; gap: 8px; }
        .mission-title { font-family: var(--font-display); font-size: 0.88em; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
      `}</style>
    </div>
  );
}
