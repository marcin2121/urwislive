import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lecę w Kulki - Strefa Zabawy',
  description: 'Wciągająca gra Bubble Shooter na czas wolny. Pobij rekord i znajdź się rankingu!',
}

export default function GameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // Zastąp "h-[100dvh] w-full" żelaznym zestawem klas absolute/fixed
    <div className="fixed top-0 left-0 right-0 bottom-0 overflow-hidden overscroll-none touch-none bg-zinc-950 text-white z-[9999]">
       {children}
    </div>
  )
}