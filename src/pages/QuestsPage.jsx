// src/pages/QuestsPage.jsx
import { useState, useEffect, useCallback } from "react";
import {
  STORY_QUESTS, STORY_CHAPTERS, SIDE_QUESTS, SIDE_QUEST_SERIES,
  getWeeklyContracts, currentWeekKey,
  WORLD_EVENT_TYPES, EXCLUSIVE_ITEMS,
  QUEST_STATUS, getQuestStatus,
  getSideQuestsBySeries,
  SPRINT_POOL, getSprintStatus, formatTimeLeft,
} from "../data/quests";

// ── Helpers ──────────────────────────────────────────────────────────────────
const difficultyLabel = (d) => ["","●","●●","●●●","●●●●","●●●●●"][d] || "●";
const difficultyColor = (d) => d <= 2 ? "var(--green)" : d === 3 ? "var(--yellow)" : "var(--red-hot)";

const rewardSummary = (rewards) => {
  const parts = [];
  if (rewards.cash)          parts.push(`$${rewards.cash.toLocaleString()}`);
  if (rewards.xp)            parts.push(`${rewards.xp} XP`);
  if (rewards.title)         parts.push(`🏷 "${rewards.title}"`);
  if (rewards.exclusiveItem) parts.push(`★ ${EXCLUSIVE_ITEMS[rewards.exclusiveItem]?.name || rewards.exclusiveItem}`);
  if (rewards.contact)       parts.push(`🔑 New Contact`);
  if (rewards.statBonus) {
    const stats = Object.entries(rewards.statBonus).map(([k,v]) => `+${v} ${k}`).join(", ");
    parts.push(stats);
  }
  if (rewards.upgradeNote)   parts.push(`↑ ${rewards.upgradeNote}`);
  return parts;
};

// ── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    [QUEST_STATUS.LOCKED]:    { label: "LOCKED",    color: "var(--text-muted)",   border: "#2a2a2a" },
    [QUEST_STATUS.AVAILABLE]: { label: "AVAILABLE", color: "var(--amber)",        border: "var(--amber-dim)" },
    [QUEST_STATUS.ACTIVE]:    { label: "ACTIVE",    color: "#5a7ec8",             border: "#5a7ec8" },
    [QUEST_STATUS.CLAIMABLE]: { label: "CLAIM",     color: "var(--green)",        border: "var(--green)" },
    [QUEST_STATUS.COMPLETE]:  { label: "COMPLETE",  color: "var(--text-muted)",   border: "#2a2a2a" },
    [QUEST_STATUS.EXPIRED]:   { label: "EXPIRED",   color: "var(--red)",          border: "var(--red)" },
  }[status] || { label: status, color: "var(--text-muted)", border: "#2a2a2a" };
  return (
    <span style={{
      fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em",
      color: cfg.color, border: `1px solid ${cfg.border}`,
      padding: "2px 6px", borderRadius: 2, flexShrink: 0,
    }}>{cfg.label}</span>
  );
}

// ── Objective Row ─────────────────────────────────────────────────────────────
function ObjRow({ obj, player, questProgress }) {
  const done = obj.check(player, questProgress);
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5 }}>
      <span style={{ color: done ? "var(--green)" : "var(--text-muted)", fontSize: 13, flexShrink: 0 }}>
        {done ? "✓" : "○"}
      </span>
      <span style={{
        fontFamily: "var(--font-body)", fontSize: 13,
        color: done ? "var(--text-secondary)" : "var(--text-primary)",
        textDecoration: done ? "line-through" : "none",
      }}>{obj.label}</span>
    </div>
  );
}

// ── Quest Detail Panel ────────────────────────────────────────────────────────
function QuestDetail({ quest, player, questProgress, status, onAccept, onClaim, aiNarration, loadingAI }) {
  const rewards = rewardSummary(quest.rewards);
  const allDone = quest.objectives.every(o => o.check(player, questProgress));

  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border-accent)",
      borderRadius: 2, padding: 24, height: "100%", overflowY: "auto",
    }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 6 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--amber)", letterSpacing: "0.05em" }}>
              {quest.title}
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontStyle: "italic", color: "var(--text-secondary)", fontSize: 14, marginTop: 2 }}>
              {quest.subtitle}
            </div>
          </div>
          <StatusBadge status={status} />
        </div>
        {quest.chapter && (() => {
          const ch = STORY_CHAPTERS.find(c => c.id === quest.chapter);
          return ch ? (
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.1em" }}>
              {ch.label.toUpperCase()} — {ch.title.toUpperCase()}
            </div>
          ) : null;
        })()}
        {quest.seriesLabel && (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.1em" }}>
            {quest.seriesLabel.toUpperCase()} — PART {quest.order}
          </div>
        )}
      </div>

      {/* Static narrative */}
      <div style={{
        background: "var(--bg-raised)", borderLeft: "3px solid var(--amber-dim)",
        padding: "14px 16px", marginBottom: 20,
        fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.7,
        color: "var(--text-primary)", whiteSpace: "pre-line",
      }}>
        {quest.narrative}
      </div>

      {/* AI intel slot */}
      {status !== QUEST_STATUS.LOCKED && status !== QUEST_STATUS.COMPLETE && (
        <div style={{
          background: "rgba(200,146,42,0.05)", border: "1px dashed var(--amber-dim)",
          borderRadius: 2, padding: "12px 16px", marginBottom: 20, minHeight: 60,
        }}>
          {loadingAI ? (
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--amber-dim)", letterSpacing: "0.08em" }}>
              ◈ GENERATING FIELD INTEL...
            </div>
          ) : aiNarration ? (
            <div style={{ fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: 14, color: "var(--amber)", lineHeight: 1.6 }}>
              "{aiNarration}"
            </div>
          ) : (
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>◈ INTEL FEED PENDING</div>
          )}
        </div>
      )}

      {/* Objectives */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.12em", marginBottom: 10 }}>
          OBJECTIVES
        </div>
        {quest.objectives.map((o, i) => (
          <ObjRow key={o.id || i} obj={o} player={player} questProgress={questProgress} />
        ))}
      </div>

      {/* Rewards */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.12em", marginBottom: 10 }}>
          REWARDS
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {rewards.map((r, i) => (
            <span key={i} style={{
              background: "var(--bg-raised)", border: "1px solid var(--border)",
              borderRadius: 2, padding: "4px 10px",
              fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--amber)",
            }}>{r}</span>
          ))}
        </div>
        {quest.rewards.exclusiveItem && EXCLUSIVE_ITEMS[quest.rewards.exclusiveItem] && (
          <div style={{
            marginTop: 10, background: "rgba(200,146,42,0.06)", border: "1px solid var(--amber-dim)",
            borderRadius: 2, padding: "10px 12px",
          }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 12, color: "var(--amber)", fontWeight: 600, letterSpacing: "0.08em", marginBottom: 4 }}>
              ★ EXCLUSIVE: {EXCLUSIVE_ITEMS[quest.rewards.exclusiveItem].name}
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", fontStyle: "italic" }}>
              {EXCLUSIVE_ITEMS[quest.rewards.exclusiveItem].desc}
            </div>
          </div>
        )}
      </div>

      {/* Real-world note */}
      {quest.realNote && (
        <div style={{
          background: "var(--bg-void)", borderLeft: "2px solid var(--text-muted)",
          padding: "10px 14px", marginBottom: 20,
          fontFamily: "var(--font-body)", fontSize: 12, fontStyle: "italic",
          color: "var(--text-muted)", lineHeight: 1.6,
        }}>
          {quest.realNote}
        </div>
      )}

      {/* Action button */}
      {status === QUEST_STATUS.AVAILABLE && (
        <button className="btn-primary" style={{ width: "100%" }} onClick={() => onAccept(quest)}>
          ACCEPT MISSION
        </button>
      )}
      {status === QUEST_STATUS.ACTIVE && allDone && (
        <button className="btn-primary" style={{ width: "100%", background: "var(--green)" }} onClick={() => onClaim(quest)}>
          ✓ CLAIM REWARDS
        </button>
      )}
      {status === QUEST_STATUS.ACTIVE && !allDone && (
        <div style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", padding: "12px 0" }}>
          MISSION IN PROGRESS
        </div>
      )}
      {status === QUEST_STATUS.COMPLETE && (
        <div style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", padding: "12px 0" }}>
          ✓ MISSION COMPLETE
        </div>
      )}
      {status === QUEST_STATUS.LOCKED && (
        <div style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", padding: "12px 0" }}>
          🔒 {(player.level || 1) < (quest.levelReq || 1)
            ? `REQUIRES LEVEL ${quest.levelReq}`
            : quest.prevQuestId
            ? "COMPLETE PREVIOUS MISSION FIRST"
            : "LOCKED"}
        </div>
      )}
    </div>
  );
}

// ── Quest List Row ─────────────────────────────────────────────────────────────
function QuestRow({ quest, status, active, onClick }) {
  const isComplete = status === QUEST_STATUS.COMPLETE;
  return (
    <div onClick={onClick} style={{
      padding: "12px 14px", cursor: "pointer", borderRadius: 0,
      background: active ? "rgba(200,146,42,0.08)" : "transparent",
      borderLeft: active ? "3px solid var(--amber)" : "3px solid transparent",
      borderBottom: "1px solid var(--border)",
      opacity: isComplete ? 0.5 : 1,
      transition: "all 0.15s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
        <div style={{
          fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600,
          color: active ? "var(--amber)" : isComplete ? "var(--text-muted)" : "var(--text-primary)",
          letterSpacing: "0.04em",
        }}>
          {isComplete ? "✓ " : ""}{quest.title}
        </div>
        <StatusBadge status={status} />
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>
        {quest.subtitle}
      </div>
    </div>
  );
}

// ── Contract Card ─────────────────────────────────────────────────────────────
function ContractCard({ contract, player, active, accepted, completed, onClick }) {
  const locked = (player.level || 1) < (contract.levelReq || 1);
  const rewards = rewardSummary(contract.rewards);
  return (
    <div onClick={!locked ? onClick : undefined} style={{
      background: active ? "rgba(200,146,42,0.08)" : "var(--bg-card)",
      border: `1px solid ${active ? "var(--amber-dim)" : "var(--border)"}`,
      borderRadius: 2, padding: "16px", cursor: locked ? "default" : "pointer",
      opacity: locked || completed ? 0.55 : 1, transition: "all 0.15s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 22 }}>{contract.icon}</span>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: "var(--amber)", letterSpacing: "0.04em" }}>
              {contract.label}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em" }}>
              {contract.category.toUpperCase()} · {contract.expiresHours}H WINDOW
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexDirection: "column", alignItems: "flex-end" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: difficultyColor(contract.difficulty) }}>
            {difficultyLabel(contract.difficulty)}
          </span>
          {completed && <StatusBadge status={QUEST_STATUS.COMPLETE} />}
          {accepted && !completed && <StatusBadge status={QUEST_STATUS.ACTIVE} />}
          {!accepted && !completed && !locked && <StatusBadge status={QUEST_STATUS.AVAILABLE} />}
          {locked && <StatusBadge status={QUEST_STATUS.LOCKED} />}
        </div>
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", marginBottom: 10, lineHeight: 1.5 }}>
        {contract.desc}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {rewards.map((r, i) => (
          <span key={i} style={{
            fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--amber-dim)",
            background: "var(--bg-raised)", border: "1px solid var(--border)",
            borderRadius: 2, padding: "2px 8px",
          }}>{r}</span>
        ))}
      </div>
    </div>
  );
}

// ── World Events Tab ──────────────────────────────────────────────────────────
function WorldEventsTab({ worldEvent }) {
  const eventData = worldEvent ? WORLD_EVENT_TYPES.find(e => e.id === worldEvent.id) : null;
  return (
    <div>
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 2,
        padding: 18, marginBottom: 16, fontFamily: "var(--font-body)", fontSize: 14,
        lineHeight: 1.7, color: "var(--text-secondary)",
      }}>
        World Events are server-side conditions that affect all players simultaneously. They trigger when collective criminal activity crosses thresholds — and can either help you or make everything harder.
      </div>

      {eventData ? (
        <div style={{
          background: "var(--bg-card)", border: `2px solid ${eventData.color}`,
          borderRadius: 2, padding: 24, marginBottom: 16,
        }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 32 }}>{eventData.icon}</span>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: eventData.color, letterSpacing: "0.05em" }}>
                {eventData.title}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.08em" }}>
                WORLD EVENT · ACTIVE
              </div>
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)", lineHeight: 1.6 }}>
            {eventData.desc}
          </div>
        </div>
      ) : (
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 2,
          padding: 24, textAlign: "center", marginBottom: 24,
        }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-muted)", marginBottom: 8, letterSpacing: "0.1em" }}>
            ◈ NO ACTIVE WORLD EVENT
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>
            The city is quiet. For now.
          </div>
        </div>
      )}

      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.12em", marginBottom: 12 }}>
        KNOWN EVENT TYPES
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {WORLD_EVENT_TYPES.map(we => (
          <div key={we.id} style={{
            background: "var(--bg-card)", border: `1px solid ${we.color}33`,
            borderRadius: 2, padding: "12px 14px",
          }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
              <span>{we.icon}</span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, color: we.color, letterSpacing: "0.04em" }}>
                {we.title}
              </span>
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {we.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sprint Card ───────────────────────────────────────────────────────────────
function SprintCard({ sprint, player, status, onAccept, onClaim, onAbandon }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (status !== QUEST_STATUS.ACTIVE) return;
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, [status]);

  const activeSprint = player.activeSprint;
  const isThisActive = activeSprint?.sprintId === sprint.id;
  const snap = player.sprintSnapshot || {};
  const objDone = sprint.objective.check(player, snap);
  const rewards = [];
  if (sprint.rewards.cash)      rewards.push(`$${sprint.rewards.cash.toLocaleString()}`);
  if (sprint.rewards.xp)        rewards.push(`${sprint.rewards.xp} XP`);
  if (sprint.rewards.title)     rewards.push(`🏷 "${sprint.rewards.title}"`);
  if (sprint.rewards.statBonus) {
    Object.entries(sprint.rewards.statBonus).forEach(([k,v]) => rewards.push(`+${v} ${k}`));
  }

  const statusColors = {
    [QUEST_STATUS.AVAILABLE]: "var(--amber-dim)",
    [QUEST_STATUS.ACTIVE]:    "#5a7ec8",
    [QUEST_STATUS.CLAIMABLE]: "var(--green)",
    [QUEST_STATUS.COMPLETE]:  "var(--text-muted)",
    [QUEST_STATUS.EXPIRED]:   "var(--red)",
    [QUEST_STATUS.LOCKED]:    "#2a2a2a",
  };

  return (
    <div style={{
      background: "var(--bg-card)",
      border: `1px solid ${status === QUEST_STATUS.ACTIVE ? "#5a7ec8" : status === QUEST_STATUS.CLAIMABLE ? "var(--green)" : "var(--border)"}`,
      borderRadius: 2, padding: 20,
      opacity: [QUEST_STATUS.COMPLETE, QUEST_STATUS.LOCKED].includes(status) ? 0.55 : 1,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: 28, lineHeight: 1 }}>{sprint.icon}</span>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: "var(--amber)", letterSpacing: "0.04em" }}>
              {sprint.title}
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontStyle: "italic", color: "var(--text-secondary)", marginTop: 2 }}>
              {sprint.subtitle}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: statusColors[status] || "var(--text-muted)", border: `1px solid ${statusColors[status] || "#2a2a2a"}`, padding: "2px 6px", borderRadius: 2, letterSpacing: "0.1em" }}>
            {status.toUpperCase()}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: difficultyColor(sprint.difficulty) }}>
            {difficultyLabel(sprint.difficulty)} · {sprint.durationHours}H
          </span>
        </div>
      </div>

      <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: 12 }}>
        {sprint.desc}
      </div>

      {/* Objective */}
      <div style={{ background: "var(--bg-raised)", borderRadius: 2, padding: "10px 12px", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ color: objDone && isThisActive ? "var(--green)" : "var(--text-muted)", fontSize: 14, flexShrink: 0 }}>
            {objDone && isThisActive ? "✓" : "○"}
          </span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-primary)" }}>
            {sprint.objective.label}
          </span>
        </div>
      </div>

      {/* Timer if active */}
      {isThisActive && status === QUEST_STATUS.ACTIVE && (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#5a7ec8", marginBottom: 12, letterSpacing: "0.08em" }}>
          ⏱ {formatTimeLeft(activeSprint.startedAt, sprint.durationHours)}
        </div>
      )}
      {status === QUEST_STATUS.EXPIRED && (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--red)", marginBottom: 12, letterSpacing: "0.08em" }}>
          ✗ TIME EXPIRED
        </div>
      )}

      {/* Rewards */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {rewards.map((r, i) => (
          <span key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--amber)", background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 2, padding: "2px 8px" }}>{r}</span>
        ))}
      </div>

      {/* Real note */}
      {sprint.realNote && (
        <div style={{ fontFamily: "var(--font-body)", fontSize: 11, fontStyle: "italic", color: "var(--text-muted)", lineHeight: 1.5, borderLeft: "2px solid var(--border)", paddingLeft: 10, marginBottom: 14 }}>
          {sprint.realNote}
        </div>
      )}

      {/* Action */}
      {status === QUEST_STATUS.AVAILABLE && (
        <button className="btn-primary" style={{ width: "100%" }} onClick={() => onAccept(sprint)}>
          START SPRINT — {sprint.durationHours}H CLOCK
        </button>
      )}
      {status === QUEST_STATUS.ACTIVE && !objDone && (
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, background: "var(--bg-raised)", border: "1px solid #5a7ec8", borderRadius: 2, padding: "10px 0", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 12, color: "#5a7ec8", letterSpacing: "0.08em" }}>
            SPRINT IN PROGRESS
          </div>
          <button onClick={() => onAbandon(sprint)} style={{ background: "transparent", border: "1px solid #c0392b", color: "#c0392b", borderRadius: 2, padding: "0 14px", fontFamily: "var(--font-mono)", fontSize: 11, cursor: "pointer", letterSpacing: "0.08em" }}>
            ABANDON
          </button>
        </div>
      )}
      {status === QUEST_STATUS.CLAIMABLE && (
        <button className="btn-primary" style={{ width: "100%", background: "var(--green)" }} onClick={() => onClaim(sprint)}>
          ✓ CLAIM SPRINT REWARDS
        </button>
      )}
      {status === QUEST_STATUS.EXPIRED && (
        <button onClick={() => onAbandon(sprint)} style={{ width: "100%", background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: 2, padding: "10px 0", fontFamily: "var(--font-mono)", fontSize: 12, cursor: "pointer", letterSpacing: "0.08em" }}>
          CLEAR EXPIRED SPRINT
        </button>
      )}
      {status === QUEST_STATUS.COMPLETE && (
        <div style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", padding: "8px 0", letterSpacing: "0.08em" }}>✓ SPRINT COMPLETE</div>
      )}
      {status === QUEST_STATUS.LOCKED && !player.activeSprint && (
        <div style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", padding: "8px 0" }}>
          🔒 REQUIRES LEVEL {sprint.levelReq}
        </div>
      )}
      {status === QUEST_STATUS.LOCKED && player.activeSprint && (
        <div style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", padding: "8px 0" }}>
          SPRINT ALREADY ACTIVE
        </div>
      )}
    </div>
  );
}

// ── Main QuestsPage ───────────────────────────────────────────────────────────
export default function QuestsPage({ player, onQuestAccept, onQuestClaim, onSprintAccept, onSprintClaim, onSprintAbandon, worldEvent }) {
  const [tab, setTab]                   = useState("story");
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [aiNarrations, setAiNarrations] = useState({});
  const [loadingAI, setLoadingAI]       = useState(false);
  const [expandedContract, setExpandedContract] = useState(null);
  const [acceptedContracts, setAcceptedContracts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("shattered_contracts") || "[]"); } catch { return []; }
  });
  const [completedContracts, setCompletedContracts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("shattered_contracts_done") || "[]"); } catch { return []; }
  });

  const completedQuests = player.completedQuests || [];
  const questProgress   = player.questProgress   || {};
  const weeklyContracts = getWeeklyContracts();

  // Sprints
  const sprintsWon    = player.wonSprints || [];
  const activeSprint  = player.activeSprint;
  const sprintsAvailable = SPRINT_POOL.filter(s => getSprintStatus(s, player) === QUEST_STATUS.AVAILABLE).length;
  const sprintActive  = activeSprint ? 1 : 0;
  const sprintClaimable = SPRINT_POOL.filter(s => getSprintStatus(s, player) === QUEST_STATUS.CLAIMABLE).length;

  useEffect(() => { setSelectedQuest(null); }, [tab]);

  const fetchNarration = useCallback(async (quest) => {
    if (aiNarrations[quest.id]) return;
    setLoadingAI(true);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are a gritty crime noir narrator for a criminal underworld RPG called Shattered.
The player "${player.name || "the operative"}" is Level ${player.level || 1}, reputation ${player.stats?.reputation || 0}, ${player.factionId ? `affiliated with ${player.factionId}` : "unaffiliated"}.

Write a 2-3 sentence field intel briefing for this mission: "${quest.title}"
Context: ${quest.aiPromptHint}

Terse, atmospheric, present tense. Crime fiction voice — Elmore Leonard meets David Simon. Do not repeat the title. Just the briefing. No quotes around the output.`,
          }],
        }),
      });
      const data = await resp.json();
      const text = data.content?.[0]?.text || "";
      if (text) setAiNarrations(prev => ({ ...prev, [quest.id]: text.trim() }));
    } catch {}
    setLoadingAI(false);
  }, [aiNarrations, player]);

  const handleSelectQuest = (quest) => {
    setSelectedQuest(quest);
    const status = getQuestStatus(quest, player);
    if (status !== QUEST_STATUS.LOCKED && status !== QUEST_STATUS.COMPLETE) {
      fetchNarration(quest);
    }
  };

  const handleAcceptContract = (contract) => {
    const updated = [...new Set([...acceptedContracts, contract.id])];
    setAcceptedContracts(updated);
    localStorage.setItem("shattered_contracts", JSON.stringify(updated));
  };

  const handleClaimContract = (contract) => {
    const done = [...new Set([...completedContracts, contract.id])];
    setCompletedContracts(done);
    localStorage.setItem("shattered_contracts_done", JSON.stringify(done));
    if (onQuestClaim) onQuestClaim({ ...contract, isContract: true });
  };

  // Aggregate titles earned
  const titlesEarned = [
    ...STORY_QUESTS.filter(q => completedQuests.includes(q.id) && q.rewards.title).map(q => q.rewards.title),
    ...SIDE_QUESTS.filter(q => completedQuests.includes(q.id) && q.rewards.title).map(q => q.rewards.title),
  ];

  const storyComplete   = STORY_QUESTS.filter(q => completedQuests.includes(q.id)).length;
  const sideComplete    = SIDE_QUESTS.filter(q => completedQuests.includes(q.id)).length;
  const contractsDone   = completedContracts.length;

  const TABS = [
    { id: "story",     label: "Story Arc",     badge: `${storyComplete}/${STORY_QUESTS.length}` },
    { id: "side",      label: "Side Jobs",     badge: sideComplete > 0 ? `${sideComplete}/${SIDE_QUESTS.length}` : null },
    { id: "contracts", label: "Contracts",     badge: contractsDone > 0 ? String(contractsDone) : null },
    { id: "sprints",   label: "Sprints",       badge: sprintClaimable > 0 ? "!" : sprintActive > 0 ? "▶" : null },
    { id: "world",     label: "World Events",  badge: worldEvent ? "!" : null },
  ];

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--amber)", letterSpacing: "0.06em" }}>
          OPERATIONS
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", fontStyle: "italic", marginTop: 2 }}>
          Missions, contracts, and field intelligence
        </div>
      </div>

      {/* Earned titles strip */}
      {titlesEarned.length > 0 && (
        <div style={{
          background: "rgba(200,146,42,0.06)", border: "1px solid var(--amber-dim)",
          borderRadius: 2, padding: "10px 16px", marginBottom: 16,
          display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap",
        }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.12em" }}>
            EARNED TITLES:
          </span>
          {titlesEarned.map(t => (
            <span key={t} style={{
              fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600,
              color: "var(--amber)", border: "1px solid var(--amber-dim)",
              padding: "2px 9px", borderRadius: 2, letterSpacing: "0.06em",
            }}>"{t}"</span>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "1px solid var(--border)" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? "var(--bg-raised)" : "transparent",
            border: "none", borderBottom: tab === t.id ? "2px solid var(--amber)" : "2px solid transparent",
            color: tab === t.id ? "var(--amber)" : "var(--text-muted)",
            fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.1em",
            padding: "10px 18px", cursor: "pointer", transition: "all 0.15s",
            display: "flex", gap: 6, alignItems: "center",
          }}>
            {t.label.toUpperCase()}
            {t.badge && (
              <span style={{
                background: "var(--amber-dim)", color: "var(--bg-void)",
                borderRadius: 10, fontSize: 10, padding: "1px 6px",
              }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── STORY TAB ── */}
      {tab === "story" && (
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, minHeight: 540 }}>
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 2, overflowY: "auto", maxHeight: 700 }}>
            {STORY_CHAPTERS.map(ch => {
              const chQuests = STORY_QUESTS.filter(q => q.chapter === ch.id);
              const chLocked = (player.level || 1) < ch.levelReq;
              return (
                <div key={ch.id}>
                  <div style={{
                    padding: "10px 14px", background: "var(--bg-raised)", borderBottom: "1px solid var(--border)",
                    fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em",
                    color: chLocked ? "var(--text-redacted)" : "var(--amber-dim)",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <span>{ch.label.toUpperCase()} — {ch.title.toUpperCase()}</span>
                    {chLocked && <span style={{ color: "var(--text-muted)", fontSize: 10 }}>LV {ch.levelReq}</span>}
                  </div>
                  {chQuests.map(q => (
                    <QuestRow key={q.id} quest={q} status={getQuestStatus(q, player)}
                      active={selectedQuest?.id === q.id}
                      onClick={() => handleSelectQuest(q)} />
                  ))}
                </div>
              );
            })}
          </div>
          <div>
            {selectedQuest && STORY_QUESTS.find(q => q.id === selectedQuest.id) ? (
              <QuestDetail
                quest={selectedQuest} player={player}
                questProgress={questProgress}
                status={getQuestStatus(selectedQuest, player)}
                onAccept={onQuestAccept} onClaim={onQuestClaim}
                aiNarration={aiNarrations[selectedQuest.id]} loadingAI={loadingAI}
              />
            ) : (
              <div style={{
                height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 2, minHeight: 400,
              }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 8 }}>
                    SELECT A MISSION
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>
                    {storyComplete} / {STORY_QUESTS.length} missions complete
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SIDE JOBS TAB ── */}
      {tab === "side" && (
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, minHeight: 540 }}>
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 2, overflowY: "auto", maxHeight: 700 }}>
            {SIDE_QUEST_SERIES.map(series => {
              const quests = getSideQuestsBySeries(series.id);
              const trust  = player.contactTrust?.[series.contactId] || 0;
              return (
                <div key={series.id}>
                  <div style={{
                    padding: "10px 14px", background: "var(--bg-raised)", borderBottom: "1px solid var(--border)",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--amber-dim)", letterSpacing: "0.1em" }}>
                      {series.icon} {series.label.toUpperCase()}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
                      TRUST {trust}/4
                    </span>
                  </div>
                  {quests.map(q => (
                    <QuestRow key={q.id} quest={q} status={getQuestStatus(q, player)}
                      active={selectedQuest?.id === q.id}
                      onClick={() => handleSelectQuest(q)} />
                  ))}
                </div>
              );
            })}
          </div>
          <div>
            {selectedQuest && SIDE_QUESTS.find(q => q.id === selectedQuest.id) ? (
              <QuestDetail
                quest={selectedQuest} player={player}
                questProgress={questProgress}
                status={getQuestStatus(selectedQuest, player)}
                onAccept={onQuestAccept} onClaim={onQuestClaim}
                aiNarration={aiNarrations[selectedQuest.id]} loadingAI={loadingAI}
              />
            ) : (
              <div style={{
                height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 2, minHeight: 400,
              }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 8 }}>
                    SELECT A JOB
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>
                    Build trust with contacts to unlock deeper chains
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CONTRACTS TAB ── */}
      {tab === "contracts" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: "var(--amber)", letterSpacing: "0.06em" }}>
                ANONYMOUS CONTRACTS — {currentWeekKey()}
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", fontStyle: "italic", marginTop: 2 }}>
                8 contracts rotate weekly. No names, no explanations.
              </div>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>
              {contractsDone} COMPLETE THIS WEEK
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {weeklyContracts.map(c => {
              const isAccepted = acceptedContracts.includes(c.id);
              const isDone     = completedContracts.includes(c.id);
              const isExpanded = expandedContract === c.id;
              const objsMet    = c.objectives.every(o => o.check(player, questProgress[c.id] || {}));
              return (
                <div key={c.id}>
                  <ContractCard
                    contract={c} player={player}
                    active={isExpanded} accepted={isAccepted} completed={isDone}
                    onClick={() => setExpandedContract(isExpanded ? null : c.id)}
                  />
                  {isExpanded && !isDone && (
                    <div style={{
                      background: "var(--bg-card)", border: "1px solid var(--border-accent)",
                      borderTop: "none", borderRadius: "0 0 2px 2px", padding: "14px 16px",
                    }}>
                      <div style={{ marginBottom: 10 }}>
                        {c.objectives.map((o, i) => (
                          <ObjRow key={i} obj={o} player={player} questProgress={questProgress[c.id] || {}} />
                        ))}
                      </div>
                      {!isAccepted && (
                        <button className="btn-primary" style={{ width: "100%" }} onClick={() => handleAcceptContract(c)}>
                          ACCEPT CONTRACT
                        </button>
                      )}
                      {isAccepted && objsMet && (
                        <button className="btn-primary" style={{ width: "100%", background: "var(--green)" }} onClick={() => handleClaimContract(c)}>
                          ✓ CLAIM PAYMENT
                        </button>
                      )}
                      {isAccepted && !objsMet && (
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: 8 }}>
                          CONTRACT ACTIVE
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── WORLD EVENTS TAB ── */}
      {tab === "world" && <WorldEventsTab worldEvent={worldEvent} />}

      {/* ── SPRINTS TAB ── */}
      {tab === "sprints" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: "var(--amber)", letterSpacing: "0.06em" }}>
                48H SPRINT CHALLENGES
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", fontStyle: "italic", marginTop: 2 }}>
                One active sprint at a time. Clock starts the moment you commit. High risk, high reward.
              </div>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", textAlign: "right" }}>
              <div>{sprintsWon.length} WON</div>
              {activeSprint && <div style={{ color: "#5a7ec8", marginTop: 3 }}>▶ SPRINT ACTIVE</div>}
            </div>
          </div>

          {/* Active sprint banner */}
          {activeSprint && (() => {
            const s = SPRINT_POOL.find(x => x.id === activeSprint.sprintId);
            const status = s ? getSprintStatus(s, player) : null;
            if (!s) return null;
            const timeLeft = formatTimeLeft(activeSprint.startedAt, s.durationHours);
            const isClaimable = status === QUEST_STATUS.CLAIMABLE;
            return (
              <div style={{
                background: isClaimable ? "rgba(61,140,90,0.1)" : "rgba(90,126,200,0.08)",
                border: `1px solid ${isClaimable ? "var(--green)" : "#5a7ec8"}`,
                borderRadius: 2, padding: "14px 18px", marginBottom: 18,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: isClaimable ? "var(--green)" : "#5a7ec8", letterSpacing: "0.12em" }}>
                    {isClaimable ? "✓ OBJECTIVE MET — CLAIM BELOW" : "▶ ACTIVE SPRINT"}
                  </span>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: "var(--amber)", marginTop: 3 }}>
                    {s.icon} {s.title}
                  </div>
                </div>
                {!isClaimable && (
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "#5a7ec8", fontWeight: 600, letterSpacing: "0.06em" }}>
                    {timeLeft}
                  </div>
                )}
              </div>
            );
          })()}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {SPRINT_POOL.map(sprint => (
              <SprintCard
                key={sprint.id}
                sprint={sprint}
                player={player}
                status={getSprintStatus(sprint, player)}
                onAccept={onSprintAccept}
                onClaim={onSprintClaim}
                onAbandon={onSprintAbandon}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
