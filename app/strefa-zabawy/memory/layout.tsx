import type { Metadata } from 'next';

// Strona jest komponentem klienckim, więc metadane muszą być w layoucie
export const metadata: Metadata = {
  title: "Pamięć Urwisa – gra w pary",
  description: "Odkrywaj karty i szukaj par! Darmowa gra na pamięć dla dzieci w Strefie Zabawy Sklepu Urwis.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
