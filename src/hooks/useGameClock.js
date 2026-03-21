// src/hooks/useGameClock.js — Real-time game engine
import { useEffect, useRef } from "react";
import { toast } from "../components/Toasts";

const ENERGY_REGEN_INTERVAL_MS    = 3 * 60 * 1000;
const TICK_MS                     = 1000;
const TERRITORY_INCOME_INTERVAL_MS= 60 * 60 * 1000;
const HEAT_DECAY_INTERVAL_MS      = 5 * 60 * 1000;

export function useGameClock(player, setPlayer) {
  const lastEnergyRegen   = useRef(Date.now());
  const lastTerritoryTick = useRef(Date.now());

  useEffect(() => {
    if (!player) return;

    const tick = () => {
      const now = Date.now();

      setPlayer((prev) => {
        if (!prev) return prev;
        let updated = false;
        let next = { ...prev };

        // ── Energy regeneration ──────────────────────────────────────────
        const maxEnergy = prev.maxEnergy || 100;
        if ((prev.energy || 0) < maxEnergy) {
          const elapsed = now - (prev.lastEnergyRegen || now);
          if (elapsed >= ENERGY_REGEN_INTERVAL_MS) {
            const gains = Math.floor(elapsed / ENERGY_REGEN_INTERVAL_MS);
            const newEnergy = Math.min(maxEnergy, (prev.energy || 0) + gains);
            next.energy = newEnergy;
            next.lastEnergyRegen = now - (elapsed % ENERGY_REGEN_INTERVAL_MS);
            updated = true;
          }
        }

        // ── Active training timer countdown ──────────────────────────────
        if (prev.activeTraining) {
          const elapsed = now - prev.activeTraining.startedAt;
          if (elapsed >= prev.activeTraining.durationMs) {
            const { stat, gain, maxEnergyGain, activityId } = prev.activeTraining;
            const newStats = { ...next.stats };
            if (stat) newStats[stat] = (newStats[stat] || 0) + gain;
            next.stats = newStats;
            if (maxEnergyGain) next.maxEnergy = Math.min(150, (next.maxEnergy || 100) + maxEnergyGain);
            next.activeTraining = null;
            next.trainingLog = [
              { activityId, stat, gain, completedAt: now },
              ...(next.trainingLog || []),
            ].slice(0, 20);
            updated = true;
            toast.success(`Training complete: +${gain} ${stat}`);
          }
        }

        // ── Active crime timer countdown ─────────────────────────────────
        if (prev.activeCrimeTimer) {
          const elapsed = now - prev.activeCrimeTimer.startedAt;
          if (elapsed >= prev.activeCrimeTimer.durationMs) {
            next.activeCrimeTimer = null;
            updated = true;
          }
        }

        // ── Heat decay ────────────────────────────────────────────────────
        if ((prev.heat || 0) > 0) {
          const heatElapsed = now - (prev.lastHeatDecay || now);
          if (heatElapsed >= HEAT_DECAY_INTERVAL_MS) {
            const decayTicks = Math.floor(heatElapsed / HEAT_DECAY_INTERVAL_MS);
            const newHeat = Math.max(0, (prev.heat || 0) - decayTicks);
            const newLevel = newHeat >= 90 ? 5 : newHeat >= 70 ? 4 : newHeat >= 50 ? 3 : newHeat >= 30 ? 2 : newHeat >= 15 ? 1 : 0;
            next.heat          = newHeat;
            next.heatLevel     = newLevel;
            next.lastHeatDecay = now - (heatElapsed % HEAT_DECAY_INTERVAL_MS);
            updated = true;
          }
        }

        // ── Crime cooldown expiry ─────────────────────────────────────────
        if (prev.activeCrimeTimer) {
          const elapsed = now - prev.activeCrimeTimer.startedAt;
          if (elapsed >= prev.activeCrimeTimer.durationMs) {
            next.activeCrimeTimer = null;
            updated = true;
          }
        }

        // ── Territory passive income tick ────────────────────────────────
        const territoryElapsed = now - (prev.lastTerritoryTick || now);
        if (territoryElapsed >= TERRITORY_INCOME_INTERVAL_MS && (prev.ownedDistricts?.length || 0) > 0) {
          // Import handled externally — income calc passed in via player.weeklyTerritoryIncome
          const hourlyIncome = Math.floor((prev.weeklyTerritoryIncome || 0) / (7 * 24));
          if (hourlyIncome > 0) {
            next.cash      = (next.cash || 0) + hourlyIncome;
            next.totalEarned = (next.totalEarned || 0) + hourlyIncome;
            next.lastTerritoryTick = now;
            next.lastIncomeAmount  = hourlyIncome;
            updated = true;
            toast.income(`Territory income: +$${hourlyIncome.toLocaleString()}`);
          }
        }

        return updated ? next : prev;
      });
    };

    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [player?.id]); // only re-attach when player changes identity
}

// Returns seconds remaining for a timer
export const secondsRemaining = (startedAt, durationMs) => {
  if (!startedAt) return 0;
  const elapsed = Date.now() - startedAt;
  return Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
};

// Format seconds → "4m 32s" or "1h 2m"
export const formatCountdown = (secs) => {
  if (secs <= 0) return "Done";
  if (secs < 60)  return `${secs}s`;
  if (secs < 3600)return `${Math.floor(secs/60)}m ${secs%60}s`;
  return `${Math.floor(secs/3600)}h ${Math.floor((secs%3600)/60)}m`;
};
