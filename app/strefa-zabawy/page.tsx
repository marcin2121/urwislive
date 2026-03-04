import Link from 'next/link'
import { MoveLeft, Sparkles, Smile, Paintbrush, Target, ArrowRight, CircleDot, Blocks, Factory } from 'lucide-react'

export const metadata = {
  title: 'Strefa Zabawy i Darmowe Gry | Sklep Urwis',
  description: 'Odkryj interaktywne gry, Wirtualnego Urwisa, kolorowanki i AR. Zanurz się w darmowej rozrywce od Sklepu Urwis!',
};

export default function StrefaZabawyPage() {
  return (
    <div className="min-h-screen bg-transparent pt-24 md:pt-[120px] pb-32 relative z-10 text-zinc-900">
       {/* Nagłówek Huba */}
       <div className="container mx-auto px-6 mb-16 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors mb-6 font-bold uppercase tracking-widest text-xs">
          <MoveLeft size={16} /> Wróć do sklepu
        </Link>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <img src="/urwis-icon.webp" alt="Wesoły sympatyczny dinozaur Urwis" className="w-32 h-32 md:w-48 md:h-48 drop-shadow-2xl animate-bounce-slow object-contain order-2 md:order-1 shrink-0 md:mt-12" />
          <div className="order-1 md:order-2 text-center md:text-left">
            <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter pr-4">
              Strefa <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 pr-4">Zabawy <Sparkles className="inline-block text-orange-500 mb-2" size={48} /></span>
            </h1>
            {/* Desktop speech bubble — pod tytułem, obok ikony */}
            <div className="hidden md:inline-block bg-white p-6 border-2 border-yellow-400 shadow-2xl shadow-yellow-500/10 rounded-3xl mt-6 relative text-left">
               <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[16px] border-y-transparent border-r-[24px] border-r-yellow-400"></div>
               <div className="absolute -left-[13px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[14px] border-y-transparent border-r-[22px] border-r-white"></div>
               <p className="text-2xl text-zinc-800 font-bold italic leading-tight">
                 "Cześć! Jestem Urwis! 🦖 Przygotowałem dla Ciebie mnóstwo niespodzianek na tej stronie. W co zagramy dzisiaj? Ty wybierasz!"
               </p>
            </div>
          </div>
          {/* Mobile speech bubble — pod ikonką */}
          <div className="order-3 md:hidden">
            <div className="bg-white p-6 border-2 border-yellow-400 shadow-2xl shadow-yellow-500/10 rounded-3xl relative inline-block text-left">
               <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[16px] border-x-transparent border-b-[24px] border-b-yellow-400"></div>
               <div className="absolute -top-[13px] left-1/2 -translate-x-1/2 w-0 h-0 border-x-[14px] border-x-transparent border-b-[22px] border-b-white"></div>
               <p className="text-xl text-zinc-800 font-bold italic leading-tight">
                 "Cześć! Jestem Urwis! 🦖 Przygotowałem dla Ciebie mnóstwo niespodzianek na tej stronie. W co zagramy dzisiaj? Ty wybierasz!"
               </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Kafelek Wirtualny Zwierzak */}
        <Link href="/strefa-zabawy/urwisek" className="group block">
          <div className="bg-white rounded-[3rem] p-8 shadow-sm hover:shadow-xl border border-zinc-100 hover:border-yellow-200 transition-all h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-16 bg-yellow-400/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-yellow-400/10 transition-colors"></div>
            
            <div className="mb-6 bg-yellow-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Smile className="text-yellow-500" size={32} />
            </div>
            
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-zinc-900 mb-3 group-hover:text-yellow-500 transition-colors pr-2">
              Wirtualny Urwis
            </h2>
            
            <p className="text-zinc-500 font-medium flex-1">
              Załóż konto, nakarm, umyj i baw się ze swoim własnym wirtualnym podopiecznym. Zdobywaj unikalne punkty!
            </p>
            
            <div className="mt-8 flex items-center text-yellow-500 font-bold uppercase tracking-widest text-xs">
              Zaopiekuj się mną! <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Kafelek Kolorowanki */}
        <Link href="/strefa-zabawy/kolorowanki" className="group block">
          <div className="bg-white rounded-[3rem] p-8 shadow-sm hover:shadow-xl border border-zinc-100 hover:border-blue-200 transition-all h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-16 bg-blue-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
            
            <div className="mb-6 bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Paintbrush className="text-blue-500" size={32} />
            </div>
            
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-zinc-900 mb-3 group-hover:text-blue-500 transition-colors pr-2">
              Kolorowanki
            </h2>
            
            <p className="text-zinc-500 font-medium flex-1">
              "Pomaluj moje ekscytujące przygody i dino-kolegów Twoimi ulubionymi kolorami!"
            </p>
            
            <div className="mt-8 flex items-center text-blue-500 font-bold uppercase tracking-widest text-xs">
              Pomaluj mój świat! <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Kafelek AR */}
        <Link href="/strefa-zabawy/urwisar" className="group block">
          <div className="bg-white rounded-[3rem] p-8 shadow-sm hover:shadow-xl border border-zinc-100 hover:border-red-200 transition-all h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-16 bg-red-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-red-500/10 transition-colors"></div>
            
            <div className="mb-6 bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="text-red-500" size={32} />
            </div>
            
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-zinc-900 mb-3 group-hover:text-red-500 transition-colors pr-2">
              Zabierz mnie do Pokoju
            </h2>
            
            <p className="text-zinc-500 font-medium flex-1">
              "Dzięki magii kamery w telefonie mogę wyskoczyć prosto na Twój dywan! Sprawdźmy to!"
            </p>
            
            <div className="mt-8 flex items-center text-red-500 font-bold uppercase tracking-widest text-xs">
              Zaproś mnie do pokoju <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Kafelek Memory */}
        <Link href="/strefa-zabawy/memory" className="group block">
          <div className="bg-white rounded-[3rem] p-8 shadow-sm hover:shadow-xl border border-zinc-100 hover:border-green-200 transition-all h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-16 bg-green-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-green-500/10 transition-colors"></div>
            
            <div className="mb-6 bg-green-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 9h.01"/><path d="M15 9h.01"/><path d="M9 15h.01"/><path d="M15 15h.01"/></svg>
            </div>
            
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-zinc-900 mb-3 group-hover:text-green-500 transition-colors pr-2">
              Pamięć Urwisa
            </h2>
            
            <p className="text-zinc-500 font-medium flex-1">
              "Rozruszajmy Twoje szare komórki! Szukaj moich ulubionych rzeczy w parach na planszy!"
            </p>
            
            <div className="mt-8 flex items-center text-green-500 font-bold uppercase tracking-widest text-xs">
              Trenuj ze mną pamięć! <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Kafelek Kółko i Krzyżyk */}
        <Link href="/strefa-zabawy/kolko-i-krzyzyk" className="group block">
          <div className="bg-white rounded-[3rem] p-8 shadow-sm hover:shadow-xl border border-zinc-100 hover:border-purple-200 transition-all h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-16 bg-purple-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-purple-500/10 transition-colors"></div>
            
            <div className="mb-6 bg-purple-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M3 12h18"/><path d="M12 3v18"/><path d="m3 3 18 18"/><path d="m3 21 18-18"/></svg>
            </div>
            
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-zinc-900 mb-3 group-hover:text-purple-500 transition-colors pr-2">
              Kółko i Krzyżyk
            </h2>
            
            <p className="text-zinc-500 font-medium flex-1">
              "Zagrajmy w Kółko i Krzyżyk! Zobaczymy czy uda Ci się mnie pokonać w tej bitwie na logikę!"
            </p>
            
            <div className="mt-8 flex items-center text-purple-500 font-bold uppercase tracking-widest text-xs">
              Zagraj ze mną! <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Kafelek Bubble Shooter - Lecę w Kulki */}
        <Link href="/strefa-zabawy/lece-w-kulki" className="group block">
          <div className="bg-white rounded-[3rem] p-8 shadow-sm hover:shadow-xl border border-zinc-100 hover:border-cyan-200 transition-all h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-16 bg-cyan-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors"></div>
            
            <div className="mb-6 bg-cyan-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <CircleDot className="text-cyan-500" size={32} />
            </div>
            
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-zinc-900 mb-3 group-hover:text-cyan-500 transition-colors pr-2">
              Kulki
            </h2>
            
            <p className="text-zinc-500 font-medium flex-1">
              "Pif, paf! Połącz trzy takie same bąbelki by pękły i zdobądź masę punktów! Dasz radę odeprzeć atak z góry?"
            </p>
            
            <div className="mt-8 flex items-center text-cyan-500 font-bold uppercase tracking-widest text-xs">
              Strzelaj balonami! <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
<Link href="/strefa-zabawy/urwis-breaker" className="group block">
  <div className="bg-white rounded-[3rem] p-8 shadow-sm hover:shadow-xl border border-zinc-100 hover:border-indigo-200 transition-all h-full flex flex-col relative overflow-hidden">
    <div className="mb-6 bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
      <Blocks className="text-indigo-500" size={32} />
    </div>
    <h2 className="text-2xl font-black uppercase italic tracking-tight text-zinc-900 mb-3 group-hover:text-indigo-500 transition-colors">
      Urwis Breaker
    </h2>
    <p className="text-zinc-500 font-medium flex-1">
      "Rozbij wszystkie klocki piłką, łap power-upy i bij rekordy!"
    </p>
    <div className="mt-8 flex items-center text-indigo-500 font-bold uppercase tracking-widest text-xs">
      Graj teraz! <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
    </div>
  </div>
</Link>
<Link href="/strefa-zabawy/fabryka-urwisa" className="group block">
  <div className="bg-white rounded-[3rem] p-8 shadow-sm hover:shadow-xl border border-zinc-100 hover:border-emerald-200 transition-all h-full flex flex-col relative overflow-hidden">
    <div className="mb-6 bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
      <Factory className="text-emerald-500" size={32} />
    </div>
    <h2 className="text-2xl font-black uppercase italic tracking-tight text-zinc-900 mb-3 group-hover:text-emerald-500 transition-colors">
      Fabryka Urwisa
    </h2>
    <p className="text-zinc-500 font-medium flex-1">
      "Klikaj, zatrudniaj Urwisków, buduj ogromną fabrykę! Zobacz, jak rośnie Twoje imperium (Gra typu Idle)."
    </p>
    <div className="mt-8 flex items-center text-emerald-500 font-bold uppercase tracking-widest text-xs">
      Zarządzaj Fabryką <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
    </div>
  </div>
</Link>
      </div>
    </div>
  )
}
