import type { Metadata } from 'next';

// Strona jest komponentem klienckim, więc metadane muszą być w layoucie
export const metadata: Metadata = {
  // Obiekt z template: prosty string przerwałby szablon "| Sklep Urwis Białobrzegi" dla gier poniżej
  title: {
    default: "Strefa Zabawy – darmowe gry dla dzieci",
    template: "%s | Sklep Urwis Białobrzegi",
  },
  description: "Darmowe gry online dla dzieci od Sklepu Urwis: kolorowanki, łamigłówki, gry logiczne i zręcznościowe. Bez instalacji, na telefonie i komputerze!",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
