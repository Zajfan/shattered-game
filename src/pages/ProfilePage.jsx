import { useMemo } from "react";
import { STAT_DEFINITIONS, HEAT_LEVELS } from "../data/playerStats";
import { organizations }                  from "../data/organizations";
import { CREW_ARCHETYPES }                from "../data/crew";
import { getAllDistrictsFull as getAllDistricts } from "../data/territories";
import { marketItems }                    from "../data/market";

const ACHIEVEMENTS = [
  { id: "first_blood",   label: "First Blood",     desc: "Complete your first crime.",           check: (p) => p.crimesSucceeded >= 1 },
  { id: "hustle_hard",   label: "Hustle Hard",      desc: "Complete 25 crimes.",                  check: (p) => p.crimesSucceeded >= 25 },
  { id: "ghost",         label: "Ghost",            desc: "Keep heat below 10% for a session.",   check: (p) => p.heat < 10 && p.crimesSucceeded >= 5 },
  { id: "hot_hundred",   label: "Hot Hundred",      desc: "Reach 100% heat.",                     check: (p) => p.heat >= 100 },
  { id: "kingpin",       label: "Kingpin",           desc: "Reach $1,000,000 total earned.",       check: (p) => p.totalEarned >= 1_000_000 },
  { id: "street_rat",    label: "Street Rat",       desc: "Earn your first $10,000.",             check: (p) => p.totalEarned >= 10_000 },
  { id: "made_man",      label: "Made Man",         desc: "Join a faction.",                      check: (p) => !!p.factionId },
  { id: "el_jefe",       label: "El Jefe",          desc: "Join a Tier 5 organization.",          check: (p) => ["sinaloa","cjng","ndrangheta"].includes(p.factionId) },
  { id: "the_crew",      label: "The Crew",         desc: "Hire your first crew member.",         check: (p) => (p.crew?.length || 0) >= 1 },
  { id: "army",          label: "Army",             desc: "Have 5+ active crew members.",         check: (p) => (p.crew?.length || 0) >= 5 },
  { id: "turf_war",      label: "Turf War",         desc: "Control your first district.",         check: (p) => (p.ownedDistricts?.length || 0) >= 1 },
  { id: "empire",        label: "Empire",           desc: "Control 5+ districts.",                check: (p) => (p.ownedDistricts?.length || 0) >= 5 },
  { id: "arms_dealer",   label: "Arms Dealer",      desc: "Own a weapon from the black market.",  check: (p) => (p.inventory || []).some((i) => ["ghost_pistol","sawed_off","ar_pistol","knife"].includes(i.id)) },
  { id: "laundromat",    label: "Laundromat",       desc: "Launder $100,000+.",                   check: (p) => (p.totalLaundered || 0) >= 100_000 },
  { id: "teflon",        label: "Teflon",           desc: "Commit 10 crimes without arrest.",     check: (p) => p.crimesSucceeded >= 10 && p.timesArrested === 0 },
  { id: "conviction",    label: "Conviction",       desc: "Get arrested 3 times.",                check: (p) => p.timesArrested >= 3 },
  { id: "jailbird",      label: "Jailbird",         desc: "Serve 30 prison days.",                check: (p) => (p.prisonDays || 0) >= 30 },
  { id: "tier5_crime",   label: "The Apex",         desc: "Attempt a Tier 5 crime.",              check: (p) => (p.tier5Attempts || 0) >= 1 },
];

function StatBar({ statKey, value }) {
  const def = STAT_DEFINITIONS[statKey];
  if (!def) return null;
  const pct = Math.min(100, (value / 100) * 100);
  return (
    <div className="profile-stat-row">
      <div className="profile-stat-left">
        <span className="profile-stat-icon">{def.icon}</span>
        <div>
          <div className="profile-stat-name">{def.label}</div>
          <div className="profile-stat-desc dim">{def.description}</div>
        </div>
      </div>
      <div className="profile-stat-right">
        <span className="mono amber" style={{ fontSize: "1em", minWidth: 28, textAlign: "right" }}>{value}</span>
        <div className="profile-stat-bar">
          <div className="profile-stat-fill" style={{ width: `${pct}%`, background: def.color }} />
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage({ player }) {
  if (!player) return null;

  const heatInfo    = HEAT_LEVELS[player.heatLevel ?? 0];
  const faction     = organizations.find((o) => o.id === player.factionId);
  const allDistricts= getAllDistricts();
  const ownedDists  = (player.ownedDistricts || []).map((id) => allDistricts.find((d) => d.id === id)).filter(Boolean);
  const successRate = player.crimesAttempted > 0
    ? Math.round((player.crimesSucceeded / player.crimesAttempted) * 100) : 0;

  const weeklyIncome = ownedDists.reduce((s, d) => s + d.passiveIncome, 0);
  const crewPayroll  = (player.crew || []).reduce((s, m) => s + m.weeklyCost, 0);

  const unlocked = useMemo(() => ACHIEVEMENTS.filter((a) => a.check(player)), [player]);

  const createdDate = player.createdAt
    ? new Date(player.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "Unknown";

  return (
    <div className="profile-page animate-in">

      {/* ── Identity Card ── */}
      <div className="profile-id-card">
        <div className="profile-id-stamp">
          <div className="mono" style={{ fontSize: "0.6em", letterSpacing: "0.25em", color: "var(--amber)", marginBottom: 4 }}>
            CASE FILE — CLASSIFIED
          </div>
          <div className="profile-name">{player.name}</div>
          <div className="mono muted" style={{ fontSize: "0.7em", marginTop: 4 }}>
            ID: {player.id} &nbsp;·&nbsp; Created: {createdDate} &nbsp;·&nbsp; Level {player.level}
          </div>
        </div>
        <div className="profile-id-right">
          <div className="profile-avatar">{player.name?.[0] || "?"}</div>
          <div className="profile-heat-badge" style={{ borderColor: heatInfo.color, color: heatInfo.color }}>
            {heatInfo.label}
          </div>
          <div className="mono muted" style={{ fontSize: "0.65em", marginTop: 4 }}>{player.heat}% heat</div>
        </div>
      </div>

      <div className="profile-grid">
        {/* LEFT COLUMN */}
        <div className="profile-col">

          {/* Stats */}
          <div className="profile-section">
            <div className="section-label">Operative Stats</div>
            <div className="profile-stats-list">
              {Object.entries(player.stats || {}).map(([k, v]) => (
                <StatBar key={k} statKey={k} value={v} />
              ))}
            </div>
          </div>

          {/* Inventory */}
          <div className="profile-section">
            <div className="section-label">Inventory ({(player.inventory || []).length} items)</div>
            {(player.inventory || []).length === 0 ? (
              <div className="profile-empty">No items in inventory.</div>
            ) : (
              <div className="profile-inventory-list">
                {(player.inventory || []).map((inv) => {
                  const def = marketItems.find((i) => i.id === inv.id);
                  return (
                    <div key={inv.id} className="inv-row">
                      <span className="mono" style={{ fontSize: "0.8em" }}>{def?.category || "Item"}</span>
                      <span style={{ fontSize: "0.88em" }}>{inv.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="profile-col">

          {/* Criminal Record */}
          <div className="profile-section">
            <div className="section-label">Criminal Record</div>
            <div className="profile-record-grid">
              {[
                { label: "Crimes Attempted",  val: player.crimesAttempted,  color: "var(--amber)" },
                { label: "Crimes Succeeded",  val: player.crimesSucceeded,  color: "#3d8c5a" },
                { label: "Success Rate",       val: `${successRate}%`,       color: "#d4a827" },
                { label: "Times Arrested",     val: player.timesArrested,    color: "#c0392b" },
                { label: "Total Earned",       val: `$${(player.totalEarned || 0).toLocaleString()}`, color: "var(--amber)" },
                { label: "Dirty Cash",         val: `$${(player.dirtyCash   || 0).toLocaleString()}`, color: "#8c7a3d" },
                { label: "Clean Cash",         val: `$${(player.cash        || 0).toLocaleString()}`, color: "#3d8c5a" },
                { label: "Prison Days",        val: player.prisonDays || 0,  color: "#5a7ec8" },
              ].map(({ label, val, color }) => (
                <div key={label} className="record-cell">
                  <span className="label">{label}</span>
                  <span className="mono" style={{ color, fontSize: "1.05em" }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Faction */}
          <div className="profile-section">
            <div className="section-label">Faction</div>
            {faction ? (
              <div className="profile-faction-card">
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1em", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {faction.name}
                </div>
                <div className="mono muted" style={{ fontSize: "0.7em", marginTop: 2 }}>{faction.type} · {faction.origin}</div>
                <div className="mono muted" style={{ fontSize: "0.7em", marginTop: 2 }}>Est. {faction.founded} · {faction.estimatedMembers}</div>
                <div className="mono" style={{ fontSize: "0.65em", color: "#3d8c5a", marginTop: 6 }}>Rank: {player.factionRank || "Associate"}</div>
              </div>
            ) : (
              <div className="profile-empty">No faction affiliation.</div>
            )}
          </div>

          {/* Crew */}
          <div className="profile-section">
            <div className="section-label">Active Crew ({(player.crew || []).length})</div>
            {(player.crew || []).length === 0 ? (
              <div className="profile-empty">No crew members hired.</div>
            ) : (
              <div className="crew-roster-list">
                {(player.crew || []).map((m) => (
                  <div key={m.uid} className="crew-roster-row">
                    <div>
                      <div className="mono" style={{ fontSize: "0.8em" }}>{m.name}</div>
                      <div className="mono muted" style={{ fontSize: "0.65em" }}>{m.role}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="mono" style={{ fontSize: "0.7em", color: [,"#c0392b","#e67e22","#d4a827","#5a7ec8","#3d8c5a"][m.loyalty] }}>
                        {"▮".repeat(m.loyalty)}{"▯".repeat(5 - m.loyalty)}
                      </div>
                      <div className="mono muted" style={{ fontSize: "0.62em" }}>${m.weeklyCost.toLocaleString()}/wk</div>
                    </div>
                  </div>
                ))}
                <div className="crew-payroll-total">
                  <span className="label">Weekly Payroll</span>
                  <span className="mono" style={{ color: "#c0392b" }}>${crewPayroll.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Territory */}
          <div className="profile-section">
            <div className="section-label">Territory ({ownedDists.length} districts)</div>
            {ownedDists.length === 0 ? (
              <div className="profile-empty">No territory controlled.</div>
            ) : (
              <div className="territory-list">
                {ownedDists.map((d) => (
                  <div key={d.id} className="territory-row">
                    <div>
                      <div className="mono" style={{ fontSize: "0.8em" }}>{d.name}</div>
                      <div className="mono muted" style={{ fontSize: "0.65em" }}>{d.city} · {d.type}</div>
                    </div>
                    <div className="mono" style={{ fontSize: "0.75em", color: "#3d8c5a" }}>
                      ${d.passiveIncome.toLocaleString()}/wk
                    </div>
                  </div>
                ))}
                <div className="crew-payroll-total">
                  <span className="label">Weekly Territory Income</span>
                  <span className="mono" style={{ color: "#3d8c5a" }}>${weeklyIncome.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="profile-section">
            <div className="section-label">Achievements ({unlocked.length} / {ACHIEVEMENTS.length})</div>
            <div className="achievements-grid">
              {ACHIEVEMENTS.map((a) => {
                const done = a.check(player);
                return (
                  <div key={a.id} className={`achievement-badge ${done ? "unlocked" : "locked"}`} title={a.desc}>
                    <div className="achievement-label">{a.label}</div>
                    <div className="achievement-desc">{a.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .profile-page { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }

        .profile-id-card {
          display: flex; justify-content: space-between; align-items: flex-start;
          border: 1px solid var(--border-accent); background: var(--bg-card);
          padding: 20px; border-left: 3px solid var(--amber);
        }
        .profile-name {
          font-family: var(--font-display); font-weight: 700;
          font-size: 2em; letter-spacing: 0.2em; text-transform: uppercase; color: var(--text-primary);
        }
        .profile-id-right { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .profile-avatar {
          width: 52px; height: 52px; border: 2px solid var(--amber); border-radius: 2px;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-weight: 700; font-size: 1.6em; color: var(--amber);
          background: var(--bg-raised);
        }
        .profile-heat-badge {
          font-family: var(--font-mono); font-size: 0.6em; letter-spacing: 0.15em;
          padding: 3px 8px; border: 1px solid; text-transform: uppercase;
        }

        .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .profile-col { display: flex; flex-direction: column; gap: 14px; }

        .profile-section { background: var(--bg-card); border: 1px solid var(--border); padding: 14px; }
        .section-label {
          font-family: var(--font-mono); font-size: 0.65em; text-transform: uppercase;
          letter-spacing: 0.2em; color: var(--amber-dim);
          border-bottom: 1px solid var(--border); padding-bottom: 6px; margin-bottom: 10px;
        }
        .profile-empty { font-family: var(--font-mono); font-size: 0.72em; color: var(--text-muted); padding: 8px 0; }

        /* Stats */
        .profile-stats-list { display: flex; flex-direction: column; gap: 10px; }
        .profile-stat-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
        .profile-stat-left { display: flex; align-items: flex-start; gap: 8px; flex: 1; }
        .profile-stat-icon { font-size: 1em; margin-top: 2px; }
        .profile-stat-name { font-family: var(--font-display); font-size: 0.8em; letter-spacing: 0.06em; text-transform: uppercase; }
        .profile-stat-desc { font-size: 0.72em; line-height: 1.4; margin-top: 1px; }
        .profile-stat-right { display: flex; align-items: center; gap: 8px; min-width: 120px; }
        .profile-stat-bar { flex: 1; height: 3px; background: var(--bg-raised); }
        .profile-stat-fill { height: 100%; transition: width 0.3s ease; }

        /* Record */
        .profile-record-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .record-cell {
          background: var(--bg-raised); padding: 8px 10px;
          display: flex; flex-direction: column; gap: 3px;
        }

        /* Faction */
        .profile-faction-card { background: var(--bg-raised); padding: 10px; border-left: 2px solid var(--amber); }

        /* Crew roster */
        .crew-roster-list { display: flex; flex-direction: column; gap: 6px; }
        .crew-roster-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 6px 8px; background: var(--bg-raised); border: 1px solid var(--border);
        }
        .crew-payroll-total {
          display: flex; justify-content: space-between; align-items: center;
          padding: 6px 0; border-top: 1px solid var(--border); margin-top: 4px;
        }

        /* Territory */
        .territory-list { display: flex; flex-direction: column; gap: 6px; }
        .territory-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 6px 8px; background: var(--bg-raised); border: 1px solid var(--border);
        }

        /* Inventory */
        .profile-inventory-list { display: flex; flex-direction: column; gap: 4px; }
        .inv-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 5px 8px; background: var(--bg-raised); border: 1px solid var(--border);
        }

        /* Achievements */
        .achievements-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 6px; }
        .achievement-badge {
          padding: 8px 10px; border: 1px solid; border-radius: var(--radius);
          display: flex; flex-direction: column; gap: 2px;
        }
        .achievement-badge.unlocked { border-color: var(--amber); background: var(--amber-glow); }
        .achievement-badge.locked   { border-color: var(--border); opacity: 0.4; filter: grayscale(1); }
        .achievement-label { font-family: var(--font-mono); font-size: 0.7em; letter-spacing: 0.08em; text-transform: uppercase; color: var(--amber); }
        .achievement-badge.locked .achievement-label { color: var(--text-muted); }
        .achievement-desc  { font-size: 0.72em; color: var(--text-secondary); line-height: 1.3; }
      `}</style>
    </div>
  );
}
