'use client'

import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic'; // Dynamiczny import modelu 3D
import { HeartHandshake, Zap, Palette, ChevronRight, Sparkles } from 'lucide-react';

// 🚀 ZMIANA 1: Ładujemy ModelViewer tylko po stronie klienta (bez blokowania serwera)
const ModelViewer = dynamic(() => import('@/components/ModelViewer'), { ssr: false });

export default function PoznajUrwisa() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Usunięto zacinający się stan shouldLoadModel i event listener na window.scrollY

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const features = [
    { icon: HeartHandshake, title: 'Zawsze pomocny', desc: 'Podpowie najlepsze produkty dla Twojego dziecka.', color: '#BF2024' },
    { icon: Zap, title: 'Pełen energii', desc: 'Zakupy z nim to czysta radość i dynamiczna zabawa.', color: '#f59e0b' },
    { icon: Palette, title: 'Kreatywny', desc: 'Pokaże Ci inspiracje, o których nawet nie śniłeś.', color: '#0055ff' }
  ];

  return (
    <section 
      id="poznaj-urwisa"
      ref={containerRef}
      className="relative min-h-screen py-24 lg:py-32 overflow-hidden bg-transparent"
    >
      <div className="container mx-auto px-6 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-12 lg:gap-x-16 xl:gap-x-24 items-center">
          
          {/* CZĘŚĆ 1: Nagłówek i opisy */}
          <div className="order-1 lg:col-start-1 lg:row-start-1 space-y-12 w-full text-center lg:text-left">
            <div className="space-y-6">
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }} // Aktywacja chwilę przed pojawieniem się
                className="inline-flex items-center gap-2 px-6 py-2 bg-white/40 backdrop-blur-md text-zinc-500 rounded-full text-[12px] font-black uppercase tracking-[0.3em]"
              >
                <Sparkles size={14} className="text-[#BF2024]" /> Poznaj naszą maskotkę
              </motion.span>

              <h2 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.85] tracking-tighter text-zinc-900 uppercase">
                POZNAJ <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BF2024] to-[#0055ff] pr-4">
                  URWISA
                </span>
              </h2>
            </div>

            <div className="space-y-6 text-zinc-800">
              <p className="text-2xl lg:text-3xl font-bold leading-tight uppercase tracking-tight">
                Sympatyczny rozrabiaka, który zamienia zakupy w <span className="text-[#BF2024]">przygodę</span>.
              </p>
              <p className="text-lg text-zinc-600 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                Urwis to serce naszego sklepu. Jest energiczny, kreatywny i zawsze gotowy, by pomóc Ci znaleźć prezent idealny.
              </p>
            </div>
          </div>

          {/* CZĘŚĆ 2: Model 3D (Zoptymalizowany) */}
          <div className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-3 relative w-full h-[450px] md:h-[600px] lg:h-[800px] flex items-center justify-center">
            
            {/* 🚀 ZMIANA 2: Używamy viewport={{ once: true }} z Framer Motion, żeby załadować 3D dopiero, gdy się pojawi! */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "200px" }} // margin 200px sprawia, że załaduje się chwilę wcześniej, zanim go zobaczysz
              className="relative w-full h-full flex items-center justify-center"
            >
              
              {/* 🚀 ZMIANA 3: Koniec z blur-[120px]. Czysty, lekki gradient CSS */}
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-[280px] h-[280px] md:w-[450px] md:h-[450px] lg:w-[600px] lg:h-[600px] bg-[radial-gradient(circle_at_center,rgba(0,85,255,0.2)_0%,transparent_60%)] rounded-full z-0 will-change-transform"
              />

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute w-[320px] h-[320px] md:w-[500px] md:h-[500px] border-2 border-dashed border-[#BF2024]/10 rounded-full will-change-transform" />
              </div>

              {/* MODEL 3D */}
              <div className={`relative z-10 w-full h-full flex items-center justify-center ${isMobile ? 'pointer-events-none' : 'pointer-events-auto cursor-grab active:cursor-grabbing'}`}>
                <ModelViewer 
                  url="/urwis.glb"
                  width={isMobile ? 500 : 900} 
                  height={isMobile ? 500 : 900}
                  defaultZoom={isMobile ? 1.4 : 2}
                  defaultRotationX={0}
                  defaultRotationY={260}
                  fadeIn={true}
                  onModelLoaded={() => setModelLoaded(true)}
                  autoRotate={true}
                  autoRotateSpeed={0.3}
                  enableManualZoom={false}       
                  showScreenshotButton={false}          
                />
              </div>

              {/* LOADER */}
              {!modelLoaded && (
                <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                  <div className="bg-white/40 backdrop-blur-2xl px-8 py-4 rounded-3xl border border-white/50 shadow-2xl">
                     <span className="text-sm font-black italic uppercase">Wołam Urwisa...</span>
                  </div>
                </div>
              )}

            </motion.div>
          </div>

          {/* CZĘŚĆ 3: Cechy */}
          <div className="order-3 lg:col-start-1 lg:row-start-2 grid gap-6">
            {features.map((feature, i) => (
              <FeatureCard key={i} {...feature} index={i} />
            ))}
          </div>

          {/* CZĘŚĆ 4: Przycisk */}
          <div className="order-4 lg:col-start-1 lg:row-start-3 pt-4 lg:pt-8 w-full text-center lg:text-left">
            <Link 
              href="/oferta" 
              className="group relative inline-flex items-center gap-4 px-12 py-6 bg-zinc-900 text-white rounded-[2rem] font-black text-xl overflow-hidden transition-all hover:scale-105 shadow-2xl uppercase tracking-tighter italic"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#BF2024] to-[#0055ff] opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 flex items-center gap-3">
                ZOBACZ OFERTĘ URWISA <ChevronRight size={22} strokeWidth={3} />
              </span>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, desc, color, index }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
      whileHover={{ x: 15 }}
      className="flex items-start gap-6 p-6 rounded-[2.5rem] bg-white/20 backdrop-blur-xl border-2 border-white/70 shadow-xl hover:bg-white/40 transition-all duration-500 group will-change-transform"
    >
      <div className="p-4 rounded-2xl shadow-lg shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/20" style={{ backgroundColor: color }}>
        <Icon size={28} className="text-white" strokeWidth={2.5} />
      </div>
      <div className="text-left">
        <h3 className="text-2xl font-black text-zinc-900 uppercase italic tracking-tighter mb-1">{title}</h3>
        <p className="text-sm text-zinc-600 leading-snug font-bold italic uppercase opacity-80">{desc}</p>
      </div>
    </motion.div>
  );
}