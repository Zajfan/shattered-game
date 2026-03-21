// src/data/levels.js — XP thresholds, level unlocks, progression rewards

// XP required to reach each level (cumulative from 0)
export const LEVEL_XP_TABLE = [
  0,      // Lv 1  — start
  150,    // Lv 2
  400,    // Lv 3
  800,    // Lv 4
  1500,   // Lv 5
  2500,   // Lv 6
  4000,   // Lv 7
  6000,   // Lv 8
  9000,   // Lv 9
  13000,  // Lv 10
  18000,  // Lv 11
  25000,  // Lv 12
  35000,  // Lv 13
  48000,  // Lv 14
  65000,  // Lv 15
  85000,  // Lv 16
  110000, // Lv 17
  140000, // Lv 18
  175000, // Lv 19
  220000, // Lv 20
];

export const MAX_LEVEL = LEVEL_XP_TABLE.length;

export const xpForLevel = (level) => LEVEL_XP_TABLE[Math.min(level - 1, MAX_LEVEL - 1)] || 0;
export const xpForNextLevel = (level) => LEVEL_XP_TABLE[Math.min(level, MAX_LEVEL - 1)] || Infinity;

export const calcLevel = (totalXP) => {
  let level = 1;
  for (let i = 1; i < LEVEL_XP_TABLE.length; i++) {
    if (totalXP >= LEVEL_XP_TABLE[i]) level = i + 1;
    else break;
  }
  return Math.min(level, MAX_LEVEL);
};

export const xpProgressInLevel = (totalXP, level) => {
  const start = xpForLevel(level);
  const end   = xpForNextLevel(level);
  if (end === Infinity) return 100;
  return Math.min(100, ((totalXP - start) / (end - start)) * 100);
};

// XP awarded per crime attempt (success only)
export const CRIME_XP = {
  1: 20,   // Tier 1
  2: 50,   // Tier 2
  3: 120,  // Tier 3
  4: 280,  // Tier 4
  5: 600,  // Tier 5
};

// Hard unlocks per level
export const LEVEL_UNLOCKS = {
  1:  { label: "Start",           unlocks: ["Tier 1 crimes", "Basic black market", "Lookout crew slot"] },
  2:  { label: "Street Operator", unlocks: ["Tier 2 crimes", "2nd crew slot", "Street Gang factions"] },
  3:  { label: "Corner Boss",     unlocks: ["Training: Gym", "3rd crew slot", "Tier 2 market items"] },
  4:  { label: "Local Menace",    unlocks: ["Territory claiming", "4th crew slot", "Tier 3 factions"] },
  5:  { label: "Made",            unlocks: ["Tier 3 crimes", "5th crew slot", "Training: Mentor"] },
  6:  { label: "Operator",        unlocks: ["6th crew slot", "Rare market items unlocked", "Faction rank: Soldier"] },
  7:  { label: "Underboss",       unlocks: ["Training: Darknet", "7th crew slot", "More territory districts"] },
  8:  { label: "Crime Boss",      unlocks: ["Tier 4 crimes", "8th crew slot", "Tier 4 factions (Mafia/Syndicate)"] },
  9:  { label: "Syndicate",       unlocks: ["9th crew slot", "Training: Range", "Faction rank: Capo"] },
  10: { label: "Kingpin",         unlocks: ["Tier 5 crimes", "10th crew slot", "All organizations"] },
  12: { label: "Cartel Tier",     unlocks: ["Tier 5 orgs (Sinaloa, CJNG)", "Faction rank: Boss", "Max crew: 15"] },
  15: { label: "Untouchable",     unlocks: ["Full black market", "Max territory", "Interpol status survives"] },
  20: { label: "Legend",          unlocks: ["Prestige mode unlocked", "All content accessible", "Legacy title"] },
};

// Stat bonus on level up (+1 to 2 random stats)
export const LEVELUP_STAT_BONUS = 2;

export const crimeAccessLevel = (crimeTier) => {
  const map = { 1: 1, 2: 2, 3: 5, 4: 8, 5: 10 };
  return map[crimeTier] || 1;
};

export const orgAccessLevel = (orgTier) => {
  const map = { 1: 1, 2: 2, 3: 3, 4: 8, 5: 12 };
  return map[orgTier] || 1;
};

export const maxCrewForLevel = (level) => Math.min(15, Math.max(1, level));
