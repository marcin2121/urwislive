"use client";
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
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

  const yearsOfExperience = new Date().getFullYear() - 2007;

  const features = [
    {
      icon: PackageOpen,
      title: "Magazyn Skarbów",
      description: "Tysiące zabawek i gier dostępnych od ręki na półkach.",
      color: "#BF2024",
      delay: 0.2
    },
    {
      icon: History,
      title: `Od ${yearsOfExperience} lat z Wami`,
      description: "Lokalna firma z tradycjami i zaufaniem pokoleń rodziców.",
      color: "#f59e0b",
      delay: 0.3
    },
    {
      icon: Clock,
      title: "Zabawa Natychmiast",
      description: "Nie czekaj na kuriera. Wpadnij, wybierz i baw się już dziś!",
      color: "#0055ff",
      delay: 0.4
    },
    {
      icon: Heart,
      title: "Doradzamy z Sercem",
      description: "Pomożemy znaleźć prezent idealny dla każdego Urwisa.",
      color: "#ec4899",
      delay: 0.5
    }
  ];

  return (
    <section
      id="o-nas"
      ref={ref}
      className="relative py-24 md:py-32 overflow-hidden bg-transparent"
    >
      {/* 🚀 ZMIANA 1: Ekstremalne optymalizacje poświat - radial gradient zamiast bg-color + blur */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <motion.div
          animate={{ scale: [1, 1.1, 1], x: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(191,32,36,0.15)_0%,transparent_60%)] rounded-full will-change-transform"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, -40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 -right-20 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(0,85,255,0.15)_0%,transparent_60%)] rounded-full will-change-transform"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">

        {/* --- NAGŁÓWEK --- */}
        <div className="text-center mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="text-5xl md:text-8xl font-black mb-8 font-heading tracking-tighter leading-none will-change-transform"
          >
            <span className="text-zinc-900 uppercase italic">ZABAWA TO NASZA</span> 
            <br />
            <span className="relative inline-block mt-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BF2024] to-[#0055ff]">
                SUPERMOC
              </span>
              <motion.div 
                initial={{ width: 0 }}
                animate={isInView ? { width: '100%' } : {}}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="absolute -bottom-2 left-0 h-3 bg-gradient-to-r from-[#BF2024] to-[#0055ff] rounded-full opacity-30"
              />
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl text-zinc-600 max-w-3xl mx-auto font-body font-bold leading-relaxed italic will-change-transform"
          >
            Jesteśmy Twoją lokalną <span className="text-zinc-900">drużyną do zadań specjalnych</span>.<br />
            W Białobrzegach bawimy się najlepiej!
          </motion.p>
        </div>

        {/* --- CECHY (Glass Cards) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: feature.delay, duration: 0.5 }}
              whileHover={{ y: -10 }}
              className="group relative bg-white/20 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/40 shadow-xl hover:bg-white/40 transition-all duration-300 will-change-transform"
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300"
                style={{ backgroundColor: feature.color }}
              >
                <feature.icon size={30} strokeWidth={2.5} />
              </div>

              <h3 className="text-2xl font-black text-zinc-900 mb-3 font-heading uppercase italic tracking-tight">
                {feature.title}
              </h3>
              <p className="text-zinc-700 font-body leading-snug font-bold text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* --- STORY CARD (Wielka Tafla Szkła) --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="relative max-w-6xl mx-auto will-change-transform"
        >
          <div className="relative p-10 md:p-16 rounded-[4rem] bg-white/30 backdrop-blur-2xl border border-white/40 shadow-2xl overflow-hidden">
            
            {/* 🚀 ZMIANA 2: Wewnętrzne blaski również odchudzone z blur */}
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-[radial-gradient(circle,rgba(191,32,36,0.15)_0%,transparent_70%)] rounded-full pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[radial-gradient(circle,rgba(0,85,255,0.15)_0%,transparent_70%)] rounded-full pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20 relative z-10">
              
              <div className="flex-1 space-y-8 text-center md:text-left">
                <h3 className="text-4xl md:text-6xl font-black text-zinc-900 font-heading italic tracking-tighter leading-none">
                  W URWISIE <span className="text-[#BF2024]">KAŻDY</span> <br />
                  <span className="text-[#0055ff]">CZUJE SIĘ DZIECKIEM.</span>
                </h3>
                
                <div className="space-y-6 text-lg md:text-xl text-zinc-800 font-body font-bold leading-relaxed">
                  <p>
                    Wierzymy, że najlepsze prezenty to te, których można dotknąć.
                    Dlatego zapraszamy Cię do naszego świata w Białobrzegach – miejsca, gdzie <span className="font-bold text-[#0055ff]">każdy czuje się jak dziecko</span> (nawet jeśli ma brodę).
                  </p>
                </div>
              </div>

              {/* Akcje CTA */}
              <div className="flex flex-col gap-5 w-full md:w-auto shrink-0">
                <motion.a
                  href="https://www.google.com/maps/dir//Urwis-Zabawki-Art.SzkolneiBiurowe"
                  target="_blank"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-10 py-6 bg-zinc-900 text-white rounded-3xl font-black text-center shadow-2xl overflow-hidden flex items-center justify-center gap-3 tracking-widest text-sm uppercase italic will-change-transform"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#BF2024] to-[#0055ff] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 flex items-center gap-2">
                    <Navigation size={20} strokeWidth={3} /> JAK DOJECHAĆ?
                  </span>
                </motion.a>

                <motion.a
                  href="tel:+48604208183"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-6 bg-white/60 border-2 border-white text-zinc-900 rounded-3xl font-black text-center hover:bg-white transition-all flex items-center justify-center gap-3 backdrop-blur-md shadow-xl text-sm uppercase tracking-widest italic will-change-transform"
                >
                  <Phone size={20} strokeWidth={3} /> ZADZWOŃ TERAZ
                </motion.a>
              </div>

            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}