import { useState, useEffect } from "react";
import { STAT_DEFINITIONS, HEAT_LEVELS } from "../data/playerStats";
import { calcLevel, xpForLevel, xpForNextLevel, xpProgressInLevel, LEVEL_UNLOCKS } from "../data/levels";
import { getAllDistrictsFull as getAllDistricts } from "../data/territories";
import { secondsRemaining, formatCountdown } from "../hooks/useGameClock";
import { getMissionsForFaction, getRankForMissions } from "../data/factionMissions";
import { ALL_ORGANIZATIONS as organizations } from "../data/organizations";

function LiveCountdown({ startedAt, durationMs, label, color = "var(--amber)" }) {
  const [secs, setSecs] = useState(() => secondsRemaining(startedAt, durationMs));
  useEffect(() => {
    const id = setInterval(() => setSecs(secondsRemaining(startedAt, durationMs)), 500);
    return () => clearInterval(id);
  }, [startedAt, durationMs]);
  const pct = Math.max(0, (1 - secs / (durationMs / 1000)) * 100);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span className="label" style={{ fontSize: "0.62em" }}>{label}</span>
        <span className="mono" style={{ fontSize: "0.72em", color }}>{secs > 0 ? formatCountdown(secs) : "✓ Done"}</span>
      </div>
      <div className="progress-bar" style={{ height: 3 }}>
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function getDailyObjectives(player) {
  const objs = [];
  const heat = player.heat || 0;
  const energy = player.energy || 0;
  const level = calcLevel(player.xp || 0);
  if (heat < 35)   objs.push({ id: "crime",    icon: "🗂", text: "Commit a crime",                done: false,              page: "crimes" });
  if (heat >= 60)  objs.push({ id: "launder",  icon: "♻", text: "Launder dirty cash",            done: (player.dirtyCash||0)===0, page: "market" });
  if (!player.factionId) objs.push({ id: "faction", icon: "⚡", text: "Join a faction",           done: false,              page: "factions" });
  if (!(player.crew?.length)) objs.push({ id: "crew",   icon: "👥", text: "Hire a crew member",  done: false,              page: "crew" });
  if (!(player.ownedDistricts?.length) && level >= 4)
    objs.push({ id: "territory", icon: "⬡", text: "Claim a territory district",                   done: false,              page: "territory" });
  if (player.factionId) {
    const missions = getMissionsForFaction(player.factionId);
    const completed = player.completedMissions || [];
    const claimable = missions.filter((m) => m.checkComplete(player) && !completed.includes(m.id));
    if (claimable.length) objs.push({ id: "mission", icon: "📋", text: `Claim: ${claimable[0].title}`, done: false, page: "missions" });
  }
  if (!player.activeTraining)
    objs.push({ id: "train", icon: "💪", text: "Complete a training session", done: (player.trainingLog?.length||0)>0, page: "training" });
  return objs.slice(0, 6);
}

export default function Dashboard({ player, onNavigate }) {
  const heatInfo    = HEAT_LEVELS[player.heatLevel ?? 0];
  const level       = calcLevel(player.xp || 0);
  const xpProgress  = xpProgressInLevel(player.xp || 0, level);
  const xpCurrent   = (player.xp || 0) - xpForLevel(level);
  const xpNeeded    = xpForNextLevel(level) - xpForLevel(level);
  const nextUnlock  = LEVEL_UNLOCKS[level + 1];

  const allDistricts = getAllDistricts();
  const ownedDists   = (player.ownedDistricts||[]).map((id)=>allDistricts.find((d)=>d.id===id)).filter(Boolean);
  const weeklyIncome = ownedDists.reduce((s,d)=>s+d.passiveIncome,0);
  const crewPayroll  = (player.crew||[]).reduce((s,m)=>s+m.weeklyCost,0);
  const faction      = organizations.find((o)=>o.id===player.factionId);
  const factionRank  = faction ? getRankForMissions((player.completedMissions||[]).length) : null;
  const objectives   = getDailyObjectives(player);
  const topStats     = ["muscle","nerve","intelligence","streetSmarts","connections","reputation"];
  const energyPct    = Math.min(100, ((player.energy||0)/(player.maxEnergy||100))*100);
  const energyMins   = Math.ceil(((player.maxEnergy||100)-(player.energy||0))*3);

  return (
    <div className="dashboard animate-in">
      {/* Identity Bar */}
      <div className="identity-bar">
        <div className="identity-left">
          <div className="identity-avatar">{player.name?.[0]||"?"}</div>
          <div>
            <div className="identity-name">{player.name}</div>
            <div className="mono muted" style={{fontSize:"0.68em"}}>
              ID: {player.id} &nbsp;·&nbsp;
              {player.factionId ? <span className="amber">{faction?.name||player.factionId}</span> : "Independent"}
              {factionRank && <span style={{color:"var(--text-muted)"}}> · {factionRank.label}</span>}
            </div>
          </div>
        </div>
        <div className="heat-status-badge" style={{borderColor:heatInfo.color,color:heatInfo.color}}>
          {heatInfo.label.toUpperCase()} — {player.heat}%
        </div>
      </div>

      {/* XP Bar */}
      <div className="xp-bar-card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
          <div>
            <span className="mono amber" style={{fontSize:"0.75em",letterSpacing:"0.1em"}}>LEVEL {level}</span>
            <span className="mono muted" style={{fontSize:"0.65em",marginLeft:8}}>{LEVEL_UNLOCKS[level]?.label||""}</span>
          </div>
          <span className="mono muted" style={{fontSize:"0.65em"}}>{xpCurrent.toLocaleString()} / {xpNeeded.toLocaleString()} XP</span>
        </div>
        <div className="progress-bar" style={{height:5}}>
          <div className="progress-fill" style={{width:`${xpProgress}%`,background:"var(--amber)",transition:"width 0.6s ease"}}/>
        </div>
        {nextUnlock && <div className="mono muted" style={{fontSize:"0.6em",marginTop:3}}>Next: {nextUnlock.unlocks[0]} at Level {level+1}</div>}
      </div>

      <div className="dashboard-grid">
        {/* LEFT */}
        <div className="dash-col">
          <div className="dash-section-label">Resources</div>
          <div className="resources-grid">
            {[
              {label:"Clean Cash",  val:`$${(player.cash||0).toLocaleString()}`,      color:"#3d8c5a"},
              {label:"Dirty Cash",  val:`$${(player.dirtyCash||0).toLocaleString()}`, color:"#8c7a3d"},
              {label:"Territory",   val:weeklyIncome>0?`$${weeklyIncome.toLocaleString()}/wk`:"None", color:"#5a7ec8"},
              {label:"Crew Payroll",val:crewPayroll>0?`-$${crewPayroll.toLocaleString()}/wk`:"—", color:crewPayroll>0?"#c0392b":"var(--text-muted)"},
            ].map(({label,val,color})=>(
              <div key={label} className="resource-tile">
                <span className="label">{label}</span>
                <span className="mono" style={{color,fontSize:"1em"}}>{val}</span>
              </div>
            ))}
          </div>

          <div className="energy-card">
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span className="label">Energy</span>
              <span className="mono" style={{color:"#3d8c5a",fontSize:"0.82em"}}>{player.energy||0} / {player.maxEnergy||100}</span>
            </div>
            <div className="progress-bar" style={{height:7}}>
              <div className="progress-fill green" style={{width:`${energyPct}%`,transition:"width 0.5s"}}/>
            </div>
            {(player.energy||0)<(player.maxEnergy||100) && (
              <div className="mono muted" style={{fontSize:"0.6em",marginTop:3}}>Full in ~{energyMins}min · +1 energy / 3min</div>
            )}
          </div>

          {(player.activeTraining||player.activeCrimeTimer) && (
            <div className="active-timers-card">
              <div className="dash-section-label" style={{marginBottom:6}}>Active Timers</div>
              {player.activeTraining && (
                <LiveCountdown startedAt={player.activeTraining.startedAt} durationMs={player.activeTraining.durationMs}
                  label={`Training: ${player.activeTraining.activityId?.replace(/_/g," ")}`} color="#5a7ec8"/>
              )}
              {player.activeCrimeTimer && (
                <LiveCountdown startedAt={player.activeCrimeTimer.startedAt} durationMs={player.activeCrimeTimer.durationMs}
                  label="Crime cooldown" color="#c0392b"/>
              )}
            </div>
          )}

          <div className="dash-section-label">Stats</div>
          <div className="stats-snapshot">
            {topStats.map((key)=>{
              const def=STAT_DEFINITIONS[key]; const val=player.stats?.[key]||0;
              return (
                <div key={key} className="stat-snap-row">
                  <span style={{fontSize:"0.85em"}}>{def.icon}</span>
                  <span className="stat-snap-name">{def.label}</span>
                  <div className="stat-snap-bar"><div style={{width:`${Math.min(100,val)}%`,height:"100%",background:def.color,transition:"width 0.4s"}}/></div>
                  <span className="mono amber" style={{fontSize:"0.75em",minWidth:24,textAlign:"right"}}>{val}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT */}
        <div className="dash-col">
          <div className="dash-section-label">Daily Objectives</div>
          <div className="objectives-list">
            {objectives.map((obj)=>(
              <div key={obj.id} className={`objective-row ${obj.done?"obj-done":""}`}
                onClick={()=>!obj.done&&obj.page&&onNavigate(obj.page)} style={{cursor:obj.done?"default":"pointer"}}>
                <span style={{fontSize:"0.88em"}}>{obj.icon}</span>
                <span style={{fontSize:"0.82em",flex:1,color:obj.done?"var(--text-muted)":"var(--text-secondary)"}}>{obj.text}</span>
                {obj.done ? <span className="mono" style={{fontSize:"0.6em",color:"#3d8c5a"}}>✓</span>
                          : <span className="mono muted" style={{fontSize:"0.6em"}}>▸</span>}
              </div>
            ))}
          </div>

          <div className="dash-section-label">Quick Actions</div>
          <div className="quick-actions-grid">
            {[
              {page:"crimes",    icon:"🗂",label:"Crimes",    color:"#c0392b", blocked:player.heat>=95},
              {page:"training",  icon:"💪",label:"Train",     color:"#5a7ec8", blocked:(player.energy||0)<20},
              {page:"market",    icon:"◈", label:"Market",    color:"#d4a827", blocked:false},
              {page:"missions",  icon:"📋",label:"Faction Ops",color:"var(--amber)",blocked:!player.factionId},
              {page:"factions",  icon:"⚡",label:"Factions",  color:"#a85fd4", blocked:false},
              {page:"territory", icon:"⬡", label:"Territory", color:"#3d8c5a", blocked:(calcLevel(player.xp||0))<4},
              {page:"crew",      icon:"👥",label:"Crew",      color:"#e67e22", blocked:false},
              {page:"prison",    icon:"⊞", label:"Prison",    color:"#8c7a3d", blocked:false},
            ].map(({page,icon,label,color,blocked})=>(
              <button key={page} className={`quick-action-btn ${blocked?"blocked":""}`}
                style={{borderTopColor:blocked?"var(--border)":color}}
                onClick={()=>!blocked&&onNavigate(page)}>
                <span style={{fontSize:"1.05em"}}>{icon}</span>
                <span className="quick-action-label">{label}</span>
                {blocked&&<span className="mono" style={{fontSize:"0.52em",color:"var(--text-muted)"}}>LOCKED</span>}
              </button>
            ))}
          </div>

          <div className="dash-section-label">Criminal Record</div>
          <div className="record-strip">
            {[
              {label:"Crimes",  val:player.crimesSucceeded,color:"var(--amber)"},
              {label:"Arrests", val:player.timesArrested,  color:"#c0392b"},
              {label:"Earned",  val:`$${((player.totalEarned||0)/1000).toFixed(1)}K`, color:"#3d8c5a"},
              {label:"Districts",val:(player.ownedDistricts?.length||0), color:"#5a7ec8"},
              {label:"Crew",    val:(player.crew?.length||0), color:"#d4a827"},
            ].map(({label,val,color})=>(
              <div key={label} className="record-cell">
                <span className="label">{label}</span>
                <span className="mono" style={{color,fontSize:"0.9em"}}>{val}</span>
              </div>
            ))}
          </div>

          {(player.crew?.length||0)>0 && (
            <>
              <div className="dash-section-label">Crew</div>
              <div className="crew-status-strip">
                {player.crew.slice(0,5).map((m)=>(
                  <div key={m.uid} className="crew-status-row">
                    <span className="mono" style={{fontSize:"0.72em"}}>{m.alias}</span>
                    <span className="mono muted" style={{fontSize:"0.6em",flex:1,marginLeft:6}}>{m.role}</span>
                    <span style={{color:m.loyalty<=2?"#c0392b":"var(--amber-dim)",fontSize:"0.68em",fontFamily:"var(--font-mono)"}}>
                      {"▮".repeat(m.loyalty)}{"▯".repeat(5-m.loyalty)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .dashboard{padding:16px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;}
        .identity-bar{display:flex;justify-content:space-between;align-items:center;background:var(--bg-card);border:1px solid var(--border);border-left:3px solid var(--amber);padding:10px 14px;}
        .identity-left{display:flex;align-items:center;gap:10px;}
        .identity-avatar{width:38px;height:38px;border:2px solid var(--amber);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:1.1em;color:var(--amber);background:var(--bg-raised);flex-shrink:0;}
        .identity-name{font-family:var(--font-display);font-size:1.1em;letter-spacing:.15em;text-transform:uppercase;}
        .heat-status-badge{font-family:var(--font-mono);font-size:0.62em;letter-spacing:.12em;padding:4px 10px;border:1px solid;text-transform:uppercase;}
        .xp-bar-card{background:var(--bg-card);border:1px solid var(--border);padding:9px 12px;}
        .dashboard-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        .dash-col{display:flex;flex-direction:column;gap:8px;}
        .dash-section-label{font-family:var(--font-mono);font-size:0.6em;text-transform:uppercase;letter-spacing:.2em;color:var(--amber-dim);border-bottom:1px solid var(--border);padding-bottom:4px;}
        .resources-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px;}
        .resource-tile{background:var(--bg-card);border:1px solid var(--border);padding:7px 9px;display:flex;flex-direction:column;gap:2px;}
        .energy-card{background:var(--bg-card);border:1px solid var(--border);padding:9px 11px;}
        .active-timers-card{background:var(--bg-card);border:1px solid var(--border);border-left:3px solid var(--amber);padding:9px 12px;display:flex;flex-direction:column;gap:8px;}
        .stats-snapshot{display:flex;flex-direction:column;gap:5px;background:var(--bg-card);border:1px solid var(--border);padding:9px 11px;}
        .stat-snap-row{display:flex;align-items:center;gap:6px;}
        .stat-snap-name{font-family:var(--font-display);font-size:0.7em;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);min-width:76px;}
        .stat-snap-bar{flex:1;height:3px;background:var(--bg-raised);overflow:hidden;}
        .objectives-list{display:flex;flex-direction:column;gap:2px;background:var(--bg-card);border:1px solid var(--border);padding:7px 9px;}
        .objective-row{display:flex;align-items:center;gap:7px;padding:5px 0;border-bottom:1px solid var(--border);}
        .objective-row:last-child{border-bottom:none;}
        .objective-row.obj-done{opacity:.5;text-decoration:line-through;}
        .quick-actions-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;}
        .quick-action-btn{background:var(--bg-card);border:1px solid var(--border);border-top:2px solid;padding:9px 4px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;transition:all .12s;}
        .quick-action-btn:hover:not(.blocked){background:var(--bg-raised);transform:translateY(-1px);}
        .quick-action-btn.blocked{opacity:.4;cursor:not-allowed;}
        .quick-action-label{font-family:var(--font-mono);font-size:0.58em;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);text-align:center;}
        .record-strip{display:flex;background:var(--bg-card);border:1px solid var(--border);}
        .record-cell{flex:1;padding:6px 7px;display:flex;flex-direction:column;gap:2px;border-right:1px solid var(--border);}
        .record-cell:last-child{border-right:none;}
        .crew-status-strip{display:flex;flex-direction:column;gap:2px;background:var(--bg-card);border:1px solid var(--border);padding:7px 9px;}
        .crew-status-row{display:flex;align-items:center;padding:3px 0;border-bottom:1px solid var(--border);}
        .crew-status-row:last-child{border-bottom:none;}
      `}</style>
    </div>
  );
}
