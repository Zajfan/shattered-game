const NAV_ITEMS = [
  { id:"dashboard",   icon:"▣", label:"Dashboard"   },
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
  { id:"profile",     icon:"◉", label:"Profile"     },
  { id:"settings",    icon:"⚙", label:"Settings"    },
];
export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-section-label">Navigate</div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button key={item.id} className={`sidebar-item ${activePage===item.id?"active":""}`} onClick={()=>onNavigate(item.id)}>
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-section-label">System</div>
        <div className="sidebar-footer-stat mono"><span className="muted">v0.4.0-alpha</span></div>
      </div>
      <style>{`
        .sidebar{grid-area:sidebar;background:var(--bg-surface);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto;padding:12px 0;}
        .sidebar-section-label{font-family:var(--font-mono);font-size:0.6em;text-transform:uppercase;letter-spacing:.15em;color:var(--text-muted);padding:4px 16px 8px;margin-top:8px;}
        .sidebar-nav{display:flex;flex-direction:column;gap:1px;}
        .sidebar-item{display:flex;align-items:center;gap:10px;padding:9px 16px;background:transparent;border:none;border-left:2px solid transparent;color:var(--text-secondary);cursor:pointer;text-align:left;font-family:var(--font-display);font-size:0.82em;font-weight:400;letter-spacing:.08em;text-transform:uppercase;transition:all .12s ease;}
        .sidebar-item:hover{color:var(--text-primary);background:var(--amber-glow);border-left-color:var(--amber-dim);}
        .sidebar-item.active{color:var(--amber);background:var(--amber-glow);border-left-color:var(--amber);}
        .sidebar-icon{font-size:.88em;width:16px;text-align:center;}
        .sidebar-footer{margin-top:auto;border-top:1px solid var(--border);padding-top:8px;}
        .sidebar-footer-stat{padding:4px 16px;font-size:.7em;}
      `}</style>
    </aside>
  );
}
