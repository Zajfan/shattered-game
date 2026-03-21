import { useState } from "react";
import { calcLevel } from "../data/levels";

const CONTACTS = [
  {
    id: "mama_chen",
    name: "Mama Chen",
    alias: "The Accountant",
    role: "Money Laundering Specialist",
    origin: "Fujian Province → Vancouver → Everywhere",
    icon: "💼",
    tier: 2,
    levelReq: 3,
    trustReq: 0,
    bio: "Runs a network of dry cleaners, nail salons, and bubble tea shops across North America. Every penny that goes in comes out spotless. Doesn't ask questions. Doesn't make eye contact.",
    realNote: "Source: FinCEN — cash-intensive small businesses laundered $50B+ in the US in 2022. Asian-organized money laundering networks documented extensively in Vancouver ('Laundromat') RCMP investigations.",
    jobs: [
      {
        id: "chen_launder_fast",
        label: "Express Launder",
        desc: "Convert dirty cash at 80 cents on the dollar. Faster than standard, slightly less cut.",
        type: "launder",
        conversionRate: 0.80,
        minDirty: 5000,
        maxDirty: 100000,
        cooldownHours: 6,
        rewardNote: "80% conversion (vs 70% standard)",
      },
      {
        id: "chen_shell",
        label: "Shell Company Setup",
        desc: "Full corporate structure with real bank accounts in 72 hours. $15,000 flat fee.",
        type: "purchase",
        itemId: "shell_company_docs",
        price: 15000,
        cooldownHours: 72,
        rewardNote: "Better quality than market — includes real bank account",
      },
    ],
  },
  {
    id: "viktor_k",
    name: "Viktor K.",
    alias: "The Armorer",
    role: "Weapons Procurement",
    origin: "Odessa, Ukraine",
    icon: "🔧",
    tier: 2,
    levelReq: 4,
    trustReq: 0,
    bio: "Former Donetsk arms depot manager. Knows where every surplus weapon in Eastern Europe ends up. Ships in auto parts, receives payment in crypto only. Never meets in person. Ever.",
    realNote: "Source: ATF — Eastern European arms trafficking into US increased 40% post-2022. Odessa, Georgia, and Romania flagged as primary export points. Average profit margin: 300%.",
    jobs: [
      {
        id: "viktor_bulk_weapons",
        label: "Bulk Weapons Order",
        desc: "4x ghost pistols for the price of 3. Volume discount from the source.",
        type: "bulk_purchase",
        itemId: "ghost_pistol",
        quantity: 4,
        price: 2400,
        cooldownHours: 48,
        rewardNote: "25% cheaper than market per unit",
      },
      {
        id: "viktor_custom",
        label: "Custom Armament",
        desc: "AR-style pistol, off-book. Ships in three parts separately.",
        type: "purchase",
        itemId: "ar_pistol",
        price: 2800,
        cooldownHours: 96,
        rewardNote: "Significant market discount",
      },
    ],
  },
  {
    id: "ghost_zero",
    name: "Ghost_Zero",
    alias: "The Phantom",
    role: "Cybercrime Infrastructure",
    origin: "Unknown — Romania suspected",
    icon: "👾",
    tier: 3,
    levelReq: 6,
    trustReq: 1,
    bio: "Sells access. Zero-days, ransomware toolkits, initial access brokers. Has never been photographed. The FBI has a file on them with nothing but a username and an estimated income of $4M+.",
    realNote: "Source: Chainalysis — Initial Access Brokers (IABs) sell corporate access for $500-$10,000. Top brokers operate through Telegram and XSS forum. FBI IC3: cybercrime losses hit $12.5B in 2023.",
    jobs: [
      {
        id: "ghost_toolkit",
        label: "Hacking Toolkit",
        desc: "Pre-configured attack suite — credential stuffers, keyloggers, C2 infrastructure.",
        type: "stat_boost",
        stat: "techSavvy",
        amount: 8,
        price: 8000,
        cooldownHours: 72,
        rewardNote: "+8 Tech Savvy permanently",
      },
      {
        id: "ghost_cover",
        label: "Digital Cover",
        desc: "Full false identity package: new IP, VPN chain, clean accounts.",
        type: "heat_reduction",
        amount: 25,
        price: 12000,
        cooldownHours: 48,
        rewardNote: "-25% heat, untraceable for 48h",
      },
    ],
  },
  {
    id: "el_chivato",
    name: "El Chivato",
    alias: "The Informant",
    role: "Intelligence Broker",
    origin: "Tijuana / San Diego",
    icon: "🗺",
    tier: 2,
    levelReq: 4,
    trustReq: 0,
    bio: "Sells information to whoever pays. Police schedules, rival crew movements, sting operation tips, judge connections. Has informants in three police departments, one DA's office, and two cartel cells simultaneously.",
    realNote: "Source: DOJ — paid confidential informants number 15,000+ in US federal law enforcement. Reciprocal: many informants also sell to criminal organizations. 'Double dipping' widely documented.",
    jobs: [
      {
        id: "chivato_police_tip",
        label: "Police Schedule Intel",
        desc: "Know when and where patrols are concentrated for the next 24 hours.",
        type: "heat_reduction",
        amount: 15,
        price: 3000,
        cooldownHours: 24,
        rewardNote: "-15% heat + crime success +10% for 24h",
      },
      {
        id: "chivato_rival",
        label: "Rival Crew Movement",
        desc: "Intel on a competing faction's territory operations. Useful for raids or avoiding conflict.",
        type: "intel",
        price: 5000,
        cooldownHours: 48,
        rewardNote: "Reveals rival district vulnerabilities",
      },
    ],
  },
  {
    id: "padre_santos",
    name: "Padre Santos",
    alias: "The Facilitator",
    role: "Connections Broker",
    origin: "Medellín, Colombia",
    icon: "🕊",
    tier: 3,
    levelReq: 5,
    trustReq: 1,
    bio: "A priest, a lawyer, and a cartel liaison walk into a bar — they're all the same person. Santos facilitates introductions between criminal organizations. A single referral from him opens doors that take years to earn.",
    realNote: "Source: DEA — 'facilitators' and intermediary brokers documented in 80%+ of major cartel indictments. Pablo Escobar's lawyer reportedly earned $50M/year in facilitation fees.",
    jobs: [
      {
        id: "santos_network",
        label: "Network Expansion",
        desc: "Santos makes three introductions. Your connections grow immediately.",
        type: "stat_boost",
        stat: "connections",
        amount: 12,
        price: 10000,
        cooldownHours: 96,
        rewardNote: "+12 Connections permanently",
      },
      {
        id: "santos_faction_intro",
        label: "Faction Introduction",
        desc: "Direct introduction to a Tier 4+ organization — skip the stat requirements for one faction.",
        type: "faction_bypass",
        price: 25000,
        cooldownHours: 168,
        rewardNote: "Bypass faction stat requirements once",
      },
    ],
  },
  {
    id: "hex_nine",
    name: "Hex Nine",
    alias: "The Forger",
    role: "Document Specialist",
    origin: "Eastern Europe / Dark Web",
    icon: "📄",
    tier: 2,
    levelReq: 3,
    trustReq: 0,
    bio: "Produces documents that pass machine reads and human inspection. Passports, licenses, corporate filings. Clients include cartel leadership, political fugitives, and hedge fund criminals. 72-hour turnaround.",
    realNote: "Source: Interpol — document fraud losses exceed $1B annually. Dark web 'document services' range from $50 (basic ID) to $15,000 (biometric passport). Most sophisticated forgers operate in Eastern Europe.",
    jobs: [
      {
        id: "hex_passport",
        label: "Premium Passport",
        desc: "Biometric-scannable passport. Better quality than market — passes airport checks.",
        type: "purchase",
        itemId: "fake_passport",
        price: 3500,
        cooldownHours: 72,
        rewardNote: "Higher quality than standard market passport",
      },
      {
        id: "hex_identity_package",
        label: "Full Identity Package",
        desc: "New identity: ID, passport, SSN, credit history. Complete cover.",
        type: "heat_reduction",
        amount: 40,
        price: 20000,
        cooldownHours: 168,
        rewardNote: "-40% heat — new identity clears most records",
      },
    ],
  },
  {
    id: "the_quartermaster",
    name: "Q",
    alias: "The Quartermaster",
    role: "Operational Logistics",
    origin: "Unknown — British accent",
    icon: "🗃",
    tier: 3,
    levelReq: 7,
    trustReq: 2,
    bio: "Sources operational equipment no market stocks. Custom electronics, signal jammers, surveillance countermeasures. No provenance. No paperwork. No refunds.",
    realNote: "Source: ATF/FBI — black market for operational equipment generates hundreds of millions annually in the US. Signal jammers widely used by organized crime to prevent electronic evidence collection.",
    jobs: [
      {
        id: "q_full_kit",
        label: "Operations Bundle",
        desc: "Police scanner + burner phones + lock pick set at 40% combined discount.",
        type: "bundle",
        items: ["police_scanner", "burner_phones", "lock_pick_set"],
        price: 700,
        cooldownHours: 48,
        rewardNote: "Bundle discount — significantly cheaper than market",
      },
      {
        id: "q_train_stealth",
        label: "Countersurveillance Training",
        desc: "A full day of TSCM — technical surveillance countermeasures.",
        type: "stat_boost",
        stat: "stealth",
        amount: 10,
        price: 15000,
        cooldownHours: 120,
        rewardNote: "+10 Stealth permanently",
      },
    ],
  },
  {
    id: "the_cleaner",
    name: "Sofia V.",
    alias: "The Cleaner",
    role: "Problem Elimination",
    origin: "St. Petersburg, Russia",
    icon: "🧹",
    tier: 4,
    levelReq: 9,
    trustReq: 3,
    bio: "Thirty years of making problems disappear. Evidence, witnesses, heat. Not a killer — she's more precise than that. One call to Sofia costs more than most people make in a year. Worth every cent.",
    realNote: "Source: Europol — evidence tampering and witness intimidation documented in 35% of organized crime prosecutions. 'Cleaners' identified as a distinct criminal role in 12+ Europol SOCTA entries.",
    jobs: [
      {
        id: "cleaner_evidence",
        label: "Evidence Suppression",
        desc: "Corrupt the chain of evidence on an open case. Significant heat drop.",
        type: "heat_reduction",
        amount: 45,
        price: 35000,
        cooldownHours: 168,
        rewardNote: "-45% heat — removes active cases",
      },
      {
        id: "cleaner_witness",
        label: "Witness Relocation",
        desc: "Motivated witness decided not to testify. Problem solved, cleanly.",
        type: "heat_reduction",
        amount: 30,
        price: 20000,
        cooldownHours: 96,
        rewardNote: "-30% heat, +10 nerve",
      },
    ],
  },
];

export default function DarkWebPage({ player, onContactJob }) {
  const [selected, setSelected] = useState(null);
  const [activeJob, setActiveJob] = useState(null);
  const [result, setResult] = useState(null);

  const level = calcLevel(player?.xp || 0);
  const trust = player?.contactTrust || {};
  const cash  = player?.cash || 0;
  const usedJobs = player?.usedContactJobs || {};

  const isJobOnCooldown = (job) => {
    const usedAt = usedJobs[job.id];
    if (!usedAt) return false;
    const cooldownMs = job.cooldownHours * 3600 * 1000;
    return Date.now() - usedAt < cooldownMs;
  };

  const jobCooldownRemaining = (job) => {
    const usedAt = usedJobs[job.id];
    if (!usedAt) return 0;
    const cooldownMs = job.cooldownHours * 3600 * 1000;
    const remaining = cooldownMs - (Date.now() - usedAt);
    if (remaining <= 0) return 0;
    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const handleJob = (contact, job) => {
    if (isJobOnCooldown(job)) return;
    if (cash < (job.price || 0)) {
      setResult({ error: `Need $${(job.price||0).toLocaleString()}` });
      return;
    }
    onContactJob?.(contact, job);
    setResult({ success: true, job });
    setActiveJob(null);
  };

  return (
    <div className="darkweb-page animate-in">
      <div className="page-header">
        <h2>Dark Web Contacts</h2>
        <span className="mono muted" style={{ fontSize: "0.7em" }}>
          Named operatives. Exclusive deals. No questions. No receipts.
        </span>
      </div>

      {result && (
        <div
          className="result-banner animate-in"
          style={{ borderColor: result.error ? "#c0392b" : "#3d8c5a", color: result.error ? "#c0392b" : "#3d8c5a" }}
          onClick={() => setResult(null)}
        >
          {result.error ? `✗ ${result.error}` : `✓ Deal complete: ${result.job?.label}`}
          <span className="mono muted" style={{ marginLeft: "auto", fontSize: "0.68em" }}>[dismiss]</span>
        </div>
      )}

      <div className="contacts-layout">
        {/* Contact list */}
        <div className="contacts-list">
          {CONTACTS.map((c) => {
            const locked = level < c.levelReq;
            const myTrust = trust[c.id] || 0;
            const trustLocked = myTrust < c.trustReq;
            return (
              <div
                key={c.id}
                className={`contact-card ${selected?.id === c.id ? "selected" : ""} ${locked ? "locked" : ""}`}
                onClick={() => !locked && setSelected(c)}
              >
                <div className="contact-card-top">
                  <span className="contact-icon">{c.icon}</span>
                  <div>
                    <div className="contact-name">{c.name}</div>
                    <div className="mono muted" style={{ fontSize: "0.65em" }}>{c.alias} · {c.role}</div>
                  </div>
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    {locked ? (
                      <span className="mono" style={{ fontSize: "0.62em", color: "#c0392b" }}>Lv{c.levelReq} req</span>
                    ) : (
                      <span className="trust-dots">
                        {[0,1,2,3].map(i => (
                          <span key={i} style={{ color: i < myTrust ? "var(--amber)" : "var(--border)", fontSize: "0.7em" }}>◆</span>
                        ))}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mono muted" style={{ fontSize: "0.7em" }}>{c.origin}</div>
              </div>
            );
          })}
        </div>

        {/* Contact detail */}
        <div className="contact-detail-col">
          {selected ? (
            <div className="contact-detail animate-in">
              <div className="panel-header">{selected.name} — {selected.alias}</div>
              <div className="mono muted" style={{ fontSize: "0.68em", marginBottom: 8 }}>{selected.role} · {selected.origin}</div>

              <p style={{ fontSize: "0.88em", lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: 10 }}>
                {selected.bio}
              </p>

              <div className="real-data-note" style={{ marginBottom: 12 }}>
                <p style={{ fontSize: "0.72em", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.5 }}>
                  {selected.realNote}
                </p>
              </div>

              <hr className="dark" />
              <div className="label" style={{ marginBottom: 8 }}>Available Jobs</div>

              {selected.jobs.map((job) => {
                const onCooldown  = isJobOnCooldown(job);
                const cdRemaining = jobCooldownRemaining(job);
                const canAfford   = cash >= (job.price || 0);

                return (
                  <div key={job.id} className={`job-card ${onCooldown ? "on-cooldown" : ""}`}>
                    <div className="job-top">
                      <span className="job-label">{job.label}</span>
                      {onCooldown && (
                        <span className="mono" style={{ fontSize: "0.62em", color: "#8c7a3d", marginLeft: "auto" }}>
                          ⏳ {cdRemaining}
                        </span>
                      )}
                    </div>
                    <p className="job-desc">{job.desc}</p>
                    <div className="job-footer">
                      <span className="mono" style={{ fontSize: "0.68em", color: "#3d8c5a" }}>{job.rewardNote}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {job.price > 0 && (
                          <span className="mono" style={{ fontSize: "0.72em", color: canAfford ? "var(--amber)" : "#c0392b" }}>
                            ${job.price.toLocaleString()}
                          </span>
                        )}
                        {!onCooldown && (
                          <button
                            className="btn btn-primary"
                            style={{ fontSize: "0.65em", padding: "4px 12px" }}
                            disabled={!canAfford || onCooldown}
                            onClick={() => handleJob(selected, job)}
                          >
                            ▶ Deal
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="contact-empty">
              <span className="mono muted" style={{ fontSize: "0.75em" }}>Select a contact</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .darkweb-page { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
        .page-header { display: flex; flex-direction: column; gap: 4px; }
        .page-header h2 { font-size: 1.2em; letter-spacing: 0.15em; }
        .result-banner { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border: 1px solid; font-family: var(--font-mono); font-size: 0.75em; cursor: pointer; }
        .contacts-layout { display: grid; grid-template-columns: 1fr 310px; gap: 14px; }
        .contacts-list { display: flex; flex-direction: column; gap: 6px; }
        .contact-card { background: var(--bg-card); border: 1px solid var(--border); padding: 11px 13px; cursor: pointer; display: flex; flex-direction: column; gap: 5px; transition: all 0.12s; }
        .contact-card:hover { border-color: var(--amber-dim); background: var(--bg-raised); }
        .contact-card.selected { border-color: var(--amber); background: var(--amber-glow); }
        .contact-card.locked { opacity: 0.45; cursor: not-allowed; }
        .contact-card-top { display: flex; align-items: flex-start; gap: 10px; }
        .contact-icon { font-size: 1.2em; flex-shrink: 0; margin-top: 1px; }
        .contact-name { font-family: var(--font-display); font-size: 0.9em; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
        .trust-dots { display: flex; gap: 3px; }
        .contact-detail { background: var(--bg-card); border: 1px solid var(--border); padding: 16px; display: flex; flex-direction: column; gap: 8px; position: sticky; top: 0; max-height: 85vh; overflow-y: auto; }
        .contact-empty { background: var(--bg-card); border: 1px dashed var(--border); padding: 40px; display: flex; align-items: center; justify-content: center; }
        .job-card { background: var(--bg-raised); border: 1px solid var(--border); padding: 10px 12px; display: flex; flex-direction: column; gap: 5px; margin-bottom: 6px; }
        .job-card.on-cooldown { opacity: 0.6; }
        .job-top { display: flex; align-items: center; }
        .job-label { font-family: var(--font-display); font-size: 0.82em; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
        .job-desc { font-size: 0.8em; color: var(--text-secondary); line-height: 1.4; }
        .job-footer { display: flex; justify-content: space-between; align-items: center; }
        .real-data-note { padding: 8px; background: var(--bg-raised); border-left: 2px solid var(--amber-dim); }
      `}</style>
    </div>
  );
}
