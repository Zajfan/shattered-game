import { useState, useEffect, useCallback } from "react";
import "./index.css";

import TopBar              from "./components/TopBar";
import Sidebar             from "./components/Sidebar";
import EventModal          from "./components/EventModal";
import LevelUpModal        from "./components/LevelUpModal";
import Dashboard           from "./pages/Dashboard";
import CrimesPage          from "./pages/CrimesPage";
import FactionsPage        from "./pages/FactionsPage";
import MarketPage          from "./pages/MarketPage";
import TerritoryPage       from "./pages/TerritoryPage";
import PrisonPage          from "./pages/PrisonPage";
import CrewPage            from "./pages/CrewPage";
import ProfilePage         from "./pages/ProfilePage";
import MultiplayerPage     from "./pages/MultiplayerPage";
import TrainingPage        from "./pages/TrainingPage";
import FactionMissionsPage from "./pages/FactionMissionsPage";
import CharacterCreation   from "./pages/CharacterCreation";
import DailyChallengesPage from "./pages/DailyChallengesPage";
import DarkWebPage         from "./pages/DarkWebPage";
import SettingsPage        from "./pages/SettingsPage";
import StatisticsPage      from "./pages/StatisticsPage";
import TutorialOverlay     from "./components/TutorialOverlay";
import Toasts              from "./components/Toasts";
import { toast }           from "./components/Toasts";
import EncounterModal      from "./components/EncounterModal";
import RightPanel          from "./components/RightPanel";

import { useGameClock }            from "./hooks/useGameClock";
import { selectTriggeredEvent }    from "./data/events";
import { calcLevel, CRIME_XP, LEVEL_UNLOCKS } from "./data/levels";
import { getAllDistrictsFull as getAllDistricts } from "./data/territories";
import { getEncounterForCrime }    from "./data/encounters";
import { snapshotPlayerState, isSameDay } from "./data/dailyChallenges";
import { ACHIEVEMENTS }                   from "./data/achievements";
import { migratePlayer }                  from "./data/saveMigration";

const SAVE_KEY   = "shattered_player_v4";
const SERVER_URL = "http://localhost:3001";

const recalcHeat = (h) => h >= 90 ? 5 : h >= 70 ? 4 : h >= 50 ? 3 : h >= 30 ? 2 : h >= 15 ? 1 : 0;

export default function App() {
  const [player,       setPlayer]       = useState(null);
  const [page,         setPage]         = useState("dashboard");
  const [log,          setLog]          = useState([]);
  const [activeEvent,    setActiveEvent]    = useState(null);
  const [activeEncounter,setActiveEncounter]= useState(null);
  const [showTutorial,   setShowTutorial]   = useState(false);
  const [levelUpModal,   setLevelUpModal]   = useState(null);
  const [serverOnline,   setServerOnline]   = useState(false);

  const addLog = (msg) => {
    const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setLog((prev) => [`[${t}] ${msg}`, ...prev].slice(0, 50));
  };

  // Load / save
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const migrated = migratePlayer(JSON.parse(saved));
        setPlayer(migrated);
        addLog("Session restored.");
      }
    } catch {}
  }, []);
  useEffect(() => {
    if (player) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(player)); } catch {} }
  }, [player]);

  // Game clock (energy regen, training timer, territory income)
  useGameClock(player, setPlayer);

  // Achievement unlock detection — fires toast on new unlock
  useEffect(() => {
    if (!player) return;
    const unlockedIds = (player.unlockedAchievements || []);
    const nowUnlocked = ACHIEVEMENTS.filter(a => a.check(player)).map(a => a.id);
    const newOnes = nowUnlocked.filter(id => !unlockedIds.includes(id));
    if (newOnes.length > 0) {
      newOnes.forEach(id => {
        const ach = ACHIEVEMENTS.find(a => a.id === id);
        if (ach) toast.show(`🏆 Achievement: ${ach.label}`, "income", 5000);
      });
      setPlayer(prev => prev ? { ...prev, unlockedAchievements: [...unlockedIds, ...newOnes] } : prev);
    }
  }, [
    player?.crimesSucceeded, player?.heat, player?.totalEarned,
    player?.factionId, player?.crew?.length, player?.ownedDistricts?.length,
    player?.inventory?.length, player?.totalLaundered, player?.timesArrested,
    player?.prisonDays, player?.tier5Attempts, player?.xp,
  ]);

  // Server sync
  const syncToServer = useCallback((p) => {
    if (!p?.id) return;
    fetch(`${SERVER_URL}/api/players/sync`, {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(p),
    }).then(()=>setServerOnline(true)).catch(()=>setServerOnline(false));
  }, []);
  useEffect(() => {
    if (player) { const id = setTimeout(()=>syncToServer(player), 2000); return ()=>clearTimeout(id); }
  }, [player, syncToServer]);

  // Sync weekly territory income into player for clock access
  useEffect(() => {
    if (!player?.ownedDistricts?.length) return;
    const allD = getAllDistricts();
    const owned = player.ownedDistricts.map((id)=>allD.find((d)=>d.id===id)).filter(Boolean);
    const weekly = owned.reduce((s,d)=>s+d.passiveIncome,0);
    if (player.weeklyTerritoryIncome !== weekly) {
      setPlayer((p)=>p ? {...p, weeklyTerritoryIncome: weekly} : p);
    }
  }, [player?.ownedDistricts]);

  // Event engine
  useEffect(() => {
    if (!player || activeEvent) return;
    const id = setInterval(() => {
      if (activeEvent) return;
      const event = selectTriggeredEvent(player);
      if (event) { addLog(`⚠ EVENT: ${event.title}`); setActiveEvent(event); }
    }, 45000);
    return () => clearInterval(id);
  }, [player, activeEvent]);

  // Level up detector
  const checkLevelUp = (prev, next) => {
    const oldLevel = calcLevel(prev.xp || 0);
    const newLevel = calcLevel(next.xp || 0);
    if (newLevel > oldLevel) {
      setTimeout(() => setLevelUpModal(newLevel), 300);
      toast.show(`▲ LEVEL ${newLevel} — ${LEVEL_UNLOCKS[newLevel]?.label || "Rank Up"}`, "income", 6000);
      return newLevel;
    }
    return null;
  };

  const handleCreate = (newPlayer) => {
    const p = {
      ...newPlayer,
      inventory: [], crew: [], ownedDistricts: [], prisonDays: 0, prisonSentence: 0,
      totalLaundered: 0, tier5Attempts: 0, xp: 0,
      completedMissions: [], trainingLog: [],
      activeTraining: null, activeCrimeTimer: null,
      lastEnergyRegen: Date.now(), lastTerritoryTick: Date.now(), lastHeatDecay: Date.now(),
      claimedChallenges: [], usedContactJobs: {}, contactTrust: {},
      dailySnapshot: snapshotPlayerState({ ...newPlayer, completedMissions: [], trainingLog: [] }),
    };
    setPlayer(p); setPage("dashboard"); addLog(`New operative: ${p.name}`);
    setShowTutorial(true);
    setShowTutorial(true);
    setTimeout(() => syncToServer(p), 500);
  };

  const awardXP = (amount, prev) => {
    const newXP = (prev.xp || 0) + amount;
    const newLevel = calcLevel(newXP);
    return { xp: newXP, level: newLevel };
  };

  // Handlers
  const handleCrimeAttempt = (outcome) => {
    setPlayer((prev) => {
      const newHeat   = Math.min(100, (prev.heat||0) + outcome.heatGain);
      const autoArrest= !outcome.success && newHeat >= 80 && Math.random() < 0.4;
      const xpGain    = outcome.success ? (CRIME_XP[outcome.crime.tier] || 20) : 0;
      const xpNext    = awardXP(xpGain, prev);
      checkLevelUp(prev, {...prev, ...xpNext});
      addLog(outcome.success
        ? `${outcome.crime.name} — +$${outcome.cashGain.toLocaleString()} dirty · +${xpGain}XP`
        : `${outcome.crime.name} — FAILED${autoArrest ? " — ARRESTED" : ""}`);
      if (outcome.success) {
        toast.success(`+$${outcome.cashGain.toLocaleString()} · ${outcome.crime.name}`);
      } else if (autoArrest) {
        toast.error("Arrested at the scene");
        setTimeout(() => setPage("prison"), 900);
      } else {
        toast.warn(`Failed: ${outcome.crime.name}`);
        const encounter = getEncounterForCrime(outcome.crime, prev);
        if (encounter) setTimeout(() => setActiveEncounter(encounter), 600);
      }
      return {
        ...prev, ...xpNext,
        cash:            outcome.success ? prev.cash + (outcome.cashGain||0) : prev.cash,
        dirtyCash:       outcome.success ? prev.dirtyCash + (outcome.cashGain||0) : prev.dirtyCash,
        heat:            newHeat, heatLevel: recalcHeat(newHeat),
        crimesAttempted: prev.crimesAttempted + 1,
        crimesSucceeded: outcome.success ? prev.crimesSucceeded + 1 : prev.crimesSucceeded,
        timesArrested:   autoArrest ? (prev.timesArrested||0) + 1 : prev.timesArrested,
        isInCustody:     autoArrest ? true : (prev.isInCustody || false),
        totalEarned:     outcome.success ? prev.totalEarned+(outcome.cashGain||0) : prev.totalEarned,
        tier5Attempts:   outcome.crime.tier===5 ? (prev.tier5Attempts||0)+1 : (prev.tier5Attempts||0),
        activeCrimeTimer: outcome.cooldown ? { crimeId: outcome.crime.id, startedAt: Date.now(), durationMs: outcome.cooldown } : prev.activeCrimeTimer,
        stats: {...prev.stats, reputation: outcome.success ? Math.min(100,(prev.stats.reputation||0)+Math.floor(outcome.crime.tier*0.5)) : prev.stats.reputation},
      };
    });
  };

  const handleJoinFaction = (factionId) => {
    setPlayer((prev) => ({...prev, factionId}));
    addLog(factionId ? `Joined faction: ${factionId}` : "Left faction.");
  };

  const handleMarketTransaction = (tx) => {
    setPlayer((prev) => {
      if (tx.type==="buy") {
        const ns = {...prev.stats};
        for (const [s,v] of Object.entries(tx.item.statBonus||{})) ns[s]=(ns[s]||0)+v;
        const newHeat = Math.max(0,Math.min(100,(prev.heat||0)+(tx.item.heatOnPossession||0)-(tx.item.heatReduction||0)));
        addLog(`Bought: ${tx.item.name}`);
        return {...prev, cash:prev.cash+tx.cashDelta, heat:newHeat, heatLevel:recalcHeat(newHeat), stats:ns, inventory:[...(prev.inventory||[]),{id:tx.item.id,name:tx.item.name}]};
      }
      if (tx.type==="sell") {
        const ns={...prev.stats};
        for (const [s,v] of Object.entries(tx.item.statBonus||{})) ns[s]=Math.max(0,(ns[s]||0)-v);
        addLog(`Fenced: ${tx.item.name}`);
        return {...prev, cash:prev.cash+tx.cashDelta, stats:ns, inventory:(prev.inventory||[]).filter(i=>i.id!==tx.inventoryRemove)};
      }
      if (tx.type==="launder") {
        addLog(`Laundered $${tx.dirtyLost.toLocaleString()} → $${tx.cleanGain.toLocaleString()}`);
        return {...prev, cash:prev.cash+tx.cleanGain, dirtyCash:Math.max(0,prev.dirtyCash-tx.dirtyLost), totalLaundered:(prev.totalLaundered||0)+tx.dirtyLost};
      }
      return prev;
    });
  };

  const handleClaimDistrict = ({districtId,cost}) => {
    setPlayer((prev) => ({...prev, cash:prev.cash-cost, ownedDistricts:[...(prev.ownedDistricts||[]),districtId]}));
    addLog(`Claimed: ${districtId}`);
  };

  const handlePrisonAction = (action) => {
    setPlayer((prev) => {
      if (action.type==="activity_success") {
        const ns={...prev.stats}; ns[action.stat]=(ns[action.stat]||0)+action.gain;
        const cashGain = action.cashEarned || 0;
        addLog(`Prison: +${action.gain} ${action.stat}${cashGain ? ` +$${cashGain}` : ""}`);
        return {...prev, energy:Math.max(0,(prev.energy||100)-action.energyCost), prisonDays:(prev.prisonDays||0)+(action.addDay?1:0), stats:ns, cash:(prev.cash||0)+cashGain};
      }
      if (action.type==="activity_fail") return {...prev, energy:Math.max(0,(prev.energy||100)-action.energyCost), prisonSentence:(prev.prisonSentence||0)+action.extraDays};
      if (action.type==="serve_time") {
        const nh=Math.max(0,(prev.heat||0)-action.heatReduction);
        addLog(`Served ${action.days}d. Heat -${action.heatReduction}%`);
        return {...prev, heat:nh, heatLevel:recalcHeat(nh), prisonDays:(prev.prisonDays||0)+action.days};
      }
      if (action.type==="release") {
        const nh=Math.max(0,(prev.heat||0)-60);
        addLog("Released from custody.");
        toast.success("Released — heat cleared");
        setTimeout(() => setPage("dashboard"), 400);
        return {...prev, prisonDays:0, prisonSentence:0, heat:nh, heatLevel:recalcHeat(nh), energy:100, isInCustody:false};
      }
      if (action.type==="missed_payroll") return {...prev, crew:(prev.crew||[]).map(m=>({...m,loyalty:Math.max(1,m.loyalty-1)}))};
      return prev;
    });
  };

  const handleCrewAction = (action) => {
    setPlayer((prev) => {
      if (action.type==="hire") {
        const ns={...prev.stats};
        for (const [s,v] of Object.entries(action.member.statContributions||{})) ns[s]=(ns[s]||0)+v;
        addLog(`Hired: ${action.member.name}`);
        return {...prev, cash:prev.cash-action.cost, crew:[...(prev.crew||[]),action.member], stats:ns};
      }
      if (action.type==="fire") {
        const member=(prev.crew||[]).find(m=>m.uid===action.memberId);
        const ns={...prev.stats};
        if (member) for (const [s,v] of Object.entries(member.statContributions||{})) ns[s]=Math.max(0,(ns[s]||0)-v);
        addLog("Dismissed crew member.");
        return {...prev, crew:(prev.crew||[]).filter(m=>m.uid!==action.memberId), stats:ns};
      }
      if (action.type==="pay_crew") {
        addLog(`Payroll: $${action.total.toLocaleString()}`);
        return {...prev, cash:prev.cash-action.total, crew:(prev.crew||[]).map(m=>({...m,loyalty:Math.min(5,m.loyalty+1)}))};
      }
      return prev;
    });
  };

  const handleTrainingAction = (action) => {
    setPlayer((prev) => {
      if (action.type==="start") {
        addLog(`Training started: ${action.activityId?.replace(/_/g," ")}`);
        toast.show(`Training: ${action.activityId?.replace(/_/g," ")} · ${action.durationMs/1000}s`, "info");        return {
          ...prev,
          energy: Math.max(0,(prev.energy||100)-action.energyCost),
          cash:   Math.max(0,(prev.cash||0)-action.cashCost),
          activeTraining: { activityId:action.activityId, stat:action.stat, gain:action.gain, maxEnergyGain:action.maxEnergyGain, durationMs:action.durationMs, startedAt:action.startedAt },
        };
      }
      if (action.type==="cancel") {
        addLog("Training cancelled.");
        return {...prev, activeTraining:null};
      }
      return prev;
    });
  };

  const handleMissionClaim = ({missionId, rewards}) => {
    setPlayer((prev) => {
      const xpNext = awardXP(rewards.xp||0, prev);
      checkLevelUp(prev, {...prev,...xpNext});
      const ns = {...prev.stats};
      ns.reputation = Math.min(100,(ns.reputation||0)+(rewards.rep||0));
      if (rewards.statBonus) for (const [s,v] of Object.entries(rewards.statBonus)) ns[s]=(ns[s]||0)+v;
      addLog(`Mission complete: +$${rewards.cash.toLocaleString()} +${rewards.rep} rep +${rewards.xp}XP`);
      toast.success(`Mission complete! +$${rewards.cash.toLocaleString()} +${rewards.xp}XP`);
      return {
        ...prev, ...xpNext,
        cash: prev.cash + (rewards.cash||0),
        stats: ns,
        completedMissions: [...(prev.completedMissions||[]), missionId],
      };
    });
  };

  const handleEncounterResolve = (encounter, route, resolution) => {
    setPlayer((prev) => {
      if (!resolution.success) return prev;
      const out = resolution.outcome;
      let next = { ...prev };
      if (out.heatDelta)   { const nh = Math.max(0, Math.min(100, (next.heat||0) + out.heatDelta)); next.heat = nh; next.heatLevel = recalcHeat(nh); }
      if (out.healthDelta) { next.health = Math.max(0, Math.min(100, (next.health||100) + out.healthDelta)); }
      if (out.honorDelta)  { next.stats = { ...next.stats, honor: Math.max(0, Math.min(100, (next.stats?.honor||50) + out.honorDelta)) }; }
      if (out.arrested) {
        addLog(`Arrested during ${encounter.title}`);
        toast.error("Arrested — you're being booked");
        next.timesArrested = (next.timesArrested || 0) + 1;
        next.isInCustody   = true;
        setTimeout(() => setPage("prison"), 800);
      } else {
        addLog(`Escaped: ${encounter.title}`);
        toast.success("Escaped!");
        next.encountersEscaped = (next.encountersEscaped || 0) + 1;
      }
      return next;
    });
  };

  const handleClaimChallenge = (challenge) => {
    setPlayer((prev) => {
      if ((prev.claimedChallenges||[]).includes(challenge.id)) return prev;
      const xpNext = awardXP(challenge.rewards.xp || 0, prev);
      checkLevelUp(prev, { ...prev, ...xpNext });
      addLog(`Challenge: ${challenge.label} — +$${challenge.rewards.cash} +${challenge.rewards.xp}XP`);
      toast.success(`Challenge complete: ${challenge.label} +$${challenge.rewards.cash.toLocaleString()}`);
      return { ...prev, ...xpNext, cash: prev.cash + (challenge.rewards.cash||0), claimedChallenges: [...(prev.claimedChallenges||[]), challenge.id] };
    });
  };

  const handleContactJob = (contact, job) => {
    setPlayer((prev) => {
      let next = { ...prev, usedContactJobs: { ...(prev.usedContactJobs||{}), [job.id]: Date.now() } };
      // Deduct cost
      next.cash = Math.max(0, (next.cash||0) - (job.price||0));
      // Apply effects
      if (job.type === "launder" && job.conversionRate) {
        const maxDirty = Math.min(job.maxDirty, prev.dirtyCash || 0);
        const gain = Math.floor(maxDirty * job.conversionRate);
        next.dirtyCash = Math.max(0, (next.dirtyCash||0) - maxDirty);
        next.cash = (next.cash||0) + gain;
        next.totalLaundered = (next.totalLaundered||0) + maxDirty;
        toast.income(`Laundered $${maxDirty.toLocaleString()} → $${gain.toLocaleString()}`);
      }
      if (job.type === "purchase" && job.itemId) {
        next.inventory = [...(next.inventory||[]), { id: job.itemId, name: job.itemId.replace(/_/g," ") }];
        toast.success(`Acquired: ${job.itemId.replace(/_/g," ")}`);
      }
      if (job.type === "stat_boost" && job.stat) {
        next.stats = { ...next.stats, [job.stat]: (next.stats?.[job.stat]||0) + job.amount };
        toast.success(`+${job.amount} ${job.stat}`);
      }
      if (job.type === "heat_reduction") {
        const nh = Math.max(0, (next.heat||0) - job.amount);
        next.heat = nh; next.heatLevel = recalcHeat(nh);
        toast.success(`Heat reduced by ${job.amount}%`);
      }
      // Increase contact trust
      next.contactTrust = { ...(next.contactTrust||{}), [contact.id]: Math.min(4, ((next.contactTrust||{})[contact.id]||0) + 1) };
      addLog(`${contact.alias}: ${job.label}`);
      return next;
    });
  };

  const handleReset = () => {
    localStorage.removeItem(SAVE_KEY);
    setPlayer(null);
    setPage("dashboard");
    setLog([]);
    addLog("Character deleted. Starting over.");
  };

  const handleHeal = (cost) => {
    setPlayer((prev) => {
      if ((prev.cash || 0) < cost) return prev;
      addLog(`Paid $${cost.toLocaleString()} for medical treatment.`);
      toast.success("Health restored to 100%");
      return { ...prev, cash: prev.cash - cost, health: 100 };
    });
  };

  const handleRestoreEnergy = (cost) => {
    setPlayer((prev) => {
      if ((prev.cash || 0) < cost) return prev;
      addLog(`Paid $${cost.toLocaleString()} to restore energy.`);
      toast.success("Energy fully restored");
      return { ...prev, cash: prev.cash - cost, energy: prev.maxEnergy || 100 };
    });
  };

  const handleEventChoice = (event, choice, outcome) => {
    setPlayer((prev) => {
      let next = {...prev};
      if (outcome.heatDelta) { const nh=Math.max(0,Math.min(100,(next.heat||0)+outcome.heatDelta)); next.heat=nh; next.heatLevel=recalcHeat(nh); }
      if (choice.cost?.cash) next.cash=Math.max(0,(next.cash||0)-choice.cost.cash);
      if (outcome.resolvedCashGain) { next.cash=(next.cash||0)+outcome.resolvedCashGain; next.totalEarned=(next.totalEarned||0)+outcome.resolvedCashGain; }
      if (outcome.repGain) next.stats={...next.stats,reputation:Math.min(100,(next.stats?.reputation||0)+outcome.repGain)};
      if (outcome.repLoss) next.stats={...next.stats,reputation:Math.max(0,(next.stats?.reputation||0)-outcome.repLoss)};
      if (outcome.removeCrew && prev.crew?.length>0) { const li=prev.crew.reduce((mi,m,i,a)=>m.loyalty<a[mi].loyalty?i:mi,0); next.crew=prev.crew.filter((_,i)=>i!==li); }
      if (outcome.loyaltyBoost && prev.crew?.length>0) next.crew=prev.crew.map(m=>({...m,loyalty:Math.min(5,m.loyalty+1)}));
      if (outcome.loseDistrict && prev.ownedDistricts?.length>0) next.ownedDistricts=prev.ownedDistricts.slice(1);
      if (outcome.leaveFaction) next.factionId=null;
      return next;
    });
    addLog(`Event: ${event.title} → ${choice.label}`);
    setPlayer(prev => ({ ...prev, eventsResolved: (prev.eventsResolved||0)+1 }));
  };

  if (!player) return <CharacterCreation onCreate={handleCreate} />;

  const renderPage = () => {
    switch (page) {
      case "statistics":  return <StatisticsPage    player={player}/>;
      case "settings":    return <SettingsPage      player={player} onReset={handleReset} onHeal={handleHeal} onRestoreEnergy={handleRestoreEnergy}/>;      case "news":        return <NewsFeedPage       player={player}/>;
      case "challenges":  return <DailyChallengesPage player={player} onClaimChallenge={handleClaimChallenge}/>;
      case "darkweb":     return <DarkWebPage         player={player} onContactJob={handleContactJob}/>;
      case "dashboard":  return <Dashboard           player={player} onNavigate={setPage}/>;
      case "crimes":     return <CrimesPage          player={player} onCrimeAttempt={handleCrimeAttempt}/>;
      case "factions":   return <FactionsPage        player={player} onJoinFaction={handleJoinFaction}/>;
      case "missions":   return <FactionMissionsPage player={player} onMissionClaim={handleMissionClaim}/>;
      case "market":     return <MarketPage          player={player} onMarketTransaction={handleMarketTransaction}/>;
      case "territory":  return <TerritoryPage       player={player} onClaimDistrict={handleClaimDistrict}/>;
      case "prison":     return <PrisonPage          player={player} onPrisonAction={handlePrisonAction}/>;
      case "crew":       return <CrewPage            player={player} onCrewAction={handleCrewAction}/>;
      case "training":   return <TrainingPage        player={player} onTrainingAction={handleTrainingAction}/>;
      case "profile":    return <ProfilePage         player={player}/>;
      case "multiplayer":return <MultiplayerPage     player={player}/>;
      default:           return <Dashboard           player={player} onNavigate={setPage}/>;
    }
  };

  return (
    <div className="app-shell">
      <TopBar player={player} serverOnline={serverOnline}/>
      <Sidebar activePage={page} onNavigate={setPage} player={player}/>
      <main style={{gridArea:"main",overflow:"hidden",display:"flex",flexDirection:"column"}}>
        {renderPage()}
      </main>
      <aside className="activity-log-panel">
        <RightPanel player={player} log={log} onNavigate={setPage} />
      </aside>

      {showTutorial && (
        <TutorialOverlay onDismiss={() => setShowTutorial(false)} onNavigate={(p) => { setPage(p); setShowTutorial(false); }}/>
      )}
      {activeEncounter && (
        <EncounterModal encounter={activeEncounter} player={player} onResolve={handleEncounterResolve} onDismiss={() => setActiveEncounter(null)}/>
      )}
      {activeEvent && (
        <EventModal event={activeEvent} player={player} onChoice={handleEventChoice} onDismiss={()=>setActiveEvent(null)}/>
      )}
      {levelUpModal && (
        <LevelUpModal newLevel={levelUpModal} onDismiss={()=>setLevelUpModal(null)}/>
      )}
      <Toasts />
    </div>
  );
}