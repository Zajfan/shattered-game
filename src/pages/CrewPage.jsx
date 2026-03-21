import { useState } from "react";
import { CREW_ARCHETYPES, CREW_ROLES, LOYALTY_LABELS, generateCrewMember } from "../data/crew";
import { STAT_DEFINITIONS } from "../data/playerStats";

const ROLE_COLORS = {
  [CREW_ROLES.ENFORCER]:   "#c0392b",
  [CREW_ROLES.WHEELMAN]:   "#5a7ec8",
  [CREW_ROLES.HACKER]:     "#2ecc71",
  [CREW_ROLES.FIXER]:      "#a85fd4",
  [CREW_ROLES.SMUGGLER]:   "#d4a827",
  [CREW_ROLES.DEALER]:     "#e67e22",
  [CREW_ROLES.LOOKOUT]:    "#7f8c8d",
  [CREW_ROLES.INSIDE_MAN]: "#c8922a",
};

const LOYALTY_COLORS = { 5: "#3d8c5a", 4: "#5a7ec8", 3: "#d4a827", 2: "#e67e22", 1: "#c0392b" };

export default function CrewPage({ player, onCrewAction }) {
  const [tab,      setTab]      = useState("roster");   // roster | hire
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const crew      = player?.crew || [];
  const cash      = player?.cash || 0;
  const reputation= player?.stats?.reputation || 0;

  // Check if player meets requirements for an archetype
  const meetsReqs = (archetype) =>
    Object.entries(archetype.requiredStats || {}).every(
      ([stat, val]) => (player?.stats?.[stat] || 0) >= val
    );

  const handleHire = (archetype) => {
    if (cash < archetype.hiringFee) {
      setFeedback({ type: "error", msg: "Insufficient cash." });
      return;
    }
    if (!meetsReqs(archetype)) {
      setFeedback({ type: "error", msg: "Stat requirements not met." });
      return;
    }
    const member = generateCrewMember(archetype.id);
    onCrewAction?.({ type: "hire", member, cost: archetype.hiringFee });
    setFeedback({ type: "success", msg: `${member.name} (${archetype.role}) joins your crew.` });
    setSelected(null);
  };

  const handleFire = (memberId) => {
    onCrewAction?.({ type: "fire", memberId });
    setFeedback({ type: "success", msg: "Crew member dismissed." });
    setSelected(null);
  };

  const handlePayroll = () => {
    const total = crew.reduce((sum, m) => sum + m.weeklyCost, 0);
    if (cash < total) {
      setFeedback({ type: "error", msg: "Can't make payroll. Crew loyalty will drop." });
      onCrewAction?.({ type: "missed_payroll" });
      return;
    }
    onCrewAction?.({ type: "pay_crew", total });
    setFeedback({ type: "success", msg: `Paid $${total.toLocaleString()} payroll. Crew loyalty +1.` });
  };

  const weeklyPayroll = crew.reduce((sum, m) => sum + m.weeklyCost, 0);

  return (
    <div className="crew-page animate-in">
      <div className="page-header">
        <h2>Crew Management</h2>
        <span className="mono muted" style={{ fontSize: "0.7em" }}>
          Hire specialists. Manage loyalty. Deploy on operations.
        </span>
      </div>

      {/* Crew summary bar */}
      <div className="crew-summary-bar">
        <div className="crew-summary-stat">
          <span className="label">Crew Size</span>
          <span className="mono amber">{crew.length} / 15</span>
        </div>
        <div className="crew-summary-stat">
          <span className="label">Weekly Payroll</span>
          <span className="mono" style={{ color: weeklyPayroll > cash ? "#c0392b" : "#3d8c5a" }}>
            ${weeklyPayroll.toLocaleString()}
          </span>
        </div>
        <div className="crew-summary-stat">
          <span className="label">Cash Available</span>
          <span className="mono amber">${cash.toLocaleString()}</span>
        </div>
        <div className="crew-summary-stat">
          <span className="label">Avg Loyalty</span>
          <span className="mono" style={{ color: "#d4a827" }}>
            {crew.length > 0
              ? LOYALTY_LABELS[Math.round(crew.reduce((s, m) => s + m.loyalty, 0) / crew.length)] || "—"
              : "—"}
          </span>
        </div>
        {crew.length > 0 && (
          <button
            className="btn btn-primary"
            style={{ marginLeft: "auto", fontSize: "0.72em" }}
            onClick={handlePayroll}
          >
            ▶ Pay Weekly Crew (${weeklyPayroll.toLocaleString()})
          </button>
        )}
      </div>

      {feedback && (
        <div
          className="feedback-bar animate-in"
          style={{ borderColor: feedback.type === "success" ? "#3d8c5a" : "#c0392b",
                   color:       feedback.type === "success" ? "#3d8c5a" : "#c0392b" }}
          onClick={() => setFeedback(null)}
        >
          {feedback.type === "success" ? "✓" : "✗"} {feedback.msg}
          <span className="mono muted" style={{ marginLeft: "auto", fontSize: "0.7em" }}>[dismiss]</span>
        </div>
      )}

      {/* Tabs */}
      <div className="crew-tabs">
        <button className={`crew-tab ${tab === "roster" ? "active" : ""}`} onClick={() => { setTab("roster"); setSelected(null); }}>
          ▣ Active Roster ({crew.length})
        </button>
        <button className={`crew-tab ${tab === "hire" ? "active" : ""}`} onClick={() => { setTab("hire"); setSelected(null); }}>
          + Hire Specialists
        </button>
      </div>

      {/* ── ROSTER TAB ── */}
      {tab === "roster" && (
        <div className="crew-layout">
          <div className="crew-left">
            {crew.length === 0 ? (
              <div className="empty-crew">
                <div className="mono muted" style={{ fontSize: "0.8em", textAlign: "center" }}>
                  No crew hired yet.<br />Go to "Hire Specialists" to build your team.
                </div>
              </div>
            ) : (
              <div className="member-list">
                {crew.map((member) => {
                  const color = ROLE_COLORS[member.role] || "var(--amber)";
                  const loyaltyColor = LOYALTY_COLORS[member.loyalty] || "#5a5248";
                  return (
                    <div
                      key={member.uid}
                      className={`member-card ${selected?.uid === member.uid ? "selected" : ""}`}
                      onClick={() => setSelected({ ...member, isHired: true })}
                    >
                      <div className="member-card-top">
                        <div className="member-avatar" style={{ borderColor: color, color }}>
                          {member.alias[0]}
                        </div>
                        <div className="member-info">
                          <div className="member-name">{member.name}</div>
                          <div className="role-badge" style={{ color, borderColor: color }}>{member.role}</div>
                        </div>
                        <div style={{ marginLeft: "auto", textAlign: "right" }}>
                          <div className="mono" style={{ fontSize: "0.65em", color: loyaltyColor }}>
                            {LOYALTY_LABELS[member.loyalty] || "Unknown"}
                          </div>
                          <div className="mono muted" style={{ fontSize: "0.65em" }}>
                            ${member.weeklyCost.toLocaleString()}/wk
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                        <div className="progress-bar" style={{ flex: 1, height: "3px" }}>
                          <div className="progress-fill" style={{ width: `${(member.loyalty / 5) * 100}%`, background: loyaltyColor }} />
                        </div>
                      </div>
                      <div className="member-stats">
                        {Object.entries(member.statContributions).slice(0, 3).map(([stat, val]) => (
                          <span key={stat} className="stat-pill">
                            {STAT_DEFINITIONS[stat]?.icon} +{val} {STAT_DEFINITIONS[stat]?.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Member detail */}
          <div className="crew-detail-col">
            {selected?.isHired ? (
              <div className="crew-detail animate-in">
                <div className="panel-header">{selected.name}</div>
                <div className="role-badge" style={{
                  color: ROLE_COLORS[selected.role], borderColor: ROLE_COLORS[selected.role],
                  marginBottom: 8, display: "inline-block"
                }}>{selected.role}</div>

                <div className="detail-row">
                  <span className="label">Loyalty</span>
                  <span className="mono" style={{ color: LOYALTY_COLORS[selected.loyalty] }}>
                    {LOYALTY_LABELS[selected.loyalty]} ({selected.loyalty}/5)
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Weekly Cost</span>
                  <span className="mono amber">${selected.weeklyCost.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Missions</span>
                  <span className="mono muted">{selected.missionsCompleted}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Times Arrested</span>
                  <span className="mono" style={{ color: "#c0392b" }}>{selected.timesArrested}</span>
                </div>

                <hr className="dark" />
                <div className="label" style={{ marginBottom: 6 }}>Stat Contributions</div>
                {Object.entries(selected.statContributions).map(([stat, val]) => (
                  <div className="detail-row" key={stat}>
                    <span className="mono muted" style={{ fontSize: "0.75em" }}>
                      {STAT_DEFINITIONS[stat]?.icon} {STAT_DEFINITIONS[stat]?.label}
                    </span>
                    <span className="mono" style={{ fontSize: "0.75em", color: "#3d8c5a" }}>+{val}</span>
                  </div>
                ))}

                <hr className="dark" />
                <div className="label" style={{ marginBottom: 6 }}>Crime Bonuses</div>
                {Object.entries(selected.crimeBonus).map(([crime, val]) => (
                  <div className="detail-row" key={crime}>
                    <span className="mono muted" style={{ fontSize: "0.72em" }}>{crime.replace(/_/g, " ")}</span>
                    <span className="mono" style={{ fontSize: "0.72em", color: "#d4a827" }}>+{val}%</span>
                  </div>
                ))}

                <hr className="dark" />
                <button
                  className="btn btn-danger"
                  style={{ width: "100%", padding: "10px", marginTop: 4 }}
                  onClick={() => handleFire(selected.uid)}
                >
                  ▶ Dismiss {selected.alias}
                </button>
              </div>
            ) : (
              <div className="crew-detail-empty">
                <span className="mono muted" style={{ fontSize: "0.75em" }}>Select a crew member</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── HIRE TAB ── */}
      {tab === "hire" && (
        <div className="crew-layout">
          <div className="crew-left">
            <div className="member-list">
              {CREW_ARCHETYPES.map((archetype) => {
                const eligible  = meetsReqs(archetype);
                const canAfford = cash >= archetype.hiringFee;
                const color     = ROLE_COLORS[archetype.role] || "var(--amber)";
                return (
                  <div
                    key={archetype.id}
                    className={`member-card ${selected?.id === archetype.id ? "selected" : ""} ${!eligible || !canAfford ? "dim-card" : ""}`}
                    onClick={() => setSelected(archetype)}
                  >
                    <div className="member-card-top">
                      <div className="member-avatar" style={{ borderColor: color, color }}>
                        {archetype.role[0]}
                      </div>
                      <div className="member-info">
                        <div className="member-name">{archetype.role}</div>
                        <div className="role-badge" style={{ color, borderColor: color }}>For Hire</div>
                      </div>
                      <div style={{ marginLeft: "auto", textAlign: "right" }}>
                        <div className="mono amber" style={{ fontSize: "0.75em" }}>${archetype.hiringFee.toLocaleString()}</div>
                        <div className="mono muted" style={{ fontSize: "0.65em" }}>${archetype.weeklyCost.toLocaleString()}/wk</div>
                      </div>
                    </div>
                    <p className="dim" style={{ fontSize: "0.82em", lineHeight: 1.4 }}>{archetype.description}</p>
                    <div className="member-stats">
                      {Object.entries(archetype.statContributions).slice(0, 3).map(([stat, val]) => (
                        <span key={stat} className="stat-pill">
                          {STAT_DEFINITIONS[stat]?.icon} +{val} {STAT_DEFINITIONS[stat]?.label}
                        </span>
                      ))}
                    </div>
                    {!eligible  && <span className="mono" style={{ fontSize: "0.65em", color: "#c0392b" }}>⚠ Stat requirements not met</span>}
                    {!canAfford && <span className="mono" style={{ fontSize: "0.65em", color: "#c0392b" }}>✗ Can't afford hiring fee</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Archetype detail */}
          <div className="crew-detail-col">
            {selected && !selected.isHired ? (
              <div className="crew-detail animate-in">
                <div className="panel-header">{selected.role}</div>
                <div className="role-badge" style={{
                  color: ROLE_COLORS[selected.role], borderColor: ROLE_COLORS[selected.role],
                  marginBottom: 8, display: "inline-block"
                }}>Available for Hire</div>

                <p style={{ fontSize: "0.88em", lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: 12 }}>
                  {selected.description}
                </p>

                <hr className="dark" />
                <div className="detail-row">
                  <span className="label">Hiring Fee</span>
                  <span className="mono amber">${selected.hiringFee.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Weekly Salary</span>
                  <span className="mono" style={{ color: "#c0392b" }}>${selected.weeklyCost.toLocaleString()}</span>
                </div>

                <hr className="dark" />
                <div className="label" style={{ marginBottom: 6 }}>Requirements</div>
                {Object.entries(selected.requiredStats || {}).map(([stat, val]) => {
                  const have = player?.stats?.[stat] || 0;
                  const met  = have >= val;
                  return (
                    <div className="detail-row" key={stat}>
                      <span className="mono muted" style={{ fontSize: "0.75em", textTransform: "capitalize" }}>{stat}</span>
                      <span className="mono" style={{ fontSize: "0.75em", color: met ? "#3d8c5a" : "#c0392b" }}>
                        {have} / {val} {met ? "✓" : "✗"}
                      </span>
                    </div>
                  );
                })}

                <hr className="dark" />
                <div className="label" style={{ marginBottom: 6 }}>Stat Contributions</div>
                {Object.entries(selected.statContributions).map(([stat, val]) => (
                  <div className="detail-row" key={stat}>
                    <span className="mono muted" style={{ fontSize: "0.75em" }}>
                      {STAT_DEFINITIONS[stat]?.icon} {STAT_DEFINITIONS[stat]?.label}
                    </span>
                    <span className="mono" style={{ fontSize: "0.75em", color: "#3d8c5a" }}>+{val}</span>
                  </div>
                ))}

                <hr className="dark" />
                <div className="label" style={{ marginBottom: 6 }}>Crime Bonuses</div>
                {Object.entries(selected.crimeBonus).map(([crime, val]) => (
                  <div className="detail-row" key={crime}>
                    <span className="mono muted" style={{ fontSize: "0.72em" }}>{crime.replace(/_/g, " ")}</span>
                    <span className="mono" style={{ fontSize: "0.72em", color: "#d4a827" }}>+{val}%</span>
                  </div>
                ))}

                <div className="real-data-note" style={{ marginTop: 12 }}>
                  <span className="label" style={{ fontSize: "0.6em" }}>Real Data</span>
                  <p style={{ fontSize: "0.72em", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.5, marginTop: 4 }}>
                    {selected.realDataNote}
                  </p>
                </div>

                <hr className="dark" />
                <button
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "12px", marginTop: 4 }}
                  disabled={!meetsReqs(selected) || cash < selected.hiringFee}
                  onClick={() => handleHire(selected)}
                >
                  ▶ Hire — ${selected.hiringFee.toLocaleString()}
                </button>
              </div>
            ) : (
              <div className="crew-detail-empty">
                <span className="mono muted" style={{ fontSize: "0.75em" }}>Select a role to view details</span>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .crew-page { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
        .page-header { display: flex; flex-direction: column; gap: 4px; }
        .page-header h2 { font-size: 1.2em; letter-spacing: 0.15em; }
        .crew-summary-bar { display: flex; gap: 0; align-items: center; border: 1px solid var(--border); background: var(--bg-card); flex-wrap: wrap; padding: 4px 0; }
        .crew-summary-stat { padding: 8px 16px; display: flex; flex-direction: column; gap: 3px; border-right: 1px solid var(--border); }
        .crew-tabs { display: flex; gap: 4px; }
        .crew-tab {
          font-family: var(--font-mono); font-size: 0.75em; text-transform: uppercase;
          letter-spacing: 0.08em; background: transparent; border: 1px solid var(--border);
          color: var(--text-muted); padding: 7px 16px; cursor: pointer; transition: all 0.12s;
        }
        .crew-tab:hover { border-color: var(--amber-dim); color: var(--text-secondary); }
        .crew-tab.active { border-color: var(--amber); color: var(--amber); background: var(--amber-glow); }
        .crew-layout { display: grid; grid-template-columns: 1fr 300px; gap: 16px; }
        .crew-left { display: flex; flex-direction: column; gap: 8px; }
        .member-list { display: flex; flex-direction: column; gap: 6px; }
        .member-card {
          background: var(--bg-card); border: 1px solid var(--border);
          padding: 12px 14px; cursor: pointer; transition: all 0.12s;
          display: flex; flex-direction: column; gap: 7px;
        }
        .member-card:hover { border-color: var(--amber-dim); background: var(--bg-raised); }
        .member-card.selected { border-color: var(--amber); background: var(--amber-glow); }
        .member-card.dim-card { opacity: 0.55; }
        .member-card-top { display: flex; align-items: center; gap: 10px; }
        .member-avatar {
          width: 32px; height: 32px; border: 1px solid; border-radius: 2px;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-weight: 700; font-size: 0.9em;
          flex-shrink: 0;
        }
        .member-info { display: flex; flex-direction: column; gap: 2px; }
        .member-name { font-family: var(--font-display); font-size: 0.88em; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
        .role-badge { font-family: var(--font-mono); font-size: 0.6em; padding: 2px 6px; border: 1px solid; letter-spacing: 0.08em; text-transform: uppercase; display: inline-block; }
        .member-stats { display: flex; flex-wrap: wrap; gap: 4px; }
        .stat-pill {
          font-family: var(--font-mono); font-size: 0.62em;
          padding: 2px 6px; background: var(--bg-raised); border: 1px solid var(--border);
          color: var(--text-secondary); letter-spacing: 0.05em;
        }
        .crew-detail-col { }
        .crew-detail {
          background: var(--bg-card); border: 1px solid var(--border);
          padding: 16px; display: flex; flex-direction: column; gap: 8px;
          position: sticky; top: 0;
        }
        .crew-detail-empty {
          background: var(--bg-card); border: 1px dashed var(--border);
          padding: 40px; display: flex; align-items: center; justify-content: center;
        }
        .empty-crew {
          background: var(--bg-card); border: 1px dashed var(--border);
          padding: 40px; display: flex; align-items: center; justify-content: center;
        }
        .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 3px 0; }
        .real-data-note { padding: 8px; background: var(--bg-raised); border-left: 2px solid var(--amber-dim); }
        .feedback-bar {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 14px; border: 1px solid; font-family: var(--font-mono);
          font-size: 0.78em; cursor: pointer; letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
}
