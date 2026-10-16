'use client';

import { X } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

// Ładowany dynamicznie z HeroContent dopiero po kliknięciu "Gdzie jesteśmy?",
// żeby framer-motion nie trafiał do początkowego JS strony głównej
export default function MapModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[1001] p-4" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl bg-white rounded-[3rem] p-6 md:p-10 shadow-2xl border border-white/50 z-10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 md:mb-8">
              <div className="flex flex-col">
                <span className="text-xs font-black text-[#BF2024] uppercase tracking-widest">Zapraszamy stacjonarnie</span>
                <h2 className="text-2xl md:text-3xl font-black text-zinc-900 uppercase italic">Białobrzegi, Reymonta 38A</h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Zamknij mapę"
                className="w-12 h-12 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-full transition-all"
              >
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            <div className="aspect-square md:aspect-video w-full rounded-[2rem] overflow-hidden border-2 border-zinc-100 bg-zinc-50 relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2475.7798969279215!2d20.950946668338!3d51.645555856910185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4718fdfaefa939bb%3A0x70c667b47a29301c!2sUrwis%20-%20Zabawki%20-%20Art.%20Szkolne%20i%20Biurowe!5e0!3m2!1spl!2spl!4v1771662047423!5m2!1spl!2spl"
                width="100%"
                height="100%"
                title="Mapa dojazdu do Sklepu Urwis"
                style={{ border: 0, position: "absolute", top: 0, left: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
