import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Urwis Breaker - Strefa Zabawy',
  description: 'Zbijaj wszystkie klocki i zostań najlepszym rzemieślnikiem. Znajdź się w rankingu!',
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
