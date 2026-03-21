// src/components/Toasts.jsx — In-game notification toasts
import { useState, useEffect, useCallback } from "react";

let _addToast = null;

export const toast = {
  show: (msg, type = "info", duration = 4000) => {
    _addToast?.({ msg, type, duration, id: Date.now() + Math.random() });
  },
  success: (msg, duration) => toast.show(msg, "success", duration),
  warn:    (msg, duration) => toast.show(msg, "warn",    duration),
  error:   (msg, duration) => toast.show(msg, "error",   duration),
  income:  (msg, duration) => toast.show(msg, "income",  duration),
};

const TYPE_STYLES = {
  success: { border: "#3d8c5a",  color: "#3d8c5a",  icon: "✓" },
  warn:    { border: "#d4a827",  color: "#d4a827",  icon: "⚠" },
  error:   { border: "#c0392b",  color: "#c0392b",  icon: "✗" },
  income:  { border: "#5a7ec8",  color: "#5a7ec8",  icon: "$" },
  info:    { border: "var(--amber)", color: "var(--amber)", icon: "▸" },
};

export default function Toasts() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((t) => {
    setToasts((prev) => [...prev, t].slice(-6));
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), t.duration);
  }, []);

  useEffect(() => { _addToast = addToast; return () => { _addToast = null; }; }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="toasts-container">
      {toasts.map((t) => {
        const s = TYPE_STYLES[t.type] || TYPE_STYLES.info;
        return (
          <div
            key={t.id}
            className="toast-item animate-in"
            style={{ borderLeftColor: s.border }}
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
          >
            <span className="toast-icon mono" style={{ color: s.color }}>{s.icon}</span>
            <span className="toast-msg mono">{t.msg}</span>
          </div>
        );
      })}
      <style>{`
        .toasts-container {
          position: fixed; bottom: 20px; right: 20px; z-index: 3000;
          display: flex; flex-direction: column; gap: 6px;
          pointer-events: none;
        }
        .toast-item {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-left: 3px solid;
          padding: 9px 14px;
          display: flex; align-items: center; gap: 8px;
          max-width: 340px;
          pointer-events: all;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          animation: toast-in 0.25s ease forwards;
        }
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .toast-icon { font-size: 0.75em; flex-shrink: 0; }
        .toast-msg  { font-size: 0.72em; color: var(--text-secondary); letter-spacing: 0.04em; }
      `}</style>
    </div>
  );
}
