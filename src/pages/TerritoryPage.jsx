import { useState } from "react";
import { territories, getAllDistricts } from "../data/territories";

const TYPE_COLORS = {
  "Residential":        "#e05555",
  "Commercial":         "#d4a827",
  "Industrial":         "#5a7ec8",
  "Port / Transit":     "#3d8c5a",
  "Financial District": "#a85fd4",
  "Nightlife":          "#c8922a",
};

const CRIME_INDEX_LABEL = (idx) => {
  if (idx >= 80) return { label: "Extreme", color: "#c0392b" };
  if (idx >= 60) return { label: "High",    color: "#e67e22" };
  if (idx >= 40) return { label: "Medium",  color: "#d4a827" };
  return              { label: "Low",     color: "#3d8c5a" };
};

export default function TerritoryPage({ player, onClaimDistrict }) {
  const [selectedCity,     setSelectedCity]     = useState(territories[0].id);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [feedback,         setFeedback]         = useState(null);

  const city     = territories.find((t) => t.id === selectedCity);
  const ownedIds = player?.ownedDistricts || [];

  const handleClaim = (district) => {
    if (ownedIds.includes(district.id)) {
      setFeedback({ type: "error", msg: "Already controlled." });
      return;
    }
    if ((player?.stats?.reputation || 0) < district.requiredRep) {
      setFeedback({ type: "error", msg: `Need ${district.requiredRep} Reputation to claim.` });
      return;
    }
    if ((player?.level || 1) < district.requiredLevel) {
      setFeedback({ type: "error", msg: `Need Level ${district.requiredLevel} to operate here.` });
      return;
    }
    // Claim cost: 3x weekly income
    const claimCost = district.passiveIncome * 3;
    if ((player?.cash || 0) < claimCost) {
      setFeedback({ type: "error", msg: `Need $${claimCost.toLocaleString()} to establish operations.` });
      return;
    }
    onClaimDistrict?.({ districtId: district.id, cost: claimCost });
    setFeedback({ type: "success", msg: `Now controlling ${district.name}. Passive income: $${district.passiveIncome.toLocaleString()}/wk` });
  };

  const totalWeeklyIncome = ownedIds.reduce((sum, id) => {
    const d = getAllDistricts().find((d) => d.id === id);
    return sum + (d?.passiveIncome || 0);
  }, 0);

  const crimeIdx = CRIME_INDEX_LABEL(city.crimeIndex);

  return (
    <div className="territory-page animate-in">
      <div className="page-header">
        <h2>Territory Control</h2>
        <span className="mono muted" style={{ fontSize: "0.7em" }}>
          Claim districts. Collect passive income. Based on FBI crime hotspot data.
        </span>
      </div>

      {/* Empire summary */}
      <div className="empire-bar">
        <div className="empire-stat">
          <span className="label">Districts Held</span>
          <span className="mono amber">{ownedIds.length}</span>
        </div>
        <div className="empire-stat">
          <span className="label">Weekly Income</span>
          <span className="mono" style={{ color: "#3d8c5a" }}>${totalWeeklyIncome.toLocaleString()}</span>
        </div>
        <div className="empire-stat">
          <span className="label">Your Reputation</span>
          <span className="mono amber">{player?.stats?.reputation || 0}</span>
        </div>
        <div className="empire-stat">
          <span className="label">Your Level</span>
          <span className="mono amber">{player?.level || 1}</span>
        </div>
        <div className="empire-stat">
          <span className="label">Cash Available</span>
          <span className="mono amber">${(player?.cash || 0).toLocaleString()}</span>
        </div>
      </div>

      {feedback && (
        <div
          className="feedback-bar animate-in"
          style={{ borderColor: feedback.type === "success" ? "#3d8c5a" : "#c0392b",
                   color:       feedback.type === "success" ? "#3d8c5a" : "#c0392b" }}
          onClick={() => setFeedback(null)}
        >
          {feedback.type === "success" ? "✓" : "✗"} {feedback.msg}
          <span className="mono muted" style={{ marginLeft: "auto", fontSize: "0.7em" }}>[dismiss]</span>
        </div>
      )}

      {/* City Selector */}
      <div className="city-tabs">
        {territories.map((t) => {
          const ci = CRIME_INDEX_LABEL(t.crimeIndex);
          return (
            <button
              key={t.id}
              className={`city-tab ${selectedCity === t.id ? "active" : ""}`}
              onClick={() => { setSelectedCity(t.id); setSelectedDistrict(null); }}
            >
              <span className="city-tab-name">{t.city}</span>
              <span className="mono" style={{ fontSize: "0.6em", color: ci.color }}>{t.state} · {ci.label}</span>
            </button>
          );
        })}
      </div>

      <div className="territory-layout">
        {/* District List */}
        <div className="district-panel">
          {/* City header */}
          <div className="city-info-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="mono amber" style={{ fontSize: "0.65em", letterSpacing: "0.2em", marginBottom: 2 }}>CITY INTEL</div>
                <h3 style={{ fontSize: "1.1em", letterSpacing: "0.12em" }}>{city.city}, {city.state}</h3>
                <div className="mono muted" style={{ fontSize: "0.7em", marginTop: 2 }}>{city.nickname}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="label">Crime Index</div>
                <div className="mono" style={{ fontSize: "1.2em", color: crimeIdx.color }}>{city.crimeIndex}/100</div>
                <div className="mono muted" style={{ fontSize: "0.65em" }}>{crimeIdx.label}</div>
              </div>
            </div>
            <div className="detail-row" style={{ marginTop: 8 }}>
              <span className="label">Violent Crime (per 100k)</span>
              <span className="mono" style={{ fontSize: "0.8em", color: "#c0392b" }}>{city.fbiViolentCrimeRate.toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span className="label">Dominant Orgs</span>
              <span className="mono muted" style={{ fontSize: "0.75em" }}>{city.dominantOrgs.join(", ")}</span>
            </div>
            <div className="real-data-note" style={{ marginTop: 8 }}>
              <p style={{ fontSize: "0.72em", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.5 }}>
                {city.realDataNote}
              </p>
            </div>
          </div>

          {/* District cards */}
          <div className="label" style={{ marginBottom: 8, marginTop: 4 }}>Districts</div>
          <div className="district-list">
            {city.districts.map((district) => {
              const isOwned    = ownedIds.includes(district.id);
              const canAfford  = (player?.cash || 0) >= district.passiveIncome * 3;
              const hasRep     = (player?.stats?.reputation || 0) >= district.requiredRep;
              const hasLevel   = (player?.level || 1) >= district.requiredLevel;
              const eligible   = canAfford && hasRep && hasLevel;
              const typeColor  = TYPE_COLORS[district.type] || "var(--amber)";

              return (
                <div
                  key={district.id}
                  className={`district-card ${selectedDistrict?.id === district.id ? "selected" : ""} ${isOwned ? "owned" : ""}`}
                  onClick={() => setSelectedDistrict(district)}
                  style={{ borderLeftColor: isOwned ? "#3d8c5a" : district.crimeHotspot ? "#c0392b" : "var(--border)" }}
                >
                  <div className="district-card-top">
                    <span className="district-type-badge" style={{ color: typeColor, borderColor: typeColor }}>
                      {district.type}
                    </span>
                    {district.crimeHotspot && (
                      <span className="mono" style={{ fontSize: "0.6em", color: "#c0392b" }}>⚠ HOTSPOT</span>
                    )}
                    {isOwned && (
                      <span className="mono" style={{ fontSize: "0.6em", color: "#3d8c5a", marginLeft: "auto" }}>● CONTROLLED</span>
                    )}
                  </div>
                  <div className="district-name">{district.name}</div>
                  <div className="district-meta">
                    <span className="mono muted" style={{ fontSize: "0.7em" }}>{district.incomeType}</span>
                    <span className="mono" style={{ fontSize: "0.72em", color: "#3d8c5a" }}>
                      ${district.passiveIncome.toLocaleString()}/wk
                    </span>
                  </div>
                  {!isOwned && (
                    <div className="district-req mono muted" style={{ fontSize: "0.65em" }}>
                      Req: Rep {district.requiredRep} · Lv {district.requiredLevel}
                      · ${(district.passiveIncome * 3).toLocaleString()} to establish
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* District Detail */}
        <div className="district-detail-col">
          {selectedDistrict ? (
            <div className="district-detail animate-in">
              <div className="panel-header">{selectedDistrict.name}</div>
              <span className="district-type-badge" style={{
                color: TYPE_COLORS[selectedDistrict.type],
                borderColor: TYPE_COLORS[selectedDistrict.type],
                marginBottom: 12, display: "inline-block"
              }}>
                {selectedDistrict.type}
              </span>

              <hr className="dark" />

              <div className="detail-row">
                <span className="label">Weekly Income</span>
                <span className="mono" style={{ color: "#3d8c5a" }}>${selectedDistrict.passiveIncome.toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span className="label">Income Type</span>
                <span className="mono muted" style={{ fontSize: "0.8em" }}>{selectedDistrict.incomeType}</span>
              </div>
              <div className="detail-row">
                <span className="label">Establish Cost</span>
                <span className="mono amber">${(selectedDistrict.passiveIncome * 3).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span className="label">Heat Modifier</span>
                <span className="mono" style={{ color: selectedDistrict.heatModifier > 1 ? "#c0392b" : "#3d8c5a" }}>
                  ×{selectedDistrict.heatModifier}
                </span>
              </div>

              <hr className="dark" />

              <div className="label" style={{ marginBottom: 6 }}>Requirements</div>
              {[
                { key: "Reputation", need: selectedDistrict.requiredRep, have: player?.stats?.reputation || 0 },
                { key: "Level",      need: selectedDistrict.requiredLevel, have: player?.level || 1 },
                { key: "Cash",       need: selectedDistrict.passiveIncome * 3, have: player?.cash || 0, isCash: true },
              ].map(({ key, need, have, isCash }) => {
                const met = have >= need;
                return (
                  <div className="detail-row" key={key}>
                    <span className="mono muted" style={{ fontSize: "0.75em" }}>{key}</span>
                    <span className="mono" style={{ fontSize: "0.75em", color: met ? "#3d8c5a" : "#c0392b" }}>
                      {isCash ? `$${have.toLocaleString()} / $${need.toLocaleString()}` : `${have} / ${need}`} {met ? "✓" : "✗"}
                    </span>
                  </div>
                );
              })}

              <hr className="dark" />

              <div className="label" style={{ marginBottom: 6 }}>Crime Bonuses</div>
              {Object.entries(selectedDistrict.crimeBonus).map(([crime, val]) => (
                <div className="detail-row" key={crime}>
                  <span className="mono muted" style={{ fontSize: "0.72em" }}>{crime.replace(/_/g, " ")}</span>
                  <span className="mono" style={{ fontSize: "0.72em", color: "#d4a827" }}>+{val}% success</span>
                </div>
              ))}

              <div className="real-data-note" style={{ marginTop: 12 }}>
                <span className="label" style={{ fontSize: "0.6em" }}>Real Data</span>
                <p style={{ fontSize: "0.75em", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.5, marginTop: 4 }}>
                  {selectedDistrict.realDataNote}
                </p>
              </div>

              <hr className="dark" />

              {ownedIds.includes(selectedDistrict.id) ? (
                <div className="owned-badge">
                  <span className="mono" style={{ color: "#3d8c5a", fontSize: "0.85em" }}>✓ TERRITORY CONTROLLED</span>
                </div>
              ) : (
                <button
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "12px", marginTop: 4 }}
                  onClick={() => handleClaim(selectedDistrict)}
                >
                  ▶ Claim — ${(selectedDistrict.passiveIncome * 3).toLocaleString()}
                </button>
              )}
            </div>
          ) : (
            <div className="district-detail-empty">
              <span className="mono muted" style={{ fontSize: "0.75em" }}>Select a district</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .territory-page { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
        .page-header { display: flex; flex-direction: column; gap: 4px; }
        .page-header h2 { font-size: 1.2em; letter-spacing: 0.15em; }
        .empire-bar { display: flex; gap: 0; border: 1px solid var(--border); background: var(--bg-card); }
        .empire-stat { flex: 1; padding: 10px 16px; display: flex; flex-direction: column; gap: 3px; border-right: 1px solid var(--border); }
        .empire-stat:last-child { border-right: none; }
        .city-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
        .city-tab {
          display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
          padding: 8px 14px; background: transparent; border: 1px solid var(--border);
          cursor: pointer; transition: all 0.12s; min-width: 130px;
        }
        .city-tab:hover { border-color: var(--amber-dim); background: var(--bg-raised); }
        .city-tab.active { border-color: var(--amber); background: var(--amber-glow); }
        .city-tab-name { font-family: var(--font-display); font-size: 0.85em; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-primary); }
        .territory-layout { display: grid; grid-template-columns: 1fr 300px; gap: 16px; }
        .district-panel { display: flex; flex-direction: column; gap: 10px; }
        .city-info-card { background: var(--bg-card); border: 1px solid var(--border); border-left: 3px solid var(--amber); padding: 14px; }
        .district-list { display: flex; flex-direction: column; gap: 6px; }
        .district-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-left: 3px solid;
          padding: 10px 14px; cursor: pointer; transition: all 0.12s;
          display: flex; flex-direction: column; gap: 5px;
        }
        .district-card:hover { border-color: var(--amber-dim); background: var(--bg-raised); }
        .district-card.selected { border-color: var(--amber); background: var(--amber-glow); }
        .district-card.owned { background: rgba(61,140,90,0.06); }
        .district-card-top { display: flex; align-items: center; gap: 6px; }
        .district-name { font-family: var(--font-display); font-size: 0.95em; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
        .district-meta { display: flex; justify-content: space-between; }
        .district-req { color: var(--text-muted); }
        .district-type-badge { font-family: var(--font-mono); font-size: 0.6em; letter-spacing: 0.08em; padding: 2px 6px; border: 1px solid; text-transform: uppercase; }
        .district-detail-col { }
        .district-detail {
          background: var(--bg-card); border: 1px solid var(--border);
          padding: 16px; display: flex; flex-direction: column; gap: 8px;
          position: sticky; top: 0;
        }
        .district-detail-empty {
          background: var(--bg-card); border: 1px dashed var(--border);
          padding: 40px; display: flex; align-items: center; justify-content: center;
        }
        .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 3px 0; }
        .real-data-note { padding: 8px; background: var(--bg-raised); border-left: 2px solid var(--amber-dim); }
        .owned-badge { padding: 12px; border: 1px solid #3d8c5a; background: rgba(61,140,90,0.08); text-align: center; }
        .feedback-bar {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 14px; border: 1px solid; font-family: var(--font-mono);
          font-size: 0.78em; cursor: pointer; letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
}
