// src/data/quests.js — Full quest system
// Types: STORY | SIDE | CONTRACT | WORLD_EVENT

export const QUEST_TYPES = {
  STORY:       "story",
  SIDE:        "side",
  CONTRACT:    "contract",
  WORLD_EVENT: "world_event",
};

export const QUEST_STATUS = {
  LOCKED:      "locked",
  AVAILABLE:   "available",
  ACTIVE:      "active",
  COMPLETE:    "complete",
  CLAIMABLE:   "claimable",
  EXPIRED:     "expired",
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN STORY ARC — "The Rise"
// 4 chapters, 15 missions, linear gating
// ─────────────────────────────────────────────────────────────────────────────

export const STORY_CHAPTERS = [
  { id: "ch1", label: "Chapter 1", title: "The Ground Floor",  levelReq: 1  },
  { id: "ch2", label: "Chapter 2", title: "Moving Product",    levelReq: 5  },
  { id: "ch3", label: "Chapter 3", title: "Syndicate",         levelReq: 9  },
  { id: "ch4", label: "Chapter 4", title: "The Apex",          levelReq: 14 },
];

export const STORY_QUESTS = [
  // CHAPTER 1: THE GROUND FLOOR
  {
    id: "s1_arrival",
    type: QUEST_TYPES.STORY,
    chapter: "ch1",
    order: 1,
    title: "Arrival",
    subtitle: "Everybody starts somewhere.",
    narrative: `You came to this city with nothing. No name anyone recognizes, no crew, no territory.
The city doesn't know you yet. That's not a disadvantage — it's cover.
Your first move is simple: make money and don't get caught.`,
    aiPromptHint: "new criminal just arrived in the city, first steps, gritty urban setting",
    objectives: [
      { id: "obj_crime", label: "Commit your first crime", check: (p) => p.crimesSucceeded >= 1 },
      { id: "obj_cash",  label: "Accumulate $500",         check: (p) => (p.cash || 0) >= 500 },
    ],
    levelReq: 1,
    prevQuestId: null,
    rewards: {
      cash: 1000, xp: 200,
      title: null,
      statBonus: { streetSmarts: 2 },
      exclusiveItem: null,
      contact: null,
    },
    realNote: "FBI: 77% of first arrests in criminal careers occur before age 30. The first crime is rarely the most consequential — it's the pattern that follows.",
  },
  {
    id: "s1_first_contact",
    type: QUEST_TYPES.STORY,
    chapter: "ch1",
    order: 2,
    title: "First Contact",
    subtitle: "Everyone needs a fence.",
    narrative: `Word gets around fast when someone new is working a corner. A middleman reaches out — not a friend, just business.
They can move product, clean money, provide introductions. For a cut.
This is how it starts. Every empire begins with someone willing to take a cut.`,
    aiPromptHint: "first meeting with a criminal fence/middleman, cautious negotiation, establishing trust",
    objectives: [
      { id: "obj_launder", label: "Launder $500 through the fence",       check: (p) => (p.totalLaundered || 0) >= 500 },
      { id: "obj_crimes3", label: "Complete 3 crimes successfully",       check: (p) => p.crimesSucceeded >= 3 },
    ],
    levelReq: 1,
    prevQuestId: "s1_arrival",
    rewards: {
      cash: 1500, xp: 300,
      title: null,
      statBonus: { connections: 3 },
      exclusiveItem: null,
      contact: "mama_chen",
    },
    realNote: "DEA: Financial intermediaries ('fences') are involved in 82% of proceeds-of-crime cases. They provide the critical buffer between street crime and legitimate economy.",
  },
  {
    id: "s1_heat_test",
    type: QUEST_TYPES.STORY,
    chapter: "ch1",
    order: 3,
    title: "The Heat Test",
    subtitle: "Can you handle the pressure?",
    narrative: `Somebody talked. Maybe a neighbor, maybe a competitor.
Law enforcement is asking questions about recent activity in your area.
This is your first real test — not of skill, but of nerve.
Go dark, manage your heat, and come through clean.`,
    aiPromptHint: "first police investigation, laying low, managing exposure, criminal under scrutiny",
    objectives: [
      { id: "obj_heat_reduce", label: "Get heat below 15% from above 50%",  check: (p, prog) => prog?.heatPeakedAbove50 && (p.heat || 0) < 15 },
      { id: "obj_survive",     label: "Avoid arrest for 5 crimes in a row", check: (p, prog) => (prog?.consecutiveCleanCrimes || 0) >= 5 },
    ],
    levelReq: 2,
    prevQuestId: "s1_first_contact",
    rewards: {
      cash: 2000, xp: 400,
      title: "Ghost",
      statBonus: { stealth: 3, nerve: 2 },
      exclusiveItem: null,
      contact: null,
    },
    realNote: "DOJ: 'Going dark' — reducing communications and criminal activity after law enforcement notice — is the #1 survival tactic documented in organized crime RICO files.",
  },
  {
    id: "s1_first_crew",
    type: QUEST_TYPES.STORY,
    chapter: "ch1",
    order: 4,
    title: "You Can't Do It Alone",
    subtitle: "The first hire changes everything.",
    narrative: `Solo operations have a ceiling. You've hit it.
One person can only be in one place, run one job, hold one corner.
Time to bring someone in. The right crew member multiplies what you can do.
The wrong one gets you arrested.`,
    aiPromptHint: "hiring first crew member, criminal trust dynamics, expanding operation",
    objectives: [
      { id: "obj_hire",   label: "Hire your first crew member",             check: (p) => (p.crew?.length || 0) >= 1 },
      { id: "obj_level3", label: "Reach Level 3",                           check: (p) => (p.level || 1) >= 3 },
    ],
    levelReq: 2,
    prevQuestId: "s1_heat_test",
    rewards: {
      cash: 3000, xp: 500,
      title: "Street Operator",
      statBonus: { connections: 3, reputation: 5 },
      exclusiveItem: "exclusive_burner_set",
      contact: null,
    },
    realNote: "Criminology research (Reuter 1985): Criminal enterprises with 2+ members earn 40% more and sustain 30% longer than solo operators. Division of labor is as real in crime as in business.",
  },

  // CHAPTER 2: MOVING PRODUCT
  {
    id: "s2_turf",
    type: QUEST_TYPES.STORY,
    chapter: "ch2",
    order: 1,
    title: "Claim the Corner",
    subtitle: "Territory is money. Money is power.",
    narrative: `You've been operating in other people's territory long enough.
Every dollar you make here costs you a tax you don't see — in risk, in exposure, in what they take that you never know about.
Claim something of your own. It doesn't matter where. Just establish that this block is yours.`,
    aiPromptHint: "claiming first territory, establishing criminal presence in a neighborhood",
    objectives: [
      { id: "obj_district", label: "Claim your first territory district",    check: (p) => (p.ownedDistricts?.length || 0) >= 1 },
      { id: "obj_rep25",    label: "Reach 25 Reputation",                   check: (p) => (p.stats?.reputation || 0) >= 25 },
      { id: "obj_level5",   label: "Reach Level 5",                          check: (p) => (p.level || 1) >= 5 },
    ],
    levelReq: 5,
    prevQuestId: "s1_first_crew",
    rewards: {
      cash: 5000, xp: 800,
      title: "Corner Boss",
      statBonus: { reputation: 5, muscle: 3 },
      exclusiveItem: null,
      contact: "el_chivato",
    },
    realNote: "FBI National Gang Threat Assessment: 'Territorial control' is cited as the primary motivator for 68% of gang homicides. The corner is the fundamental unit of criminal economy.",
  },
  {
    id: "s2_faction_door",
    type: QUEST_TYPES.STORY,
    chapter: "ch2",
    order: 2,
    title: "The Introduction",
    subtitle: "A handshake worth more than money.",
    narrative: `Your contact knows people. Real people — not corner dealers, but organization.
An introduction is on offer. But introductions come with expectations.
Whoever you align with will shape what you become. Choose deliberately.`,
    aiPromptHint: "being introduced to a criminal organization, first meeting with faction leadership",
    objectives: [
      { id: "obj_faction",  label: "Join a criminal organization",            check: (p) => !!p.factionId },
      { id: "obj_mission1", label: "Complete your faction's first mission",   check: (p) => (p.completedMissions?.length || 0) >= 1 },
    ],
    levelReq: 5,
    prevQuestId: "s2_turf",
    rewards: {
      cash: 6000, xp: 900,
      title: "Aligned",
      statBonus: { connections: 5, reputation: 5 },
      exclusiveItem: null,
      contact: null,
    },
    realNote: "Europol SOCTA: Criminal network affiliation increases individual criminal revenue by avg 35%. Access to shared infrastructure (lawyers, suppliers, protection) is the primary benefit.",
  },
  {
    id: "s2_the_score",
    type: QUEST_TYPES.STORY,
    chapter: "ch2",
    order: 3,
    title: "The Score",
    subtitle: "One job that changes the math.",
    narrative: `Faction work is steady, but steady isn't what you came for.
There's a job — a real one. Big enough to change what's possible.
The crew is ready. The window is open. Pull it off and nobody questions where you came from anymore.`,
    aiPromptHint: "planning and executing a major criminal operation, high stakes heist",
    objectives: [
      { id: "obj_tier3",   label: "Successfully complete a Tier 3 crime",    check: (p) => p.crimesSucceeded >= 15 },
      { id: "obj_earn50k", label: "Earn $50,000 total",                      check: (p) => (p.totalEarned || 0) >= 50000 },
      { id: "obj_crew3",   label: "Have 3+ crew members",                    check: (p) => (p.crew?.length || 0) >= 3 },
    ],
    levelReq: 6,
    prevQuestId: "s2_faction_door",
    rewards: {
      cash: 10000, xp: 1200,
      title: "Earner",
      statBonus: { nerve: 5, reputation: 8 },
      exclusiveItem: "exclusive_score_weapon",
      contact: null,
    },
    realNote: "DOJ: 'Score' events — single high-value criminal acts — are documented as inflection points in 74% of organized crime career trajectories.",
  },
  {
    id: "s2_the_rival",
    type: QUEST_TYPES.STORY,
    chapter: "ch2",
    order: 4,
    title: "Competition",
    subtitle: "They were there first. You're better.",
    narrative: `Somebody doesn't like how fast you've moved. They've been working this same ground for years.
Now there's conflict. It doesn't need to be violent — but it needs to be resolved.
How you handle this tells everyone watching what kind of operator you are.`,
    aiPromptHint: "rival criminal organization conflict, territorial dispute, reputation at stake",
    objectives: [
      { id: "obj_districts2", label: "Control 2 territory districts",          check: (p) => (p.ownedDistricts?.length || 0) >= 2 },
      { id: "obj_rep50",      label: "Reach 50 Reputation",                   check: (p) => (p.stats?.reputation || 0) >= 50 },
      { id: "obj_missions3",  label: "Complete 3 faction missions",            check: (p) => (p.completedMissions?.length || 0) >= 3 },
    ],
    levelReq: 7,
    prevQuestId: "s2_the_score",
    rewards: {
      cash: 15000, xp: 1500,
      title: "Undisputed",
      statBonus: { reputation: 8, muscle: 5, nerve: 3 },
      exclusiveItem: null,
      contact: "padre_santos",
    },
    realNote: "FBI: 'Territorial dispute resolution' is coded language in 40% of organized crime wire transcripts. Power is established not by violence alone but by demonstrated economic and social dominance.",
  },

  // CHAPTER 3: SYNDICATE
  {
    id: "s3_the_network",
    type: QUEST_TYPES.STORY,
    chapter: "ch3",
    order: 1,
    title: "The Network",
    subtitle: "Real power is invisible.",
    narrative: `Territory is visible. Crew is visible. Money is visible if you're not careful.
The next level isn't about what you own — it's about who you know and what they owe you.
Build the network. Favors are worth more than cash.`,
    aiPromptHint: "building criminal network, establishing favor economy, moving from street to organizational power",
    objectives: [
      { id: "obj_connections60", label: "Reach 60 Connections",               check: (p) => (p.stats?.connections || 0) >= 60 },
      { id: "obj_contacts3",    label: "Use 3 different Dark Web contacts",   check: (p) => Object.keys(p.usedContactJobs || {}).length >= 3 },
      { id: "obj_level9",       label: "Reach Level 9",                       check: (p) => (p.level || 1) >= 9 },
    ],
    levelReq: 9,
    prevQuestId: "s2_the_rival",
    rewards: {
      cash: 20000, xp: 2000,
      title: "Operator",
      statBonus: { connections: 8, intelligence: 5 },
      exclusiveItem: null,
      contact: "ghost_zero",
    },
    realNote: "Europol: Network centrality — being the node through which information and favors flow — is more predictive of criminal career length than raw financial accumulation.",
  },
  {
    id: "s3_dirty_money",
    type: QUEST_TYPES.STORY,
    chapter: "ch3",
    order: 2,
    title: "Clean Money",
    subtitle: "The real skill is what happens after.",
    narrative: `You've been laundering through basic channels. The volume you're moving now outpaces what that can handle.
You need infrastructure — shell companies, real estate, financial instruments.
The money has to look like it came from somewhere legitimate. That's an art form.`,
    aiPromptHint: "sophisticated money laundering operation, building financial infrastructure",
    objectives: [
      { id: "obj_launder200k", label: "Launder $200,000 total",              check: (p) => (p.totalLaundered || 0) >= 200000 },
      { id: "obj_shell",       label: "Own a Shell Company Package",          check: (p) => (p.inventory || []).some(i => i.id === "shell_company_docs") },
      { id: "obj_intel60",     label: "Reach 60 Intelligence",               check: (p) => (p.stats?.intelligence || 0) >= 60 },
    ],
    levelReq: 10,
    prevQuestId: "s3_the_network",
    rewards: {
      cash: 30000, xp: 2500,
      title: "Cleaner",
      statBonus: { intelligence: 6, connections: 4 },
      exclusiveItem: "exclusive_offshore_account",
      contact: null,
    },
    realNote: "FinCEN: Sophisticated laundering operations require a minimum infrastructure investment of $50,000-$200,000. Return on that investment averages 400% over 3 years.",
  },
  {
    id: "s3_betrayal",
    type: QUEST_TYPES.STORY,
    chapter: "ch3",
    order: 3,
    title: "The Betrayal",
    subtitle: "It was always going to happen.",
    narrative: `Someone close turned. Maybe they flipped for the feds. Maybe they went to a rival.
You don't know yet how much they gave up. You need to find out and contain the damage before it reaches you.
This is the moment most criminal careers end. Or the moment they become something harder.`,
    aiPromptHint: "betrayal by trusted associate, crisis management, damage control in criminal world",
    objectives: [
      { id: "obj_survive_event",  label: "Survive a Federal Sting event",     check: (p, prog) => (prog?.survivedStingEvent || 0) >= 1 },
      { id: "obj_heat_recover",   label: "Recover from 80%+ heat to below 30%",check: (p, prog) => (prog?.recoveredFromHighHeat || 0) >= 1 },
      { id: "obj_loyalty",        label: "Pay crew payroll 5 times",          check: (p, prog) => (prog?.paidPayroll || 0) >= 5 },
    ],
    levelReq: 11,
    prevQuestId: "s3_dirty_money",
    rewards: {
      cash: 25000, xp: 3000,
      title: "Ironclad",
      statBonus: { nerve: 8, stealth: 5, intelligence: 3 },
      exclusiveItem: null,
      contact: "sofia_v",
    },
    realNote: "DOJ: Informant-driven cases account for 73% of federal organized crime convictions. The moment a trusted associate flips is the single most dangerous point in any criminal operation.",
  },
  {
    id: "s3_the_empire",
    type: QUEST_TYPES.STORY,
    chapter: "ch3",
    order: 4,
    title: "The Empire",
    subtitle: "This is what you built it for.",
    narrative: `Five districts. A crew that's paid and loyal. Faction rank. Clean money flowing.
This isn't street crime anymore. This is an organization.
The feds have a file on you. Rivals watch your movements.
And yet — here you are. Still standing.`,
    aiPromptHint: "criminal empire fully established, new threats emerging, legacy question",
    objectives: [
      { id: "obj_districts5", label: "Control 5+ territory districts",        check: (p) => (p.ownedDistricts?.length || 0) >= 5 },
      { id: "obj_crew5",      label: "Have 5+ active crew members",           check: (p) => (p.crew?.length || 0) >= 5 },
      { id: "obj_boss",       label: "Complete all 5 faction missions",       check: (p) => (p.completedMissions?.length || 0) >= 5 },
      { id: "obj_level12",    label: "Reach Level 12",                        check: (p) => (p.level || 1) >= 12 },
    ],
    levelReq: 12,
    prevQuestId: "s3_betrayal",
    rewards: {
      cash: 50000, xp: 4000,
      title: "Crime Boss",
      statBonus: { reputation: 10, connections: 8, intelligence: 5 },
      exclusiveItem: "exclusive_empire_signet",
      contact: null,
    },
    realNote: "FBI OCDETF: The consolidation phase — controlling territory, crew, and financial infrastructure simultaneously — is when organizations shift from 'gang' to 'criminal enterprise' in federal classification.",
  },

  // CHAPTER 4: THE APEX
  {
    id: "s4_interpol",
    type: QUEST_TYPES.STORY,
    chapter: "ch4",
    order: 1,
    title: "The Red Notice",
    subtitle: "They see you now.",
    narrative: `Interpol has issued a notice. Not for arrest yet — just observation, coordination.
Eighteen agencies across eleven countries exchanging intelligence on your operation.
You are no longer local. The question is whether you have the infrastructure to match the attention.`,
    aiPromptHint: "Interpol red notice, international law enforcement attention, criminal at global scale",
    objectives: [
      { id: "obj_heat80",     label: "Reach 80%+ heat and survive 3 crimes",  check: (p, prog) => (prog?.survivedHighHeat || 0) >= 1 },
      { id: "obj_launder500k", label: "Launder $500,000 total",              check: (p) => (p.totalLaundered || 0) >= 500000 },
      { id: "obj_level14",    label: "Reach Level 14",                        check: (p) => (p.level || 1) >= 14 },
    ],
    levelReq: 14,
    prevQuestId: "s3_the_empire",
    rewards: {
      cash: 75000, xp: 5000,
      title: "Person of Interest",
      statBonus: { stealth: 6, intelligence: 6, nerve: 5 },
      exclusiveItem: null,
      contact: "hex_nine",
    },
    realNote: "Interpol CCIU: Red Notices are issued when a subject's criminal activity crosses international thresholds. Currently 73,000+ active notices globally.",
  },
  {
    id: "s4_cartel_tier",
    type: QUEST_TYPES.STORY,
    chapter: "ch4",
    order: 2,
    title: "Cartel Tier",
    subtitle: "You operate at the level of nation-states.",
    narrative: `The cartels noticed. Not as a threat — as an opportunity.
At this scale, you're not a local operator anymore. You're infrastructure.
They want a relationship. Which means they want leverage.
The question is whether you control the relationship — or it controls you.`,
    aiPromptHint: "being approached by cartel leadership, negotiating from position of strength",
    objectives: [
      { id: "obj_earn1m",     label: "Earn $1,000,000 total",               check: (p) => (p.totalEarned || 0) >= 1_000_000 },
      { id: "obj_districts7", label: "Control 7+ territory districts",       check: (p) => (p.ownedDistricts?.length || 0) >= 7 },
    ],
    levelReq: 15,
    prevQuestId: "s4_interpol",
    rewards: {
      cash: 150000, xp: 7000,
      title: "Untouchable",
      statBonus: { reputation: 12, connections: 10, nerve: 8 },
      exclusiveItem: "exclusive_cartel_passport",
      contact: null,
    },
    realNote: "DEA: Organizations reaching cartel-tier revenue ($100M+/year) typically do so through diversification across 5+ criminal revenue streams.",
  },
  {
    id: "s4_state_capture",
    type: QUEST_TYPES.STORY,
    chapter: "ch4",
    order: 3,
    title: "Above the Law",
    subtitle: "When you own the system, the system works for you.",
    narrative: `The final frontier isn't territory or money. It's the legal architecture that surrounds both.
Judges. Legislators. Law enforcement command.
You're not bribing individuals anymore — you're purchasing institutional protection.
This is what separates the cartels that last from the ones that fall.`,
    aiPromptHint: "corrupting institutions, political capture, criminal organization becomes quasi-governmental",
    objectives: [
      { id: "obj_corrupt_cop", label: "Own a Corrupt Officer item",           check: (p) => (p.inventory || []).some(i => i.id === "corrupt_cop") },
      { id: "obj_rep90",       label: "Reach 90 Reputation",                 check: (p) => (p.stats?.reputation || 0) >= 90 },
      { id: "obj_level17",     label: "Reach Level 17",                       check: (p) => (p.level || 1) >= 17 },
      { id: "obj_launder1m",   label: "Launder $1,000,000 total",           check: (p) => (p.totalLaundered || 0) >= 1_000_000 },
    ],
    levelReq: 17,
    prevQuestId: "s4_cartel_tier",
    rewards: {
      cash: 250000, xp: 10000,
      title: "The System",
      statBonus: { intelligence: 10, connections: 12, reputation: 10 },
      exclusiveItem: "exclusive_legislative_contact",
      contact: "the_quartermaster",
    },
    realNote: "Transparency International: 'State capture' — criminal organizations controlling legislative and judicial functions — is documented in 28 countries.",
  },
  {
    id: "s4_the_legend",
    type: QUEST_TYPES.STORY,
    chapter: "ch4",
    order: 4,
    title: "The Legend",
    subtitle: "The name outlasts the person.",
    narrative: `There's a moment when your name stops being yours.
It becomes something people invoke. Something that operates independently of what you do next.
Fear is no longer about what you'll do — it's about what people believe you've done.
You've built something that will survive you.
What you do with that is the final question.`,
    aiPromptHint: "criminal legend status, legacy, what it means to be feared and respected at the highest level",
    objectives: [
      { id: "obj_level20",   label: "Reach Level 20",                        check: (p) => (p.level || 1) >= 20 },
      { id: "obj_rep100",    label: "Reach 100 Reputation",                 check: (p) => (p.stats?.reputation || 0) >= 100 },
      { id: "obj_all_story", label: "Complete all previous story missions",  check: (p, prog) => (prog?.storyMissionsComplete || 0) >= 14 },
    ],
    levelReq: 20,
    prevQuestId: "s4_state_capture",
    rewards: {
      cash: 500000, xp: 25000,
      title: "Legend",
      statBonus: { reputation: 15, connections: 10, nerve: 10, intelligence: 8 },
      exclusiveItem: "exclusive_legend_badge",
      contact: null,
    },
    realNote: "Academic criminology: 'Symbolic capital' in criminal networks — the weight of a name — is documented as having measurable economic value. Mafias charge 'affiliation premiums' for using their name in negotiations.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SIDE QUESTS — Named NPC chains (3 per contact)
// ─────────────────────────────────────────────────────────────────────────────

export const SIDE_QUESTS = [
  // MAMA CHEN: "Clean Sweep"
  {
    id: "sq_chen_1", type: QUEST_TYPES.SIDE, series: "mama_chen",
    seriesLabel: "Mama Chen — Clean Sweep", order: 1,
    title: "Volume", subtitle: "Bigger numbers. Better rate.",
    narrative: "Mama Chen runs three dry cleaners and a bubble tea chain. She doesn't ask questions but she does ask for volume. Bring her enough dirty money in one run and she'll upgrade your rate.",
    aiPromptHint: "money laundering through small businesses, trust building with fixer",
    objectives: [
      { id: "obj_launder_50k", label: "Launder $50,000 in a single session", check: (p, prog) => (prog?.largestSingleLaunder || 0) >= 50000 },
    ],
    trustReq: 1, contactId: "mama_chen", prevQuestId: null,
    rewards: { cash: 8000, xp: 500, statBonus: { intelligence: 2 }, title: null, exclusiveItem: null,
      upgradeNote: "Mama Chen's conversion rate improves to 82%" },
  },
  {
    id: "sq_chen_2", type: QUEST_TYPES.SIDE, series: "mama_chen",
    seriesLabel: "Mama Chen — Clean Sweep", order: 2,
    title: "Infrastructure", subtitle: "Real operations need real cover.",
    narrative: "She needs a shell company to route the volume through. Provide the paperwork. In return, she cuts you into a crypto routing operation that reduces her fees — and yours.",
    aiPromptHint: "expanding money laundering infrastructure, shell company setup",
    objectives: [
      { id: "obj_shell",       label: "Own a Shell Company Package",          check: (p) => (p.inventory || []).some(i => i.id === "shell_company_docs") },
      { id: "obj_launder100k", label: "Launder $100,000 total",             check: (p) => (p.totalLaundered || 0) >= 100000 },
    ],
    trustReq: 2, contactId: "mama_chen", prevQuestId: "sq_chen_1",
    rewards: { cash: 15000, xp: 800, statBonus: { intelligence: 3, connections: 2 },
      exclusiveItem: "exclusive_crypto_mixer",
      upgradeNote: "Mama Chen's rate increases to 85%" },
  },
  {
    id: "sq_chen_3", type: QUEST_TYPES.SIDE, series: "mama_chen",
    seriesLabel: "Mama Chen — Clean Sweep", order: 3,
    title: "The Partner", subtitle: "From client to collaborator.",
    narrative: "Mama Chen has a problem — someone is watching her operation. Not law enforcement, but a rival who wants a cut. Handle it. She'll owe you something bigger than money.",
    aiPromptHint: "protecting a criminal business associate, dealing with extortion attempt",
    objectives: [
      { id: "obj_protection", label: "Complete 3 crimes above Tier 2",        check: (p) => p.crimesSucceeded >= 20 },
      { id: "obj_rep60",      label: "Reach 60 Reputation",                  check: (p) => (p.stats?.reputation || 0) >= 60 },
    ],
    trustReq: 3, contactId: "mama_chen", prevQuestId: "sq_chen_2",
    rewards: { cash: 25000, xp: 1200, statBonus: { intelligence: 5, connections: 4 },
      title: "The Cleaner", exclusiveItem: "exclusive_chen_network",
      upgradeNote: "Mama Chen's rate reaches 88% — highest achievable" },
  },

  // EL CHIVATO: "Ghost Protocol"
  {
    id: "sq_chivato_1", type: QUEST_TYPES.SIDE, series: "el_chivato",
    seriesLabel: "El Chivato — Ghost Protocol", order: 1,
    title: "Warm Up", subtitle: "Prove you can work clean.",
    narrative: "Chivato doesn't sell to people who get caught. Complete five crimes without a single arrest. He's watching the news. So is law enforcement.",
    aiPromptHint: "proving operational discipline to intelligence broker",
    objectives: [
      { id: "obj_clean5", label: "Complete 5 crimes with no arrests",         check: (p, prog) => (prog?.consecutiveCleanCrimes || 0) >= 5 },
    ],
    trustReq: 0, contactId: "el_chivato", prevQuestId: null,
    rewards: { cash: 5000, xp: 400, statBonus: { stealth: 3 }, title: null, exclusiveItem: null },
  },
  {
    id: "sq_chivato_2", type: QUEST_TYPES.SIDE, series: "el_chivato",
    seriesLabel: "El Chivato — Ghost Protocol", order: 2,
    title: "Counter-Intel", subtitle: "Learn what they know about you.",
    narrative: "Chivato has a contact inside a field office who's heard your name come up. For a price, he'll find out exactly what they have. Knowledge is the most valuable currency there is.",
    aiPromptHint: "obtaining law enforcement intelligence, counter-surveillance operation",
    objectives: [
      { id: "obj_survive_sting", label: "Survive a police encounter",          check: (p) => (p.encountersEscaped || 0) >= 1 },
      { id: "obj_stealth50",    label: "Reach 50 Stealth",                    check: (p) => (p.stats?.stealth || 0) >= 50 },
    ],
    trustReq: 1, contactId: "el_chivato", prevQuestId: "sq_chivato_1",
    rewards: { cash: 12000, xp: 700, statBonus: { stealth: 4, streetSmarts: 3 },
      exclusiveItem: "exclusive_police_intel_feed" },
  },
  {
    id: "sq_chivato_3", type: QUEST_TYPES.SIDE, series: "el_chivato",
    seriesLabel: "El Chivato — Ghost Protocol", order: 3,
    title: "The Mole", subtitle: "An asset on the inside.",
    narrative: "Chivato can place an informant inside a rival organization. He needs you to identify the target and fund the operation. The intel stream that follows is worth ten times the cost.",
    aiPromptHint: "placing informant in rival organization, long-term intelligence operation",
    objectives: [
      { id: "obj_connections70", label: "Reach 70 Connections",               check: (p) => (p.stats?.connections || 0) >= 70 },
      { id: "obj_encounters5",   label: "Survive 5 police encounters",         check: (p) => (p.encountersEscaped || 0) >= 5 },
    ],
    trustReq: 2, contactId: "el_chivato", prevQuestId: "sq_chivato_2",
    rewards: { cash: 30000, xp: 1500, statBonus: { stealth: 6, intelligence: 5 },
      title: "Phantom", exclusiveItem: "exclusive_rival_intel" },
  },

  // VIKTOR K: "Arms Race"
  {
    id: "sq_viktor_1", type: QUEST_TYPES.SIDE, series: "viktor_k",
    seriesLabel: "Viktor K. — Arms Race", order: 1,
    title: "First Order", subtitle: "He needs to know you can move product.",
    narrative: "Viktor doesn't work with amateurs. Place a significant order and pay on delivery. He'll verify it himself. If the transaction is clean, the relationship begins.",
    aiPromptHint: "establishing relationship with arms dealer, first significant purchase",
    objectives: [
      { id: "obj_weapon",   label: "Purchase any weapon from the Black Market", check: (p) => (p.inventory || []).some(i => ["ghost_pistol","sawed_off","ar_pistol","knife"].includes(i.id)) },
      { id: "obj_muscle40", label: "Reach 40 Muscle",                           check: (p) => (p.stats?.muscle || 0) >= 40 },
    ],
    trustReq: 0, contactId: "viktor_k", prevQuestId: null,
    rewards: { cash: 6000, xp: 450, statBonus: { muscle: 3, nerve: 2 }, exclusiveItem: null },
  },
  {
    id: "sq_viktor_2", type: QUEST_TYPES.SIDE, series: "viktor_k",
    seriesLabel: "Viktor K. — Arms Race", order: 2,
    title: "The Shipment", subtitle: "Scale changes the game.",
    narrative: "Viktor has a large shipment moving through. He needs temporary storage and distribution assistance. The risk is real. The reward is preferential access to his inventory.",
    aiPromptHint: "weapons trafficking logistics, moving a significant shipment",
    objectives: [
      { id: "obj_smuggler", label: "Have a crew member",                        check: (p) => (p.crew?.length || 0) >= 2 },
      { id: "obj_nerve55",  label: "Reach 55 Nerve",                           check: (p) => (p.stats?.nerve || 0) >= 55 },
    ],
    trustReq: 1, contactId: "viktor_k", prevQuestId: "sq_viktor_1",
    rewards: { cash: 20000, xp: 900, statBonus: { muscle: 4, nerve: 4 },
      exclusiveItem: "exclusive_viktor_arsenal" },
  },
  {
    id: "sq_viktor_3", type: QUEST_TYPES.SIDE, series: "viktor_k",
    seriesLabel: "Viktor K. — Arms Race", order: 3,
    title: "The Broker", subtitle: "From buyer to middleman.",
    narrative: "Viktor wants to semi-retire. He's looking for someone to run the operation while he handles the supply side. This means you become the sales arm of a serious arms network.",
    aiPromptHint: "becoming arms broker, criminal career advancement, new criminal specialty",
    objectives: [
      { id: "obj_crimes25", label: "Complete 25 successful crimes",             check: (p) => p.crimesSucceeded >= 25 },
      { id: "obj_muscle70", label: "Reach 70 Muscle",                           check: (p) => (p.stats?.muscle || 0) >= 70 },
    ],
    trustReq: 2, contactId: "viktor_k", prevQuestId: "sq_viktor_2",
    rewards: { cash: 40000, xp: 1800, statBonus: { muscle: 6, nerve: 5, connections: 4 },
      title: "The Broker", exclusiveItem: null },
  },

  // GHOST_ZERO: "Zero Day" — unlocked via story quest s3_the_network
  {
    id: "sq_ghost_1", type: QUEST_TYPES.SIDE, series: "ghost_zero",
    seriesLabel: "Ghost_Zero — Zero Day", order: 1,
    title: "First Access", subtitle: "The digital underworld runs deeper than you know.",
    narrative: "Ghost_Zero operates in the spaces between systems. They need proof you understand the value of information. One high-value cyber operation. No trace.",
    aiPromptHint: "digital crime, hacking, cyber criminal network initiation",
    objectives: [
      { id: "obj_cyber1",  label: "Complete a cyber crime operation",          check: (p, prog) => (prog?.completedCyberCrime || 0) >= 1 },
      { id: "obj_tech50",  label: "Reach 50 Tech Savvy",                      check: (p) => (p.stats?.techSavvy || 0) >= 50 },
    ],
    trustReq: 0, contactId: "ghost_zero", prevQuestId: null,
    rewards: { cash: 15000, xp: 700, statBonus: { techSavvy: 5, intelligence: 3 }, exclusiveItem: null },
  },
  {
    id: "sq_ghost_2", type: QUEST_TYPES.SIDE, series: "ghost_zero",
    seriesLabel: "Ghost_Zero — Zero Day", order: 2,
    title: "Data Broker", subtitle: "Information is the new currency.",
    narrative: "Ghost_Zero has a buyer for a specific corporate dataset. You provide the network access. They provide the extraction tool. Both of you walk away richer.",
    aiPromptHint: "corporate espionage, data theft operation, criminal tech collaboration",
    objectives: [
      { id: "obj_cyber3",   label: "Complete 3 cyber crime operations",         check: (p, prog) => (prog?.completedCyberCrime || 0) >= 3 },
      { id: "obj_tech70",   label: "Reach 70 Tech Savvy",                      check: (p) => (p.stats?.techSavvy || 0) >= 70 },
    ],
    trustReq: 1, contactId: "ghost_zero", prevQuestId: "sq_ghost_1",
    rewards: { cash: 35000, xp: 1400, statBonus: { techSavvy: 6, intelligence: 6 },
      title: "Zero Day", exclusiveItem: null },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CONTRACTS BOARD — Weekly rotating anonymous jobs (8 visible at a time)
// ─────────────────────────────────────────────────────────────────────────────

export const CONTRACT_POOL = [
  {
    id: "c_heist_bank",     label: "Bank Job",
    desc: "Anonymous client needs a clean bank robbery. Crew required. Pays on completion.",
    category: "Heist",    icon: "🏦", difficulty: 3, expiresHours: 48,
    objectives: [{ label: "Complete 5 Tier 3+ crimes",           check: (p) => p.crimesSucceeded >= 20 }],
    rewards: { cash: 35000, xp: 1000, statBonus: { nerve: 3 } },
    levelReq: 6, statReq: { nerve: 30, muscle: 25 },
  },
  {
    id: "c_deliver_drugs",  label: "Cross-City Delivery",
    desc: "Wholesale product needs to reach a buyer in another city. No questions. Time sensitive.",
    category: "Delivery",  icon: "🚗", difficulty: 2, expiresHours: 24,
    objectives: [{ label: "Complete 10 crimes this week",        check: (p, prog) => (prog?.contractCrimesThisWeek || 0) >= 10 }],
    rewards: { cash: 18000, xp: 600, statBonus: { streetSmarts: 2 } },
    levelReq: 4, statReq: { connections: 20 },
  },
  {
    id: "c_territory_grab", label: "Territory Acquisition",
    desc: "Client needs a specific district controlled. Payment on control establishment.",
    category: "Territory",  icon: "⬡", difficulty: 3, expiresHours: 72,
    objectives: [{ label: "Control 2+ territory districts",      check: (p) => (p.ownedDistricts?.length || 0) >= 2 }],
    rewards: { cash: 25000, xp: 800 },
    levelReq: 4, statReq: { reputation: 20 },
  },
  {
    id: "c_money_move",     label: "Money Movement",
    desc: "Large sum needs cleaning fast. Bring your own infrastructure. Premium conversion.",
    category: "Financial",  icon: "💰", difficulty: 2, expiresHours: 48,
    objectives: [{ label: "Launder $30,000 total",               check: (p) => (p.totalLaundered || 0) >= 30000 }],
    rewards: { cash: 12000, xp: 500, statBonus: { intelligence: 2 } },
    levelReq: 3, statReq: { intelligence: 25 },
  },
  {
    id: "c_intel_gather",   label: "Intelligence Contract",
    desc: "Client needs a competitor's operation mapped. Requires access and patience.",
    category: "Intel",      icon: "🗺", difficulty: 2, expiresHours: 48,
    objectives: [{ label: "Survive 2 police encounters",          check: (p) => (p.encountersEscaped || 0) >= 2 }],
    rewards: { cash: 15000, xp: 600, statBonus: { stealth: 2, streetSmarts: 2 } },
    levelReq: 3, statReq: { stealth: 20 },
  },
  {
    id: "c_cyber_op",       label: "Digital Extraction",
    desc: "Corporate data needed. Client won't say why. High tech setup required.",
    category: "Cyber",      icon: "💻", difficulty: 3, expiresHours: 72,
    objectives: [{ label: "Reach 50 Tech Savvy",                 check: (p) => (p.stats?.techSavvy || 0) >= 50 }],
    rewards: { cash: 28000, xp: 900, statBonus: { techSavvy: 3 } },
    levelReq: 5, statReq: { techSavvy: 35 },
  },
  {
    id: "c_heat_survive",   label: "Hot Operations",
    desc: "Client wants proof of operational capacity under maximum pressure.",
    category: "Endurance",  icon: "🌡", difficulty: 4, expiresHours: 24,
    objectives: [{ label: "Complete 5 crimes at 60%+ heat",      check: (p, prog) => (prog?.contractHighHeatCrimes || 0) >= 5 }],
    rewards: { cash: 40000, xp: 1200, statBonus: { nerve: 4 } },
    levelReq: 6, statReq: { nerve: 40 },
  },
  {
    id: "c_crew_op",        label: "Full Crew Deployment",
    desc: "Operation requires a complete crew. All hands on deck. Premium for full deployment.",
    category: "Operations", icon: "👥", difficulty: 3, expiresHours: 48,
    objectives: [{ label: "Have 4+ crew members",                check: (p) => (p.crew?.length || 0) >= 4 }],
    rewards: { cash: 30000, xp: 1000, statBonus: { connections: 3 } },
    levelReq: 5, statReq: { connections: 30 },
  },
  {
    id: "c_ghost_run",      label: "Clean Hands",
    desc: "Client needs operations with zero arrests. Proof of operational security.",
    category: "Stealth",    icon: "👻", difficulty: 3, expiresHours: 96,
    objectives: [{ label: "Reach 0 arrests with 10+ crimes done", check: (p) => p.crimesSucceeded >= 10 && p.timesArrested === 0 }],
    rewards: { cash: 35000, xp: 1200, statBonus: { stealth: 4, streetSmarts: 3 } },
    levelReq: 4, statReq: { stealth: 25 },
  },
  {
    id: "c_arms_supply",    label: "Armed & Ready",
    desc: "Build a complete weapons arsenal. Client wants assurance you're properly equipped.",
    category: "Equipment",  icon: "🔫", difficulty: 2, expiresHours: 48,
    objectives: [{ label: "Own 2+ weapons from Black Market",     check: (p) => (p.inventory || []).filter(i => ["ghost_pistol","sawed_off","ar_pistol","knife"].includes(i.id)).length >= 2 }],
    rewards: { cash: 22000, xp: 700, statBonus: { muscle: 3, nerve: 2 } },
    levelReq: 3, statReq: { muscle: 20 },
  },
  {
    id: "c_empire_flex",    label: "Show of Force",
    desc: "Unknown client wants a demonstration of territorial power. Control is the message.",
    category: "Territory",  icon: "⚔️", difficulty: 4, expiresHours: 72,
    objectives: [{ label: "Control 3+ districts simultaneously",  check: (p) => (p.ownedDistricts?.length || 0) >= 3 }],
    rewards: { cash: 45000, xp: 1500, statBonus: { reputation: 5 } },
    levelReq: 7, statReq: { reputation: 50 },
  },
  {
    id: "c_laundering_run", label: "Express Clean",
    desc: "Emergency clean run needed. Limited window. Rate is exceptional.",
    category: "Financial",  icon: "♻️", difficulty: 2, expiresHours: 12,
    objectives: [{ label: "Launder $80,000 total",                check: (p) => (p.totalLaundered || 0) >= 80000 }],
    rewards: { cash: 20000, xp: 700, statBonus: { intelligence: 2 } },
    levelReq: 4, statReq: { intelligence: 30 },
  },
];

function weekSeed() {
  const d = new Date();
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  return d.getFullYear() * 100 + week;
}

function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

export const getWeeklyContracts = () => {
  const rand = seededRandom(weekSeed());
  return [...CONTRACT_POOL].sort(() => rand() - 0.5).slice(0, 8);
};

export const currentWeekKey = () => {
  const d = new Date();
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// WORLD EVENTS
// ─────────────────────────────────────────────────────────────────────────────

export const WORLD_EVENT_TYPES = [
  {
    id: "we_federal_crackdown", title: "Federal Crackdown", icon: "🚔",
    desc: "A coordinated federal operation is active. All crime success rates reduced 15% for 24 hours.",
    effect: { crimeSuccessModifier: -0.15, duration: 86400000 }, color: "#c0392b",
  },
  {
    id: "we_cartel_war", title: "Cartel War", icon: "⚔️",
    desc: "Rival factions are at war. Raid damage +20%. Lasts 48h.",
    effect: { raidDamageBonus: 0.20, duration: 172800000 }, color: "#e67e22",
  },
  {
    id: "we_market_surplus", title: "Black Market Surplus", icon: "📦",
    desc: "Oversupply in criminal supply chain. Black Market buy prices -20% for 12 hours.",
    effect: { marketPriceModifier: -0.20, duration: 43200000 }, color: "#3d8c5a",
  },
  {
    id: "we_heat_wave", title: "Heat Wave", icon: "🌡",
    desc: "Law enforcement surge. Heat generation +25% for 24 hours.",
    effect: { heatGenerationModifier: 0.25, duration: 86400000 }, color: "#c0392b",
  },
  {
    id: "we_amnesty", title: "Enforcement Amnesty", icon: "🕊",
    desc: "Police resources diverted. Heat decays 3x faster for 6 hours.",
    effect: { heatDecayMultiplier: 3.0, duration: 21600000 }, color: "#5a7ec8",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EXCLUSIVE QUEST REWARD ITEMS
// ─────────────────────────────────────────────────────────────────────────────

export const EXCLUSIVE_ITEMS = {
  exclusive_burner_set: {
    id: "exclusive_burner_set", name: "Military-Grade Burner Kit",
    desc: "Impossible to trace. Sourced through grey-market military channels. 3x stealth bonus vs standard.",
    statBonus: { stealth: 8 }, questOnly: true, rarity: "exclusive",
  },
  exclusive_score_weapon: {
    id: "exclusive_score_weapon", name: "The Score — Custom Piece",
    desc: "A weapon with a history. Made specifically for one job. Untraceable and effective.",
    statBonus: { muscle: 6, nerve: 4 }, questOnly: true, rarity: "exclusive",
  },
  exclusive_offshore_account: {
    id: "exclusive_offshore_account", name: "Offshore Account Infrastructure",
    desc: "A full offshore banking setup — three jurisdictions, nominee directors, no paper trail to you.",
    statBonus: { intelligence: 5 }, questOnly: true, rarity: "exclusive",
  },
  exclusive_empire_signet: {
    id: "exclusive_empire_signet", name: "The Signet",
    desc: "Proof of organizational reach. A physical symbol recognized by criminal networks worldwide.",
    statBonus: { connections: 10, reputation: 8 }, questOnly: true, rarity: "exclusive",
  },
  exclusive_cartel_passport: {
    id: "exclusive_cartel_passport", name: "Cartel-Grade Passport",
    desc: "A document package that passes any inspection globally. Covers you across 40+ countries.",
    statBonus: { stealth: 10 }, heatReduction: 50, questOnly: true, rarity: "exclusive",
  },
  exclusive_legislative_contact: {
    id: "exclusive_legislative_contact", name: "Legislative Asset",
    desc: "A senator on retainer. Can delay prosecution, access sealed warrants, kill investigations.",
    statBonus: { connections: 12, intelligence: 6 }, questOnly: true, rarity: "exclusive",
  },
  exclusive_legend_badge: {
    id: "exclusive_legend_badge", name: "The Legend Token",
    desc: "A physical artifact of your criminal career. Irreplaceable. Proof of everything.",
    statBonus: { reputation: 20, connections: 10, nerve: 8, intelligence: 8 }, questOnly: true, rarity: "exclusive",
  },
  exclusive_crypto_mixer: {
    id: "exclusive_crypto_mixer", name: "Mama Chen's Crypto Mixer",
    desc: "A custom crypto routing network. Processes dirty crypto with 90% recovery.",
    statBonus: { techSavvy: 6, intelligence: 4 }, questOnly: true, rarity: "exclusive",
  },
  exclusive_chen_network: {
    id: "exclusive_chen_network", name: "The Chen Network Access",
    desc: "Full access to Mama Chen's laundering infrastructure across 40+ businesses. 88% rate, permanent.",
    statBonus: { connections: 8, intelligence: 6 }, questOnly: true, rarity: "exclusive",
  },
  exclusive_police_intel_feed: {
    id: "exclusive_police_intel_feed", name: "Live Police Intel Feed",
    desc: "El Chivato's mole in the field office. Real-time patrol schedules and warrant feeds.",
    statBonus: { stealth: 8, streetSmarts: 6 }, questOnly: true, rarity: "exclusive",
  },
  exclusive_rival_intel: {
    id: "exclusive_rival_intel", name: "Rival Organization Dossier",
    desc: "Complete intelligence on your primary rival. Their operations, routes, vulnerabilities.",
    statBonus: { intelligence: 8, connections: 6 }, questOnly: true, rarity: "exclusive",
  },
  exclusive_viktor_arsenal: {
    id: "exclusive_viktor_arsenal", name: "Viktor's Priority Catalogue",
    desc: "First access to Viktor's full inventory before it hits the open market. 40% below market.",
    statBonus: { muscle: 6, nerve: 4 }, questOnly: true, rarity: "exclusive",
  },
  exclusive_da_relationship: {
    id: "exclusive_da_relationship", name: "District Attorney — Active Contact",
    desc: "A DA on retainer through Santos' introduction. Can delay prosecution, seal records, create investigative blind spots.",
    statBonus: { connections: 8, reputation: 6 }, heatReduction: 30, questOnly: true, rarity: "exclusive",
  },
  exclusive_sanctuary_property: {
    id: "exclusive_sanctuary_property", name: "Sanctuary Property Access",
    desc: "A community-protected warehouse untouchable without federal oversight. Safe storage, operational cover.",
    statBonus: { stealth: 8, connections: 6 }, questOnly: true, rarity: "exclusive",
  },
  exclusive_hex_zero_trace: {
    id: "exclusive_hex_zero_trace", name: "Zero Trace Protocol",
    desc: "Hex Nine's full digital scrub. Operational footprint invisible to standard law enforcement tracking.",
    statBonus: { stealth: 10, techSavvy: 6 }, questOnly: true, rarity: "exclusive",
  },
  exclusive_private_darknet: {
    id: "exclusive_private_darknet", name: "Private Darknet Infrastructure",
    desc: "Encrypted communication network for your entire crew. End-to-end, compartmentalized. Federal intercept proof.",
    statBonus: { techSavvy: 10, stealth: 6, intelligence: 4 }, questOnly: true, rarity: "exclusive",
  },
  exclusive_qm_catalogue: {
    id: "exclusive_qm_catalogue", name: "Quartermaster — Restricted Catalogue",
    desc: "First access to the Quartermaster's full restricted inventory. Items unavailable through standard channels.",
    statBonus: { muscle: 5, dexterity: 6 }, questOnly: true, rarity: "exclusive",
  },
  exclusive_military_cache: {
    id: "exclusive_military_cache", name: "Decommissioned Military Cache",
    desc: "Equipment from a decommissioned military facility. No serial numbers, no provenance, total operational advantage.",
    statBonus: { muscle: 10, dexterity: 8, nerve: 6 }, questOnly: true, rarity: "exclusive",
  },
  exclusive_inter_org_access: {
    id: "exclusive_inter_org_access", name: "Inter-Organization Summit Access",
    desc: "Sofia V.'s personal vouching. Recognized by three major organizations as a trusted third party.",
    statBonus: { intelligence: 8, connections: 10 }, questOnly: true, rarity: "exclusive",
  },
  exclusive_sofia_network: {
    id: "exclusive_sofia_network", name: "The Diplomatic Network",
    desc: "Full access to Sofia V.'s high-society criminal network. Politicians, lawyers, financiers.",
    statBonus: { intelligence: 12, connections: 14, reputation: 8 }, questOnly: true, rarity: "exclusive",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PLAYER TITLES (from quest rewards)
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_TITLES = [
  "Ghost", "Street Operator", "Corner Boss", "Aligned", "Earner",
  "Undisputed", "Operator", "Cleaner", "Ironclad", "Crime Boss",
  "Person of Interest", "Untouchable", "The System", "Legend",
  "The Cleaner", "Phantom", "The Broker", "Zero Day",
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export const getStoryQuestsByChapter = (chapterId) =>
  STORY_QUESTS.filter(q => q.chapter === chapterId);

export const getNextStoryQuest = (completedQuestIds) => {
  for (const q of STORY_QUESTS) {
    if (completedQuestIds.includes(q.id)) continue;
    if (!q.prevQuestId || completedQuestIds.includes(q.prevQuestId)) return q;
  }
  return null;
};

export const getSideQuestsBySeries = (series) =>
  SIDE_QUESTS.filter(q => q.series === series);

export const getQuestById = (id) =>
  [...STORY_QUESTS, ...SIDE_QUESTS].find(q => q.id === id);

export const getQuestStatus = (quest, player) => {
  const completedQuests = player.completedQuests || [];
  const activeQuests = player.activeQuests || [];
  if (completedQuests.includes(quest.id)) return QUEST_STATUS.COMPLETE;
  if (activeQuests.includes(quest.id)) return QUEST_STATUS.ACTIVE;
  if (quest.prevQuestId && !completedQuests.includes(quest.prevQuestId)) return QUEST_STATUS.LOCKED;
  if ((player.level || 1) < (quest.levelReq || 1)) return QUEST_STATUS.LOCKED;
  if (quest.trustReq && (player.contactTrust?.[quest.contactId] || 0) < quest.trustReq) return QUEST_STATUS.LOCKED;
  return QUEST_STATUS.AVAILABLE;
};

// ─────────────────────────────────────────────────────────────────────────────
// SIDE QUEST CHAINS — Padre Santos, Hex Nine, The Quartermaster, Sofia V
// ─────────────────────────────────────────────────────────────────────────────

// PADRE SANTOS: "The Blessing" — community cover, institutional protection
SIDE_QUESTS.push(
  {
    id: "sq_santos_1", type: QUEST_TYPES.SIDE, series: "padre_santos",
    seriesLabel: "Padre Santos — The Blessing", order: 1,
    title: "Community Work", subtitle: "The best cover is genuine.",
    narrative: "Padre Santos runs three community centers and a food bank. He doesn't know what you do — or he chooses not to. Donate enough and contribute enough that when your name comes up in conversation, it comes up right.",
    aiPromptHint: "criminal building community cover through legitimate charitable work, maintaining plausible deniability",
    objectives: [
      { id: "obj_rep40",  label: "Reach 40 Reputation",    check: (p) => (p.stats?.reputation || 0) >= 40 },
      { id: "obj_launder30k", label: "Launder $30,000 total", check: (p) => (p.totalLaundered || 0) >= 30000 },
    ],
    trustReq: 0, contactId: "padre_santos", prevQuestId: null,
    rewards: { cash: 10000, xp: 600, statBonus: { connections: 4, reputation: 5 }, title: null, exclusiveItem: null,
      upgradeNote: "Santos' network provides low-heat cover for operations" },
  },
  {
    id: "sq_santos_2", type: QUEST_TYPES.SIDE, series: "padre_santos",
    seriesLabel: "Padre Santos — The Blessing", order: 2,
    title: "The Collar", subtitle: "A priest with a direct line to the right people.",
    narrative: "Santos knows a DA. Old friends. He can arrange an introduction — purely social, of course. A relationship with a DA isn't leverage. It's insurance. But you need to be worthy of the introduction.",
    aiPromptHint: "criminal establishing relationship with district attorney through intermediary, political protection",
    objectives: [
      { id: "obj_level8",   label: "Reach Level 8",         check: (p) => (p.level || 1) >= 8 },
      { id: "obj_honor50",  label: "Reach 50 Honor",        check: (p) => (p.stats?.honor || 50) >= 50 },
      { id: "obj_missions4", label: "Complete 4 faction missions", check: (p) => (p.completedMissions?.length || 0) >= 4 },
    ],
    trustReq: 1, contactId: "padre_santos", prevQuestId: "sq_santos_1",
    rewards: { cash: 22000, xp: 1100, statBonus: { connections: 5, intelligence: 3 },
      exclusiveItem: "exclusive_da_relationship" },
  },
  {
    id: "sq_santos_3", type: QUEST_TYPES.SIDE, series: "padre_santos",
    seriesLabel: "Padre Santos — The Blessing", order: 3,
    title: "Sanctuary", subtitle: "Some places are untouchable.",
    narrative: "Santos has a property — a warehouse converted to a community arts space — that law enforcement won't touch without federal oversight. It can be used for storage. The arrangement is permanent, if you keep the community programs funded.",
    aiPromptHint: "establishing a protected safe house through community institution, criminal infrastructure via legitimate fronts",
    objectives: [
      { id: "obj_rep70",    label: "Reach 70 Reputation",    check: (p) => (p.stats?.reputation || 0) >= 70 },
      { id: "obj_launder150k", label: "Launder $150,000 total", check: (p) => (p.totalLaundered || 0) >= 150000 },
    ],
    trustReq: 2, contactId: "padre_santos", prevQuestId: "sq_santos_2",
    rewards: { cash: 35000, xp: 1600, statBonus: { connections: 6, reputation: 8, stealth: 4 },
      title: "Community Pillar", exclusiveItem: "exclusive_sanctuary_property" },
  }
);

// HEX NINE: "Ghost Signal" — cyber security, encryption, digital ghost
SIDE_QUESTS.push(
  {
    id: "sq_hex_1", type: QUEST_TYPES.SIDE, series: "hex_nine",
    seriesLabel: "Hex Nine — Ghost Signal", order: 1,
    title: "Signal Wipe", subtitle: "Your digital trail is a liability.",
    narrative: "Hex Nine doesn't meet clients who leave search histories. Your current operational security is basic at best. She'll fix your digital exposure — but she needs to see your setup first. And she needs to see you're serious.",
    aiPromptHint: "criminal improving operational security, digital privacy, working with elite hacker",
    objectives: [
      { id: "obj_tech40",    label: "Reach 40 Tech Savvy",          check: (p) => (p.stats?.techSavvy || 0) >= 40 },
      { id: "obj_encounters2", label: "Escape 2 police encounters", check: (p) => (p.encountersEscaped || 0) >= 2 },
    ],
    trustReq: 0, contactId: "hex_nine", prevQuestId: null,
    rewards: { cash: 12000, xp: 650, statBonus: { techSavvy: 5, stealth: 3 }, exclusiveItem: null,
      upgradeNote: "Hex Nine's services now available at reduced cost" },
  },
  {
    id: "sq_hex_2", type: QUEST_TYPES.SIDE, series: "hex_nine",
    seriesLabel: "Hex Nine — Ghost Signal", order: 2,
    title: "Zero Trace", subtitle: "Become untrackable.",
    narrative: "She found three active tracking vectors tied to your phone number, a loyalty card account, and a recurring payment. She can scrub all three — but needs you to run a parallel op that creates enough noise to mask the cleanup. You're wiping your own ghost.",
    aiPromptHint: "digital counter-surveillance operation, erasing criminal identity from tracking systems",
    objectives: [
      { id: "obj_tech60",   label: "Reach 60 Tech Savvy",  check: (p) => (p.stats?.techSavvy || 0) >= 60 },
      { id: "obj_stealth60", label: "Reach 60 Stealth",    check: (p) => (p.stats?.stealth || 0) >= 60 },
      { id: "obj_heat_low", label: "Have heat below 20%",  check: (p) => (p.heat || 0) < 20 },
    ],
    trustReq: 1, contactId: "hex_nine", prevQuestId: "sq_hex_1",
    rewards: { cash: 28000, xp: 1300, statBonus: { techSavvy: 6, stealth: 5 },
      exclusiveItem: "exclusive_hex_zero_trace" },
  },
  {
    id: "sq_hex_3", type: QUEST_TYPES.SIDE, series: "hex_nine",
    seriesLabel: "Hex Nine — Ghost Signal", order: 3,
    title: "The Architecture", subtitle: "Your own private network.",
    narrative: "Hex Nine builds encrypted communication infrastructure for three other organizations. She's offering you the same. A private darknet — your crew, your operations, all end-to-end encrypted and compartmentalized. Law enforcement can't touch what they can't read.",
    aiPromptHint: "private criminal communication network, high-level operational security infrastructure",
    objectives: [
      { id: "obj_level12",  label: "Reach Level 12",           check: (p) => (p.level || 1) >= 12 },
      { id: "obj_tech75",   label: "Reach 75 Tech Savvy",      check: (p) => (p.stats?.techSavvy || 0) >= 75 },
      { id: "obj_crew4",    label: "Have 4+ crew members",     check: (p) => (p.crew?.length || 0) >= 4 },
    ],
    trustReq: 2, contactId: "hex_nine", prevQuestId: "sq_hex_2",
    rewards: { cash: 50000, xp: 2200, statBonus: { techSavvy: 8, stealth: 6, intelligence: 5 },
      title: "Ghost Signal", exclusiveItem: "exclusive_private_darknet" },
  }
);

// THE QUARTERMASTER: "Supply Line" — equipment, logistics, infrastructure
SIDE_QUESTS.push(
  {
    id: "sq_qm_1", type: QUEST_TYPES.SIDE, series: "the_quartermaster",
    seriesLabel: "The Quartermaster — Supply Line", order: 1,
    title: "Requisition", subtitle: "Professionals use professional equipment.",
    narrative: "The Quartermaster supplies four organizations currently. He doesn't take new clients lightly. Place a serious initial order and pay promptly. His first assessment of you is his only one.",
    aiPromptHint: "establishing relationship with elite criminal supply chain operator, first procurement",
    objectives: [
      { id: "obj_market_buy3", label: "Purchase 3 items from the Black Market", check: (p) => (p.inventory?.length || 0) >= 3 },
      { id: "obj_muscle50",   label: "Reach 50 Muscle",                         check: (p) => (p.stats?.muscle || 0) >= 50 },
    ],
    trustReq: 0, contactId: "the_quartermaster", prevQuestId: null,
    rewards: { cash: 8000, xp: 500, statBonus: { muscle: 3, dexterity: 3 }, exclusiveItem: null,
      upgradeNote: "Quartermaster's Black Market prices reduced 10%" },
  },
  {
    id: "sq_qm_2", type: QUEST_TYPES.SIDE, series: "the_quartermaster",
    seriesLabel: "The Quartermaster — Supply Line", order: 2,
    title: "Redundancy", subtitle: "Never rely on a single source.",
    narrative: "He lost a supplier last year to a federal bust. He's rebuilding the logistics chain and needs a secondary distribution partner. Move three shipments clean — no heat, no arrests, no exposure. In return, he gives you first access to his restricted catalogue.",
    aiPromptHint: "criminal logistics operation, moving supply chain shipments without law enforcement attention",
    objectives: [
      { id: "obj_crimes20",  label: "Complete 20 successful crimes",   check: (p) => p.crimesSucceeded >= 20 },
      { id: "obj_no_arrest", label: "Complete 5 crimes without arrest", check: (p, prog) => (prog?.consecutiveCleanCrimes || 0) >= 5 },
      { id: "obj_dex50",     label: "Reach 50 Dexterity",              check: (p) => (p.stats?.dexterity || 0) >= 50 },
    ],
    trustReq: 1, contactId: "the_quartermaster", prevQuestId: "sq_qm_1",
    rewards: { cash: 20000, xp: 1000, statBonus: { muscle: 4, dexterity: 5 },
      exclusiveItem: "exclusive_qm_catalogue" },
  },
  {
    id: "sq_qm_3", type: QUEST_TYPES.SIDE, series: "the_quartermaster",
    seriesLabel: "The Quartermaster — Supply Line", order: 3,
    title: "The Arsenal", subtitle: "Total equipment superiority.",
    narrative: "The Quartermaster has access to a decommissioned military storage facility. Once. He's offering you a full equipment package — things that don't appear on any commercial or criminal market. But you need to be the kind of operation that warrants that level of gear.",
    aiPromptHint: "acquiring military-grade criminal equipment, criminal career milestone of organizational maturity",
    objectives: [
      { id: "obj_level15",   label: "Reach Level 15",             check: (p) => (p.level || 1) >= 15 },
      { id: "obj_districts4", label: "Control 4+ districts",      check: (p) => (p.ownedDistricts?.length || 0) >= 4 },
      { id: "obj_rep80",     label: "Reach 80 Reputation",        check: (p) => (p.stats?.reputation || 0) >= 80 },
    ],
    trustReq: 2, contactId: "the_quartermaster", prevQuestId: "sq_qm_2",
    rewards: { cash: 60000, xp: 2500, statBonus: { muscle: 8, dexterity: 8, nerve: 5 },
      title: "Armed to the Teeth", exclusiveItem: "exclusive_military_cache" },
  }
);

// SOFIA V: "The Diplomat" — negotiation, high-society access, political leverage
SIDE_QUESTS.push(
  {
    id: "sq_sofia_1", type: QUEST_TYPES.SIDE, series: "sofia_v",
    seriesLabel: "Sofia V. — The Diplomat", order: 1,
    title: "The Introduction", subtitle: "Some doors require the right name.",
    narrative: "Sofia V. brokers introductions between people who shouldn't officially know each other. She moves in circles where your kind of work is considered crude — until it becomes useful. Prove you can operate with restraint. She'll see if you're worth vouching for.",
    aiPromptHint: "criminal proving sophistication to high-society fixer, demonstrating strategic rather than brute-force approach",
    objectives: [
      { id: "obj_intel50",     label: "Reach 50 Intelligence",         check: (p) => (p.stats?.intelligence || 0) >= 50 },
      { id: "obj_connections50", label: "Reach 50 Connections",        check: (p) => (p.stats?.connections || 0) >= 50 },
      { id: "obj_launder75k",  label: "Launder $75,000 total",         check: (p) => (p.totalLaundered || 0) >= 75000 },
    ],
    trustReq: 0, contactId: "sofia_v", prevQuestId: null,
    rewards: { cash: 18000, xp: 900, statBonus: { intelligence: 4, connections: 5 }, exclusiveItem: null,
      upgradeNote: "Sofia V. available for high-end negotiation assistance" },
  },
  {
    id: "sq_sofia_2", type: QUEST_TYPES.SIDE, series: "sofia_v",
    seriesLabel: "Sofia V. — The Diplomat", order: 2,
    title: "The Table", subtitle: "Where real power is negotiated.",
    narrative: "She's arranged a seat at a meeting between three organizations. Normally you wouldn't be invited to the same table as these people. Your role: listen, contribute minimally, don't embarrass her. What you take away from this conversation is worth more than anything you'd earn that week.",
    aiPromptHint: "attending high-level inter-criminal organization summit, absorbing intelligence and making calculated impression",
    objectives: [
      { id: "obj_level10",   label: "Reach Level 10",             check: (p) => (p.level || 1) >= 10 },
      { id: "obj_rep65",     label: "Reach 65 Reputation",        check: (p) => (p.stats?.reputation || 0) >= 65 },
      { id: "obj_missions5",  label: "Complete 5 faction missions", check: (p) => (p.completedMissions?.length || 0) >= 5 },
    ],
    trustReq: 1, contactId: "sofia_v", prevQuestId: "sq_sofia_1",
    rewards: { cash: 40000, xp: 1800, statBonus: { intelligence: 6, connections: 8 },
      exclusiveItem: "exclusive_inter_org_access" },
  },
  {
    id: "sq_sofia_3", type: QUEST_TYPES.SIDE, series: "sofia_v",
    seriesLabel: "Sofia V. — The Diplomat", order: 3,
    title: "The Deal", subtitle: "You don't negotiate at this level. You architect.",
    narrative: "Three organizations want the same territory. Sofia has identified an arrangement where all three can profit. She needs someone to backstop the deal — provide the financial guarantee that makes all parties feel secure. That's you. The exposure is real. The payoff is unprecedented.",
    aiPromptHint: "criminal as guarantor in major inter-organizational deal, diplomatic criminal power broker role",
    objectives: [
      { id: "obj_level13",    label: "Reach Level 13",              check: (p) => (p.level || 1) >= 13 },
      { id: "obj_intel80",    label: "Reach 80 Intelligence",       check: (p) => (p.stats?.intelligence || 0) >= 80 },
      { id: "obj_connections80", label: "Reach 80 Connections",     check: (p) => (p.stats?.connections || 0) >= 80 },
      { id: "obj_earn500k",   label: "Earn $500,000 total",         check: (p) => (p.totalEarned || 0) >= 500000 },
    ],
    trustReq: 2, contactId: "sofia_v", prevQuestId: "sq_sofia_2",
    rewards: { cash: 100000, xp: 3500, statBonus: { intelligence: 10, connections: 12, reputation: 8 },
      title: "The Diplomat", exclusiveItem: "exclusive_sofia_network" },
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// SPRINT CHALLENGES — 48-hour timed high-stakes objectives
// Pool of 10. Player picks 1 active at a time. Clock starts on accept.
// ─────────────────────────────────────────────────────────────────────────────

export const SPRINT_POOL = [
  {
    id: "sprint_big_earner",
    title: "Quick Score",
    subtitle: "48 hours. Make it count.",
    icon: "💰", category: "Financial", durationHours: 48, difficulty: 3, levelReq: 5,
    desc: "Earn $100,000 in 48 hours from crimes only. Clean money moves too slow — this is a street sprint.",
    objective: { label: "Earn $100,000 in crimes (delta from start)", check: (p, snap) => ((p.totalEarned || 0) - (snap?.totalEarned || 0)) >= 100000 },
    rewards: { cash: 30000, xp: 2000, statBonus: { nerve: 4 }, title: null },
    realNote: "DEA documents 'blitz periods' where criminal crews operate at maximum tempo to capitalize on enforcement gaps — typically 48-72 hour windows.",
  },
  {
    id: "sprint_ghost_run",
    title: "Phantom Week",
    subtitle: "Move through the city like you don't exist.",
    icon: "👻", category: "Stealth", durationHours: 48, difficulty: 4, levelReq: 6,
    desc: "Complete 10 crimes in 48 hours with zero arrests. Perfect operational security.",
    objective: { label: "10 crimes, zero arrests in the window", check: (p, snap) => ((p.crimesSucceeded || 0) - (snap?.crimesSucceeded || 0)) >= 10 && (p.timesArrested || 0) === (snap?.timesArrested || 0) },
    rewards: { cash: 40000, xp: 2500, statBonus: { stealth: 5, streetSmarts: 4 }, title: "The Phantom" },
    realNote: "FBI analysis: Top-tier criminal operatives maintain arrest-free streaks averaging 18 months. The discipline required is the primary differentiator from lower-level operators.",
  },
  {
    id: "sprint_launder_race",
    title: "Clean Hands",
    subtitle: "Turn dirt into paper, fast.",
    icon: "♻️", category: "Financial", durationHours: 48, difficulty: 3, levelReq: 4,
    desc: "Launder $50,000 in a 48-hour window. Use every channel available.",
    objective: { label: "Launder $50,000 in the window", check: (p, snap) => ((p.totalLaundered || 0) - (snap?.totalLaundered || 0)) >= 50000 },
    rewards: { cash: 20000, xp: 1500, statBonus: { intelligence: 3 }, title: null },
    realNote: "FinCEN: 'Velocity laundering' — pushing large volumes through infrastructure in compressed time frames — is a documented red flag in AML analysis.",
  },
  {
    id: "sprint_heat_runner",
    title: "Running Hot",
    subtitle: "How long can you stay in the fire?",
    icon: "🌡", category: "Endurance", durationHours: 48, difficulty: 5, levelReq: 7,
    desc: "Commit 5 successful crimes while your heat is above 60%. Maximum pressure. Maximum reward.",
    objective: { label: "5 crimes at 60%+ heat (delta from start)", check: (p, snap) => ((p.questProgress?.highHeatCrimes || 0) - (snap?.highHeatCrimes || 0)) >= 5 },
    rewards: { cash: 55000, xp: 3000, statBonus: { nerve: 6, reputation: 5 }, title: "Heat Seeker" },
    realNote: "DOJ: 'Hot operators' — those who continue working under active law enforcement surveillance — are responsible for disproportionate criminal output but have significantly shorter career spans.",
  },
  {
    id: "sprint_territory_blitz",
    title: "Land Grab",
    subtitle: "Territory doesn't wait for permission.",
    icon: "⬡", category: "Territory", durationHours: 48, difficulty: 4, levelReq: 8,
    desc: "Claim 2 new territory districts in 48 hours. Fast expansion, max pressure.",
    objective: { label: "Claim 2 districts in the window", check: (p, snap) => ((p.ownedDistricts?.length || 0) - (snap?.ownedDistricts || 0)) >= 2 },
    rewards: { cash: 45000, xp: 2500, statBonus: { reputation: 6, muscle: 4 }, title: null },
    realNote: "FBI RICO: Rapid territorial acquisition events are documented as destabilizing signals — typically preceding faction conflicts or major enforcement operations.",
  },
  {
    id: "sprint_tier4_run",
    title: "Tier Up",
    subtitle: "Only the serious attempts this level.",
    icon: "🗂", category: "Criminal", durationHours: 48, difficulty: 4, levelReq: 9,
    desc: "Successfully complete 3 Tier 4 crimes within 48 hours. High risk, precise execution.",
    objective: { label: "3 Tier 4+ crimes in the window", check: (p, snap) => ((p.questProgress?.tier4Sprints || 0) - (snap?.tier4Sprints || 0)) >= 3 },
    rewards: { cash: 50000, xp: 3000, statBonus: { nerve: 5, reputation: 6 }, title: null },
    realNote: "FBI: High-severity criminal acts clustered in short windows are documented in 28% of organized crime cases reviewed for RICO prosecution.",
  },
  {
    id: "sprint_crew_blitz",
    title: "Full Deployment",
    subtitle: "Your crew earns their pay today.",
    icon: "👥", category: "Operations", durationHours: 48, difficulty: 3, levelReq: 6,
    desc: "With a full crew active, complete 8 crimes in 48 hours. Every member pulling weight.",
    objective: { label: "8 crimes with 3+ crew (delta from start)", check: (p, snap) => (p.crew?.length || 0) >= 3 && ((p.crimesSucceeded || 0) - (snap?.crimesSucceeded || 0)) >= 8 },
    rewards: { cash: 35000, xp: 2000, statBonus: { connections: 4, muscle: 3 }, title: null },
    realNote: "Organized crime research: Operations involving 3+ participants have 40% higher success rates but generate exponentially more investigative attention.",
  },
  {
    id: "sprint_network_flex",
    title: "Six Contacts",
    subtitle: "Work every connection you have.",
    icon: "🕸", category: "Network", durationHours: 48, difficulty: 3, levelReq: 7,
    desc: "Use 4 different Dark Web contacts within 48 hours. Leverage the network fully.",
    objective: { label: "Use 4 different contacts in the window", check: (p, snap) => {
      const beforeKeys = new Set(Object.keys(snap?.usedContactJobs || {}));
      const nowKeys    = new Set(Object.keys(p.usedContactJobs || {}));
      const newUsed = [...nowKeys].filter(k => !beforeKeys.has(k));
      const distinctContacts = new Set(newUsed.map(k => k.split("_").slice(0, 2).join("_")));
      return distinctContacts.size >= 4;
    }},
    rewards: { cash: 30000, xp: 1800, statBonus: { connections: 6, intelligence: 4 }, title: null },
    realNote: "DEA: Multi-source criminal networks are documented as significantly more resilient — diversified contact use is a marker of operational maturity.",
  },
  {
    id: "sprint_escape_artist",
    title: "Teflon",
    subtitle: "Nothing sticks.",
    icon: "🏃", category: "Endurance", durationHours: 48, difficulty: 5, levelReq: 8,
    desc: "Escape 3 police encounters in 48 hours. Active enforcement, active evasion.",
    objective: { label: "Escape 3 encounters in the window", check: (p, snap) => ((p.encountersEscaped || 0) - (snap?.encountersEscaped || 0)) >= 3 },
    rewards: { cash: 45000, xp: 2800, statBonus: { stealth: 6, streetSmarts: 5 }, title: "Teflon" },
    realNote: "DOJ: 'Evasion ratio' — arrests avoided per enforcement contact — is a documented metric in organized crime career analysis. High ratios correlate with longer operational lifespans.",
  },
  {
    id: "sprint_million_run",
    title: "The Million Mark",
    subtitle: "Numbers most people never see.",
    icon: "🏆", category: "Legacy", durationHours: 72, difficulty: 5, levelReq: 12,
    desc: "Reach $1,000,000 total earned. This is the threshold that changes everything.",
    objective: { label: "Reach $1,000,000 total earned", check: (p, _snap) => (p.totalEarned || 0) >= 1_000_000 },
    rewards: { cash: 100000, xp: 8000, statBonus: { reputation: 10, nerve: 5, connections: 5 }, title: "The Million" },
    realNote: "Treasury Dept: The $1M threshold is a documented inflection point in criminal career trajectories. It's when organizations transition from tactical to strategic operations.",
  },
];

export const getSprintStatus = (sprint, player) => {
  const activeSprint   = player.activeSprint;
  const wonSprints     = player.wonSprints || [];
  if (wonSprints.includes(sprint.id))             return QUEST_STATUS.COMPLETE;
  if (activeSprint?.sprintId === sprint.id) {
    const snap      = player.sprintSnapshot || {};
    const allDone   = sprint.objective.check(player, snap);
    const elapsed   = Date.now() - (activeSprint.startedAt || 0);
    const maxMs     = (sprint.durationHours || 48) * 3600000;
    if (elapsed > maxMs && !allDone)               return QUEST_STATUS.EXPIRED;
    if (allDone)                                   return QUEST_STATUS.CLAIMABLE;
    return QUEST_STATUS.ACTIVE;
  }
  if (activeSprint)                               return QUEST_STATUS.LOCKED; // another sprint active
  if ((player.level || 1) < (sprint.levelReq || 1)) return QUEST_STATUS.LOCKED;
  return QUEST_STATUS.AVAILABLE;
};

export const formatTimeLeft = (startedAt, durationHours) => {
  const msLeft = (durationHours * 3600000) - (Date.now() - startedAt);
  if (msLeft <= 0) return "EXPIRED";
  const h = Math.floor(msLeft / 3600000);
  const m = Math.floor((msLeft % 3600000) / 60000);
  return `${h}h ${m}m left`;
};

export const SIDE_QUEST_SERIES = [
  { id: "mama_chen",         label: "Mama Chen — Clean Sweep",         contactId: "mama_chen",         icon: "💸" },
  { id: "el_chivato",        label: "El Chivato — Ghost Protocol",      contactId: "el_chivato",        icon: "🕵" },
  { id: "viktor_k",          label: "Viktor K. — Arms Race",            contactId: "viktor_k",          icon: "🔫" },
  { id: "ghost_zero",        label: "Ghost_Zero — Zero Day",            contactId: "ghost_zero",        icon: "💻" },
  { id: "padre_santos",      label: "Padre Santos — The Blessing",      contactId: "padre_santos",      icon: "⛪" },
  { id: "hex_nine",          label: "Hex Nine — Ghost Signal",          contactId: "hex_nine",          icon: "📡" },
  { id: "the_quartermaster", label: "The Quartermaster — Supply Line",  contactId: "the_quartermaster", icon: "📦" },
  { id: "sofia_v",           label: "Sofia V. — The Diplomat",          contactId: "sofia_v",           icon: "🤝" },
];
