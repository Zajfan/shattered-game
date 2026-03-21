import { useState, useMemo } from "react";
import { HEAT_LEVELS } from "../data/playerStats";
import { calcLevel } from "../data/levels";
import { organizations } from "../data/organizations";

// Static real-crime-inspired headlines that rotate as flavor
const WORLD_HEADLINES = [
  { tag: "DEA",      text: "Federal agents seize record 4.2 tons of fentanyl at Sonoran border crossing — Sinaloa supply chain disrupted, analysts say alternative routes emerging." },
  { tag: "FBI",      text: "Operation Glass Ceiling nets 47 arrests across 12 states in coordinated ransomware crackdown — suspects linked to Eastern European syndicate." },
  { tag: "INTERPOL", text: "Red Notice issued for fugitive financier suspected of laundering $2.3B through Cyprus shell network — whereabouts unknown." },
  { tag: "ATF",      text: "'Ghost gun' recoveries hit 45,240 in 2022 — agency cites online parts markets as primary source, legislation pending." },
  { tag: "NYPD",     text: "Organized retail theft rings responsible for $4.4B in annual losses — new task force targets 'booster' networks." },
  { tag: "EUROPOL",  text: "'Ndrangheta boss arrested in Calabria after 15-year fugitive status — anti-mafia commission claims major blow to cocaine supply." },
  { tag: "DOJ",      text: "RICO indictment unsealed against 23 defendants in labor racketeering case — construction union infiltration alleged over 11 years." },
  { tag: "USSS",     text: "Counterfeit currency network disrupted across Southeast — $2.1M in fake bills recovered from storage unit in Memphis." },
  { tag: "CBSA",     text: "Hells Angels chapter assets seized in BC province — real estate, vehicles, and cash totaling $18M under proceeds of crime forfeiture." },
  { tag: "NCA",      text: "Gang intelligence report: County Lines expansion reaches 45 towns — Child criminal exploitation integral to distribution model." },
  { tag: "FINCEN",   text: "Real estate sector flagged for money laundering risk — all-cash purchases under $300K now subject to beneficial ownership disclosure." },
  { tag: "ICE",      text: "Transnational smuggling network dismantled — 38 individuals charged across Texas, Arizona, and California corridors." },
  { tag: "LAPD",     text: "Violent crime down 8% in South LA — gang task force attributes reduction to territory intelligence operations and crew arrests." },
  { tag: "DEA",      text: "Counterfeit M30 pills now contain lethal dose in 6 of 10 tablets — agency issues nationwide advisory as overdose deaths climb." },
  { tag: "RCMP",     text: "Project Royalty concludes with 31 arrests — organized auto theft ring dismantled, 847 vehicles recovered across three provinces." },
];

// Generate player-reactive news based on their state
const generatePlayerNews = (player) => {
  const items = [];
  const name    = player?.name  || "Unknown Subject";
  const heat    = player?.heat  || 0;
  const level   = calcLevel(player?.xp || 0);
  const faction = organizations.find(o => o.id === player?.factionId);
  const heatInfo= HEAT_LEVELS[player?.heatLevel ?? 0];

  if (heat >= 80) {
    items.push({
      tag: "BREAKING",
      urgent: true,
      text: `Suspect known as "${name}" wanted for questioning — law enforcement sources confirm active warrant in effect. Public urged to report sightings.`,
    });
  }

  if (heat >= 60 && heat < 80) {
    items.push({
      tag: "INTEL",
      urgent: false,
      text: `Law enforcement sources indicate surveillance operation targeting unknown subject in connection with recent criminal activity in the metro area.`,
    });
  }

  if (heat >= 95) {
    items.push({
      tag: "FEDERAL",
      urgent: true,
      text: `Federal task force activates in response to escalating criminal activity — joint DEA/FBI operation underway targeting high-priority subject.`,
    });
  }

  if ((player?.ownedDistricts?.length || 0) >= 3) {
    items.push({
      tag: "CRIME INTEL",
      urgent: false,
      text: `Criminal intelligence sources report consolidation of territory in multiple districts — organized criminal presence expanding, community advocates call for increased policing.`,
    });
  }

  if (faction && faction.tier >= 4) {
    items.push({
      tag: "ORG CRIME",
      urgent: false,
      text: `${faction.name} activity reported in region — federal prosecutors monitoring for RICO predicate offenses. Sources indicate recruitment efforts intensifying.`,
    });
  }

  if (level >= 10) {
    items.push({
      tag: "TASK FORCE",
      urgent: false,
      text: `Multi-agency task force formed to address rising organized crime influence — OCDETF designation approved, surveillance resources allocated.`,
    });
  }

  if ((player?.crew?.length || 0) >= 5) {
    items.push({
      tag: "GANG INTEL",
      urgent: false,
      text: `Intelligence sources identify organized crew operating across multiple jurisdictions — leadership structure under investigation.`,
    });
  }

  if ((player?.totalLaundered || 0) >= 100000) {
    items.push({
      tag: "FINCEN",
      urgent: false,
      text: `Suspicious activity reports filed with FinCEN indicate structured financial transactions consistent with money laundering — investigation ongoing.`,
    });
  }

  if ((player?.crimesSucceeded || 0) >= 50) {
    items.push({
      tag: "CRIME STATS",
      urgent: false,
      text: `Police commissioner cites surge in property and acquisitive crime — calls for additional resources after quarterly statistics show significant uptick.`,
    });
  }

  return items;
};

// Seeded date-based headline selection
const getTodaysHeadlines = () => {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  const indices = [];
  let s = seed;
  while (indices.length < 6) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const idx = (s >>> 0) % WORLD_HEADLINES.length;
    if (!indices.includes(idx)) indices.push(idx);
  }
  return indices.map(i => WORLD_HEADLINES[i]);
};

const TAG_COLORS = {
  "BREAKING":   "#c0392b",
  "FEDERAL":    "#8e44ad",
  "INTEL":      "#e67e22",
  "TASK FORCE": "#8e44ad",
  "FINCEN":     "#5a7ec8",
  "ORG CRIME":  "#a85fd4",
  "GANG INTEL": "#c0392b",
  "CRIME INTEL":"#e67e22",
  "CRIME STATS":"#5a5248",
};

export default function NewsFeedPage({ player }) {
  const [filter, setFilter] = useState("all"); // all | player | world

  const playerNews  = useMemo(() => generatePlayerNews(player), [
    player?.heat, player?.ownedDistricts?.length, player?.factionId,
    player?.level, player?.crew?.length, player?.totalLaundered, player?.crimesSucceeded
  ]);
  const worldNews   = useMemo(() => getTodaysHeadlines(), []);

  const allNews = [
    ...playerNews.map(n => ({ ...n, source: "player" })),
    ...worldNews.map(n => ({ ...n, source: "world", tag: n.tag })),
  ];

  const filtered = filter === "all"    ? allNews
                 : filter === "player" ? allNews.filter(n => n.source === "player")
                 : allNews.filter(n => n.source === "world");

  const heatInfo = HEAT_LEVELS[player?.heatLevel ?? 0];
  const today    = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="news-page animate-in">
      <div className="news-masthead">
        <div className="news-title">THE UNDERWORLD DISPATCH</div>
        <div className="news-date mono muted">{today}</div>
        <div className="news-tagline mono muted">Unreported. Unverified. Unavoidable.</div>
      </div>

      {/* Player status banner */}
      <div className="player-status-banner" style={{ borderColor: heatInfo.color }}>
        <div className="mono" style={{ fontSize: "0.62em", letterSpacing: "0.2em", color: heatInfo.color }}>
          STATUS: {heatInfo.label.toUpperCase()} — {player?.heat || 0}% HEAT
        </div>
        <div className="mono muted" style={{ fontSize: "0.65em", marginTop: 2 }}>
          {playerNews.length > 0
            ? `${playerNews.length} active intel item${playerNews.length > 1 ? "s" : ""} relevant to your operations`
            : "No active law enforcement interest in your operations — keep it that way."}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="news-filters">
        {[["all","All Feed"], ["player","Operative Intel"], ["world","World News"]].map(([id, label]) => (
          <button
            key={id}
            className={`news-filter-btn ${filter === id ? "active" : ""}`}
            onClick={() => setFilter(id)}
          >
            {label}
            {id === "player" && playerNews.length > 0 && (
              <span className="news-count">{playerNews.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="news-feed">
        {filtered.length === 0 ? (
          <div className="news-empty">
            <span className="mono muted" style={{ fontSize: "0.8em" }}>No items in this feed.</span>
          </div>
        ) : (
          filtered.map((item, i) => {
            const tagColor = TAG_COLORS[item.tag] || "var(--text-muted)";
            return (
              <div
                key={i}
                className={`news-item ${item.urgent ? "urgent" : ""} ${item.source === "player" ? "player-item" : ""}`}
              >
                <div className="news-item-header">
                  <span className="news-tag" style={{ color: tagColor, borderColor: tagColor }}>
                    {item.urgent && "⚠ "}{item.tag}
                  </span>
                  {item.source === "player" && (
                    <span className="mono" style={{ fontSize: "0.6em", color: "#e67e22", marginLeft: 8 }}>
                      OPERATIVE INTEL
                    </span>
                  )}
                </div>
                <p className="news-text">{item.text}</p>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .news-page { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
        .news-masthead { text-align: center; border: 1px solid var(--border); padding: 16px; background: var(--bg-card); border-top: 3px solid var(--amber); }
        .news-title { font-family: var(--font-display); font-size: 1.6em; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; color: var(--amber); }
        .news-date { font-size: 0.68em; letter-spacing: 0.1em; margin-top: 4px; }
        .news-tagline { font-size: 0.65em; letter-spacing: 0.12em; margin-top: 2px; font-style: italic; }
        .player-status-banner { border: 1px solid; padding: 10px 14px; background: var(--bg-card); }
        .news-filters { display: flex; gap: 4px; }
        .news-filter-btn {
          font-family: var(--font-mono); font-size: 0.72em; text-transform: uppercase;
          letter-spacing: 0.08em; background: transparent; border: 1px solid var(--border);
          color: var(--text-muted); padding: 6px 14px; cursor: pointer; transition: all 0.12s;
          display: flex; align-items: center; gap: 6px;
        }
        .news-filter-btn:hover  { border-color: var(--amber-dim); color: var(--text-secondary); }
        .news-filter-btn.active { border-color: var(--amber); color: var(--amber); background: var(--amber-glow); }
        .news-count { background: #c0392b; color: #fff; font-size: 0.75em; padding: 1px 5px; border-radius: 2px; }
        .news-feed { display: flex; flex-direction: column; gap: 1px; }
        .news-item {
          background: var(--bg-card); border: 1px solid var(--border);
          padding: 12px 15px; display: flex; flex-direction: column; gap: 6px;
          border-left: 3px solid var(--border);
          transition: border-color 0.15s;
        }
        .news-item:hover    { border-color: var(--amber-dim); }
        .news-item.urgent   { border-left-color: #c0392b; background: rgba(192,57,43,0.04); }
        .news-item.player-item { border-left-color: #e67e22; }
        .news-item-header   { display: flex; align-items: center; }
        .news-tag { font-family: var(--font-mono); font-size: 0.62em; letter-spacing: 0.12em; padding: 2px 7px; border: 1px solid; text-transform: uppercase; }
        .news-text { font-family: var(--font-body); font-size: 0.9em; line-height: 1.7; color: var(--text-secondary); }
        .news-empty { background: var(--bg-card); border: 1px dashed var(--border); padding: 40px; display: flex; align-items: center; justify-content: center; }
      `}</style>
    </div>
  );
}
