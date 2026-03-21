import { useState } from "react";
import { STAT_DEFINITIONS } from "../data/playerStats";

const PRISON_ACTIVITIES = [
  {
    id: "workout",
    label: "Workout Yard",
    description: "Daily weight training and conditioning. Prison gyms are serious business.",
    trainsStat: "muscle",
    gainPerSession: 3,
    energyCost: 30,
    timeSec: 10,
    realDataNote: "BJS: 72% of state prison inmates participate in physical activity programs. Studies show avg muscle mass increase of 12% over 12-month sentence.",
  },
  {
    id: "study",
    label: "GED / Legal Library",
    description: "Study law, work your appeal, or earn a credential. Knowledge is power inside and out.",
    trainsStat: "intelligence",
    gainPerSession: 3,
    energyCost: 25,
    timeSec: 10,
    realDataNote: "BJS: Education programs reduce recidivism by 43%. Many inmates study law to file pro se motions — some succeed.",
  },
  {
    id: "network",
    label: "Build Prison Network",
    description: "Make connections. Every cell block has operators. The right intro is worth a year of work.",
    trainsStat: "connections",
    gainPerSession: 2,
    energyCost: 20,
    timeSec: 8,
    realDataNote: "Criminology research: prison is described as 'crime school' — 65% of released inmates report gaining criminal contacts inside.",
  },
  {
    id: "hustle",
    label: "Run a Prison Hustle",
    description: "Commissary arbitrage, contraband distribution, debt collection. Even inside, there's money to make.",
    trainsStat: "streetSmarts",
    gainPerSession: 2,
    energyCost: 35,
    timeSec: 12,
    realDataNote: "Prison black markets generate estimated $8M–$100M annually across US facilities. Ramen noodles replaced cigarettes as primary currency post-smoking ban.",
  },
  {
    id: "tech_class",
    label: "Vocational Tech Program",
    description: "Computer repair, coding basics, IT certification. Federal prisons run accredited programs.",
    trainsStat: "techSavvy",
    gainPerSession: 3,
    energyCost: 25,
    timeSec: 10,
    realDataNote: "Federal Bureau of Prisons: 47,000 inmates enrolled in vocational programs. 'Code.7370' initiative teaches programming in select facilities.",
  },
  {
    id: "stealth_ops",
    label: "Contraband Smuggling",
    description: "Move product past guards and snitches. Sharpens your operational security instincts.",
    trainsStat: "stealth",
    gainPerSession: 2,
    energyCost: 40,
    timeSec: 15,
    riskyActivity: true,
    riskLabel: "Guard Catch Risk",
    riskChance: 20,
    realDataNote: "BJS: 12% of prison misconduct violations involve contraband. Phones, drugs, and weapons make up the top three. Some COs are on the payroll.",
  },
];

const SENTENCE_TIERS = [
  { minHeat: 80,  maxHeat: 89,  label: "Misdemeanor",       baseDays: 7,   description: "Petty offense. County lockup. Time served likely." },
  { minHeat: 90,  maxHeat: 94,  label: "Low Felony",        baseDays: 30,  description: "State prison. 1–3 year sentence." },
  { minHeat: 95,  maxHeat: 97,  label: "Serious Felony",    baseDays: 90,  description: "5–10 year sentence. Federal involvement possible." },
  { minHeat: 98,  maxHeat: 99,  label: "Federal RICO",      baseDays: 180, description: "Federal prosecution. RICO charges. 10–20 years." },
  { minHeat: 100, maxHeat: 100, label: "Interpol / RICO+",  baseDays: 365, description: "International warrant. Maximum security. Life possible." },
];

export default function PrisonPage({ player, onPrisonAction }) {
  const heat     = player?.heat     || 0;
  const isJailed = heat >= 80;
  const sentence = SENTENCE_TIERS.find((s) => heat >= s.minHeat && heat <= s.maxHeat);

  const [activeActivity, setActiveActivity] = useState(null);
  const [result,         setResult]         = useState(null);
  const [inProgress,     setInProgress]     = useState(false);

  // Calculate effective sentence (reduced by lawyer retainer)
  const hasLawyer         = player?.inventory?.some((i) => i.id === "lawyer_retainer");
  const effectiveDays     = sentence ? Math.floor(sentence.baseDays * (hasLawyer ? 0.6 : 1)) : 0;
  const timeServedDays    = player?.prisonDays || 0;
  const daysRemaining     = Math.max(0, effectiveDays - timeServedDays);
  const servedPct         = effectiveDays > 0 ? Math.min(100, (timeServedDays / effectiveDays) * 100) : 0;

  const handleActivity = (activity) => {
    if (inProgress || !isJailed) return;
    if ((player?.energy || 0) < activity.energyCost) {
      setResult({ type: "error", msg: "Not enough energy. Rest first." });
      return;
    }
    setActiveActivity(activity);
    setInProgress(true);
    setResult(null);

    setTimeout(() => {
      // Risk check for risky activities
      if (activity.riskyActivity && Math.random() * 100 < activity.riskChance) {
        setResult({
          type: "fail",
          msg: `Guard caught you. Extra 3 days added. No gain.`,
          stat: null,
          gain: 0,
          extraDays: 3,
        });
        onPrisonAction?.({ type: "activity_fail", extraDays: 3, energyCost: activity.energyCost });
      } else {
        setResult({
          type: "success",
          msg: `Training complete. ${STAT_DEFINITIONS[activity.trainsStat]?.label} improved.`,
          stat: activity.trainsStat,
          gain: activity.gainPerSession,
        });
        onPrisonAction?.({
          type: "activity_success",
          stat: activity.trainsStat,
          gain: activity.gainPerSession,
          energyCost: activity.energyCost,
          addDay: true,
        });
      }
      setInProgress(false);
    }, activity.timeSec * 100);
  };

  const handleServeDays = (days) => {
    onPrisonAction?.({ type: "serve_time", days, heatReduction: days * 3 });
    setResult({ type: "success", msg: `Served ${days} day(s). Heat reduced. Time counts toward release.` });
  };

  return (
    <div className="prison-page animate-in">
      <div className="page-header">
        <h2>Prison System</h2>
        <span className="mono muted" style={{ fontSize: "0.7em" }}>
          Do the time. Train. Network. Get out clean.
        </span>
      </div>

      {/* Status */}
      <div className={`prison-status-card ${isJailed ? "jailed" : "free"}`}>
        <div className="prison-status-left">
          <div className="mono" style={{ fontSize: "0.65em", letterSpacing: "0.2em", marginBottom: 4, color: isJailed ? "#c0392b" : "#3d8c5a" }}>
            {isJailed ? "● IN CUSTODY" : "● FREE"}
          </div>
          <h3 style={{ fontSize: "1.1em", letterSpacing: "0.1em" }}>
            {isJailed ? (sentence?.label || "Detained") : "Currently Free"}
          </h3>
          <p className="dim" style={{ fontSize: "0.85em", marginTop: 4, lineHeight: 1.5 }}>
            {isJailed
              ? (sentence?.description || "You're in custody.")
              : "Your heat is below 80%. Stay clean or keep moving fast enough to stay ahead."}
          </p>
        </div>
        {isJailed && (
          <div className="prison-status-right">
            <div className="label">Heat Level</div>
            <div className="mono" style={{ fontSize: "1.4em", color: "#c0392b" }}>{heat}%</div>
            <div className="label" style={{ marginTop: 8 }}>Days Remaining</div>
            <div className="mono amber" style={{ fontSize: "1.2em" }}>{daysRemaining}</div>
            {hasLawyer && (
              <div className="mono" style={{ fontSize: "0.65em", color: "#3d8c5a", marginTop: 4 }}>
                ✓ Lawyer: -40% sentence
              </div>
            )}
          </div>
        )}
      </div>

      {/* Not jailed — info panel */}
      {!isJailed && (
        <div className="info-panel">
          <div className="panel-header">How Arrest Works</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {SENTENCE_TIERS.map((tier) => (
              <div key={tier.label} className="sentence-preview">
                <div className="mono" style={{ fontSize: "0.65em", color: heat >= tier.minHeat ? "#c0392b" : "var(--text-muted)", letterSpacing: "0.1em" }}>
                  HEAT {tier.minHeat}–{tier.maxHeat === 100 ? "100" : tier.maxHeat}%
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.85em", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>
                  {tier.label}
                </div>
                <div className="dim" style={{ fontSize: "0.78em", marginTop: 2 }}>{tier.description}</div>
              </div>
            ))}
          </div>
          <div className="real-data-note" style={{ marginTop: 12 }}>
            <span className="label" style={{ fontSize: "0.6em" }}>Real Data</span>
            <p style={{ fontSize: "0.75em", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.5, marginTop: 4 }}>
              Source: BJS Prison Statistics — US has 2.1M incarcerated (highest per capita globally).
              Average felony sentence: 4.9 years. Time served: 2.6 years. RICO convictions avg 20+ years.
            </p>
          </div>
        </div>
      )}

      {/* Prison Activities — only when jailed */}
      {isJailed && (
        <>
          {/* Sentence bar */}
          <div className="sentence-bar-panel">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span className="label">Time Served</span>
              <span className="mono muted" style={{ fontSize: "0.75em" }}>{timeServedDays} / {effectiveDays} days</span>
            </div>
            <div className="progress-bar" style={{ height: "6px" }}>
              <div className="progress-fill green" style={{ width: `${servedPct}%` }} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {[1, 7, 30].map((days) => (
                <button
                  key={days}
                  className="btn"
                  style={{ fontSize: "0.7em" }}
                  onClick={() => handleServeDays(days)}
                  disabled={daysRemaining <= 0}
                >
                  Serve {days}d
                </button>
              ))}
              {daysRemaining <= 0 && (
                <button
                  className="btn btn-primary"
                  style={{ marginLeft: "auto" }}
                  onClick={() => onPrisonAction?.({ type: "release" })}
                >
                  ▶ Release
                </button>
              )}
            </div>
          </div>

          {result && (
            <div
              className={`feedback-bar animate-in`}
              style={{ borderColor: result.type === "success" ? "#3d8c5a" : "#c0392b",
                       color:       result.type === "success" ? "#3d8c5a" : "#c0392b" }}
              onClick={() => setResult(null)}
            >
              {result.type === "success" ? "✓" : "✗"} {result.msg}
              {result.gain > 0 && <span className="mono amber" style={{ marginLeft: 8 }}>+{result.gain} {result.stat}</span>}
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
                <div
                  key={act.id}
                  className={`activity-card ${isActive ? "selected" : ""} ${!hasEnergy ? "locked" : ""}`}
                >
                  <div className="activity-header">
                    <span style={{ fontSize: "0.9em" }}>{statDef?.icon}</span>
                    <span className="activity-label">{act.label}</span>
                    {act.riskyActivity && (
                      <span className="mono" style={{ fontSize: "0.6em", color: "#c0392b", marginLeft: "auto" }}>
                        ⚠ {act.riskChance}% catch risk
                      </span>
                    )}
                  </div>
                  <p className="dim" style={{ fontSize: "0.82em", lineHeight: 1.5 }}>{act.description}</p>
                  <div className="activity-meta">
                    <span className="mono" style={{ fontSize: "0.7em", color: "#3d8c5a" }}>
                      +{act.gainPerSession} {statDef?.label}
                    </span>
                    <span className="mono muted" style={{ fontSize: "0.7em" }}>
                      Energy: {act.energyCost}
                    </span>
                  </div>
                  <div className="real-data-note" style={{ marginTop: 8 }}>
                    <p style={{ fontSize: "0.7em", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.4 }}>
                      {act.realDataNote}
                    </p>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: 10, fontSize: "0.72em", width: "100%" }}
                    disabled={!hasEnergy || inProgress}
                    onClick={() => handleActivity(act)}
                  >
                    {isActive && inProgress ? "▶ IN PROGRESS..." : `▶ ${act.label}`}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      <style>{`
        .prison-page { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
        .page-header { display: flex; flex-direction: column; gap: 4px; }
        .page-header h2 { font-size: 1.2em; letter-spacing: 0.15em; }
        .prison-status-card {
          display: flex; justify-content: space-between; align-items: flex-start;
          border: 1px solid; padding: 16px 20px;
        }
        .prison-status-card.jailed { border-color: #c0392b; background: rgba(192,57,43,0.06); border-left: 3px solid #c0392b; }
        .prison-status-card.free   { border-color: #3d8c5a; background: rgba(61,140,90,0.06); border-left: 3px solid #3d8c5a; }
        .prison-status-left { flex: 1; }
        .prison-status-right { text-align: right; min-width: 120px; }
        .info-panel { background: var(--bg-card); border: 1px solid var(--border); padding: 16px; }
        .sentence-preview { background: var(--bg-raised); border: 1px solid var(--border); padding: 10px; }
        .sentence-bar-panel { background: var(--bg-card); border: 1px solid var(--border); padding: 14px 16px; }
        .activities-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; }
        .activity-card {
          background: var(--bg-card); border: 1px solid var(--border);
          padding: 14px; display: flex; flex-direction: column; gap: 6px;
          transition: all 0.12s;
        }
        .activity-card:hover { border-color: var(--amber-dim); }
        .activity-card.selected { border-color: var(--amber); background: var(--amber-glow); }
        .activity-card.locked { opacity: 0.5; }
        .activity-header { display: flex; align-items: center; gap: 6px; }
        .activity-label { font-family: var(--font-display); font-size: 0.88em; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
        .activity-meta { display: flex; justify-content: space-between; }
        .real-data-note { padding: 6px 8px; background: var(--bg-raised); border-left: 2px solid var(--amber-dim); }
        .feedback-bar {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 14px; border: 1px solid; font-family: var(--font-mono);
          font-size: 0.78em; cursor: pointer; letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
}
