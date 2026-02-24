import SalaZabawContent from '@/components/SalaZabawContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Sala Zabaw Białobrzegi | Lecę w Kulki - Urodziny i Kawiarnia",
  description: "Odkryj najlepszą salę zabaw w Białobrzegach! 🎈 Basen z kulkami, konstrukcje, epickie urodziny i pyszna kawa dla rodziców. Odwiedź Lecę w Kulki przy ul. Targowicka 4!",
  keywords: ["sala zabaw Białobrzegi", "Lecę w Kulki", "urodziny dla dzieci Białobrzegi", "basen z kulkami", "atrakcje dla dzieci Białobrzegi", "kawiarnia Białobrzegi"],
  openGraph: {
    title: "Lecę w Kulki - Twoje Centrum Zabawy w Białobrzegach",
    description: "Zapewnij dziecku niezapomnianą przygodę, a sobie chwilę relaksu. Najbezpieczniejsza sala zabaw w regionie zaprasza!",
    url: 'https://www.sklep-urwis.pl/salazabaw',
    type: 'website',
  }
};

export default function SalaZabawPage() {
  return <SalaZabawContent />;
}