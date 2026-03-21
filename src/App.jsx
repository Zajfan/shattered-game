import { useState, useEffect } from "react";
import "./index.css";

import TopBar          from "./components/TopBar";
import Sidebar         from "./components/Sidebar";
import Dashboard       from "./pages/Dashboard";
import CrimesPage      from "./pages/CrimesPage";
import FactionsPage    from "./pages/FactionsPage";
import MarketPage      from "./pages/MarketPage";
import TerritoryPage   from "./pages/TerritoryPage";
import PrisonPage      from "./pages/PrisonPage";
import CrewPage        from "./pages/CrewPage";
import CharacterCreation from "./pages/CharacterCreation";
import { ProfilePage } from "./pages/Placeholders";

const SAVE_KEY = "shattered_player_v2";

const recalcHeatLevel = (heat) =>
  heat >= 90 ? 5 : heat >= 70 ? 4 : heat >= 50 ? 3 : heat >= 30 ? 2 : heat >= 15 ? 1 : 0;

export default function App() {
  const [player, setPlayer] = useState(null);
  const [page,   setPage]   = useState("dashboard");
  const [log,    setLog]    = useState([]);

  const addLog = (msg) => setLog((prev) => [`▸ ${msg}`, ...prev].slice(0, 50));

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) { setPlayer(JSON.parse(saved)); addLog("Session restored."); }
    } catch {}
  }, []);

  useEffect(() => {
    if (player) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(player)); } catch {} }
  }, [player]);

  const handleCreate = (newPlayer) => {
    const p = { ...newPlayer, inventory: [], crew: [], ownedDistricts: [], prisonDays: 0, prisonSentence: 0 };
    setPlayer(p);
    setPage("dashboard");
    addLog(`New operative: ${p.name}`);
  };

  const handleCrimeAttempt = (outcome) => {
    setPlayer((prev) => {
      const newHeat = Math.min(100, (prev.heat || 0) + outcome.heatGain);
      const heatLevel = recalcHeatLevel(newHeat);
      const arrested = !outcome.success && Math.random() < 0.3 && newHeat >= 50;
      addLog(outcome.success
        ? `${outcome.crime.name} — +$${outcome.cashGain.toLocaleString()} dirty`
        : `${outcome.crime.name} — FAILED${arrested ? " — ARRESTED" : ""}`);
      return {
        ...prev,
        cash:            outcome.success ? prev.cash + (outcome.cashGain || 0) : prev.cash,
        dirtyCash:       outcome.success ? prev.dirtyCash + (outcome.cashGain || 0) : prev.dirtyCash,
        heat:            newHeat,
        heatLevel,
        crimesAttempted: prev.crimesAttempted + 1,
        crimesSucceeded: outcome.success ? prev.crimesSucceeded + 1 : prev.crimesSucceeded,
        timesArrested:   arrested ? prev.timesArrested + 1 : prev.timesArrested,
        totalEarned:     outcome.success ? prev.totalEarned + (outcome.cashGain || 0) : prev.totalEarned,
        stats: {
          ...prev.stats,
          reputation: outcome.success
            ? Math.min(100, (prev.stats.reputation || 0) + Math.floor(outcome.crime.tier * 0.5))
            : prev.stats.reputation,
        },
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
        for (const [stat, val] of Object.entries(tx.item.statBonus || {})) newStats[stat] = (newStats[stat] || 0) + val;
        const newHeat = Math.max(0, Math.min(100, (prev.heat || 0) + (tx.item.heatOnPossession || 0) - (tx.item.heatReduction || 0)));
        addLog(`Bought: ${tx.item.name} — $${tx.item.buyPrice.toLocaleString()}`);
        return { ...prev, cash: prev.cash + tx.cashDelta, heat: newHeat, heatLevel: recalcHeatLevel(newHeat), stats: newStats, inventory: [...(prev.inventory || []), { id: tx.item.id, name: tx.item.name }] };
      }
      if (tx.type === "sell") {
        const newStats = { ...prev.stats };
        for (const [stat, val] of Object.entries(tx.item.statBonus || {})) newStats[stat] = Math.max(0, (newStats[stat] || 0) - val);
        addLog(`Fenced: ${tx.item.name} — $${tx.item.sellPrice.toLocaleString()}`);
        return { ...prev, cash: prev.cash + tx.cashDelta, stats: newStats, inventory: (prev.inventory || []).filter((i) => i.id !== tx.inventoryRemove) };
      }
      if (tx.type === "launder") {
        addLog(`Laundered $${tx.dirtyLost.toLocaleString()} → $${tx.cleanGain.toLocaleString()} clean`);
        return { ...prev, cash: prev.cash + tx.cleanGain, dirtyCash: Math.max(0, prev.dirtyCash - tx.dirtyLost) };
      }
      return prev;
    });
  };

  const handleClaimDistrict = ({ districtId, cost }) => {
    setPlayer((prev) => {
      addLog(`Claimed district: ${districtId} — $${cost.toLocaleString()}`);
      return { ...prev, cash: prev.cash - cost, ownedDistricts: [...(prev.ownedDistricts || []), districtId] };
    });
  };

  const handlePrisonAction = (action) => {
    setPlayer((prev) => {
      if (action.type === "activity_success") {
        addLog(`Prison training: +${action.gain} ${action.stat}`);
        const newStats = { ...prev.stats };
        newStats[action.stat] = (newStats[action.stat] || 0) + action.gain;
        return { ...prev, energy: Math.max(0, (prev.energy || 100) - action.energyCost), prisonDays: (prev.prisonDays || 0) + (action.addDay ? 1 : 0), stats: newStats };
      }
      if (action.type === "activity_fail") {
        addLog(`Prison bust — +${action.extraDays} extra days`);
        return { ...prev, energy: Math.max(0, (prev.energy || 100) - action.energyCost), prisonSentence: (prev.prisonSentence || 0) + action.extraDays };
      }
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
      if (action.type === "missed_payroll") {
        addLog("Missed payroll — crew loyalty dropping.");
        return { ...prev, crew: (prev.crew || []).map((m) => ({ ...m, loyalty: Math.max(1, m.loyalty - 1) })) };
      }
      return prev;
    });
  };

  const handleCrewAction = (action) => {
    setPlayer((prev) => {
      if (action.type === "hire") {
        const newStats = { ...prev.stats };
        for (const [stat, val] of Object.entries(action.member.statContributions || {})) newStats[stat] = (newStats[stat] || 0) + val;
        addLog(`Hired: ${action.member.name} (${action.member.role})`);
        return { ...prev, cash: prev.cash - action.cost, crew: [...(prev.crew || []), action.member], stats: newStats };
      }
      if (action.type === "fire") {
        const member = (prev.crew || []).find((m) => m.uid === action.memberId);
        const newStats = { ...prev.stats };
        if (member) for (const [stat, val] of Object.entries(member.statContributions || {})) newStats[stat] = Math.max(0, (newStats[stat] || 0) - val);
        addLog(`Dismissed crew member.`);
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
      case "dashboard":  return <Dashboard     player={player} onNavigate={setPage} />;
      case "crimes":     return <CrimesPage    player={player} onCrimeAttempt={handleCrimeAttempt} />;
      case "factions":   return <FactionsPage  player={player} onJoinFaction={handleJoinFaction} />;
      case "market":     return <MarketPage    player={player} onMarketTransaction={handleMarketTransaction} />;
      case "territory":  return <TerritoryPage player={player} onClaimDistrict={handleClaimDistrict} />;
      case "prison":     return <PrisonPage    player={player} onPrisonAction={handlePrisonAction} />;
      case "crew":       return <CrewPage      player={player} onCrewAction={handleCrewAction} />;
      case "profile":    return <ProfilePage   player={player} />;
      default:           return <Dashboard     player={player} onNavigate={setPage} />;
    }
  };

  return (
    <div className="app-shell">
      <TopBar player={player} />
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
            <div className="panel-header" style={{ marginTop: 16 }}>Crew Loyalty</div>
            <div className="mono" style={{ fontSize: "0.7em", lineHeight: 2 }}>
              {player.crew.map((m) => (
                <div key={m.uid} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>{m.alias}</span>
                  <span style={{ color: m.loyalty <= 2 ? "#c0392b" : "var(--amber-dim)" }}>
                    {"▮".repeat(m.loyalty)}{"▯".repeat(5 - m.loyalty)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
        {player.ownedDistricts?.length > 0 && (
          <>
            <div className="panel-header" style={{ marginTop: 16 }}>Territory</div>
            <div className="mono muted" style={{ fontSize: "0.7em" }}>▸ {player.ownedDistricts.length} district(s) controlled</div>
          </>
        )}
        {player.heat >= 70 && (
          <>
            <div className="panel-header" style={{ marginTop: 16, color: "#c0392b" }}>⚠ Heat Warning</div>
            <div className="mono" style={{ fontSize: "0.7em", color: "#c0392b", lineHeight: 1.8 }}>
              {player.heat >= 95 ? <div>▸ Federal manhunt active</div>
               : player.heat >= 80 ? <div>▸ Arrest risk: HIGH</div>
               : <div>▸ Under surveillance</div>}
              <div>▸ Lay low or launder</div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
