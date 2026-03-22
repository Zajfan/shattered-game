// src/data/saveMigration.js — Migrate old player saves to current schema
// Runs once on load; adds any missing fields without resetting progress

import { snapshotPlayerState, isSameDay } from "./dailyChallenges";

export const CURRENT_SAVE_VERSION = 5;

const DEFAULTS = {
  health:               100,
  maxEnergy:            100,
  xp:                   0,
  level:                1,
  inventory:            [],
  crew:                 [],
  ownedDistricts:       [],
  completedMissions:    [],
  trainingLog:          [],
  claimedChallenges:    [],
  usedContactJobs:      {},
  contactTrust:         {},
  unlockedAchievements: [],
  prisonDays:           0,
  prisonSentence:       0,
  totalLaundered:       0,
  tier5Attempts:        0,
  eventsResolved:       0,
  encountersEscaped:    0,
  isInCustody:          false,
  weeklyTerritoryIncome:0,
  activeTraining:       null,
  activeCrimeTimer:     null,
  lastEnergyRegen:      Date.now(),
  lastHeatDecay:        Date.now(),
  lastHealthRegen:      Date.now(),
  lastTerritoryTick:    Date.now(),
};

export function migratePlayer(raw) {
  if (!raw) return null;

  let player = { ...raw };

  // Apply any missing defaults
  for (const [key, def] of Object.entries(DEFAULTS)) {
    if (player[key] === undefined || player[key] === null) {
      player[key] = Array.isArray(def) ? [] : typeof def === "object" && def !== null ? {} : def;
    }
  }

  // Ensure dailySnapshot exists and is fresh
  if (!player.dailySnapshot || !isSameDay(player.dailySnapshot)) {
    player.dailySnapshot = snapshotPlayerState(player);
  }

  // Bump version
  player._saveVersion = CURRENT_SAVE_VERSION;

  // Fix level — recalculate from XP if inconsistent
  // (level was stored as raw value before, now derived from xp)
  // Keep existing level if xp is 0 (old saves)
  if (!player.xp && player.level > 1) {
    // Estimate XP from level for old saves so they don't reset to 1
    const XP_BY_LEVEL = [0, 0, 150, 400, 800, 1500, 2500, 4000, 6000, 9000, 13000,
                          18000, 25000, 35000, 48000, 65000, 85000, 110000, 140000, 175000, 220000];
    player.xp = XP_BY_LEVEL[Math.min(player.level, XP_BY_LEVEL.length - 1)] || 0;
  }

  return player;
}
