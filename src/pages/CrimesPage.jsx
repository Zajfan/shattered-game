import { useState } from "react";
import { crimes, CRIME_TIERS, getCrimesByTier } from "../data/crimes";
import { calcSuccessChance } from "../data/playerStats";

export default function CrimesPage({ player, onCrimeAttempt }) {
  const [selectedTier, setSelectedTier] = useState(1);
  const [activeCrime, setActiveCrime] = useState(null);
  const [result, setResult] = useState(null);
  const [inProgress, setInProgress] = useState(false);

  const tierCrimes = getCrimesByTier(selectedTier);

  const handleAttempt = (crime) => {
    if (inProgress) return;
    setActiveCrime(crime);
    setResult(null);
    setInProgress(true);

    const successChance = calcSuccessChance(crime, player.stats);
    const heatPenalty = Math.floor(player.heat / 10);
    const finalChance = Math.max(5, successChance - heatPenalty);

    setTimeout(() => {
      const roll = Math.random() * 100;
      const success = roll <= finalChance;

      let cashGain = 0;
      if (success) {
        const [min, max] = crime.baseReward.cash;
        cashGain = Math.floor(Math.random() * (max - min + 1)) + min;
      }

      const outcome = {
        success,
        cashGain,
        crime,
        successChance: finalChance,
        heatGain: success ? Math.floor(crime.baseRisk * 0.3) : Math.floor(crime.baseRisk * 0.7),
        message: success
          ? getSuccessMessage(crime)
          : getFailMessage(crime),
      };

      setResult(outcome);
      setInProgress(false);
      if (onCrimeAttempt) onCrimeAttempt(outcome);
    }, Math.min(crime.timeSeconds * 10, 2000)); // fast sim for now
  };

  const getSuccessMessage = (crime) => {
    const msgs = {
      shoplifting: "Walked out clean. Sensor didn't trigger.",
      pickpocketing: "Smooth lift. They never felt a thing.",
      street_mugging: "They handed it over fast.",
      car_theft: "Car's gone. Relay attack worked perfectly.",
      drug_dealing_small: "Block sold out. Back pocket's heavy.",
      armed_robbery: "Everyone hit the floor. Cashier didn't hesitate.",
      identity_theft: "Accounts cloned. Funds transferred to burner wallet.",
      bank_robbery: "Vaults open. Crew out before the silent alarm.",
    };
    return msgs[crime.id] || "Operation successful. No complications.";
  };

  const getFailMessage = (crime) => {
    const msgs = {
      shoplifting: "Loss prevention spotted you. Got detained.",
      pickpocketing: "Mark noticed. Started screaming. Had to run.",
      street_mugging: "Victim fought back. Had to abort.",
      car_theft: "Car had a tracker. Got made by a patrol car.",
      drug_dealing_small: "Undercover cop. Lucky you ditched the stash.",
      armed_robbery: "Dye pack exploded. Bolo out on you now.",
      identity_theft: "Bank flagged unusual activity. Trail leads back.",
      bank_robbery: "Silent alarm triggered early. SWAT outside.",
    };
    return msgs[crime.id] || "Something went wrong. Abort.";
  };

  const formatTime = (s) => {
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    return `${Math.floor(s / 86400)}d`;
  };

  return (
    <div className="crimes-page animate-in">
      <div className="page-header">
        <h2>Criminal Operations</h2>
        <span className="mono muted" style={{ fontSize: "0.7em" }}>
          Select a tier. Attempt a crime. Manage your heat.
        </span>
      </div>

      {/* Tier Tabs */}
      <div className="tier-tabs">
        {Object.entries(CRIME_TIERS).map(([tier, label]) => (
          <button
            key={tier}
            className={`tier-tab ${selectedTier === Number(tier) ? "active" : ""} tier-${tier}`}
            onClick={() => { setSelectedTier(Number(tier)); setResult(null); setActiveCrime(null); }}
          >
            <span className="mono">T{tier}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="crimes-layout">
        {/* Crime List */}
        <div className="crime-list">
          {tierCrimes.map((crime) => {
            const successChance = Math.max(5, calcSuccessChance(crime, player.stats) - Math.floor(player.heat / 10));
            const isActive = activeCrime?.id === crime.id;
            const meetsReqs = Object.entries(crime.requiredStats || {}).every(
              ([stat, val]) => (player.stats[stat] || 0) >= val
            );

            return (
              <div
                key={crime.id}
                className={`crime-card ${isActive ? "selected" : ""} ${!meetsReqs ? "locked" : ""}`}
                onClick={() => meetsReqs && !inProgress && setActiveCrime(crime)}
              >
                <div className="crime-card-top">
                  <div>
                    <span className={`tier-badge tier-${crime.tier}`}>Tier {crime.tier}</span>
                    <span className="label" style={{ marginLeft: 8 }}>{crime.category}</span>
                  </div>
                  <span className="mono" style={{ fontSize: "0.7em", color: "#5a5248" }}>{formatTime(crime.timeSeconds)}</span>
                </div>
                <div className="crime-name">{crime.name}</div>
                <div className="crime-desc dim" style={{ fontSize: "0.82em", lineHeight: 1.5 }}>{crime.description}</div>
                <div className="crime-meta">
                  <span className="mono" style={{ fontSize: "0.7em", color: successChance >= 60 ? "#3d8c5a" : successChance >= 35 ? "#d4a827" : "#c0392b" }}>
                    {meetsReqs ? `${successChance}% success` : "⚠ Stat requirements not met"}
                  </span>
                  <span className="mono muted" style={{ fontSize: "0.7em" }}>
                    ${crime.baseReward.cash[0].toLocaleString()}–${crime.baseReward.cash[1].toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail / Action Panel */}
        <div className="crime-detail-panel">
          {activeCrime ? (
            <div className="crime-detail animate-in">
              <div className="panel-header">{activeCrime.name}</div>

              <div className={`tier-badge tier-${activeCrime.tier}`} style={{ marginBottom: 12 }}>
                {CRIME_TIERS[activeCrime.tier]} — Tier {activeCrime.tier}
              </div>

              <p style={{ fontSize: "0.9em", lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: 16 }}>
                {activeCrime.description}
              </p>

              <hr className="dark" />

              <div className="detail-row">
                <span className="label">Base Risk</span>
                <span className="mono" style={{ color: "#c0392b" }}>{activeCrime.baseRisk}%</span>
              </div>
              <div className="detail-row">
                <span className="label">Your Success Chance</span>
                <span className="mono amber">
                  {Math.max(5, calcSuccessChance(activeCrime, player.stats) - Math.floor(player.heat / 10))}%
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Potential Reward</span>
                <span className="mono" style={{ color: "#3d8c5a" }}>
                  ${activeCrime.baseReward.cash[0].toLocaleString()} – ${activeCrime.baseReward.cash[1].toLocaleString()}
                </span>
              </div>
              {activeCrime.crewRequired && (
                <div className="detail-row">
                  <span className="label">Crew Required</span>
                  <span className="mono" style={{ color: "#5a7ec8" }}>{activeCrime.crewRequired} members</span>
                </div>
              )}

              <hr className="dark" />

              {activeCrime.requiredStats && Object.keys(activeCrime.requiredStats).length > 0 && (
                <>
                  <div className="label" style={{ marginBottom: 8 }}>Required Stats</div>
                  {Object.entries(activeCrime.requiredStats).map(([stat, val]) => {
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
                  <hr className="dark" />
                </>
              )}

              <div className="real-data-note">
                <span className="label" style={{ fontSize: "0.6em" }}>Real Data</span>
                <p style={{ fontSize: "0.75em", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.5, marginTop: 4 }}>
                  {activeCrime.realDataNote}
                </p>
              </div>

              <hr className="dark" />

              {result && result.crime.id === activeCrime.id && (
                <div className={`result-box ${result.success ? "success" : "failure"} animate-in`}>
                  <div className="mono" style={{ fontSize: "0.7em", letterSpacing: "0.15em", marginBottom: 6 }}>
                    {result.success ? "▶ OPERATION SUCCESS" : "▶ OPERATION FAILED"}
                  </div>
                  <div style={{ fontSize: "0.9em", marginBottom: 8 }}>{result.message}</div>
                  {result.success && (
                    <div className="mono amber" style={{ fontSize: "0.85em" }}>
                      +${result.cashGain.toLocaleString()} dirty cash
                    </div>
                  )}
                  <div className="mono" style={{ fontSize: "0.75em", color: "#c0392b", marginTop: 4 }}>
                    +{result.heatGain} heat
                  </div>
                </div>
              )}

              <button
                className="btn btn-primary"
                style={{ width: "100%", marginTop: 12, padding: "12px" }}
                onClick={() => handleAttempt(activeCrime)}
                disabled={inProgress || Object.entries(activeCrime.requiredStats || {}).some(
                  ([stat, val]) => (player.stats[stat] || 0) < val
                )}
              >
                {inProgress ? "▶ IN PROGRESS..." : `▶ ATTEMPT — ${activeCrime.name}`}
              </button>
            </div>
          ) : (
            <div className="crime-detail-empty">
              <span className="mono muted" style={{ fontSize: "0.75em" }}>
                Select a crime to view details
              </span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .crimes-page { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
        .page-header { display: flex; flex-direction: column; gap: 4px; }
        .page-header h2 { font-size: 1.2em; letter-spacing: 0.15em; }
        .tier-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
        .tier-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 12px; background: transparent;
          border: 1px solid var(--border); color: var(--text-muted);
          cursor: pointer; font-family: var(--font-display);
          font-size: 0.75em; letter-spacing: 0.08em; text-transform: uppercase;
          transition: all 0.15s ease;
        }
        .tier-tab:hover { border-color: var(--amber-dim); color: var(--text-secondary); }
        .tier-tab.active.tier-1 { border-color: #3d8c5a; color: #3d8c5a; background: rgba(61,140,90,0.08); }
        .tier-tab.active.tier-2 { border-color: #d4a827; color: #d4a827; background: rgba(212,168,39,0.08); }
        .tier-tab.active.tier-3 { border-color: #5a7ec8; color: #5a7ec8; background: rgba(90,126,200,0.08); }
        .tier-tab.active.tier-4 { border-color: #a85fd4; color: #a85fd4; background: rgba(168,95,212,0.08); }
        .tier-tab.active.tier-5 { border-color: #e05555; color: #e05555; background: rgba(224,85,85,0.08); }
        .crimes-layout { display: grid; grid-template-columns: 1fr 280px; gap: 16px; }
        .crime-list { display: flex; flex-direction: column; gap: 8px; }
        .crime-card {
          background: var(--bg-card); border: 1px solid var(--border);
          padding: 12px 14px; cursor: pointer; transition: all 0.15s ease;
          display: flex; flex-direction: column; gap: 6px;
        }
        .crime-card:hover { border-color: var(--amber-dim); background: var(--bg-raised); }
        .crime-card.selected { border-color: var(--amber); background: var(--amber-glow); }
        .crime-card.locked { opacity: 0.5; cursor: not-allowed; }
        .crime-card-top { display: flex; justify-content: space-between; align-items: center; }
        .crime-name { font-family: var(--font-display); font-size: 0.95em; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
        .crime-meta { display: flex; justify-content: space-between; }
        .crime-detail-panel { }
        .crime-detail {
          background: var(--bg-card); border: 1px solid var(--border);
          padding: 16px; display: flex; flex-direction: column; gap: 8px;
          position: sticky; top: 0;
        }
        .crime-detail-empty {
          background: var(--bg-card); border: 1px dashed var(--border);
          padding: 32px; display: flex; align-items: center; justify-content: center;
        }
        .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 3px 0; }
        .real-data-note { padding: 8px; background: var(--bg-raised); border-left: 2px solid var(--amber-dim); }
        .result-box { padding: 12px; border: 1px solid; }
        .result-box.success { border-color: #3d8c5a; background: rgba(61,140,90,0.08); }
        .result-box.failure { border-color: #8c3d3d; background: rgba(140,61,61,0.08); }
      `}</style>
    </div>
  );
}
