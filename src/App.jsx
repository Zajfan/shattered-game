import { useState, useEffect, useCallback } from "react";
import "./index.css";

import TopBar            from "./components/TopBar";
import Sidebar           from "./components/Sidebar";
import EventModal        from "./components/EventModal";
import Dashboard         from "./pages/Dashboard";
import CrimesPage        from "./pages/CrimesPage";
import FactionsPage      from "./pages/FactionsPage";
import MarketPage        from "./pages/MarketPage";
import TerritoryPage     from "./pages/TerritoryPage";
import PrisonPage        from "./pages/PrisonPage";
import CrewPage          from "./pages/CrewPage";
import ProfilePage       from "./pages/ProfilePage";
import MultiplayerPage   from "./pages/MultiplayerPage";
import CharacterCreation from "./pages/CharacterCreation";

import { selectTriggeredEvent } from "./data/events";

const SAVE_KEY    = "shattered_player_v3";
const SERVER_URL  = "http://localhost:3001";
const EVENT_INTERVAL_MS = 45000; // check for events every 45s

const recalcHeatLevel = (heat) =>
  heat >= 90 ? 5 : heat >= 70 ? 4 : heat >= 50 ? 3 : heat >= 30 ? 2 : heat >= 15 ? 1 : 0;

export default function App() {
  const [player,       setPlayer]       = useState(null);
  const [page,         setPage]         = useState("dashboard");
  const [log,          setLog]          = useState([]);
  const [activeEvent,  setActiveEvent]  = useState(null);
  const [serverOnline, setServerOnline] = useState(false);

  const addLog = (msg) => setLog((prev) => [`▸ ${msg}`, ...prev].slice(0, 50));

  // ── Load / save ──────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) { setPlayer(JSON.parse(saved)); addLog("Session restored."); }
    } catch {}
  }, []);

  useEffect(() => {
    if (player) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(player)); } catch {} }
  }, [player]);

  // ── Server sync ──────────────────────────────────────────────────────────
  const syncToServer = useCallback((p) => {
    if (!p?.id) return;
    fetch(`${SERVER_URL}/api/players/sync`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(p),
    })
      .then(() => setServerOnline(true))
      .catch(() => setServerOnline(false));
  }, []);

  useEffect(() => {
    if (player) {
      const id = setTimeout(() => syncToServer(player), 2000); // debounced sync
      return () => clearTimeout(id);
    }
  }, [player, syncToServer]);

  // ── Event engine ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!player || activeEvent) return;
    const id = setInterval(() => {
      if (activeEvent) return;
      const event = selectTriggeredEvent(player);
      if (event) {
        addLog(`⚠ EVENT: ${event.title}`);
        setActiveEvent(event);
      }
    }, EVENT_INTERVAL_MS);
    return () => clearInterval(id);
  }, [player, activeEvent]);

  // ── Event resolution ─────────────────────────────────────────────────────
  const handleEventChoice = (event, choice, outcome) => {
    setPlayer((prev) => {
      let next = { ...prev };

      // Apply heat delta
      if (outcome.heatDelta) {
        const newHeat = Math.max(0, Math.min(100, (next.heat || 0) + outcome.heatDelta));
        next.heat      = newHeat;
        next.heatLevel = recalcHeatLevel(newHeat);
      }

      // Cash effects
      if (choice.cost?.cash) next.cash = Math.max(0, (next.cash || 0) - choice.cost.cash);
      if (outcome.resolvedCashGain) {
        next.cash      = (next.cash || 0) + outcome.resolvedCashGain;
        next.totalEarned = (next.totalEarned || 0) + outcome.resolvedCashGain;
      }

      // Reputation
      if (outcome.repGain) next.stats = { ...next.stats, reputation: Math.min(100, (next.stats?.reputation || 0) + outcome.repGain) };
      if (outcome.repLoss) next.stats = { ...next.stats, reputation: Math.max(0, (next.stats?.reputation || 0) - outcome.repLoss) };

      // Crew effects
      if (outcome.removeCrew && prev.crew?.length > 0) {
        const lowestIdx = prev.crew.reduce((mi, m, i, arr) => m.loyalty < arr[mi].loyalty ? i : mi, 0);
        next.crew = prev.crew.filter((_, i) => i !== lowestIdx);
      }
      if (outcome.loyaltyBoost && prev.crew?.length > 0) {
        next.crew = prev.crew.map((m) => ({ ...m, loyalty: Math.min(5, m.loyalty + 1) }));
      }

      // Territory
      if (outcome.loseDistrict && prev.ownedDistricts?.length > 0) {
        next.ownedDistricts = prev.ownedDistricts.slice(1);
      }

      // Faction
      if (outcome.leaveFaction) next.factionId = null;

      return next;
    });
    addLog(`Event resolved: ${event.title} → ${choice.label}`);
  };

  const handleEventDismiss = () => setActiveEvent(null);

  // ── Character creation ────────────────────────────────────────────────────
  const handleCreate = (newPlayer) => {
    const p = { ...newPlayer, inventory: [], crew: [], ownedDistricts: [], prisonDays: 0, prisonSentence: 0, totalLaundered: 0, tier5Attempts: 0 };
    setPlayer(p);
    setPage("dashboard");
    addLog(`New operative: ${p.name}`);
    setTimeout(() => syncToServer(p), 500);
  };

  // ── Game handlers ─────────────────────────────────────────────────────────
  const handleCrimeAttempt = (outcome) => {
    setPlayer((prev) => {
      const newHeat = Math.min(100, (prev.heat || 0) + outcome.heatGain);
      const heatLevel = recalcHeatLevel(newHeat);
      addLog(outcome.success
        ? `${outcome.crime.name} — +$${outcome.cashGain.toLocaleString()} dirty`
        : `${outcome.crime.name} — FAILED`);
      return {
        ...prev,
        cash:            outcome.success ? prev.cash + (outcome.cashGain || 0) : prev.cash,
        dirtyCash:       outcome.success ? prev.dirtyCash + (outcome.cashGain || 0) : prev.dirtyCash,
        heat:            newHeat, heatLevel,
        crimesAttempted: prev.crimesAttempted + 1,
        crimesSucceeded: outcome.success ? prev.crimesSucceeded + 1 : prev.crimesSucceeded,
        timesArrested:   (!outcome.success && Math.random() < 0.3 && newHeat >= 50) ? prev.timesArrested + 1 : prev.timesArrested,
        totalEarned:     outcome.success ? prev.totalEarned + (outcome.cashGain || 0) : prev.totalEarned,
        tier5Attempts:   outcome.crime.tier === 5 ? (prev.tier5Attempts || 0) + 1 : (prev.tier5Attempts || 0),
        stats: { ...prev.stats, reputation: outcome.success ? Math.min(100, (prev.stats.reputation || 0) + Math.floor(outcome.crime.tier * 0.5)) : prev.stats.reputation },
      };
    });
  };

  const handleJoinFaction = (factionId) => {
    setPlayer((prev) => ({ ...prev, factionId }));
    addLog(factionId ? `Joined faction: ${factionId}` : "Left faction.");
  };

  const handleMarketTransaction = (tx) => {
    setPlayer((prev) => {
      if (tx.type === "buy") {
        const newStats = { ...prev.stats };
        for (const [s, v] of Object.entries(tx.item.statBonus || {})) newStats[s] = (newStats[s] || 0) + v;
        const newHeat = Math.max(0, Math.min(100, (prev.heat || 0) + (tx.item.heatOnPossession || 0) - (tx.item.heatReduction || 0)));
        addLog(`Bought: ${tx.item.name}`);
        return { ...prev, cash: prev.cash + tx.cashDelta, heat: newHeat, heatLevel: recalcHeatLevel(newHeat), stats: newStats, inventory: [...(prev.inventory || []), { id: tx.item.id, name: tx.item.name }] };
      }
      if (tx.type === "sell") {
        const newStats = { ...prev.stats };
        for (const [s, v] of Object.entries(tx.item.statBonus || {})) newStats[s] = Math.max(0, (newStats[s] || 0) - v);
        addLog(`Fenced: ${tx.item.name}`);
        return { ...prev, cash: prev.cash + tx.cashDelta, stats: newStats, inventory: (prev.inventory || []).filter((i) => i.id !== tx.inventoryRemove) };
      }
      if (tx.type === "launder") {
        addLog(`Laundered $${tx.dirtyLost.toLocaleString()} → $${tx.cleanGain.toLocaleString()}`);
        return { ...prev, cash: prev.cash + tx.cleanGain, dirtyCash: Math.max(0, prev.dirtyCash - tx.dirtyLost), totalLaundered: (prev.totalLaundered || 0) + tx.dirtyLost };
      }
      return prev;
    });
  };

  const handleClaimDistrict = ({ districtId, cost }) => {
    setPlayer((prev) => ({ ...prev, cash: prev.cash - cost, ownedDistricts: [...(prev.ownedDistricts || []), districtId] }));
    addLog(`Claimed district: ${districtId}`);
  };

  const handlePrisonAction = (action) => {
    setPlayer((prev) => {
      if (action.type === "activity_success") {
        const newStats = { ...prev.stats };
        newStats[action.stat] = (newStats[action.stat] || 0) + action.gain;
        addLog(`Prison training: +${action.gain} ${action.stat}`);
        return { ...prev, energy: Math.max(0, (prev.energy || 100) - action.energyCost), prisonDays: (prev.prisonDays || 0) + (action.addDay ? 1 : 0), stats: newStats };
      }
      if (action.type === "activity_fail") return { ...prev, energy: Math.max(0, (prev.energy || 100) - action.energyCost), prisonSentence: (prev.prisonSentence || 0) + action.extraDays };
      if (action.type === "serve_time") {
        const newHeat = Math.max(0, (prev.heat || 0) - action.heatReduction);
        addLog(`Served ${action.days} day(s). Heat -${action.heatReduction}%`);
        return { ...prev, heat: newHeat, heatLevel: recalcHeatLevel(newHeat), prisonDays: (prev.prisonDays || 0) + action.days };
      }
      if (action.type === "release") {
        const newHeat = Math.max(0, (prev.heat || 0) - 60);
        addLog("Released from custody.");
        return { ...prev, prisonDays: 0, prisonSentence: 0, heat: newHeat, heatLevel: recalcHeatLevel(newHeat), energy: 100 };
      }
      if (action.type === "missed_payroll") return { ...prev, crew: (prev.crew || []).map((m) => ({ ...m, loyalty: Math.max(1, m.loyalty - 1) })) };
      return prev;
    });
  };

  const handleCrewAction = (action) => {
    setPlayer((prev) => {
      if (action.type === "hire") {
        const newStats = { ...prev.stats };
        for (const [s, v] of Object.entries(action.member.statContributions || {})) newStats[s] = (newStats[s] || 0) + v;
        addLog(`Hired: ${action.member.name} (${action.member.role})`);
        return { ...prev, cash: prev.cash - action.cost, crew: [...(prev.crew || []), action.member], stats: newStats };
      }
      if (action.type === "fire") {
        const member = (prev.crew || []).find((m) => m.uid === action.memberId);
        const newStats = { ...prev.stats };
        if (member) for (const [s, v] of Object.entries(member.statContributions || {})) newStats[s] = Math.max(0, (newStats[s] || 0) - v);
        addLog("Dismissed crew member.");
        return { ...prev, crew: (prev.crew || []).filter((m) => m.uid !== action.memberId), stats: newStats };
      }
      if (action.type === "pay_crew") {
        addLog(`Payroll paid: $${action.total.toLocaleString()}`);
        return { ...prev, cash: prev.cash - action.total, crew: (prev.crew || []).map((m) => ({ ...m, loyalty: Math.min(5, m.loyalty + 1) })) };
      }
      return prev;
    });
  };

  if (!player) return <CharacterCreation onCreate={handleCreate} />;

  const renderPage = () => {
    switch (page) {
      case "dashboard":    return <Dashboard       player={player} onNavigate={setPage} />;
      case "crimes":       return <CrimesPage      player={player} onCrimeAttempt={handleCrimeAttempt} />;
      case "factions":     return <FactionsPage    player={player} onJoinFaction={handleJoinFaction} />;
      case "market":       return <MarketPage      player={player} onMarketTransaction={handleMarketTransaction} />;
      case "territory":    return <TerritoryPage   player={player} onClaimDistrict={handleClaimDistrict} />;
      case "prison":       return <PrisonPage      player={player} onPrisonAction={handlePrisonAction} />;
      case "crew":         return <CrewPage        player={player} onCrewAction={handleCrewAction} />;
      case "profile":      return <ProfilePage     player={player} />;
      case "multiplayer":  return <MultiplayerPage player={player} />;
      default:             return <Dashboard       player={player} onNavigate={setPage} />;
    }
  };

  return (
    <div className="app-shell">
      <TopBar player={player} serverOnline={serverOnline} />
      <Sidebar activePage={page} onNavigate={setPage} />
      <main style={{ gridArea: "main", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {renderPage()}
      </main>
      <aside className="activity-log-panel">
        <div className="panel-header">Activity Log</div>
        <div className="mono muted" style={{ fontSize: "0.7em", lineHeight: 2.2 }}>
          {log.length === 0 && <div style={{ opacity: 0.5 }}>▸ Awaiting activity...</div>}
          {log.map((entry, i) => (
            <div key={i} style={{ opacity: i === 0 ? 1 : Math.max(0.3, 1 - i * 0.06) }}>{entry}</div>
          ))}
        </div>
        {player.crew?.length > 0 && (
          <>
            <div className="panel-header" style={{ marginTop: 16 }}>Crew</div>
            <div className="mono" style={{ fontSize: "0.7em", lineHeight: 2 }}>
              {player.crew.map((m) => (
                <div key={m.uid} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>{m.alias}</span>
                  <span style={{ color: m.loyalty <= 2 ? "#c0392b" : "var(--amber-dim)" }}>{"▮".repeat(m.loyalty)}{"▯".repeat(5 - m.loyalty)}</span>
                </div>
              ))}
            </div>
          </>
        )}
        {player.ownedDistricts?.length > 0 && (
          <>
            <div className="panel-header" style={{ marginTop: 16 }}>Territory</div>
            <div className="mono muted" style={{ fontSize: "0.7em" }}>▸ {player.ownedDistricts.length} district(s) held</div>
          </>
        )}
        {player.heat >= 70 && (
          <>
            <div className="panel-header" style={{ marginTop: 16, color: "#c0392b" }}>⚠ Heat Warning</div>
            <div className="mono" style={{ fontSize: "0.7em", color: "#c0392b", lineHeight: 1.8 }}>
              {player.heat >= 95 ? <div>▸ Federal manhunt active</div> : player.heat >= 80 ? <div>▸ Arrest risk: HIGH</div> : <div>▸ Under surveillance</div>}
              <div>▸ Lay low or launder</div>
            </div>
          </>
        )}
      </aside>

      {/* AI Event Modal */}
      {activeEvent && (
        <EventModal
          event={activeEvent}
          player={player}
          onChoice={handleEventChoice}
          onDismiss={handleEventDismiss}
        />
      )}
    </div>
  );
}
