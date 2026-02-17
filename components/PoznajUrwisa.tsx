'use client'

import { useRef, useState, useEffect, ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ModelViewer from '@/components/ModelViewer';
import { HeartHandshake, Zap, Palette, ChevronRight, Star, Sparkles } from 'lucide-react';

export default function PoznajUrwisa() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  // Animacja paralaksy dla kolorowych poświat
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
      // ✅ KLUCZOWE: bg-transparent pozwala widzieć cząsteczki z page.tsx
      className="relative min-h-screen py-16 lg:py-32 overflow-hidden bg-transparent"
    >
      {/* --- SUBTELNE POŚWIATY (BLOBS) --- */}
      {/* Zmniejszyłem opacity, aby nie przykrywały cząsteczek tła */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          style={{ y }} 
          className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-[#BF2024] rounded-full blur-[120px] opacity-[0.08] animate-pulse"
        />
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], [-100, 100]) }} 
          className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] bg-[#0055ff] rounded-full blur-[150px] opacity-[0.06]"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* LEWA STRONA: Treść */}
          <div className="space-y-10 lg:space-y-12 w-full">
            <div className="space-y-6">
              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-xl font-heading bg-linear-to-r from-[#BF2024] to-[#0055ff] backdrop-blur-md"
              >
                <Sparkles size={14} /> Maskotka Sklepu
              </motion.span>

              <h2 className="text-5xl lg:text-8xl font-black leading-[0.95] tracking-tighter text-gray-900 font-heading">
                Poznaj
                <br />
                <span className="text-transparent bg-clip-text bg-linear-to-br from-[#BF2024] to-[#0055ff] drop-shadow-sm">
                  Urwisa
                </span>
              </h2>
            </div>

            <div className="space-y-4 font-body">
              <p className="text-xl lg:text-2xl text-gray-800 leading-relaxed font-bold">
                Sympatyczny rozrabiaka, który sprawia, że zakupy stają się 
                <span className="text-[#BF2024]"> prawdziwą przygodą</span>.
              </p>
              <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
                Urwis kocha dobrą zabawę i zawsze pomoże Ci znaleźć najlepsze produkty. 
                Jest energiczny, kreatywny i gotowy na każdą przygodę!
              </p>
            </div>

            {/* Karty cech z efektem Glassmorphism */}
            <div className="grid gap-4">
              {features.map((feature, i) => (
                <FeatureCard key={i} {...feature} index={i} />
              ))}
            </div>

            <div className="pt-4">
              <motion.a
                href="/oferta"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center gap-3 px-10 py-5 text-white font-black text-xl rounded-full shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 font-heading bg-linear-to-r from-[#BF2024] to-[#0055ff]"
              >
                <span>ZOBACZ OFERTĘ</span>
                <ChevronRight className="group-hover:translate-x-2 transition-transform" />
              </motion.a>
            </div>
          </div>

          {/* PRAWA STRONA: Model 3D */}
          <div className="relative w-full h-[450px] lg:h-[750px] flex items-center justify-center">
            
            {/* Orbitujące pierścienie */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute w-[320px] h-[320px] lg:w-[550px] lg:h-[550px] border-2 border-dashed border-gray-200/50 rounded-full"
              >
                <Star size={24} className="absolute -top-3 left-1/2 -translate-x-1/2 text-yellow-400 fill-yellow-400 animate-pulse" />
                <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-4 h-4 bg-blue-400 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              </motion.div>
              
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute w-[260px] h-[260px] lg:w-[450px] lg:h-[450px] border-2 border-[#0055ff]/10 rounded-full"
              >
                <div className="absolute bottom-[10%] left-[10%] w-6 h-6 bg-[#BF2024] rounded-lg rotate-12 opacity-30 shadow-xl" />
              </motion.div>

              <motion.div
                animate={{ 
                  scale: [1, 1.15, 1],
                  opacity: [0.15, 0.3, 0.15]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-[220px] h-[220px] lg:w-[400px] lg:h-[400px] bg-linear-to-br from-[#BF2024]/40 to-[#0055ff]/40 rounded-full blur-[80px] -z-10"
              />
            </div>

            {/* Model 3D Viewer */}
            <div 
              className="relative w-full h-full z-20 cursor-grab active:cursor-grabbing"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <ModelViewer 
                url="/urwis.glb"
                width={isMobile ? 400 : 800}
                height={isMobile ? 400 : 800}
                defaultZoom={isMobile ? 1.7 : 2.0}
                minZoomDistance={0.8}
                maxZoomDistance={12}
                defaultRotationX={-85}
                defaultRotationY={5}
                enableMouseParallax={!isMobile}
                enableHoverRotation
                showScreenshotButton={false}
                fadeIn={true}
                onModelLoaded={() => setModelLoaded(true)}
              />
            </div>

            {/* Loader */}
            {!modelLoaded && (
              <div className="absolute inset-0 flex items-center justify-center z-30">
                <div className="bg-white/90 backdrop-blur-xl px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-gray-100">
                  <div className="w-6 h-6 border-4 border-[#BF2024] border-t-transparent rounded-full animate-spin" />
                  <span className="text-lg font-black text-gray-800 font-heading">WOŁAM URWISA...</span>
                </div>
              </div>
            )}
            
            {/* Interaction Hint */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: (modelLoaded && !isHovering) ? 1 : 0, y: 0 }}
              className="absolute bottom-4 lg:bottom-12 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/95 backdrop-blur-md rounded-full shadow-2xl border border-blue-50 z-30 whitespace-nowrap group"
            >
              <p className="text-sm font-black text-gray-800 flex items-center gap-3">
                <span className="text-[#BF2024] group-hover:animate-spin">★</span>
                {isMobile ? "Przesuń palcem 👆" : "Gotowy na akcję? Zakręć mną! ⚡"}
                <span className="text-[#0055ff] group-hover:animate-spin">★</span>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Komponent karty z efektem szkła (Glassmorphism)
 * Pozwala cząsteczkom tła prześwitywać, zachowując czytelność tekstu.
 */
function FeatureCard({ icon: Icon, title, desc, color, index }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
      whileHover={{ scale: 1.02, x: 10 }}
      style={{ '--card-color': color } as React.CSSProperties}
      // ✅ bg-white/60 + backdrop-blur-md tworzy efekt szkła
      className="flex items-start gap-5 p-5 rounded-2xl bg-white/60 backdrop-blur-md hover:bg-white border-2 border-white/50 hover:border-(--card-color) shadow-sm hover:shadow-xl transition-all duration-300 group"
    >
      <div className="p-3 rounded-2xl bg-white shadow-md shrink-0 group-hover:scale-110 transition-transform">
        <Icon size={28} style={{ color: color }} strokeWidth={2.5} />
      </div>
      <div>
        <h3 className="text-xl font-black text-gray-900 font-heading mb-1">{title}</h3>
        <p className="text-sm lg:text-base text-gray-600 leading-relaxed font-body">{desc}</p>
      </div>
    </motion.div>
  );
}