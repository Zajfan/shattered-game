import { useState, useEffect } from "react";

const SEVERITY_COLORS = {
  critical:    "#c0392b",
  high:        "#e67e22",
  opportunity: "#3d8c5a",
};

const SERVER_URL = "http://localhost:3001";

// Fallback narratives when server is offline
const FALLBACK_NARRATIVES = {
  informant_surfaces: "Word came back through three different sources: someone in your crew has been talking. The feds didn't come to you with it — they never do.",
  undercover_sting:   "The new face on the corner has been there four days too long. Pros don't linger. Someone's building a case.",
  rival_attack:       "Three of your spots went dark in the same hour. This wasn't random — it's coordinated, and it has a name behind it.",
  lucky_break:        "A call comes in from an unknown number. The voice is calm, the offer is clean, and the window closes in 24 hours.",
  faction_war:        "The bodies started appearing on the wrong side of the border. The truce is over. Sides are being chosen.",
  police_raid:        "Helicopters. Six units. They hit three locations simultaneously. Somebody talked, and it wasn't random.",
};

export default function EventModal({ event, player, onChoice, onDismiss }) {
  const [narrative,    setNarrative]    = useState(null);
  const [loadingAI,    setLoadingAI]    = useState(true);
  const [choiceResult, setChoiceResult] = useState(null);
  const [chosen,       setChosen]       = useState(null);

  const severityColor = SEVERITY_COLORS[event.severity] || "var(--amber)";

  // Fetch AI narrative on mount
  useEffect(() => {
    let cancelled = false;
    setLoadingAI(true);

    const lowestLoyalty = player.crew?.length > 0
      ? Math.min(...player.crew.map((m) => m.loyalty)) : 5;

    const context = {
      name:       player.name,
      level:      player.level,
      heat:       player.heat,
      reputation: player.stats?.reputation || 0,
      factionId:  player.factionId || null,
      districts:  player.ownedDistricts?.length || 0,
      crew:       player.crew || [],
      lowestLoyalty,
    };

    fetch(`${SERVER_URL}/api/ai/event`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ eventType: event.id, playerContext: context }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setNarrative(data.narrative || FALLBACK_NARRATIVES[event.id]);
      })
      .catch(() => {
        if (!cancelled) setNarrative(FALLBACK_NARRATIVES[event.id] || "Something is moving in the shadows.");
      })
      .finally(() => { if (!cancelled) setLoadingAI(false); });

    return () => { cancelled = true; };
  }, [event.id, player]);

  const handleChoice = (choice) => {
    if (chosen) return;
    setChosen(choice);

    // Resolve outcome
    let outcome = { ...choice.outcome };

    // Handle probabilistic outcomes
    if (outcome.chanceHeatReduction) {
      if (Math.random() < outcome.chanceHeatReduction.chance) {
        outcome.heatDelta = (outcome.heatDelta || 0) + outcome.chanceHeatReduction.amount;
      }
    }
    if (outcome.chanceEscape) {
      const escapeChance = Math.min(0.85, ((player.stats?.stealth || 5) + (player.stats?.streetSmarts || 10)) / 100);
      if (Math.random() > escapeChance) {
        outcome.heatDelta = (outcome.heatDelta || 0) + 20; // caught
      }
    }
    if (outcome.cashGain) {
      const { min, max } = outcome.cashGain;
      outcome.resolvedCashGain = Math.floor(Math.random() * (max - min) + min);
    }
    if (outcome.gainTerritory && outcome.chance) {
      outcome.gainTerritory = Math.random() < outcome.chance;
    }

    setChoiceResult({ msg: choice.successMsg, outcome });
    onChoice?.(event, choice, outcome);
  };

  return (
    <div className="event-overlay" onClick={(e) => e.target === e.currentTarget && choiceResult && onDismiss()}>
      <div className="event-modal animate-in" style={{ borderTopColor: severityColor }}>

        {/* Header */}
        <div className="event-header">
          <div className="event-icon">{event.icon}</div>
          <div>
            <div className="mono" style={{ fontSize: "0.6em", letterSpacing: "0.2em", color: severityColor, marginBottom: 2 }}>
              {event.severity.toUpperCase()} — INCOMING EVENT
            </div>
            <h2 className="event-title">{event.title}</h2>
          </div>
          <div className="event-severity-dot" style={{ background: severityColor }} />
        </div>

        {/* AI Narrative */}
        <div className="event-narrative">
          {loadingAI ? (
            <div className="event-narrative-loading">
              <span className="mono muted" style={{ fontSize: "0.75em" }}>
                <span className="flicker">▸</span> Generating event...
              </span>
            </div>
          ) : (
            <p className="event-narrative-text">{narrative}</p>
          )}
        </div>

        {/* Choice Result */}
        {choiceResult && (
          <div className="event-result animate-in">
            <div className="mono" style={{ fontSize: "0.65em", color: "#3d8c5a", letterSpacing: "0.15em", marginBottom: 6 }}>
              ▶ OUTCOME
            </div>
            <p style={{ fontSize: "0.88em", lineHeight: 1.7, color: "var(--text-secondary)" }}>
              {choiceResult.msg}
            </p>
            <div className="event-result-stats">
              {choiceResult.outcome.heatDelta !== 0 && (
                <span className="result-tag" style={{ color: choiceResult.outcome.heatDelta > 0 ? "#c0392b" : "#3d8c5a" }}>
                  Heat {choiceResult.outcome.heatDelta > 0 ? "+" : ""}{choiceResult.outcome.heatDelta}%
                </span>
              )}
              {choiceResult.outcome.resolvedCashGain > 0 && (
                <span className="result-tag" style={{ color: "#3d8c5a" }}>
                  +${choiceResult.outcome.resolvedCashGain.toLocaleString()}
                </span>
              )}
              {choiceResult.outcome.repGain > 0 && (
                <span className="result-tag" style={{ color: "var(--amber)" }}>
                  Rep +{choiceResult.outcome.repGain}
                </span>
              )}
              {choiceResult.outcome.loseDistrict && (
                <span className="result-tag" style={{ color: "#c0392b" }}>District lost</span>
              )}
              {choiceResult.outcome.gainTerritory && (
                <span className="result-tag" style={{ color: "#3d8c5a" }}>Territory gained</span>
              )}
              {choiceResult.outcome.leaveFaction && (
                <span className="result-tag" style={{ color: "#e67e22" }}>Left faction</span>
              )}
            </div>
            <button className="btn btn-primary" style={{ width: "100%", marginTop: 14, padding: "10px" }} onClick={onDismiss}>
              ▶ Continue
            </button>
          </div>
        )}

        {/* Choices — only before selection */}
        {!choiceResult && (
          <div className="event-choices">
            <div className="mono muted" style={{ fontSize: "0.65em", letterSpacing: "0.15em", marginBottom: 8 }}>
              CHOOSE YOUR RESPONSE:
            </div>
            {event.choices.map((choice) => (
              <button
                key={choice.id}
                className="event-choice-btn"
                onClick={() => handleChoice(choice)}
                disabled={loadingAI}
              >
                <div className="choice-label">{choice.label}</div>
                <div className="choice-desc">{choice.desc}</div>
                {choice.cost?.cash > 0 && (
                  <div className="mono" style={{ fontSize: "0.65em", color: "#c0392b", marginTop: 4 }}>
                    Cost: ${choice.cost.cash.toLocaleString()}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .event-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.82);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .event-modal {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-top: 3px solid;
          max-width: 540px; width: 100%;
          padding: 24px;
          display: flex; flex-direction: column; gap: 16px;
          box-shadow: 0 0 60px rgba(0,0,0,0.8);
        }
        .event-header { display: flex; align-items: flex-start; gap: 12px; }
        .event-icon { font-size: 1.6em; margin-top: 2px; }
        .event-title { font-family: var(--font-display); font-size: 1.3em; letter-spacing: 0.15em; text-transform: uppercase; }
        .event-severity-dot { width: 8px; height: 8px; border-radius: 50%; margin-left: auto; margin-top: 6px; animation: pulse-amber 2s infinite; }
        .event-narrative {
          background: var(--bg-card); border: 1px solid var(--border);
          border-left: 3px solid var(--amber-dim); padding: 14px 16px;
          min-height: 60px; display: flex; align-items: center;
        }
        .event-narrative-loading { opacity: 0.6; }
        .event-narrative-text {
          font-family: var(--font-body); font-size: 0.95em; line-height: 1.8;
          color: var(--text-secondary); font-style: italic;
        }
        .event-choices { display: flex; flex-direction: column; gap: 6px; }
        .event-choice-btn {
          background: var(--bg-card); border: 1px solid var(--border);
          padding: 12px 14px; cursor: pointer; text-align: left;
          transition: all 0.12s; display: flex; flex-direction: column; gap: 3px;
        }
        .event-choice-btn:hover { border-color: var(--amber); background: var(--amber-glow); }
        .event-choice-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .choice-label { font-family: var(--font-display); font-size: 0.88em; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-primary); }
        .choice-desc  { font-size: 0.82em; color: var(--text-secondary); line-height: 1.4; }
        .event-result {
          background: var(--bg-card); border: 1px solid #3d8c5a;
          padding: 14px; display: flex; flex-direction: column; gap: 8px;
        }
        .event-result-stats { display: flex; flex-wrap: wrap; gap: 6px; }
        .result-tag { font-family: var(--font-mono); font-size: 0.7em; padding: 2px 8px; background: var(--bg-raised); border: 1px solid var(--border); letter-spacing: 0.05em; }
      `}</style>
    </div>
  );
}
