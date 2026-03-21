export function MarketPage() {
  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }} className="animate-in">
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2em", letterSpacing: "0.15em" }}>BLACK MARKET</h2>
      <p className="dim" style={{ fontSize: "0.88em" }}>
        Fences, suppliers, and black-market vendors will be available here.
        Buy weapons, forged documents, stolen goods. Sell your haul.
      </p>
      <div className="panel" style={{ borderStyle: "dashed", textAlign: "center", padding: 40 }}>
        <span className="mono muted">Coming Soon — Under Construction</span>
      </div>
    </div>
  );
}

export function TerritoryPage() {
  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }} className="animate-in">
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2em", letterSpacing: "0.15em" }}>TERRITORY MAP</h2>
      <p className="dim" style={{ fontSize: "0.88em" }}>
        Real-world cities, boroughs, and districts. Claim turf, collect passive income, defend against rivals.
        Based on real FBI crime hotspot data.
      </p>
      <div className="panel" style={{ borderStyle: "dashed", textAlign: "center", padding: 40 }}>
        <span className="mono muted">Coming Soon — Under Construction</span>
      </div>
    </div>
  );
}

export function PrisonPage({ player }) {
  const isJailed = player?.heat >= 80;
  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }} className="animate-in">
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2em", letterSpacing: "0.15em" }}>PRISON</h2>
      <p className="dim" style={{ fontSize: "0.88em" }}>
        Get caught with 80%+ heat and you're booked. Use prison time to train stats, recruit, or plan escapes.
      </p>
      {!isJailed && (
        <div className="panel" style={{ borderLeft: "3px solid #3d8c5a" }}>
          <span className="mono" style={{ color: "#3d8c5a", fontSize: "0.85em" }}>
            ✓ You are currently free. Keep your heat below 80%.
          </span>
        </div>
      )}
      {isJailed && (
        <div className="panel" style={{ borderLeft: "3px solid #c0392b" }}>
          <span className="mono" style={{ color: "#c0392b", fontSize: "0.85em" }}>
            ⚠ You are in custody.
          </span>
        </div>
      )}
      <div className="panel" style={{ borderStyle: "dashed", textAlign: "center", padding: 40 }}>
        <span className="mono muted">Full Prison System — Coming Soon</span>
      </div>
    </div>
  );
}

export function ProfilePage({ player }) {
  const statEntries = Object.entries(player?.stats || {});
  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }} className="animate-in">
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2em", letterSpacing: "0.15em" }}>PROFILE</h2>
      <div className="panel">
        <div className="panel-header">Identity</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div><span className="label">Name</span><br /><span className="mono amber">{player?.name}</span></div>
          <div><span className="label">ID</span><br /><span className="mono muted">{player?.id}</span></div>
          <div><span className="label">Level</span><br /><span className="mono amber">{player?.level}</span></div>
          <div><span className="label">XP</span><br /><span className="mono muted">{player?.xp} / {player?.xpToNextLevel}</span></div>
          <div><span className="label">Faction</span><br /><span className="mono">{player?.factionId || "None"}</span></div>
          <div><span className="label">Created</span><br /><span className="mono muted">{player?.createdAt ? new Date(player.createdAt).toLocaleDateString() : "—"}</span></div>
        </div>
      </div>
      <div className="panel">
        <div className="panel-header">All Stats</div>
        {statEntries.map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
            <span className="mono muted" style={{ fontSize: "0.8em", textTransform: "capitalize" }}>{k}</span>
            <span className="mono amber" style={{ fontSize: "0.8em" }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
