import { describe, it, expect } from 'vitest';
import { getXPForLevel } from './engine';
import { URWIS_CONFIG } from './config';

describe('getXPForLevel', () => {
  it('should return BASE_XP for level 1', () => {
    expect(getXPForLevel(1)).toBe(URWIS_CONFIG.LEVELING.BASE_XP);
  });

  it('should handle boundary case: level 0', () => {
    expect(getXPForLevel(0)).toBe(URWIS_CONFIG.LEVELING.BASE_XP);
  });

  it('should handle negative levels as level 1', () => {
    expect(getXPForLevel(-5)).toBe(URWIS_CONFIG.LEVELING.BASE_XP);
  });

  it('should handle normal progression for level 2', () => {
    const expected = Math.floor(URWIS_CONFIG.LEVELING.BASE_XP * URWIS_CONFIG.LEVELING.EXPONENT);
    expect(getXPForLevel(2)).toBe(expected);
  });

  it('should handle normal progression for level 3', () => {
    const expected = Math.floor(URWIS_CONFIG.LEVELING.BASE_XP * Math.pow(URWIS_CONFIG.LEVELING.EXPONENT, 2));
    expect(getXPForLevel(3)).toBe(expected);
  });

  it('should handle high levels correctly', () => {
    const expected = Math.floor(URWIS_CONFIG.LEVELING.BASE_XP * Math.pow(URWIS_CONFIG.LEVELING.EXPONENT, 99));
    expect(getXPForLevel(100)).toBe(expected);
  });

  it('should handle NaN as level 1', () => {
    expect(getXPForLevel(NaN)).toBe(URWIS_CONFIG.LEVELING.BASE_XP);
  });
});
