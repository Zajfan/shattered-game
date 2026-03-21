import { useState } from "react";
import { marketItems, getItemsByCategory, MARKET_CATEGORIES } from "../data/market";

const CATEGORY_ICONS = {
  "Weapons":              "🔫",
  "Forged Documents":     "📄",
  "Narcotics":            "💊",
  "Operational Equipment":"🔧",
  "Contraband":           "📦",
  "Criminal Services":    "🤝",
};

const RARITY_COLORS = {
  common:   "#5a5248",
  uncommon: "#5a7ec8",
  rare:     "#a85fd4",
};

export default function MarketPage({ player, onMarketTransaction }) {
  const [tab, setTab]           = useState("buy");    // buy | sell | launder
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const inventory = player?.inventory || [];
  const cash      = player?.cash      || 0;
  const dirtyCash = player?.dirtyCash || 0;

  const items = getItemsByCategory(category);

  const owned = (itemId) => inventory.some((i) => i.id === itemId);

  const handleBuy = (item) => {
    if (cash < item.buyPrice) {
      setFeedback({ type: "error", msg: "Insufficient clean cash." });
      return;
    }
    if (owned(item.id)) {
      setFeedback({ type: "error", msg: "You already own this item." });
      return;
    }
    onMarketTransaction?.({
      type: "buy",
      item,
      cashDelta:  -item.buyPrice,
      inventoryAdd: item,
    });
    setFeedback({ type: "success", msg: `Acquired: ${item.name}` });
  };

  const handleSell = (item) => {
    onMarketTransaction?.({
      type: "sell",
      item,
      cashDelta: item.sellPrice,
      inventoryRemove: item.id,
    });
    setFeedback({ type: "success", msg: `Sold for $${item.sellPrice.toLocaleString()}` });
    setSelected(null);
  };

  // Launder: convert dirty cash to clean at a 70% rate (classic laundering cut)
  const [launderAmount, setLaunderAmount] = useState("");
  const handleLaunder = () => {
    const amount = parseInt(launderAmount, 10);
    if (!amount || amount <= 0 || amount > dirtyCash) {
      setFeedback({ type: "error", msg: "Invalid amount." });
      return;
    }
    const cleanGain = Math.floor(amount * 0.70);
    onMarketTransaction?.({
      type: "launder",
      dirtyLost: amount,
      cleanGain,
    });
    setFeedback({ type: "success", msg: `Laundered $${amount.toLocaleString()} → $${cleanGain.toLocaleString()} clean (30% cut taken).` });
    setLaunderAmount("");
  };

  return (
    <div className="market-page animate-in">
      <div className="page-header">
        <h2>Black Market</h2>
        <span className="mono muted" style={{ fontSize: "0.7em" }}>
          No names. No receipts. Cash only.
        </span>
      </div>

      {/* Tabs */}
      <div className="market-tabs">
        {["buy", "sell", "launder"].map((t) => (
          <button
            key={t}
            className={`market-tab ${tab === t ? "active" : ""}`}
            onClick={() => { setTab(t); setSelected(null); setFeedback(null); }}
          >
            {t === "buy" ? "▶ Buy" : t === "sell" ? "◀ Sell / Fence" : "♻ Launder"}
          </button>
        ))}

        <div style={{ marginLeft: "auto", display: "flex", gap: 20, alignItems: "center" }}>
          <span className="mono" style={{ fontSize: "0.75em" }}>
            Cash: <span className="amber">${cash.toLocaleString()}</span>
          </span>
          <span className="mono" style={{ fontSize: "0.75em" }}>
            Dirty: <span style={{ color: "#8c7a3d" }}>${dirtyCash.toLocaleString()}</span>
          </span>
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

      {/* ── BUY TAB ── */}
      {tab === "buy" && (
        <div className="market-layout">
          <div className="market-left">
            {/* Category filter */}
            <div className="category-filter">
              <button
                className={`cat-btn ${category === "all" ? "active" : ""}`}
                onClick={() => setCategory("all")}
              >All</button>
              {Object.values(MARKET_CATEGORIES).map((cat) => (
                <button
                  key={cat}
                  className={`cat-btn ${category === cat ? "active" : ""}`}
                  onClick={() => setCategory(cat)}
                >
                  {CATEGORY_ICONS[cat]} {cat}
                </button>
              ))}
            </div>

            {/* Item list */}
            <div className="item-list">
              {items.map((item) => {
                const canAfford = cash >= item.buyPrice;
                const isOwned   = owned(item.id);
                return (
                  <div
                    key={item.id}
                    className={`item-card ${selected?.id === item.id ? "selected" : ""} ${!canAfford || isOwned ? "dim-card" : ""}`}
                    onClick={() => setSelected(item)}
                  >
                    <div className="item-card-top">
                      <span className="item-category-icon">{CATEGORY_ICONS[item.category]}</span>
                      <span className="item-name">{item.name}</span>
                      <span style={{ color: RARITY_COLORS[item.rarity], fontSize: "0.6em", fontFamily: "var(--font-mono)", marginLeft: "auto" }}>
                        {item.rarity}
                      </span>
                    </div>
                    <div className="item-desc dim">{item.description}</div>
                    <div className="item-footer">
                      <span className="mono amber" style={{ fontSize: "0.8em" }}>${item.buyPrice.toLocaleString()}</span>
                      {isOwned  && <span className="mono" style={{ fontSize: "0.65em", color: "#3d8c5a" }}>✓ OWNED</span>}
                      {!canAfford && !isOwned && <span className="mono" style={{ fontSize: "0.65em", color: "#c0392b" }}>✗ CAN'T AFFORD</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detail panel */}
          <div className="market-detail-panel">
            {selected ? (
              <div className="market-detail animate-in">
                <div className="panel-header">{selected.name}</div>
                <div className="mono" style={{ fontSize: "0.6em", color: RARITY_COLORS[selected.rarity], marginBottom: 8 }}>
                  {selected.rarity.toUpperCase()} · {selected.category}
                </div>
                <p style={{ fontSize: "0.88em", lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: 12 }}>
                  {selected.description}
                </p>
                <hr className="dark" />

                <div className="detail-row">
                  <span className="label">Price</span>
                  <span className="mono amber">${selected.buyPrice.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Resale Value</span>
                  <span className="mono muted">${selected.sellPrice.toLocaleString()}</span>
                </div>
                {selected.heatOnPossession > 0 && (
                  <div className="detail-row">
                    <span className="label">Heat (Possession)</span>
                    <span className="mono" style={{ color: "#c0392b" }}>+{selected.heatOnPossession}%</span>
                  </div>
                )}
                {selected.heatReduction > 0 && (
                  <div className="detail-row">
                    <span className="label">Heat Reduction</span>
                    <span className="mono" style={{ color: "#3d8c5a" }}>-{selected.heatReduction}%</span>
                  </div>
                )}

                {/* Stat bonuses */}
                {Object.keys(selected.statBonus || {}).length > 0 && (
                  <>
                    <hr className="dark" />
                    <div className="label" style={{ marginBottom: 6 }}>Stat Bonuses</div>
                    {Object.entries(selected.statBonus).map(([stat, val]) => (
                      <div className="detail-row" key={stat}>
                        <span className="mono muted" style={{ fontSize: "0.75em", textTransform: "capitalize" }}>{stat}</span>
                        <span className="mono" style={{ fontSize: "0.75em", color: "#3d8c5a" }}>+{val}</span>
                      </div>
                    ))}
                  </>
                )}

                {/* Crime bonuses */}
                {Object.keys(selected.crimeBonus || {}).length > 0 && (
                  <>
                    <hr className="dark" />
                    <div className="label" style={{ marginBottom: 6 }}>Crime Bonuses</div>
                    {Object.entries(selected.crimeBonus).map(([crime, val]) => (
                      <div className="detail-row" key={crime}>
                        <span className="mono muted" style={{ fontSize: "0.72em" }}>{crime.replace(/_/g, " ")}</span>
                        <span className="mono" style={{ fontSize: "0.72em", color: "#d4a827" }}>+{val}% success</span>
                      </div>
                    ))}
                  </>
                )}

                <div className="real-data-note" style={{ marginTop: 12 }}>
                  <span className="label" style={{ fontSize: "0.6em" }}>Real Data</span>
                  <p style={{ fontSize: "0.75em", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.5, marginTop: 4 }}>
                    {selected.realDataNote}
                  </p>
                </div>

                <hr className="dark" />
                <button
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "12px", marginTop: 4 }}
                  disabled={cash < selected.buyPrice || owned(selected.id)}
                  onClick={() => handleBuy(selected)}
                >
                  {owned(selected.id) ? "✓ Already Owned" : `▶ Buy — $${selected.buyPrice.toLocaleString()}`}
                </button>
              </div>
            ) : (
              <div className="market-detail-empty">
                <span className="mono muted" style={{ fontSize: "0.75em" }}>Select an item to inspect</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SELL TAB ── */}
      {tab === "sell" && (
        <div className="market-layout">
          <div className="market-left">
            {inventory.length === 0 ? (
              <div className="empty-inventory">
                <span className="mono muted" style={{ fontSize: "0.8em" }}>
                  Your inventory is empty. Buy items first.
                </span>
              </div>
            ) : (
              <div className="item-list">
                {inventory.map((inv) => {
                  const itemDef = marketItems.find((i) => i.id === inv.id);
                  if (!itemDef) return null;
                  return (
                    <div
                      key={inv.id}
                      className={`item-card ${selected?.id === inv.id ? "selected" : ""}`}
                      onClick={() => setSelected(itemDef)}
                    >
                      <div className="item-card-top">
                        <span className="item-category-icon">{CATEGORY_ICONS[itemDef.category]}</span>
                        <span className="item-name">{itemDef.name}</span>
                      </div>
                      <div className="item-desc dim">{itemDef.description}</div>
                      <div className="item-footer">
                        <span className="mono" style={{ fontSize: "0.8em", color: "#3d8c5a" }}>
                          Fence: ${itemDef.sellPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="market-detail-panel">
            {selected ? (
              <div className="market-detail animate-in">
                <div className="panel-header">{selected.name}</div>
                <p style={{ fontSize: "0.88em", lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: 12 }}>
                  {selected.description}
                </p>
                <hr className="dark" />
                <div className="detail-row">
                  <span className="label">Fence Value</span>
                  <span className="mono" style={{ color: "#3d8c5a" }}>${selected.sellPrice.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Original Price</span>
                  <span className="mono muted">${selected.buyPrice.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Loss</span>
                  <span className="mono" style={{ color: "#c0392b" }}>
                    -${(selected.buyPrice - selected.sellPrice).toLocaleString()} ({Math.round((1 - selected.sellPrice / selected.buyPrice) * 100)}%)
                  </span>
                </div>
                <hr className="dark" />
                <button
                  className="btn btn-danger"
                  style={{ width: "100%", padding: "12px", marginTop: 4 }}
                  onClick={() => handleSell(selected)}
                >
                  ▶ Fence — Receive ${selected.sellPrice.toLocaleString()}
                </button>
              </div>
            ) : (
              <div className="market-detail-empty">
                <span className="mono muted" style={{ fontSize: "0.75em" }}>Select an item to fence</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── LAUNDER TAB ── */}
      {tab === "launder" && (
        <div className="launder-panel animate-in">
          <div className="panel" style={{ maxWidth: 560 }}>
            <div className="panel-header">Cash Laundering</div>
            <p style={{ fontSize: "0.88em", lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: 16 }}>
              Convert dirty cash to clean money through the fence network.
              Standard cut is <span className="amber">30%</span> — you keep 70 cents on every dirty dollar.
              No questions asked. No receipts issued.
            </p>

            <div className="launder-stats">
              <div className="launder-stat">
                <span className="label">Dirty Cash Available</span>
                <span className="mono" style={{ color: "#8c7a3d", fontSize: "1.1em" }}>${dirtyCash.toLocaleString()}</span>
              </div>
              <div className="launder-stat">
                <span className="label">Clean Cash</span>
                <span className="mono amber" style={{ fontSize: "1.1em" }}>${cash.toLocaleString()}</span>
              </div>
            </div>

            <hr className="dark" />

            <div className="label" style={{ marginBottom: 8 }}>Amount to Launder</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                type="number"
                className="launder-input"
                placeholder="Enter amount..."
                value={launderAmount}
                onChange={(e) => setLaunderAmount(e.target.value)}
                min={1}
                max={dirtyCash}
              />
              <button
                className="btn"
                style={{ whiteSpace: "nowrap" }}
                onClick={() => setLaunderAmount(String(dirtyCash))}
              >All In</button>
            </div>

            {launderAmount > 0 && (
              <div className="launder-preview animate-in">
                <div className="detail-row">
                  <span className="label">You Send</span>
                  <span className="mono" style={{ color: "#8c7a3d" }}>${parseInt(launderAmount || 0).toLocaleString()} dirty</span>
                </div>
                <div className="detail-row">
                  <span className="label">Fence Cut (30%)</span>
                  <span className="mono" style={{ color: "#c0392b" }}>-${Math.floor(parseInt(launderAmount || 0) * 0.3).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">You Receive</span>
                  <span className="mono" style={{ color: "#3d8c5a" }}>${Math.floor(parseInt(launderAmount || 0) * 0.7).toLocaleString()} clean</span>
                </div>
              </div>
            )}

            <button
              className="btn btn-primary"
              style={{ width: "100%", padding: "12px", marginTop: 16 }}
              disabled={!launderAmount || parseInt(launderAmount) <= 0 || parseInt(launderAmount) > dirtyCash}
              onClick={handleLaunder}
            >
              ▶ Launder ${parseInt(launderAmount || 0).toLocaleString()}
            </button>

            <div className="real-data-note" style={{ marginTop: 16 }}>
              <span className="label" style={{ fontSize: "0.6em" }}>Real Data</span>
              <p style={{ fontSize: "0.75em", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.5, marginTop: 4 }}>
                Source: UNODC — typical money laundering "haircut" ranges from 10–50% depending on method and jurisdiction.
                Street-level cash fencing averages 25–35% cut. Sophisticated laundering (shell companies, crypto) can reduce cut to under 10%.
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .market-page { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
        .page-header { display: flex; flex-direction: column; gap: 4px; }
        .page-header h2 { font-size: 1.2em; letter-spacing: 0.15em; }
        .market-tabs { display: flex; align-items: center; gap: 4px; border-bottom: 1px solid var(--border); padding-bottom: 12px; }
        .market-tab {
          font-family: var(--font-mono); font-size: 0.75em; text-transform: uppercase;
          letter-spacing: 0.1em; background: transparent; border: 1px solid var(--border);
          color: var(--text-muted); padding: 6px 14px; cursor: pointer; transition: all 0.15s;
        }
        .market-tab:hover { border-color: var(--amber-dim); color: var(--text-secondary); }
        .market-tab.active { border-color: var(--amber); color: var(--amber); background: var(--amber-glow); }
        .market-layout { display: grid; grid-template-columns: 1fr 290px; gap: 16px; }
        .market-left { display: flex; flex-direction: column; gap: 10px; }
        .category-filter { display: flex; flex-wrap: wrap; gap: 4px; }
        .cat-btn {
          font-family: var(--font-mono); font-size: 0.65em; padding: 4px 10px;
          background: transparent; border: 1px solid var(--border); color: var(--text-muted);
          cursor: pointer; transition: all 0.12s; letter-spacing: 0.05em;
        }
        .cat-btn:hover { border-color: var(--amber-dim); color: var(--text-secondary); }
        .cat-btn.active { border-color: var(--amber); color: var(--amber); background: var(--amber-glow); }
        .item-list { display: flex; flex-direction: column; gap: 6px; }
        .item-card {
          background: var(--bg-card); border: 1px solid var(--border);
          padding: 10px 14px; cursor: pointer; transition: all 0.12s;
          display: flex; flex-direction: column; gap: 5px;
        }
        .item-card:hover { border-color: var(--amber-dim); background: var(--bg-raised); }
        .item-card.selected { border-color: var(--amber); background: var(--amber-glow); }
        .item-card.dim-card { opacity: 0.55; }
        .item-card-top { display: flex; align-items: center; gap: 8px; }
        .item-category-icon { font-size: 0.9em; }
        .item-name { font-family: var(--font-display); font-size: 0.88em; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
        .item-desc { font-size: 0.82em; line-height: 1.5; }
        .item-footer { display: flex; justify-content: space-between; align-items: center; }
        .market-detail-panel { }
        .market-detail {
          background: var(--bg-card); border: 1px solid var(--border);
          padding: 16px; display: flex; flex-direction: column; gap: 8px;
          position: sticky; top: 0;
        }
        .market-detail-empty {
          background: var(--bg-card); border: 1px dashed var(--border);
          padding: 40px; display: flex; align-items: center; justify-content: center;
        }
        .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 3px 0; }
        .real-data-note { padding: 8px; background: var(--bg-raised); border-left: 2px solid var(--amber-dim); }
        .empty-inventory {
          background: var(--bg-card); border: 1px dashed var(--border);
          padding: 40px; display: flex; align-items: center; justify-content: center;
        }
        .feedback-bar {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 14px; border: 1px solid; font-family: var(--font-mono);
          font-size: 0.78em; cursor: pointer; letter-spacing: 0.05em;
        }
        .launder-panel { display: flex; flex-direction: column; gap: 16px; }
        .launder-stats { display: flex; gap: 20px; }
        .launder-stat { display: flex; flex-direction: column; gap: 4px; }
        .launder-input {
          flex: 1; background: var(--bg-card); border: 1px solid var(--border);
          border-bottom: 2px solid var(--amber); color: var(--text-primary);
          font-family: var(--font-mono); font-size: 1em; padding: 8px 12px; outline: none;
        }
        .launder-preview {
          background: var(--bg-raised); border: 1px solid var(--border);
          padding: 10px 14px; display: flex; flex-direction: column; gap: 4px;
        }
      `}</style>
    </div>
  );
}
