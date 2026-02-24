import { URWIS_CONFIG } from './config';

/**
 * Oblicza próg punktowy dla danego poziomu.
 */
export function getXPForLevel(level: number): number {
  const lvl = Math.max(1, level);
  return Math.floor(URWIS_CONFIG.LEVELING.BASE_XP * Math.pow(URWIS_CONFIG.LEVELING.EXPONENT, lvl - 1));
}

/**
 * Oblicza spadek statystyk na podstawie upływu czasu.
 * Wykorzystuje bezpieczną matematykę, aby uniknąć błędów NaN i skoków.
 */
export function calculateDecay(val: number, secondsPassed: number): number {
    // BUG: isNaN(val) ? 100 — domyślne 100 powoduje skoki!
    // FIX: jeśli wartość jest niepoprawna, traktuj jako 0
    const startVal = (val == null || isNaN(Number(val))) ? 0 : Number(val);
    const secs = (isNaN(secondsPassed) || secondsPassed < 0) ? 0 : secondsPassed;
    if (secs === 0) return startVal;
  
    const safeSeconds = Math.min(secs, 172800);
    const rates = URWIS_CONFIG.DECAY_RATES;
    let rate = rates.PHASE_5;
    if (startVal > 80) rate = rates.PHASE_1;
    else if (startVal > 60) rate = rates.PHASE_2;
    else if (startVal > 45) rate = rates.PHASE_3;
    else if (startVal > 30) rate = rates.PHASE_4;
  
    return Math.max(0, startVal - (rate * safeSeconds));
  }