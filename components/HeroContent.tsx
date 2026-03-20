import Link from 'next/link';
import Image from 'next/image';
import { 
  ShoppingBag, Sparkles, Store, Gift, MapPin 
} from 'lucide-react';

const ShineTextEffect = () => (
  <h1 className="text-[8.5vw] sm:text-5xl md:text-6xl lg:text-[5.8vw] font-black leading-[0.9] drop-shadow-sm relative pb-4">
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BF2024] to-[#0055ff] inline-block pr-2 sm:pr-4 pb-2">
      URWIS
    </span>
    <span 
      aria-hidden="true"
      className="absolute top-0 left-0 text-transparent bg-clip-text animate-shine-text pointer-events-none inline-block pr-4 pb-2"
      style={{
        backgroundImage: 'linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.4) 55%, transparent 80%)',
        backgroundSize: '200% 100%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      URWIS
    </span>
  </h1>
);

export default function HeroContent() {
  const floatingElements = [
    { Icon: ShoppingBag, x: "12%", y: "20%", color: "#BF2024", size: 60, duration: "8s", delay: "0s" },
    { Icon: Gift, x: "85%", y: "15%", color: "#0055ff", size: 50, duration: "7s", delay: "-2s" },
    { Icon: Sparkles, x: "10%", y: "75%", color: "#fbbf24", size: 40, duration: "9s", delay: "-4s" },
    { Icon: Store, x: "88%", y: "70%", color: "#0055ff", size: 55, duration: "10s", delay: "-1s" },
  ];

  return (
    <>
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

      <div className="relative z-10 container mx-auto px-6 text-center -mt-8 md:-mt-0">
        
        <div className="mb-6 md:mb-8">
          <div className="flex items-baseline justify-center flex-nowrap gap-x-20 sm:gap-x-40 md:gap-x-70 relative">
            {/* 🎨 TŁO: Urwis-Hero */}
            <div className="absolute left-1/2 top-1/2 -translate-x-53/100 -translate-y-[67%] md:-translate-y-[63%] -z-10 w-[70%] md:w-[140%] max-w-[600px] aspect-square flex items-center justify-center pointer-events-none">
              <Image 
                src="/Urwis-Hero.webp" 
                alt="Tło Urwis" 
                fill
                priority
                className="object-contain opacity-100 select-none" 
              />
            </div>
            
            <h1 className="text-[8.5vw] sm:text-5xl md:text-6xl lg:text-[5.8vw] font-black leading-[0.9] text-zinc-900 drop-shadow-sm pb-4 pr-1 sm:pr-4">
              SKLEP
            </h1>
            
            <ShineTextEffect />
          </div>
          
          {/* USUNIĘTO animację - ten tekst jest widoczny natychmiast */}
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-zinc-500 mt-12 md:mt-36 tracking-tight">
            Nie tylko dla grzecznych dzieci
          </p>
        </div>

        {/* USUNIĘTO animację - to nasz nowy główny element LCP na mobile */}
        <p className="text-base sm:text-lg md:text-xl font-medium text-zinc-600 max-w-3xl mx-auto balance leading-snug md:leading-relaxed mb-6 md:mb-10 px-1">
          Największy w regionie wybór klocków <span className="font-black text-[#BF2024]">LEGO</span>, zabawek 
          i pełnej <span className="font-black text-[#0055ff]">wyprawki szkolnej</span> przy ul. Reymonta 38A.  
          Prawdziwy sklep stacjonarny, w którym rządzisz Ty i Twoja wyobraźnia!
        </p>

        {/* Przyciski zachowują animację dla fajnego efektu (z mniejszym opóźnieniem) */}
        <div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full animate-hero-fade-up"
          style={{ animationDelay: '0.1s' }}
        >
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