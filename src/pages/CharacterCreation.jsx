import { useState } from "react";
import { DEFAULT_PLAYER, STAT_DEFINITIONS } from "../data/playerStats";

const ORIGIN_PATHS = [
  {
    id: "street_kid",
    label: "Street Kid",
    description: "Grew up in public housing. Learned fast or didn't survive. The city is your classroom.",
    bonuses: { streetSmarts: 10, muscle: 5, dexterity: 5 },
    startingCash: 200,
  },
  {
    id: "white_collar",
    label: "White Collar",
    description: "Business school dropout. Discovered the real money isn't on Wall Street — it's beneath it.",
    bonuses: { intelligence: 10, techSavvy: 8, connections: 4 },
    startingCash: 800,
  },
  {
    id: "ex_military",
    label: "Ex-Military",
    description: "Honorable discharge. Dishonest discharge from civilian life. Your training has other uses.",
    bonuses: { muscle: 10, nerve: 8, stealth: 5 },
    startingCash: 400,
  },
  {
    id: "cartel_runaway",
    label: "Cartel Runaway",
    description: "Born into it. You know how it works from the inside. Now you're working for yourself.",
    bonuses: { connections: 8, nerve: 8, streetSmarts: 6, reputation: 15 },
    startingCash: 300,
  },
  {
    id: "hacker",
    label: "Underground Hacker",
    description: "Forums, darknet, carding. You live in the gaps. Physical crimes are new territory.",
    bonuses: { techSavvy: 15, intelligence: 8 },
    startingCash: 600,
  },
];

export default function CharacterCreation({ onCreate }) {
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState(null);
  const [step, setStep] = useState(1); // 1 = name, 2 = origin

  const handleCreate = () => {
    if (!name.trim() || !origin) return;

    const path = ORIGIN_PATHS.find((p) => p.id === origin);
    const newPlayer = {
      ...DEFAULT_PLAYER,
      id: `SH-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      name: name.trim().toUpperCase(),
      createdAt: new Date().toISOString(),
      cash: path.startingCash,
      stats: {
        ...DEFAULT_PLAYER.stats,
        ...Object.fromEntries(
          Object.entries(path.bonuses).filter(([k]) => k !== "reputation").map(([k, v]) => [k, DEFAULT_PLAYER.stats[k] + v])
        ),
        reputation: DEFAULT_PLAYER.stats.reputation + (path.bonuses.reputation || 0),
      },
    };

    onCreate(newPlayer);
  };

  return (
    <div className="creation-screen">
      <div className="creation-inner">
        {/* Header */}
        <div className="creation-header">
          <div className="logo-text flicker">SHATTERED</div>
          <div className="mono muted" style={{ fontSize: "0.7em", letterSpacing: "0.15em", marginTop: 4 }}>
            CRIMINAL UNDERWORLD SIMULATOR
          </div>
        </div>

        {step === 1 && (
          <div className="creation-step animate-in">
            <div className="step-label">Step 1 of 2 — Identity</div>
            <h2 style={{ fontSize: "1.1em", marginBottom: 8 }}>What do they call you?</h2>
            <p className="dim" style={{ fontSize: "0.88em", marginBottom: 20, lineHeight: 1.6 }}>
              In this world, your name is currency. It opens doors and draws targets.
              Choose carefully — or choose a name that means nothing until you make it mean something.
            </p>
            <input
              type="text"
              className="name-input"
              placeholder="ENTER ALIAS..."
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              maxLength={20}
              onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep(2)}
              autoFocus
            />
            <button
              className="btn btn-primary"
              style={{ marginTop: 16, padding: "12px 32px", alignSelf: "flex-start" }}
              disabled={!name.trim()}
              onClick={() => setStep(2)}
            >
              ▶ Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="creation-step animate-in">
            <div className="step-label">Step 2 of 2 — Origin</div>
            <h2 style={{ fontSize: "1.1em", marginBottom: 8 }}>Where did you come from, {name}?</h2>
            <p className="dim" style={{ fontSize: "0.88em", marginBottom: 20, lineHeight: 1.6 }}>
              Your background shapes your starting abilities. There's no going back.
            </p>
            <div className="origin-grid">
              {ORIGIN_PATHS.map((path) => (
                <div
                  key={path.id}
                  className={`origin-card ${origin === path.id ? "selected" : ""}`}
                  onClick={() => setOrigin(path.id)}
                >
                  <div className="origin-label">{path.label}</div>
                  <p style={{ fontSize: "0.82em", color: "var(--text-secondary)", lineHeight: 1.5, margin: "6px 0 10px" }}>
                    {path.description}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {Object.entries(path.bonuses).map(([stat, val]) => (
                      <span key={stat} className="bonus-tag">
                        {STAT_DEFINITIONS[stat]?.label || stat} +{val}
                      </span>
                    ))}
                  </div>
                  <div className="mono muted" style={{ fontSize: "0.7em", marginTop: 8 }}>
                    Starting cash: ${path.startingCash}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="btn" onClick={() => setStep(1)}>◀ Back</button>
              <button
                className="btn btn-primary"
                style={{ padding: "12px 32px" }}
                disabled={!origin}
                onClick={handleCreate}
              >
                ▶ Begin — {name}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .creation-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-void);
          background-image: var(--scanline),
            radial-gradient(ellipse at 50% 30%, rgba(200,146,42,0.06) 0%, transparent 60%);
          padding: 40px 20px;
        }
        .creation-inner {
          max-width: 780px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .creation-header { text-align: center; }
        .logo-text {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 3em;
          letter-spacing: 0.4em;
          color: var(--amber);
          text-transform: uppercase;
        }
        .step-label {
          font-family: var(--font-mono);
          font-size: 0.65em;
          letter-spacing: 0.2em;
          color: var(--amber-dim);
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .creation-step { display: flex; flex-direction: column; }
        .name-input {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-bottom: 2px solid var(--amber);
          color: var(--amber);
          font-family: var(--font-display);
          font-size: 1.6em;
          font-weight: 600;
          letter-spacing: 0.2em;
          padding: 12px 16px;
          outline: none;
          text-transform: uppercase;
          width: 100%;
          max-width: 400px;
          transition: border-color 0.2s;
        }
        .name-input::placeholder { color: var(--text-muted); }
        .name-input:focus { border-bottom-color: #d9a030; }
        .origin-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; }
        .origin-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          padding: 14px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .origin-card:hover { border-color: var(--amber-dim); background: var(--bg-raised); }
        .origin-card.selected { border-color: var(--amber); background: var(--amber-glow); }
        .origin-label {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.95em;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-primary);
        }
        .bonus-tag {
          font-family: var(--font-mono);
          font-size: 0.65em;
          padding: 2px 7px;
          background: var(--amber-glow);
          border: 1px solid var(--amber-dim);
          color: var(--amber);
        }
      `}</style>
    </div>
  );
}
