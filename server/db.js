// server/db.js — Simple JSON-file database, no native modules needed
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dir, "world.json");

const DEFAULT_STATE = {
  players: {},         // uid → player record
  attacks: [],         // attack log
  worldEvents: [],     // global activity feed
  factionWars: {},     // factionId → { attackers, defenders, startedAt }
};

function load() {
  if (!existsSync(DB_PATH)) return structuredClone(DEFAULT_STATE);
  try {
    return JSON.parse(readFileSync(DB_PATH, "utf8"));
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function save(state) {
  writeFileSync(DB_PATH, JSON.stringify(state, null, 2), "utf8");
}

// In-memory cache — flushed to disk on writes
let _state = load();

export const db = {
  // ── Players ──────────────────────────────────────────────────────────
  getPlayer: (uid) => _state.players[uid] || null,

  getAllPlayers: () => Object.values(_state.players),

  upsertPlayer: (uid, data) => {
    _state.players[uid] = { ..._state.players[uid], ...data, uid, lastSeen: new Date().toISOString() };
    save(_state);
    return _state.players[uid];
  },

  deletePlayer: (uid) => {
    delete _state.players[uid];
    save(_state);
  },

  // ── World Events ─────────────────────────────────────────────────────
  addWorldEvent: (event) => {
    _state.worldEvents = [
      { ...event, id: Date.now(), at: new Date().toISOString() },
      ..._state.worldEvents,
    ].slice(0, 200); // keep latest 200
    save(_state);
  },

  getWorldEvents: (limit = 50) => _state.worldEvents.slice(0, limit),

  // ── Attacks ──────────────────────────────────────────────────────────
  logAttack: (attack) => {
    _state.attacks = [
      { ...attack, id: Date.now(), at: new Date().toISOString() },
      ..._state.attacks,
    ].slice(0, 500);
    save(_state);
  },

  getAttacks: (uid, limit = 20) =>
    _state.attacks
      .filter((a) => a.attackerId === uid || a.defenderId === uid)
      .slice(0, limit),

  getRecentAttacks: (limit = 30) => _state.attacks.slice(0, limit),

  // ── Faction Wars ─────────────────────────────────────────────────────
  getFactionWar: (factionId) => _state.factionWars[factionId] || null,

  setFactionWar: (factionId, war) => {
    _state.factionWars[factionId] = war;
    save(_state);
  },

  // ── Leaderboard ──────────────────────────────────────────────────────
  getLeaderboard: (metric = "reputation", limit = 50) => {
    const players = Object.values(_state.players).filter((p) => p.name);
    const sorted = players.sort((a, b) => {
      if (metric === "reputation") return (b.stats?.reputation || 0) - (a.stats?.reputation || 0);
      if (metric === "cash")       return (b.totalEarned || 0) - (a.totalEarned || 0);
      if (metric === "territory")  return (b.ownedDistricts?.length || 0) - (a.ownedDistricts?.length || 0);
      if (metric === "crimes")     return (b.crimesSucceeded || 0) - (a.crimesSucceeded || 0);
      return 0;
    });
    return sorted.slice(0, limit).map((p, i) => ({
      rank:           i + 1,
      uid:            p.uid,
      name:           p.name,
      level:          p.level || 1,
      reputation:     p.stats?.reputation || 0,
      totalEarned:    p.totalEarned || 0,
      crimesSucceeded:p.crimesSucceeded || 0,
      factionId:      p.factionId || null,
      ownedDistricts: p.ownedDistricts?.length || 0,
      lastSeen:       p.lastSeen,
    }));
  },
};
