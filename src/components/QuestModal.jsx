// src/components/QuestModal.jsx — AI-narrated mission briefing / debrief
import { useState, useEffect } from "react";

const SERVER_URL = "http://localhost:3001";

export default function QuestModal({ quest, player, mode, chapter, onAccept, onClaim, onDismiss }) {
  const [aiText,   setAiText]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [claimed,  setClaimed]  = useState(false);

  // Fetch AI debrief text when in "debrief" mode
  useEffect(() => {
    if (mode !== "debrief" || !quest?.debriefTemplate || !player) return;
    setLoading(true);
    fetch(`${SERVER_URL}/api/ai/quest-debrief`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template: quest.debriefTemplate, player }),
    })
      .then(r => r.json())
      .then(d => { setAiText(d.text || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [mode, quest?.id]);

  if (!quest) return null;

  const isBriefing = mode === "briefing";
  const isDebrief  = mode === "debrief";
  const accentColor = chapter?.color || "var(--amber)";

  const handleClaim = () => {
    setClaimed(true);
    setTimeout(() => { onClaim?.(); onDismiss?.(); }, 600);
  };

  return (
    <div className="qmodal-overlay" onClick={(e) => e.target === e.currentTarget && onDismiss?.()}>
      <div className="qmodal animate-in" style={{ borderTopColor: accentColor }}>

        {/* Header */}
        <div className="qmodal-header">
          <div>
            <div className="mono" style={{ fontSize: "0.58em", letterSpacing: "0.25em", color: accentColor, marginBottom: 4 }}>
              {isDebrief ? "MISSION COMPLETE" : "MISSION BRIEFING"} · {chapter?.title || "CONTRACT"}
            </div>
            <h2 className="qmodal-title">{quest.title}</h2>
          </div>
          <button className="qmodal-close mono muted" onClick={onDismiss}>✕</button>
        </div>

        <hr style={{ border: "none", borderTop: `1px solid ${accentColor}33`, margin: "0" }} />

        {/* Briefing text */}
        <div className="qmodal-body">
          <p className="qmodal-briefing">{quest.briefing}</p>

          {/* AI debrief flavor text */}
          {isDebrief && (
            <div className="qmodal-aitext">
              {loading ? (
                <div className="mono muted" style={{ fontSize: "0.75em", fontStyle: "italic" }}>
                  ▸ Generating debrief...
                </div>
              ) : aiText ? (
                <p style={{ fontStyle: "italic", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                  "{aiText}"
                </p>
              ) : null}
            </div>
          )}

          {/* Objectives */}
          <div className="qmodal-section">
            <div className="qmodal-section-label">Objectives</div>
            {quest.objectives.map((obj, i) => {
              const done = isDebrief;
              return (
                <div key={i} className="qmodal-objective">
                  <span style={{ color: done ? "#3d8c5a" : accentColor, marginRight: 8 }}>
                    {done ? "✓" : "▸"}
                  </span>
                  <span style={{ color: done ? "#3d8c5a" : "var(--text-secondary)", textDecoration: done ? "line-through" : "none", fontSize: "0.88em" }}>
                    {obj}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Rewards */}
          <div className="qmodal-section">
            <div className="qmodal-section-label">Rewards</div>
            <div className="qmodal-rewards">
              {quest.rewards.cash > 0 && (
                <span className="reward-chip cash">+${quest.rewards.cash.toLocaleString()}</span>
              )}
              {quest.rewards.xp > 0 && (
                <span className="reward-chip xp">+{quest.rewards.xp} XP</span>
              )}
              {quest.rewards.titleUnlock && (
                <span className="reward-chip title">🏷 Title Unlock</span>
              )}
              {quest.rewards.itemUnlock && (
                <span className="reward-chip item">🎁 Exclusive Item</span>
              )}
              {quest.rewards.contactUnlock && (
                <span className="reward-chip contact">👤 NPC Unlock</span>
              )}
              {quest.rewards.statBonus && Object.entries(quest.rewards.statBonus).map(([stat, val]) => (
                <span key={stat} className="reward-chip stat">+{val} {stat}</span>
              ))}
              {quest.rewards.permanentBonus && (
                <span className="reward-chip perm">⭐ Permanent Bonus</span>
              )}
            </div>
          </div>

          {/* Chapter end special message */}
          {isDebrief && quest.isChapterEnd && (
            <div className="qmodal-chapter-end" style={{ borderColor: accentColor }}>
              <div className="mono" style={{ fontSize: "0.62em", color: accentColor, letterSpacing: "0.2em", marginBottom: 6 }}>
                ▲ CHAPTER COMPLETE
              </div>
              <p style={{ fontSize: "0.88em", color: "var(--text-secondary)", lineHeight: 1.7, fontStyle: "italic" }}>
                {quest.chapterEndBriefing}
              </p>
            </div>
          )}

          {/* Final mission special */}
          {isDebrief && quest.isFinalMission && (
            <div className="qmodal-final" style={{ borderColor: "#c0392b" }}>
              <div className="mono" style={{ fontSize: "0.62em", color: "#c0392b", letterSpacing: "0.2em", marginBottom: 4 }}>
                ▲ THE RISE — COMPLETE
              </div>
              <p className="mono" style={{ fontSize: "0.78em", color: "var(--amber)", lineHeight: 1.8 }}>
                You started with nothing. You built everything. The game continues — but you've reached the apex.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="qmodal-footer">
          <button className="btn" onClick={onDismiss} style={{ fontSize: "0.78em" }}>
            {isBriefing ? "Maybe Later" : "Close"}
          </button>
          {isBriefing && (
            <button className="btn btn-primary" style={{ padding: "10px 28px" }} onClick={() => { onAccept?.(); onDismiss?.(); }}>
              ▶ Accept Mission
            </button>
          )}
          {isDebrief && !claimed && (
            <button
              className="btn btn-primary"
              style={{ padding: "10px 28px", background: claimed ? "#3d8c5a" : undefined }}
              onClick={handleClaim}
            >
              {claimed ? "✓ Claimed" : `▶ Claim Rewards`}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .qmodal-overlay {
          position: fixed; inset: 0; z-index: 1200;
          background: rgba(0,0,0,0.85);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .qmodal {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-top: 3px solid;
          max-width: 560px; width: 100%;
          max-height: 90vh; overflow-y: auto;
          display: flex; flex-direction: column;
          box-shadow: 0 0 80px rgba(0,0,0,0.8);
        }
        .qmodal-header {
          display: flex; align-items: flex-start;
          justify-content: space-between;
          padding: 20px 22px 14px;
        }
        .qmodal-title {
          font-family: var(--font-display); font-size: 1.3em;
          letter-spacing: 0.15em; text-transform: uppercase;
        }
        .qmodal-close {
          background: none; border: none; cursor: pointer;
          font-size: 1em; padding: 4px 8px; margin-top: -2px;
        }
        .qmodal-close:hover { color: var(--text-primary); }
        .qmodal-body {
          padding: 0 22px 16px;
          display: flex; flex-direction: column; gap: 16px;
        }
        .qmodal-briefing {
          font-family: var(--font-body); font-size: 0.95em;
          line-height: 1.8; color: var(--text-secondary);
          border-left: 3px solid var(--amber-dim);
          padding-left: 14px; margin: 0;
        }
        .qmodal-aitext {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-left: 3px solid var(--amber-dim);
          padding: 12px 14px;
          min-height: 48px;
        }
        .qmodal-section { display: flex; flex-direction: column; gap: 6px; }
        .qmodal-section-label {
          font-family: var(--font-mono); font-size: 0.62em;
          text-transform: uppercase; letter-spacing: 0.2em;
          color: var(--amber-dim); padding-bottom: 4px;
          border-bottom: 1px solid var(--border);
        }
        .qmodal-objective { display: flex; align-items: baseline; }
        .qmodal-rewards { display: flex; flex-wrap: wrap; gap: 6px; }
        .reward-chip {
          font-family: var(--font-mono); font-size: 0.7em;
          padding: 3px 9px; border: 1px solid; border-radius: 2px;
        }
        .reward-chip.cash    { color: #3d8c5a; border-color: #3d8c5a33; background: rgba(61,140,90,0.08); }
        .reward-chip.xp      { color: #5a7ec8; border-color: #5a7ec833; background: rgba(90,126,200,0.08); }
        .reward-chip.title   { color: var(--amber); border-color: var(--amber-dim); background: var(--amber-glow); }
        .reward-chip.item    { color: #a85fd4; border-color: #a85fd433; background: rgba(168,95,212,0.08); }
        .reward-chip.contact { color: #e67e22; border-color: #e67e2233; background: rgba(230,126,34,0.08); }
        .reward-chip.stat    { color: var(--text-secondary); border-color: var(--border); }
        .reward-chip.perm    { color: #f1c40f; border-color: #f1c40f33; background: rgba(241,196,15,0.08); }
        .qmodal-chapter-end {
          border: 1px solid; padding: 14px;
          background: rgba(0,0,0,0.3);
        }
        .qmodal-final {
          border: 1px solid; padding: 14px;
          background: rgba(192,57,43,0.06);
        }
        .qmodal-footer {
          padding: 14px 22px;
          border-top: 1px solid var(--border);
          display: flex; justify-content: space-between; align-items: center;
        }
      `}</style>
    </div>
  );
}
