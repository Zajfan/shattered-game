import { useState, useEffect } from "react";
import { ALL_CRIMES, CRIME_TIERS, getAllCrimesByTier } from "../data/crimes";
import { calcSuccessChanceFull } from "../data/playerStats";
import { calcLevel, crimeAccessLevel } from "../data/levels";
import { secondsRemaining, formatCountdown } from "../hooks/useGameClock";

function CooldownBar({ crimeId, activeCrimeTimer }) {
  const isThis = activeCrimeTimer?.crimeId === crimeId;
  const [secs, setSecs] = useState(() => isThis ? secondsRemaining(activeCrimeTimer.startedAt, activeCrimeTimer.durationMs) : 0);
  useEffect(() => {
    if (!isThis) { setSecs(0); return; }
    const id = setInterval(() => setSecs(secondsRemaining(activeCrimeTimer.startedAt, activeCrimeTimer.durationMs)), 500);
    return () => clearInterval(id);
  }, [isThis, activeCrimeTimer]);
  if (!isThis || secs <= 0) return null;
  const pct = Math.max(0, (1 - secs / (activeCrimeTimer.durationMs / 1000)) * 100);
  return (
    <div style={{ marginTop: 4 }}>
      <div className="progress-bar" style={{ height: 3 }}>
        <div className="progress-fill red" style={{ width: `${pct}%` }} />
      </div>
      <span className="mono" style={{ fontSize: "0.62em", color: "#c0392b" }}>Cooldown: {formatCountdown(secs)}</span>
    </div>
  );
}

export default function CrimesPage({ player, onCrimeAttempt }) {
  const [selectedTier, setSelectedTier] = useState(1);
  const [activeCrime,  setActiveCrime]  = useState(null);
  const [result,       setResult]       = useState(null);
  const [inProgress,   setInProgress]   = useState(false);

  const playerLevel = calcLevel(player?.xp || 0);
  const tierCrimes  = getAllCrimesByTier(selectedTier);
  const activeCDTimer = player?.activeCrimeTimer;

  const isCoolingDown = (crime) =>
    activeCDTimer?.crimeId === crime.id && secondsRemaining(activeCDTimer.startedAt, activeCDTimer.durationMs) > 0;

  const handleAttempt = (crime) => {
    if (inProgress) return;
    if (isCoolingDown(crime)) return;
    setActiveCrime(crime);
    setResult(null);
    setInProgress(true);

    const successChance = calcSuccessChanceFull(crime, player);
    setTimeout(() => {
      const roll    = Math.random() * 100;
      const success = roll <= successChance;
      let cashGain  = 0;
      if (success) {
        const [min, max] = crime.baseReward.cash;
        cashGain = Math.floor(Math.random() * (max - min + 1)) + min;
        // Level bonus: +2% cash per level above 1
        cashGain = Math.floor(cashGain * (1 + (playerLevel - 1) * 0.02));
      }
      const outcome = {
        success, cashGain, crime,
        successChance,
        heatGain: success ? Math.floor(crime.baseRisk * 0.3) : Math.floor(crime.baseRisk * 0.7),
        message:  success ? getSuccessMessage(crime) : getFailMessage(crime),
        cooldown: crime.cooldownMs || null,
      };
      setResult(outcome);
      setInProgress(false);
      if (onCrimeAttempt) onCrimeAttempt(outcome);
    }, Math.min((crime.timeSeconds || 30) * 10, 2500));
  };

  const getSuccessMessage = (c) => ({
    shoplifting:           "Walked out clean. Sensor didn't trigger.",
    pickpocketing:         "Smooth lift. They never felt a thing.",
    phone_snatch:          "Clean grab. Gone before they screamed.",
    graffiti_extortion:    "Owner paid up. Easier than expected.",
    street_mugging:        "They handed it over fast.",
    car_theft:             "Car's gone. Relay attack worked perfectly.",
    atm_skimming:          "Cards cloned. Back to base before morning.",
    catalytic_converter:   "Three cars stripped. Scrap yard paid cash.",
    insurance_fraud:       "Adjuster bought it. Check cleared.",
    drug_dealing_small:    "Block sold out. Back pocket's heavy.",
    armed_robbery:         "Everyone hit the floor. Cashier didn't hesitate.",
    identity_theft:        "Accounts cloned. Funds transferred.",
    bank_robbery:          "Vaults open. Crew out before the silent alarm.",
    cargo_theft:           "Truck intercepted. Goods moved before APB.",
    loan_sharking:         "Collections done. Every debtor paid — or else.",
    gambling_ring:         "House took its cut. Clean night.",
    money_laundering:      "Funds integrated. Audit trail gone.",
    cyber_crime_operation: "Ransom paid. Crypto moved through mixer.",
    contract_killing:      "Target eliminated. No witnesses.",
    art_forgery:           "Auction closed. Wire confirmed. Buyer delighted.",
    drug_cartel_operation: "Shipment landed. Distribution underway.",
    crypto_exchange_hack:  "Bridge exploited. Funds flowing to clean wallets.",
    state_capture:         "Vote secured. Infrastructure now serves you.",
  }[c.id] || "Operation successful. No complications.");

  const getFailMessage = (c) => ({
    shoplifting:           "Loss prevention spotted you.",
    pickpocketing:         "Mark noticed. Started screaming.",
    phone_snatch:          "Bystander tackled you. Cops en route.",
    graffiti_extortion:    "Owner called the bluff. Called the cops too.",
    street_mugging:        "Victim fought back. Had to abort.",
    car_theft:             "Car had a tracker. Patrol car spotted you.",
    atm_skimming:          "Bank tech noticed the overlay. Flagged.",
    catalytic_converter:   "Neighbor filmed you. Plate captured.",
    insurance_fraud:       "Adjuster flagged inconsistencies. Investigation opened.",
    drug_dealing_small:    "Undercover cop. Lucky you ditched the stash.",
    armed_robbery:         "Dye pack exploded. Bolo out on you.",
    identity_theft:        "Bank flagged unusual activity.",
    bank_robbery:          "Silent alarm triggered early. SWAT outside.",
    cargo_theft:           "GPS tracker in the load. Intercepted.",
    loan_sharking:         "Debtor went to the FBI. Now you're the subject.",
    gambling_ring:         "Undercover vice cop. Raid incoming.",
    money_laundering:      "FinCEN flagged the transaction pattern.",
    cyber_crime_operation: "Honeypot. FBI had the server compromised.",
    contract_killing:      "Target had protection. You barely got out.",
    art_forgery:           "Expert authenticated it — as a forgery. Arrest warrant.",
    drug_cartel_operation: "Shipment seized. Crew arrested at the border.",
    crypto_exchange_hack:  "Exploit patched mid-operation. Traced.",
    state_capture:         "Politician flipped. Grand jury convened.",
  }[c.id] || "Something went wrong. Abort.");

  const fmt = (s) => s < 60 ? `${s}s` : s < 3600 ? `${Math.floor(s/60)}m` : s < 86400 ? `${Math.floor(s/3600)}h` : `${Math.floor(s/86400)}d`;

  // Check if a crime tier is level-gated
  const tierLevelReq = { 1:1, 2:2, 3:5, 4:8, 5:10 };

  return (
    <div className="crimes-page animate-in">
      <div className="page-header">
        <h2>Criminal Operations</h2>
        <span className="mono muted" style={{ fontSize: "0.7em" }}>
          Level {playerLevel} operative · {player?.inventory?.length || 0} items equipped · {player?.crew?.length || 0} crew active
        </span>
      </div>

      {/* Tier Tabs */}
      <div className="tier-tabs">
        {Object.entries(CRIME_TIERS).map(([tier, label]) => {
          const req     = tierLevelReq[tier] || 1;
          const locked  = playerLevel < req;
          return (
            <button
              key={tier}
              className={`tier-tab ${selectedTier === Number(tier) ? "active" : ""} tier-${tier} ${locked ? "tier-locked" : ""}`}
              onClick={() => { if (!locked) { setSelectedTier(Number(tier)); setResult(null); setActiveCrime(null); } }}
              title={locked ? `Unlocks at Level ${req}` : label}
            >
              <span className="mono">T{tier}</span>
              <span>{label}</span>
              {locked && <span className="mono" style={{ fontSize: "0.6em", color: "#c0392b" }}>Lv{req}</span>}
            </button>
          );
        })}
      </div>

      <div className="crimes-layout">
        {/* Crime List */}
        <div className="crime-list">
          {tierCrimes.map((crime) => {
            const successChance = calcSuccessChanceFull(crime, player);
            const isActive      = activeCrime?.id === crime.id;
            const meetsReqs     = Object.entries(crime.requiredStats || {}).every(([s,v]) => (player.stats?.[s]||0) >= v);
            const onCooldown    = isCoolingDown(crime);

            return (
              <div
                key={crime.id}
                className={`crime-card ${isActive ? "selected" : ""} ${(!meetsReqs || onCooldown) ? "locked" : ""}`}
                onClick={() => meetsReqs && !inProgress && !onCooldown && setActiveCrime(crime)}
              >
                <div className="crime-card-top">
                  <div>
                    <span className={`tier-badge tier-${crime.tier}`}>T{crime.tier}</span>
                    <span className="label" style={{ marginLeft: 8 }}>{crime.category}</span>
                    {crime.crewRequired && <span className="mono muted" style={{ fontSize: "0.62em", marginLeft: 8 }}>👥 {crime.crewRequired}</span>}
                  </div>
                  <span className="mono muted" style={{ fontSize: "0.68em" }}>{fmt(crime.timeSeconds)}</span>
                </div>
                <div className="crime-name">{crime.name}</div>
                <div className="crime-desc dim" style={{ fontSize: "0.81em", lineHeight: 1.5 }}>{crime.description}</div>
                <div className="crime-meta">
                  <span className="mono" style={{ fontSize: "0.7em", color: successChance >= 60 ? "#3d8c5a" : successChance >= 35 ? "#d4a827" : "#c0392b" }}>
                    {meetsReqs ? `${successChance}% success` : "⚠ Stat req not met"}
                  </span>
                  <span className="mono muted" style={{ fontSize: "0.68em" }}>
                    ${crime.baseReward.cash[0].toLocaleString()}–${crime.baseReward.cash[1].toLocaleString()}
                  </span>
                </div>
                <CooldownBar crimeId={crime.id} activeCrimeTimer={activeCDTimer} />
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div className="crime-detail-panel">
          {activeCrime ? (
            <div className="crime-detail animate-in">
              <div className="panel-header">{activeCrime.name}</div>
              <div className={`tier-badge tier-${activeCrime.tier}`} style={{ marginBottom: 10 }}>
                {CRIME_TIERS[activeCrime.tier]} — Tier {activeCrime.tier}
              </div>
              <p style={{ fontSize: "0.88em", lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: 10 }}>
                {activeCrime.description}
              </p>
              <hr className="dark" />

              {[
                { label: "Base Risk",           val: `${activeCrime.baseRisk}%`,    color: "#c0392b" },
                { label: "Your Success Chance", val: `${calcSuccessChanceFull(activeCrime, player)}%`, color: "var(--amber)" },
                { label: "Reward Range",        val: `$${activeCrime.baseReward.cash[0].toLocaleString()} – $${activeCrime.baseReward.cash[1].toLocaleString()}`, color: "#3d8c5a" },
                ...(activeCrime.crewRequired ? [{ label: "Crew Required", val: `${activeCrime.crewRequired} members`, color: "#5a7ec8" }] : []),
                ...(activeCrime.cooldownMs   ? [{ label: "Cooldown",      val: fmt(activeCrime.cooldownMs/1000),      color: "#8c7a3d" }] : []),
              ].map(({ label, val, color }) => (
                <div className="detail-row" key={label}>
                  <span className="label">{label}</span>
                  <span className="mono" style={{ color, fontSize: "0.8em" }}>{val}</span>
                </div>
              ))}

              {/* Bonus breakdown */}
              {(() => {
                const invBonuses = (player.inventory||[]).filter(i => {
                  const BONUSES = { ghost_pistol:{armed_robbery:15}, sawed_off:{bank_robbery:15}, ar_pistol:{bank_robbery:30}, hacking_rig:{cyber_crime_operation:30}, relay_attack_kit:{car_theft:40}, police_scanner:{bank_robbery:10} };
                  return BONUSES[i.id]?.[activeCrime.id];
                });
                const crewBonuses = (player.crew||[]).filter(m => m.crimeBonus?.[activeCrime.id]);
                if (!invBonuses.length && !crewBonuses.length) return null;
                return (
                  <>
                    <hr className="dark" />
                    <div className="label" style={{ marginBottom: 4 }}>Active Bonuses</div>
                    {invBonuses.map(i => <div key={i.id} className="detail-row">
                      <span className="mono muted" style={{ fontSize: "0.72em" }}>📦 {i.name}</span>
                      <span className="mono" style={{ fontSize: "0.72em", color: "#3d8c5a" }}>+bonus</span>
                    </div>)}
                    {crewBonuses.map(m => <div key={m.uid} className="detail-row">
                      <span className="mono muted" style={{ fontSize: "0.72em" }}>👥 {m.alias}</span>
                      <span className="mono" style={{ fontSize: "0.72em", color: "#d4a827" }}>+{Math.floor(m.crimeBonus[activeCrime.id]*0.5)}%</span>
                    </div>)}
                  </>
                );
              })()}

              {/* Required stats */}
              {Object.keys(activeCrime.requiredStats || {}).length > 0 && (
                <>
                  <hr className="dark" />
                  <div className="label" style={{ marginBottom: 4 }}>Required Stats</div>
                  {Object.entries(activeCrime.requiredStats).map(([stat, val]) => {
                    const has = (player.stats?.[stat]||0) >= val;
                    return (
                      <div className="detail-row" key={stat}>
                        <span className="mono muted" style={{ fontSize: "0.73em", textTransform: "capitalize" }}>{stat}</span>
                        <span className="mono" style={{ fontSize: "0.73em", color: has ? "#3d8c5a" : "#c0392b" }}>
                          {player.stats?.[stat]||0} / {val} {has ? "✓" : "✗"}
                        </span>
                      </div>
                    );
                  })}
                </>
              )}

              <div className="real-data-note" style={{ marginTop: 10 }}>
                <span className="label" style={{ fontSize: "0.6em" }}>Real Data</span>
                <p style={{ fontSize: "0.72em", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.5, marginTop: 3 }}>
                  {activeCrime.realDataNote}
                </p>
              </div>
              <hr className="dark" />

              {result && result.crime.id === activeCrime.id && (
                <div className={`result-box ${result.success ? "success" : "failure"} animate-in`}>
                  <div className="mono" style={{ fontSize: "0.68em", letterSpacing: "0.15em", marginBottom: 5 }}>
                    {result.success ? "▶ OPERATION SUCCESS" : "▶ OPERATION FAILED"}
                  </div>
                  <div style={{ fontSize: "0.88em", marginBottom: 6 }}>{result.message}</div>
                  {result.success && <div className="mono amber" style={{ fontSize: "0.82em" }}>+${result.cashGain.toLocaleString()} dirty cash</div>}
                  <div className="mono" style={{ fontSize: "0.73em", color: "#c0392b", marginTop: 3 }}>+{result.heatGain} heat</div>
                  {result.cooldown && <div className="mono muted" style={{ fontSize: "0.65em", marginTop: 2 }}>Cooldown: {fmt(result.cooldown/1000)}</div>}
                </div>
              )}

              <button
                className="btn btn-primary"
                style={{ width: "100%", marginTop: 10, padding: "12px" }}
                onClick={() => handleAttempt(activeCrime)}
                disabled={inProgress || isCoolingDown(activeCrime) || Object.entries(activeCrime.requiredStats||{}).some(([s,v])=>(player.stats?.[s]||0)<v)}
              >
                {inProgress ? "▶ IN PROGRESS..." : isCoolingDown(activeCrime) ? "⏳ ON COOLDOWN" : `▶ ATTEMPT — ${activeCrime.name}`}
              </button>
            </div>
          ) : (
            <div className="crime-detail-empty">
              <span className="mono muted" style={{ fontSize: "0.75em" }}>Select a crime to view details</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .crimes-page{padding:20px;overflow-y:auto;display:flex;flex-direction:column;gap:14px;}
        .page-header{display:flex;flex-direction:column;gap:4px;}
        .page-header h2{font-size:1.2em;letter-spacing:.15em;}
        .tier-tabs{display:flex;gap:4px;flex-wrap:wrap;}
        .tier-tab{display:flex;align-items:center;gap:5px;padding:6px 12px;background:transparent;border:1px solid var(--border);color:var(--text-muted);cursor:pointer;font-family:var(--font-display);font-size:.74em;letter-spacing:.08em;text-transform:uppercase;transition:all .15s;}
        .tier-tab:hover{border-color:var(--amber-dim);color:var(--text-secondary);}
        .tier-tab.active.tier-1{border-color:#3d8c5a;color:#3d8c5a;background:rgba(61,140,90,.08);}
        .tier-tab.active.tier-2{border-color:#d4a827;color:#d4a827;background:rgba(212,168,39,.08);}
        .tier-tab.active.tier-3{border-color:#5a7ec8;color:#5a7ec8;background:rgba(90,126,200,.08);}
        .tier-tab.active.tier-4{border-color:#a85fd4;color:#a85fd4;background:rgba(168,95,212,.08);}
        .tier-tab.active.tier-5{border-color:#e05555;color:#e05555;background:rgba(224,85,85,.08);}
        .tier-tab.tier-locked{opacity:.45;cursor:not-allowed;}
        .crimes-layout{display:grid;grid-template-columns:1fr 290px;gap:14px;}
        .crime-list{display:flex;flex-direction:column;gap:6px;}
        .crime-card{background:var(--bg-card);border:1px solid var(--border);padding:11px 13px;cursor:pointer;transition:all .15s;display:flex;flex-direction:column;gap:5px;}
        .crime-card:hover{border-color:var(--amber-dim);background:var(--bg-raised);}
        .crime-card.selected{border-color:var(--amber);background:var(--amber-glow);}
        .crime-card.locked{opacity:.5;cursor:not-allowed;}
        .crime-card-top{display:flex;justify-content:space-between;align-items:center;}
        .crime-name{font-family:var(--font-display);font-size:.93em;font-weight:600;letter-spacing:.08em;text-transform:uppercase;}
        .crime-desc{font-size:.81em;line-height:1.5;}
        .crime-meta{display:flex;justify-content:space-between;}
        .crime-detail-panel{}
        .crime-detail{background:var(--bg-card);border:1px solid var(--border);padding:15px;display:flex;flex-direction:column;gap:7px;position:sticky;top:0;}
        .crime-detail-empty{background:var(--bg-card);border:1px dashed var(--border);padding:32px;display:flex;align-items:center;justify-content:center;}
        .detail-row{display:flex;justify-content:space-between;align-items:center;padding:2px 0;}
        .real-data-note{padding:7px 9px;background:var(--bg-raised);border-left:2px solid var(--amber-dim);}
        .result-box{padding:11px;border:1px solid;}
        .result-box.success{border-color:#3d8c5a;background:rgba(61,140,90,.08);}
        .result-box.failure{border-color:#8c3d3d;background:rgba(140,61,61,.08);}
      `}</style>
    </div>
  );
}
