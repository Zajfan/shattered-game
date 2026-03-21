// src/data/events.js — NPC event definitions and trigger conditions

export const EVENT_TYPES = {
  INFORMANT_SURFACES: "informant_surfaces",
  UNDERCOVER_STING:   "undercover_sting",
  RIVAL_ATTACK:       "rival_attack",
  LUCKY_BREAK:        "lucky_break",
  FACTION_WAR:        "faction_war",
  POLICE_RAID:        "police_raid",
};

// Each event has: trigger conditions, choices, and outcome effects
export const EVENT_DEFINITIONS = {
  [EVENT_TYPES.INFORMANT_SURFACES]: {
    id:    EVENT_TYPES.INFORMANT_SURFACES,
    title: "Informant Surfaces",
    icon:  "👤",
    severity: "critical",
    // Trigger: has crew, lowest loyalty <= 2
    trigger: (player) =>
      (player.crew?.length || 0) > 0 &&
      Math.min(...(player.crew || []).map((m) => m.loyalty)) <= 2,
    choices: [
      {
        id:    "bribe",
        label: "Pay them off",
        desc:  "Wire $5,000 directly. Buys silence — for now.",
        cost:  { cash: 5000 },
        outcome: { heatDelta: -10, loyaltyBoost: true },
        successMsg: "The money moved. They went quiet. You bought yourself time.",
      },
      {
        id:    "silence",
        label: "Silence them",
        desc:  "Remove the threat permanently. Extreme heat gain.",
        cost:  {},
        outcome: { heatDelta: 25, removeCrew: true, repGain: 10 },
        successMsg: "Problem solved. The kind of solution that creates new problems.",
      },
      {
        id:    "ignore",
        label: "Ignore it",
        desc:  "Hope it blows over. Risky gamble.",
        cost:  {},
        outcome: { heatDelta: 15 },
        successMsg: "You let it ride. The heat ticked up. Maybe they didn't say anything. Maybe they did.",
      },
    ],
  },

  [EVENT_TYPES.UNDERCOVER_STING]: {
    id:    EVENT_TYPES.UNDERCOVER_STING,
    title: "Undercover Operation",
    icon:  "🕵️",
    severity: "critical",
    trigger: (player) => (player.heat || 0) >= 60,
    choices: [
      {
        id:    "go_dark",
        label: "Go dark",
        desc:  "Halt all operations for 72 hours. Heat drops significantly.",
        cost:  {},
        outcome: { heatDelta: -30, cashDelta: 0 },
        successMsg: "You pulled back. They got nothing. Heat fades — for now.",
      },
      {
        id:    "burn_identity",
        label: "Burn the identity",
        desc:  "Spend $8,000 on a new ID and relocation. Big heat drop.",
        cost:  { cash: 8000 },
        outcome: { heatDelta: -50 },
        successMsg: "New face, new name. The agents lost the trail. Cost you — but still breathing.",
      },
      {
        id:    "run_a_test",
        label: "Test them",
        desc:  "Send a patsy to make contact. 50/50: clean lead or you tip your hand.",
        cost:  {},
        outcome: { heatDelta: 20, chanceHeatReduction: { chance: 0.5, amount: -20 } },
        successMsg: "Patsy came back clean. Either they passed — or they're better than you thought.",
      },
    ],
  },

  [EVENT_TYPES.RIVAL_ATTACK]: {
    id:    EVENT_TYPES.RIVAL_ATTACK,
    title: "Rival Crew Moving",
    icon:  "⚔️",
    severity: "high",
    trigger: (player) => (player.ownedDistricts?.length || 0) >= 1,
    choices: [
      {
        id:    "defend",
        label: "Hold the line",
        desc:  "Spend $3,000 to reinforce. Keep your territory.",
        cost:  { cash: 3000 },
        outcome: { heatDelta: 8, keepTerritory: true },
        successMsg: "You held. Blood was shed — but the district is still yours.",
      },
      {
        id:    "counter_attack",
        label: "Counter-attack",
        desc:  "Hit back hard. High risk, could claim their territory.",
        cost:  { cash: 2000 },
        outcome: { heatDelta: 20, gainTerritory: true, chance: 0.55 },
        successMsg: "You went at them first. The gamble paid — for now.",
      },
      {
        id:    "yield",
        label: "Yield the district",
        desc:  "Give up a district. Lose income but preserve crew.",
        cost:  {},
        outcome: { loseDistrict: true, heatDelta: -5 },
        successMsg: "You gave ground. Smart or cowardly — only the outcome decides.",
      },
    ],
  },

  [EVENT_TYPES.LUCKY_BREAK]: {
    id:    EVENT_TYPES.LUCKY_BREAK,
    title: "Lucky Break",
    icon:  "💡",
    severity: "opportunity",
    trigger: (player) => (player.connections || player.stats?.connections || 0) >= 15,
    choices: [
      {
        id:    "take_deal",
        label: "Take the deal",
        desc:  "Commit. You don't know everything — but the money's real.",
        cost:  { cash: 1000 },
        outcome: { cashGain: { min: 5000, max: 25000 }, heatDelta: 5 },
        successMsg: "The deal came through. You're up.",
      },
      {
        id:    "pass",
        label: "Pass",
        desc:  "Walk away. There's always another opportunity.",
        cost:  {},
        outcome: {},
        successMsg: "You passed. Smart — or the biggest mistake of the week.",
      },
    ],
  },

  [EVENT_TYPES.FACTION_WAR]: {
    id:    EVENT_TYPES.FACTION_WAR,
    title: "Faction War Erupts",
    icon:  "🔥",
    severity: "high",
    trigger: (player) => !!player.factionId,
    choices: [
      {
        id:    "fight",
        label: "Fight for your faction",
        desc:  "Go in. Loyalty to the faction. Heat gain, reputation gain.",
        cost:  { cash: 2000 },
        outcome: { heatDelta: 20, repGain: 15 },
        successMsg: "You fought. You're now deeper in than you planned.",
      },
      {
        id:    "stay_neutral",
        label: "Stay out of it",
        desc:  "Let the war play out. Risk faction standing.",
        cost:  {},
        outcome: { heatDelta: 0, repLoss: 5 },
        successMsg: "You watched from the outside. Reputation took a hit — but you're intact.",
      },
      {
        id:    "defect",
        label: "Leave the faction",
        desc:  "Cut ties now. Clean break — but you're on your own.",
        cost:  {},
        outcome: { leaveFaction: true, heatDelta: 5 },
        successMsg: "You walked out. No faction cover now. Just you.",
      },
    ],
  },

  [EVENT_TYPES.POLICE_RAID]: {
    id:    EVENT_TYPES.POLICE_RAID,
    title: "Police Raid",
    icon:  "🚨",
    severity: "critical",
    trigger: (player) => (player.heat || 0) >= 75,
    choices: [
      {
        id:    "run",
        label: "Run",
        desc:  "Bolt before they breach. Success based on stealth + streetSmarts.",
        cost:  {},
        outcome: { heatDelta: 15, chanceEscape: true },
        successMsg: "You were out the back before they were through the front.",
      },
      {
        id:    "lawyer_up",
        label: "Lawyer up immediately",
        desc:  "Say nothing. Costs $10,000 — reduces heat significantly if you have representation.",
        cost:  { cash: 10000 },
        outcome: { heatDelta: -35, arrestRisk: 0.2 },
        successMsg: "Your lawyer had you out in 48 hours. Charges didn't stick. Yet.",
      },
      {
        id:    "comply",
        label: "Comply and cooperate",
        desc:  "Play innocent. Risk: they might find something. Reward: heat reduction.",
        cost:  {},
        outcome: { heatDelta: -15, arrestRisk: 0.4 },
        successMsg: "They searched. They found nothing — this time. Heat cools slightly.",
      },
    ],
  },
};

// Weighted random event selection based on player state
export const selectTriggeredEvent = (player) => {
  const eligible = Object.values(EVENT_DEFINITIONS).filter((e) => e.trigger(player));
  if (eligible.length === 0) return null;

  // Weight critical events higher when heat is elevated
  const weighted = eligible.map((e) => ({
    event:  e,
    weight: e.severity === "critical" ? 3 : e.severity === "high" ? 2 : 1,
  }));

  const totalWeight = weighted.reduce((s, w) => s + w.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const w of weighted) {
    rand -= w.weight;
    if (rand <= 0) return w.event;
  }
  return weighted[0].event;
};
