import { useState, useEffect, useCallback } from "react";

const SERVER_URL = "http://localhost:3001";

const METRIC_LABELS = {
  reputation: "Reputation",
  cash:       "Total Earned",
  territory:  "Territory",
  crimes:     "Crimes",
};

const METRIC_COLORS = {
  reputation: "var(--amber)",
  cash:       "#3d8c5a",
  territory:  "#5a7ec8",
  crimes:     "#a85fd4",
};

function useServerData(endpoint, interval = 15000) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [online,  setOnline]  = useState(false);

  const fetch_ = useCallback(() => {
    fetch(`${SERVER_URL}${endpoint}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setOnline(true); setError(null); })
      .catch((e) => { setError(e.message); setOnline(false); })
      .finally(() => setLoading(false));
  }, [endpoint]);

  useEffect(() => {
    fetch_();
    const id = setInterval(fetch_, interval);
    return () => clearInterval(id);
  }, [fetch_, interval]);

  return { data, loading, error, online, refresh: fetch_ };
}

export default function MultiplayerPage({ player }) {
  const [metric,         setMetric]     = useState("reputation");
  const [attackTarget,   setAttackTarget]= useState(null);
  const [attackDistrict, setAttackDistrict] = useState("");
  const [attackResult,   setAttackResult]= useState(null);
  const [attacking,      setAttacking]  = useState(false);
  const [tab,            setTab]        = useState("leaderboard"); // leaderboard | world | attacks

  const { data: lb,     loading: lbLoad,  online } = useServerData(`/api/leaderboard?metric=${metric}`, 20000);
  const { data: world,  loading: wLoad,   refresh: refreshWorld } = useServerData("/api/world", 10000);
  const { data: myAtks, loading: aLoad }  = useServerData(player?.id ? `/api/attacks/${player.id}` : null, 30000);

  const myRank = lb?.findIndex((p) => p.uid === player?.id);

  const handleAttack = async (target) => {
    if (!player?.id || attacking) return;
    setAttacking(true);
    setAttackResult(null);

    try {
      const res = await fetch(`${SERVER_URL}/api/attack`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          attackerUid: player.id,
          defenderUid: target.uid,
          districtId:  attackDistrict || null,
        }),
      });
      const data = await res.json();
      setAttackResult({ ...data, targetName: target.name });
      refreshWorld();
    } catch {
      setAttackResult({ error: "Server offline — multiplayer requires the game server running." });
    }
    setAttacking(false);
  };

  const serverStatus = online
    ? <span className="mono" style={{ fontSize: "0.65em", color: "#3d8c5a" }}>● SERVER ONLINE</span>
    : <span className="mono" style={{ fontSize: "0.65em", color: "#c0392b" }}>● SERVER OFFLINE — run: npm run server</span>;

  return (
    <div className="multi-page animate-in">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <h2>Underworld Network</h2>
          {serverStatus}
        </div>
        <span className="mono muted" style={{ fontSize: "0.7em" }}>
          Global leaderboard. Territory raids. Faction wars. {world?.playerCount || 0} operative(s) registered.
        </span>
      </div>

      {/* Tabs */}
      <div className="multi-tabs">
        {[["leaderboard","▣ Leaderboard"], ["world","🌐 World Feed"], ["attacks","⚔️ My Attacks"]].map(([id, label]) => (
          <button key={id} className={`multi-tab ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {/* ── LEADERBOARD ── */}
      {tab === "leaderboard" && (
        <div className="multi-layout">
          <div className="lb-panel">
            <div className="metric-tabs">
              {Object.entries(METRIC_LABELS).map(([m, label]) => (
                <button
                  key={m}
                  className={`metric-tab ${metric === m ? "active" : ""}`}
                  style={metric === m ? { borderColor: METRIC_COLORS[m], color: METRIC_COLORS[m] } : {}}
                  onClick={() => setMetric(m)}
                >
                  {label}
                </button>
              ))}
            </div>

            {!online && (
              <div className="offline-notice">
                <span className="mono" style={{ fontSize: "0.8em", color: "var(--text-muted)" }}>
                  ⚠ Server offline. Start with: <span className="amber">npm run server</span> in your project directory.
                  <br/>Add your Anthropic API key as <span className="amber">ANTHROPIC_API_KEY=sk-... npm run server</span> for AI events.
                </span>
              </div>
            )}

            {lbLoad && online && (
              <div className="lb-loading"><span className="mono muted flicker">Loading leaderboard...</span></div>
            )}

            {lb && (
              <div className="lb-table">
                <div className="lb-header">
                  <span className="label">#</span>
                  <span className="label" style={{ flex: 2 }}>Operative</span>
                  <span className="label">Level</span>
                  <span className="label" style={{ color: METRIC_COLORS[metric] }}>
                    {METRIC_LABELS[metric]}
                  </span>
                  <span className="label">Faction</span>
                  <span className="label">Action</span>
                </div>
                {lb.map((entry, i) => {
                  const isMe = entry.uid === player?.id;
                  const val  = metric === "reputation" ? entry.reputation
                             : metric === "cash"       ? `$${(entry.totalEarned || 0).toLocaleString()}`
                             : metric === "territory"  ? `${entry.ownedDistricts} districts`
                             : entry.crimesSucceeded;
                  return (
                    <div
                      key={entry.uid}
                      className={`lb-row ${isMe ? "lb-row-me" : ""} ${attackTarget?.uid === entry.uid ? "lb-row-selected" : ""}`}
                      onClick={() => !isMe && setAttackTarget(entry)}
                    >
                      <span className="mono" style={{ fontSize: "0.8em", color: i < 3 ? "var(--amber)" : "var(--text-muted)" }}>
                        {i === 0 ? "♛" : i === 1 ? "♜" : i === 2 ? "♝" : `#${entry.rank}`}
                      </span>
                      <div style={{ flex: 2 }}>
                        <div className="mono" style={{ fontSize: "0.85em", color: isMe ? "var(--amber)" : "var(--text-primary)" }}>
                          {entry.name} {isMe && <span style={{ color: "var(--amber-dim)" }}>(you)</span>}
                        </div>
                        {entry.lastSeen && (
                          <div className="mono muted" style={{ fontSize: "0.6em" }}>
                            Last seen: {new Date(entry.lastSeen).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <span className="mono muted" style={{ fontSize: "0.8em" }}>Lv {entry.level}</span>
                      <span className="mono" style={{ fontSize: "0.85em", color: METRIC_COLORS[metric] }}>{val}</span>
                      <span className="mono muted" style={{ fontSize: "0.7em" }}>{entry.factionId || "—"}</span>
                      {!isMe ? (
                        <button
                          className="btn btn-danger"
                          style={{ fontSize: "0.62em", padding: "3px 8px" }}
                          onClick={(e) => { e.stopPropagation(); setAttackTarget(entry); }}
                        >
                          ⚔ Raid
                        </button>
                      ) : (
                        <span className="mono muted" style={{ fontSize: "0.65em" }}>—</span>
                      )}
                    </div>
                  );
                })}
                {lb.length === 0 && (
                  <div className="lb-empty mono muted">No players registered yet. Start the server and sync your character.</div>
                )}
              </div>
            )}
          </div>

          {/* Attack Panel */}
          {attackTarget && (
            <div className="attack-panel animate-in">
              <div className="panel-header">⚔ Raid Target</div>
              <div className="detail-row">
                <span className="label">Target</span>
                <span className="mono" style={{ color: "#c0392b" }}>{attackTarget.name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Level</span>
                <span className="mono muted">{attackTarget.level}</span>
              </div>
              <div className="detail-row">
                <span className="label">Reputation</span>
                <span className="mono amber">{attackTarget.reputation}</span>
              </div>
              <div className="detail-row">
                <span className="label">Districts</span>
                <span className="mono" style={{ color: "#5a7ec8" }}>{attackTarget.ownedDistricts}</span>
              </div>
              <hr className="dark" />
              <div className="label" style={{ marginBottom: 6 }}>Your Power</div>
              <div className="detail-row">
                <span className="mono muted" style={{ fontSize: "0.75em" }}>Muscle + Nerve + Crew</span>
                <span className="mono amber" style={{ fontSize: "0.75em" }}>
                  {(player?.stats?.muscle || 0) + (player?.stats?.nerve || 0) + (player?.crew?.length || 0) * 5}
                </span>
              </div>
              <hr className="dark" />
              <div className="label" style={{ marginBottom: 4 }}>Target District (optional)</div>
              <input
                className="attack-input"
                placeholder="District ID (e.g. la_south_central)"
                value={attackDistrict}
                onChange={(e) => setAttackDistrict(e.target.value)}
              />
              {attackResult && (
                <div className={`attack-result animate-in ${attackResult.error ? "fail" : attackResult.attackerWins ? "win" : "fail"}`}>
                  {attackResult.error ? (
                    <span className="mono" style={{ fontSize: "0.75em", color: "#c0392b" }}>{attackResult.error}</span>
                  ) : (
                    <>
                      <div className="mono" style={{ fontSize: "0.7em", letterSpacing: "0.12em", marginBottom: 6 }}>
                        {attackResult.attackerWins ? "▶ RAID SUCCESSFUL" : "▶ REPELLED"}
                      </div>
                      <div className="detail-row">
                        <span className="label">Your Power</span>
                        <span className="mono amber">{attackResult.atkPower}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Their Power</span>
                        <span className="mono" style={{ color: "#c0392b" }}>{attackResult.defPower}</span>
                      </div>
                      {attackResult.attackerWins && (
                        <div className="detail-row">
                          <span className="label">Seized</span>
                          <span className="mono" style={{ color: "#3d8c5a" }}>${attackResult.stolen.toLocaleString()}</span>
                        </div>
                      )}
                      {attackResult.districtTaken && (
                        <div className="mono" style={{ fontSize: "0.7em", color: "#3d8c5a", marginTop: 4 }}>
                          ✓ District taken: {attackDistrict}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              <button
                className="btn btn-danger"
                style={{ width: "100%", padding: "11px", marginTop: 8 }}
                disabled={attacking || !online}
                onClick={() => handleAttack(attackTarget)}
              >
                {attacking ? "▶ RAIDING..." : `⚔ Launch Raid on ${attackTarget.name}`}
              </button>
              <button className="btn" style={{ width: "100%", marginTop: 4, fontSize: "0.7em" }} onClick={() => { setAttackTarget(null); setAttackResult(null); }}>
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── WORLD FEED ── */}
      {tab === "world" && (
        <div className="world-feed animate-in">
          {wLoad && <div className="mono muted flicker" style={{ fontSize: "0.8em", padding: 20 }}>Loading world feed...</div>}
          {!online && (
            <div className="offline-notice">
              <span className="mono muted" style={{ fontSize: "0.8em" }}>World feed requires the game server. Run: <span className="amber">npm run server</span></span>
            </div>
          )}
          {world?.events?.map((evt) => (
            <div key={evt.id} className={`world-event-row ${evt.type?.includes("win") ? "event-win" : evt.type === "new_player" ? "event-new" : "event-neutral"}`}>
              <span className="mono muted" style={{ fontSize: "0.62em", minWidth: 70 }}>
                {new Date(evt.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className="mono" style={{ fontSize: "0.78em" }}>{evt.text}</span>
            </div>
          ))}
          {world?.events?.length === 0 && online && (
            <div className="mono muted" style={{ fontSize: "0.8em", padding: 20 }}>
              The underworld is quiet. For now.
            </div>
          )}
        </div>
      )}

      {/* ── MY ATTACKS ── */}
      {tab === "attacks" && (
        <div className="attacks-feed animate-in">
          {aLoad && <div className="mono muted flicker" style={{ fontSize: "0.8em", padding: 20 }}>Loading...</div>}
          {!online && (
            <div className="offline-notice">
              <span className="mono muted" style={{ fontSize: "0.8em" }}>Attack log requires the game server.</span>
            </div>
          )}
          {myAtks?.map((atk) => {
            const isAttacker = atk.attackerId === player?.id;
            const won = isAttacker ? atk.attackerWins : !atk.attackerWins;
            return (
              <div key={atk.id} className={`attack-log-row ${won ? "atk-win" : "atk-loss"}`}>
                <div>
                  <div className="mono" style={{ fontSize: "0.8em" }}>
                    {isAttacker
                      ? `You raided ${atk.defenderName}`
                      : `${atk.attackerName} raided you`}
                  </div>
                  <div className="mono muted" style={{ fontSize: "0.65em" }}>
                    {new Date(atk.at).toLocaleString()} · {atk.districtId || "No district targeted"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono" style={{ fontSize: "0.78em", color: won ? "#3d8c5a" : "#c0392b" }}>
                    {won ? (isAttacker ? `+$${atk.stolen.toLocaleString()}` : "Defended") : (isAttacker ? "Repelled" : `-$${atk.stolen.toLocaleString()}`)}
                  </div>
                  <div className="mono muted" style={{ fontSize: "0.62em" }}>
                    PWR {atk.atkPower} vs {atk.defPower}
                  </div>
                </div>
              </div>
            );
          })}
          {myAtks?.length === 0 && online && (
            <div className="mono muted" style={{ fontSize: "0.8em", padding: 20 }}>No attack history yet.</div>
          )}
        </div>
      )}

      <style>{`
        .multi-page { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
        .page-header { display: flex; flex-direction: column; gap: 4px; }
        .page-header h2 { font-size: 1.2em; letter-spacing: 0.15em; }
        .multi-tabs { display: flex; gap: 4px; }
        .multi-tab {
          font-family: var(--font-mono); font-size: 0.75em; letter-spacing: 0.08em;
          text-transform: uppercase; background: transparent; border: 1px solid var(--border);
          color: var(--text-muted); padding: 7px 14px; cursor: pointer; transition: all 0.12s;
        }
        .multi-tab:hover  { border-color: var(--amber-dim); color: var(--text-secondary); }
        .multi-tab.active { border-color: var(--amber); color: var(--amber); background: var(--amber-glow); }
        .multi-layout { display: grid; grid-template-columns: 1fr 280px; gap: 16px; }
        .lb-panel { display: flex; flex-direction: column; gap: 10px; }
        .metric-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
        .metric-tab {
          font-family: var(--font-mono); font-size: 0.65em; padding: 4px 12px;
          background: transparent; border: 1px solid var(--border); color: var(--text-muted);
          cursor: pointer; transition: all 0.12s;
        }
        .metric-tab:hover { border-color: var(--amber-dim); color: var(--text-secondary); }
        .offline-notice { background: var(--bg-card); border: 1px solid var(--border); border-left: 3px solid var(--amber-dim); padding: 14px 16px; }
        .lb-loading { padding: 20px; text-align: center; }
        .lb-table { display: flex; flex-direction: column; }
        .lb-header {
          display: grid; grid-template-columns: 32px 2fr 50px 120px 80px 60px;
          padding: 6px 10px; border-bottom: 1px solid var(--border);
          background: var(--bg-raised);
        }
        .lb-row {
          display: grid; grid-template-columns: 32px 2fr 50px 120px 80px 60px;
          padding: 9px 10px; border-bottom: 1px solid var(--border);
          cursor: pointer; transition: background 0.1s; align-items: center;
        }
        .lb-row:hover        { background: var(--bg-raised); }
        .lb-row-me           { background: var(--amber-glow); }
        .lb-row-selected     { border-color: var(--amber); }
        .lb-empty { padding: 20px; color: var(--text-muted); font-size: 0.8em; }
        .attack-panel { background: var(--bg-card); border: 1px solid #c0392b; padding: 16px; display: flex; flex-direction: column; gap: 8px; height: fit-content; position: sticky; top: 0; }
        .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 3px 0; }
        .attack-input {
          width: 100%; background: var(--bg-raised); border: 1px solid var(--border);
          border-bottom: 2px solid var(--amber-dim); color: var(--text-secondary);
          font-family: var(--font-mono); font-size: 0.75em; padding: 7px 10px; outline: none;
        }
        .attack-result { padding: 10px; border: 1px solid; display: flex; flex-direction: column; gap: 5px; }
        .attack-result.win  { border-color: #3d8c5a; background: rgba(61,140,90,0.08); }
        .attack-result.fail { border-color: #8c3d3d; background: rgba(140,61,61,0.08); }
        .world-feed { display: flex; flex-direction: column; gap: 2px; }
        .world-event-row { display: flex; align-items: center; gap: 12px; padding: 7px 10px; border-bottom: 1px solid var(--border); }
        .world-event-row.event-win    { border-left: 2px solid #c0392b; }
        .world-event-row.event-new    { border-left: 2px solid #3d8c5a; }
        .world-event-row.event-neutral{ border-left: 2px solid var(--border); }
        .attacks-feed { display: flex; flex-direction: column; gap: 6px; }
        .attack-log-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 14px; background: var(--bg-card); border: 1px solid var(--border);
          border-left: 3px solid;
        }
        .atk-win  { border-left-color: #3d8c5a; }
        .atk-loss { border-left-color: #c0392b; }
      `}</style>
    </div>
  );
}
