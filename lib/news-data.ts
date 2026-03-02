import { Newspaper, Gamepad2, Gift, Star, Package, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  category: 'nowość' | 'promocja' | 'wydarzenie' | 'informacja';
  icon: LucideIcon;
  image?: string;
  link?: string;
  pinned?: boolean;
}

const CATEGORY_STYLES: Record<string, { color: string; bg: string }> = {
  'nowość': { color: 'text-blue-600', bg: 'bg-blue-100' },
  'promocja': { color: 'text-red-600', bg: 'bg-red-100' },
  'wydarzenie': { color: 'text-amber-600', bg: 'bg-amber-100' },
  'informacja': { color: 'text-zinc-600', bg: 'bg-zinc-100' },
};

export { CATEGORY_STYLES };

// ═══════════════════════════════════════════════════════════
// 📰 AKTUALNOŚCI — edytuj tę tablicę, aby dodawać newsy
// ═══════════════════════════════════════════════════════════

export const NEWS_DATA: NewsItem[] = [
  {
    id: 'marzec-nowosci-lego',
    title: 'Nowa dostawa LEGO w sklepie!',
    description: 'Właśnie dotarła do nas świeża dostawa klocków LEGO! Nowe zestawy już czekają na półkach. Przyjdź i zobacz, co mamy nowego!',
    date: '2026-03-01',
    category: 'nowość',
    icon: Package,
    pinned: true,
  },
  {
    id: 'kolorowanki-online',
    title: 'Kolorowanki Urwisa — teraz online!',
    description: 'Nowa sekcja na naszej stronie: koloruj cyfrowo w przeglądarce, drukuj lub zapisuj swoje dzieła. Dla małych i dużych artystów!',
    date: '2026-02-28',
    category: 'wydarzenie',
    icon: Sparkles,
    link: '/strefa-zabawy/kolorowanki',
  },
  {
    id: 'kolo-fortuny',
    title: 'Koło Fortuny — zakręć i wygrywaj!',
    description: 'Zaloguj się i zakręć Kołem Fortuny, aby wylosować kupon rabatowy. Prezenty lub zniżki od 3% do 10% na zakupy w sklepie stacjonarnym!',
    date: '2026-02-20',
    category: 'promocja',
    icon: Gift,
    link: '/rabaty',
  },
  {
    id: 'urwisek-gra',
    title: 'Urwisek — Twój wirtualny pupil 🐻',
    description: 'Zaopiekuj się Urwiskiem! Karm go, baw się z nim i zdobywaj punkty. Nowa gra disponible w Strefie Zabawy.',
    date: '2026-02-21',
    category: 'wydarzenie',
    icon: Gamepad2,
    link: '/strefa-zabawy',
  },
  {
    id: 'zlote-urwisy',
    title: 'Program Złote Urwisy — zbieraj punkty!',
    description: 'Za każde 10 zł wydane w sklepie dostajesz 1 Złotego Urwisa. Wymieniaj punkty na wejściówki do Sali Zabaw Lecę w Kulki!',
    date: '2026-02-18',
    category: 'informacja',
    icon: Star,
    link: '/poznaj-urwisa',
  },
];
