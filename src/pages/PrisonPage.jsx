import { useState } from "react";
import { STAT_DEFINITIONS } from "../data/playerStats";

const PRISON_ACTIVITIES = [
  {
    id: "workout",       label: "Weight Training",        desc: "Daily compound lifts. The baseline of every enforcer.",
    trainsStat: "muscle",        gainMin: 2, gainMax: 4, energyCost: 25, cashCost: 50,  durationMs: 10000, levelReq: 1,
    realNote: "BJS: 72% of state prison inmates participate in physical activity programs. Avg muscle mass increase ~12% over 12-month sentence.",
  },
  {
    id: "study",         label: "Legal Library / GED",    desc: "Study law, work your appeal, earn a credential.",
    trainsStat: "intelligence",  gainMin: 2, gainMax: 4, energyCost: 25, cashCost: 0,   durationMs: 10000, levelReq: 1,
    realNote: "BJS: Education programs reduce recidivism by 43%. Many inmates study law to file pro se motions.",
  },
  {
    id: "network",       label: "Build Prison Network",   desc: "Every cell block has operators. The right intro is worth a year of work.",
    trainsStat: "connections",   gainMin: 2, gainMax: 3, energyCost: 20, cashCost: 0,   durationMs: 8000,  levelReq: 1,
    realNote: "Criminology research: prison described as 'crime school' — 65% of released inmates report gaining criminal contacts inside.",
  },
  {
    id: "hustle",        label: "Run a Prison Hustle",    desc: "Commissary arbitrage, contraband distribution. Even inside, money moves.",
    trainsStat: "streetSmarts",  gainMin: 2, gainMax: 3, energyCost: 35, cashCost: 0,   durationMs: 12000, levelReq: 1, cashReward: { min: 200, max: 800 },
    realNote: "Prison black markets generate $8M–$100M annually across US facilities. Ramen noodles replaced cigarettes as primary currency.",
  },
  {
    id: "tech_class",    label: "Vocational Tech Program", desc: "Computer repair, coding basics, IT certification.",
    trainsStat: "techSavvy",     gainMin: 2, gainMax: 4, energyCost: 25, cashCost: 0,   durationMs: 10000, levelReq: 1,
    realNote: "Federal Bureau of Prisons: 47,000 inmates enrolled in vocational programs.",
  },
  {
    id: "stealth_ops",   label: "Contraband Smuggling",   desc: "Move product past guards. Sharpens operational security instincts.",
    trainsStat: "stealth",       gainMin: 2, gainMax: 3, energyCost: 40, cashCost: 0,   durationMs: 15000, levelReq: 1,
    riskyActivity: true, riskChance: 20, riskLabel: "Guard Catch",
    realNote: "BJS: 12% of prison misconduct violations involve contraband. Phones, drugs, and weapons top the list.",
  },
  {
    id: "sparring",      label: "Yard Sparring",          desc: "Controlled combat. Pain tolerance is a learned skill.",
    trainsStat: "nerve",         gainMin: 2, gainMax: 4, energyCost: 30, cashCost: 0,   durationMs: 12000, levelReq: 1,
    realNote: "FBI profiling: incarcerated individuals with combat training reoffend more violently post-release. Prison MMA communities documented.",
  },
];

const SENTENCE_TIERS = [
  { minHeat: 80,  maxHeat: 89,  label: "Misdemeanor",       baseDays: 7,   description: "County lockup. Time served likely." },
  { minHeat: 90,  maxHeat: 94,  label: "Low Felony",        baseDays: 30,  description: "State prison. 1–3 year sentence." },
  { minHeat: 95,  maxHeat: 97,  label: "Serious Felony",    baseDays: 90,  description: "5–10 years. Federal involvement possible." },
  { minHeat: 98,  maxHeat: 99,  label: "Federal RICO",      baseDays: 180, description: "Federal prosecution. 10–20 years." },
  { minHeat: 100, maxHeat: 100, label: "Interpol / RICO+",  baseDays: 365, description: "International warrant. Life possible." },
];

export default function PrisonPage({ player, onPrisonAction }) {
  const heat      = player?.heat     || 0;
  // Use isInCustody flag first; fall back to heat threshold for legacy saves
  const isJailed  = player?.isInCustody || heat >= 80;
  const sentence  = SENTENCE_TIERS.find((s) => heat >= s.minHeat && heat <= s.maxHeat)
                 || (isJailed ? SENTENCE_TIERS[0] : null);

  const [activeActivity, setActiveActivity] = useState(null);
  const [result,         setResult]         = useState(null);
  const [inProgress,     setInProgress]     = useState(false);

  const hasLawyer    = player?.inventory?.some((i) => i.id === "lawyer_retainer");
  const effectiveDays= sentence ? Math.floor(sentence.baseDays * (hasLawyer ? 0.6 : 1)) : 0;
  const served       = player?.prisonDays || 0;
  const remaining    = Math.max(0, effectiveDays - served);
  const servedPct    = effectiveDays > 0 ? Math.min(100, (served / effectiveDays) * 100) : 0;

  const handleActivity = (activity) => {
    if (inProgress || !isJailed) return;
    if ((player?.energy || 0) < activity.energyCost) { setResult({ type: "error", msg: "Not enough energy." }); return; }
    setActiveActivity(activity);
    setResult(null);
    setInProgress(true);

    setTimeout(() => {
      if (activity.riskyActivity && Math.random() * 100 < activity.riskChance) {
        setResult({ type: "fail", msg: "Guard caught you. +3 extra days.", extraDays: 3 });
        onPrisonAction?.({ type: "activity_fail", extraDays: 3, energyCost: activity.energyCost });
      } else {
        const gain = Math.floor(Math.random() * (activity.gainMax - activity.gainMin + 1)) + activity.gainMin;
        const cashEarned = activity.cashReward
          ? Math.floor(Math.random() * (activity.cashReward.max - activity.cashReward.min) + activity.cashReward.min)
          : 0;
        setResult({ type: "success", msg: `Training complete.`, stat: activity.trainsStat, gain, cashEarned });
        onPrisonAction?.({ type: "activity_success", stat: activity.trainsStat, gain, energyCost: activity.energyCost, addDay: true, cashEarned });
      }
      setInProgress(false);
    }, activity.durationMs);
  };

  return (
    <div className="prison-page animate-in">
      <div className="page-header">
        <h2>Prison System</h2>
        <span className="mono muted" style={{ fontSize: "0.7em" }}>Do the time. Train. Network. Get out clean.</span>
      </div>

      {/* Status card */}
      <div className={`prison-status ${isJailed ? "jailed" : "free"}`}>
        <div>
          <div className="mono" style={{ fontSize: "0.62em", letterSpacing: "0.2em", marginBottom: 3, color: isJailed ? "#c0392b" : "#3d8c5a" }}>
            {isJailed ? "● IN CUSTODY" : "● FREE"}
          </div>
          <h3 style={{ fontSize: "1.05em", letterSpacing: "0.1em" }}>
            {isJailed ? (sentence?.label || "Detained") : "Currently Free"}
          </h3>
          <p className="dim" style={{ fontSize: "0.84em", marginTop: 3, lineHeight: 1.5 }}>
            {isJailed ? sentence?.description || "You are in custody."
                      : "Heat below 80%. Stay clean or keep moving fast enough to stay ahead."}
          </p>
        </div>
        {isJailed && (
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div className="label">Heat</div>
            <div className="mono" style={{ color: "#c0392b", fontSize: "1.3em" }}>{heat}%</div>
            <div className="label" style={{ marginTop: 6 }}>Days Left</div>
            <div className="mono amber" style={{ fontSize: "1.1em" }}>{remaining}</div>
            {hasLawyer && <div className="mono" style={{ fontSize: "0.62em", color: "#3d8c5a", marginTop: 3 }}>✓ Lawyer: -40%</div>}
          </div>
        )}
      </div>

      {/* Free: sentence guide */}
      {!isJailed && (
        <div className="panel">
          <div className="panel-header">Arrest Thresholds</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {SENTENCE_TIERS.map((tier) => (
              <div key={tier.label} className="sentence-cell" style={{ borderLeftColor: heat >= tier.minHeat ? "#c0392b" : "var(--border)" }}>
                <div className="mono" style={{ fontSize: "0.62em", color: heat >= tier.minHeat ? "#c0392b" : "var(--text-muted)", letterSpacing: "0.1em" }}>
                  HEAT {tier.minHeat}–{tier.maxHeat === 100 ? "100" : tier.maxHeat}%
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.82em", textTransform: "uppercase", marginTop: 2 }}>{tier.label}</div>
                <div className="dim" style={{ fontSize: "0.75em", marginTop: 2 }}>{tier.description}</div>
              </div>
            ))}
          </div>
          <div className="real-data-note" style={{ marginTop: 10 }}>
            <p style={{ fontSize: "0.72em", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.5 }}>
              Source: BJS — US has 2.1M incarcerated. Average felony sentence: 4.9 years. Time served: 2.6 years. RICO convictions avg 20+ years.
            </p>
          </div>
        </div>
      )}

      {/* Jailed: serve time + activities */}
      {isJailed && (
        <>
          <div className="sentence-bar-panel">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span className="label">Time Served</span>
              <span className="mono muted" style={{ fontSize: "0.72em" }}>{served} / {effectiveDays} days</span>
            </div>
            <div className="progress-bar" style={{ height: "6px" }}>
              <div className="progress-fill green" style={{ width: `${servedPct}%` }} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {[1, 7, 30].map((days) => (
                <button key={days} className="btn" style={{ fontSize: "0.7em" }}
                  onClick={() => onPrisonAction?.({ type: "serve_time", days, heatReduction: days * 3 })}
                  disabled={remaining <= 0}>
                  Serve {days}d
                </button>
              ))}
              {remaining <= 0 && (
                <button className="btn btn-primary" style={{ marginLeft: "auto" }}
                  onClick={() => onPrisonAction?.({ type: "release" })}>
                  ▶ Release
                </button>
              )}
            </div>
          </div>

          {result && (
            <div className={`feedback-bar animate-in`}
              style={{ borderColor: result.type === "success" ? "#3d8c5a" : "#c0392b", color: result.type === "success" ? "#3d8c5a" : "#c0392b" }}
              onClick={() => setResult(null)}>
              {result.type === "success" ? "✓" : "✗"} {result.msg}
              {result.gain > 0 && <span className="mono amber" style={{ marginLeft: 8 }}>+{result.gain} {result.stat}</span>}
              {result.cashEarned > 0 && <span className="mono" style={{ marginLeft: 8, color: "#3d8c5a" }}>+${result.cashEarned}</span>}
              <span className="mono muted" style={{ marginLeft: "auto", fontSize: "0.7em" }}>[dismiss]</span>
            </div>
          )}

          <div className="label" style={{ marginBottom: 8 }}>Prison Activities — Train While Doing Time</div>
          <div className="activities-layout">
            {PRISON_ACTIVITIES.map((act) => {
              const statDef   = STAT_DEFINITIONS[act.trainsStat];
              const hasEnergy = (player?.energy || 0) >= act.energyCost;
              const isActive  = activeActivity?.id === act.id;
              return (
                <div key={act.id} className={`activity-card ${isActive ? "selected" : ""} ${!hasEnergy ? "locked" : ""}`}>
                  <div className="activity-header">
                    <span style={{ fontSize: "0.9em" }}>{statDef?.icon}</span>
                    <span className="activity-label">{act.label}</span>
                    {act.riskyActivity && <span className="mono" style={{ fontSize: "0.6em", color: "#c0392b", marginLeft: "auto" }}>⚠ {act.riskChance}% risk</span>}
                  </div>
                  <p className="dim" style={{ fontSize: "0.81em", lineHeight: 1.5 }}>{act.desc}</p>
                  <div className="activity-meta">
                    <span className="mono" style={{ fontSize: "0.7em", color: statDef?.color || "#3d8c5a" }}>
                      +{act.gainMin}–{act.gainMax} {statDef?.label}
                      {act.cashReward ? ` · +$${act.cashReward.min}–${act.cashReward.max}` : ""}
                    </span>
                    <span className="mono muted" style={{ fontSize: "0.7em" }}>⚡{act.energyCost}</span>
                  </div>
                  <div className="real-data-note" style={{ marginTop: 6 }}>
                    <p style={{ fontSize: "0.68em", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.4 }}>{act.realNote}</p>
                  </div>
                  <button className="btn btn-primary" style={{ marginTop: 8, fontSize: "0.7em", width: "100%" }}
                    disabled={!hasEnergy || inProgress}
                    onClick={() => handleActivity(act)}>
                    {isActive && inProgress ? "▶ IN PROGRESS..." : `▶ ${act.label}`}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      <style>{`
        .prison-page{padding:20px;overflow-y:auto;display:flex;flex-direction:column;gap:14px;}
        .page-header{display:flex;flex-direction:column;gap:4px;}
        .page-header h2{font-size:1.2em;letter-spacing:.15em;}
        .prison-status{display:flex;justify-content:space-between;align-items:flex-start;border:1px solid;padding:14px 16px;}
        .prison-status.jailed{border-color:#c0392b;background:rgba(192,57,43,.05);border-left:3px solid #c0392b;}
        .prison-status.free  {border-color:#3d8c5a;background:rgba(61,140,90,.05);border-left:3px solid #3d8c5a;}
        .sentence-cell{background:var(--bg-raised);border:1px solid var(--border);border-left:3px solid;padding:9px 11px;}
        .sentence-bar-panel{background:var(--bg-card);border:1px solid var(--border);padding:13px 15px;}
        .activities-layout{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;}
        .activity-card{background:var(--bg-card);border:1px solid var(--border);padding:13px;display:flex;flex-direction:column;gap:5px;transition:all .12s;}
        .activity-card:hover{border-color:var(--amber-dim);}
        .activity-card.selected{border-color:var(--amber);background:var(--amber-glow);}
        .activity-card.locked{opacity:.5;}
        .activity-header{display:flex;align-items:center;gap:6px;}
        .activity-label{font-family:var(--font-display);font-size:.86em;font-weight:600;letter-spacing:.08em;text-transform:uppercase;}
        .activity-meta{display:flex;justify-content:space-between;}
        .real-data-note{padding:6px 8px;background:var(--bg-raised);border-left:2px solid var(--amber-dim);}
        .feedback-bar{display:flex;align-items:center;gap:8px;padding:8px 13px;border:1px solid;font-family:var(--font-mono);font-size:.76em;cursor:pointer;}
      `}</style>
    </div>
  );
}
