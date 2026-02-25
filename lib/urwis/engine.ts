import { URWIS_CONFIG } from './config';

export function getXPForLevel(level: number): number {
  const lvl = Math.max(1, level || 1);
  return Math.floor(URWIS_CONFIG.LEVELING.BASE_XP * Math.pow(URWIS_CONFIG.LEVELING.EXPONENT, lvl - 1));
}

export function calculateDecay(val: number, secondsPassed: number): number {
  // Jeśli val jest zepsute, zwracamy 0, a NIE 100 - dzięki temu od razu wyłapiemy błędy
  if (typeof val !== 'number' || isNaN(val)) return 0;
  
  const secs = (typeof secondsPassed !== 'number' || isNaN(secondsPassed) || secondsPassed < 0) ? 0 : secondsPassed;

  if (secs === 0) return val;

  const safeSeconds = Math.min(secs, 172800); // Max 48h
  
  const rates = URWIS_CONFIG.DECAY_RATES;
  let rate = rates.PHASE_5;

  if (val > 80) rate = rates.PHASE_1;
  else if (val > 60) rate = rates.PHASE_2;
  else if (val > 45) rate = rates.PHASE_3;
  else if (val > 30) rate = rates.PHASE_4;

  const result = val - (rate * safeSeconds);
  return Math.max(0, result);
}