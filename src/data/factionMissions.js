// src/data/factionMissions.js — Faction-specific missions and rank system

export const FACTION_RANKS = [
  { rank: 0, label: "Associate",    minMissions: 0,  perks: ["Faction protection", "Member discount at black market contacts"] },
  { rank: 1, label: "Soldier",      minMissions: 2,  perks: ["+10% all crime success in faction territory", "Crew loyalty +1"] },
  { rank: 2, label: "Capo",         minMissions: 4,  perks: ["+20% passive territory income", "Access to faction-exclusive crimes", "Crew max +2"] },
  { rank: 3, label: "Underboss",    minMissions: 7,  perks: ["+15% to all stat bonuses", "Faction war protection", "Recruit faction NPCs"] },
  { rank: 4, label: "Boss",         minMissions: 10, perks: ["Control faction territory", "30% cut of all faction earnings", "Interpol resistance +25%"] },
];

export const getRankForMissions = (completed) =>
  [...FACTION_RANKS].reverse().find((r) => completed >= r.minMissions) || FACTION_RANKS[0];

export const getNextRank = (current) =>
  FACTION_RANKS[Math.min(current.rank + 1, FACTION_RANKS.length - 1)];

// Missions keyed by organization ID
export const FACTION_MISSIONS = {
  // ── CRIPS ────────────────────────────────────────────────────────────────
  crips: [
    {
      id: "crips_1", order: 1,
      title: "Corner Establishment",
      desc: "Set up a new distribution point in South Central. Clear out competition and establish a runner network.",
      objectives: ["Complete 3 drug-dealing crimes", "Reach 20 Reputation"],
      checkComplete: (p) => p.crimesSucceeded >= 3 && (p.stats?.reputation || 0) >= 20,
      rewards: { cash: 2000, rep: 10, xp: 100 },
      realNote: "Corner drug distribution networks documented in LAPD CompStat — Crips control ~40% of South LA street dealing.",
    },
    {
      id: "crips_2", order: 2,
      title: "Rival Crew Pressure",
      desc: "Bloods have been pushing into your territory. Demonstrate force through a series of street robberies.",
      objectives: ["Complete 2 street muggings", "Reach 30 Muscle"],
      checkComplete: (p) => (p.stats?.muscle || 0) >= 30 && p.crimesSucceeded >= 5,
      rewards: { cash: 3500, rep: 15, xp: 180 },
      realNote: "LAPD: Crips-Bloods gang conflict documented in 35+ LA neighborhoods. Territory disputes account for 40% of gang-related homicides.",
    },
    {
      id: "crips_3", order: 3,
      title: "Product Distribution",
      desc: "Mid-level distribution run across three neighborhoods. Requires organization and street presence.",
      objectives: ["Complete street-level dealing 5 times", "Own 1 territory district"],
      checkComplete: (p) => (p.ownedDistricts?.length || 0) >= 1 && p.crimesSucceeded >= 8,
      rewards: { cash: 6000, rep: 20, xp: 300 },
      realNote: "DEA: Crips operate sophisticated distribution cells in 42 US states. Hierarchical distribution modeled after corporate supply chains.",
    },
    {
      id: "crips_4", order: 4,
      title: "Police Payroll",
      desc: "Establish a corrupt officer contact to protect operations. You'll need connections and cash.",
      objectives: ["Buy 'Corrupt Officer Contact' from Black Market", "Reach 40 Connections"],
      checkComplete: (p) => (p.inventory || []).some(i => i.id === "corrupt_cop") && (p.stats?.connections || 0) >= 40,
      rewards: { cash: 8000, rep: 25, xp: 450 },
      realNote: "DOJ: 400-500 law enforcement corruption cases prosecuted annually. Gang-linked corruption disproportionately involves patrol officers in high-crime districts.",
    },
    {
      id: "crips_5", order: 5,
      title: "West Coast Expansion",
      desc: "Control two LA districts simultaneously. Prove you run more than a corner.",
      objectives: ["Control 2 LA districts", "Reach Level 6"],
      checkComplete: (p) => {
        const laDistricts = ["la_south_central","la_compton","la_downtown","la_port"];
        const owned = (p.ownedDistricts || []).filter(d => laDistricts.includes(d));
        return owned.length >= 2 && (p.level || 1) >= 6;
      },
      rewards: { cash: 15000, rep: 40, xp: 800, statBonus: { streetSmarts: 3 } },
      realNote: "FBI: Crips territorial influence documented in 35+ LA neighborhoods covering ~120 square miles of metropolitan area.",
    },
  ],

  // ── MS-13 ────────────────────────────────────────────────────────────────
  ms13: [
    {
      id: "ms13_1", order: 1,
      title: "Initiation",
      desc: "Prove your commitment through violence. MS-13 demands nerve above all else.",
      objectives: ["Reach 30 Nerve", "Complete 2 armed robberies"],
      checkComplete: (p) => (p.stats?.nerve || 0) >= 30 && p.crimesAttempted >= 4,
      rewards: { cash: 2500, rep: 20, xp: 150 },
      realNote: "DOJ indictments: MS-13 initiation rituals documented in 22 federal cases. 'Blood in' requirements enforced in most US chapters.",
    },
    {
      id: "ms13_2", order: 2,
      title: "Human Courier Network",
      desc: "Establish a cross-border courier pipeline for the clique's operations.",
      objectives: ["Reach 35 Connections", "Complete human smuggling operation"],
      checkComplete: (p) => (p.stats?.connections || 0) >= 35 && p.crimesSucceeded >= 6,
      rewards: { cash: 8000, rep: 25, xp: 350 },
      realNote: "IOM: MS-13 operates active smuggling routes from Central America through Mexico into the US. CBP interdictions document their infrastructure.",
    },
    {
      id: "ms13_3", order: 3,
      title: "Extortion Collection",
      desc: "Run protection collections across the clique's territory. Fear is the product.",
      objectives: ["Complete 3 protection rackets", "Reach 40 Reputation"],
      checkComplete: (p) => (p.stats?.reputation || 0) >= 40 && p.crimesSucceeded >= 10,
      rewards: { cash: 10000, rep: 30, xp: 500 },
      realNote: "Europol SOCTA: Extortion is MS-13's primary revenue stream in Central America and increasingly in US East Coast cities.",
    },
    {
      id: "ms13_4", order: 4,
      title: "Cartel Alliance",
      desc: "Forge a working relationship with Sinaloa supply. Requires reputation and nerve.",
      objectives: ["Reach 50 Reputation", "Reach 45 Nerve", "Hire 3 crew members"],
      checkComplete: (p) => (p.stats?.reputation || 0) >= 50 && (p.stats?.nerve || 0) >= 45 && (p.crew?.length || 0) >= 3,
      rewards: { cash: 18000, rep: 35, xp: 700, statBonus: { connections: 5 } },
      realNote: "DEA: MS-13 formally allied with Sinaloa Cartel for US distribution in 2018. Alliance formalized in meetings documented by DEA informants.",
    },
    {
      id: "ms13_5", order: 5,
      title: "Territorial Dominance",
      desc: "Control East Coast territory and run a mid-level drug distribution operation.",
      objectives: ["Own 2 districts in any city", "Complete mid-level drug distribution", "Reach Level 7"],
      checkComplete: (p) => (p.ownedDistricts?.length || 0) >= 2 && (p.level || 1) >= 7,
      rewards: { cash: 25000, rep: 50, xp: 1200, statBonus: { nerve: 5, muscle: 3 } },
      realNote: "FBI NGA: MS-13 documented in 40+ US states. Largest presence: Long Island, NY; Northern Virginia; Los Angeles.",
    },
  ],

  // ── GAMBINO FAMILY ───────────────────────────────────────────────────────
  gambino: [
    {
      id: "gambino_1", order: 1,
      title: "Earn Your Keep",
      desc: "Every associate earns before they're introduced. Run a protection route and bring in tribute.",
      objectives: ["Complete 2 protection rackets", "Reach 40 Intelligence"],
      checkComplete: (p) => (p.stats?.intelligence || 0) >= 40 && p.crimesSucceeded >= 5,
      rewards: { cash: 5000, rep: 15, xp: 200 },
      realNote: "FBI files: New Gambino associates required to generate $500–$2,000/wk in tribute before formal introduction. 'Earners' protected; non-earners not.",
    },
    {
      id: "gambino_2", order: 2,
      title: "Labor Racket",
      desc: "Infiltrate a construction union. The Gambinos have run NYC construction since the 1970s.",
      objectives: ["Reach 45 Connections", "Complete a money laundering operation", "Reach Level 6"],
      checkComplete: (p) => (p.stats?.connections || 0) >= 45 && (p.level || 1) >= 6,
      rewards: { cash: 12000, rep: 25, xp: 400 },
      realNote: "NY DA: Gambino-linked labor racketeering generated $40M+/yr in construction corruption. Documented in 47 federal indictments 1985–2023.",
    },
    {
      id: "gambino_3", order: 3,
      title: "Money Moving",
      desc: "Operate a structured laundering pipeline. Clean money is what separates the Mafia from street gangs.",
      objectives: ["Launder $50,000 total", "Own a Shell Company Package", "Reach 50 Intelligence"],
      checkComplete: (p) => (p.totalLaundered || 0) >= 50000 && (p.inventory || []).some(i => i.id === "shell_company_docs") && (p.stats?.intelligence || 0) >= 50,
      rewards: { cash: 20000, rep: 30, xp: 600 },
      realNote: "FinCEN: Gambino family laundered through restaurants, car washes, and waste management firms. FBI Operation Wooden Nickel traced $2M in one case.",
    },
    {
      id: "gambino_4", order: 4,
      title: "Made Man Threshold",
      desc: "The formal introduction requires demonstrated loyalty, earnings, and discretion.",
      objectives: ["Reach 60 Reputation", "Never flipped on faction (no inform events taken)", "Reach Level 8"],
      checkComplete: (p) => (p.stats?.reputation || 0) >= 60 && (p.level || 1) >= 8,
      rewards: { cash: 30000, rep: 40, xp: 900, statBonus: { connections: 5, intelligence: 3 } },
      realNote: "DOJ: Gambino 'making' ceremonies documented in 12 FBI surveillance operations. Formal induction requires Italian heritage (officially) and proven criminal record.",
    },
    {
      id: "gambino_5", order: 5,
      title: "Family Business",
      desc: "Build a full enterprise: territory, crew, and clean money flowing. This is what the Family built.",
      objectives: ["Own 3+ districts", "Have 5+ crew members", "Launder $200,000 total"],
      checkComplete: (p) => (p.ownedDistricts?.length || 0) >= 3 && (p.crew?.length || 0) >= 5 && (p.totalLaundered || 0) >= 200000,
      rewards: { cash: 60000, rep: 60, xp: 2000, statBonus: { intelligence: 5, connections: 5 } },
      realNote: "FBI OCDETF: At peak, Gambino family controlled 12+ major criminal enterprises across NYC metro area. Annual revenue estimated at $500M+.",
    },
  ],

  // ── SINALOA CARTEL ───────────────────────────────────────────────────────
  sinaloa: [
    {
      id: "sinaloa_1", order: 1,
      title: "Plaza Taxes",
      desc: "Collect plaza fees from independent operators in your territory. The Cartel taxes everything.",
      objectives: ["Control 1 territory district", "Reach 55 Street Smarts"],
      checkComplete: (p) => (p.ownedDistricts?.length || 0) >= 1 && (p.stats?.streetSmarts || 0) >= 55,
      rewards: { cash: 10000, rep: 30, xp: 400 },
      realNote: "DEA: Sinaloa Cartel charges 'plaza fees' from all drug traffickers in its territory — 10–30% of shipment value. Non-payment results in seizure or death.",
    },
    {
      id: "sinaloa_2", order: 2,
      title: "Fentanyl Pipeline",
      desc: "Establish a fentanyl distribution route from the border to a major US city.",
      objectives: ["Complete mid-level drug distribution", "Own a Fentanyl supply from market", "Reach 60 Connections"],
      checkComplete: (p) => (p.inventory || []).some(i => i.id === "fentanyl_supply") && (p.stats?.connections || 0) >= 60,
      rewards: { cash: 25000, rep: 40, xp: 700 },
      realNote: "DEA 2023: Sinaloa controls fentanyl supply in 48+ US states. Pipeline routes documented by CBP — primary entry: Sonora-Arizona and Baja-California crossings.",
    },
    {
      id: "sinaloa_3", order: 3,
      title: "Money Abroad",
      desc: "Route cartel proceeds through offshore vehicles. The Cartel cleans billions annually.",
      objectives: ["Launder $150,000 total", "Have Shell Company Package", "Reach Level 9"],
      checkComplete: (p) => (p.totalLaundered || 0) >= 150000 && (p.inventory || []).some(i => i.id === "shell_company_docs") && (p.level || 1) >= 9,
      rewards: { cash: 50000, rep: 45, xp: 1000 },
      realNote: "FinCEN/DOJ: Sinaloa launders through US real estate, cash businesses, and bulk cash smuggling. HSBC fined $1.9B in 2012 for facilitating Sinaloa laundering.",
    },
    {
      id: "sinaloa_4", order: 4,
      title: "Armed Logistics",
      desc: "Source weapons from US black market for cartel operations. Guns move south as drugs move north.",
      objectives: ["Own AR-style pistol", "Hire Smuggler crew member", "Reach 70 Connections"],
      checkComplete: (p) => (p.inventory || []).some(i => i.id === "ar_pistol") && (p.crew || []).some(m => m.role === "Smuggler") && (p.stats?.connections || 0) >= 70,
      rewards: { cash: 40000, rep: 50, xp: 1200, statBonus: { nerve: 5 } },
      realNote: "ATF: 70-90% of guns seized by Mexican authorities with traceable origins come from the US. Iron River of guns traced to FFL dealers in border states.",
    },
    {
      id: "sinaloa_5", order: 5,
      title: "Cartel Tier",
      desc: "Operate at cartel scale. Distribution in multiple cities, financial infrastructure, and military assets.",
      objectives: ["Complete Cartel Supply Chain crime", "Control 4+ districts", "Reach Level 10"],
      checkComplete: (p) => (p.ownedDistricts?.length || 0) >= 4 && (p.level || 1) >= 10,
      rewards: { cash: 150000, rep: 80, xp: 5000, statBonus: { streetSmarts: 5, connections: 8, nerve: 5 } },
      realNote: "DEA: Sinaloa annual revenue estimated at $19-29 billion. Structure operates like a multinational corporation with regional managers, enforcers, and financial specialists.",
    },
  ],

  // ── LOCKBIT ──────────────────────────────────────────────────────────────
  lockbit: [
    {
      id: "lockbit_1", order: 1,
      title: "Affiliate Onboarding",
      desc: "Complete a ransomware deployment. LockBit operates on a RaaS (Ransomware-as-a-Service) affiliate model.",
      objectives: ["Complete identity theft crime", "Reach 50 Tech Savvy"],
      checkComplete: (p) => (p.stats?.techSavvy || 0) >= 50 && p.crimesSucceeded >= 3,
      rewards: { cash: 8000, rep: 20, xp: 300 },
      realNote: "Chainalysis: LockBit runs an affiliate program — developers provide ransomware, affiliates deploy it and keep 80% of ransom. 100+ affiliates documented.",
    },
    {
      id: "lockbit_2", order: 2,
      title: "Target Selection",
      desc: "Identify and infiltrate high-value targets. Hospitals, law firms, and infrastructure are preferred.",
      objectives: ["Own Hacking Rig", "Reach 55 Intelligence", "Complete cyber crime operation"],
      checkComplete: (p) => (p.inventory || []).some(i => i.id === "hacking_rig") && (p.stats?.intelligence || 0) >= 55,
      rewards: { cash: 20000, rep: 30, xp: 500 },
      realNote: "NCA/FBI: LockBit attacked 2,000+ victims in 2023. Target selection focuses on 'big game hunting' — organizations with revenue >$10M and cyber insurance.",
    },
    {
      id: "lockbit_3", order: 3,
      title: "Double Extortion",
      desc: "Exfiltrate and encrypt. If they don't pay for decryption, you publish their data.",
      objectives: ["Complete ransomware campaign crime", "Reach 60 Tech Savvy", "Reach Level 8"],
      checkComplete: (p) => (p.stats?.techSavvy || 0) >= 60 && (p.level || 1) >= 8,
      rewards: { cash: 45000, rep: 35, xp: 800 },
      realNote: "Europol: Double extortion (encrypt + publish threat) adopted by 90% of ransomware groups by 2022. Increases payment rates by ~30%.",
    },
    {
      id: "lockbit_4", order: 4,
      title: "Operational Security",
      desc: "Evade law enforcement manhunts. Operation Cronos disrupted LockBit in 2024 — don't get caught.",
      objectives: ["Own Hacking Rig + Burner Phones", "Reach 65 Stealth", "Launder $100,000"],
      checkComplete: (p) => (p.inventory || []).some(i => i.id === "hacking_rig") && (p.inventory || []).some(i => i.id === "burner_phones") && (p.stats?.stealth || 0) >= 65 && (p.totalLaundered || 0) >= 100000,
      rewards: { cash: 60000, rep: 40, xp: 1200, statBonus: { techSavvy: 5 } },
      realNote: "NCA: Operation Cronos (Feb 2024) seized LockBit's infrastructure, arrested 4 members. The group relaunched within days — OPSEC is existential.",
    },
    {
      id: "lockbit_5", order: 5,
      title: "Top Ransomware Group",
      desc: "Achieve cyber syndicate status. Control digital infrastructure, extort at scale.",
      objectives: ["Complete 2 ransomware campaigns", "Reach Level 10", "Reach 80 Tech Savvy"],
      checkComplete: (p) => (p.stats?.techSavvy || 0) >= 80 && (p.level || 1) >= 10,
      rewards: { cash: 200000, rep: 70, xp: 4000, statBonus: { techSavvy: 8, intelligence: 5 } },
      realNote: "Chainalysis 2024: Ransomware groups extorted $1.1B in 2023. LockBit responsible for 26% of known attacks — most prolific group on record before Operation Cronos.",
    },
  ],
};

// Generic missions for orgs without specific chains
export const GENERIC_MISSIONS = [
  {
    id: "generic_1", order: 1,
    title: "Prove Yourself",
    desc: "Complete 5 crimes and build your reputation within the organization.",
    objectives: ["Complete 5 crimes", "Reach 25 Reputation"],
    checkComplete: (p) => p.crimesSucceeded >= 5 && (p.stats?.reputation || 0) >= 25,
    rewards: { cash: 3000, rep: 15, xp: 150 },
    realNote: "Criminal organizations universally require demonstrated capability before accepting new members.",
  },
  {
    id: "generic_2", order: 2,
    title: "Earn or Leave",
    desc: "Generate consistent income for the organization.",
    objectives: ["Earn $25,000 total", "Reach 35 Connections"],
    checkComplete: (p) => (p.totalEarned || 0) >= 25000 && (p.stats?.connections || 0) >= 35,
    rewards: { cash: 6000, rep: 20, xp: 300 },
    realNote: "DOJ: 'Earners' in OCGs are protected members — non-earners are expendable.",
  },
];

export const getMissionsForFaction = (factionId) =>
  FACTION_MISSIONS[factionId] || GENERIC_MISSIONS;

export const getCompletedMissions = (player) => {
  if (!player?.factionId) return [];
  const missions = getMissionsForFaction(player.factionId);
  return missions.filter((m) => m.checkComplete(player));
};

// ── Additional faction mission chains ────────────────────────────────────
// Injected after initial export to extend FACTION_MISSIONS map

Object.assign(FACTION_MISSIONS, {
  bloods: [
    { id:"bloods_1", order:1, title:"Red Flag", desc:"Establish yourself in Bloods territory. Armed robbery and reputation are your entry ticket.", objectives:["Complete 2 armed robberies","Reach 25 Reputation"], checkComplete:(p)=>(p.stats?.reputation||0)>=25&&p.crimesSucceeded>=4, rewards:{cash:2500,rep:15,xp:120}, realNote:"FBI NGA: Bloods formed 1972, 25,000–30,000 members. Significant East Coast expansion post-2000. Identified by red clothing and numeric codes." },
    { id:"bloods_2", order:2, title:"Territory Tax", desc:"Run protection collections. Bloods tax every hustle in their zone.", objectives:["Complete 3 protection rackets","Reach 30 Muscle"], checkComplete:(p)=>(p.stats?.muscle||0)>=30&&p.crimesSucceeded>=7, rewards:{cash:5000,rep:20,xp:250}, realNote:"NYPD Intel: Bloods-affiliated sets collect taxes from dealers and businesses in East Flatbush, Harlem, Baltimore." },
    { id:"bloods_3", order:3, title:"Drug Pipeline", desc:"Establish distribution between two cities. Bloods leverage national network.", objectives:["Complete drug dealing 5 times","Own 1 territory district"], checkComplete:(p)=>(p.ownedDistricts?.length||0)>=1&&p.crimesSucceeded>=10, rewards:{cash:8000,rep:25,xp:400}, realNote:"DEA: Bloods-affiliated crews documented in 123 US cities. Pipeline routes documented Atlanta north through Baltimore, Philadelphia, NYC." },
    { id:"bloods_4", order:4, title:"Muscle Reputation", desc:"Prove physical dominance. Fear is the product.", objectives:["Reach 50 Muscle","Reach 40 Nerve","Hire an Enforcer"], checkComplete:(p)=>(p.stats?.muscle||0)>=50&&(p.stats?.nerve||0)>=40&&(p.crew||[]).some(m=>m.role==="Enforcer"), rewards:{cash:12000,rep:35,xp:600,statBonus:{muscle:3}}, realNote:"DOJ: Gang-related violent crime accounts for 13% of homicides in high Bloods membership cities." },
    { id:"bloods_5", order:5, title:"East Coast Expansion", desc:"Control territory across two cities. Bloods coast-to-coast network is the advantage.", objectives:["Control districts in 2 different cities","Reach Level 7"], checkComplete:(p)=>{const c=new Set((p.ownedDistricts||[]).map(id=>id.split("_")[0]));return c.size>=2&&(p.level||1)>=7;}, rewards:{cash:20000,rep:45,xp:900,statBonus:{streetSmarts:4,nerve:3}}, realNote:"FBI: Bloods presence documented in 48 states. Prison network spreads organizational structure across facilities and cities." },
  ],

  cjng: [
    { id:"cjng_1", order:1, title:"New Generation", desc:"CJNG demands nerve above all. Prove yours.", objectives:["Reach 45 Nerve","Complete 3 Tier 2+ crimes"], checkComplete:(p)=>(p.stats?.nerve||0)>=45&&p.crimesSucceeded>=5, rewards:{cash:8000,rep:25,xp:350}, realNote:"DEA: CJNG founded 2010, fastest-growing cartel. Led by El Mencho — $10M DEA bounty. Extreme violence used as market entry strategy." },
    { id:"cjng_2", order:2, title:"Port Control", desc:"Establish operations at a major port. CJNG controls Pacific and Gulf entry points.", objectives:["Control a Port district","Reach 50 Connections"], checkComplete:(p)=>{const ports=["la_port","hou_port","balt_port","nyc_jfk","miami_port","atl_airport"];return(p.ownedDistricts||[]).some(d=>ports.includes(d))&&(p.stats?.connections||0)>=50;}, rewards:{cash:20000,rep:35,xp:600}, realNote:"DEA: CJNG controls multiple Mexican ports. CBP seizures up 60% at CJNG-linked US port routes." },
    { id:"cjng_3", order:3, title:"Extreme Leverage", desc:"CJNG's tactics require serious equipment. Arm up.", objectives:["Own AR-style pistol","Reach 60 Nerve","Have 4+ crew"], checkComplete:(p)=>(p.inventory||[]).some(i=>i.id==="ar_pistol")&&(p.stats?.nerve||0)>=60&&(p.crew?.length||0)>=4, rewards:{cash:30000,rep:40,xp:800,statBonus:{nerve:5}}, realNote:"ATF/DEA: CJNG documented using military-grade weapons sourced from US black market and corrupt officials." },
    { id:"cjng_4", order:4, title:"Territory by Force", desc:"CJNG operates in 23 of 32 Mexican states. Replicate the expansion.", objectives:["Control 3+ districts","Reach 70 Reputation"], checkComplete:(p)=>(p.ownedDistricts?.length||0)>=3&&(p.stats?.reputation||0)>=70, rewards:{cash:45000,rep:50,xp:1200}, realNote:"InSight Crime 2024: CJNG fastest territorial expansion of any Mexican cartel. Strategy: infiltrate local gangs then absorb or eliminate them." },
    { id:"cjng_5", order:5, title:"Cartel Supremacy", desc:"Rival Sinaloa. Operate at full cartel scale.", objectives:["Complete Cartel Supply Chain crime","Reach Level 10","Control 4+ districts"], checkComplete:(p)=>(p.ownedDistricts?.length||0)>=4&&(p.level||1)>=10, rewards:{cash:120000,rep:75,xp:4000,statBonus:{nerve:8,muscle:5}}, realNote:"DEA 2023: CJNG now rivals Sinaloa for US market share. Annual revenue estimated $20B+." },
  ],

  yakuza: [
    { id:"yak_1", order:1, title:"Giri — Obligation", desc:"Honor your giri. Complete your first operation.", objectives:["Complete 4 crimes","Reach 35 Honor"], checkComplete:(p)=>p.crimesSucceeded>=4&&(p.stats?.honor||50)>=35, rewards:{cash:4000,rep:15,xp:180}, realNote:"NPA Japan: Yakuza code of honor (ninkyo dantai). Giri-ninjō is the central tension — obligation vs. human feeling." },
    { id:"yak_2", order:2, title:"Underground Economy", desc:"Run an illegal gambling operation. Yamaguchi-gumi built their empire on it.", objectives:["Reach 45 Connections","Reach Level 5","Earn $30,000 total"], checkComplete:(p)=>(p.stats?.connections||0)>=45&&(p.level||1)>=5&&(p.totalEarned||0)>=30000, rewards:{cash:10000,rep:25,xp:380}, realNote:"NPA: Yakuza illegal gambling generates ¥200B+ annually across Japan." },
    { id:"yak_3", order:3, title:"Construction Racket", desc:"Infiltrate construction contracts. Yakuza control significant portions of Japan's building industry.", objectives:["Complete 2 protection rackets","Reach 50 Intelligence","Launder $40,000"], checkComplete:(p)=>(p.stats?.intelligence||0)>=50&&(p.totalLaundered||0)>=40000, rewards:{cash:18000,rep:30,xp:600}, realNote:"NPA/JICA: Yakuza infiltration of construction documented in Kobe, Osaka, Tokyo. Post-disaster reconstruction contracts heavily penetrated." },
    { id:"yak_4", order:4, title:"Sakazuki — Brotherhood", desc:"The formal ceremony of brotherhood. Your loyalty is sealed.", objectives:["Reach 70 Honor","Have 4+ crew","Reach Level 8"], checkComplete:(p)=>(p.stats?.honor||50)>=70&&(p.crew?.length||0)>=4&&(p.level||1)>=8, rewards:{cash:25000,rep:40,xp:900,statBonus:{honor:10,connections:5}}, realNote:"NPA: Yakuza initiation (sakazuki) involves ritual sake exchange symbolizing father-son bond. Recorded in 23 surveillance operations." },
    { id:"yak_5", order:5, title:"Institutional Power", desc:"Yakuza power is institutional, not just physical. Build the empire.", objectives:["Reach 80 Connections","Control 3+ districts","Launder $150,000 total"], checkComplete:(p)=>(p.stats?.connections||0)>=80&&(p.ownedDistricts?.length||0)>=3&&(p.totalLaundered||0)>=150000, rewards:{cash:60000,rep:55,xp:2500,statBonus:{connections:8,intelligence:5}}, realNote:"NPA 2023: Yamaguchi-gumi remains the world's wealthiest criminal organization. Annual revenue estimated at $6.6B across legitimate and illegitimate businesses." },
  ],

  triads: [
    { id:"triad_1", order:1, title:"Sworn In", desc:"Triads initiate through ceremony. Prove your worth first.", objectives:["Reach 30 Intelligence","Complete 4 crimes"], checkComplete:(p)=>(p.stats?.intelligence||0)>=30&&p.crimesSucceeded>=4, rewards:{cash:3000,rep:12,xp:150}, realNote:"Interpol: Triad initiation involves 36 oaths. Historical roots in secret societies. Sun Yee On founded 1919, 25,000–50,000 members globally." },
    { id:"triad_2", order:2, title:"Counterfeit Economy", desc:"Run counterfeit goods. Triads dominate global fake goods trade.", objectives:["Reach 40 Tech Savvy","Buy Stolen Cards","Reach Level 4"], checkComplete:(p)=>(p.stats?.techSavvy||0)>=40&&(p.inventory||[]).some(i=>i.id==="stolen_cards")&&(p.level||1)>=4, rewards:{cash:8000,rep:22,xp:320}, realNote:"Interpol: Counterfeit goods trade generates $461B annually. Triads control 40%+ of fake luxury goods in Asia." },
    { id:"triad_3", order:3, title:"Financial Infiltration", desc:"Use Triad connections to infiltrate legitimate banking.", objectives:["Launder $60,000 total","Reach 55 Intelligence","Have Shell Company docs"], checkComplete:(p)=>(p.totalLaundered||0)>=60000&&(p.stats?.intelligence||0)>=55&&(p.inventory||[]).some(i=>i.id==="shell_company_docs"), rewards:{cash:20000,rep:32,xp:650}, realNote:"FATF: HK-based Triad laundering uses real estate and shell companies. Estimated $10B+ moved annually through legitimate HK financial system." },
    { id:"triad_4", order:4, title:"Cybercrime Cell", desc:"Triads have expanded aggressively into cybercrime. Build the digital arm.", objectives:["Own Hacking Rig","Reach 60 Tech Savvy"], checkComplete:(p)=>(p.inventory||[]).some(i=>i.id==="hacking_rig")&&(p.stats?.techSavvy||0)>=60, rewards:{cash:30000,rep:38,xp:900,statBonus:{techSavvy:5}}, realNote:"Europol EC3: Sun Yee On Triad linked to major cybercrime ops in Southeast Asia. iGaming fraud and CEO fraud documented in 2021-2023 Interpol operations." },
    { id:"triad_5", order:5, title:"Global Network", desc:"Triads are the most geographically distributed criminal organization. Match their reach.", objectives:["Control districts in 3 different cities","Reach Level 9","Reach 75 Connections"], checkComplete:(p)=>{const c=new Set((p.ownedDistricts||[]).map(id=>id.split("_")[0]));return c.size>=3&&(p.level||1)>=9&&(p.stats?.connections||0)>=75;}, rewards:{cash:80000,rep:65,xp:3500,statBonus:{connections:8,intelligence:5,techSavvy:3}}, realNote:"Interpol: Triad presence documented in 58 countries. Unique integration into legitimate diaspora business communities." },
  ],

  hells_angels: [
    { id:"ha_1", order:1, title:"Prospect", desc:"Earn your prospect patch. Muscle and nerve are the only credentials.", objectives:["Reach 35 Muscle","Reach 28 Nerve","Complete 3 crimes"], checkComplete:(p)=>(p.stats?.muscle||0)>=35&&(p.stats?.nerve||0)>=28&&p.crimesSucceeded>=3, rewards:{cash:3500,rep:15,xp:160}, realNote:"ATF: Hells Angels MC has 467 chapters in 59 countries. Prospect period lasts 1+ year. Full patch only awarded after chapter vote." },
    { id:"ha_2", order:2, title:"Chapter Business", desc:"Run the chapter's drug operation.", objectives:["Complete drug dealing 4 times","Reach 40 Connections"], checkComplete:(p)=>(p.stats?.connections||0)>=40&&p.crimesSucceeded>=8, rewards:{cash:9000,rep:22,xp:350}, realNote:"DOJ OCDETF: HAMC designated criminal organization 2003. Drug trafficking — particularly methamphetamine — is primary revenue." },
    { id:"ha_3", order:3, title:"Road Captain", desc:"Lead crew on operations. Coordination and muscle both required.", objectives:["Have 3+ crew","Reach 45 Muscle","Complete a Tier 3 crime"], checkComplete:(p)=>(p.crew?.length||0)>=3&&(p.stats?.muscle||0)>=45&&p.crimesSucceeded>=10, rewards:{cash:15000,rep:28,xp:550,statBonus:{muscle:3}}, realNote:"RCMP: Biker-gang-linked crime in Canada alone generates $300M+ annually across drug, extortion, and stolen property operations." },
    { id:"ha_4", order:4, title:"Full Patch", desc:"The Death's Head patch is earned, never given.", objectives:["Reach 60 Reputation","Control 2+ districts","Reach Level 7"], checkComplete:(p)=>(p.stats?.reputation||0)>=60&&(p.ownedDistricts?.length||0)>=2&&(p.level||1)>=7, rewards:{cash:22000,rep:38,xp:850}, realNote:"ATF: Full patch members are core of HAMC criminal operations. Death's Head trademark fiercely protected — lawsuits filed against unauthorized use." },
    { id:"ha_5", order:5, title:"Chapter Territory", desc:"Establish MC dominance across a region.", objectives:["Control 4+ districts","Have 5+ crew","Reach 75 Reputation"], checkComplete:(p)=>(p.ownedDistricts?.length||0)>=4&&(p.crew?.length||0)>=5&&(p.stats?.reputation||0)>=75, rewards:{cash:50000,rep:55,xp:2200,statBonus:{muscle:5,reputation:5}}, realNote:"DOJ: HAMC chapters function as OCGs with defined territories. Oakland, Sonoma, San Jose chapters documented running overlapping criminal enterprises." },
  ],

  genovese: [
    { id:"gen_1", order:1, title:"Stay Invisible", desc:"Genovese are known for staying out of headlines. Low heat, high earnings.", objectives:["Earn $20,000 while heat below 30%","Reach 35 Intelligence"], checkComplete:(p)=>(p.totalEarned||0)>=20000&&(p.heat||0)<=30&&(p.stats?.intelligence||0)>=35, rewards:{cash:6000,rep:18,xp:250}, realNote:"FBI: Genovese family the most disciplined of the Five Families. Strict rule against public displays — members who draw attention face internal discipline." },
    { id:"gen_2", order:2, title:"Loan Shark Network", desc:"Usury is the family's bread and butter. Build a lending operation.", objectives:["Reach 45 Connections","Earn $50,000 total","Launder $30,000"], checkComplete:(p)=>(p.stats?.connections||0)>=45&&(p.totalEarned||0)>=50000&&(p.totalLaundered||0)>=30000, rewards:{cash:15000,rep:28,xp:500}, realNote:"DOJ: Genovese loan sharking documented in NY, NJ, CT. Vigorish rates 150-500% APR standard." },
    { id:"gen_3", order:3, title:"Union Infiltration", desc:"Genovese have controlled New York labor unions for generations.", objectives:["Reach 55 Intelligence","Reach 50 Connections","Level 7+"], checkComplete:(p)=>(p.stats?.intelligence||0)>=55&&(p.stats?.connections||0)>=50&&(p.level||1)>=7, rewards:{cash:25000,rep:35,xp:700}, realNote:"FBI OCDETF: Genovese infiltration of IBEW, Laborers International, Hotel Workers unions over 40 years. No-show jobs, contract kickbacks generated hundreds of millions." },
    { id:"gen_4", order:4, title:"The Panel", desc:"The Genovese hierarchy is the most sophisticated in organized crime.", objectives:["Reach 65 Intelligence","Reach 60 Connections","Launder $80,000 total"], checkComplete:(p)=>(p.stats?.intelligence||0)>=65&&(p.stats?.connections||0)>=60&&(p.totalLaundered||0)>=80000, rewards:{cash:40000,rep:48,xp:1100,statBonus:{intelligence:5,connections:4}}, realNote:"FBI: Genovese admin uses 'acting boss' system to insulate real boss from prosecution. Makes arrest of leadership extremely difficult." },
    { id:"gen_5", order:5, title:"Most Powerful Family", desc:"The Genovese are the most powerful active American crime family. Prove you belong.", objectives:["Launder $300,000 total","Control 4+ districts","Reach Level 10"], checkComplete:(p)=>(p.totalLaundered||0)>=300000&&(p.ownedDistricts?.length||0)>=4&&(p.level||1)>=10, rewards:{cash:100000,rep:70,xp:4000,statBonus:{intelligence:6,connections:6}}, realNote:"FBI: Genovese annual revenue $100M+. Unique among Five Families for surviving intact through three generations of RICO prosecution." },
  ],

  bratva: [
    { id:"bratva_1", order:1, title:"Vor v Zakone", desc:"Thieves-in-law operate by a strict code. Your record earns entry.", objectives:["Reach 40 Nerve","Commit 5 crimes"], checkComplete:(p)=>(p.stats?.nerve||0)>=40&&p.crimesSucceeded>=5, rewards:{cash:5000,rep:20,xp:220}, realNote:"Europol: Solntsevskaya Bratva ('Solntsevo Brotherhood') — most powerful Russian OCG. Vor v zakone title requires no family, no state cooperation, no legitimate work." },
    { id:"bratva_2", order:2, title:"Obshchak Fund", desc:"Contribute to the common fund that supports imprisoned members.", objectives:["Launder $50,000 total","Reach 50 Connections"], checkComplete:(p)=>(p.totalLaundered||0)>=50000&&(p.stats?.connections||0)>=50, rewards:{cash:12000,rep:28,xp:480}, realNote:"FBI: Russian organized crime obshchak funds documented in Brooklyn, Miami, LA. Used for legal defense, bribing prosecutors, supporting families of incarcerated members." },
    { id:"bratva_3", order:3, title:"Cyber Arm", desc:"Bratva pioneered fusion of traditional organized crime with cybercrime.", objectives:["Own Hacking Rig","Reach 55 Tech Savvy"], checkComplete:(p)=>(p.inventory||[]).some(i=>i.id==="hacking_rig")&&(p.stats?.techSavvy||0)>=55, rewards:{cash:30000,rep:35,xp:800,statBonus:{techSavvy:4}}, realNote:"FBI Cyber Division: Bratva-linked groups responsible for large-scale financial cybercrime. Evil Corp, linked to Bratva, caused $100M+ in losses." },
    { id:"bratva_4", order:4, title:"International Pipeline", desc:"The Brotherhood's strength is its European reach.", objectives:["Control 3+ districts","Reach 65 Connections","Level 8+"], checkComplete:(p)=>(p.ownedDistricts?.length||0)>=3&&(p.stats?.connections||0)>=65&&(p.level||1)>=8, rewards:{cash:50000,rep:48,xp:1300}, realNote:"Europol SOCTA: Solntsevskaya Bratva operates across 50+ countries. Revenue from drug trafficking, cybercrime, and financial fraud estimated at $8.5B annually." },
    { id:"bratva_5", order:5, title:"Thieves World", desc:"Reach the summit of the Russian criminal world.", objectives:["Reach Level 10","Reach 80 Connections","Launder $200,000 total"], checkComplete:(p)=>(p.level||1)>=10&&(p.stats?.connections||0)>=80&&(p.totalLaundered||0)>=200000, rewards:{cash:120000,rep:72,xp:4500,statBonus:{connections:8,techSavvy:5,nerve:5}}, realNote:"Europol: Solntsevskaya Bratva considered world's most powerful OCG by revenue. Operates with near-impunity due to Russian state protection. Controlling billions in assets." },
  ],
});
