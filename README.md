# SHATTERED
### Criminal Underworld Simulator — v0.3.0-alpha

> A browser-based crime RPG in the style of Torn — grounded entirely in **real criminal organizations, real crime data, and real statistics**. Now with AI-driven events and multiplayer.

---

## Running the Game

### Frontend only
```bash
npm install
npm run dev
```

### Full stack (frontend + multiplayer server)
```bash
npm install
npm run start
```

### Server with AI events (requires Anthropic API key)
```bash
ANTHROPIC_API_KEY=sk-ant-... npm run server
npm run dev
```

---

## Game Systems

### Character Creation
5 origin paths: Street Kid, White Collar, Ex-Military, Cartel Runaway, Underground Hacker

### Stats (10 total)
Muscle, Nerve, Intelligence, Street Smarts, Tech Savvy, Connections, Reputation, Honor, Stealth, Dexterity

### Crimes — 5 Tiers (16 crimes)
Tiered from shoplifting to cartel supply chain operations. All sourced from FBI UCR, DEA, Europol, UNODC.

### Heat System
0–100% · Ghost → Person of Interest → Suspect → Wanted → Federal → Interpol

### Factions (11 real organizations)
Crips, Bloods, MS-13, Gambino Family, Genovese Family, Camorra, 'Ndrangheta, Sinaloa Cartel, CJNG, Yakuza, Sun Yee On Triad, LockBit

### Black Market (18 items)
Weapons, Forged Documents, Narcotics, Equipment, Contraband, Criminal Services. Buy/sell/launder.

### Territory Map
5 cities (LA, Chicago, NYC, Miami, Detroit) · 16 real districts with FBI crime index scores, violent crime rates, passive income, crime bonuses.

### Prison System
6 sentence tiers · 6 training activities · Lawyer retainer reduces sentence 40%

### Crew Recruitment
8 archetypes · Randomized NPCs · Loyalty system · Weekly payroll

### AI-Driven NPC Events (Claude API)
Events fire every 45 seconds based on player state:
- **Informant Surfaces** — crew member flagged, choose: bribe / silence / ignore
- **Undercover Sting** — DEA closing in, choose: go dark / burn identity / test them
- **Rival Attack** — someone moving on your territory, choose: defend / counter / yield
- **Lucky Break** — unexpected opportunity surfaces
- **Faction War** — your faction is at war, choose: fight / stay neutral / defect
- **Police Raid** — coordinated law enforcement action

Each event generates a unique 2-sentence narrative via Claude API. Choices have real mechanical consequences.

### Profile Page
Full character dossier: all stats with progress bars, criminal record, inventory, crew roster, territory, faction badge, 18 achievements.

### Multiplayer (requires server)
- **Global Leaderboard** — ranked by Reputation, Total Earned, Territory, Crimes
- **Territory Raids** — attack other players, seize cash and districts
- **World Feed** — live global activity feed
- **Attack Log** — your raid history with outcomes
- Player state auto-syncs to server on every save

---

## Architecture

```
shattered-game/
├── src/                    # React + Vite frontend
│   ├── components/
│   │   ├── TopBar.jsx      # Header with server status indicator
│   │   ├── Sidebar.jsx     # Navigation
│   │   └── EventModal.jsx  # AI-powered event popup
│   ├── data/
│   │   ├── crimes.js       # 16 crimes, 5 tiers (FBI/DEA sourced)
│   │   ├── organizations.js# 11 real criminal orgs
│   │   ├── playerStats.js  # 10 stats, heat system
│   │   ├── market.js       # 18 black market items
│   │   ├── territories.js  # 5 cities, 16 districts (FBI data)
│   │   ├── crew.js         # 8 NPC archetypes
│   │   └── events.js       # AI event definitions and triggers
│   └── pages/
│       ├── Dashboard.jsx
│       ├── CrimesPage.jsx
│       ├── FactionsPage.jsx
│       ├── MarketPage.jsx
│       ├── TerritoryPage.jsx
│       ├── PrisonPage.jsx
│       ├── CrewPage.jsx
│       ├── ProfilePage.jsx
│       ├── MultiplayerPage.jsx
│       └── CharacterCreation.jsx
└── server/                 # Express multiplayer backend
    ├── index.js            # Server entry point (port 3001)
    ├── db.js               # JSON file persistence
    ├── world.json          # Live world state (auto-generated)
    └── routes/index.js     # All API routes
```

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/players/sync` | Sync player state to server |
| GET  | `/api/players/:uid` | Get player by ID |
| GET  | `/api/leaderboard?metric=reputation` | Global rankings |
| GET  | `/api/world` | World feed + player count |
| POST | `/api/attack` | Launch raid on another player |
| GET  | `/api/attacks/:uid` | Player's attack history |
| POST | `/api/ai/event` | Generate AI event narrative (proxies Anthropic API) |

---

## Data Sources
- FBI Uniform Crime Reporting (UCR) / NIBRS
- DEA National Drug Threat Assessment (2023)
- Europol SOCTA 2023
- UNODC Global Crime Reports
- Chainalysis Crypto Crime Report (2024)
- BJS Prison Statistics
- ATF Firearms Trafficking Reports
- NICB Vehicle Theft Statistics
- National Retail Federation Retail Security Survey
- Italian Anti-Mafia Commission (DNA)
- National Police Agency of Japan

---

`v0.3.0-alpha` — Profile, AI Events (Claude API), Multiplayer backend, 36 modules.
