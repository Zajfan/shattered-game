// src/data/quests/main.js — Main Story Arc: "The Rise"
// 4 chapters, 15 missions. Mechanical gates + AI-generated briefing text.

export const STORY_CHAPTERS = {
  1: { id: 1, title: "The Ground Floor",  subtitle: "Nobody starts at the top.",          levelRange: "1–4",   color: "#3d8c5a" },
  2: { id: 2, title: "Moving Product",    subtitle: "A crew. A territory. A problem.",     levelRange: "5–8",   color: "#5a7ec8" },
  3: { id: 3, title: "Syndicate",         subtitle: "This is where most people break.",    levelRange: "8–12",  color: "#a85fd4" },
  4: { id: 4, title: "The Apex",          subtitle: "At the top, everyone wants you dead.", levelRange: "12–20", color: "#c0392b" },
};

export const MAIN_QUESTS = [

  // ════════════════════════════════════════════════════════════════════════
  // CHAPTER 1 — THE GROUND FLOOR
  // ════════════════════════════════════════════════════════════════════════
  {
    id: "m1_first_score",
    chapter: 1, order: 1,
    title: "First Score",
    type: "main",
    briefingStatic: "Everyone starts somewhere. For you, it starts here — on a corner, with nothing but nerve and the address of a pawn shop that doesn't ask questions. Make your first move.",
    aiPromptHint: "New operative making their first criminal move. Street-level. Nervous. The city doesn't know them yet — but it will.",
    objectives: [
      { desc: "Complete 3 Tier 1 crimes", check: (p) => p.crimesSucceeded >= 3 },
      { desc: "Earn $500 dirty cash",     check: (p) => (p.dirtyCash || 0) >= 500 },
    ],
    requirements: { level: 1 },
    rewards: {
      cash: 1500, xp: 100, rep: 5,
      title: "street_operator",
      statBonus: { streetSmarts: 3 },
      storyUnlock: "Contact: El Chivato becomes available",
      contactUnlock: null,
    },
    realNote: "Source: BJS — 77% of released prisoners are rearrested within 5 years. Most reoffending starts with petty property crimes within 30 days of release.",
  },
  {
    id: "m1_heat_test",
    chapter: 1, order: 2,
    title: "Under Pressure",
    type: "main",
    briefingStatic: "Somebody noticed you. A patrol unit has been circling your block, and word is there's a plainclothes detective asking questions about recent activity. Time to find out if you can move under pressure.",
    aiPromptHint: "Operative being surveilled for the first time. Tests whether they can keep operating under police attention. High tension, early career.",
    objectives: [
      { desc: "Commit 2 crimes while heat is above 25%", check: (p) => p.crimesSucceeded >= 5 && (p.heat || 0) >= 20 },
      { desc: "Reduce heat below 15% without being arrested", check: (p) => (p.heat || 0) < 15 && p.timesArrested === (p._questArrestBaseline || 0) },
    ],
    requirements: { level: 2, completedQuests: ["m1_first_score"] },
    rewards: {
      cash: 3000, xp: 180, rep: 10,
      statBonus: { nerve: 3, stealth: 2 },
      itemUnlock: null,
    },
    realNote: "Source: FBI — 28% of arrested suspects have prior contact with law enforcement in the 6 months before arrest. Pattern recognition drives most street-level arrests.",
  },
  {
    id: "m1_first_contact",
    chapter: 1, order: 3,
    title: "The Introduction",
    type: "main",
    briefingStatic: "Someone wants to meet you. It came through two layers of connection and a burner number — which means it's either a real opportunity or a setup. In this business, you learn to tell the difference. Usually.",
    aiPromptHint: "First major criminal contact wants to meet the operative. Could be an ambush or a genuine alliance offer. The operative has to decide whether to go.",
    objectives: [
      { desc: "Join a criminal faction",               check: (p) => !!p.factionId },
      { desc: "Reach Reputation 20",                   check: (p) => (p.stats?.reputation || 0) >= 20 },
      { desc: "Have at least $1,000 cash",             check: (p) => (p.cash || 0) >= 1000 },
    ],
    requirements: { level: 3, completedQuests: ["m1_heat_test"] },
    rewards: {
      cash: 5000, xp: 250, rep: 15,
      statBonus: { connections: 5 },
      contactUnlock: "el_chivato_chain",
      chapterComplete: 1,
    },
    realNote: "Source: FBI informant protocols — most criminal network entries happen through existing member introduction. Cold approaches account for fewer than 8% of gang recruitments.",
  },

  // ════════════════════════════════════════════════════════════════════════
  // CHAPTER 2 — MOVING PRODUCT
  // ════════════════════════════════════════════════════════════════════════
  {
    id: "m2_build_the_team",
    chapter: 2, order: 1,
    title: "Build the Team",
    type: "main",
    briefingStatic: "You can't scale alone. Every operation that matters requires people — and people require trust, money, and leverage. Start building the apparatus. A crew isn't just hired hands. It's infrastructure.",
    aiPromptHint: "Operative building their first real crew. The shift from lone wolf to organization leader. The weight of other people's livelihoods starts here.",
    objectives: [
      { desc: "Hire 2 crew members",                   check: (p) => (p.crew?.length || 0) >= 2 },
      { desc: "Pay weekly crew payroll at least once",  check: (p) => p._paidPayrollTotal >= 1 },
      { desc: "Reach Level 5",                         check: (p) => (p.level || 1) >= 5 },
    ],
    requirements: { level: 4, completedQuests: ["m1_first_contact"] },
    rewards: {
      cash: 8000, xp: 350, rep: 20,
      statBonus: { connections: 3, muscle: 2 },
    },
    realNote: "Source: Europol SOCTA — average OCG has 6 members. Leadership roles (boss, underboss) represent 15% of membership but account for 60% of organizational decision-making.",
  },
  {
    id: "m2_territory_claim",
    chapter: 2, order: 2,
    title: "Plant the Flag",
    type: "main",
    briefingStatic: "Money from crimes is ceiling-limited. Passive income from territory isn't. Every organization that outlasted its founders controlled ground. You need to plant a flag before someone else plants it on you.",
    aiPromptHint: "Operative claiming their first territory. The difference between a criminal and a criminal organization begins with geography. This is the moment they become an organization.",
    objectives: [
      { desc: "Claim a territory district",             check: (p) => (p.ownedDistricts?.length || 0) >= 1 },
      { desc: "Collect at least one territory payout",  check: (p) => (p.lastIncomeAmount || 0) > 0 },
    ],
    requirements: { level: 5, completedQuests: ["m2_build_the_team"] },
    rewards: {
      cash: 12000, xp: 400, rep: 25,
      statBonus: { reputation: 5 },
      itemUnlock: "ghost_plate",
    },
    realNote: "Source: RAND — criminal organizations with established territory generate 3–7× the revenue of unaffiliated operators. Territory control is the primary predictor of organizational longevity.",
  },
  {
    id: "m2_the_supplier",
    chapter: 2, order: 3,
    title: "The Supplier",
    type: "main",
    briefingStatic: "Your faction needs product. The existing supply chain is expensive and slow. There's a supplier who moves volume — but they only talk to people who've been vouched for, and vouching costs something. Everything costs something.",
    aiPromptHint: "Operative seeking a direct supplier relationship to cut out middlemen. The risk is real — suppliers don't deal with people who attract heat or run loose crews.",
    objectives: [
      { desc: "Reach 40 Connections",                  check: (p) => (p.stats?.connections || 0) >= 40 },
      { desc: "Complete mid-level drug distribution",  check: (p) => p.crimesSucceeded >= 15 },
      { desc: "Have less than 50% heat",               check: (p) => (p.heat || 0) < 50 },
    ],
    requirements: { level: 6, completedQuests: ["m2_territory_claim"] },
    rewards: {
      cash: 18000, xp: 500, rep: 30,
      statBonus: { connections: 5, streetSmarts: 3 },
      contactUnlock: "cartel_logistics",
    },
    realNote: "Source: DEA — supplier relationships in drug trafficking are among the most carefully protected intelligence assets. Access is granted through proven reliability, not negotiation.",
  },
  {
    id: "m2_the_rival",
    chapter: 2, order: 4,
    title: "The Rival",
    type: "main",
    briefingStatic: "They've been around longer. They have more muscle, more contacts, and they just moved into two of your streets. This isn't a warning shot — it's a declaration. How you respond defines what you are.",
    aiPromptHint: "A rival crew has moved aggressively into the operative's territory. The operative must decide between calculated escalation, strategic withdrawal, or a decisive counter-move. Career-defining moment.",
    objectives: [
      { desc: "Control 2+ territory districts",        check: (p) => (p.ownedDistricts?.length || 0) >= 2 },
      { desc: "Have 3+ active crew members",           check: (p) => (p.crew?.length || 0) >= 3 },
      { desc: "Reach Reputation 40",                   check: (p) => (p.stats?.reputation || 0) >= 40 },
    ],
    requirements: { level: 7, completedQuests: ["m2_the_supplier"] },
    rewards: {
      cash: 25000, xp: 650, rep: 35,
      title: "the_connected",
      statBonus: { nerve: 5, muscle: 3 },
      itemUnlock: "encrypted_phone",
      chapterComplete: 2,
    },
    realNote: "Source: FBI National Gang Threat Assessment — inter-gang conflict accounts for 48% of homicides in high-gang-density cities. Most escalations start with territorial encroachment.",
  },

  // ════════════════════════════════════════════════════════════════════════
  // CHAPTER 3 — SYNDICATE
  // ════════════════════════════════════════════════════════════════════════
  {
    id: "m3_the_network",
    chapter: 3, order: 1,
    title: "The Network",
    type: "main",
    briefingStatic: "You've been operating in one city. The people above you operate in twelve. If you want to be taken seriously — if you want the kind of protection that money alone can't buy — you need to think bigger than your current map.",
    aiPromptHint: "Operative attempting to build a multi-city criminal network. The complexity increases exponentially. Trust becomes the scarcest resource.",
    objectives: [
      { desc: "Control districts in 2 different cities",  check: (p) => new Set((p.ownedDistricts||[]).map(id=>id.split("_")[0])).size >= 2 },
      { desc: "Reach Level 8",                             check: (p) => (p.level||1) >= 8 },
      { desc: "Have 4+ crew members",                     check: (p) => (p.crew?.length||0) >= 4 },
    ],
    requirements: { level: 8, completedQuests: ["m2_the_rival"] },
    rewards: {
      cash: 35000, xp: 800, rep: 40,
      statBonus: { connections: 5, intelligence: 3 },
    },
    realNote: "Source: Europol — multi-jurisdictional criminal operations are estimated to be 4× more profitable than single-city operations. The coordination cost is primarily trust, not logistics.",
  },
  {
    id: "m3_the_laundry",
    chapter: 3, order: 2,
    title: "The Laundry",
    type: "main",
    briefingStatic: "Dirty money is a liability. At your scale, the accumulation of unclean cash becomes a vulnerability — forensic accounting, asset seizure, financial surveillance. You need a real laundering operation, not a fence. Architecture, not improvisation.",
    aiPromptHint: "Operative building sophisticated money laundering infrastructure. The shift from small-time fencing to organized financial crime. Mistakes here are federal charges.",
    objectives: [
      { desc: "Launder $100,000 total",                   check: (p) => (p.totalLaundered||0) >= 100000 },
      { desc: "Own a Shell Company Package",              check: (p) => (p.inventory||[]).some(i=>i.id==="shell_company_docs") },
      { desc: "Reach 55 Intelligence",                    check: (p) => (p.stats?.intelligence||0) >= 55 },
    ],
    requirements: { level: 9, completedQuests: ["m3_the_network"] },
    rewards: {
      cash: 50000, xp: 900, rep: 45,
      statBonus: { intelligence: 5, techSavvy: 3 },
    },
    realNote: "Source: FATF — sophisticated laundering operations typically involve 3+ layering steps. Criminals who skip layering are identified in 73% of financial crime prosecutions.",
  },
  {
    id: "m3_the_betrayal",
    chapter: 3, order: 3,
    title: "The Betrayal",
    type: "main",
    briefingStatic: "Someone in your operation is cooperating with federal authorities. You don't know who. You don't know how long it's been going on. But the evidence is there — operations compromised, shipments flagged, arrests that shouldn't have happened. Someone close to you is not what they seem.",
    aiPromptHint: "A trusted associate has been cooperating with federal law enforcement. The operative must identify and neutralize the threat without destroying their organization in the process. Paranoia, loyalty, and ruthlessness collide.",
    objectives: [
      { desc: "Survive 2 police encounters",              check: (p) => (p.encountersEscaped||0) >= 2 },
      { desc: "Reach 60 Reputation",                     check: (p) => (p.stats?.reputation||0) >= 60 },
      { desc: "Complete 2 faction missions",              check: (p) => (p.completedMissions?.length||0) >= 2 },
    ],
    requirements: { level: 10, completedQuests: ["m3_the_laundry"] },
    rewards: {
      cash: 60000, xp: 1100, rep: 50,
      statBonus: { nerve: 5, stealth: 5, streetSmarts: 3 },
      itemUnlock: "federal_informant_file",
    },
    realNote: "Source: DOJ — 15,000+ active federal confidential informants at any time. 'Flipping' associates is the FBI's primary tool for dismantling OCGs — 80% of RICO convictions rely on cooperating witnesses.",
  },
  {
    id: "m3_the_war",
    chapter: 3, order: 4,
    title: "Faction War",
    type: "main",
    briefingStatic: "The truce is over. Three weeks of silence, then two of your districts hit in the same night. Your faction is in open conflict. There's no neutral ground now — only the outcome, and what you're willing to do to determine it.",
    aiPromptHint: "Full faction war. The operative's organization is fighting for survival. Every resource, every contact, every piece of territory is in play. This defines whether they become a footnote or a chapter.",
    objectives: [
      { desc: "Control 3+ districts simultaneously",     check: (p) => (p.ownedDistricts?.length||0) >= 3 },
      { desc: "Have 5+ crew at Solid loyalty or above",  check: (p) => (p.crew||[]).filter(m=>m.loyalty>=3).length >= 5 },
      { desc: "Reach Level 11",                          check: (p) => (p.level||1) >= 11 },
    ],
    requirements: { level: 10, completedQuests: ["m3_the_betrayal"] },
    rewards: {
      cash: 80000, xp: 1400, rep: 60,
      title: "syndicate_player",
      statBonus: { reputation: 8, nerve: 5 },
      itemUnlock: "cartel_contact",
      contactUnlock: "cartel_logistics",
      chapterComplete: 3,
    },
    realNote: "Source: InSight Crime — gang wars in urban areas increase local homicide rates by 30–45% during active conflict periods. Winners consolidate territory; losers dissolve or absorb.",
  },

  // ════════════════════════════════════════════════════════════════════════
  // CHAPTER 4 — THE APEX
  // ════════════════════════════════════════════════════════════════════════
  {
    id: "m4_the_federal_case",
    chapter: 4, order: 1,
    title: "The Federal Case",
    type: "main",
    briefingStatic: "A federal prosecutor has opened a RICO case with your name on it. Not a city case — federal. That means wiretaps that have been running for months, financial forensics, cooperating witnesses you don't know about yet. This is the endgame — for them or for you.",
    aiPromptHint: "Federal RICO prosecution targeting the operative. The stakes are maximum security and decades of time. The operative must neutralize the case — legally, financially, or otherwise — before it reaches indictment.",
    objectives: [
      { desc: "Launder $300,000 total",                  check: (p) => (p.totalLaundered||0) >= 300000 },
      { desc: "Reach Level 12",                          check: (p) => (p.level||1) >= 12 },
      { desc: "Have a Lawyer Retainer in inventory",     check: (p) => (p.inventory||[]).some(i=>i.id==="lawyer_retainer") },
    ],
    requirements: { level: 11, completedQuests: ["m3_the_war"] },
    rewards: {
      cash: 100000, xp: 1600, rep: 65,
      statBonus: { intelligence: 5, connections: 5 },
    },
    realNote: "Source: DOJ — RICO convictions carry average sentences of 19.6 years. The Act has been used against the Gambino family (1992), MS-13 leadership (2016-2023), and dozens of other OCGs since 1970.",
  },
  {
    id: "m4_state_capture",
    chapter: 4, order: 2,
    title: "The Purchase",
    type: "main",
    briefingStatic: "There's a state senator who needs money more than he needs his conscience. There's a police commissioner whose retirement fund has some gaps. There are judges, mayors, prosecutors — all of them with a price, and all of them useful. This is how empires survive long enough to become institutions.",
    aiPromptHint: "Operative systematically corrupting public officials to protect their criminal enterprise. The corruption of institutions — judiciary, law enforcement, legislature. The most dangerous crime in the game.",
    objectives: [
      { desc: "Reach 75 Connections",                    check: (p) => (p.stats?.connections||0) >= 75 },
      { desc: "Have $500,000+ total earned",             check: (p) => (p.totalEarned||0) >= 500000 },
      { desc: "Buy Corrupt Officer Contact from Market", check: (p) => (p.inventory||[]).some(i=>i.id==="corrupt_cop") },
    ],
    requirements: { level: 13, completedQuests: ["m4_the_federal_case"] },
    rewards: {
      cash: 150000, xp: 2000, rep: 70,
      statBonus: { connections: 8, intelligence: 5 },
      contactUnlock: "state_senator",
    },
    realNote: "Source: Transparency International — state capture by organized crime documented in 30+ countries. Mexico's INAI found cartel bribes account for 8% of government official salaries on average.",
  },
  {
    id: "m4_the_empire",
    chapter: 4, order: 3,
    title: "The Empire",
    type: "main",
    briefingStatic: "You control territory across multiple cities. You have a network of officials. You have a crew that operates at scale. The question now isn't whether you can survive — it's what you build. Because organizations that stop expanding start dying. What does your empire look like?",
    aiPromptHint: "Operative at the height of their power, consolidating an empire. The moment where criminal activity transitions into something that outlasts any individual. Legacy vs. exposure.",
    objectives: [
      { desc: "Control 5+ districts",                    check: (p) => (p.ownedDistricts?.length||0) >= 5 },
      { desc: "Have 8+ crew members",                    check: (p) => (p.crew?.length||0) >= 8 },
      { desc: "Reach Level 15",                          check: (p) => (p.level||1) >= 15 },
    ],
    requirements: { level: 14, completedQuests: ["m4_state_capture"] },
    rewards: {
      cash: 200000, xp: 2500, rep: 80,
      statBonus: { reputation: 10, connections: 8 },
    },
    realNote: "Source: FBI OCDETF — largest domestic criminal enterprises employ 50–500+ people and generate $50M–$1B+ annually. The Genovese family has operated continuously for 130+ years.",
  },
  {
    id: "m4_the_apex_final",
    chapter: 4, order: 4,
    title: "The Apex",
    type: "main",
    briefingStatic: "You started with nothing. A name no one knew. A reputation that didn't exist. Now law enforcement agencies on three continents have your file open. That's not a problem — that's proof. You built something real. The question isn't whether you made it. The question is what you do with it.",
    aiPromptHint: "The conclusion of the main story arc. The operative has reached the apex of the criminal world. Reflection on what it cost, what it built, and what comes next. The tone should be earned — not triumphant, but undeniable.",
    objectives: [
      { desc: "Reach Level 20",                          check: (p) => (p.level||1) >= 20 },
      { desc: "Earn $1,000,000 total",                  check: (p) => (p.totalEarned||0) >= 1000000 },
      { desc: "Complete all Chapter 1-3 missions",      check: (p) => {
        const ch1 = ["m1_first_score","m1_heat_test","m1_first_contact"];
        const ch2 = ["m2_build_the_team","m2_territory_claim","m2_the_supplier","m2_the_rival"];
        const ch3 = ["m3_the_network","m3_the_laundry","m3_the_betrayal","m3_the_war"];
        return [...ch1,...ch2,...ch3].every(id => (p.completedQuests||[]).includes(id));
      }},
    ],
    requirements: { level: 18, completedQuests: ["m4_the_empire"] },
    rewards: {
      cash: 500000, xp: 5000, rep: 100,
      title: "the_apex",
      statBonus: { reputation: 15, nerve: 10, connections: 10, intelligence: 8 },
      specialTitle: "legend",
      chapterComplete: 4,
    },
    realNote: "Source: FBI — fewer than 1% of criminal organizations survive more than a decade at significant scale. The ones that do share three traits: institutional knowledge, political protection, and adaptability.",
  },
];

export const getMainQuestById  = (id)  => MAIN_QUESTS.find(q => q.id === id);
export const getChapterQuests  = (ch)  => MAIN_QUESTS.filter(q => q.chapter === ch);
export const getNextMainQuest  = (completedQuests = []) => {
  return MAIN_QUESTS.find(q =>
    !completedQuests.includes(q.id) &&
    (q.requirements.completedQuests || []).every(req => completedQuests.includes(req))
  ) || null;
};
export const getPlayerChapter  = (completedQuests = []) => {
  if (completedQuests.includes("m4_the_apex_final")) return 4;
  if (completedQuests.includes("m3_the_war"))        return 4;
  if (completedQuests.includes("m2_the_rival"))      return 3;
  if (completedQuests.includes("m1_first_contact"))  return 2;
  return 1;
};
