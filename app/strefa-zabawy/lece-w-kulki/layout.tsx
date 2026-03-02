import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lecę w Kulki - Strefa Zabawy',
  description: 'Wciągająca gra Bubble Shooter na czas wolny. Zrób wynik i znajdź się w Top 10!',
}

export default function GameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden overscroll-none touch-none bg-zinc-950 text-white z-[9999]" style={{ width: '100vw', height: '100dvh' }}>
       {children}
    </div>
  )
}
