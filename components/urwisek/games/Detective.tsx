"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { Camera, Search, CheckCircle, Volume2, Play } from 'lucide-react';
import dynamic from 'next/dynamic';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

// 🗣️ DARMOWY GŁOS URWISA: Modulacja Web Speech API
const speakUrwis = (text: string) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pl-PL';
  
  // 🚀 Zmiana barwy głosu na zabawny/maskotkowy (wysoki pitch)
  utterance.pitch = 1.6; 
  utterance.rate = 1.15; 
  
  // Znalezienie polskiego głosu (Google Polski, itp.)
  const voices = window.speechSynthesis.getVoices();
  const polishVoice = voices.find(v => v.lang === 'pl-PL');
  if (polishVoice) utterance.voice = polishVoice;
  
  window.speechSynthesis.speak(utterance);
};

// 🎒 Lista obiektów wspieranych przez model tensorflow coco-ssd w domu
const TARGET_OBJECTS = [
  { id: 'cup', namePL: 'Kubek', emoji: '☕' },
  { id: 'book', namePL: 'Książka', emoji: '📖' },
  { id: 'cell phone', namePL: 'Telefon', emoji: '📱' },
  { id: 'bottle', namePL: 'Butelkę', emoji: '🍼' },
  { id: 'teddy bear', namePL: 'Pluszowego Misia', emoji: '🧸' },
  { id: 'frisbee', namePL: 'Zabawkę-dysk', emoji: '🥏' },
];

export default function DetectiveGame({ onWin }: { onWin?: () => void }) {
  const webcamRef = useRef<Webcam>(null);
  const [model, setModel] = useState<any>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  
  const [target, setTarget] = useState(TARGET_OBJECTS[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [found, setFound] = useState(false);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Pobranie rozmiaru okna do confetti
  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  // Wymuszenie załadowania głosów w przeglądarce
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // ŁADOWANIE LOKALNEGO MODELU AI
  useEffect(() => {
    let isMounted = true;
    const loadModel = async () => {
      try {
        const tf = await import('@tensorflow/tfjs');
        await tf.ready();
        
        const cocoSsd = await import('@tensorflow-models/coco-ssd');
        const loadedModel = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
        
        if (isMounted) {
          setModel(loadedModel);
          setIsModelLoading(false);
        }
      } catch (error) {
        console.error("Błąd ładowania modelu AI:", error);
      }
    };
    loadModel();
    return () => { isMounted = false; };
  }, []);

  // PĘTLA WYKRYWANIA (Machine Vision)
  const detectLoop = useCallback(async () => {
    if (!model || !isScanning || found || !webcamRef.current?.video) return;
    
    const video = webcamRef.current.video;
    
    // Upewnij się, że wideo w ogóle się wyrenderowało i ma nałożone wymiary
    if (video.readyState !== 4 || video.videoWidth === 0) {
      requestAnimationFrame(detectLoop);
      return;
    }

    try {
      const preds = await model.detect(video);
      setPredictions(preds);

      // Sprawdzenie, czy sztuczna inteligencja widzi targetowany przedmiot (z pewnością min. 65%)
      const isValid = preds.some((p: any) => p.class === target.id && p.score > 0.65);
      
      if (isValid) {
        setFound(true);
        setIsScanning(false);
        speakUrwis(`Znalazłeś ${target.namePL}! Brawo, jesteś super detektywem!`);
        if (onWin) setTimeout(onWin, 5000);
      } else {
        requestAnimationFrame(detectLoop);
      }
    } catch (e) {
      requestAnimationFrame(detectLoop);
    }
  }, [model, isScanning, found, target, onWin]);

  // Uruchomienie pętli, gdy wciśnięto start
  useEffect(() => {
    if (isScanning && !found) {
      // Dajemy ułamek sekundy na uruchomienie kamery przed startem modelu
      const timer = setTimeout(() => requestAnimationFrame(detectLoop), 500);
      return () => clearTimeout(timer);
    }
  }, [isScanning, found, detectLoop]);

  const startGame = () => {
    const randomItem = TARGET_OBJECTS[Math.floor(Math.random() * TARGET_OBJECTS.length)];
    setTarget(randomItem);
    setFound(false);
    setIsScanning(true);
    setPredictions([]);
    speakUrwis(`Zostałeś detektywem! Znajdź szybko na około siebie... ${randomItem.namePL}!`);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col items-center">
      {found && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />}
      
      {/* HEADER GRY */}
      <div className="w-full bg-gradient-to-r from-[#BF2024] to-[#ec4899] p-6 text-white text-center shadow-md z-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        <h2 className="text-3xl font-black italic tracking-wider flex items-center justify-center gap-3 relative z-10">
          <Search size={32} /> URWISOWY DETEKTYW
        </h2>
      </div>

      {/* OBSZAR GRY */}
      <div className="flex-1 w-full bg-zinc-50 flex flex-col items-center p-6 sm:p-8 min-h-[400px]">
        {!isScanning && !found ? (
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="flex flex-col items-center justify-center text-center space-y-6 pt-10"
          >
            <div className="w-24 h-24 bg-red-100 text-[#BF2024] rounded-[2rem] rotate-3 flex items-center justify-center mb-2 shadow-inner">
              <Camera size={48} />
            </div>
            
            <h3 className="text-2xl font-black text-zinc-800 uppercase italic">Misja z aparatem!</h3>
            <p className="text-zinc-600 font-medium max-w-sm">
              Urwis użyje lokalnej magii sztucznej inteligencji, by zobaczyć przez Twoją kamerkę czy odnalazłeś skarby w pokoju.
            </p>

            {isModelLoading ? (
              <div className="flex flex-col items-center gap-4 mt-6 text-[#0055ff]">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-10 h-10 border-4 border-blue-200 border-t-[#0055ff] rounded-full" />
                <p className="font-bold text-sm uppercase tracking-widest italic">Ładowanie Neural Engine...</p>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="mt-6 px-10 py-5 bg-[#0055ff] text-white rounded-full font-black text-xl italic tracking-wider shadow-xl flex items-center gap-3"
              >
                <Play size={24} /> START MISJI
              </motion.button>
            )}
          </motion.div>

        ) : (

          <div className="w-full flex flex-col items-center space-y-6">
            
            {/* WIDŻET CELU */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="bg-white px-6 py-4 rounded-3xl shadow-lg border-2 border-[#BF2024] flex items-center gap-4 w-full max-w-sm justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                  {target.emoji}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Znajdź to:</span>
                  <span className="text-2xl font-black text-zinc-800 uppercase italic leading-none">{target.namePL}</span>
                </div>
              </div>
              
              <button 
                onClick={() => speakUrwis(`Znajdź szybko ${target.namePL}!`)} 
                className="p-3 bg-red-50 text-[#BF2024] hover:bg-red-100 rounded-full transition-colors active:scale-95"
              >
                <Volume2 size={24} />
              </button>
            </motion.div>

            {/* WIDOK Z KAMERY LOKALNEJ */}
            <div className="relative w-full max-w-sm aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl bg-zinc-900 border-8 border-white">
              
              <Webcam
                ref={webcamRef}
                audio={false}
                videoConstraints={{ facingMode: "environment" }}
                className="w-full h-full object-cover"
              />
              
              {/* Celownik (Overlay Bounding Boxes) - tylko by pokazać, że AI działa w tle */}
              <div className="absolute inset-0 pointer-events-none">
                {predictions.map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute border-2 border-[#0055ff] bg-blue-500/10 rounded-xl"
                    style={{
                      left: `${(p.bbox[0] / (webcamRef.current?.video?.videoWidth || 1)) * 100}%`,
                      top: `${(p.bbox[1] / (webcamRef.current?.video?.videoHeight || 1)) * 100}%`,
                      width: `${(p.bbox[2] / (webcamRef.current?.video?.videoWidth || 1)) * 100}%`,
                      height: `${(p.bbox[3] / (webcamRef.current?.video?.videoHeight || 1)) * 100}%`
                    }}
                  >
                    <span className="absolute -top-6 left-0 bg-[#0055ff] text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider backdrop-blur-md">
                      {p.class === target.id ? '! TO JEST TO !' : p.class}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Ekran Zwycięstwa */}
              {found && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="absolute inset-0 bg-green-500/90 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 text-center"
                >
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} transition={{ type: 'spring', delay: 0.2 }}>
                    <CheckCircle size={100} className="mb-6 drop-shadow-2xl text-white" />
                  </motion.div>
                  <h3 className="text-4xl font-black italic drop-shadow-md">SUPER!</h3>
                  <p className="mt-2 font-bold text-green-100">Jesteś urodzonym detektywem!</p>
                </motion.div>
              )}
            </div>

            {found ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-zinc-900 text-white rounded-full font-black tracking-widest text-sm uppercase italic shadow-xl"
              >
                SZUKAMY DALEJ!
              </motion.button>
            ) : (
              <div className="flex items-center gap-3 text-zinc-500 text-xs font-black uppercase tracking-widest bg-zinc-200 px-4 py-2 rounded-full">
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                Skanowanie przestrzeni...
              </div>
            )}

          </div>
        )}
      </div>
      
      {/* SECURITY NOTE (100% Client-Side AEO) */}
      <div className="w-full bg-zinc-100 p-4 text-center text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
        Prywatność Gwarantowana. Zastosowano na-urządzeniowe AI (Edge AI). <br/>Obraz nie jest wysyłany do sieci.
      </div>
    </div>
  );
}
