// src/hooks/useGameClock.js — Real-time game engine
import { useEffect } from "react";
import { toast } from "../components/Toasts";
import { snapshotPlayerState, isSameDay } from "../data/dailyChallenges";

const ENERGY_REGEN_INTERVAL_MS    = 3 * 60 * 1000;   // +1 energy per 3 min
const TICK_MS                     = 1000;
const TERRITORY_INCOME_INTERVAL_MS= 60 * 60 * 1000;  // passive income every hr
const HEAT_DECAY_INTERVAL_MS      = 5 * 60 * 1000;   // -1 heat per 5 min
const HEALTH_REGEN_INTERVAL_MS    = 10 * 60 * 1000;  // +1 health per 10 min

export function useGameClock(player, setPlayer) {
  useEffect(() => {
    if (!player) return;

    const tick = () => {
      const now = Date.now();

      setPlayer((prev) => {
        if (!prev) return prev;
        let updated = false;
        let next = { ...prev };

        // ── Daily snapshot refresh ───────────────────────────────────────
        if (!isSameDay(prev.dailySnapshot)) {
          next.dailySnapshot     = snapshotPlayerState(prev);
          next.claimedChallenges = [];   // reset claimed each day
          updated = true;
          toast.show("New day — daily challenges refreshed", "income", 4000);
        }

        // ── Energy regeneration ──────────────────────────────────────────
        const maxEnergy = prev.maxEnergy || 100;
        if ((prev.energy || 0) < maxEnergy) {
          const elapsed = now - (prev.lastEnergyRegen || now);
          if (elapsed >= ENERGY_REGEN_INTERVAL_MS) {
            const gains    = Math.floor(elapsed / ENERGY_REGEN_INTERVAL_MS);
            next.energy    = Math.min(maxEnergy, (prev.energy || 0) + gains);
            next.lastEnergyRegen = now - (elapsed % ENERGY_REGEN_INTERVAL_MS);
            updated = true;
          }
        }

        // ── Health regeneration ──────────────────────────────────────────
        if ((prev.health || 100) < 100) {
          const elapsed = now - (prev.lastHealthRegen || now);
          if (elapsed >= HEALTH_REGEN_INTERVAL_MS) {
            const gains   = Math.floor(elapsed / HEALTH_REGEN_INTERVAL_MS);
            const newHP   = Math.min(100, (prev.health || 100) + gains);
            next.health   = newHP;
            next.lastHealthRegen = now - (elapsed % HEALTH_REGEN_INTERVAL_MS);
            updated = true;
            if (newHP === 100) toast.show("Health fully recovered", "success", 3000);
          }
        }

        // ── Active training countdown ────────────────────────────────────
        if (prev.activeTraining) {
          const elapsed = now - prev.activeTraining.startedAt;
          if (elapsed >= prev.activeTraining.durationMs) {
            const { stat, gain, maxEnergyGain, activityId } = prev.activeTraining;
            const newStats = { ...next.stats };
            if (stat) newStats[stat] = (newStats[stat] || 0) + gain;
            next.stats         = newStats;
            if (maxEnergyGain) next.maxEnergy = Math.min(150, (next.maxEnergy || 100) + maxEnergyGain);
            next.activeTraining = null;
            next.trainingLog   = [
              { activityId, stat, gain, completedAt: now },
              ...(next.trainingLog || []),
            ].slice(0, 20);
            updated = true;
            toast.success(`Training complete: +${gain} ${stat}`);
          }
        }

        // ── Crime cooldown expiry ────────────────────────────────────────
        if (prev.activeCrimeTimer) {
          const elapsed = now - prev.activeCrimeTimer.startedAt;
          if (elapsed >= prev.activeCrimeTimer.durationMs) {
            next.activeCrimeTimer = null;
            updated = true;
          }
        }

        // ── Heat decay ───────────────────────────────────────────────────
        if ((prev.heat || 0) > 0) {
          const elapsed = now - (prev.lastHeatDecay || now);
          if (elapsed >= HEAT_DECAY_INTERVAL_MS) {
            const ticks   = Math.floor(elapsed / HEAT_DECAY_INTERVAL_MS);
            const newHeat = Math.max(0, (prev.heat || 0) - ticks);
            next.heat      = newHeat;
            next.heatLevel = newHeat >= 90 ? 5 : newHeat >= 70 ? 4 : newHeat >= 50 ? 3 : newHeat >= 30 ? 2 : newHeat >= 15 ? 1 : 0;
            next.lastHeatDecay = now - (elapsed % HEAT_DECAY_INTERVAL_MS);
            updated = true;
          }
        }

        // ── Territory income tick ────────────────────────────────────────
        const tElapsed = now - (prev.lastTerritoryTick || now);
        if (tElapsed >= TERRITORY_INCOME_INTERVAL_MS && (prev.ownedDistricts?.length || 0) > 0) {
          const hourly = Math.floor((prev.weeklyTerritoryIncome || 0) / (7 * 24));
          if (hourly > 0) {
            next.cash             = (next.cash || 0) + hourly;
            next.totalEarned      = (next.totalEarned || 0) + hourly;
            next.lastTerritoryTick= now;
            next.lastIncomeAmount  = hourly;
            updated = true;
            toast.income(`Territory income: +$${hourly.toLocaleString()}`);
          }
        }

        return updated ? next : prev;
      });
    };

    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [player?.id]);
}

export const secondsRemaining = (startedAt, durationMs) => {
  if (!startedAt) return 0;
  return Math.max(0, Math.ceil((durationMs - (Date.now() - startedAt)) / 1000));
};

export const formatCountdown = (secs) => {
  if (secs <= 0)   return "Done";
  if (secs < 60)   return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`;
};
