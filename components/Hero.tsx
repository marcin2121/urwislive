'use client';
import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Modal from 'react-modal';
import Link from 'next/link';
import { 
  MapPin, ShoppingBag, Sparkles, 
  Store, Gift, ArrowRight, X 
} from 'lucide-react';

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const floatingElements = [
    { Icon: ShoppingBag, x: "12%", y: "20%", color: "#BF2024", size: 60, delay: 0 },
    { Icon: Gift, x: "85%", y: "15%", color: "#0055ff", size: 50, delay: 1 },
    { Icon: Sparkles, x: "10%", y: "75%", color: "#fbbf24", size: 40, delay: 0.5 },
    { Icon: Store, x: "88%", y: "70%", color: "#0055ff", size: 55, delay: 1.5 },
  ];

  return (
    <section ref={containerRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-transparent pt-32 pb-20">
      
      {/* DEKORACYJNE POŚWIATY */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/20 rounded-full blur-[120px]" />
      </div>

      {/* PŁYWAJĄCE IKONY */}
      {floatingElements.map((item, i) => (
        <motion.div
          key={i}
          animate={{ opacity: 0.15, y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 6 + i, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
          className="absolute hidden lg:block"
          style={{ top: item.y, left: item.x, color: item.color }}
        >
          <item.Icon size={item.size} strokeWidth={1.5} />
        </motion.div>
      ))}

      <motion.div style={{ y, opacity }} className="relative z-10 container mx-auto px-6 text-center">
        
     {/* NAGŁÓWEK W JEDNEJ LINII - Poprawka ucinania litery S */}
<div className="mb-8 overflow-visible">
  <motion.h1 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-5xl md:text-7xl lg:text-[6.5vw] font-black tracking-tighter leading-none flex items-center justify-center flex-wrap md:flex-nowrap"
  >
    <span className="text-zinc-900">SKLEP</span>
    
    {/* ZMIANA: 
      - dodany pr-[0.05em] (padding-right) w jednostce em, aby skalował się z fontem
      - dodany inline-block i overflow-visible
    */}
    <span className="relative inline-block text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff] ml-4 md:ml-8  pr-[0.05em] overflow-visible">
      URWIS
    </span>
  </motion.h1>
  
  <motion.p 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.3 }}
    className="text-xl md:text-3xl lg:text-4xl font-medium text-zinc-500 mt-4  tracking-tight"
  >
    Nie tylko dla grzecznych dzieci
  </motion.p>
</div>

   {/* NOWY, TRAFNY OPIS - Z FIXEM NA SPÓJNIKI */}
<motion.p 
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.4 }}
  className="text-lg md:text-2xl text-zinc-600 max-w-4xl mx-auto mb-16 font-bold leading-relaxed"
>
  Największy wybór gier i{"\u00A0"}zabawek, akcesoriów imprezowych, 
  art. szkolnych i{"\u00A0"}biurowych przy{"\u00A0"}<span className="text-[#BF2024]">ul. Reymonta 38A</span>.  
  
   Prawdziwy sklep stacjonarny, w{"\u00A0"}którym rządzisz Ty i{"\u00A0"}Twoja wyobraźnia!
</motion.p>

        {/* PRZYCISKI CTA */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          <Link href="/oferta" className="group relative w-full sm:w-auto px-14 py-6 bg-zinc-900 text-white rounded-[2rem] font-black text-xl overflow-hidden transition-all hover:scale-105 shadow-2xl">
            <div className="absolute inset-0 bg-linear-to-r from-[#BF2024] to-[#0055ff] opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 flex items-center justify-center gap-3 italic tracking-tight uppercase">
              Odkryj ofertę <ArrowRight size={22} strokeWidth={3} />
            </span>
          </Link>

          <motion.button 
            onClick={() => setIsMapOpen(true)}
            whileHover={{ 
              scale: 1.05, 
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              borderColor: "#0055ff" 
            }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto px-14 py-6 bg-white/40 backdrop-blur-md border-2 border-white/60 text-zinc-900 rounded-[2rem] font-black text-xl transition-all flex items-center justify-center gap-3 italic tracking-tight uppercase shadow-xl cursor-pointer group"
          >
            <MapPin 
              size={22} 
              strokeWidth={3} 
              className="group-hover:text-[#0055ff] transition-colors" 
            /> 
            Lokalizacja
          </motion.button>
        </div>
      </motion.div>

      {/* SCROLL INDICATOR */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30"
      >
        <div className="w-1 h-10 bg-linear-to-b from-zinc-900 to-transparent rounded-full" />
      </motion.div>

      {/* MODAL MAPY */}
      <Modal 
        isOpen={isMapOpen} 
        onRequestClose={() => setIsMapOpen(false)}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 max-w-5xl w-[92%] shadow-2xl outline-none border border-white/50"
        overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center"
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <span className="text-xs font-black text-[#BF2024] uppercase tracking-widest">Zapraszamy stacjonarnie</span>
            <h2 className="text-3xl font-black text-zinc-900 uppercase italic">Białobrzegi, Reymonta 38A</h2>
          </div>
          <button onClick={() => setIsMapOpen(false)} className="w-12 h-12 flex items-center justify-center bg-zinc-100 rounded-full hover:bg-zinc-200 transition-all">
            <X size={24} strokeWidth={3} />
          </button>
        </div>
        <div className="aspect-video w-full rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl bg-zinc-100">
           <iframe width="100%" height="100%" frameBorder="0" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2475.826141170283!2d20.9502709!3d51.64470900000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4718fdfaefa939bb%3A0x70c667b47a29301c!2sUrwis%20-%20Zabawki%20-%20Art.%20Szkolne%20i%20Biurowe!5e0!3m2!1spl!2spl!4v1771399578946!5m2!1spl!2spl" allowFullScreen />
        </div>
      </Modal>

    </section>
  );
}