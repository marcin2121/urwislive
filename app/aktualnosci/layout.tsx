import type { Metadata } from 'next';

// Strona jest komponentem klienckim, więc metadane muszą być w layoucie
export const metadata: Metadata = {
  title: "Aktualności i nowości",
  description: "Nowości, promocje i wydarzenia w Sklepie Urwis w Białobrzegach. Sprawdź, co nowego w sklepie z zabawkami i w Strefie Zabawy!",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
