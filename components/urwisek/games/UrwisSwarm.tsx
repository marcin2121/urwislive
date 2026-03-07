'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pickaxe, MoveLeft, Home, Sparkles, Factory, Settings, Zap, Briefcase, Star, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// --- STAŁE ---
const SAVE_INTERVAL_MS = 5000;
const SAVE_KEY = 'urwis_swarm_save';
const MAX_OFFLINE_SECONDS = 604800;

const formatNumber = (num: number): string => {
  if (isNaN(num) || !isFinite(num)) return '0';
  if (num < 1000) return Math.floor(num).toString();
  const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc"];
  const tier = Math.min(Math.floor(Math.log10(Math.abs(num)) / 3), suffixes.length - 1);
  if (tier <= 0) return Math.floor(num).toString();
  const scale = Math.pow(10, tier * 3);
  return (num / scale).toFixed(1) + suffixes[tier];
};

const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}min`;
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
};

// --- TYPY ---
type UnitKey = 'urwisek' | 'konstruktor' | 'architekt' | 'kierownik' | 'fabryka';

interface GameState {
  klocki: number;
  zapal: number;
  lastTimestamp: number;
  units: Record<UnitKey, number>;
  boughtUpgrades: string[];
  multipliers: Record<UnitKey, number>;
  prestige: number;
  prestigeBonus: number;
  lifetime_klocki: number;
  lifetime_clicks: number;
}

const DEFAULT_STATE: GameState = {
  klocki: 0,
  zapal: 50,
  lastTimestamp: Date.now(),
  units: {
    urwisek: 0,
    konstruktor: 0,
    architekt: 0,
    kierownik: 0,
    fabryka: 0,
  },
  boughtUpgrades: [],
  multipliers: {
    urwisek: 1,
    konstruktor: 1,
    architekt: 1,
    kierownik: 1,
    fabryka: 1,
  },
  prestige: 0,
  prestigeBonus: 1,
  lifetime_klocki: 0,
  lifetime_clicks: 0,
};

// --- DANE JEDNOSTEK ---
const UNIT_DATA: Record<UnitKey, {
  name: string;
  desc: string;
  icon: React.ReactNode;
  baseCostKlocki: number;
  baseCostZapal: number;
  costMultiplier: number;
  prodType: string;
  prodAmount: number;
  zapalBonus?: number;
  requires: UnitKey | null;
}> = {
  urwisek: {
    name: 'Mały Urwisek',
    desc: 'Zbiera klocki rozrzucone po podłodze.',
    icon: <Sparkles className="w-5 h-5 text-indigo-400" />,
    baseCostKlocki: 10,
    baseCostZapal: 1,
    costMultiplier: 1.15,
    prodType: 'klocki',
    prodAmount: 1,
    requires: null,
  },
  konstruktor: {
    name: 'Konstruktor',
    desc: 'Szkoli nowe Urwiski i zwiększa siłę kliknięcia.',
    icon: <Pickaxe className="w-5 h-5 text-emerald-400" />,
    baseCostKlocki: 100,
    baseCostZapal: 2,
    costMultiplier: 1.15,
    prodType: 'urwisek',
    prodAmount: 0.1,
    requires: 'urwisek',
  },
  architekt: {
    name: 'Architekt',
    desc: 'Projektuje lepsze systemy budowy.',
    icon: <Briefcase className="w-5 h-5 text-amber-500" />,
    baseCostKlocki: 1100,
    baseCostZapal: 5,
    costMultiplier: 1.15,
    prodType: 'konstruktor',
    prodAmount: 0.1,
    requires: 'konstruktor',
  },
  kierownik: {
    name: 'Kierownik',
    desc: 'Zwiększa max zapał i szkoli architektów.',
    icon: <Zap className="w-5 h-5 text-fuchsia-400" />,
    baseCostKlocki: 12000,
    baseCostZapal: 10,
    costMultiplier: 1.15,
    prodType: 'architekt',
    prodAmount: 0.1,
    zapalBonus: 0.1,
    requires: 'architekt',
  },
  fabryka: {
    name: 'Fabryka',
    desc: 'Automatyzuje produkcję kierowników.',
    icon: <Factory className="w-5 h-5 text-rose-500" />,
    baseCostKlocki: 130000,
    baseCostZapal: 25,
    costMultiplier: 1.15,
    prodType: 'kierownik',
    prodAmount: 0.1,
    requires: 'kierownik',
  },
};

// --- ULEPSZENIA ---
interface Upgrade {
  id: string;
  name: string;
  desc: string;
  costKlocki: number;
  condition: (s: GameState) => boolean;
  effect: string;
  apply: (multipliers: Record<UnitKey, number>) => Record<UnitKey, number>;
}

const UPGRADES: Upgrade[] = [
  {
    id: 'urwisek_1',
    name: 'Szybkie Nóżki',
    desc: 'Urwiski biegają 2x szybciej.',
    costKlocki: 200,
    condition: (s) => s.units.urwisek >= 10,
    effect: '×2 produkcja Urwisków',
    apply: (m) => ({ ...m, urwisek: m.urwisek * 2 }),
  },
  {
    id: 'urwisek_2',
    name: 'Turbo Urwisek',
    desc: 'Pełna turbo moc Urwisków!',
    costKlocki: 10000,
    condition: (s) => s.units.urwisek >= 50,
    effect: '×3 produkcja Urwisków',
    apply: (m) => ({ ...m, urwisek: m.urwisek * 3 }),
  },
  {
    id: 'urwisek_3',
    name: 'Dino Boost',
    desc: 'Urwiski dosiadają dinozaurów.',
    costKlocki: 500000,
    condition: (s) => s.units.urwisek >= 200,
    effect: '×5 produkcja Urwisków',
    apply: (m) => ({ ...m, urwisek: m.urwisek * 5 }),
  },
  {
    id: 'konstruktor_1',
    name: 'Lepsze Narzędzia',
    desc: 'Konstruktorzy mają lepsze zestawy.',
    costKlocki: 2000,
    condition: (s) => s.units.konstruktor >= 10,
    effect: '×2 produkcja Konstruktorów',
    apply: (m) => ({ ...m, konstruktor: m.konstruktor * 2 }),
  },
  {
    id: 'konstruktor_2',
    name: 'Akademia LEGO',
    desc: 'Profesjonalne szkolenia budowlane.',
    costKlocki: 50000,
    condition: (s) => s.units.konstruktor >= 50,
    effect: '×3 produkcja Konstruktorów',
    apply: (m) => ({ ...m, konstruktor: m.konstruktor * 3 }),
  },
  {
    id: 'architekt_1',
    name: 'CAD Software',
    desc: 'Architekci używają nowoczesnych narzędzi.',
    costKlocki: 20000,
    condition: (s) => s.units.architekt >= 10,
    effect: '×2 produkcja Architektów',
    apply: (m) => ({ ...m, architekt: m.architekt * 2 }),
  },
  {
    id: 'architekt_2',
    name: 'Biuro Projektowe',
    desc: 'Dedykowane studio architektoniczne.',
    costKlocki: 1000000,
    condition: (s) => s.units.architekt >= 50,
    effect: '×4 produkcja Architektów',
    apply: (m) => ({ ...m, architekt: m.architekt * 4 }),
  },
  {
    id: 'kierownik_1',
    name: 'Kurs Zarządzania',
    desc: 'MBA dla każdego kierownika.',
    costKlocki: 200000,
    condition: (s) => s.units.kierownik >= 10,
    effect: '×2 produkcja Kierowników',
    apply: (m) => ({ ...m, kierownik: m.kierownik * 2 }),
  },
  {
    id: 'fabryka_1',
    name: 'Linia Montażowa',
    desc: 'Automatyczna taśma produkcyjna.',
    costKlocki: 5000000,
    condition: (s) => s.units.fabryka >= 5,
    effect: '×2 produkcja Fabryk',
    apply: (m) => ({ ...m, fabryka: m.fabryka * 2 }),
  },
  {
    id: 'fabryka_2',
    name: 'Mega Fabryka',
    desc: 'Fabryka fabryk.',
    costKlocki: 100000000,
    condition: (s) => s.units.fabryka >= 25,
    effect: '×5 produkcja Fabryk',
    apply: (m) => ({ ...m, fabryka: m.fabryka * 5 }),
  },
];

// --- KOMPONENT GŁÓWNY ---
export default function UrwisSwarm() {
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [buyAmount, setBuyAmount] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'units' | 'upgrades'>('units');
  const [clickEffect, setClickEffect] = useState<{ id: number; x: number; y: number; value: number }[]>([]);
  const [offlineGains, setOfflineGains] = useState<{ klocki: number; time: number } | null>(null);

  const clickIdRef = useRef(0);
  const stateRef = useRef(state);
  const lastSaveTime = useRef(Date.now());
  const reqRef = useRef<number | undefined>(undefined);

  // --- ŁADOWANIE ---
  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed: GameState = JSON.parse(saved);
        // Uzupełnij brakujące pola ze starych zapisów
        const full: GameState = {
          ...DEFAULT_STATE,
          ...parsed,
          multipliers: { ...DEFAULT_STATE.multipliers, ...(parsed.multipliers || {}) },
          boughtUpgrades: parsed.boughtUpgrades || [],
          prestige: parsed.prestige || 0,
          prestigeBonus: parsed.prestigeBonus || 1,
          lifetime_klocki: parsed.lifetime_klocki || 0,
          lifetime_clicks: parsed.lifetime_clicks || 0,
        };

        const now = Date.now();
        const offlineSeconds = Math.min((now - full.lastTimestamp) / 1000, MAX_OFFLINE_SECONDS);

        if (offlineSeconds > 60) {
          const dt = offlineSeconds;
          const s = { ...full };

          s.units.kierownik += s.units.fabryka * UNIT_DATA.fabryka.prodAmount * s.multipliers.fabryka * dt;
          s.units.architekt += s.units.kierownik * UNIT_DATA.kierownik.prodAmount * s.multipliers.kierownik * dt;
          s.units.konstruktor += s.units.architekt * UNIT_DATA.architekt.prodAmount * s.multipliers.architekt * dt;
          s.units.urwisek += s.units.konstruktor * UNIT_DATA.konstruktor.prodAmount * s.multipliers.konstruktor * dt;

          const gained = s.units.urwisek * UNIT_DATA.urwisek.prodAmount * s.multipliers.urwisek * s.prestigeBonus * dt;
          s.klocki += gained;
          s.lifetime_klocki += gained;

          const maxZapal = 100 + s.units.kierownik * 10;
          s.zapal = Math.min(maxZapal, s.zapal + (1 + s.units.kierownik * 0.1) * dt);
          s.lastTimestamp = now;

          setOfflineGains({ klocki: gained, time: offlineSeconds });
          setState(s);
          stateRef.current = s;
        } else {
          full.lastTimestamp = now;
          setState(full);
          stateRef.current = full;
        }
      } catch (e) {
        console.error('Błąd wczytywania:', e);
      }
    }
    setHasLoaded(true);
  }, []);

  // --- GAME LOOP ---
  const gameStep = useCallback(() => {
    const now = Date.now();
    const dt = Math.min((now - stateRef.current.lastTimestamp) / 1000, 1.0);

    if (dt > 0) {
      const s = stateRef.current;
      const ns: GameState = {
        ...s,
        units: { ...s.units },
        multipliers: { ...s.multipliers },
        boughtUpgrades: [...s.boughtUpgrades],
      };

      // Zapał
      const maxZapal = 100 + Math.floor(ns.units.kierownik) * 10;
      ns.zapal = Math.min(maxZapal, ns.zapal + (1 + ns.units.kierownik * 0.1) * dt);

      // Kaskadowa produkcja z multiplikami
      ns.units.kierownik += ns.units.fabryka * UNIT_DATA.fabryka.prodAmount * ns.multipliers.fabryka * dt;
      ns.units.architekt += ns.units.kierownik * UNIT_DATA.kierownik.prodAmount * ns.multipliers.kierownik * dt;
      ns.units.konstruktor += ns.units.architekt * UNIT_DATA.architekt.prodAmount * ns.multipliers.architekt * dt;
      ns.units.urwisek += ns.units.konstruktor * UNIT_DATA.konstruktor.prodAmount * ns.multipliers.konstruktor * dt;

      const gain = ns.units.urwisek * UNIT_DATA.urwisek.prodAmount * ns.multipliers.urwisek * ns.prestigeBonus * dt;
      ns.klocki += gain;
      ns.lifetime_klocki += gain;
      ns.lastTimestamp = now;

      stateRef.current = ns;
      setState(ns);

      if (now - lastSaveTime.current > SAVE_INTERVAL_MS) {
        localStorage.setItem(SAVE_KEY, JSON.stringify(ns));
        lastSaveTime.current = now;
      }
    }

    reqRef.current = requestAnimationFrame(gameStep);
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      reqRef.current = requestAnimationFrame(gameStep);
    }
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [hasLoaded, gameStep]);

  // --- KLIKNIĘCIE ---
  const handleManualGather = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    const power = Math.max(1, 1 + Math.floor(stateRef.current.units.konstruktor) * 0.1);

    const ns = {
      ...stateRef.current,
      klocki: stateRef.current.klocki + power,
      lifetime_klocki: stateRef.current.lifetime_klocki + power,
      lifetime_clicks: stateRef.current.lifetime_clicks + 1,
    };
    stateRef.current = ns;
    setState(ns);

    let cx: number, cy: number;
    if ('touches' in e && e.touches.length > 0) {
      cx = e.touches[0].clientX; cy = e.touches[0].clientY;
    } else if ('clientX' in e) {
      cx = e.clientX; cy = e.clientY;
    } else return;

    const rect = e.currentTarget.getBoundingClientRect();
    const id = clickIdRef.current++;
    setClickEffect(prev => [...prev, { id, x: cx - rect.left + (Math.random() - 0.5) * 60, y: cy - rect.top - 20, value: power }]);
    setTimeout(() => setClickEffect(prev => prev.filter(ef => ef.id !== id)), 800);
  };

  // --- KOSZTY ---
  const getUnitCost = (unitKey: UnitKey, amount: number) => {
    const data = UNIT_DATA[unitKey];
    const current = Math.floor(state.units[unitKey]);
    let totalKlocki = 0;
    for (let i = 0; i < amount; i++) {
      totalKlocki += data.baseCostKlocki * Math.pow(data.costMultiplier, current + i);
    }
    return { klocki: totalKlocki, zapal: data.baseCostZapal * amount };
  };

  const calcMax = (unitKey: UnitKey): number => {
    const data = UNIT_DATA[unitKey];
    const current = Math.floor(state.units[unitKey]);
    let n = 0, totalK = 0, totalZ = 0;
    while (true) {
      totalK += data.baseCostKlocki * Math.pow(data.costMultiplier, current + n);
      totalZ += data.baseCostZapal;
      if (totalK > state.klocki || totalZ > state.zapal) break;
      n++;
    }
    return Math.max(1, n);
  };

  // --- KUPOWANIE ---
  const buyUnit = (unitKey: UnitKey) => {
    const amount = buyAmount === -1 ? calcMax(unitKey) : buyAmount;
    if (amount <= 0) return;
    const costs = getUnitCost(unitKey, amount);
    if (state.klocki < costs.klocki || state.zapal < costs.zapal) return;

    const ns: GameState = {
      ...stateRef.current,
      units: { ...stateRef.current.units },
      klocki: stateRef.current.klocki - costs.klocki,
      zapal: stateRef.current.zapal - costs.zapal,
    };
    ns.units[unitKey] += amount;
    stateRef.current = ns;
    setState(ns);
  };

  // --- ULEPSZENIA ---
  const buyUpgrade = (upgrade: Upgrade) => {
    if (state.klocki < upgrade.costKlocki) return;
    if (state.boughtUpgrades.includes(upgrade.id)) return;

    const newMultipliers = upgrade.apply({ ...stateRef.current.multipliers });
    const ns: GameState = {
      ...stateRef.current,
      klocki: stateRef.current.klocki - upgrade.costKlocki,
      boughtUpgrades: [...stateRef.current.boughtUpgrades, upgrade.id],
      multipliers: newMultipliers,
    };
    stateRef.current = ns;
    setState(ns);
  };

  // --- PRESTIGE ---
  const doPrestige = () => {
    if (!confirm(`Zresetuj postęp? Zyskasz stały bonus +10% produkcji (Prestige #${state.prestige + 1})`)) return;
    const newPrestige = state.prestige + 1;
    const ns: GameState = {
      ...DEFAULT_STATE,
      lastTimestamp: Date.now(),
      prestige: newPrestige,
      prestigeBonus: 1 + newPrestige * 0.1,
      lifetime_klocki: state.lifetime_klocki,
      lifetime_clicks: state.lifetime_clicks,
    };
    stateRef.current = ns;
    setState(ns);
    localStorage.setItem(SAVE_KEY, JSON.stringify(ns));
  };

  const resetGame = () => {
    if (!confirm('Usunąć CAŁY postęp łącznie z Prestige?')) return;
    localStorage.removeItem(SAVE_KEY);
    stateRef.current = DEFAULT_STATE;
    setState(DEFAULT_STATE);
  };

  // --- DANE DO UI ---
  const maxZapal = 100 + Math.floor(state.units.kierownik) * 10;
  const zapalPct = Math.min(100, (state.zapal / maxZapal) * 100);
  const kpsTotal = state.units.urwisek * UNIT_DATA.urwisek.prodAmount * state.multipliers.urwisek * state.prestigeBonus;

  const availableUpgrades = UPGRADES.filter(u => !state.boughtUpgrades.includes(u.id) && u.condition(state));
  const boughtUpgradesCount = state.boughtUpgrades.length;
  const effectiveBuyAmount = buyAmount === -1 ? null : buyAmount;

  if (!hasLoaded) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-emerald-500 font-mono text-lg animate-pulse">Ładowanie Fabryki Urwisa...</div>
    </div>
  );

  return (
    <div className="w-full min-h-[100dvh] flex flex-col bg-zinc-950 text-emerald-500 font-mono overflow-hidden select-none">

      {/* OFFLINE MODAL */}
      {offlineGains && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="bg-zinc-900 border-emerald-500/50 p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-emerald-400 mb-3 flex items-center gap-2">
              <Sparkles className="w-6 h-6" /> Witaj z powrotem!
            </h3>
            <p className="text-zinc-400 mb-1">Byłeś offline przez <span className="text-white font-bold">{formatTime(offlineGains.time)}</span></p>
            <p className="text-zinc-400 mb-5">Zdobyłeś <span className="text-emerald-400 font-bold text-xl">{formatNumber(offlineGains.klocki)}</span> klocków!</p>
            <Button onClick={() => setOfflineGains(null)} className="w-full bg-emerald-700 hover:bg-emerald-600 text-white">
              Kontynuuj
            </Button>
          </Card>
        </div>
      )}

      {/* GÓRNY PASEK */}
      <div className="w-full bg-zinc-900 border-b border-emerald-900/40 px-4 py-3 shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">

          <div className="flex gap-4 sm:gap-8 items-center flex-1 justify-center">
            {/* Klocki */}
            <div className="flex flex-col items-center min-w-[90px]">
              <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest flex items-center gap-1 mb-0.5">
                <Pickaxe className="w-3 h-3 text-emerald-600" /> Klocki
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 tabular-nums leading-none">
                {formatNumber(state.klocki)}
              </div>
              <span className="text-[9px] text-zinc-600 mt-0.5">+{formatNumber(kpsTotal)}/s</span>
            </div>

            <div className="w-px h-12 bg-emerald-900/30" />

            {/* Zapał z paskiem */}
            <div className="flex flex-col items-center min-w-[110px]">
              <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest flex items-center gap-1 mb-0.5">
                <Zap className="w-3 h-3 text-cyan-600" /> Zapał
              </span>
              <div className="text-xl sm:text-2xl font-black text-cyan-400 tabular-nums leading-none flex items-baseline gap-1">
                {Math.floor(state.zapal)}
                <span className="text-[10px] text-zinc-600">/{maxZapal}</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full transition-all duration-500" style={{ width: `${zapalPct}%` }} />
              </div>
              <span className="text-[9px] text-zinc-600 mt-0.5">
                +{(1 + state.units.kierownik * 0.1).toFixed(1)}/s
              </span>
            </div>

            {/* Prestige badge */}
            {state.prestige > 0 && (
              <>
                <div className="w-px h-12 bg-emerald-900/30" />
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest mb-0.5">Prestige</span>
                  <div className="text-xl font-black text-yellow-400">#{state.prestige}</div>
                  <span className="text-[9px] text-yellow-700">+{(state.prestige * 10)}% prod.</span>
                </div>
              </>
            )}
          </div>

          <Link href="/strefa-zabawy" className="text-zinc-600 hover:text-emerald-500 transition-colors p-2 shrink-0">
            <MoveLeft className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {/* GŁÓWNA ZAWARTOŚĆ */}
      <div className="flex-1 w-full flex flex-col md:flex-row overflow-hidden max-w-6xl mx-auto w-full">

        {/* LEWY PANEL */}
        <div className="w-full md:w-[280px] border-b md:border-b-0 md:border-r border-emerald-900/20 p-5 flex flex-col items-center justify-center relative bg-gradient-to-b from-zinc-950 to-zinc-950/90 shrink-0 h-[28vh] md:h-auto">
          <span className="absolute top-4 left-5 text-xs font-bold text-zinc-700 tracking-widest flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5" /> Kwatera
          </span>

          <button
            onMouseDown={handleManualGather}
            onTouchStart={handleManualGather}
            className="group relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-gradient-to-br from-emerald-900/40 to-zinc-950 border-2 border-emerald-800/50 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 active:scale-95 transition-all shadow-[0_0_30px_rgba(16,185,129,0.05)] hover:shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden"
          >
            <Pickaxe className="w-14 h-14 sm:w-16 sm:h-16 text-emerald-500 mb-1.5 group-active:scale-90 transition-transform duration-100" />
            <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Zbuduj!</span>
            <span className="text-[10px] text-zinc-600 mt-1">
              +{formatNumber(1 + Math.floor(state.units.konstruktor) * 0.1)}/klik
            </span>

            {clickEffect.map(ef => (
              <span
                key={ef.id}
                className="absolute font-black text-emerald-300 text-base pointer-events-none animate-in fade-in slide-in-from-bottom-3"
                style={{ left: ef.x, top: ef.y, animationDuration: '0.8s' }}
              >
                +{formatNumber(ef.value)}
              </span>
            ))}
          </button>

          <div className="mt-4 text-center space-y-1">
            <p className="text-[10px] text-zinc-600">Lifetime: {formatNumber(state.lifetime_klocki)} klocków</p>
            <p className="text-[10px] text-zinc-600">Kliknięć: {formatNumber(state.lifetime_clicks)}</p>
          </div>

          {/* Prestige button */}
          {state.units.fabryka >= 1 && (
            <button
              onClick={doPrestige}
              className="mt-4 w-full px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold uppercase tracking-widest hover:bg-yellow-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Star className="w-3.5 h-3.5" />
              Prestige #{state.prestige + 1}
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={resetGame}
            className="absolute bottom-3 left-5 text-red-900/40 hover:text-red-500 text-[10px] uppercase transition-colors"
          >
            Hard Reset
          </button>
        </div>

        {/* PRAWY PANEL */}
        <div className="w-full flex-1 flex flex-col overflow-hidden bg-[#0a0a0c]">

          {/* Tabs + Buy Amount */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-emerald-900/20 bg-[#0d0d12] shrink-0 gap-3 flex-wrap">
            {/* Tabs */}
            <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
              <button
                onClick={() => setActiveTab('units')}
                className={cn("px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                  activeTab === 'units' ? "bg-emerald-900/50 text-emerald-400" : "text-zinc-600 hover:text-zinc-400"
                )}
              >
                <Settings className="w-3.5 h-3.5 inline mr-1.5" />Jednostki
              </button>
              <button
                onClick={() => setActiveTab('upgrades')}
                className={cn("px-4 py-1.5 text-xs font-bold rounded-md transition-all relative",
                  activeTab === 'upgrades' ? "bg-emerald-900/50 text-emerald-400" : "text-zinc-600 hover:text-zinc-400"
                )}
              >
                <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />Ulepszenia
                {availableUpgrades.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full text-[9px] text-black font-black flex items-center justify-center">
                    {availableUpgrades.length}
                  </span>
                )}
              </button>
            </div>

            {/* Buy amount (tylko w units tab) */}
            {activeTab === 'units' && (
              <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                {[1, 10, 100, -1].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setBuyAmount(amt)}
                    className={cn("px-3 py-1 text-xs font-bold rounded-md transition-all",
                      buyAmount === amt ? "bg-emerald-900/50 text-emerald-400" : "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800"
                    )}
                  >
                    {amt === -1 ? 'MAX' : `x${amt}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* LISTA JEDNOSTEK */}
          {activeTab === 'units' && (
            <div className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 space-y-2.5 pb-20">
              {(Object.keys(UNIT_DATA) as UnitKey[]).map((unitKey) => {
                const data = UNIT_DATA[unitKey];
                const count = state.units[unitKey];

                if (data.requires && state.units[data.requires] < 1 && count === 0) return null;
                if (!data.requires && state.klocki < 5 && count === 0) return null;

                const amount = effectiveBuyAmount ?? calcMax(unitKey);
                const costs = getUnitCost(unitKey, amount);
                const canAfford = state.klocki >= costs.klocki && state.zapal >= costs.zapal;
                const multiplier = state.multipliers[unitKey];

                return (
                  <Card key={unitKey} className={cn(
                    "border-emerald-900/20 overflow-hidden flex flex-col sm:flex-row transition-colors",
                    canAfford ? "bg-zinc-900/60 hover:bg-zinc-900/90" : "bg-zinc-900/30"
                  )}>
                    <div className="p-4 flex-1 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1">
                        {data.icon}
                        <h3 className="font-bold text-emerald-400 text-base">{data.name}</h3>
                        <span className="text-zinc-500 text-sm font-mono">[{formatNumber(Math.floor(count))}]</span>
                        {multiplier > 1 && (
                          <span className="text-[10px] bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded font-bold">
                            ×{multiplier}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mb-1.5 font-sans">{data.desc}</p>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold flex gap-3">
                        <span>+{data.prodAmount * multiplier}/s <span className="text-emerald-600">{data.prodType}</span></span>
                        {data.zapalBonus && <span>+{(data.zapalBonus * Math.floor(count)).toFixed(1)}/s <span className="text-cyan-600">zapał</span></span>}
                      </div>
                    </div>

                    <div className="p-4 bg-black/40 border-t sm:border-t-0 sm:border-l border-emerald-900/20 sm:w-44 shrink-0 flex flex-col justify-center gap-2">
                      <div className="space-y-1">
                        <div className={cn("text-xs flex justify-between font-bold", state.klocki >= costs.klocki ? "text-emerald-600" : "text-red-500/70")}>
                          <span>Klocki</span><span>{formatNumber(costs.klocki)}</span>
                        </div>
                        <div className={cn("text-xs flex justify-between font-bold", state.zapal >= costs.zapal ? "text-cyan-600" : "text-red-500/70")}>
                          <span>Zapał</span><span>{formatNumber(costs.zapal)}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => buyUnit(unitKey)}
                        disabled={!canAfford}
                        className={cn(
                          "w-full h-8 text-xs font-bold uppercase tracking-widest border transition-all",
                          canAfford
                            ? "bg-emerald-950/50 border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/80"
                            : "bg-black/20 border-zinc-900 text-zinc-700 cursor-not-allowed opacity-40"
                        )}
                        variant="outline"
                      >
                        {buyAmount === -1 ? `Kup MAX (${calcMax(unitKey)})` : `Kup${buyAmount > 1 ? ` x${buyAmount}` : ''}`}
                      </Button>
                    </div>
                  </Card>
                );
              })}

              {state.units.fabryka > 0 && (
                <div className="py-8 text-center border-t border-emerald-900/20 mt-4">
                  <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-yellow-400 font-bold uppercase tracking-widest text-sm mb-1">Fabryka Urwisa osiągnięta!</p>
                  <p className="text-zinc-600 text-xs max-w-sm mx-auto mb-4">Możesz teraz uruchomić Prestige — zresetuj postęp i zyskaj stały bonus +10% produkcji na zawsze.</p>
                  <button
                    onClick={doPrestige}
                    className="px-6 py-2 rounded-lg bg-yellow-500/15 border border-yellow-500/40 text-yellow-400 text-sm font-bold hover:bg-yellow-500/25 transition-all"
                  >
                    ⭐ Prestige #{state.prestige + 1} — +10% produkcji
                  </button>
                </div>
              )}
            </div>
          )}

          {/* LISTA ULEPSZEŃ */}
          {activeTab === 'upgrades' && (
            <div className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 space-y-2.5 pb-20">
              {availableUpgrades.length === 0 && boughtUpgradesCount === 0 && (
                <div className="text-center py-16 text-zinc-600">
                  <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Zdobądź więcej jednostek by odblokować ulepszenia!</p>
                </div>
              )}

              {availableUpgrades.map(upgrade => {
                const canAfford = state.klocki >= upgrade.costKlocki;
                return (
                  <Card key={upgrade.id} className={cn(
                    "border overflow-hidden flex flex-col sm:flex-row transition-colors",
                    canAfford ? "bg-yellow-950/20 border-yellow-700/30 hover:bg-yellow-950/40" : "bg-zinc-900/30 border-zinc-800/40"
                  )}>
                    <div className="p-4 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
                        <h3 className="font-bold text-yellow-300 text-base">{upgrade.name}</h3>
                      </div>
                      <p className="text-xs text-zinc-500 mb-1 font-sans">{upgrade.desc}</p>
                      <span className="text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded font-bold uppercase">
                        {upgrade.effect}
                      </span>
                    </div>
                    <div className="p-4 bg-black/40 border-t sm:border-t-0 sm:border-l border-yellow-900/20 sm:w-44 shrink-0 flex flex-col justify-center gap-2">
                      <div className={cn("text-xs flex justify-between font-bold", canAfford ? "text-emerald-600" : "text-red-500/70")}>
                        <span>Klocki</span><span>{formatNumber(upgrade.costKlocki)}</span>
                      </div>
                      <Button
                        onClick={() => buyUpgrade(upgrade)}
                        disabled={!canAfford}
                        className={cn(
                          "w-full h-8 text-xs font-bold uppercase border transition-all",
                          canAfford
                            ? "bg-yellow-950/50 border-yellow-700/50 text-yellow-400 hover:bg-yellow-900/50"
                            : "bg-black/20 border-zinc-900 text-zinc-700 cursor-not-allowed opacity-40"
                        )}
                        variant="outline"
                      >
                        Ulepsz
                      </Button>
                    </div>
                  </Card>
                );
              })}

              {/* Kupione ulepszenia */}
              {boughtUpgradesCount > 0 && (
                <div className="border-t border-emerald-900/20 pt-4 mt-4">
                  <p className="text-xs text-zinc-600 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> Aktywne ({boughtUpgradesCount})
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {UPGRADES.filter(u => state.boughtUpgrades.includes(u.id)).map(u => (
                      <div key={u.id} className="px-3 py-2 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-[10px]">
                        <p className="text-emerald-400 font-bold">{u.name}</p>
                        <p className="text-zinc-600">{u.effect}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
