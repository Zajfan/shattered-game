// Player stats system for Shattered

export const DEFAULT_STATS = {
  muscle: 10, nerve: 10, intelligence: 10, streetSmarts: 10,
  techSavvy: 5, connections: 5, reputation: 0, honor: 50,
  stealth: 5, dexterity: 5,
};

export const STAT_DEFINITIONS = {
  muscle:       { label: "Muscle",       icon: "💪", description: "Raw physical power. Affects combat outcomes, intimidation, and physical crime success.", color: "#e74c3c" },
  nerve:        { label: "Nerve",        icon: "🎯", description: "Audacity under pressure. Higher nerve = lower hesitation penalties on dangerous crimes.", color: "#e67e22" },
  intelligence: { label: "Intelligence", icon: "🧠", description: "Planning, deduction, and technical understanding. Essential for high-tier financial crimes.", color: "#3498db" },
  streetSmarts: { label: "Street Smarts",icon: "👁",  description: "Reading the environment. Reduces ambush risk and improves escape success rate.", color: "#f39c12" },
  techSavvy:    { label: "Tech Savvy",   icon: "💻", description: "Digital skills: hacking, device cloning, cryptocurrency, ransomware deployment.", color: "#2ecc71" },
  connections:  { label: "Connections",  icon: "🕸",  description: "Your criminal network. Unlocks fences, suppliers, corrupt cops, and gang access.", color: "#9b59b6" },
  reputation:   { label: "Reputation",   icon: "💀", description: "Your name in the underworld. Opens faction doors — and makes you a target.", color: "#c0392b" },
  honor:        { label: "Honor",        icon: "⚖️", description: "Reliability within your faction. Betrayal destroys it.", color: "#f1c40f" },
  stealth:      { label: "Stealth",      icon: "🌑", description: "Operational silence. Reduces witness generation and surveillance flags.", color: "#2c3e50" },
  dexterity:    { label: "Dexterity",    icon: "🖐",  description: "Manual precision. Lockpicking, pickpocketing, weapons handling speed.", color: "#1abc9c" },
};

export const HEAT_LEVELS = [
  { level: 0, label: "Ghost",              description: "Law enforcement has no record of you.", color: "#2ecc71" },
  { level: 1, label: "Person of Interest", description: "Minor flags on record. Occasional stops.", color: "#f1c40f" },
  { level: 2, label: "Suspect",            description: "Actively monitored. Risk of arrest spikes.", color: "#e67e22" },
  { level: 3, label: "Wanted",             description: "Arrest warrant issued. Police will detain on sight.", color: "#e74c3c" },
  { level: 4, label: "Federal",            description: "FBI/DEA case open. Assets freezable.", color: "#8e44ad" },
  { level: 5, label: "Interpol",           description: "Red Notice issued. International law enforcement active.", color: "#2c2c2c" },
];

export const DEFAULT_PLAYER = {
  id: null, name: "", createdAt: null,
  cash: 500, dirtyCash: 0, crypto: 0,
  stats: { ...DEFAULT_STATS },
  statXP: Object.fromEntries(Object.keys(DEFAULT_STATS).map((k) => [k, 0])),
  heat: 0, heatLevel: 0,
  energy: 100, maxEnergy: 100,
  health: 100,
  level: 1, xp: 0, xpToNextLevel: 150,
  factionId: null, factionRank: null,
  inventory: [],
  crimesAttempted: 0, crimesSucceeded: 0, timesArrested: 0, totalEarned: 0,
};

export const statLevelXP = (currentLevel) => Math.floor(100 * Math.pow(1.15, currentLevel));
export const HEAT_DECAY_RATE = 0.1;

// ── Inventory bonus lookup ───────────────────────────────────────────────────
const INVENTORY_CRIME_BONUSES = {
  ghost_pistol:     { armed_robbery: 15, street_mugging: 10 },
  sawed_off:        { armed_robbery: 25, bank_robbery: 15 },
  ar_pistol:        { bank_robbery: 30, armed_robbery: 20, mafia_territory_control: 15, contract_killing: 20 },
  knife:            { street_mugging: 8, pickpocketing: 3 },
  burner_phones:    { drug_dealing_small: 5, drug_trafficking_mid: 5 },
  lock_pick_set:    { car_theft: 15, chop_shop: 10 },
  relay_attack_kit: { car_theft: 40 },
  hacking_rig:      { identity_theft: 25, cyber_crime_operation: 30, fare_evasion_resale: 15, atm_skimming: 20, crypto_exchange_hack: 25 },
  police_scanner:   { bank_robbery: 10, armed_robbery: 8, chop_shop: 12, cargo_theft: 12 },
  stolen_cards:     { identity_theft: 20, fare_evasion_resale: 25, atm_skimming: 15 },
  fake_id:          { shoplifting: 10, fare_evasion_resale: 8 },
  fake_passport:    { human_smuggling: 20, drug_cartel_operation: 10 },
  shell_company_docs:{ money_laundering: 30, cyber_crime_operation: 15, art_forgery: 20 },
  fentanyl_supply:  { drug_dealing_small: 40, drug_trafficking_mid: 35 },
  cocaine_kilo:     { drug_trafficking_mid: 30, drug_cartel_operation: 25 },
  weed_bulk:        { drug_dealing_small: 20 },
  corrupt_cop:      { armed_robbery: 10, bank_robbery: 10, protection_racket: 15, loan_sharking: 10 },
  counterfeit_cash: { money_laundering: 15, insurance_fraud: 10 },
};

// ── Crew crime bonuses ────────────────────────────────────────────────────────
// Already defined per crew member in crew.js — we sum them here

// ── Master success chance calculator ────────────────────────────────────────
export const calcSuccessChanceFull = (crime, player) => {
  const stats    = player.stats    || {};
  const inventory= player.inventory|| [];
  const crew     = player.crew     || [];
  const heat     = player.heat     || 0;
  const level    = player.level    || 1;

  // Base
  let chance = 100 - crime.baseRisk;

  // 1. Required stat bonuses/penalties
  for (const [stat, required] of Object.entries(crime.requiredStats || {})) {
    const val = stats[stat] || 0;
    if (val >= required) {
      chance += Math.floor((val - required) * 0.5);
    } else {
      chance -= Math.floor((required - val) * 2);
    }
  }

  // 2. Inventory bonuses
  for (const item of inventory) {
    const bonus = INVENTORY_CRIME_BONUSES[item.id]?.[crime.id];
    if (bonus) chance += bonus;
  }

  // 3. Crew bonuses
  for (const member of crew) {
    const bonus = member.crimeBonus?.[crime.id];
    if (bonus) chance += Math.floor(bonus * 0.5); // crew gives 50% of listed bonus
  }

  // 4. Level scaling (+0.5% per level above 1)
  chance += (level - 1) * 0.5;

  // 5. Heat penalty (−1% per 5% heat)
  chance -= Math.floor(heat / 5);

  return Math.max(5, Math.min(95, Math.round(chance)));
};

// Legacy compat
export const calcSuccessChance = (crime, playerStats) => {
  let base = 100 - crime.baseRisk;
  for (const [stat, required] of Object.entries(crime.requiredStats || {})) {
    const val = playerStats[stat] || 0;
    if (val >= required) base += Math.floor((val - required) * 0.5);
    else base -= Math.floor((required - val) * 2);
  }
  return Math.max(5, Math.min(95, base));
};
