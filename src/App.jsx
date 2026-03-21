import { useState, useEffect } from "react";
import "./index.css";

import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import CrimesPage from "./pages/CrimesPage";
import FactionsPage from "./pages/FactionsPage";
import CharacterCreation from "./pages/CharacterCreation";
import { MarketPage, TerritoryPage, PrisonPage, ProfilePage } from "./pages/Placeholders";

const SAVE_KEY = "shattered_player_v1";

export default function App() {
  const [player, setPlayer] = useState(null);
  const [page, setPage] = useState("dashboard");

  // Load saved player
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) setPlayer(JSON.parse(saved));
    } catch {}
  }, []);

  // Auto-save player
  useEffect(() => {
    if (player) {
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(player)); } catch {}
    }
  }, [player]);

  const handleCreate = (newPlayer) => {
    setPlayer(newPlayer);
    setPage("dashboard");
  };

  const handleCrimeAttempt = (outcome) => {
    setPlayer((prev) => {
      const heatDelta = outcome.heatGain;
      const newHeat = Math.min(100, (prev.heat || 0) + heatDelta);
      const heatLevel = newHeat >= 90 ? 5 : newHeat >= 70 ? 4 : newHeat >= 50 ? 3 : newHeat >= 30 ? 2 : newHeat >= 15 ? 1 : 0;

      return {
        ...prev,
        cash: outcome.success ? prev.cash + (outcome.cashGain || 0) : prev.cash,
        dirtyCash: outcome.success ? prev.dirtyCash + (outcome.cashGain || 0) : prev.dirtyCash,
        heat: newHeat,
        heatLevel,
        crimesAttempted: prev.crimesAttempted + 1,
        crimesSucceeded: outcome.success ? prev.crimesSucceeded + 1 : prev.crimesSucceeded,
        timesArrested: (!outcome.success && Math.random() < 0.3) ? prev.timesArrested + 1 : prev.timesArrested,
        totalEarned: outcome.success ? prev.totalEarned + (outcome.cashGain || 0) : prev.totalEarned,
      };
    });
  };

  const handleJoinFaction = (factionId) => {
    setPlayer((prev) => ({ ...prev, factionId }));
  };

  // Character creation
  if (!player) {
    return <CharacterCreation onCreate={handleCreate} />;
  }

  const renderPage = () => {
    switch (page) {
      case "dashboard":  return <Dashboard player={player} onNavigate={setPage} />;
      case "crimes":     return <CrimesPage player={player} onCrimeAttempt={handleCrimeAttempt} />;
      case "factions":   return <FactionsPage player={player} onJoinFaction={handleJoinFaction} />;
      case "market":     return <MarketPage />;
      case "territory":  return <TerritoryPage />;
      case "prison":     return <PrisonPage player={player} />;
      case "profile":    return <ProfilePage player={player} />;
      default:           return <Dashboard player={player} onNavigate={setPage} />;
    }
  };

  return (
    <div className="app-shell">
      <TopBar player={player} />
      <Sidebar activePage={page} onNavigate={setPage} />
      <main style={{ gridArea: "main", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {renderPage()}
      </main>
      <aside style={{ gridArea: "rightpanel", background: "var(--bg-surface)", borderLeft: "1px solid var(--border)", padding: 16, overflowY: "auto" }}>
        <div className="panel-header">Activity Log</div>
        <div className="mono muted" style={{ fontSize: "0.7em", lineHeight: 2 }}>
          <div>▸ Session started</div>
          <div>▸ Welcome back, {player.name}</div>
          <div>▸ Heat: {player.heat}% — {["Ghost","Person of Interest","Suspect","Wanted","Federal","Interpol"][player.heatLevel ?? 0]}</div>
          {player.factionId && <div>▸ Faction: {player.factionId}</div>}
        </div>
      </aside>
    </div>
  );
}
