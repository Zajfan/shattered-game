// server/routes/index.js
import { Router } from "express";
import { db } from "../db.js";

export const router = Router();

// ── Health ──────────────────────────────────────────────────────────────────
router.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

// ── Players ─────────────────────────────────────────────────────────────────

// Sync player state (called on save)
router.post("/players/sync", (req, res) => {
  const { uid, name, level, stats, totalEarned, crimesSucceeded, factionId,
          ownedDistricts, heat, heatLevel, cash, dirtyCash, crew } = req.body;
  if (!uid || !name) return res.status(400).json({ error: "uid and name required" });

  const isNew = !db.getPlayer(uid);
  const player = db.upsertPlayer(uid, {
    name, level, stats, totalEarned, crimesSucceeded,
    factionId, ownedDistricts, heat, heatLevel, cash, dirtyCash,
    crewCount: crew?.length || 0,
  });

  if (isNew) {
    db.addWorldEvent({ type: "new_player", text: `${name} entered the underworld.`, uid });
  }

  res.json({ ok: true, player });
});

router.get("/players/:uid", (req, res) => {
  const p = db.getPlayer(req.params.uid);
  if (!p) return res.status(404).json({ error: "Not found" });
  res.json(p);
});

// ── Leaderboard ─────────────────────────────────────────────────────────────
router.get("/leaderboard", (req, res) => {
  const { metric = "reputation", limit = 50 } = req.query;
  res.json(db.getLeaderboard(metric, Number(limit)));
});

// ── World Feed ───────────────────────────────────────────────────────────────
router.get("/world", (req, res) => {
  const { limit = 50 } = req.query;
  res.json({
    events:  db.getWorldEvents(Number(limit)),
    attacks: db.getRecentAttacks(20),
    playerCount: db.getAllPlayers().length,
  });
});

// ── Attacks ──────────────────────────────────────────────────────────────────
router.post("/attack", (req, res) => {
  const { attackerUid, defenderUid, districtId } = req.body;
  if (!attackerUid || !defenderUid) return res.status(400).json({ error: "Missing fields" });

  const attacker = db.getPlayer(attackerUid);
  const defender = db.getPlayer(defenderUid);
  if (!attacker) return res.status(404).json({ error: "Attacker not found" });
  if (!defender) return res.status(404).json({ error: "Defender not found" });

  // Attack resolution — weighted by muscle + nerve + crew
  const atkPower = (attacker.stats?.muscle || 10) + (attacker.stats?.nerve || 10)
                 + (attacker.crewCount || 0) * 5 + Math.random() * 20;
  const defPower = (defender.stats?.muscle || 10) + (defender.stats?.nerve || 10)
                 + (defender.crewCount || 0) * 5 + Math.random() * 20;

  const attackerWins = atkPower > defPower;
  const stolen = attackerWins ? Math.floor((defender.cash || 0) * 0.15) : 0;

  // Update defender — lose cash, lose district if contested
  if (attackerWins && districtId) {
    const defDistricts = (defender.ownedDistricts || []).filter((d) => d !== districtId);
    const atkDistricts = [...(attacker.ownedDistricts || [])];
    if (!atkDistricts.includes(districtId)) atkDistricts.push(districtId);
    db.upsertPlayer(defenderUid, { cash: Math.max(0, (defender.cash || 0) - stolen), ownedDistricts: defDistricts });
    db.upsertPlayer(attackerUid, { cash: (attacker.cash || 0) + stolen, ownedDistricts: atkDistricts });
  } else if (attackerWins) {
    db.upsertPlayer(defenderUid, { cash: Math.max(0, (defender.cash || 0) - stolen) });
    db.upsertPlayer(attackerUid, { cash: (attacker.cash || 0) + stolen });
  }

  const result = {
    attackerWins,
    stolen,
    atkPower: Math.round(atkPower),
    defPower: Math.round(defPower),
    districtTaken: attackerWins && !!districtId,
  };

  db.logAttack({ attackerId: attackerUid, defenderId: defenderUid, attackerName: attacker.name,
                 defenderName: defender.name, districtId, ...result });

  db.addWorldEvent({
    type:   attackerWins ? "attack_win" : "attack_loss",
    text:   attackerWins
      ? `${attacker.name} raided ${defender.name} — seized $${stolen.toLocaleString()}${result.districtTaken ? ` and took ${districtId}` : ""}.`
      : `${attacker.name} attacked ${defender.name} and was repelled.`,
    uid: attackerUid,
  });

  res.json(result);
});

router.get("/attacks/:uid", (req, res) => {
  res.json(db.getAttacks(req.params.uid));
});

// ── AI Events (Claude API proxy) ─────────────────────────────────────────────
router.post("/ai/event", async (req, res) => {
  const { eventType, playerContext } = req.body;
  if (!eventType) return res.status(400).json({ error: "eventType required" });

  const PROMPTS = {
    informant_surfaces: `You are writing a terse, gritty crime-thriller narrative event for a browser RPG called Shattered. 
The player is ${playerContext.name}, level ${playerContext.level}, with ${playerContext.crew?.length || 0} crew members.
One of their crew members (loyalty level: ${playerContext.lowestLoyalty}/5) has been approached by law enforcement.
Write exactly 2 sentences of in-world event narrative. Be specific, atmospheric, no fluff. First person is forbidden. No quotes around the whole text.`,

    undercover_sting: `You are writing a terse, gritty crime-thriller narrative event for a browser RPG called Shattered.
The player is ${playerContext.name}, level ${playerContext.level}, with heat level ${playerContext.heat}%.
An undercover DEA/FBI agent has been observing their operations and is moving in.
Write exactly 2 sentences of in-world event narrative. Specific, atmospheric, tense. No quotes around the whole text.`,

    rival_attack: `You are writing a terse, gritty crime-thriller narrative event for a browser RPG called Shattered.
The player is ${playerContext.name}, controlling ${playerContext.districts} districts.
A rival crew is moving on their territory. Faction: ${playerContext.factionId || "independent"}.
Write exactly 2 sentences of in-world event narrative. Reference real crime world dynamics. No quotes around the whole text.`,

    lucky_break: `You are writing a terse, gritty crime-thriller narrative event for a browser RPG called Shattered.
The player is ${playerContext.name}, level ${playerContext.level}, reputation ${playerContext.reputation}.
An unexpected opportunity has surfaced — a fence, a tip, a desperate associate offering a deal.
Write exactly 2 sentences of in-world event narrative. Specific, interesting, opportunistic tone. No quotes around the whole text.`,

    faction_war: `You are writing a terse, gritty crime-thriller narrative event for a browser RPG called Shattered.
The player is ${playerContext.name}, member of ${playerContext.factionId}.
Their faction is under attack by a rival organization. Tension is high.
Write exactly 2 sentences of in-world event narrative. Reference real organized crime dynamics. No quotes around the whole text.`,

    police_raid: `You are writing a terse, gritty crime-thriller narrative event for a browser RPG called Shattered.
The player is ${playerContext.name}, heat ${playerContext.heat}%, factionId ${playerContext.factionId || "independent"}.
Law enforcement has executed a coordinated raid on affiliated operations.
Write exactly 2 sentences of in-world event narrative. Cold, precise, threatening tone. No quotes around the whole text.`,
  };

  const prompt = PROMPTS[eventType];
  if (!prompt) return res.status(400).json({ error: "Unknown event type" });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":         "application/json",
        "anthropic-version":    "2023-06-01",
        "x-api-key":            process.env.ANTHROPIC_API_KEY || "",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-20250514",
        max_tokens: 120,
        messages:   [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic error:", err);
      // Fallback narratives if API unavailable
      return res.json({ narrative: FALLBACKS[eventType] || "Something is moving in the shadows." });
    }

    const data  = await response.json();
    const narrative = data.content?.[0]?.text?.trim() || FALLBACKS[eventType];
    res.json({ narrative });
  } catch (err) {
    console.error("AI event error:", err);
    res.json({ narrative: FALLBACKS[eventType] || "Something is moving in the shadows." });
  }
});

// ── AI Quest Debrief ─────────────────────────────────────────────────────
const AI_DEBRIEF_TEMPLATES = {
  operativeFirstCrime:    (p) => `You are writing a 2-sentence debrief for a criminal RPG called Shattered. Operative "${p.name}" just completed their first crime. Level ${p.level||1}, from ${p.startingCity||"an unknown city"}. Write a terse, atmospheric first-person observation from the operative's perspective. Crime-fiction noir tone. No quotes around the text.`,
  operativeGrinding:      (p) => `Debrief for Shattered RPG. Operative "${p.name}" has completed 5 successful crimes and is building street credibility. 2 sentences, noir tone, from the perspective of someone watching them grow.`,
  operativeNetworking:    (p) => `Debrief for Shattered RPG. Operative "${p.name}" just made their first serious criminal contact. 2 sentences. The city feels different now that someone owes them.`,
  operativeJoinFaction:   (p) => `Debrief for Shattered RPG. Operative "${p.name}" just joined ${p.factionId || "a criminal organization"}. 2 sentences. The weight of the decision.`,
  operativeBuildCrew:     (p) => `Debrief for Shattered RPG. Operative "${p.name}" just hired their first crew members. 2 sentences. The difference between operating alone and with people.`,
  operativeFirstTerritory:(p) => `Debrief for Shattered RPG. Operative "${p.name}" just claimed their first territory. 2 sentences. What it means to own something in the criminal world.`,
  operativeDrugTrade:     (p) => `Debrief for Shattered RPG. Operative "${p.name}" just entered the drug supply chain at mid-level. 2 sentences. The scale shift from street crime to distribution.`,
  operativeRivalConflict: (p) => `Debrief for Shattered RPG. Operative "${p.name}" just defended their territory. Heat ${p.heat||0}%. 2 sentences. Cold, tense aftermath.`,
  operativeMoneyLaundering:(p)=> `Debrief for Shattered RPG. Operative "${p.name}" just built their laundering infrastructure. 2 sentences. Clean money is the real product.`,
  operativeExpansion:     (p) => `Debrief for Shattered RPG. Operative "${p.name}" now controls territory in multiple cities. 2 sentences. The complexity of running an expanded operation.`,
  operativeBetrayal:      (p) => `Debrief for Shattered RPG. Operative "${p.name}" just discovered and dealt with an informant. 2 sentences. Dark, morally heavy aftermath.`,
  operativeFactionWar:    (p) => `Debrief for Shattered RPG. Operative "${p.name}" survived a faction war council. Reputation ${p.stats?.reputation||0}. 2 sentences. Power and the cost of keeping it.`,
  operativeFinancialArch: (p) => `Debrief for Shattered RPG. Operative "${p.name}" has built a full criminal financial architecture. 2 sentences. The satisfaction of structural power.`,
  operativeCartelLevel:   (p) => `Debrief for Shattered RPG. Operative "${p.name}" has reached cartel-level operations. Level ${p.level||1}. 2 sentences. The view from the top tier.`,
  operativeStateCapture:  (p) => `Debrief for Shattered RPG. Operative "${p.name}" just bought their first politician. 2 sentences. When criminal enterprise becomes systemic corruption.`,
  operativeSenatorMission:(p) => `Debrief for Shattered RPG. Operative "${p.name}" completed a mission with political cover. 2 sentences. When the law works for you.`,
  operativeInterpol:      (p) => `Debrief for Shattered RPG. Operative "${p.name}" just survived an Interpol manhunt. 2 sentences. What it means to beat the highest level of law enforcement.`,
  operativeApex:          (p) => `Debrief for Shattered RPG. Operative "${p.name}" completed The Rise — the full criminal career arc. Level ${p.level||1}, $${(p.totalEarned||0).toLocaleString()} earned. 3 sentences. Reflective, earned, final.`,
};

const DEBRIEF_FALLBACKS = {
  operativeFirstCrime:     "First job done. The city didn't even notice. That changes.",
  operativeGrinding:       "Five runs. Five clean exits. The rhythm is starting to feel natural.",
  operativeNetworking:     "Contacts are currency. You just made your first deposit.",
  operativeJoinFaction:    "You're part of something now. Whether that's protection or a target depends on the day.",
  operativeBuildCrew:      "Alone you're a threat. With the right people, you're a problem.",
  operativeFirstTerritory: "A block is a block. Until it's yours. Then it's a foundation.",
  operativeDrugTrade:      "The margins don't lie. Volume is where the real money lives.",
  operativeRivalConflict:  "They came at you. They won't again.",
  operativeMoneyLaundering:"The dirty work gets cleaned. That's how empires breathe.",
  operativeExpansion:      "One city is a hustle. Two cities is a network.",
  operativeBetrayal:       "You learned something about loyalty tonight. Expensive lesson. Worth it.",
  operativeFactionWar:     "War councils don't end wars. They decide who's left standing after.",
  operativeFinancialArch:  "The structure holds. The money flows. That's power.",
  operativeCartelLevel:    "You're in the room now. The one where the real decisions get made.",
  operativeStateCapture:   "The most dangerous criminal isn't the one with a gun. It's the one with a senator.",
  operativeSenatorMission: "The law bent. Because you made it bend.",
  operativeInterpol:       "An international manhunt. You walked out the other side. Not many can say that.",
  operativeApex:           "You started with nothing. You built everything. The only question left is what you do with it.",
};

router.post("/ai/quest-debrief", async (req, res) => {
  const { template, player } = req.body;
  if (!template || !player) return res.status(400).json({ text: null });

  const buildPrompt = AI_DEBRIEF_TEMPLATES[template];
  if (!buildPrompt) return res.json({ text: DEBRIEF_FALLBACKS[template] || "Mission complete." });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key":    process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-20250514",
        max_tokens: 150,
        messages:   [{ role: "user", content: buildPrompt(player) }],
      }),
    });

    if (!response.ok) throw new Error("API error");
    const data = await response.json();
    const text = data.content?.[0]?.text?.trim() || DEBRIEF_FALLBACKS[template];
    res.json({ text });
  } catch {
    res.json({ text: DEBRIEF_FALLBACKS[template] || "Mission complete." });
  }
});


  informant_surfaces: "Word came back through three different sources: someone in your crew has been talking. The feds didn't come to you with it — they never do.",
  undercover_sting:   "The new face on the corner has been there four days too long. Pros don't linger. Someone's building a case.",
  rival_attack:       "Three of your spots went dark in the same hour. This wasn't random — it's coordinated, and it has a name behind it.",
  lucky_break:        "A call comes in from an unknown number. The voice is calm, the offer is clean, and the window closes in 24 hours.",
  faction_war:        "The bodies started appearing on the wrong side of the border. The truce is over. Sides are being chosen.",
  police_raid:        "Helicopters. Six units. They hit three locations simultaneously. Somebody talked, and it wasn't random.",
};
