import Link from 'next/link';
import { 
  ShoppingBag, Sparkles, Store, Gift, MapPin 
} from 'lucide-react';

/**
 * Statyczna treść Hero — renderowana server-side (Server Component).
 * ZERO JS na start = ZERO render delay dla LCP.
 */

export default function HeroContent() {
  const floatingElements = [
    { Icon: ShoppingBag, x: "12%", y: "20%", color: "#BF2024", size: 60, duration: "8s", delay: "0s" },
    { Icon: Gift, x: "85%", y: "15%", color: "#0055ff", size: 50, duration: "7s", delay: "-2s" },
    { Icon: Sparkles, x: "10%", y: "75%", color: "#fbbf24", size: 40, duration: "9s", delay: "-4s" },
    { Icon: Store, x: "88%", y: "70%", color: "#0055ff", size: 55, duration: "10s", delay: "-1s" },
  ];

  return (
    <>
      {/* 🟢 PŁYWAJĄCE IKONY: CSS Float (bez JS) */}
      {floatingElements.map((item, i) => (
        <div
          key={i}
          className="absolute hidden lg:block pointer-events-none opacity-20 animate-float"
          style={{ 
            top: item.y, 
            left: item.x, 
            color: item.color,
            animationDuration: item.duration,
            animationDelay: item.delay,
          }}
        >
          <item.Icon size={item.size} strokeWidth={1.2} />
        </div>
      ))}

      {/* GŁÓWNA TREŚĆ */}
      <div className="relative z-10 container mx-auto px-6 text-center -mt-8 md:-mt-0">
        
        <div className="mb-6 md:mb-8">
          <h1 className="text-[10vw] sm:text-7xl md:text-8xl lg:text-[8vw] font-black tracking-tighter leading-[1.0] text-zinc-900 drop-shadow-sm pb-4 flex items-baseline justify-center gap-x-3 sm:gap-x-4 md:gap-x-8">
            <span>SKLEP</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0055ff] to-[#BF2024] tracking-tight">
              URWIS
            </span>
          </h1>
        </div>

        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-zinc-500 mt-2 md:mt-6 tracking-tight">
          Nie tylko dla grzecznych dzieci
        </p>

        <p className="text-base sm:text-lg md:text-xl font-medium text-zinc-600 max-w-3xl mx-auto balance leading-snug md:leading-relaxed mb-6 md:mb-10 px-1">
          Największy w regionie wybór klocków <span className="font-black text-[#BF2024]">LEGO</span>, zabawek 
          i pełnej <span className="font-black text-[#0055ff]">wyprawki szkolnej</span> przy ul. Reymonta 38A.  
          Prawdziwy sklep stacjonarny, w którym rządzisz Ty i Twoja wyobraźnia!
        </p>

        {/* 3 CTA BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <Link href="/rabaty" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#BF2024] to-[#0055ff] text-white font-bold rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:shadow-xl hover:scale-105 active:scale-95 transition-all text-lg flex items-center justify-center gap-3">
              <Gift size={22} className="opacity-90" />
              <span>Odbierz Rabaty</span>
            </button>
          </Link>

          <Link href="/strefa-zabawy" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-zinc-900 border-2 border-zinc-100 font-bold rounded-2xl shadow-sm hover:shadow-md hover:bg-zinc-50 hover:border-zinc-200 active:scale-95 transition-all text-lg flex items-center justify-center gap-3 group">
              <Sparkles size={22} className="text-[#0055ff] group-hover:scale-110 transition-transform" />
              <span>Strefa Zabawy</span>
            </button>
          </Link>

          <Link href="https://maps.app.goo.gl/QvD5RVu1jU8yzHNK6" target="_blank" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-zinc-900 border-2 border-zinc-100 font-bold rounded-2xl shadow-sm hover:shadow-md hover:bg-zinc-50 hover:border-zinc-200 active:scale-95 transition-all text-lg flex items-center justify-center gap-3 group">
              <MapPin size={22} className="text-[#BF2024] group-hover:scale-110 transition-transform" />
              <span>Gdzie jesteśmy?</span>
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}
