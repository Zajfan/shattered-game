import { useState } from "react";
import { ALL_ORGANIZATIONS, ORGANIZATION_TYPES } from "../data/organizations";
import { calcLevel } from "../data/levels";

const TYPE_COLORS = {
  [ORGANIZATION_TYPES.STREET_GANG]: "#e05555",
  [ORGANIZATION_TYPES.MAFIA]:       "#a85fd4",
  [ORGANIZATION_TYPES.CARTEL]:      "#d4a827",
  [ORGANIZATION_TYPES.SYNDICATE]:   "#5a7ec8",
  [ORGANIZATION_TYPES.CYBERCRIME]:  "#3d8c5a",
};

export default function FactionsPage({ player, onJoinFaction }) {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const types = ["all", ...Object.values(ORGANIZATION_TYPES)];
  const filtered = filter === "all" ? ALL_ORGANIZATIONS : ALL_ORGANIZATIONS.filter((o) => o.type === filter);

  const playerLevel = calcLevel(player?.xp || 0);
  const canJoin = (org) =>
    playerLevel >= (org.levelReq || 1) &&
    Object.entries(org.joinRequirements || {}).every(
      ([stat, val]) => (player.stats[stat] || 0) >= val
    );

  return (
    <div className="factions-page animate-in">
      <div className="page-header">
        <h2>Criminal Organizations</h2>
        <span className="mono muted" style={{ fontSize: "0.7em" }}>
          Align with a faction. Rise through ranks. Control territory.
        </span>
      </div>

      {/* Filter */}
      <div className="filter-row">
        {types.map((t) => (
          <button
            key={t}
            className={`btn ${filter === t ? "btn-primary" : ""}`}
            style={{ fontSize: "0.65em", padding: "5px 10px" }}
            onClick={() => setFilter(t)}
          >
            {t === "all" ? "All" : t}
          </button>
        ))}
      </div>

      <div className="factions-layout">
        <div className="org-list">
          {filtered.map((org) => {
            const eligible = canJoin(org);
            const joined = player.factionId === org.id;
            const color = TYPE_COLORS[org.type] || "var(--amber)";
            return (
              <div
                key={org.id}
                className={`org-card ${selected?.id === org.id ? "selected" : ""} ${!eligible ? "ineligible" : ""}`}
                onClick={() => setSelected(org)}
                style={{ borderLeftColor: joined ? color : undefined }}
              >
                <div className="org-card-top">
                  <span className="org-type-badge" style={{ color, borderColor: color }}>{org.type}</span>
                  <span className={`tier-badge tier-${org.tier}`}>Tier {org.tier}</span>
                  {joined && <span className="mono" style={{ fontSize: "0.65em", color: "#3d8c5a", marginLeft: "auto" }}>● MEMBER</span>}
                </div>
                <div className="org-name">{org.name}</div>
                <div className="mono muted" style={{ fontSize: "0.7em" }}>{org.origin} · Est. {org.founded}</div>
                <div className="mono muted" style={{ fontSize: "0.7em" }}>
                  {eligible ? "✓ Eligible to join" : "⚠ Requirements not met"}
                </div>
              </div>
            );
          })}
        </div>

        <div className="org-detail-panel">
          {selected ? (
            <div className="org-detail animate-in">
              <div className="panel-header">{selected.name}</div>
              <span className="org-type-badge" style={{
                color: TYPE_COLORS[selected.type] || "var(--amber)",
                borderColor: TYPE_COLORS[selected.type] || "var(--amber)",
                marginBottom: 12, display: "inline-block"
              }}>
                {selected.type}
              </span>

              <p style={{ fontSize: "0.88em", lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: 12 }}>
                {selected.description}
              </p>
              <hr className="dark" />

              <div className="detail-row"><span className="label">Origin</span><span className="mono" style={{ fontSize: "0.75em" }}>{selected.origin}</span></div>
              <div className="detail-row"><span className="label">Founded</span><span className="mono" style={{ fontSize: "0.75em" }}>{selected.founded}</span></div>
              <div className="detail-row"><span className="label">Members</span><span className="mono" style={{ fontSize: "0.75em", color: "var(--text-secondary)" }}>{selected.estimatedMembers}</span></div>
              <hr className="dark" />

              <div className="label" style={{ marginBottom: 6 }}>Primary Activities</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
                {selected.primaryActivities.map((a) => (
                  <span key={a} className="activity-tag">{a}</span>
                ))}
              </div>

              {selected.rivalOrgs?.length > 0 && (
                <div className="detail-row">
                  <span className="label">Rivals</span>
                  <span className="mono" style={{ fontSize: "0.75em", color: "#c0392b" }}>{selected.rivalOrgs.join(", ")}</span>
                </div>
              )}
              <hr className="dark" />

              <div className="label" style={{ marginBottom: 6 }}>Perks (if joined)</div>
              {selected.perks?.map((p) => (
                <div key={p} className="mono muted" style={{ fontSize: "0.75em", paddingLeft: 8, lineHeight: 2 }}>▸ {p}</div>
              ))}
              <hr className="dark" />

              <div className="label" style={{ marginBottom: 6 }}>Requirements to Join</div>
              {Object.entries(selected.joinRequirements || {}).map(([stat, val]) => {
                const has = (player.stats[stat] || 0) >= val;
                return (
                  <div className="detail-row" key={stat}>
                    <span className="mono muted" style={{ fontSize: "0.75em", textTransform: "capitalize" }}>{stat}</span>
                    <span className="mono" style={{ fontSize: "0.75em", color: has ? "#3d8c5a" : "#c0392b" }}>
                      {player.stats[stat] || 0} / {val} {has ? "✓" : "✗"}
                    </span>
                  </div>
                );
              })}

              <div className="source-note mono muted" style={{ fontSize: "0.65em", marginTop: 12, fontStyle: "italic" }}>
                Source: {selected.source}
              </div>

              <button
                className={`btn ${player.factionId === selected.id ? "btn-danger" : "btn-primary"}`}
                style={{ width: "100%", marginTop: 12, padding: "12px" }}
                disabled={!canJoin(selected) && player.factionId !== selected.id}
                onClick={() => onJoinFaction && onJoinFaction(player.factionId === selected.id ? null : selected.id)}
              >
                {player.factionId === selected.id ? "▶ Leave Faction" : canJoin(selected) ? `▶ Join — ${selected.name}` : "⚠ Requirements Not Met"}
              </button>
            </div>
          ) : (
            <div className="org-detail-empty">
              <span className="mono muted" style={{ fontSize: "0.75em" }}>Select an organization</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .factions-page { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
        .page-header { display: flex; flex-direction: column; gap: 4px; }
        .page-header h2 { font-size: 1.2em; letter-spacing: 0.15em; }
        .filter-row { display: flex; flex-wrap: wrap; gap: 4px; }
        .factions-layout { display: grid; grid-template-columns: 1fr 300px; gap: 16px; }
        .org-list { display: flex; flex-direction: column; gap: 8px; }
        .org-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-left: 3px solid var(--border);
          padding: 12px 14px; cursor: pointer; transition: all 0.15s ease;
          display: flex; flex-direction: column; gap: 5px;
        }
        .org-card:hover { border-color: var(--amber-dim); background: var(--bg-raised); }
        .org-card.selected { border-color: var(--amber); background: var(--amber-glow); }
        .org-card.ineligible { opacity: 0.6; }
        .org-card-top { display: flex; align-items: center; gap: 6px; }
        .org-name { font-family: var(--font-display); font-size: 1em; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
        .org-type-badge {
          font-family: var(--font-mono); font-size: 0.6em; letter-spacing: 0.08em;
          padding: 2px 6px; border: 1px solid; text-transform: uppercase;
        }
        .activity-tag {
          font-family: var(--font-mono); font-size: 0.65em; padding: 2px 7px;
          background: var(--bg-raised); border: 1px solid var(--border);
          color: var(--text-secondary);
        }
        .org-detail {
          background: var(--bg-card); border: 1px solid var(--border);
          padding: 16px; display: flex; flex-direction: column; gap: 8px;
          position: sticky; top: 0;
        }
        .org-detail-empty {
          background: var(--bg-card); border: 1px dashed var(--border);
          padding: 32px; display: flex; align-items: center; justify-content: center;
        }
        .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 3px 0; }
        .source-note { border-top: 1px solid var(--border); padding-top: 8px; }
      `}</style>
    </div>
  );
}
