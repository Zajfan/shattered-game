// Player stats system for Shattered

export const DEFAULT_STATS = {
  // ── Combat / Physical ────────────────────────────────────────────────
  muscle: 10,          // Physical strength, intimidation, melee effectiveness
  nerve: 10,           // Willingness to take risks; affects crime attempt rate

  // ── Mental ───────────────────────────────────────────────────────────
  intelligence: 10,    // Planning, fraud, tech crimes
  streetSmarts: 10,    // Reading situations, avoiding traps, surviving street life
  techSavvy: 5,        // Hacking, cybercrime, device exploitation

  // ── Social ───────────────────────────────────────────────────────────
  connections: 5,      // Network size; access to fences, suppliers, corrupt officials
  reputation: 0,       // Notoriety in the criminal world — opens doors and closes them
  honor: 50,           // Internal faction metric; affects loyalty and betrayal rates

  // ── Operational ──────────────────────────────────────────────────────
  stealth: 5,          // Avoiding detection, surveillance, witnesses
  dexterity: 5,        // Manual skills: lockpicking, pickpocketing, sleight of hand
};

export const STAT_DEFINITIONS = {
  muscle: {
    label: "Muscle",
    icon: "💪",
    description: "Raw physical power. Affects combat outcomes, intimidation, and physical crime success.",
    color: "#e74c3c",
  },
  nerve: {
    label: "Nerve",
    icon: "🎯",
    description: "Audacity under pressure. Higher nerve = lower hesitation penalties on dangerous crimes.",
    color: "#e67e22",
  },
  intelligence: {
    label: "Intelligence",
    icon: "🧠",
    description: "Planning, deduction, and technical understanding. Essential for high-tier financial crimes.",
    color: "#3498db",
  },
  streetSmarts: {
    label: "Street Smarts",
    icon: "👁",
    description: "Reading the environment. Reduces ambush risk and improves escape success rate.",
    color: "#f39c12",
  },
  techSavvy: {
    label: "Tech Savvy",
    icon: "💻",
    description: "Digital skills: hacking, device cloning, cryptocurrency, ransomware deployment.",
    color: "#2ecc71",
  },
  connections: {
    label: "Connections",
    icon: "🕸",
    description: "Your criminal network. Unlocks fences, suppliers, corrupt cops, and gang access.",
    color: "#9b59b6",
  },
  reputation: {
    label: "Reputation",
    icon: "💀",
    description: "Your name in the underworld. Opens faction doors — and makes you a target.",
    color: "#c0392b",
  },
  honor: {
    label: "Honor",
    icon: "⚖️",
    description: "Reliability within your faction. Betrayal destroys it. Actions that hurt allies reduce it.",
    color: "#f1c40f",
  },
  stealth: {
    label: "Stealth",
    icon: "🌑",
    description: "Operational silence. Reduces witness generation, camera detection, and surveillance flags.",
    color: "#2c3e50",
  },
  dexterity: {
    label: "Dexterity",
    icon: "🖐",
    description: "Manual precision. Lockpicking, pickpocketing, weapons handling speed.",
    color: "#1abc9c",
  },
};

export const HEAT_LEVELS = [
  { level: 0, label: "Ghost",     description: "Law enforcement has no record of you.", color: "#2ecc71" },
  { level: 1, label: "Person of Interest", description: "Minor flags on record. Occasional stops.", color: "#f1c40f" },
  { level: 2, label: "Suspect",   description: "Actively monitored. Risk of arrest spikes.", color: "#e67e22" },
  { level: 3, label: "Wanted",    description: "Arrest warrant issued. Police will detain on sight.", color: "#e74c3c" },
  { level: 4, label: "Federal",   description: "FBI/DEA case open. Assets freezable. Travel flagged.", color: "#8e44ad" },
  { level: 5, label: "Interpol",  description: "Red Notice issued. International law enforcement active.", color: "#2c2c2c" },
];

export const DEFAULT_PLAYER = {
  id: null,
  name: "",
  createdAt: null,

  // Resources
  cash: 500,
  dirtyCash: 0,
  crypto: 0,

  // Stats
  stats: { ...DEFAULT_STATS },
  statXP: Object.fromEntries(Object.keys(DEFAULT_STATS).map((k) => [k, 0])),

  // Status
  heat: 0,           // 0–100
  heatLevel: 0,
  energy: 100,       // Replenishes over time
  maxEnergy: 100,
  health: 100,

  // Progression
  level: 1,
  xp: 0,
  xpToNextLevel: 100,

  // Faction
  factionId: null,
  factionRank: null,

  // Inventory
  inventory: [],

  // Crime history
  crimesAttempted: 0,
  crimesSucceeded: 0,
  timesArrested: 0,
  totalEarned: 0,
};

// XP required per stat level (each point of a stat requires cumulative XP)
export const statLevelXP = (currentLevel) => Math.floor(100 * Math.pow(1.15, currentLevel));

// Heat decay rate: -1 heat per 10 minutes of inactivity (game time)
export const HEAT_DECAY_RATE = 0.1; // per minute

// Crime success formula
export const calcSuccessChance = (crime, playerStats) => {
  let base = 100 - crime.baseRisk;

  // Stat bonuses
  if (crime.requiredStats) {
    for (const [stat, required] of Object.entries(crime.requiredStats)) {
      const playerVal = playerStats[stat] || 0;
      if (playerVal >= required) {
        base += Math.floor((playerVal - required) * 0.5);
      } else {
        base -= Math.floor((required - playerVal) * 2);
      }
    }
  }

  // Heat penalty
  // (heat is passed separately in game logic)

  return Math.max(5, Math.min(95, base));
};
