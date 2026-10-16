import type { Metadata } from 'next';

// Strona jest komponentem klienckim, więc metadane muszą być w layoucie
export const metadata: Metadata = {
  title: "Polityka prywatności",
  description: "Jak Sklep Urwis z Białobrzegów przetwarza dane osobowe i wykorzystuje pliki cookies.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
