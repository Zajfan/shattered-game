// src/data/worldEvents.js — Dynamic global events triggered server-side

export const WORLD_EVENT_TYPES = {
  FEDERAL_CRACKDOWN:  "federal_crackdown",
  CARTEL_WAR:         "cartel_war",
  MARKET_SURPLUS:     "market_surplus",
  MASS_ARREST:        "mass_arrest",
  GANG_TRUCE:         "gang_truce",
  DARK_WEB_SHUTDOWN:  "dark_web_shutdown",
};

export const WORLD_EVENT_DEFINITIONS = {
  [WORLD_EVENT_TYPES.FEDERAL_CRACKDOWN]: {
    id:       WORLD_EVENT_TYPES.FEDERAL_CRACKDOWN,
    title:    "Federal Crackdown",
    icon:     "🚨",
    color:    "#c0392b",
    desc:     "Joint DEA/FBI task force activated. All crime success rates reduced by 15% for 24 hours. Law enforcement response is heightened globally.",
    duration: 24 * 60 * 60 * 1000,
    effects:  { crimeSuccessMod: -15, heatGainMod: +20 },
    trigger:  "Admin or cumulative threshold: 200+ crimes committed in 1 hour",
    realNote: "Source: DOJ — Operation ONLY ONE (2018) involved 14 federal agencies, resulted in 2,300 arrests in 30 days. Coordinated operations measurably suppress criminal activity.",
    // Player contribution: lay low or help counter by laundering heat
    playerAction: {
      label:    "Go Dark",
      desc:     "Suspend operations for the duration. Earn 'Ghost Protocol' bonus XP.",
      reward:   { xp: 500, heatReduction: 10 },
    },
  },

  [WORLD_EVENT_TYPES.CARTEL_WAR]: {
    id:       WORLD_EVENT_TYPES.CARTEL_WAR,
    title:    "Cartel War",
    icon:     "⚔️",
    color:    "#e67e22",
    desc:     "Sinaloa and CJNG factions are at war. Territory disputes open across multiple cities. High risk, high reward for operators willing to capitalize.",
    duration: 48 * 60 * 60 * 1000,
    effects:  { drugCrimeBonus: +25, territoryIncomeBonus: +30, heatGainMod: +15 },
    trigger:  "5+ players in Sinaloa + 5+ players in CJNG simultaneously",
    realNote: "Source: InSight Crime — Sinaloa-CJNG territorial conflicts caused 60%+ of cartel-related homicides in Mexico 2019–2023. Wars create instability that smaller operators exploit.",
    playerAction: {
      label:    "Exploit the Chaos",
      desc:     "Claim a contested district at 50% discount during the war.",
      reward:   { territoryDiscount: 50, xp: 800 },
    },
  },

  [WORLD_EVENT_TYPES.MARKET_SURPLUS]: {
    id:       WORLD_EVENT_TYPES.MARKET_SURPLUS,
    title:    "Black Market Surplus",
    icon:     "💰",
    color:    "#3d8c5a",
    desc:     "Seized shipments hit the secondary market. All black market items discounted 30% for 12 hours.",
    duration: 12 * 60 * 60 * 1000,
    effects:  { marketDiscount: 30 },
    trigger:  "Random — once per week",
    realNote: "Source: DOJ — seized contraband sometimes enters secondary markets through corrupt officials. USMS auctions generate $250M+ annually.",
    playerAction: {
      label:    "Stock Up",
      desc:     "Buy any item during the event for 30% off.",
      reward:   { discount: 30 },
    },
  },

  [WORLD_EVENT_TYPES.MASS_ARREST]: {
    id:       WORLD_EVENT_TYPES.MASS_ARREST,
    title:    "Mass Arrest Operation",
    icon:     "🚔",
    color:    "#8e44ad",
    desc:     "OCDETF sweep arrests operators globally. All players with heat 70%+ have a 20% chance of automatic arrest. Lasts 6 hours.",
    duration: 6 * 60 * 60 * 1000,
    effects:  { autoArrestRisk: 20, heatThreshold: 70 },
    trigger:  "Total global heat average exceeds 60%",
    realNote: "Source: DEA — OCDETF operations arrest 5,000–8,000 defendants annually. Coordinated sweeps target entire networks simultaneously.",
    playerAction: {
      label:    "Lay Low",
      desc:     "Stop all operations. Heat decays 2× faster during the event.",
      reward:   { heatDecayMultiplier: 2, xp: 200 },
    },
  },

  [WORLD_EVENT_TYPES.GANG_TRUCE]: {
    id:       WORLD_EVENT_TYPES.GANG_TRUCE,
    title:    "Gang Truce",
    icon:     "🕊",
    color:    "#3d8c5a",
    desc:     "Major factions have agreed to a temporary ceasefire. PvP attacks disabled for 24 hours. Faction mission rewards doubled.",
    duration: 24 * 60 * 60 * 1000,
    effects:  { pvpDisabled: true, factionMissionRewardMod: 2 },
    trigger:  "5+ faction war events in 24 hours OR admin triggered",
    realNote: "Source: DOJ Community Violence Intervention — documented gang truces in Baltimore, Chicago, Los Angeles reduce shootings 30–50% during active periods.",
    playerAction: {
      label:    "Honor the Truce",
      desc:     "Complete a faction mission during the truce for 2× rewards.",
      reward:   { missionRewardMod: 2, honorGain: 20 },
    },
  },

  [WORLD_EVENT_TYPES.DARK_WEB_SHUTDOWN]: {
    id:       WORLD_EVENT_TYPES.DARK_WEB_SHUTDOWN,
    title:    "Dark Web Takedown",
    icon:     "💻",
    color:    "#5a7ec8",
    desc:     "Operation Ironclad seizes major dark web infrastructure. All cybercrime success rates drop 20%. Dark Web contacts unavailable for 12 hours.",
    duration: 12 * 60 * 60 * 1000,
    effects:  { cyberCrimeMod: -20, darkWebDisabled: true },
    trigger:  "Random — bi-weekly",
    realNote: "Source: DOJ — Operation Ironclad (2022) seized 50+ dark web markets, arrested 300+ vendors globally. Takedowns temporarily collapse crypto crime infrastructure.",
    playerAction: {
      label:    "Go Physical",
      desc:     "Switch to street-level crimes. Earn +20% on all Tier 1–2 crimes during shutdown.",
      reward:   { tier1CrimeBonus: 20, tier2CrimeBonus: 20, xp: 300 },
    },
  },
};

// Active world event — null or one of the above
// In a real implementation, fetched from server
export const getActiveWorldEvent = (serverWorldData) => {
  if (!serverWorldData?.activeWorldEvent) return null;
  return WORLD_EVENT_DEFINITIONS[serverWorldData.activeWorldEvent] || null;
};
