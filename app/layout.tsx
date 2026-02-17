import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import StatsBar from "@/components/StatsBar"; // <--- Importujemy nowy pasek statystyk
import { AppProviders } from "@/components/providers/AppProviders";
import HiddenUrwis from "@/components/HiddenUrwis";
import MissionTracker from "@/components/MissionTracker";
import UrwisNotifications from "@/components/ui/UrwisNotifications";
import GamificationListener from "@/components/systems/GamificationListener";
import KuleczkaCollector from "@/components/systems/KuleczkaCollector";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sklep Urwis - Świat Zabawy",
  description: "Najlepsze zabawki i sala zabaw Lecę w Kulki!",
};

export const viewport = {
  colorScheme: 'light',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body suppressHydrationWarning className={inter.className}>
        <AppProviders>
          <GamificationListener />
          <KuleczkaCollector />
          
          {/* INTERFEJS STAŁY - Dodajemy wysoki z-index (np. 50) */}
          <div className="relative z-50">
            <Navbar />
            <StatsBar />
          </div>

          {/* Dajemy children niższą warstwę niż Navbar */}
          <main className="relative z-10 min-h-screen">
            {children}
          </main>

          <HiddenUrwis /> 
        </AppProviders>
      </body>
    </html>
  );
}