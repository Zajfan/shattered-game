// Tutorial system — shown to new players, skippable at any point
import { useState } from "react";

const STEPS = [
  {
    id: "welcome",
    title: "Welcome to Shattered",
    icon: "▣",
    target: null,
    content: `You're starting at the bottom. No faction, no crew, no territory.
    
Shattered is a browser RPG inspired by Torn — every crime, organization, and statistic is drawn from real-world law enforcement data. The world doesn't pull punches.

Your goal: build a criminal empire. How you do it is up to you.`,
    action: "Begin",
  },
  {
    id: "crimes",
    title: "Start with Crime",
    icon: "🗂",
    target: "crimes",
    content: `The Crimes page is your bread and butter. Five tiers of criminal activity — from shoplifting to cartel operations.

Each crime costs Energy and generates Heat. Succeed and earn dirty cash. Fail at high heat and you risk arrest.

Start with Tier 1 crimes. They're low risk and build your stats. You'll unlock higher tiers as you level up.`,
    action: "Go to Crimes",
    navigate: "crimes",
  },
  {
    id: "heat",
    title: "Managing Heat",
    icon: "🌡",
    target: null,
    content: `Heat is your wanted level. It climbs when you commit crimes and decays slowly over time.

At 60%+ heat, law enforcement begins active surveillance. At 80%, crime failures can result in immediate arrest.

Use the Black Market to buy items that reduce heat, or launder dirty cash to stay clean. If you get arrested, the Prison page lets you serve time to reset heat.`,
    action: "Understood",
  },
  {
    id: "training",
    title: "Build Your Stats",
    icon: "💪",
    target: "training",
    content: `Ten stats define what crimes you can attempt and how likely you are to succeed.

The Training page has four venues: Gym (Level 3), Street Mentor (Level 5), Darknet Forum (Level 7), and Shooting Range (Level 9).

Each session costs energy and real time — training runs even when you're offline. Come back when it's done.`,
    action: "Go to Training",
    navigate: "training",
  },
  {
    id: "factions",
    title: "Join a Faction",
    icon: "⚡",
    target: "factions",
    content: `Criminal organizations give you perks, passive bonuses, and access to faction-specific missions.

Factions are tiered — street gangs are accessible early, cartels and major crime families require real stat investment and level.

Each faction has 5 custom missions. Complete them to climb the rank ladder from Associate to Boss.`,
    action: "View Factions",
    navigate: "factions",
  },
  {
    id: "crew",
    title: "Build Your Crew",
    icon: "👥",
    target: "crew",
    content: `You can't run an empire alone. Eight crew archetypes are available for hire — Enforcers, Wheelman, Hackers, Fixers, Smugglers, and more.

Each crew member contributes stats and boosts specific crime categories. Loyalty matters — miss payroll and your crew starts to waver.

Start with a Lookout (cheapest) and build from there.`,
    action: "View Crew",
    navigate: "crew",
  },
  {
    id: "territory",
    title: "Control Territory",
    icon: "⬡",
    target: "territory",
    content: `Unlocks at Level 4. Eight real US cities with districts based on FBI crime data.

Claiming a district costs cash and requires minimum Reputation and Level. In return, you earn passive weekly income — money that accumulates even offline.

Ports and financial districts pay the most. Residential hotspots are easiest to claim.`,
    action: "Understood",
  },
  {
    id: "market",
    title: "Black Market & Dark Web",
    icon: "◈",
    target: "market",
    content: `The Black Market sells weapons, forged documents, drugs, equipment, and criminal services.

Equipment gives stat bonuses and boosts specific crime success rates. A Relay Attack Kit massively improves car theft. A Hacking Rig opens cybercrime operations.

For exclusive deals, visit the Dark Web Contacts page — 8 named NPC fixers with unique jobs, better rates, and cooldown timers.`,
    action: "Go to Market",
    navigate: "market",
  },
  {
    id: "daily",
    title: "Daily Challenges",
    icon: "🎯",
    target: "challenges",
    content: `Five challenges refresh every day at midnight. Complete them for bonus cash and XP.

Challenges range from committing crimes and training, to laundering money and claiming territory. Some reward playing quietly (low heat), others reward aggression.

Claim before they reset — they don't roll over.`,
    action: "View Daily Challenges",
    navigate: "challenges",
  },
  {
    id: "done",
    title: "You're Ready",
    icon: "💀",
    target: null,
    content: `That's everything. The rest you learn by doing.

A few last things: the News Feed reacts to your heat level and activity. The Settings page lets you heal up and manage your save. The Profile page tracks 18 achievements.

One rule: there are no rules.

Go make your name.`,
    action: "Start Playing",
    dismiss: true,
  },
];

export default function TutorialOverlay({ onDismiss, onNavigate }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;

  const handleAction = () => {
    if (current.navigate && onNavigate) onNavigate(current.navigate);
    if (isLast || current.dismiss) { onDismiss?.(); return; }
    setStep(s => s + 1);
  };

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-modal animate-in">
        {/* Progress dots */}
        <div className="tutorial-dots">
          {STEPS.map((_, i) => (
            <div key={i} className={`tutorial-dot ${i === step ? "active" : i < step ? "done" : ""}`} onClick={() => setStep(i)} />
          ))}
        </div>

        <div className="tutorial-icon">{current.icon}</div>
        <h2 className="tutorial-title">{current.title}</h2>

        <div className="tutorial-content">
          {current.content.trim().split("\n\n").map((para, i) => (
            <p key={i}>{para.trim()}</p>
          ))}
        </div>

        <div className="tutorial-actions">
          <button className="btn" style={{ fontSize: "0.72em" }} onClick={onDismiss}>
            Skip Tutorial
          </button>
          <button className="btn btn-primary" style={{ padding: "10px 24px" }} onClick={handleAction}>
            {current.action} {!isLast && !current.dismiss && "→"}
          </button>
        </div>

        {step > 0 && (
          <button
            className="tutorial-back mono muted"
            onClick={() => setStep(s => s - 1)}
          >
            ← Back
          </button>
        )}
      </div>

      <style>{`
        .tutorial-overlay {
          position: fixed; inset: 0; z-index: 2500;
          background: rgba(0,0,0,0.90);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .tutorial-modal {
          background: var(--bg-surface);
          border: 1px solid var(--amber);
          border-top: 3px solid var(--amber);
          max-width: 500px; width: 100%;
          padding: 28px;
          display: flex; flex-direction: column; gap: 16px;
          box-shadow: 0 0 60px rgba(200,146,42,0.2);
          position: relative;
        }
        .tutorial-dots {
          display: flex; gap: 5px; justify-content: center;
        }
        .tutorial-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--border); cursor: pointer; transition: background 0.2s;
        }
        .tutorial-dot.active { background: var(--amber); }
        .tutorial-dot.done   { background: var(--amber-dim); }
        .tutorial-icon {
          font-size: 2em; text-align: center;
        }
        .tutorial-title {
          font-family: var(--font-display); font-size: 1.2em;
          letter-spacing: 0.15em; text-align: center;
          text-transform: uppercase; color: var(--text-primary);
        }
        .tutorial-content {
          display: flex; flex-direction: column; gap: 10px;
        }
        .tutorial-content p {
          font-family: var(--font-body); font-size: 0.92em;
          line-height: 1.75; color: var(--text-secondary);
        }
        .tutorial-actions {
          display: flex; justify-content: space-between; align-items: center;
          margin-top: 4px;
        }
        .tutorial-back {
          position: absolute; bottom: 10px; left: 16px;
          background: none; border: none; cursor: pointer;
          font-size: 0.65em; letter-spacing: 0.1em;
        }
        .tutorial-back:hover { color: var(--text-secondary); }
      `}</style>
    </div>
  );
}
