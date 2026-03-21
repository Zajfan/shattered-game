// src/data/encounters.js — Police encounter system
// Triggers on failed crimes when heat >= threshold

export const ENCOUNTER_TYPES = {
  FOOT_CHASE:    "foot_chase",
  CAR_PURSUIT:   "car_pursuit",
  STANDOFF:      "standoff",
  ARREST:        "arrest",
  STING:         "sting_operation",
};

// Each encounter: triggered by context, offers escape routes
export const ENCOUNTERS = [
  {
    id: "foot_chase_uniform",
    type: ENCOUNTER_TYPES.FOOT_CHASE,
    title: "Foot Pursuit",
    flavor: "Blue uniforms. Radio chatter. They're close.",
    triggerConditions: { minHeat: 15, crimeCategories: ["Theft", "Robbery"] },
    icon: "🚔",
    realNote: "FBI UCR: 28% of all robbery arrests involve pursuit. NYPD officers pursue on foot ~3,800 times/year.",
    escapeRoutes: [
      {
        id: "run",
        label: "Run for it",
        desc: "Sprint through alleys. Pure speed. Uses stealth + streetSmarts.",
        statChecks: [{ stat: "stealth", weight: 0.4 }, { stat: "streetSmarts", weight: 0.6 }],
        baseSuccessChance: 55,
        outcomes: {
          success: { heatDelta: +5,  healthDelta: -5,  msg: "Lost them in the alleyways. Breathing hard — but free." },
          failure: { heatDelta: +20, healthDelta: -15, arrested: true, msg: "Cornered at a fence. Cuffed. You're going in." },
        },
      },
      {
        id: "blend",
        label: "Blend into the crowd",
        desc: "Slow down, ditch the jacket, walk calmly. Stealth + nerve required.",
        statChecks: [{ stat: "stealth", weight: 0.5 }, { stat: "nerve", weight: 0.5 }],
        baseSuccessChance: 45,
        outcomes: {
          success: { heatDelta: 0,   healthDelta: 0,   msg: "Badge swept right past you. Ice in the veins." },
          failure: { heatDelta: +15, healthDelta: 0,   arrested: true, msg: "Someone pointed you out. Cuffs on in thirty seconds." },
        },
      },
      {
        id: "bribe_patrol",
        label: "Flash cash",
        desc: "Offer a quick bribe. High risk, high reward. Needs connections + $2,000.",
        statChecks: [{ stat: "connections", weight: 0.7 }, { stat: "nerve", weight: 0.3 }],
        cashCost: 2000,
        baseSuccessChance: 38,
        outcomes: {
          success: { heatDelta: -10, healthDelta: 0,   msg: "They pocketed it without a word. You kept walking." },
          failure: { heatDelta: +25, healthDelta: 0,   arrested: true, msg: "Wrong cop. Now it's a bribery charge on top of everything." },
        },
      },
    ],
  },

  {
    id: "car_pursuit_highway",
    type: ENCOUNTER_TYPES.CAR_PURSUIT,
    title: "Vehicle Pursuit",
    flavor: "Lights in the mirror. Pit maneuver incoming.",
    triggerConditions: { minHeat: 25, crimeCategories: ["Theft", "Robbery", "Narcotics"] },
    icon: "🚗",
    realNote: "IACP: 76,000+ police pursuits/year in US. 1 in 100 ends in fatality. Departments increasingly restrict pursuit policy — gives fleeing suspects an edge.",
    escapeRoutes: [
      {
        id: "drive_hard",
        label: "Push it — lose them",
        desc: "Hit residential streets at speed. Wheelman skill essential.",
        statChecks: [{ stat: "dexterity", weight: 0.5 }, { stat: "nerve", weight: 0.5 }],
        baseSuccessChance: 50,
        outcomes: {
          success: { heatDelta: +8,  healthDelta: -10, msg: "Three blocks of chaos and you're clean. Car's dinged up." },
          failure: { heatDelta: +30, healthDelta: -30, arrested: true, msg: "Spike strip. Airbag. Units surrounding the car." },
        },
      },
      {
        id: "bail_on_foot",
        label: "Bail and run",
        desc: "Ditch the car, go on foot. Adds vehicle to evidence.",
        statChecks: [{ stat: "stealth", weight: 0.4 }, { stat: "streetSmarts", weight: 0.6 }],
        baseSuccessChance: 48,
        outcomes: {
          success: { heatDelta: +12, healthDelta: -5,  msg: "Left the car. Clean walk four blocks out. They'll trace the plate — but you're gone." },
          failure: { heatDelta: +20, healthDelta: -20, arrested: true, msg: "K9 unit. Nowhere to go." },
        },
      },
      {
        id: "safe_house",
        label: "Safe house drop",
        desc: "Use a known contact address. Needs connections 35+.",
        statChecks: [{ stat: "connections", weight: 1.0 }],
        statRequirements: { connections: 35 },
        baseSuccessChance: 62,
        outcomes: {
          success: { heatDelta: -5,  healthDelta: 0,   msg: "Rolled into the garage. Door closed. Radio went quiet." },
          failure: { heatDelta: +18, healthDelta: 0,   arrested: true, msg: "Safe house was compromised. Walked into a waiting unit." },
        },
      },
    ],
  },

  {
    id: "armed_standoff",
    type: ENCOUNTER_TYPES.STANDOFF,
    title: "Armed Standoff",
    flavor: "Weapons drawn on both sides. The next move matters.",
    triggerConditions: { minHeat: 50, crimeCategories: ["Robbery", "Violence", "Weapons"] },
    icon: "🔫",
    realNote: "FBI LEO: 48,000+ assaults on law enforcement annually. Most armed standoffs resolve without shots fired — tactical de-escalation is standard protocol.",
    escapeRoutes: [
      {
        id: "comply_lawyer",
        label: "Comply — lawyer up",
        desc: "Hands up. Say nothing. Have a lawyer retainer ready.",
        statChecks: [{ stat: "intelligence", weight: 1.0 }],
        baseSuccessChance: 70,
        outcomes: {
          success: { heatDelta: -20, healthDelta: 0,   arrested: true, reducedSentence: true, msg: "You complied. Lawyer was called. Charges reduced significantly." },
          failure: { heatDelta: +15, healthDelta: 0,   arrested: true, msg: "Complied but they had enough on you already. Full charges." },
        },
      },
      {
        id: "hostage_bluff",
        label: "Bluff your way out",
        desc: "High nerve, high risk. Talk yourself to an exit.",
        statChecks: [{ stat: "nerve", weight: 0.6 }, { stat: "streetSmarts", weight: 0.4 }],
        baseSuccessChance: 25,
        outcomes: {
          success: { heatDelta: +10, healthDelta: -5,  msg: "Walked backward out the door. Disappeared before SWAT arrived." },
          failure: { heatDelta: +40, healthDelta: -35, arrested: true, msg: "Bluff failed. Taser. Down hard. Bleeding. Cuffed." },
        },
      },
      {
        id: "shoot_out",
        label: "Force your way out",
        desc: "Muscle + weapon required. Extreme heat, extreme health risk.",
        statChecks: [{ stat: "muscle", weight: 0.5 }, { stat: "nerve", weight: 0.5 }],
        baseSuccessChance: 20,
        outcomes: {
          success: { heatDelta: +40, healthDelta: -40, msg: "Made it out — barely. Every agency is on you now." },
          failure: { heatDelta: +50, healthDelta: -60, arrested: true, msg: "Multiple hits. Down. Airlifted to county medical — cuffed to the bed." },
        },
      },
    ],
  },

  {
    id: "federal_sting",
    type: ENCOUNTER_TYPES.STING,
    title: "Federal Sting Operation",
    flavor: "The deal was too clean. The buyer had a wire.",
    triggerConditions: { minHeat: 65, crimeCategories: ["Narcotics", "Financial Crime", "Cybercrime"] },
    icon: "🕵️",
    realNote: "DOJ: FBI ran 4,200+ undercover operations in 2022. Drug stings account for 55% of federal drug convictions. Most successful stings run 6–18 months before arrest.",
    escapeRoutes: [
      {
        id: "burn_everything",
        label: "Burn the operation",
        desc: "Cut all ties immediately. Lose the deal, keep your freedom.",
        statChecks: [{ stat: "intelligence", weight: 0.6 }, { stat: "connections", weight: 0.4 }],
        baseSuccessChance: 58,
        outcomes: {
          success: { heatDelta: +5,  healthDelta: 0,   msg: "Gone dark. Burned three contacts. But no cuffs." },
          failure: { heatDelta: +30, healthDelta: 0,   arrested: true, msg: "Too slow. They had backup teams. All exits covered." },
        },
      },
      {
        id: "counter_intelligence",
        label: "Feed them false intel",
        desc: "Tech + intelligence to misdirect the investigation.",
        statChecks: [{ stat: "techSavvy", weight: 0.5 }, { stat: "intelligence", weight: 0.5 }],
        baseSuccessChance: 40,
        outcomes: {
          success: { heatDelta: -15, healthDelta: 0,   msg: "Planted false leads. They chased a ghost for two weeks." },
          failure: { heatDelta: +35, healthDelta: 0,   arrested: true, msg: "They saw through it. Federal charges now include obstruction." },
        },
      },
      {
        id: "flip_associate",
        label: "Give them someone else",
        desc: "Trade up. Give the feds a bigger fish. Honor takes a hit.",
        statChecks: [{ stat: "connections", weight: 0.7 }, { stat: "nerve", weight: 0.3 }],
        baseSuccessChance: 65,
        outcomes: {
          success: { heatDelta: -30, healthDelta: 0,   honorDelta: -25, msg: "You walked. Someone else didn't. Word will get out." },
          failure: { heatDelta: +20, healthDelta: 0,   arrested: true, msg: "The person you tried to flip was already cooperating. You just confessed." },
        },
      },
    ],
  },
];

// Determine if a failed crime triggers an encounter
export const getEncounterForCrime = (crime, player) => {
  const heat = player.heat || 0;
  // Only ~35% of failures trigger encounters (not every fail)
  if (Math.random() > 0.35) return null;

  const eligible = ENCOUNTERS.filter((e) => {
    const cond = e.triggerConditions;
    return heat >= cond.minHeat && cond.crimeCategories.includes(crime.category);
  });

  if (!eligible.length) return null;
  return eligible[Math.floor(Math.random() * eligible.length)];
};

// Resolve an escape route outcome
export const resolveEscapeRoute = (route, player) => {
  let successChance = route.baseSuccessChance;

  // Check stat requirements
  for (const req of Object.entries(route.statRequirements || {})) {
    if ((player.stats?.[req[0]] || 0) < req[1]) {
      return { blocked: true, reason: `Requires ${req[1]} ${req[0]}` };
    }
  }

  // Cash cost
  if (route.cashCost && (player.cash || 0) < route.cashCost) {
    return { blocked: true, reason: `Requires $${route.cashCost.toLocaleString()}` };
  }

  // Stat bonuses
  for (const check of route.statChecks || []) {
    const statVal = player.stats?.[check.stat] || 0;
    // Each 10 points above 20 baseline adds ~2% to success
    const bonus = Math.floor(((statVal - 20) / 10) * 2 * check.weight);
    successChance += bonus;
  }

  successChance = Math.max(5, Math.min(90, successChance));
  const success = Math.random() * 100 <= successChance;
  const outcome = success ? route.outcomes.success : route.outcomes.failure;

  return { success, outcome, successChance, cashCost: route.cashCost || 0 };
};
