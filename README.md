# SHATTERED
### Criminal Underworld Simulator

> A browser-based crime RPG in the style of Torn — built on **real criminal organizations, real crime data, and real statistics**.

---

## Concept

Shattered is a text/UI-based browser RPG where players build criminal careers from the ground up — starting with petty street crime and potentially rising to lead organized crime syndicates or cartels. Every organization, crime type, and statistic in the game is sourced from real-world law enforcement reports (FBI, DEA, Europol, UNODC, Interpol).

---

## Current Game Systems

### Character Creation
- Choose an alias
- Pick an origin background: **Street Kid, White Collar, Ex-Military, Cartel Runaway, Underground Hacker**
- Each background grants unique stat bonuses and starting cash

### Stats System
| Stat | Description |
|------|-------------|
| Muscle | Physical strength, intimidation |
| Nerve | Risk tolerance, crime attempt modifier |
| Intelligence | Planning, fraud, high-tier financial crimes |
| Street Smarts | Situational awareness, escape success |
| Tech Savvy | Hacking, cybercrime, device exploitation |
| Connections | Network — unlocks fences, suppliers, corrupt officials |
| Reputation | Notoriety in the criminal world |
| Honor | Faction loyalty metric |
| Stealth | Witness reduction, surveillance avoidance |
| Dexterity | Manual skill: pickpocketing, lockpicking |

### Crime System — 5 Tiers
Based on FBI UCR, DEA NDTS, Europol SOCTA, Chainalysis, and UNODC reports.

| Tier | Category | Examples |
|------|----------|---------|
| 1 | Street Level | Shoplifting, Pickpocketing, Transit Skimming, Mugging |
| 2 | Mid-Level | Grand Theft Auto, Street Dealing, Identity Theft, Armed Robbery |
| 3 | Organized | Chop Shop, Drug Distribution, Protection Racket, Bank Robbery |
| 4 | Syndicate | Money Laundering, People Smuggling, Ransomware Campaigns |
| 5 | Cartel / Mafia | Cartel Supply Chains, Arms Trafficking, Territory Control |

Each crime includes real-world sourced statistics, stat requirement checks, heat generation, and crew requirements at higher tiers.

### Heat System
- 0–100% heat meter
- Levels: **Ghost → Person of Interest → Suspect → Wanted → Federal → Interpol**
- High heat increases arrest probability on all crimes

### Factions — Real Criminal Organizations
Sourced from FBI, DEA, Europol, Interpol, and UNODC.

| Type | Organizations |
|------|--------------|
| Street Gangs | Crips, Bloods, MS-13 |
| American Mafia | Gambino Family, Genovese Family |
| Italian OC | Camorra, 'Ndrangheta |
| Cartels | Sinaloa Cartel, CJNG |
| Syndicates | Yakuza (Yamaguchi-gumi), Sun Yee On Triad |
| Cybercrime | LockBit |

---

## Roadmap

- [ ] **Black Market** — fences, suppliers, forged documents, contraband
- [ ] **Territory Map** — real city districts with FBI crime hotspot data, passive income
- [ ] **Prison System** — arrest → booking → sentence → stat training while incarcerated
- [ ] **Crew System** — recruit NPCs with stats and loyalty ratings
- [ ] **Money Laundering** — convert dirty cash through businesses, crypto, shell companies
- [ ] **Rival Players** — attack, raid, and compete
- [ ] **AI-Driven Events** — informants, undercover agents, dynamic crime outcomes (Claude API)
- [ ] **Multiplayer Backend** — persistent world, faction wars, leaderboards

---

## Tech Stack

- **Frontend:** React + Vite
- **Styling:** Custom CSS design system (noir / FBI case file aesthetic)
- **Data:** FBI UCR, DEA NDTS, Europol SOCTA, UNODC, Chainalysis
- **AI Integration:** Claude API (planned)

---

## Running Locally

```bash
npm install
npm run dev
```

---

## Data Sources

- FBI Uniform Crime Reporting (UCR) / NIBRS
- DEA National Drug Threat Assessment (2023)
- Europol SOCTA 2023
- UNODC Global Crime Reports
- Chainalysis Crypto Crime Report (2024)
- National Retail Federation Retail Security Survey
- Italian Anti-Mafia Commission (DNA)
- National Police Agency of Japan

---

`v0.1.0-alpha` — Core loop functional: character creation, 5-tier crime system, factions browser, heat system, stats tracking.
