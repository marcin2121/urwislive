import ZabawkiSection from '@/components/ZabawkiSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Sklep z Zabawkami Białobrzegi | LEGO, Barbie, Bruder - Urwis",
  description: "Szukasz wymarzonego prezentu? 🧸 Sklep Urwis w Białobrzegach to prawdziwe królestwo zabawek! Najnowsze LEGO, lalki Barbie i auta Hot Wheels czekają na Ciebie przy ul. Reymonta 38A. Spełniamy dziecięce marzenia!",
  keywords: ["sklep z zabawkami Białobrzegi", "prezent dla dziecka", "LEGO Białobrzegi", "klocki dla dzieci", "lalki dla dziewczynek", "auta dla chłopców", "zabawki edukacyjne"],
  openGraph: {
    title: "Urwis Białobrzegi - Tu Mieszkają Twoje Ulubione Zabawki",
    description: "Od klocków LEGO po przytulanki i gry. Największy wybór zabawek w Białobrzegach, profesjonalne doradztwo i najniższe ceny w regionie!",
    url: 'https://www.sklep-urwis.pl/oferta/zabawki',
    type: 'website',
  }
};

export default function ZabawkiPage() {
  return <ZabawkiSection />;
}