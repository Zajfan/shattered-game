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

export const SIDE_QUEST_SERIES = [
  { id: "mama_chen",  label: "Mama Chen — Clean Sweep",    contactId: "mama_chen",  icon: "💸" },
  { id: "el_chivato", label: "El Chivato — Ghost Protocol", contactId: "el_chivato", icon: "🕵" },
  { id: "viktor_k",   label: "Viktor K. — Arms Race",       contactId: "viktor_k",   icon: "🔫" },
  { id: "ghost_zero", label: "Ghost_Zero — Zero Day",       contactId: "ghost_zero", icon: "💻" },
];
