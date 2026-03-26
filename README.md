# 🧸 Sklep Urwis - Modern PWA & AI Ecosystem

[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PWA](https://img.shields.io/badge/PWA-Ready-orange?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)

**Sklep Urwis** to zaawansowana platforma typu **Progressive Web App (PWA)** stworzona dla stacjonarnego centrum zabawek i artykułów biurowych w Białobrzegach. Projekt łączy tradycyjny handel lokalny z najnowocześniejszymi technologiami webowymi, oferując unikalne doświadczenie zakupowe (Phygital).

---

## 🚀 Kluczowe Funkcje

### 📱 Full PWA Experience
*   **Offline Mode:** Dzięki integracji z `Serwist`, kluczowe funkcjonalności i gry są dostępne bez połączenia z siecią.
*   **Background Sync:** Automatyczna synchronizacja punktów i osiągnięć po odzyskaniu łączności.
*   **Instalacja natywna:** W pełni responsywny interfejs z dedykowanymi instrukcjami instalacji na iOS/Android.

### 🤖 Intelligent AI Assistant
*   **Gemini AI Integration:** Autorski chatbot ("Wirtualny Urwis") oparty na modelach Google, pomagający w doborze prezentów i wróżący dostępność produktów.
*   **Security First:** Wdrożone zaawansowane mechanizmy ochrony przed *Prompt Injection* oraz filtrowanie wyników w czasie rzeczywistym.

### 🎮 Strefa Zabawy & Gamification
*   **Zbiór Gier HTML5:** Autorskie implementacje popularnych mechanik (zbijanie kulek, gry logiczne, wirtualny podopieczny) budujące lojalność klienta.
*   **Program Lojalnościowy:** Cyfrowy system zbierania "Złotych Urwisów" zintegrowany z bazą danych Supabase.

### 👓 Augmented Reality (AR)
*   **Urwis AR:** Wykorzystanie technologii webowych do projekcji 3D maskotki sklepu bezpośrednio w przestrzeni użytkownika (Web-based AR).

---

## 🛠 Tech Stack

### Frontend & UI
*   **Framework:** `Next.js 16` (App Router, React 19)
*   **Stylizacja:** `TailwindCSS` + `Radix UI` / `Shadcn`
*   **Animacje:** `Framer Motion` + `GSAP` (zaawansowane micro-interactions)
*   **Grafika 3D:** `Three.js` + `@react-three/fiber`

### Backend & AI
*   **Baza Danych & Auth:** `Supabase` (PostgreSQL) + Realtime
*   **AI Engine:** `Vercel AI SDK` + `Google Gemini 3.1 Flash Lite Preview`
*   **PWA Logic:** `Serwist` (Service Workers)

---

## 🛡 Security & Engineering
*   **Environment Safety:** Wszystkie klucze API i sekrety (Supabase, Google AI, VAPID) są całkowicie odizolowane i zarządzane przez zmienne środowiskowe.
*   **Rate Limiting:** Ochrona endpointów API przed nadużyciami (IP-based).
*   **Type Safety:** Projekt w pełni oparty na `TypeScript` z naciskiem na integralność danych.

---

## 🗺 Roadmapa Rozwoju
- [ ] Implementacja WebXR dla głębszej immersji AR.
- [ ] Globalne tablice wyników w czasie rzeczywistym (Realtime Leaderboards).
- [ ] Automatyzacja bazy wiedzy AI poprzez Headless CMS.

---

---

*Oficjalna platforma Sklepu Urwis w Białobrzegach. Wszelkie prawa zastrzeżone.*
