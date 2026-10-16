import type { Metadata } from 'next';

// Strona jest komponentem klienckim, więc metadane muszą być w layoucie
export const metadata: Metadata = {
  title: "Kółko i krzyżyk",
  description: "Zagraj z Urwisem w kółko i krzyżyk! Prosta, darmowa gra logiczna dla dzieci online.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
