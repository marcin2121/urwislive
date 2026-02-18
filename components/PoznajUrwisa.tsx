'use client'
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ModelViewer from '@/components/ModelViewer';
import { HeartHandshake, Zap, Palette, ChevronRight, Star, Sparkles } from 'lucide-react';

export default function PoznajUrwisa() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  const features = [
    { 
      icon: HeartHandshake, 
      title: 'Zawsze pomocny', 
      desc: 'Podpowie najlepsze produkty dla Twojego dziecka.',
      color: '#BF2024'
    },
    { 
      icon: Zap, 
      title: 'Pełen energii', 
      desc: 'Zakupy z nim to czysta radość i dynamiczna zabawa.',
      color: '#f59e0b'
    },
    { 
      icon: Palette, 
      title: 'Kreatywny', 
      desc: 'Pokaże Ci inspiracje, o których nawet nie śniłeś.',
      color: '#0055ff' 
    }
  ];

  return (
    <section 
      id="poznaj-urwisa"
      ref={containerRef}
      className="relative min-h-screen py-24 lg:py-32 overflow-hidden bg-transparent"
    >
      {/* --- DEKORACYJNE POŚWIATY --- *
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <motion.div 
          style={{ y }} 
          className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] bg-[#BF2024] rounded-full blur-[150px]"
        />
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], [-150, 150]) }} 
          className="absolute bottom-[10%] -right-[10%] w-[700px] h-[700px] bg-[#0055ff] rounded-full blur-[180px]"
        />
      </div> */}

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* LEWA STRONA: Treść */}
          <div className="space-y-12 w-full text-center lg:text-left">
            <div className="space-y-6">
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-6 py-2 bg-white/40 backdrop-blur-md text-zinc-500 rounded-full text-[12px] font-black uppercase tracking-[0.3em] "
              >
                <Sparkles size={14} className="text-[#BF2024]" /> Poznaj naszą maskotkę
              </motion.span>

              <h2 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.85] tracking-tighter text-zinc-900 uppercase ">
                POZNAJ <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff] pr-4">
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

            <div className="grid gap-6">
              {features.map((feature, i) => (
                <FeatureCard key={i} {...feature} index={i} />
              ))}
            </div>

            <div className="pt-8">
              <Link 
                href="/oferta" 
                className="group relative inline-flex items-center gap-4 px-12 py-6 bg-zinc-900 text-white rounded-[2rem] font-black text-xl overflow-hidden transition-all hover:scale-105 shadow-2xl uppercase tracking-tighter italic"
              >
                <div className="absolute inset-0 bg-linear-to-r from-[#BF2024] to-[#0055ff] opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center gap-3">
                  ZOBACZ OFERTĘ URWISA <ChevronRight size={22} strokeWidth={3} />
                </span>
              </Link>
            </div>
          </div>

          {/* PRAWA STRONA: Model 3D */}
          <div className="relative w-full h-[450px] md:h-[600px] lg:h-[800px] flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              
              {/* 1. Poświata */}
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-[280px] h-[280px] md:w-[450px] md:h-[450px] lg:w-[600px] lg:h-[600px] bg-linear-to-br from-[#BF2024] to-[#0055ff] rounded-full blur-[80px] md:blur-[120px] z-0"
              />

              {/* 2. Pierścienie */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute w-[320px] h-[320px] md:w-[500px] md:h-[500px] border-2 border-dashed border-[#BF2024]/10 rounded-full" />
              </div>

              {/* 3. Model 3D - KLUCZOWA ZMIANA TUTAJ: pointer-events-auto na komputerze */}
              <div className={`relative z-10 w-full h-full flex items-center justify-center ${isMobile ? 'pointer-events-none' : 'pointer-events-auto cursor-grab active:cursor-grabbing'}`}>
                <ModelViewer 
                  url="/urwis.glb"
                  width={isMobile ? 500 : 900} 
                  height={isMobile ? 500 : 900}
                  defaultZoom={isMobile ? 1.4 : 2}
                  defaultRotationX={-85}
                  defaultRotationY={10}
                  fadeIn={true}
                  onModelLoaded={() => setModelLoaded(true)}
                  autoRotate={true}
                  autoRotateSpeed={0.3}
                  enableManualZoom={false}                
                />
              </div>

              {/* 4. Loader */}
              {!modelLoaded && (
                <div className="absolute inset-0 flex items-center justify-center z-30">
                  <div className="bg-white/40 backdrop-blur-2xl px-8 py-4 rounded-3xl border border-white/50 shadow-2xl">
                     <span className="text-sm font-black italic uppercase">Wołam Urwisa...</span>
                  </div>
                </div>
              )}
            </div>
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
      viewport={{ once: true }}
      transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
      whileHover={{ x: 15 }}
      className="flex items-start gap-6 p-6 rounded-[2.5rem] bg-white/20 backdrop-blur-xl border-2 border-white/70 shadow-xl hover:bg-white/40 transition-all duration-500 group"
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