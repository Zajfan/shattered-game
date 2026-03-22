// src/data/achievements.js — All achievement definitions

export const ACHIEVEMENTS = [
  // ── Crime milestones ──────────────────────────────────────────────────────
  { id: "first_blood",    label: "First Blood",        desc: "Complete your first crime.",                        check: (p) => p.crimesSucceeded >= 1 },
  { id: "hustle_hard",    label: "Hustle Hard",         desc: "Complete 25 crimes successfully.",                  check: (p) => p.crimesSucceeded >= 25 },
  { id: "century",        label: "Century",             desc: "Complete 100 crimes successfully.",                 check: (p) => p.crimesSucceeded >= 100 },
  { id: "ghost",          label: "Ghost",               desc: "Commit 5+ crimes while heat stays below 10%.",      check: (p) => p.heat < 10 && p.crimesSucceeded >= 5 },
  { id: "hot_hundred",    label: "Hot Hundred",         desc: "Reach 100% heat.",                                  check: (p) => p.heat >= 100 },
  { id: "tier5_crime",    label: "The Apex",            desc: "Attempt a Tier 5 crime.",                           check: (p) => (p.tier5Attempts || 0) >= 1 },
  { id: "teflon",         label: "Teflon",              desc: "Commit 10 crimes without a single arrest.",         check: (p) => p.crimesSucceeded >= 10 && p.timesArrested === 0 },
  { id: "high_roller",    label: "High Roller",         desc: "Earn $10,000 from a single crime.",                 check: (p) => (p._lastCrimeEarning || 0) >= 10000 },

  // ── Money milestones ──────────────────────────────────────────────────────
  { id: "street_rat",     label: "Street Rat",          desc: "Earn your first $10,000.",                         check: (p) => p.totalEarned >= 10_000 },
  { id: "paper_chaser",   label: "Paper Chaser",        desc: "Earn $100,000 total.",                             check: (p) => p.totalEarned >= 100_000 },
  { id: "kingpin",        label: "Kingpin",             desc: "Earn $1,000,000 total.",                           check: (p) => p.totalEarned >= 1_000_000 },
  { id: "laundromat",     label: "Laundromat",          desc: "Launder $100,000.",                                check: (p) => (p.totalLaundered || 0) >= 100_000 },
  { id: "el_patron",      label: "El Patrón",           desc: "Launder $1,000,000.",                              check: (p) => (p.totalLaundered || 0) >= 1_000_000 },

  // ── Faction & rank ────────────────────────────────────────────────────────
  { id: "made_man",       label: "Made Man",            desc: "Join a criminal faction.",                         check: (p) => !!p.factionId },
  { id: "el_jefe",        label: "El Jefe",             desc: "Join a Tier 5 organization.",                      check: (p) => ["sinaloa","cjng","ndrangheta","bratva"].includes(p.factionId) },
  { id: "soldier",        label: "Soldier",             desc: "Complete 2 faction missions.",                     check: (p) => (p.completedMissions?.length || 0) >= 2 },
  { id: "capo",           label: "Capo",                desc: "Complete 4 faction missions.",                     check: (p) => (p.completedMissions?.length || 0) >= 4 },
  { id: "boss",           label: "Boss",                desc: "Complete all 5 faction missions.",                 check: (p) => (p.completedMissions?.length || 0) >= 5 },

  // ── Crew ─────────────────────────────────────────────────────────────────
  { id: "the_crew",       label: "The Crew",            desc: "Hire your first crew member.",                     check: (p) => (p.crew?.length || 0) >= 1 },
  { id: "army",           label: "Army",                desc: "Have 5+ active crew members.",                    check: (p) => (p.crew?.length || 0) >= 5 },
  { id: "loyalty_test",   label: "Loyalty Test",        desc: "Have all crew at 4+ loyalty.",                    check: (p) => p.crew?.length > 0 && p.crew.every(m => m.loyalty >= 4) },

  // ── Territory ─────────────────────────────────────────────────────────────
  { id: "turf_war",       label: "Turf War",            desc: "Claim your first territory district.",             check: (p) => (p.ownedDistricts?.length || 0) >= 1 },
  { id: "empire",         label: "Empire",              desc: "Control 5+ districts.",                           check: (p) => (p.ownedDistricts?.length || 0) >= 5 },
  { id: "coast_to_coast", label: "Coast to Coast",      desc: "Control districts in 3 different cities.",        check: (p) => new Set((p.ownedDistricts||[]).map(id=>id.split("_")[0])).size >= 3 },

  // ── Equipment & market ────────────────────────────────────────────────────
  { id: "arms_dealer",    label: "Arms Dealer",         desc: "Own a weapon from the black market.",             check: (p) => (p.inventory||[]).some(i=>["ghost_pistol","sawed_off","ar_pistol","knife"].includes(i.id)) },
  { id: "well_equipped",  label: "Well Equipped",       desc: "Own 5+ items simultaneously.",                   check: (p) => (p.inventory||[]).length >= 5 },
  { id: "clean_hands",    label: "Clean Hands",         desc: "Own a shell company package.",                   check: (p) => (p.inventory||[]).some(i=>i.id==="shell_company_docs") },

  // ── Prison ────────────────────────────────────────────────────────────────
  { id: "conviction",     label: "Conviction",          desc: "Get arrested 3 times.",                           check: (p) => p.timesArrested >= 3 },
  { id: "jailbird",       label: "Jailbird",            desc: "Serve 30 total prison days.",                     check: (p) => (p.prisonDays || 0) >= 30 },

  // ── Encounters & events ───────────────────────────────────────────────────
  { id: "slippery",       label: "Slippery",            desc: "Escape 5 police encounters.",                     check: (p) => (p.encountersEscaped || 0) >= 5 },
  { id: "crisis_managed", label: "Crisis Managed",      desc: "Resolve 10 NPC events.",                         check: (p) => (p.eventsResolved || 0) >= 10 },
];
