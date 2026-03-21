import { useMemo } from "react";
import { calcLevel, xpProgressInLevel, xpForLevel, xpForNextLevel } from "../data/levels";
import { HEAT_LEVELS, STAT_DEFINITIONS } from "../data/playerStats";
import { getAllDistrictsFull } from "../data/territories";
import { ALL_ORGANIZATIONS } from "../data/organizations";

const SB = ({ label, value, color = "var(--amber)", sub }) => (
  <div className="sb">
    <div className="sb-val mono" style={{ color }}>{value}</div>
    <div className="label">{label}</div>
    {sub && <div className="mono muted" style={{ fontSize: "0.6em" }}>{sub}</div>}
  </div>
);

export default function StatisticsPage({ player }) {
  const level    = calcLevel(player?.xp || 0);
  const xpPct    = xpProgressInLevel(player?.xp || 0, level);
  const heatInfo = HEAT_LEVELS[player?.heatLevel ?? 0];
  const faction  = ALL_ORGANIZATIONS.find(o => o.id === player?.factionId);

  const allDistricts   = getAllDistrictsFull();
  const ownedDistricts = (player?.ownedDistricts || [])
    .map(id => allDistricts.find(d => d.id === id)).filter(Boolean);
  const weeklyIncome = ownedDistricts.reduce((s, d) => s + d.passiveIncome, 0);

  const successRate = player?.crimesAttempted > 0
    ? ((player.crimesSucceeded / player.crimesAttempted) * 100).toFixed(1) : "0.0";
  const avgPerCrime = player?.crimesSucceeded > 0
    ? Math.floor((player.totalEarned || 0) / player.crimesSucceeded).toLocaleString() : "0";
  const crewPayroll = (player?.crew || []).reduce((s, m) => s + m.weeklyCost, 0);
  const avgLoyalty  = player?.crew?.length > 0
    ? (player.crew.reduce((s, m) => s + m.loyalty, 0) / player.crew.length).toFixed(1) : "—";

  const trainingLog  = player?.trainingLog || [];
  const trainedStats = trainingLog.reduce((acc, e) => {
    acc[e.stat] = (acc[e.stat] || 0) + e.gain; return acc;
  }, {});
  const topTrained = Object.entries(trainedStats).sort(([,a],[,b]) => b - a)[0];

  const statEntries = Object.entries(player?.stats || {}).sort(([,a],[,b]) => b - a);
  const topStat  = statEntries[0];
  const weakStat = statEntries[statEntries.length - 1];

  return (
    <div className="statspage animate-in">
      <div className="page-header"><h2>Statistics</h2>
        <span className="mono muted" style={{ fontSize:"0.7em" }}>Complete record of {player?.name || "operative"}'s criminal career.</span>
      </div>

      <div className="sc"><div className="sch">Identity</div>
        <div className="sg3">
          <SB label="Operative" value={player?.name || "—"} />
          <SB label="ID"        value={player?.id   || "—"} color="var(--text-muted)" />
          <SB label="Level"     value={level} />
          <SB label="Total XP"  value={(player?.xp || 0).toLocaleString()} color="#5a7ec8" sub={`${xpPct.toFixed(0)}% to Lv${level+1}`} />
          <SB label="Faction"   value={faction?.name || "Independent"}     color="#a85fd4" />
          <SB label="Heat"      value={`${player?.heat || 0}%`}            color={heatInfo.color} sub={heatInfo.label} />
        </div>
        <div style={{ marginTop:8 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
            <span className="label">Level {level} XP Progress</span>
            <span className="mono muted" style={{ fontSize:"0.65em" }}>
              {((player?.xp||0)-xpForLevel(level)).toLocaleString()} / {(xpForNextLevel(level)-xpForLevel(level)).toLocaleString()} XP
            </span>
          </div>
          <div className="progress-bar" style={{ height:5 }}>
            <div className="progress-fill" style={{ width:`${xpPct}%`, background:"var(--amber)", transition:"width 0.4s" }} />
          </div>
        </div>
      </div>

      <div className="sc"><div className="sch">Criminal Record</div>
        <div className="sg4">
          <SB label="Attempted"     value={player?.crimesAttempted || 0} />
          <SB label="Succeeded"     value={player?.crimesSucceeded || 0} color="#3d8c5a" />
          <SB label="Success Rate"  value={`${successRate}%`} color={Number(successRate)>=60?"#3d8c5a":"#e67e22"} />
          <SB label="Arrests"       value={player?.timesArrested || 0}   color="#c0392b" />
          <SB label="Total Earned"  value={`$${(player?.totalEarned||0).toLocaleString()}`} color="#3d8c5a" />
          <SB label="Avg per Crime" value={`$${avgPerCrime}`} color="#3d8c5a" />
          <SB label="Dirty Cash"    value={`$${(player?.dirtyCash||0).toLocaleString()}`} color="#8c7a3d" />
          <SB label="Laundered"     value={`$${(player?.totalLaundered||0).toLocaleString()}`} color="#5a7ec8" />
        </div>
      </div>

      <div className="sc"><div className="sch">Progression</div>
        <div className="sg4">
          <SB label="Faction Ops"     value={player?.completedMissions?.length || 0} color="var(--amber)" />
          <SB label="Challenges"      value={player?.claimedChallenges?.length || 0} color="#d4a827" />
          <SB label="Training Runs"   value={trainingLog.length} color="#5a7ec8" />
          <SB label="Top Trained"     value={topTrained ? `${STAT_DEFINITIONS[topTrained[0]]?.label} +${topTrained[1]}` : "—"} color="#5a7ec8" />
          <SB label="Prison Days"     value={player?.prisonDays || 0} color="#8c7a3d" />
          <SB label="Contacts Used"   value={Object.keys(player?.usedContactJobs || {}).length} />
          <SB label="Events Resolved" value={player?.eventsResolved || 0} color="#e67e22" />
          <SB label="Encounters"      value={player?.encountersEscaped || 0} color="#c0392b" />
        </div>
      </div>

      <div className="sc"><div className="sch">Empire</div>
        <div className="sg4">
          <SB label="Districts"      value={ownedDistricts.length} color="#3d8c5a" />
          <SB label="Weekly Income"  value={weeklyIncome > 0 ? `$${weeklyIncome.toLocaleString()}` : "—"} color="#3d8c5a" />
          <SB label="Crew"           value={player?.crew?.length || 0} color="#d4a827" />
          <SB label="Avg Loyalty"    value={avgLoyalty} color="#d4a827" />
          <SB label="Payroll/wk"     value={crewPayroll > 0 ? `$${crewPayroll.toLocaleString()}` : "—"} color="#c0392b" />
          <SB label="Inventory"      value={player?.inventory?.length || 0} color="#a85fd4" />
        </div>
        {ownedDistricts.length > 0 && (
          <div style={{ marginTop:10 }}>
            <div className="label" style={{ marginBottom:5 }}>Controlled Districts</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
              {ownedDistricts.map(d => (
                <span key={d.id} className="dchip">{d.name} — ${d.passiveIncome.toLocaleString()}/wk</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="sc"><div className="sch">All Operative Stats</div>
        <div className="all-stats">
          {statEntries.map(([key, val]) => {
            const def = STAT_DEFINITIONS[key];
            const tr  = trainedStats[key] || 0;
            return (
              <div key={key} className="asr">
                <span style={{ fontSize:"0.85em", width:18 }}>{def?.icon}</span>
                <span className="asn">{def?.label || key}</span>
                <div className="asbar"><div style={{ width:`${Math.min(100,val)}%`, height:"100%", background:def?.color||"var(--amber)", transition:"width 0.4s" }} /></div>
                <span className="mono amber" style={{ fontSize:"0.78em", minWidth:26, textAlign:"right" }}>{val}</span>
                {tr > 0 && <span className="mono" style={{ fontSize:"0.6em", color:"#5a7ec8", minWidth:40, textAlign:"right" }}>+{tr}</span>}
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:20, marginTop:10, flexWrap:"wrap" }}>
          {topStat && <div><span className="label">Strongest — </span><span className="mono" style={{ color:"#3d8c5a", fontSize:"0.8em" }}>{STAT_DEFINITIONS[topStat[0]]?.icon} {STAT_DEFINITIONS[topStat[0]]?.label} ({topStat[1]})</span></div>}
          {weakStat && weakStat[1] < 30 && <div><span className="label">Weakest — </span><span className="mono" style={{ color:"#e67e22", fontSize:"0.8em" }}>{STAT_DEFINITIONS[weakStat[0]]?.icon} {STAT_DEFINITIONS[weakStat[0]]?.label} ({weakStat[1]})</span></div>}
        </div>
      </div>

      <style>{`
        .statspage{padding:20px;overflow-y:auto;display:flex;flex-direction:column;gap:14px;}
        .page-header{display:flex;flex-direction:column;gap:4px;}
        .page-header h2{font-size:1.2em;letter-spacing:.15em;}
        .sc{background:var(--bg-card);border:1px solid var(--border);padding:14px 16px;display:flex;flex-direction:column;gap:10px;}
        .sch{font-family:var(--font-mono);font-size:.62em;text-transform:uppercase;letter-spacing:.2em;color:var(--amber-dim);border-bottom:1px solid var(--border);padding-bottom:6px;}
        .sg3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
        .sg4{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
        .sb{background:var(--bg-raised);padding:8px 10px;display:flex;flex-direction:column;gap:2px;}
        .sb-val{font-size:1.05em;}
        .all-stats{display:flex;flex-direction:column;gap:6px;}
        .asr{display:flex;align-items:center;gap:6px;}
        .asn{font-family:var(--font-display);font-size:.72em;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);min-width:90px;}
        .asbar{flex:1;height:3px;background:var(--bg-raised);overflow:hidden;}
        .dchip{font-family:var(--font-mono);font-size:.63em;padding:2px 8px;background:var(--bg-raised);border:1px solid var(--border);color:var(--text-secondary);}
      `}</style>
    </div>
  );
}
