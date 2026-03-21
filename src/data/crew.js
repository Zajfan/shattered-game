// Crew system — recruitable NPC archetypes
// Based on real criminal role structures from FBI, DEA, and academic criminology

export const CREW_ROLES = {
  ENFORCER:   "Enforcer",
  WHEELMAN:   "Wheelman",
  HACKER:     "Hacker",
  FIXER:      "Fixer",
  SMUGGLER:   "Smuggler",
  DEALER:     "Street Dealer",
  LOOKOUT:    "Lookout",
  INSIDE_MAN: "Inside Man",
};

export const LOYALTY_LABELS = {
  5: "Ride or Die",
  4: "Solid",
  3: "Reliable",
  2: "Shaky",
  1: "Suspect",
};

// NPC archetypes — randomized names, loyalty, and stats generated on hire
export const CREW_ARCHETYPES = [
  {
    id: "street_enforcer",
    role: CREW_ROLES.ENFORCER,
    description: "Handles muscle work. Intimidation, beatdowns, debt collection. Does what needs doing without asking questions.",
    hiringFee: 1500,
    weeklyCost: 800,
    statContributions: { muscle: 15, nerve: 10, reputation: 5 },
    crimeBonus: {
      street_mugging: 20,
      armed_robbery: 20,
      protection_racket: 25,
      bank_robbery: 15,
      mafia_territory_control: 20,
    },
    requiredStats: { reputation: 15, muscle: 10 },
    loyaltyDecayRisk: 0.05,
    realDataNote: "Source: DOJ — 'muscle' roles in OCGs account for ~30% of arrests. Avg criminal career: 7 years before arrest or death.",
    portraitSeed: "enforcer",
  },
  {
    id: "getaway_driver",
    role: CREW_ROLES.WHEELMAN,
    description: "Expert driver. Can operate under pressure, lose tails, and knows every backroad. Essential for physical heists.",
    hiringFee: 2000,
    weeklyCost: 1000,
    statContributions: { dexterity: 12, nerve: 8, streetSmarts: 10 },
    crimeBonus: {
      car_theft: 25,
      bank_robbery: 20,
      armed_robbery: 15,
      chop_shop: 15,
    },
    requiredStats: { reputation: 10 },
    loyaltyDecayRisk: 0.04,
    realDataNote: "Source: FBI Bank Crime Statistics — 60% of bank robberies involve a getaway vehicle. Professional wheelman significantly reduces capture rate.",
    portraitSeed: "wheelman",
  },
  {
    id: "street_dealer",
    role: CREW_ROLES.DEALER,
    description: "Manages street-level distribution. Has their own corner, their own clients. Cuts your risk exposure.",
    hiringFee: 800,
    weeklyCost: 400,
    statContributions: { streetSmarts: 10, connections: 8, reputation: 3 },
    crimeBonus: {
      drug_dealing_small: 35,
      drug_trafficking_mid: 15,
    },
    requiredStats: { streetSmarts: 10 },
    loyaltyDecayRisk: 0.08,
    realDataNote: "Source: Levitt & Venkatesh (2000) — street dealers avg $3.30/hr after factoring risk. High turnover from arrest/violence. Loyalty is the scarcest resource.",
    portraitSeed: "dealer",
  },
  {
    id: "underground_hacker",
    role: CREW_ROLES.HACKER,
    description: "Dark web native. Handles digital intrusion, identity theft ops, ransomware deployment, and counter-surveillance.",
    hiringFee: 5000,
    weeklyCost: 3000,
    statContributions: { techSavvy: 20, intelligence: 12 },
    crimeBonus: {
      identity_theft: 30,
      cyber_crime_operation: 35,
      fare_evasion_resale: 20,
      money_laundering: 15,
    },
    requiredStats: { intelligence: 20, connections: 15 },
    loyaltyDecayRisk: 0.06,
    realDataNote: "Source: Chainalysis — cybercrime crews average 5–12 members globally. Hackers command premium pay; defection risk is highest among technical specialists.",
    portraitSeed: "hacker",
  },
  {
    id: "fixer",
    role: CREW_ROLES.FIXER,
    description: "Knows everyone, owes nobody. Connects you to buyers, suppliers, dirty lawyers, and corrupt officials. Information broker.",
    hiringFee: 3500,
    weeklyCost: 2000,
    statContributions: { connections: 20, intelligence: 8, reputation: 10 },
    crimeBonus: {
      money_laundering: 20,
      protection_racket: 15,
      drug_trafficking_mid: 15,
      drug_cartel_operation: 10,
    },
    requiredStats: { reputation: 25, connections: 20 },
    loyaltyDecayRisk: 0.05,
    realDataNote: "Source: Europol SOCTA — 'facilitators' are the connective tissue of OCGs. Rarely arrested, rarely visible. When they flip, entire networks collapse.",
    portraitSeed: "fixer",
  },
  {
    id: "smuggler",
    role: CREW_ROLES.SMUGGLER,
    description: "Moves product and people across borders. Has routes, contacts, and experience with customs evasion.",
    hiringFee: 4000,
    weeklyCost: 2500,
    statContributions: { connections: 15, stealth: 12, streetSmarts: 8 },
    crimeBonus: {
      human_smuggling: 30,
      drug_cartel_operation: 25,
      arms_trafficking: 25,
    },
    requiredStats: { connections: 30, reputation: 30 },
    loyaltyDecayRisk: 0.04,
    realDataNote: "Source: IOM — human smugglers charge $3,000–$15,000 per person. Drug mule couriers avg $500–$2,000 per trip. Border specialists are irreplaceable assets.",
    portraitSeed: "smuggler",
  },
  {
    id: "lookout",
    role: CREW_ROLES.LOOKOUT,
    description: "Eyes and ears on the street. Monitors police movement, warns of raids, and manages counter-surveillance. Low cost, high value.",
    hiringFee: 500,
    weeklyCost: 300,
    statContributions: { stealth: 8, streetSmarts: 8 },
    crimeBonus: {
      shoplifting: 15,
      drug_dealing_small: 15,
      pickpocketing: 15,
      chop_shop: 10,
    },
    requiredStats: {},
    loyaltyDecayRisk: 0.10,
    realDataNote: "Source: DEA field reports — lookouts ('halcones' in cartel structure) are typically youngest/lowest paid. Mexico's cartels employ thousands. First to flip when arrested.",
    portraitSeed: "lookout",
  },
  {
    id: "inside_man",
    role: CREW_ROLES.INSIDE_MAN,
    description: "A legitimate employee turned asset — bank teller, port worker, cop, or hotel staff. Provides access and intelligence.",
    hiringFee: 8000,
    weeklyCost: 5000,
    statContributions: { connections: 12, intelligence: 15, stealth: 10 },
    crimeBonus: {
      bank_robbery: 40,
      money_laundering: 25,
      human_smuggling: 20,
      drug_cartel_operation: 15,
    },
    requiredStats: { reputation: 40, connections: 35, intelligence: 30 },
    loyaltyDecayRisk: 0.03,
    realDataNote: "Source: FBI — insider threat cases increased 47% 2020–2023. Financial sector insiders cause avg $1.2M/case. The rarest and most valuable crew member.",
    portraitSeed: "inside_man",
  },
];

// Generate a random NPC of a given archetype
const FIRST_NAMES = ["Marco", "Dre", "Yusuf", "Elena", "Kai", "Ramos", "Sasha", "Damien", "Lena", "Victor", "Nadia", "Felix", "Camille", "Jax", "Rosa", "Ozzie", "Tori", "Benz", "Milo", "Zia"];
const LAST_NAMES  = ["V.", "K.", "Salazar", "Chen", "Novak", "Reeves", "Baptiste", "Orlov", "West", "Nakamura", "Okafor", "Petrov", "Quinn", "Santos", "Volkov"];
const ALIASES     = ["Ghost", "Viper", "Clutch", "Smoke", "Ice", "Razor", "Bones", "Patch", "Spark", "Shade", "Stone", "Flash", "Doc", "Tank", "Wire", "Echo", "Cipher", "Hex", "Drift", "Specter"];

export const generateCrewMember = (archetypeId) => {
  const archetype = CREW_ARCHETYPES.find((a) => a.id === archetypeId);
  if (!archetype) return null;

  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName  = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const alias     = ALIASES[Math.floor(Math.random() * ALIASES.length)];

  return {
    uid: `crew_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    archetypeId,
    role: archetype.role,
    name: `${firstName} "${alias}" ${lastName}`,
    alias,
    loyalty: Math.floor(Math.random() * 2) + 3, // 3–4 on hire (Reliable–Solid)
    morale: 100,
    hiringFee: archetype.hiringFee,
    weeklyCost: archetype.weeklyCost,
    statContributions: archetype.statContributions,
    crimeBonus: archetype.crimeBonus,
    hiredAt: new Date().toISOString(),
    missionsCompleted: 0,
    timesArrested: 0,
    isActive: true,
  };
};

export const getArchetypeById = (id) => CREW_ARCHETYPES.find((a) => a.id === id);
