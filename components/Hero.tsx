'use client'
import { useRef, useEffect, useState, ReactNode } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Modal from 'react-modal';
import Link from 'next/link';
// ✅ ZMIANA: Używamy Twojego kontekstu zamiast auth-helpers bezpośrednio
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { 
  MapPin, ChevronDown, Gamepad2, Puzzle, PartyPopper, 
  ShoppingBag, Sparkles, BookOpen, Clock 
} from 'lucide-react';

export default function HeroSection() {
  // ✅ ZMIANA: Pobieramy klienta z hooka
  const { supabase } = useSupabaseAuth(); 
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isHoursOpen, setIsHoursOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Stan na godziny pobrane z bazy
  const [schedule, setSchedule] = useState<any>(null);

  const [shopStatus, setShopStatus] = useState({ 
    isOpen: false, 
    title: "Sprawdzam...", 
    subtitle: "" 
  });

  // 1. Pobieranie konfiguracji z bazy
  useEffect(() => {
    const fetchHours = async () => {
      // Jeśli supabase nie jest jeszcze gotowy (np. podczas hydracji), przerwij
      if (!supabase) return;

      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'opening_hours')
        .single();
      
      if (data) {
        setSchedule(data.value);
      } else {
        // Fallback (gdyby bazy nie było lub błąd)
        setSchedule({
          "1": {"open": "08:00", "close": "18:00", "closed": false},
          "2": {"open": "08:00", "close": "18:00", "closed": false},
          "3": {"open": "08:00", "close": "18:00", "closed": false},
          "4": {"open": "08:00", "close": "18:00", "closed": false},
          "5": {"open": "08:00", "close": "18:00", "closed": false},
          "6": {"open": "08:00", "close": "15:00", "closed": false},
          "0": {"open": "10:00", "close": "14:00", "closed": true}
        });
      }
    };
    fetchHours();
  }, [supabase]);

  // 2. Przeliczanie statusu
  useEffect(() => {
    if (!schedule) return;

    const checkStatus = () => {
      const now = new Date();
      const day = now.getDay().toString(); // "0" - "6"
      const hour = now.getHours();
      const min = now.getMinutes();
      const currentTime = hour + min / 60;

      const todayConfig = schedule[day];
      
      // Helper
      const parseTime = (timeStr: string) => {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        return h + m / 60;
      };

      let isOpen = false;
      let title = "ZAMKNIĘTE";
      let subtitle = "";

      if (todayConfig.closed) {
        // Dzisiaj zamknięte
        const nextDayIndex = (parseInt(day) + 1) % 7;
        const nextDayConfig = schedule[nextDayIndex.toString()];
        
        if (!nextDayConfig.closed) {
          subtitle = `Otwieramy jutro o ${nextDayConfig.open}`;
        } else {
          subtitle = "Otwieramy w poniedziałek";
        }
      } else {
        // Dzisiaj otwarte
        const openTime = parseTime(todayConfig.open);
        const closeTime = parseTime(todayConfig.close);

        if (currentTime < openTime) {
          title = "ZAMKNIĘTE";
          subtitle = `Otwieramy dzisiaj o ${todayConfig.open}`;
        } else if (currentTime < closeTime) {
          isOpen = true;
          title = "OTWARTE";
          subtitle = `Dzisiaj do ${todayConfig.close}`;
        } else {
          title = "ZAMKNIĘTE";
          const nextDayIndex = (parseInt(day) + 1) % 7;
          const nextDayConfig = schedule[nextDayIndex.toString()];
          
          if (!nextDayConfig.closed) {
             const nextDayName = nextDayIndex === 6 ? 'w sobotę' : (nextDayIndex === 0 ? 'w niedzielę' : 'jutro');
             subtitle = `Otwieramy ${nextDayName} o ${nextDayConfig.open}`;
          } else {
             subtitle = "Otwieramy w poniedziałek";
          }
        }
      }

      setShopStatus({ isOpen, title, subtitle });
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, [schedule]);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    if (typeof window !== 'undefined') {
      Modal.setAppElement('body');
    }
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const scrollToNext = () => {
    const nextSection = document.getElementById('poznaj-urwisa');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const address = "Sklep Urwis - Władysława Reymonta 38A, 26-800 Białobrzegi";
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  const currentDayIndex = new Date().getDay().toString();

  const floatingIcons = [
    { Icon: Gamepad2, x: "10%", y: "20%", delay: 0, color: "#0055ff" },
    { Icon: Puzzle, x: "85%", y: "15%", delay: 1, color: "#BF2024" },
    { Icon: PartyPopper, x: "5%", y: "65%", delay: 2, color: "#fbbf24" },
    { Icon: ShoppingBag, x: "90%", y: "70%", delay: 1.5, color: "#22c55e" },
    { Icon: Sparkles, x: "80%", y: "40%", delay: 0.5, color: "#a855f7" },
    { Icon: BookOpen, x: "15%", y: "45%", delay: 2.5, color: "#ec4899" },
  ];

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent"
    >
      {/* Background - wzorek kropek i poświaty */}
      <div className="absolute inset-0 z-0">
        {!isMobile && (
          <div className="absolute inset-0 overflow-hidden">
            {/* Zmniejszyłem opacity poświaty z 20 na 10, żeby lepiej było widać cząsteczki */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-10 bg-[#BF2024]" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-10 bg-[#0055ff]" />
          </div>
        )}
        {/* Wzorek kropek - teraz będzie się nakładał NA cząsteczki, dając fajny efekt głębi */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(#BF2024 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      </div>

      <motion.div style={{ y, opacity }} className="relative z-10 container mx-auto px-6 text-center">
        
        {/* --- SMART STATUS BADGE --- */}
        <div className="relative inline-block mb-8 z-50">
          <motion.button
            onClick={() => setIsHoursOpen(!isHoursOpen)}
            className="group flex items-center gap-4 pl-3 pr-6 py-2 rounded-full border border-gray-100 bg-white/80 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Ikona kropki */}
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${shopStatus.isOpen ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
               <div className={`w-3 h-3 rounded-full ${shopStatus.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            </div>

            {/* Teksty */}
            <div className="flex flex-col items-start text-left mr-2">
              <span className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${shopStatus.isOpen ? 'text-green-600' : 'text-red-500'}`}>
                {shopStatus.title}
              </span>
              <span className="text-xs font-bold text-gray-600 whitespace-nowrap">
                {shopStatus.subtitle}
              </span>
            </div>

            <ChevronDown className={`text-gray-400 transition-transform duration-300 group-hover:text-gray-600 ${isHoursOpen ? 'rotate-180' : ''}`} size={16} />
          </motion.button>

          {/* --- DROPDOWN PANEL (DYNAMICZNY) --- */}
          <AnimatePresence>
            {isHoursOpen && schedule && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-gray-100 p-5 min-w-[280px] overflow-hidden text-left"
              >
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-50">
                   <Clock size={14} className="text-[#BF2024]" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Godziny Otwarcia</span>
                </div>

                <div className="space-y-3">
                  {/* Renderujemy listę dni */}
                  {["1", "2", "3", "4", "5", "6", "0"].map(key => {
                     const dayConfig = schedule[key];
                     
                     // Pokaż tylko jeśli to Sobota, Niedziela lub "Dni Robocze" (reprezentowane przez Poniedziałek)
                     if (key === "2" || key === "3" || key === "4" || key === "5") return null;

                     let label = "";
                     let hours = "";
                     let style = "";

                     if (key === "1") {
                       label = "Pon. - Pt.";
                       style = (parseInt(currentDayIndex) >= 1 && parseInt(currentDayIndex) <= 5) ? 'opacity-100' : 'opacity-60';
                     } else if (key === "6") {
                        label = "Sobota";
                        style = key === currentDayIndex ? 'opacity-100' : 'opacity-60';
                     } else {
                        label = "Niedziela";
                        style = key === currentDayIndex ? 'opacity-100' : 'opacity-60';
                     }

                     if (dayConfig?.closed) {
                       hours = "Zamknięte";
                     } else {
                       hours = `${dayConfig?.open} - ${dayConfig?.close}`;
                     }

                     return (
                        <div key={key} className={`flex justify-between items-center ${style}`}>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-gray-800">{label}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${dayConfig?.closed ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-[#0055ff]'}`}>
                            {hours}
                          </span>
                        </div>
                     )
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50 text-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Zapraszamy! 👋
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Heading */}
        <h1 className="md:text-8xl xl:text-9xl font-black leading-[1.1] tracking-tighter mb-8 font-heading relative z-20">
  {/* Górna linia - Gradient z lekką poświatą */}
  <span className="block text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff] pb-2 tracking-wider filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
    Sklep Urwis
          </span>
          <span className="block text-gray-800 text-4xl md:text-6xl tracking-tight lg:text-7xl mt-2">
            Nie tylko dla grzecznych dzieci
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 font-medium font-body leading-relaxed">
          Najlepsze gry, artykuły szkolne i akcesoria imprezowe. <br className="hidden md:block" />
          Wszystko, czego potrzebuje Twój mały (i duży) urwis!
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <motion.a
            href="/oferta"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-10 py-5 rounded-full bg-linear-to-r from-[#BF2024] to-[#0055ff] text-white font-black text-xl shadow-xl shadow-blue-500/20 font-heading tracking-wide"
          >
            ZOBACZ OFERTĘ
          </motion.a>

          <motion.button
            onClick={() => setIsMapOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-5 rounded-full bg-white border-2 border-gray-200 text-gray-800 font-black text-xl shadow-lg flex items-center gap-2 font-heading cursor-pointer tracking-wide"
          >
            <span className="text-2xl">🗺️</span> LOKALIZACJA
          </motion.button>
        </div>

        {/* Stats Section */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          <Link href="https://g.page/r/CRwwKXq0Z8ZwEBM/review" target="_blank">
            <StatBadge icon="⭐" color="#333333">
              Ocena <span className="text-[#BF2024]">4.9</span>
            </StatBadge>
          </Link>
          
          <StatBadge icon="❤️" color="#333333" noHover>
            Od <span className="text-[#0055ff]">2007</span> roku
          </StatBadge>
          
          <StatBadge icon="📦" color="#333333" noHover>
            Lokalny <span className="text-[#333333]">biznes</span>
          </StatBadge>
        </div>
      </motion.div>

      {/* Floating Icons */}
      {!isMobile && floatingIcons.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 0.15,
            y: [0, -30, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
          className="absolute pointer-events-none"
          style={{ top: item.y, left: item.x, color: item.color }}
        >
          <item.Icon size={80} strokeWidth={2.5} />
        </motion.div>
      ))}

      {/* Map Modal */}
      <Modal
        isOpen={isMapOpen}
        onRequestClose={() => setIsMapOpen(false)}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl p-4 md:p-8 max-w-5xl w-[95%] shadow-2xl outline-none"
        overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center"
      >
        <div className="w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-black text-gray-900 font-heading">Nasza lokalizacja</h2>
            <button 
              onClick={() => setIsMapOpen(false)} 
              className="text-4xl font-bold p-2 hover:rotate-90 transition-transform cursor-pointer"
            >
              ×
            </button>
          </div>
          <p className="font-bold text-gray-600 mb-4 flex items-center gap-2 font-body">
            <MapPin size={18} className="text-[#BF2024]" /> {address}
          </p>
          <div className="aspect-video w-full rounded-2xl overflow-hidden border-4 border-gray-50 bg-gray-100">
            <iframe
              src={mapEmbedUrl}
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy"
            />
          </div>
        </div>
      </Modal>

      {/* Scroll Indicator */}
      <motion.div
        style={{
          opacity: useTransform(scrollYProgress, [0, 0.2], [1, 0])
        }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-pointer group z-20"
        onClick={scrollToNext}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="relative"
        >
          <div className="absolute -inset-2 rounded-full blur-lg opacity-30 bg-linear-to-r from-[#BF2024] to-[#0055ff]" />

          <div className="relative px-6 py-3 bg-white/80 backdrop-blur-md rounded-full shadow-xl border border-gray-100 group-hover:scale-105 transition-transform">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-gray-500">
                Poznaj Urwisa
              </span>
              <motion.span
                animate={{ y: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-lg"
              >
                👇
              </motion.span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function StatBadge({ icon, color, children, noHover = false }: { icon: string, color: string, children: ReactNode, noHover?: boolean }) {
  return (
    <motion.div 
      whileHover={noHover ? {} : { scale: 1.05 }}
      className={`flex items-center gap-3 px-6 py-3 rounded-full bg-white shadow-md border border-gray-100 transition-transform ${noHover ? '' : 'cursor-pointer hover:shadow-lg'}`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-black uppercase tracking-tight text-sm font-heading" style={{ color }}>
        {children}
      </span>
    </motion.div>
  );
}