"use client";
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { 
  MapPin, 
  Phone, 
  Clock, 
  Heart, 
  PackageOpen, 
  History, 
  Navigation 
} from "lucide-react";

export default function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  // Obliczanie lat doświadczenia (2007 -> 2026 = 19 lat)
  const yearsOfExperience = new Date().getFullYear() - 2007;

  const features = [
    {
      icon: PackageOpen,
      title: "Magazyn Skarbów",
      description: "Tysiące zabawek i gier dostępnych od ręki na półkach.",
      color: "#BF2024",
      delay: 0.6
    },
    {
      icon: History,
      title: `Działamy od ${yearsOfExperience} lat`,
      description: "Lokalna firma z tradycjami i zaufaniem pokoleń.",
      color: "#f59e0b",
      delay: 0.7
    },
    {
      icon: Clock,
      title: "Zabawa Natychmiast",
      description: "Nie czekaj na kuriera. Wpadnij, wybierz i baw się dziś!",
      color: "#0055ff",
      delay: 0.8
    },
    {
      icon: Heart,
      title: "Doradzamy z Sercem",
      description: "Nie wiesz co wybrać? Pomożemy znaleźć prezent idealny.",
      color: "#ec4899",
      delay: 0.9
    }
  ];

  return (
    <section
      id="o-nas"
      ref={ref}
      // ✅ bg-transparent odsłania cząsteczki tła
      className="relative py-24 md:py-32 overflow-hidden bg-transparent"
    >
      {/* Tła dekoracyjne (Blobs) - zredukowane opacity do 15% dla czytelności */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 45, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-red-100 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, -45, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
          className="absolute top-1/2 -right-20 w-[400px] h-[400px] bg-blue-100 rounded-full blur-[100px]"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">

        {/* --- HEADER SEKCJI (OPCJA 3) --- */}
        <div className="text-center mb-20">
        <motion.h2
  initial={{ opacity: 0, y: 20 }}
  animate={isInView ? { opacity: 1, y: 0 } : {}}
  className="text-5xl md:text-8xl font-black mb-6 font-heading tracking-tighter"
>
  <span className="text-gray-900">ZABAWA TO NASZA</span> 
  <br />
  <span className="relative inline-block">
    <span className="text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff] drop-shadow-sm">
      SUPERMOC
    </span>
    {/* Subtelna kreska pod spodem */}
    <motion.div 
      initial={{ width: 0 }}
      animate={isInView ? { width: '100%' } : {}}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="absolute -bottom-2 left-0 h-2 bg-linear-to-r from-[#BF2024] to-[#0055ff] rounded-full"
    />
  </span>
</motion.h2>

        
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto font-body font-medium leading-relaxed"
          >
            Jesteśmy Twoją lokalną <span className="text-gray-900 font-bold decoration-[#BF2024] decoration-4">drużyną od zadań specjalnych</span>. 
            W Białobrzegach bawimy się najlepiej!
          </motion.p>
        </div>

        {/* --- FEATURES GRID (GLASSMorphism) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: feature.delay, duration: 0.5 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg group-hover:rotate-6 transition-transform duration-300"
                style={{ backgroundColor: feature.color }}
              >
                <feature.icon size={32} strokeWidth={2.5} />
              </div>

              <h3 className="text-xl font-black text-gray-900 mb-3 font-heading">
                {feature.title}
              </h3>
              <p className="text-gray-600 font-body leading-relaxed font-medium text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* --- STORY CARD (DUŻE SZKŁO) --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="relative p-8 md:p-12 rounded-[3.5rem] bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl overflow-hidden">
            
            {/* Wewnętrzne dekoracje świetlne */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#BF2024]/10 rounded-full blur-3xl -z-10 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#0055ff]/10 rounded-full blur-3xl -z-10 animate-pulse" />

            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
              
              <div className="flex-1 space-y-6 text-center md:text-left">
                <h3 className="text-3xl md:text-4xl font-black text-gray-900 font-heading">
                  W Urwisie <span className="text-[#BF2024]">każdy</span> <br />
                  <span className="text-[#0055ff]">czuje się dzieckiem.</span>
                </h3>
                <div className="w-20 h-2 bg-linear-to-r from-[#BF2024] to-[#0055ff] rounded-full mx-auto md:mx-0" />
                
                <div className="space-y-4 text-lg text-gray-700 font-body font-medium">
                  <p>
                  Wierzymy, że najlepsze zakupy to te, których można dotknąć. 
                    Dlatego zapraszamy Cię do naszego świata w Białobrzegach – miejsca, 
                    gdzie <span className="font-bold text-[#0055ff]">każdy czuje się jak dziecko</span> (nawet jeśli ma brodę).
                  </p>
                </div>
              </div>

              {/* Akcje - Przyciski CTA */}
              <div className="flex flex-col gap-4 w-full md:w-auto shrink-0">
                <motion.a
                  href="https://www.google.com/maps/dir//Sklep+Urwis"
                  target="_blank"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-10 py-5 bg-gray-900 text-white rounded-3xl font-black text-center shadow-lg overflow-hidden flex items-center justify-center gap-3"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-[#BF2024] to-[#0055ff] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 flex items-center gap-2 tracking-wider">
                    <Navigation size={22} /> JAK DOJECHAĆ?
                  </span>
                </motion.a>

                <motion.a
                  href="tel:+48604208193"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 bg-white/80 border-2 border-gray-200 rounded-3xl font-black text-center text-gray-900 hover:border-gray-900 transition-all flex items-center justify-center gap-3 backdrop-blur-sm"
                >
                  <Phone size={22} /> ZADZWOŃ TERAZ
                </motion.a>
              </div>

            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}