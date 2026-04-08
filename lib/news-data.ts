import { Gamepad2, Gift, Star, Package, Sparkles, MessageCircle, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
  content?: string;
  ctaText?: string;
}

const CATEGORY_STYLES: Record<string, { color: string; bg: string; glowColor: string }> = {
  'nowość': { color: 'text-blue-600', bg: 'bg-blue-100', glowColor: '37, 99, 235' }, // blue-600
  'promocja': { color: 'text-red-600', bg: 'bg-red-100', glowColor: '220, 38, 38' }, // red-600
  'wydarzenie': { color: 'text-amber-600', bg: 'bg-amber-100', glowColor: '217, 119, 6' }, // amber-600
  'informacja': { color: 'text-zinc-600', bg: 'bg-zinc-100', glowColor: '113, 113, 122' }, // zinc-500
};

export { CATEGORY_STYLES };

// ═══════════════════════════════════════════════════════════
// 📰 AKTUALNOŚCI — edytuj tę tablicę, aby dodawać newsy
// ═══════════════════════════════════════════════════════════

export const NEWS_DATA: NewsItem[] = [
  {
    id: 'strefa-zabawy-5-nowych-gier',
    title: '5 nowych gier w Strefie Zabawy! 🎮🍉',
    description: 'Gra w Arbuza, Tetris, 2048, Literki (polskie Wordle) i Trzy w Rząd — Strefa Zabawy dostała potężny zastrzyk rozrywki! Wszystko za darmo, prosto w przeglądarce.',
    date: '2026-04-08',
    category: 'nowość',
    icon: Gamepad2,
    pinned: true,
    link: '/strefa-zabawy',
    ctaText: 'Zagraj teraz',
    content: 'Strefa Zabawy Urwisa właśnie się rozrosła o **5 zupełnie nowych gier**! Teraz masz jeszcze więcej powodów, by odwiedzić nasz sklep online:\n\n🍉 **Gra w Arbuza** — Upuszczaj owoce i łącz identyczne! Fizyczny hit inspirowany japońskim Suika Game. Kto pierwszy zrobi arbuza?\n\n🧱 **Tetris** — Legendarny klasyk z ghost piece, hard dropem i poziomami trudności. Układaj klocki, czyść linie!\n\n🔢 **2048** — Przesuwaj kafelki, łącz liczby i dotrzyj do magicznego 2048. Obsługa gestów dotykowych.\n\n🔠 **Literki** — Polskie Wordle! Zgadnij 5-literowe słowo w 6 prób. Kolorowe podpowiedzi pomogą Ci dojść do rozwiązania.\n\n🍬 **Trzy w Rząd** — Zamień sąsiednie kafelki, by ułożyć trzy w rząd. Kaskadowe combo dają podwójne punkty!\n\nWszystkie gry działają na telefonach, tabletach i komputerach — bez instalacji, bez logowania. Zapraszamy całą rodzinę!',
  },
  {
    id: 'urwisowy-detektyw',
    title: 'Nowość: Zagraj z dzieckiem w Detektywa! 🕵️‍♂️',
    description: 'Bieganie po pokoju i szukanie rzeczy przez obiektyw? Poznaj nową grę interaktywną wspartą bezpiecznymi technologiami analizy. 100% gwarancji prywatności!',
    date: '2026-03-31',
    category: 'nowość',
    icon: Search,
    pinned: true,
    link: '/strefa-zabawy/detektyw',
    ctaText: 'Zagraj w Detektywa',
    content: 'Szukasz wesołej i aktywnej zabawy, która podniesie Was z kanapy? Rzućcie wyzwanie czasowi i zagrajcie razem w **Urwisowego Detektywa**!\n\nGra używa inteligentnego trybu aparatu wbudowanego bezpośrednio w naszą aplikację WWW. Nasza maskotka wylosuje Wam domowy skarb (np. kubek lub książkę), a zadaniem Twojej pociechy jest odnalezienie go w pokoju zanim upłynie 30 sekund! Gra inteligentnie rozpozna znalezisko i nagrodzi Was deszczem konfetti.\n\n**Mądra i bezpieczna rozrywka 🛡️**\nDrodzy Rodzice, doskonale wiemy, jak cenna jest Wasza prywatność. Dlatego nasz innowacyjny skaner działa całkowicie we wnętrzu Waszego telefonu lub komputera, bez użycia zewnętrznych serwerów. Obraz z kamery nigdzie się nie zapisuje i **nigdy nie jest wysyłany do internetu**. Życzymy Wam wspaniałych uśmiechów i dużo radości z codziennych poszukiwań!',
  },
  {
    id: 'klocki-urwisa-nowa-gra',
    title: 'Nowa gra logiczna: Klocki Urwisa! 🧩',
    description: 'Rzuć wyzwanie swojej wyobraźni! Układaj kształty na planszy 9x9, czyść całe linie oraz kwadraty, by zdobywać punkty dla swojego Urwiska.',
    date: '2026-03-16',
    category: 'nowość',
    icon: Gamepad2,
    pinned: true,
    link: '/strefa-zabawy/klocki',
    ctaText: 'Zagraj teraz',
    content: 'Klocki Urwisa to wciągająca łamigłówka z klockami! Dopasowuj różne kształty na planszy 9x9 tak, by zapełnić całe wiersze, kolumny lub kwadraty 3x3. Uważaj na brak wolnego miejsca, planuj ruchy z wyprzedzeniem i wykręć jak najwyższy wynik, by zgarnąć bonusy!',
  },
  {
    id: 'wirtualny-urwis',
    title: 'Wirtualny Urwis — Twój asystent zakupowy!',
    description: 'Poznaj naszego nowego, inteligentnego bota! Wirtualny Urwis pomoże Ci w znalezieniu asortymentu, opowie o grach i rozwieje wszelkie wątpliwości. Znajdziesz go w prawym dolnym rogu ekranu!',
    date: '2026-03-05',
    category: 'nowość',
    icon: MessageCircle,
    pinned: true,
    content: 'Wirtualny Urwis to nie tylko prosty czat. Potrafi on analizować preferencje dzieci, doradzać w wyborze klocków LEGO pod konkretny wiek, a także opowiadać o nadchodzących promocjach. Współpracuje bezpośrednio z naszym systemem magazynowym, dzięki czemu jego porady są zawsze aktualne i dostępne 24/7. Wypróbuj go już dziś, klikając ikonę dymka!',
  },
  {
    id: 'quiz-urwisa',
    title: 'Nowa gra: Quiz Urwisa!',
    description: 'Rozwiąż nasz wesoły quiz i przekonaj się, jakim rodzajem Urwisa jesteś! Artystą, Odkrywcą, Śmieszkiem, a może Budowniczym? Sprawdź sam!',
    date: '2026-03-04',
    category: 'nowość',
    icon: Sparkles,
    pinned: false,
    link: '/strefa-zabawy/quiz-urwisa',
    ctaText: 'Rozwiąż quiz',
  },
  {
    id: 'strefa-zabawy-v2',
    title: 'Wielka aktualizacja Strefy Zabawy! 🚀',
    description: 'Nasz wirtualny plac zabaw przeszedł całkowitą metamorfozę! Przebudowaliśmy wygląd na nowoczesny i elegancki, podzieliliśmy gry na wygodne kategorie. Sprawdź nowe 4 promowane hity na stronie głównej!',
    date: '2026-03-04',
    category: 'wydarzenie',
    icon: Gamepad2,
    link: '/strefa-zabawy',
    ctaText: 'Wejdź do gry',
  },
  {
    id: 'marzec-nowosci-lego',
    title: 'Nowa dostawa LEGO w sklepie!',
    description: 'Właśnie dotarła do nas świeża dostawa klocków LEGO! Nowe zestawy już czekają na półkach. Przyjdź i zobacz, co mamy nowego!',
    date: '2026-03-01',
    category: 'informacja',
    icon: Package,
    pinned: false,
  },
  {
    id: 'kolorowanki-online',
    title: 'Kolorowanki Urwisa — teraz online!',
    description: 'Nowa sekcja na naszej stronie: koloruj cyfrowo w przeglądarce, drukuj lub zapisuj swoje dzieła. Dla małych i dużych artystów!',
    date: '2026-02-28',
    category: 'informacja',
    icon: Sparkles,
    link: '/strefa-zabawy/kolorowanki',
    ctaText: 'Pokoloruj online',
  },
  {
    id: 'kolo-fortuny',
    title: 'Koło Fortuny — zakręć i wygrywaj!',
    description: 'Zaloguj się i zakręć Kołem Fortuny, aby wylosować kupon rabatowy. Prezenty lub zniżki od 3% do 10% na zakupy w sklepie stacjonarnym!',
    date: '2026-02-20',
    category: 'promocja',
    icon: Gift,
    link: '/rabaty',
    ctaText: 'Zakręć kołem',
  },
  {
    id: 'urwisek-gra',
    title: 'Urwisek — Twój wirtualny pupil 🐻',
    description: 'Zaopiekuj się Urwiskiem! Karm go, baw się z nim i zdobywaj punkty. Nowa gra disponible w Strefie Zabawy.',
    date: '2026-02-21',
    category: 'wydarzenie',
    icon: Gamepad2,
    link: '/strefa-zabawy',
    ctaText: 'Zagraj teraz',
  },
  {
    id: 'zlote-urwisy',
    title: 'Program Złote Urwisy — zbieraj punkty!',
    description: 'Za każde 10 zł wydane w sklepie dostajesz 1 Złotego Urwisa. Wymieniaj punkty na wejściówki do Sali Zabaw Lecę w Kulki!',
    date: '2026-02-18',
    category: 'informacja',
    icon: Star,
    link: '/poznaj-urwisa',
    ctaText: 'Sprawdź program',
  },
];
