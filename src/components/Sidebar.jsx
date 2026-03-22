import { useMemo } from "react";
import { getMissionsForFaction } from "../data/factionMissions";
import { getDailyChallenges, isSameDay } from "../data/dailyChallenges";
import { secondsRemaining } from "../hooks/useGameClock";
import { STORY_QUESTS, SIDE_QUESTS, getQuestStatus, QUEST_STATUS } from "../data/quests";

const NAV_ITEMS = [
  { id:"dashboard",   icon:"▣", label:"Dashboard"   },
  { id:"quests",      icon:"📜", label:"Quests"      },
  { id:"crimes",      icon:"🗂", label:"Crimes"      },
  { id:"training",    icon:"💪", label:"Training"    },
  { id:"factions",    icon:"⚡", label:"Factions"    },
  { id:"missions",    icon:"📋", label:"Faction Ops" },
  { id:"challenges",  icon:"🎯", label:"Daily"       },
  { id:"crew",        icon:"👥", label:"Crew"        },
  { id:"market",      icon:"◈", label:"Market"      },
  { id:"darkweb",     icon:"🌑", label:"Dark Web"    },
  { id:"territory",   icon:"⬡", label:"Territory"   },
  { id:"prison",      icon:"⊞", label:"Prison"      },
  { id:"multiplayer", icon:"🌐", label:"Network"     },
  { id:"news",        icon:"📰", label:"News"        },
  { id:"statistics",  icon:"📊", label:"Stats"       },
  { id:"profile",     icon:"◉", label:"Profile"     },
  { id:"settings",    icon:"⚙", label:"Settings"    },
];

function useBadges(player) {
  return useMemo(() => {
    const badges = {};
    if (!player) return badges;

    // Claimable quests (story + side) — using proper ES imports
    const questClaimable = (() => {
      let n = 0;
      try {
        STORY_QUESTS.forEach(q => {
          if (getQuestStatus(q, player) === QUEST_STATUS.CLAIMABLE) n++;
        });
        SIDE_QUESTS.forEach(q => {
          if (getQuestStatus(q, player) === QUEST_STATUS.CLAIMABLE) n++;
        });
      } catch {}
      return n;
    })();
    if (questClaimable > 0) badges["quests"] = questClaimable;
    if (player.factionId) {
      const missions  = getMissionsForFaction(player.factionId);
      const completed = player.completedMissions || [];
      const claimable = missions.filter(m => m.checkComplete(player) && !completed.includes(m.id));
      if (claimable.length) badges["missions"] = claimable.length;
    }

    // Unclaimed daily challenges
    const dailies = getDailyChallenges();
    const snapshot = player.dailySnapshot;
    const claimed  = player.claimedChallenges || [];
    if (snapshot && isSameDay(snapshot)) {
      const ready = dailies.filter(c => c.check(player, snapshot) && !claimed.includes(c.id));
      if (ready.length) badges["challenges"] = ready.length;
    }

    // Training complete
    if (player.activeTraining) {
      const secs = secondsRemaining(player.activeTraining.startedAt, player.activeTraining.durationMs);
      if (secs <= 0) badges["training"] = "✓";
    }

    // Health low
    if ((player.health || 100) < 40) badges["settings"] = "!";

    // Prison: in custody
    if ((player.heat || 0) >= 80) badges["prison"] = "!";

    // Dirty cash waiting to launder
    if ((player.dirtyCash || 0) >= 10000) badges["market"] = "$";

    return badges;
  }, [
    player?.factionId, player?.completedMissions?.length,
    player?.claimedChallenges?.length, player?.xp,
    player?.activeTraining?.startedAt,
    player?.health, player?.heat, player?.dirtyCash,
    player?.crimesSucceeded, player?.crew?.length,
    player?.ownedDistricts?.length, player?.totalEarned,
    player?.trainingLog?.length, player?.inventory?.length,
    player?.dailySnapshot,
  ]);
}

export default function Sidebar({ activePage, onNavigate, player }) {
  const badges = useBadges(player);

  return (
    <aside className="sidebar">
      <div className="sidebar-section-label">Navigate</div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const badge = badges[item.id];
          return (
            <button
              key={item.id}
              className={`sidebar-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
              {badge && (
                <span className={`sidebar-badge ${badge === "!" ? "badge-warn" : badge === "$" ? "badge-cash" : badge === "✓" ? "badge-ok" : "badge-count"}`}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-section-label">System</div>
        <div className="sidebar-footer-stat mono"><span className="muted">v0.6.0-alpha</span></div>
      </div>
      <style>{`
        .sidebar{grid-area:sidebar;background:var(--bg-surface);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto;padding:12px 0;}
        .sidebar-section-label{font-family:var(--font-mono);font-size:.6em;text-transform:uppercase;letter-spacing:.15em;color:var(--text-muted);padding:4px 16px 8px;margin-top:8px;}
        .sidebar-nav{display:flex;flex-direction:column;gap:1px;}
        .sidebar-item{display:flex;align-items:center;gap:10px;padding:9px 16px;background:transparent;border:none;border-left:2px solid transparent;color:var(--text-secondary);cursor:pointer;text-align:left;font-family:var(--font-display);font-size:.82em;font-weight:400;letter-spacing:.08em;text-transform:uppercase;transition:all .12s ease;position:relative;}
        .sidebar-item:hover{color:var(--text-primary);background:var(--amber-glow);border-left-color:var(--amber-dim);}
        .sidebar-item.active{color:var(--amber);background:var(--amber-glow);border-left-color:var(--amber);}
        .sidebar-icon{font-size:.88em;width:16px;text-align:center;flex-shrink:0;}
        .sidebar-label{flex:1;}
        .sidebar-badge{font-family:var(--font-mono);font-size:.6em;font-weight:700;padding:1px 5px;border-radius:2px;letter-spacing:.02em;line-height:1.4;}
        .badge-count{background:#c0392b;color:#fff;}
        .badge-warn {background:#c0392b;color:#fff;}
        .badge-cash {background:#3d8c5a;color:#fff;}
        .badge-ok   {background:#5a7ec8;color:#fff;}
        .sidebar-footer{margin-top:auto;border-top:1px solid var(--border);padding-top:8px;}
        .sidebar-footer-stat{padding:4px 16px;font-size:.7em;}
      `}</style>
    </aside>
  );
}
