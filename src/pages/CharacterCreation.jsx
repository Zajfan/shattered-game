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

const STARTING_CITIES = [
  {
    id: "nyc",
    name: "New York City",
    state: "NY",
    desc: "Five boroughs. Five Families. The highest stakes and the highest density of competition.",
    perks: ["Fraud crimes +10%", "Financial district accessible earlier", "Gambino/Genovese connections"],
    crimeIndex: 55,
  },
  {
    id: "la",
    name: "Los Angeles",
    state: "CA",
    desc: "The birthplace of the Crips and Bloods. Cartel product flows through here like water.",
    perks: ["Street crimes +10%", "Drug dealing +5%", "Gang factions accessible earlier"],
    crimeIndex: 74,
  },
  {
    id: "chicago",
    name: "Chicago",
    state: "IL",
    desc: "Most gang members per capita of any major US city. The Outfit never really died.",
    perks: ["Extortion +10%", "Organized crime access earlier", "Cold-weather heat decay bonus"],
    crimeIndex: 83,
  },
  {
    id: "miami",
    name: "Miami",
    state: "FL",
    desc: "Cocaine Cowboys country. Drug money launders through real estate like nowhere else.",
    perks: ["Laundering rate +5%", "Cartel connections bonus", "Drug trafficking +8%"],
    crimeIndex: 71,
  },
  {
    id: "houston",
    name: "Houston",
    state: "TX",
    desc: "The cartel's inland distribution hub. Gulf Coast runs straight to your door.",
    perks: ["Cartel operations +10%", "Smuggling +8%", "Starting cash +$200"],
    startingCashBonus: 200,
    crimeIndex: 68,
  },
  {
    id: "detroit",
    name: "Detroit",
    state: "MI",
    desc: "Motor City. Chop shops and auto theft capital of the US. Abandoned infrastructure is your office.",
    perks: ["Auto theft +20%", "Chop shop income +15%", "Low police presence in industrial zones"],
    crimeIndex: 89,
  },
];

export default function CharacterCreation({ onCreate }) {
  const [name,   setName]   = useState("");
  const [origin, setOrigin] = useState(null);
  const [city,   setCity]   = useState(null);
  const [step,   setStep]   = useState(1); // 1=name, 2=origin, 3=city

  const handleCreate = () => {
    if (!name.trim() || !origin || !city) return;
    const path     = ORIGIN_PATHS.find((p) => p.id === origin);
    const cityData = STARTING_CITIES.find((c) => c.id === city);
    const newPlayer = {
      ...DEFAULT_PLAYER,
      id:        `SH-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      name:      name.trim().toUpperCase(),
      createdAt: new Date().toISOString(),
      startingCity: city,
      cash: (path.startingCash + (cityData.startingCashBonus || 0)),
      stats: {
        ...DEFAULT_PLAYER.stats,
        ...Object.fromEntries(
          Object.entries(path.bonuses)
            .filter(([k]) => k !== "reputation")
            .map(([k, v]) => [k, DEFAULT_PLAYER.stats[k] + v])
        ),
        reputation: DEFAULT_PLAYER.stats.reputation + (path.bonuses.reputation || 0),
      },
    };
    onCreate(newPlayer);
  };

  const CRIME_INDEX_COLOR = (ci) =>
    ci >= 80 ? "#c0392b" : ci >= 65 ? "#e67e22" : ci >= 50 ? "#d4a827" : "#3d8c5a";

  return (
    <div className="creation-screen">
      <div className="creation-inner">
        <div className="creation-header">
          <div className="logo-text flicker">SHATTERED</div>
          <div className="mono muted" style={{ fontSize: "0.7em", letterSpacing: "0.15em", marginTop: 4 }}>
            CRIMINAL UNDERWORLD SIMULATOR
          </div>
        </div>

        {/* Step indicators */}
        <div className="step-dots">
          {[1,2,3].map(s => (
            <div key={s} className={`step-dot ${step === s ? "active" : step > s ? "done" : ""}`}>
              <span className="step-dot-num">{s}</span>
              <span className="step-dot-label">{["Identity","Origin","City"][s-1]}</span>
            </div>
          ))}
        </div>

        {/* ── Step 1: Name ── */}
        {step === 1 && (
          <div className="creation-step animate-in">
            <div className="step-label">Step 1 of 3 — Identity</div>
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

        {/* ── Step 2: Origin ── */}
        {step === 2 && (
          <div className="creation-step animate-in">
            <div className="step-label">Step 2 of 3 — Origin</div>
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
                onClick={() => setStep(3)}
              >
                ▶ Continue
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: City ── */}
        {step === 3 && (
          <div className="creation-step animate-in">
            <div className="step-label">Step 3 of 3 — Starting City</div>
            <h2 style={{ fontSize: "1.1em", marginBottom: 8 }}>Where do you operate, {name}?</h2>
            <p className="dim" style={{ fontSize: "0.88em", marginBottom: 20, lineHeight: 1.6 }}>
              Your city shapes your early game. Local districts are cheaper to claim,
              and city-specific crime bonuses apply from day one. You can expand to other cities later.
            </p>
            <div className="city-grid">
              {STARTING_CITIES.map((c) => {
                const ciColor = CRIME_INDEX_COLOR(c.crimeIndex);
                return (
                  <div
                    key={c.id}
                    className={`city-card ${city === c.id ? "selected" : ""}`}
                    onClick={() => setCity(c.id)}
                  >
                    <div className="city-card-top">
                      <div>
                        <div className="city-name">{c.name}</div>
                        <div className="mono muted" style={{ fontSize: "0.65em" }}>{c.state}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="label" style={{ fontSize: "0.58em" }}>Crime Index</div>
                        <div className="mono" style={{ color: ciColor, fontSize: "0.9em" }}>{c.crimeIndex}/100</div>
                      </div>
                    </div>
                    <p style={{ fontSize: "0.8em", color: "var(--text-secondary)", lineHeight: 1.5, margin: "6px 0 8px" }}>
                      {c.desc}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {c.perks.map((p) => (
                        <span key={p} className="mono" style={{ fontSize: "0.65em", color: "var(--amber-dim)" }}>
                          ▸ {p}
                        </span>
                      ))}
                    </div>
                    {c.startingCashBonus && (
                      <div className="mono" style={{ fontSize: "0.65em", color: "#3d8c5a", marginTop: 6 }}>
                        +${c.startingCashBonus} starting bonus
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="btn" onClick={() => setStep(2)}>◀ Back</button>
              <button
                className="btn btn-primary"
                style={{ padding: "12px 32px" }}
                disabled={!city}
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
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-void);
          background-image: var(--scanline), radial-gradient(ellipse at 50% 30%, rgba(200,146,42,0.06) 0%, transparent 60%);
          padding: 40px 20px;
        }
        .creation-inner {
          max-width: 820px; width: 100%;
          display: flex; flex-direction: column; gap: 28px;
        }
        .creation-header { text-align: center; }
        .logo-text {
          font-family: var(--font-display); font-weight: 700; font-size: 3em;
          letter-spacing: 0.4em; color: var(--amber); text-transform: uppercase;
        }
        .step-dots { display: flex; align-items: center; justify-content: center; gap: 0; }
        .step-dot {
          display: flex; align-items: center; gap: 8px; padding: 6px 20px;
          border: 1px solid var(--border); font-family: var(--font-mono);
          font-size: 0.65em; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--text-muted);
        }
        .step-dot:not(:last-child) { border-right: none; }
        .step-dot.active { border-color: var(--amber); color: var(--amber); background: var(--amber-glow); }
        .step-dot.done   { border-color: var(--amber-dim); color: var(--amber-dim); }
        .step-dot-num {
          width: 18px; height: 18px; border-radius: 50%;
          border: 1px solid currentColor;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.85em; flex-shrink: 0;
        }
        .step-label {
          font-family: var(--font-mono); font-size: 0.65em; letter-spacing: 0.2em;
          color: var(--amber-dim); text-transform: uppercase; margin-bottom: 8px;
        }
        .creation-step { display: flex; flex-direction: column; }
        .name-input {
          background: var(--bg-card); border: 1px solid var(--border);
          border-bottom: 2px solid var(--amber); color: var(--amber);
          font-family: var(--font-display); font-size: 1.6em; font-weight: 600;
          letter-spacing: 0.2em; padding: 12px 16px; outline: none;
          text-transform: uppercase; width: 100%; max-width: 400px; transition: border-color 0.2s;
        }
        .name-input::placeholder { color: var(--text-muted); }
        .name-input:focus { border-bottom-color: #d9a030; }
        .origin-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; }
        .origin-card {
          background: var(--bg-card); border: 1px solid var(--border);
          padding: 14px; cursor: pointer; transition: all 0.15s ease;
        }
        .origin-card:hover   { border-color: var(--amber-dim); background: var(--bg-raised); }
        .origin-card.selected { border-color: var(--amber); background: var(--amber-glow); }
        .origin-label {
          font-family: var(--font-display); font-weight: 600; font-size: 0.95em;
          letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-primary);
        }
        .bonus-tag {
          font-family: var(--font-mono); font-size: 0.65em; padding: 2px 7px;
          background: var(--amber-glow); border: 1px solid var(--amber-dim); color: var(--amber);
        }
        .city-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px; }
        .city-card {
          background: var(--bg-card); border: 1px solid var(--border);
          padding: 14px; cursor: pointer; transition: all 0.15s ease;
          display: flex; flex-direction: column;
        }
        .city-card:hover    { border-color: var(--amber-dim); background: var(--bg-raised); }
        .city-card.selected { border-color: var(--amber); background: var(--amber-glow); }
        .city-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
        .city-name {
          font-family: var(--font-display); font-weight: 600; font-size: 0.95em;
          letter-spacing: 0.1em; text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}
