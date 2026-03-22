// src/data/quests/rewards.js — All quest reward definitions

// ── Titles ────────────────────────────────────────────────────────────────
export const TITLES = {
  // Story arc titles
  the_nobody:        { id: "the_nobody",        label: "The Nobody",          color: "#5a5248", desc: "You started at zero." },
  street_operator:   { id: "street_operator",   label: "Street Operator",     color: "#3d8c5a", desc: "Ch.1 complete — you have a reputation." },
  the_connected:     { id: "the_connected",      label: "The Connected",       color: "#5a7ec8", desc: "Ch.2 complete — your network is real." },
  syndicate_player:  { id: "syndicate_player",   label: "Syndicate",           color: "#a85fd4", desc: "Ch.3 complete — you operate at scale." },
  the_apex:          { id: "the_apex",           label: "The Apex",            color: "#c0392b", desc: "Ch.4 complete — the top of the criminal world." },
  // Side quest titles
  the_cleaner_title: { id: "the_cleaner_title",  label: "The Cleaner",         color: "#5a7ec8", desc: "Completed Sofia V.'s full chain." },
  ghost_protocol:    { id: "ghost_protocol",     label: "Ghost Protocol",      color: "#2c3e50", desc: "Mastered countersurveillance with El Chivato." },
  arms_broker:       { id: "arms_broker",        label: "Arms Broker",         color: "#c0392b", desc: "Completed Viktor K.'s full weapons chain." },
  the_banker:        { id: "the_banker",         label: "The Banker",          color: "#d4a827", desc: "Completed Mama Chen's full laundering chain." },
  quartermaster:     { id: "quartermaster",      label: "Quartermaster",       color: "#5a7ec8", desc: "Completed Q's full equipment chain." },
  // Contract titles
  contractor:        { id: "contractor",         label: "Contractor",          color: "#8c7a3d", desc: "Completed 10 anonymous contracts." },
  fixer_title:       { id: "fixer_title",        label: "The Fixer",           color: "#a85fd4", desc: "Completed 25 anonymous contracts." },
  // Special
  untouchable:       { id: "untouchable",        label: "Untouchable",         color: "#f1c40f", desc: "Completed the main story without being arrested." },
  legend:            { id: "legend",             label: "Legend",              color: "var(--amber)", desc: "Completed all quest content in the game." },
};

// ── Exclusive Market Items (only from quests) ──────────────────────────────
export const QUEST_EXCLUSIVE_ITEMS = {
  encrypted_phone: {
    id: "encrypted_phone",
    name: "Encrypted Burner Array",
    category: "Operational Equipment",
    description: "Military-grade encrypted comm system. Virtually undetectable. Makes all operations 10% safer.",
    statBonus: { stealth: 10, techSavvy: 5 },
    crimeBonus: {},          // Global -10% heat gain per crime
    globalHeatReduction: 10, // Applied per crime
    heatOnPossession: 0,
    rarity: "legendary",
    questSource: "Ch.2 reward",
  },
  cartel_contact: {
    id: "cartel_contact",
    name: "Cartel Direct Line",
    category: "Criminal Services",
    description: "Direct encrypted line to a cartel logistics manager. Bypasses street-level middlemen entirely.",
    statBonus: { connections: 15 },
    crimeBonus: { drug_cartel_operation: 25, drug_trafficking_mid: 20 },
    heatOnPossession: 5,
    rarity: "legendary",
    questSource: "Ch.3 reward",
  },
  ghost_plate: {
    id: "ghost_plate",
    name: "Ghost License Plates",
    category: "Operational Equipment",
    description: "Electronically switching license plates. Eliminates vehicle-based heat generation entirely.",
    statBonus: { stealth: 8 },
    crimeBonus: { car_theft: 30, chop_shop: 20 },
    heatOnPossession: 0,
    heatReduction: 10,
    rarity: "legendary",
    questSource: "Side quest — Viktor K.",
  },
  clean_identity: {
    id: "clean_identity",
    name: "Clean Identity Package",
    category: "Forged Documents",
    description: "Complete new identity: biometric passport, SSN, credit history, property. The full reset.",
    statBonus: { stealth: 12 },
    crimeBonus: {},
    heatReduction: 60,
    heatOnPossession: 0,
    rarity: "legendary",
    questSource: "Side quest — Hex Nine",
  },
  federal_informant_file: {
    id: "federal_informant_file",
    name: "Federal Informant File",
    category: "Criminal Services",
    description: "The identities of active federal informants in your region. Eliminates informant-related events.",
    statBonus: { connections: 8, intelligence: 8 },
    crimeBonus: {},
    suppressesInformantEvents: true,
    heatOnPossession: 0,
    rarity: "legendary",
    questSource: "Side quest — El Chivato",
  },
};

// ── Unlockable Contacts (from quest completion) ────────────────────────────
export const UNLOCKABLE_CONTACTS = {
  state_senator: {
    id: "state_senator",
    name: "Senator Harlan T.",
    alias: "The Statesman",
    role: "Political Asset",
    unlockSource: "Ch.4 main story",
    desc: "A sitting state senator on the payroll. Reduces federal heat generation by 30% while active.",
    jobs: [
      { id: "sen_immunity", label: "Legislative Immunity", desc: "Push through immunity provisions for a pending case. Removes active arrest warrants.", type: "heat_reduction", amount: 50, price: 75000, cooldownHours: 168 },
      { id: "sen_contracts", label: "Infrastructure Contracts", desc: "State contracts laundered through your shell companies.", type: "launder", conversionRate: 0.92, minDirty: 10000, maxDirty: 500000, cooldownHours: 72 },
    ],
  },
  cartel_logistics: {
    id: "cartel_logistics",
    name: "La Señora",
    alias: "The Logistics Manager",
    role: "Cartel Supply Chain",
    unlockSource: "Ch.3 main story",
    desc: "Controls the cartel's US-side receiving infrastructure. Exclusive supply contracts.",
    jobs: [
      { id: "lg_shipment", label: "Priority Shipment", desc: "Guaranteed product delivery. No seizure risk.", type: "stat_boost", stat: "connections", amount: 5, price: 20000, cooldownHours: 48 },
    ],
  },
  fbi_mole: {
    id: "fbi_mole",
    name: "Agent Cole R.",
    alias: "The Mole",
    role: "Inside FBI Asset",
    unlockSource: "Complete Ghost Protocol title",
    desc: "An FBI agent on retainer. Tips you to active operations before they execute.",
    jobs: [
      { id: "mole_tip", label: "Operation Tip-Off", desc: "24-hour advance warning of any planned law enforcement operations.", type: "heat_reduction", amount: 30, price: 40000, cooldownHours: 96 },
    ],
  },
};

export const getTitle = (id)   => TITLES[id] || null;
export const allTitles         = () => Object.values(TITLES);
export const getQuestItem = (id)=> QUEST_EXCLUSIVE_ITEMS[id] || null;
export const allQuestItems     = () => Object.values(QUEST_EXCLUSIVE_ITEMS);
