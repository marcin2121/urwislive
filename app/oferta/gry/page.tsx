import GrySection from '@/components/GrySection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Gry i Puzzle Białobrzegi | Rebel, Trefl, Pokemon - Sklep Urwis",
  description: "Najlepsze gry planszowe Rebel, puzzle Trefl i karty Pokemon w Białobrzegach! 🎲 Ponad 500 tytułów na rodzinne wieczory i prezenty. Sprawdź ofertę w Sklepie Urwis!",
  keywords: ["gry planszowe Białobrzegi", "puzzle Trefl", "karty Pokemon", "Rebel gry", "sklep z zabawkami Białobrzegi", "planszówki dla dzieci"],
  openGraph: {
    title: "Urwis Białobrzegi - Twoje Centrum Gier i Puzzli",
    description: "Odkryj świat planszówek Rebel, Galakta i puzzli Ravensburger. Najlepszy wybór w okolicy, profesjonalne doradztwo i super zabawa!",
    url: 'https://sklep-urwis.pl/oferta/gry',
    type: 'website',
  }
};

export default function GryPage() {
  return <GrySection />;
}