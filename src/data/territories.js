// Territory data — real US cities with FBI UCR crime statistics
// Sources: FBI Crime Data Explorer, BJS, NeighborhoodScout, Brennan Center

export const TERRITORY_STATUS = {
  UNCLAIMED:  "Unclaimed",
  CONTROLLED: "Controlled",
  CONTESTED:  "Contested",
  LOCKED:     "Locked",
};

export const DISTRICT_TYPES = {
  RESIDENTIAL: "Residential",
  COMMERCIAL:  "Commercial",
  INDUSTRIAL:  "Industrial",
  PORT:        "Port / Transit",
  FINANCIAL:   "Financial District",
  NIGHTLIFE:   "Nightlife",
};

// Each city has districts. Controlling a district generates passive income
// and unlocks certain crime categories at a bonus.
export const territories = [
  // ══════════════════════════════════════════════════════════════════════════
  // LOS ANGELES
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "la",
    city: "Los Angeles",
    state: "CA",
    nickname: "The City of Angels",
    crimeIndex: 74, // NeighborhoodScout 100 = most dangerous
    fbiViolentCrimeRate: 857, // per 100k (FBI 2022)
    dominantOrgs: ["crips", "bloods", "ms13"],
    realDataNote: "Source: LAPD 2023 — LA had 327 homicides. Gang-related: ~40%. 9 of LA's 10 most dangerous neighborhoods are in South/East LA.",
    districts: [
      {
        id: "la_south_central",
        name: "South Central",
        type: DISTRICT_TYPES.RESIDENTIAL,
        crimeHotspot: true,
        controlledBy: null,
        passiveIncome: 2500,
        incomeType: "Street / Drug",
        crimeBonus: { drug_dealing_small: 20, street_mugging: 15, shoplifting: 10 },
        requiredRep: 15,
        requiredLevel: 1,
        heatModifier: 1.2,
        realDataNote: "Homicide rate ~4x the LA average. Home turf of Crips and Bloods. Gang injunctions cover 40+ square miles.",
      },
      {
        id: "la_compton",
        name: "Compton",
        type: DISTRICT_TYPES.RESIDENTIAL,
        crimeHotspot: true,
        controlledBy: null,
        passiveIncome: 3000,
        incomeType: "Drug / Protection",
        crimeBonus: { drug_dealing_small: 25, protection_racket: 20, drug_trafficking_mid: 15 },
        requiredRep: 25,
        requiredLevel: 2,
        heatModifier: 1.3,
        realDataNote: "Compton PD disbanded 2000. LASD took over. Violent crime rate 5x national average. Known as 'ground zero' of gang culture.",
      },
      {
        id: "la_downtown",
        name: "Downtown / Skid Row",
        type: DISTRICT_TYPES.COMMERCIAL,
        crimeHotspot: false,
        controlledBy: null,
        passiveIncome: 5000,
        incomeType: "Theft / Fraud",
        crimeBonus: { pickpocketing: 20, identity_theft: 15, shoplifting: 15, fare_evasion_resale: 10 },
        requiredRep: 10,
        requiredLevel: 1,
        heatModifier: 0.9,
        realDataNote: "Skid Row has 4,000+ unhoused individuals. Theft and property crime account for 60% of Downtown LA offenses (LAPD CompStat).",
      },
      {
        id: "la_port",
        name: "Port of Los Angeles",
        type: DISTRICT_TYPES.PORT,
        crimeHotspot: false,
        controlledBy: null,
        passiveIncome: 15000,
        incomeType: "Smuggling / Trafficking",
        crimeBonus: { drug_cartel_operation: 30, arms_trafficking: 25, human_smuggling: 20 },
        requiredRep: 60,
        requiredLevel: 8,
        heatModifier: 1.5,
        realDataNote: "Largest seaport in the US — handles ~40% of all US imports. DEA: primary US entry point for Sinaloa/CJNG narcotics.",
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CHICAGO
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "chicago",
    city: "Chicago",
    state: "IL",
    nickname: "The Second City",
    crimeIndex: 83,
    fbiViolentCrimeRate: 943,
    dominantOrgs: ["bloods", "ms13"],
    realDataNote: "Source: CPD 2023 — 618 homicides. Englewood, Austin, and Garfield Park are top hotspots. Chicago has one of the US's highest gang membership rates per capita.",
    districts: [
      {
        id: "chi_englewood",
        name: "Englewood",
        type: DISTRICT_TYPES.RESIDENTIAL,
        crimeHotspot: true,
        controlledBy: null,
        passiveIncome: 2800,
        incomeType: "Drug / Extortion",
        crimeBonus: { drug_dealing_small: 25, protection_racket: 20, street_mugging: 20 },
        requiredRep: 20,
        requiredLevel: 2,
        heatModifier: 1.4,
        realDataNote: "Homicide rate 15x Chicago average. Unemployment ~35%. CPD District 7 (Englewood) logs highest violent crime of all 22 districts.",
      },
      {
        id: "chi_loop",
        name: "The Loop / Financial",
        type: DISTRICT_TYPES.FINANCIAL,
        crimeHotspot: false,
        controlledBy: null,
        passiveIncome: 12000,
        incomeType: "Fraud / Money Laundering",
        crimeBonus: { identity_theft: 25, money_laundering: 20, cyber_crime_operation: 15 },
        requiredRep: 40,
        requiredLevel: 5,
        heatModifier: 0.8,
        realDataNote: "Chicago Mercantile Exchange and Federal Reserve 7th District. High concentration of financial institutions — primary target for sophisticated fraud rings.",
      },
      {
        id: "chi_o_hare",
        name: "O'Hare / Airport Corridor",
        type: DISTRICT_TYPES.PORT,
        crimeHotspot: false,
        controlledBy: null,
        passiveIncome: 9000,
        incomeType: "Trafficking / Smuggling",
        crimeBonus: { human_smuggling: 20, drug_trafficking_mid: 25, car_theft: 15 },
        requiredRep: 45,
        requiredLevel: 6,
        heatModifier: 1.2,
        realDataNote: "O'Hare is a top-5 busiest airport globally. CBP intercepts avg $2M/month in cash and contraband at ORD. Major transit hub for cross-country trafficking.",
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // NEW YORK CITY
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "nyc",
    city: "New York City",
    state: "NY",
    nickname: "The Five Boroughs",
    crimeIndex: 55,
    fbiViolentCrimeRate: 594,
    dominantOrgs: ["gambino", "genovese", "bloods"],
    realDataNote: "Source: NYPD CompStat 2023 — NYC homicides down 12% to 386. Bronx and Brooklyn account for 60%+ of homicides. Five Families still active in construction, sanitation, and ports.",
    districts: [
      {
        id: "nyc_bronx",
        name: "South Bronx",
        type: DISTRICT_TYPES.RESIDENTIAL,
        crimeHotspot: true,
        controlledBy: null,
        passiveIncome: 3500,
        incomeType: "Drug / Street Crime",
        crimeBonus: { drug_dealing_small: 20, street_mugging: 20, armed_robbery: 15 },
        requiredRep: 20,
        requiredLevel: 2,
        heatModifier: 1.2,
        realDataNote: "Mott Haven has NYC's highest concentration of violent crime. Gang activity dominates: Bloods, Crips, and newer sets. NYPD PSA 7 logs 30% of Bronx arrests.",
      },
      {
        id: "nyc_midtown",
        name: "Midtown Manhattan",
        type: DISTRICT_TYPES.COMMERCIAL,
        crimeHotspot: false,
        controlledBy: null,
        passiveIncome: 8000,
        incomeType: "Pickpocket / Fraud",
        crimeBonus: { pickpocketing: 30, identity_theft: 20, shoplifting: 15, fare_evasion_resale: 20 },
        requiredRep: 15,
        requiredLevel: 2,
        heatModifier: 0.9,
        realDataNote: "Times Square alone generates 30,000+ daily police interactions. Highest pickpocketing rate in city — 800,000+ daily foot traffic. MTA loses $690M/yr to fare evasion citywide.",
      },
      {
        id: "nyc_brooklyn_navy",
        name: "Brooklyn / Navy Yard",
        type: DISTRICT_TYPES.INDUSTRIAL,
        crimeHotspot: false,
        controlledBy: null,
        passiveIncome: 6000,
        incomeType: "Chop Shop / Operations",
        crimeBonus: { chop_shop: 25, car_theft: 20, protection_racket: 15 },
        requiredRep: 30,
        requiredLevel: 4,
        heatModifier: 1.0,
        realDataNote: "Historically Gambino/Genovese territory. NYPD recovered 15,000+ stolen vehicles in Brooklyn in 2023. Industrial zones provide cover for chop shops.",
      },
      {
        id: "nyc_wall_street",
        name: "Wall Street / Financial District",
        type: DISTRICT_TYPES.FINANCIAL,
        crimeHotspot: false,
        controlledBy: null,
        passiveIncome: 25000,
        incomeType: "Financial Crime",
        crimeBonus: { money_laundering: 35, identity_theft: 30, cyber_crime_operation: 25 },
        requiredRep: 70,
        requiredLevel: 10,
        heatModifier: 0.7,
        realDataNote: "SEC, CFTC, and SDNY prosecutors make this the most prosecuted white-collar zone on Earth. But also home to the most financial crime — $10B+ in securities fraud/yr.",
      },
      {
        id: "nyc_jfk",
        name: "JFK / Jamaica Bay",
        type: DISTRICT_TYPES.PORT,
        crimeHotspot: false,
        controlledBy: null,
        passiveIncome: 18000,
        incomeType: "Smuggling / Trafficking",
        crimeBonus: { human_smuggling: 25, drug_cartel_operation: 20, arms_trafficking: 20 },
        requiredRep: 55,
        requiredLevel: 7,
        heatModifier: 1.3,
        realDataNote: "Lufthansa Heist (1978) — still one of largest US airport robberies ($5M+). JFK remains a key smuggling gateway. CBP interceptions rose 40% 2021–2023.",
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MIAMI
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "miami",
    city: "Miami",
    state: "FL",
    nickname: "The Magic City",
    crimeIndex: 71,
    fbiViolentCrimeRate: 1066,
    dominantOrgs: ["ms13", "cjng"],
    realDataNote: "Source: FDLE 2023 — Miami-Dade violent crime up 8%. Port of Miami and Miami International Airport are primary narcotics entry points on the East Coast.",
    districts: [
      {
        id: "miami_overtown",
        name: "Overtown / Liberty City",
        type: DISTRICT_TYPES.RESIDENTIAL,
        crimeHotspot: true,
        controlledBy: null,
        passiveIncome: 3000,
        incomeType: "Drug / Street Crime",
        crimeBonus: { drug_dealing_small: 22, street_mugging: 18, armed_robbery: 15 },
        requiredRep: 20,
        requiredLevel: 2,
        heatModifier: 1.3,
        realDataNote: "Overtown has Miami's highest violent crime density. Known as the 'drug corridor' between Liberty City and downtown. Gang rivalries between Miami-based sets.",
      },
      {
        id: "miami_port",
        name: "Port of Miami / Seaport",
        type: DISTRICT_TYPES.PORT,
        crimeHotspot: false,
        controlledBy: null,
        passiveIncome: 20000,
        incomeType: "Cartel / Smuggling",
        crimeBonus: { drug_cartel_operation: 35, human_smuggling: 30, arms_trafficking: 25 },
        requiredRep: 65,
        requiredLevel: 9,
        heatModifier: 1.4,
        realDataNote: "Port of Miami handles 8.5M cruise passengers/yr — ideal for courier operations. DEA seizes avg 30+ tons of cocaine/yr from South Florida ports.",
      },
      {
        id: "miami_brickell",
        name: "Brickell / Financial",
        type: DISTRICT_TYPES.FINANCIAL,
        crimeHotspot: false,
        controlledBy: null,
        passiveIncome: 18000,
        incomeType: "Money Laundering",
        crimeBonus: { money_laundering: 40, cyber_crime_operation: 20 },
        requiredRep: 60,
        requiredLevel: 8,
        heatModifier: 0.6,
        realDataNote: "Miami is historically the #1 money laundering city in the US. 'Cocaine Cowboys' era established real estate/banking laundering networks still active today. FinCEN flags 3x more suspicious transactions here than any other US city.",
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // DETROIT
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "detroit",
    city: "Detroit",
    state: "MI",
    nickname: "Motor City",
    crimeIndex: 89,
    fbiViolentCrimeRate: 1965,
    dominantOrgs: ["bloods"],
    realDataNote: "Source: FBI 2022 — Detroit had the highest violent crime rate of any US city above 100k population for 3 consecutive years. Abandoned infrastructure enables criminal operations.",
    districts: [
      {
        id: "det_eastside",
        name: "East Side",
        type: DISTRICT_TYPES.RESIDENTIAL,
        crimeHotspot: true,
        controlledBy: null,
        passiveIncome: 2200,
        incomeType: "Drug / Armed Robbery",
        crimeBonus: { drug_dealing_small: 20, armed_robbery: 25, car_theft: 20 },
        requiredRep: 15,
        requiredLevel: 1,
        heatModifier: 1.5,
        realDataNote: "East Detroit has 15,000+ abandoned structures — lowest police coverage in city. Drug crews operate openly in some blocks. Car theft rate 3x national average.",
      },
      {
        id: "det_industrial",
        name: "Industrial / Rouge River",
        type: DISTRICT_TYPES.INDUSTRIAL,
        crimeHotspot: false,
        controlledBy: null,
        passiveIncome: 4500,
        incomeType: "Chop Shop / Auto Theft",
        crimeBonus: { chop_shop: 35, car_theft: 30 },
        requiredRep: 25,
        requiredLevel: 3,
        heatModifier: 0.8,
        realDataNote: "NICB: Detroit is the #1 chop shop city in the US. Ford River Rouge Complex area has 200+ known illicit auto operations. Parts exported to Mexico and Canada.",
      },
    ],
  },
];

export const getAllDistricts = () =>
  territories.flatMap((t) => t.districts.map((d) => ({ ...d, city: t.city, cityId: t.id })));

export const getDistrictById = (id) => {
  for (const t of territories) {
    const d = t.districts.find((d) => d.id === id);
    if (d) return { ...d, city: t.city, cityId: t.id };
  }
  return null;
};
