# Shattered — Game Design Document v0.1
**Genre:** Crime PBBG (Persistent Browser-Based Game)
**Framework:** React + Vite frontend, Express backend
**Tone:** Street-level organized crime simulator. Gritty, contemporary. You're building a criminal empire from nothing.
**Inspiration:** Torn City (core PBBG loop), Breaking Bad (escalation), GTA Online (crew dynamics)

---

## 💀 The Premise

> *You arrived in the city with nothing. No connections. No history. Clean slate — which means no one owes you anything, and no one's watching your back.*
>
> *That changes. It always changes.*
>
> *Pick a name. Pick a faction. Pick a hustle. The city doesn't care how you get to the top — only whether you do.*

Shattered is a persistent criminal career simulation. Players build a character from street level to criminal elite through crimes, crew management, territory control, faction politics, and market manipulation. The game runs on a real-time engine: energy regenerates, training ticks forward, territory income arrives on schedule.

The world is not static. Factions compete for territory. The heat system means careless players lose everything. Events disrupt plans. Encounters punish the lazy. Success requires strategy, not just grinding.

---

## ⚙️ Core Resources

| Resource | Max | Regen | Purpose |
|---|---|---|---|
| **Energy** | 100 (upgradeable) | Passive regen | Actions, crimes, training |
| **Cash** | Unlimited | Earned | Primary currency — all purchases |
| **Dirty Cash** | Unlimited | Earned via crimes | Must be laundered to use freely |
| **Heat** | 0–100 | Accumulates | Surveillance level — affects difficulty, triggers arrests |
| **Health** | 0–100 | Slow passive | Affects crime success, encounter outcomes |
| **XP** | Unlimited | Earned | Level progression |

### Heat System
Heat is the game's risk-management axis. It builds with every crime and decay naturally over time.

| Heat Range | Status | Effect |
|---|---|---|
| 0–14 | Clean | No modifiers |
| 15–29 | Noticed | Slight success rate reduction |
| 30–49 | Watched | Crime risk elevated, encounters more common |
| 50–69 | Hot | Significant penalties, frequent encounters |
| 70–89 | Wanted | Auto-arrest risk on failed crimes (40%), prison risk |
| 90–100 | Manhunt | Only high-end crime available, crew deserts |

Heat decays:
- Naturally over time (~1% per 15 minutes)
- Faster in prison (laying low counts)
- Via market items (false IDs, fixers, safe houses)
- Via Dark Web contact jobs

---

## 📊 Player Stats

| Stat | Governs |
|---|---|
| **Muscle** | Physical crimes, combat encounters, prison survival |
| **Dexterity** | Stealth crimes, escape chance, pickpocketing |
| **Brain** | Tech crimes, laundering efficiency, interrogation resistance |
| **Nerve** | Crime tier access, high-risk operation composure |
| **Charisma** | Recruiting, faction standing, NPC negotiation |
| **Street Smarts** | Event outcomes, encounter reads, market intuition |
| **Reputation** | Faction access, crew loyalty multiplier, market pricing |
| **Honor** | Encounter moral choices, certain faction gates |

Stats are increased through:
1. **Training** — Dedicated activities with energy cost and time duration
2. **Crew bonuses** — Hired members contribute stat bonuses passively
3. **Faction missions** — Story-tied stat rewards
4. **Quest rewards** — Specific stat bonuses for completion

---

## 🔫 Crimes

Tiered operations requiring energy and stat thresholds. Crime outcomes are probabilistic — stat totals, heat, and equipped items all influence success chance.

### Tier Structure

| Tier | Unlock | Risk | Cash Range |
|---|---|---|---|
| 1 — Street | Level 1 | Low | $50–500 |
| 2 — Hustle | Level 5 | Medium | $500–3,000 |
| 3 — Operation | Level 10 | High | $3,000–15,000 |
| 4 — Syndicate | Level 20 | Very High | $15,000–75,000 |
| 5 — Apex | Level 30 | Extreme | $75,000–500,000+ |

**All earnings from crimes are Dirty Cash.** Must be laundered before use in most markets. Money laundering has an efficiency fee (default 30% loss, reduceable via skills/contacts).

### Failure Consequences
- **Failed crime:** Chance of encounter spawning (police, rival, witness)
- **Failed crime at high heat (70+):** 40% chance of immediate arrest → Prison
- **Critical failure:** Health damage, crew injury, item loss

### Cooldowns
Crimes can have cooldown timers (seconds to minutes). Used to prevent trivial-mode grinding on best crime.

---

## 🏋️ Training

Stat improvement activities. Each costs energy and time. Some cost cash.

**Types:**
- **Gym** — Muscle, Dexterity (free but time-intensive)
- **Street education** — Brain, Street Smarts (free)
- **Intimidation practice** — Nerve, Charisma (free)
- **Private tutor** — Any stat (cash cost, faster gains)
- **Prison yard** — Muscle, Nerve (only in prison, no cost)
- **Faction school** — Faction-specific stats (requires faction membership)

Training runs in real-time. Start a session, come back when it completes. Cannot train during active prison sentence.

---

## 🧑‍🤝‍🧑 Crew System

Players hire NPCs who provide passive stat bonuses, crime bonuses, and loyalty-based morale effects.

### Crew Roles

| Role | Primary Benefit | Weekly Cost |
|---|---|---|
| **Enforcer** | +Muscle/Nerve, physical crime bonus | High |
| **Wheelman** | +Dexterity, vehicle crime bonus, escape | High |
| **Hacker** | +Brain, tech crime bonus | High |
| **Fixer** | +Charisma, heat reduction, laundering | Very High |
| **Smuggler** | +Street Smarts, import ops, item access | High |
| **Street Dealer** | Passive income, drug trade bonus | Medium |
| **Lookout** | Encounter early warning, heat reduction | Low |
| **Inside Man** | Bonus to specific crime type (varies) | Medium |

**Crew Loyalty (1-5):**
- Rises with weekly payroll payment
- Falls when payroll is missed
- At loyalty 1, crew may desert or turn informant
- At loyalty 5, unlocks unique crew-specific bonus mission

**Crew Cap:** Based on reputation stat. Starts at 3 max. Increases with faction rank.

---

## 🏛️ Factions

Five criminal organizations with distinct philosophies, crime bonuses, and territory control styles. Players join one faction — can be ejected, can defect.

| Faction | Style | Primary Crime Bonus | Territory Focus |
|---|---|---|---|
| **Los Fantasmas** | Street cartel. Brutal efficiency. | Drug trade, physical ops | Residential, Ports |
| **The Sinaloa Network** | International logistics. Clean money. | Smuggling, laundering | Airport, Financial |
| **CJNG** | Violence as policy. Fastest escalation. | Extortion, arms | Industrial, Suburbs |
| **The Bratva** | Old money, old discipline. | White collar, fraud | Finance, Casinos |
| **Ndrangheta** | Family above everything. Long game. | Construction, waste | Port, Industrial |

**Faction Progression:**
1. Associate → Soldier → Capo → Underboss → Boss (top players only)
2. Each rank unlocks faction-exclusive missions, gear, and territory access
3. Faction missions are hand-authored story beats, not procedural

**Faction Relations:**
Factions compete over territory. When two factions fight over a district, both player communities are involved. Owning contested territory becomes harder. Betrayal events fire.

---

## 🗺️ Territory System

The city is divided into districts across multiple cities. Players (and factions) can claim districts for passive income.

**District Properties:**
- **Passive income** — Weekly cash, automatically distributed
- **Crime bonus** — Certain districts boost specific crime types
- **Faction alignment** — Contested districts between factions
- **Control difficulty** — Cost and stat requirement to claim

**Claiming a District:**
- Pay the control cost (scales with district value)
- Maintain it (weekly upkeep, or lose control)
- Faction members defend it collectively

**District Types:**
- Residential — Low income, low friction
- Financial — High income, high heat
- Industrial — Crime bonus districts (drugs, weapons)
- Port/Airport — Smuggling premium
- Suburbs — Laundering-friendly

---

## 💸 Economy

### Currency Flow
```
Crime → Dirty Cash → Laundering (fee) → Clean Cash → Purchases
```

### Money Laundering
- **Market method:** Buy items at Laundromat tier prices, sell back at reduced rate
- **Contact method:** Dark Web fixers launder at better rates (trust-gated)
- **Faction method:** Faction economy laundering (rank-gated, best rates)

### Black Market
Player-to-player trading via a market interface. Items, materials, and contraband listed and bought by players. Prices player-determined. Market fees apply.

### Dark Web
Contact-based private economy. Fixed jobs available from NPCs unlocked by quest completion. Better rates, unique items, and services (stat boosts, heat reduction, fake IDs).

---

## 🏚️ Prison

Getting arrested isn't a dead end. Prison is a mini-game with its own progression.

**In Prison:**
- **Serve time** — Passive heat reduction. Boring but safe.
- **Yard workout** — Muscle and Nerve gains. Energy cost.
- **Study** — Brain and Street Smarts gains. Time cost.
- **Run jobs** — Cash-generating activities inside (risk of extended sentence on failure)
- **Escape attempt** — High-risk, requires specific items/stats

**Sentence Length:** Based on heat level at time of arrest and player tier. Higher heat = longer sentence.

**Prison release:** Heat drops significantly on release. Clean slate, but crew may have deserted if sentence was long.

---

## 📖 Quests & Progression

### Quest Types
- **Story Quests** — Hand-authored narrative chain. Each faction has a 5-part storyline. Plus a faction-neutral "Rise of Nobody" chain.
- **Contracts** — Objective-based timed goals. Earn specific amounts, reach stats, complete crime counts. Unique rewards.
- **Sprints** — 24-48 hour timed challenges. Competitive against the player's own baseline.
- **Daily Challenges** — Reset each day. Low bar, consistent small rewards.

### Story Chain: "Rise of Nobody"
5-chapter main quest available to all players, faction-independent:

1. **Chapter 1 — First Blood:** Learn the basics. First crime, first contact, first heat.
2. **Chapter 2 — Somebody's Watching:** The heat system introduced narratively. A cop is building a case. A fixer offers an out.
3. **Chapter 3 — The Network:** Faction choice becomes critical. A mission goes wrong. Someone gets arrested. Was it luck?
4. **Chapter 4 — Betrayal:** A crew member was informing. How far back does it go?
5. **Chapter 5 — Red Notice:** Full manhunt. You either go to ground, go to prison, or go to war with whoever set you up.

---

## 🎲 Events & Encounters

### Events (random, every ~45 minutes)
Narrative pop-ups requiring a decision. Choices have immediate consequences (heat, cash, crew loyalty, stat changes). Examples:
- A crew member got arrested. Do you pay for a lawyer?
- A rival faction is offering a partnership. Do you trust them?
- A witness is threatening to talk. How do you handle it?
- Police are offering a deal. Take it?

### Encounters (triggered on crime failure)
Interactive confrontations on a failed crime. Multiple resolution routes:

- **Police encounter** — Flee (Dexterity), bribe (Cash), submit (lose heat but go to prison), fight (Muscle, dangerous)
- **Rival encounter** — Talk (Charisma), fight (Muscle), pay (Cash), run
- **Witness encounter** — Intimidate, bribe, flee
- **Federal sting** — Limited options. High stakes.

---

## 🏆 Achievements & Titles

Achievements track lifetime milestones. Titles are cosmetic displays that signal player history.

**Sample titles (earned via quests/sprints/achievements):**
- "Nobody" (default)
- "Ghost" (10 crimes under heat 10)
- "Made Man" (joined faction)
- "The Apex" (Tier 5 crime attempted)
- "El Jefe" (reached top-tier faction)
- "Untouchable" (from specific sprint win)

---

## 📅 Roadmap

### v0.1 ✅ Foundation
- Character creation, stat system
- Tier 1–3 crimes
- Basic training
- Prison system
- Heat system
- localStorage save
- Server sync (Express backend)

### v0.2 ✅ Expansion
- Factions, faction missions
- Crew system
- Territory control
- Black market
- Dark Web contacts
- Events engine
- Encounter system
- Daily challenges
- Achievement system
- Quest system (story + contracts + sprints)
- Tutorial overlay
- Statistics page
- News feed (game world events)
- Multiplayer sync (backend player presence)

### v0.3 — Depth (current)
- [ ] Full "Rise of Nobody" 5-chapter story quest written
- [ ] Each faction's 5-part questline written and implemented
- [ ] Tier 4–5 crimes fully balanced and tested
- [ ] Prison escape mechanic (item + stat requirement)
- [ ] Crew betrayal system (loyalty 1 → informant event)
- [ ] Territory war events (faction vs. faction, player-involved)
- [ ] Heat raid system (at 90+ heat, NPC raid on player operations)

### v0.4 — Economy
- [ ] Player-to-player trading (proper market UI)
- [ ] Auction system for rare items
- [ ] Laundering efficiency upgrades (purchaseable)
- [ ] Gang safehouse (reduces heat decay, buyable)
- [ ] Cartel supply chain (faction economy tier unlocks)

### v0.5 — Multiplayer
- [ ] Real-time player presence in shared locations
- [ ] PvP crime interference (mugging, heist blocking)
- [ ] Faction leaderboards (territory control visualization)
- [ ] Player messaging system
- [ ] Bounty board (player-placed bounties on rivals)

### v0.6 — Endgame
- [ ] Legacy system (retire, leave mark on game world)
- [ ] Prestige reset (keep title, start fresh with bonus)
- [ ] Top-tier faction positions (elected/earned by player community)
- [ ] World events that reshape territory map
