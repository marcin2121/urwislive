"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Gift, Smartphone, ArrowRight, CheckCircle2, X } from "lucide-react";
import { usePopupControl } from "@/components/PopupProvider";

export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const { currentPopup, nextPopup } = usePopupControl();

  useEffect(() => {
    if (currentPopup === 'ONBOARDING') {
      const isDone = localStorage.getItem("urwis_onboarding_done");
      if (!isDone) {
        setIsOpen(true);
      } else {
        nextPopup();
      }
    }
  }, [currentPopup, nextPopup]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("urwis_onboarding_done", "true");
    nextPopup(); // Przekaż akcję dalej w maszynie Stanów
  };

  const stepsContent = [
    {
      icon: UserPlus,
      title: "1. Klub Urwisa",
      desc: "Zaloguj się, aby odblokować unikalne kupony i promocje niedostępne dla gości sklepu!",
      color: "text-[#0055ff]",
      bg: "bg-blue-100",
      button: "Genialnie!",
    },
    {
      icon: Gift,
      title: "2. Twoje Zniżki",
      desc: "Przejdź do zakładki z Rabatami, zakręć kołem fortuny i aktywuj odpowiedni kupon!",
      color: "text-amber-500",
      bg: "bg-amber-100",
      button: "Super",
    },
    {
      icon: Smartphone,
      title: "3. Tylko przy Kasie!",
      desc: "Uwaga! Kupon po odblokowaniu znika w ciągu 5 minut. Uruchom go dopiero przy stanowisku kasowym.",
      color: "text-amber-500",
      bg: "bg-amber-100",
      button: "Zaczynamy!",
    },
  ];

  const currentIdx = step - 1;
  const currentStep = stepsContent[currentIdx];
  const Icon = currentStep.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
            onClick={handleClose}
          />

          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -30 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl z-10 text-center overflow-hidden border border-white/50"
          >
            {/* Przycisk zamknięcia - pozwala porzucić */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors cursor-pointer outline-none"
              aria-label="Zamknij i nie pokazuj więcej"
            >
              <X size={20} />
            </button>

            {/* Pasek postępu kroków */}
            <div className="flex gap-2 justify-center mb-8 mt-2">
              {[1, 2, 3].map((idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx === step ? "w-8 bg-[#0055ff]" : idx < step ? "w-4 bg-[#0055ff]/40" : "w-4 bg-zinc-200"
                  }`}
                />
              ))}
            </div>

            <motion.div 
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className={`w-28 h-28 mx-auto rounded-full ${currentStep.bg} flex items-center justify-center mb-6 shadow-inner relative`}
            >
              {/* Dekoracyjne okręgi */}
              <div className={`absolute inset-0 border-4 border-white/40 rounded-full scale-110 animate-pulse`} />
              <Icon size={48} className={currentStep.color} />
            </motion.div>

            <h3 className="text-2xl font-black italic uppercase text-zinc-900 mb-3">{currentStep.title}</h3>
            <p className="text-zinc-500 font-medium mb-10 leading-relaxed">
              {currentStep.desc}
            </p>

            <button
              onClick={handleNext}
              className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-wide shadow-xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors active:scale-95 cursor-pointer outline-none"
            >
              {currentStep.button} 
              {step < 3 ? <ArrowRight size={20} /> : <CheckCircle2 size={20} className="text-green-400" />}
            </button>
            
            <p className="text-[10px] text-zinc-400 font-bold uppercase mt-5 tracking-widest text-center">
              Sklep Urwis · Białobrzegi
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
