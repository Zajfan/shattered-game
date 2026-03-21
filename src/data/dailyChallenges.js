// src/data/dailyChallenges.js — Daily challenge system
// Challenges refresh every 24 hours based on a date seed

export const CHALLENGE_POOL = [
  // ── Crime challenges ────────────────────────────────────────────────────
  { id: "dc_crimes_5",        category: "Crime",     label: "Grind",           desc: "Commit 5 crimes successfully.",           rewards: { cash: 3000,  xp: 200 }, check: (p, s) => (p.crimesSucceeded - s.crimesSucceeded) >= 5 },
  { id: "dc_crimes_10",       category: "Crime",     label: "Relentless",      desc: "Commit 10 crimes successfully.",          rewards: { cash: 7000,  xp: 400 }, check: (p, s) => (p.crimesSucceeded - s.crimesSucceeded) >= 10 },
  { id: "dc_tier2",           category: "Crime",     label: "Moving Up",       desc: "Complete a Tier 2+ crime.",               rewards: { cash: 2000,  xp: 150 }, check: (p, s) => p._lastCrimeTier >= 2 },
  { id: "dc_tier3",           category: "Crime",     label: "Organized",       desc: "Complete a Tier 3+ crime.",               rewards: { cash: 5000,  xp: 300 }, check: (p, s) => p._lastCrimeTier >= 3 },
  { id: "dc_no_arrest",       category: "Crime",     label: "Ghost Run",       desc: "Complete 5 crimes with zero arrests.",    rewards: { cash: 4000,  xp: 250 }, check: (p, s) => (p.crimesSucceeded - s.crimesSucceeded) >= 5 && p.timesArrested === s.timesArrested },
  { id: "dc_earn_10k",        category: "Earnings",  label: "Paper Chase",     desc: "Earn $10,000 in dirty cash today.",       rewards: { cash: 2500,  xp: 180 }, check: (p, s) => (p.dirtyCash + p.totalEarned - s.totalEarned) >= 10000 },
  { id: "dc_earn_50k",        category: "Earnings",  label: "Big Score",       desc: "Earn $50,000 in a single session.",       rewards: { cash: 10000, xp: 500 }, check: (p, s) => (p.totalEarned - s.totalEarned) >= 50000 },
  // ── Heat challenges ─────────────────────────────────────────────────────
  { id: "dc_low_heat",        category: "Heat",      label: "Stay Clean",      desc: "Keep heat below 20% all day.",            rewards: { cash: 3000,  xp: 200 }, check: (p, s) => p.heat <= 20 && (p.crimesSucceeded - s.crimesSucceeded) >= 2 },
  { id: "dc_launder",         category: "Heat",      label: "Clean Money",     desc: "Launder $20,000 today.",                  rewards: { cash: 4000,  xp: 180 }, check: (p, s) => (p.totalLaundered - s.totalLaundered) >= 20000 },
  { id: "dc_high_heat_survive", category: "Heat",    label: "Living Dangerously", desc: "Commit 3 crimes while at 60%+ heat.",  rewards: { cash: 6000,  xp: 350 }, check: (p, s) => p._crimesAtHighHeat >= 3 },
  // ── Training challenges ─────────────────────────────────────────────────
  { id: "dc_train_2",         category: "Training",  label: "Stay Sharp",      desc: "Complete 2 training sessions.",           rewards: { cash: 1500,  xp: 200 }, check: (p, s) => (p.trainingLog?.length - (s.trainingLogLen || 0)) >= 2 },
  { id: "dc_train_3",         category: "Training",  label: "Obsessed",        desc: "Complete 3 training sessions.",           rewards: { cash: 3000,  xp: 380 }, check: (p, s) => (p.trainingLog?.length - (s.trainingLogLen || 0)) >= 3 },
  { id: "dc_max_energy",      category: "Training",  label: "Full Tank",       desc: "Recover to full energy.",                 rewards: { cash: 1000,  xp: 100 }, check: (p) => p.energy >= (p.maxEnergy || 100) },
  // ── Territory challenges ────────────────────────────────────────────────
  { id: "dc_claim_district",  category: "Territory", label: "Land Grab",       desc: "Claim a new territory district.",         rewards: { cash: 8000,  xp: 400 }, check: (p, s) => (p.ownedDistricts?.length - s.ownedDistricts) >= 1 },
  { id: "dc_hold_territory",  category: "Territory", label: "Hold It Down",    desc: "Hold 2+ districts without losing any.",   rewards: { cash: 5000,  xp: 300 }, check: (p) => (p.ownedDistricts?.length || 0) >= 2 },
  // ── Crew challenges ─────────────────────────────────────────────────────
  { id: "dc_hire_crew",       category: "Crew",      label: "New Blood",       desc: "Hire a crew member.",                     rewards: { cash: 2000,  xp: 150 }, check: (p, s) => (p.crew?.length - s.crewCount) >= 1 },
  { id: "dc_pay_crew",        category: "Crew",      label: "Loyalty Pays",    desc: "Pay full crew payroll.",                  rewards: { cash: 3000,  xp: 200 }, check: (p) => (p.crew?.length || 0) >= 1 && (p._paidPayrollToday) },
  { id: "dc_full_crew",       category: "Crew",      label: "Full Roster",     desc: "Have 5+ active crew members.",            rewards: { cash: 5000,  xp: 300 }, check: (p) => (p.crew?.length || 0) >= 5 },
  // ── Market challenges ───────────────────────────────────────────────────
  { id: "dc_buy_item",        category: "Market",    label: "Equipped",        desc: "Buy an item from the black market.",      rewards: { cash: 1500,  xp: 100 }, check: (p, s) => (p.inventory?.length - s.inventoryCount) >= 1 },
  { id: "dc_rare_item",       category: "Market",    label: "Rare Find",       desc: "Buy a rare item from the black market.",  rewards: { cash: 8000,  xp: 500 }, check: (p) => (p.inventory || []).some(i => ["ar_pistol","hacking_rig","fake_passport","shell_company_docs"].includes(i.id)) },
  // ── Faction challenges ──────────────────────────────────────────────────
  { id: "dc_faction_mission", category: "Faction",   label: "Soldier",         desc: "Complete a faction mission.",             rewards: { cash: 5000,  xp: 350 }, check: (p, s) => (p.completedMissions?.length - s.missionCount) >= 1 },
  { id: "dc_join_faction",    category: "Faction",   label: "Aligned",         desc: "Join or remain in a faction.",            rewards: { cash: 2000,  xp: 150 }, check: (p) => !!p.factionId },
];

// Seeded random — same 5 challenges per calendar day globally
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export const getDailyChallenges = () => {
  const today = new Date();
  const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const rand = seededRandom(dateSeed);

  const shuffled = [...CHALLENGE_POOL].sort(() => rand() - 0.5);
  return shuffled.slice(0, 5);
};

// Snapshot player state at session start — used to track daily progress
export const snapshotPlayerState = (player) => ({
  crimesSucceeded:  player.crimesSucceeded  || 0,
  timesArrested:    player.timesArrested    || 0,
  totalEarned:      player.totalEarned      || 0,
  totalLaundered:   player.totalLaundered   || 0,
  ownedDistricts:   player.ownedDistricts?.length || 0,
  crewCount:        player.crew?.length     || 0,
  inventoryCount:   player.inventory?.length|| 0,
  missionCount:     player.completedMissions?.length || 0,
  trainingLogLen:   player.trainingLog?.length || 0,
  takenAt:          Date.now(),
  dateKey:          new Date().toDateString(),
});

export const isSameDay = (snapshot) =>
  snapshot?.dateKey === new Date().toDateString();
