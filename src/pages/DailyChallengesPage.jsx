import { useMemo } from "react";
import { getDailyChallenges, isSameDay } from "../data/dailyChallenges";

const CAT_COLORS = {
  Crime:     "#c0392b",
  Earnings:  "#3d8c5a",
  Heat:      "#e67e22",
  Training:  "#5a7ec8",
  Territory: "#3d8c5a",
  Crew:      "#d4a827",
  Market:    "#a85fd4",
  Faction:   "var(--amber)",
};

export default function DailyChallengesPage({ player, onClaimChallenge }) {
  const challenges  = useMemo(() => getDailyChallenges(), []);
  const snapshot    = player?.dailySnapshot;
  const claimed     = player?.claimedChallenges || [];
  const validSnap   = snapshot && isSameDay(snapshot) ? snapshot : null;

  // Time until reset
  const now    = new Date();
  const reset  = new Date(now);
  reset.setHours(24, 0, 0, 0);
  const msLeft = reset - now;
  const hLeft  = Math.floor(msLeft / 3600000);
  const mLeft  = Math.floor((msLeft % 3600000) / 60000);

  const isComplete  = (c) => validSnap ? c.check(player, validSnap) : false;
  const isClaimed   = (c) => claimed.includes(c.id);

  const completedCount = challenges.filter(c => isComplete(c)).length;
  const claimedCount   = challenges.filter(c => isClaimed(c)).length;

  const totalRewards = challenges.reduce((s, c) => ({
    cash: s.cash + c.rewards.cash,
    xp:   s.xp   + c.rewards.xp,
  }), { cash: 0, xp: 0 });

  return (
    <div className="challenges-page animate-in">
      <div className="page-header">
        <h2>Daily Challenges</h2>
        <span className="mono muted" style={{ fontSize: "0.7em" }}>
          5 objectives · Resets in {hLeft}h {mLeft}m · Complete all for a bonus
        </span>
      </div>

      {/* Progress bar */}
      <div className="challenges-summary">
        <div className="challenges-progress-row">
          <div>
            <div className="mono amber" style={{ fontSize: "0.82em" }}>
              {claimedCount} / {challenges.length} claimed
            </div>
            <div className="mono muted" style={{ fontSize: "0.65em", marginTop: 2 }}>
              {completedCount} complete · {challenges.length - completedCount} remaining
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontSize: "0.72em", color: "#3d8c5a" }}>
              Max: +${totalRewards.cash.toLocaleString()} · +{totalRewards.xp.toLocaleString()} XP
            </div>
            <div className="mono muted" style={{ fontSize: "0.62em", marginTop: 2 }}>
              Resets {reset.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>
        <div className="progress-bar" style={{ height: 5, marginTop: 8 }}>
          <div className="progress-fill" style={{
            width: `${(claimedCount / challenges.length) * 100}%`,
            background: "var(--amber)",
            transition: "width 0.5s ease"
          }} />
        </div>
        {!validSnap && (
          <div className="mono" style={{ fontSize: "0.68em", color: "#d4a827", marginTop: 6 }}>
            ⚠ Session snapshot not yet taken — progress tracked from next login.
          </div>
        )}
      </div>

      {/* Challenge cards */}
      <div className="challenges-list">
        {challenges.map((c) => {
          const done    = isComplete(c);
          const claimed = isClaimed(c);
          const catColor = CAT_COLORS[c.category] || "var(--amber)";

          return (
            <div
              key={c.id}
              className={`challenge-card ${claimed ? "claimed" : done ? "complete" : ""}`}
              style={{ borderLeftColor: claimed ? "#3d8c5a" : done ? catColor : "var(--border)" }}
            >
              <div className="challenge-top">
                <span className="challenge-cat-badge" style={{ color: catColor, borderColor: catColor }}>
                  {c.category}
                </span>
                <span className="challenge-label">{c.label}</span>
                <div className="challenge-status" style={{ marginLeft: "auto" }}>
                  {claimed ? (
                    <span className="mono" style={{ fontSize: "0.65em", color: "#3d8c5a" }}>✓ CLAIMED</span>
                  ) : done ? (
                    <span className="mono" style={{ fontSize: "0.65em", color: catColor }}>▶ READY</span>
                  ) : (
                    <span className="mono muted" style={{ fontSize: "0.65em" }}>IN PROGRESS</span>
                  )}
                </div>
              </div>

              <p className="challenge-desc">{c.desc}</p>

              <div className="challenge-footer">
                <div className="challenge-rewards">
                  <span className="reward-tag" style={{ color: "#3d8c5a" }}>+${c.rewards.cash.toLocaleString()}</span>
                  <span className="reward-tag" style={{ color: "#5a7ec8" }}>+{c.rewards.xp} XP</span>
                </div>
                {done && !claimed && (
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: "0.68em", padding: "5px 14px" }}
                    onClick={() => onClaimChallenge?.(c)}
                  >
                    ▶ Claim
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* All-complete bonus banner */}
      {claimedCount === challenges.length && (
        <div className="bonus-banner animate-in">
          <div className="mono amber" style={{ fontSize: "0.75em", letterSpacing: "0.15em", marginBottom: 4 }}>
            ▲ ALL CHALLENGES COMPLETE
          </div>
          <p className="dim" style={{ fontSize: "0.85em" }}>
            Comeback tomorrow for a fresh set. The grind never stops.
          </p>
        </div>
      )}

      <style>{`
        .challenges-page { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
        .page-header { display: flex; flex-direction: column; gap: 4px; }
        .page-header h2 { font-size: 1.2em; letter-spacing: 0.15em; }
        .challenges-summary { background: var(--bg-card); border: 1px solid var(--border); padding: 14px 16px; }
        .challenges-progress-row { display: flex; justify-content: space-between; align-items: flex-start; }
        .challenges-list { display: flex; flex-direction: column; gap: 8px; }
        .challenge-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-left: 3px solid;
          padding: 13px 15px; display: flex; flex-direction: column; gap: 7px;
          transition: background 0.15s;
        }
        .challenge-card.complete { background: rgba(200,146,42,0.04); }
        .challenge-card.claimed  { background: rgba(61,140,90,0.05); opacity: 0.7; }
        .challenge-top { display: flex; align-items: center; gap: 8px; }
        .challenge-cat-badge { font-family: var(--font-mono); font-size: 0.6em; padding: 2px 6px; border: 1px solid; text-transform: uppercase; letter-spacing: 0.08em; }
        .challenge-label { font-family: var(--font-display); font-size: 0.9em; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
        .challenge-desc { font-size: 0.85em; color: var(--text-secondary); line-height: 1.5; }
        .challenge-footer { display: flex; align-items: center; justify-content: space-between; }
        .challenge-rewards { display: flex; gap: 8px; }
        .reward-tag { font-family: var(--font-mono); font-size: 0.72em; padding: 2px 8px; background: var(--bg-raised); border: 1px solid var(--border); }
        .bonus-banner { background: var(--bg-card); border: 1px solid var(--amber); border-left: 3px solid var(--amber); padding: 16px; text-align: center; }
      `}</style>
    </div>
  );
}
