'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Sparkles, Share2 } from 'lucide-react'; // 🚀 DODANO Share2
import { createPortal } from 'react-dom';
import { toast } from 'sonner'; // 🚀 DODANO toast

export interface GalleryItem {
  id: number | string;
  src: string;
  title: string;
  category: string;
}

interface UrwisGalleryProps {
  items: GalleryItem[];
}

const Portal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
};

export default function UrwisGallery({ items }: UrwisGalleryProps) {
  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- LOGIKA SWOBODNEGO DRAG & DROP ---
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const draggedDistance = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    draggedDistance.current = 0;
    if (scrollRef.current) {
      startX.current = e.pageX - scrollRef.current.offsetLeft;
      scrollLeft.current = scrollRef.current.scrollLeft;
      scrollRef.current.style.userSelect = 'none';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current); 
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
    draggedDistance.current = Math.abs(walk);
  };

  const handleMouseLeaveOrUp = () => {
    isDragging.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.userSelect = 'auto';
    }
  };

  const handleCardClick = (id: number | string) => {
    if (draggedDistance.current > 10) return; 
    setSelectedId(id);
  };

  const goNext = useCallback(() => {
    setSelectedId((prevId) => {
      if (prevId === null) return null;
      const currentIndex = items.findIndex(i => i.id === prevId);
      return currentIndex < items.length - 1 ? items[currentIndex + 1].id : items[0].id;
    });
  }, [items]);

  const goPrev = useCallback(() => {
    setSelectedId((prevId) => {
      if (prevId === null) return null;
      const currentIndex = items.findIndex(i => i.id === prevId);
      return currentIndex > 0 ? items[currentIndex - 1].id : items[items.length - 1].id;
    });
  }, [items]);

  const handleNextClick = (e: React.MouseEvent) => { e.stopPropagation(); goNext(); };
  const handlePrevClick = (e: React.MouseEvent) => { e.stopPropagation(); goPrev(); };

  useEffect(() => {
    document.body.style.overflow = selectedId !== null ? 'hidden' : 'unset';
  }, [selectedId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedId === null) return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, goNext, goPrev]);

  const handleScrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
  };
  const handleScrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
  };

  // 1. ZNAJDUJEMY WYBRANY ELEMENT
  const selectedItem = items.find(item => item.id === selectedId);

  // 🚀 2. TUTAJ JEST IDEALNE MIEJSCE NA FUNKCJĘ SHARE (Zaraz po wybraniu elementu)
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    
    if (!selectedItem) return;

    const shareData = {
      title: `Sklep Urwis - ${selectedItem.title}`,
      text: `Zobacz co znalazłem w Sklepie Urwis: ${selectedItem.title} z kategorii ${selectedItem.category}!`,
      url: window.location.href, 
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        toast.success("Skopiowano link do schowka!");
      }
    } catch (err) {
      console.log('Błąd udostępniania:', err);
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative w-full py-12 bg-transparent z-40 select-none">
      
      <div className="relative group">
        <button 
          onClick={handleScrollLeft}
          aria-label='Przewiń galerię w lewo'
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 p-4 bg-white/90 text-blue-600 rounded-full shadow-xl backdrop-blur-md hover:bg-white hover:scale-110 hover:shadow-2xl transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft size={28} />
        </button>
        <button 
          onClick={handleScrollRight}
          aria-label='Przewiń galerię w prawo'
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 p-4 bg-white/90 text-blue-600 rounded-full shadow-xl backdrop-blur-md hover:bg-white hover:scale-110 hover:shadow-2xl transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronRight size={28} />
        </button>

        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeaveOrUp}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseMove={handleMouseMove}
          className="flex gap-4 md:gap-8 overflow-x-auto px-4 md:px-12 pb-8 hide-scrollbar cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <motion.div
              key={item.id}
              layoutId={`gallery-card-${item.id}`} 
              onClick={() => handleCardClick(item.id)}
              className="relative flex-none w-[80vw] md:w-[40vw] lg:w-[30vw] h-[50vh] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow group/card will-change-transform"
            >
              <Image 
                src={item.src} 
                alt={item.title} 
                fill 
                draggable={false}
                className="object-cover transition-transform duration-700 group-hover/card:scale-105 pointer-events-none"
                sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 30vw"
                quality={75}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                <p className="text-blue-300 font-bold uppercase tracking-widest text-[10px] mb-1 drop-shadow-md">
                  {item.category}
                </p>
                <h3 className="text-white text-2xl md:text-3xl font-black uppercase italic tracking-tight drop-shadow-lg">
                  {item.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Portal>
        <AnimatePresence>
          {selectedId && selectedItem && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedId(null)}
                className="absolute inset-0 bg-zinc-950/80 backdrop-blur-2xl cursor-pointer"
              >
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,85,255,0.15)_0%,transparent_60%)]" />
              </motion.div>

              {/* 🚀 ZMODYFIKOWANY ZESTAW PRZYCISKÓW (SHARE + ZAMKNIJ) */}
              <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50 flex items-center gap-3">
                <motion.button 
                  initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ delay: 0.1 }}
                  aria-label="Udostępnij to zdjęcie"
                  className="p-3 md:p-4 bg-blue-600/90 text-white rounded-full border border-blue-400 backdrop-blur-md hover:bg-blue-500 hover:scale-110 transition-all shadow-[0_0_20px_rgba(0,85,255,0.4)]"
                  onClick={handleShare}
                >
                  <Share2 size={24} className="w-5 h-5 md:w-6 md:h-6" />
                </motion.button>

                <motion.button 
                  initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
                  aria-label="Zamknij podgląd zdjęcia"
                  className="p-3 md:p-4 bg-white/10 text-white rounded-full border border-white/20 backdrop-blur-md hover:bg-white/20 hover:scale-110 transition-all shadow-xl"
                  onClick={() => setSelectedId(null)}
                >
                  <X size={24} className="w-5 h-5 md:w-6 md:h-6" />
                </motion.button>
              </div>
              
              <motion.button 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                aria-label="Poprzednie zdjęcie"
                className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-50 p-4 bg-white/10 text-white rounded-full border border-white/20 backdrop-blur-md hover:bg-white/20 hover:scale-110 transition-all shadow-xl"
                onClick={handlePrevClick}
              >
                <ChevronLeft size={40} />
              </motion.button>

              <motion.button 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                aria-label="Następne zdjęcie"
                className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-50 p-4 bg-white/10 text-white rounded-full border border-white/20 backdrop-blur-md hover:bg-white/20 hover:scale-110 transition-all shadow-xl"
                onClick={handleNextClick}
              >
                <ChevronRight size={40} />
              </motion.button>

              <motion.div
                layoutId={`gallery-card-${selectedItem.id}`}
                className="relative z-40 w-full max-w-5xl aspect-[4/5] md:aspect-video rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-white/20 ring-1 ring-white/10"
                onClick={(e) => e.stopPropagation()} 
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={(e, { offset, velocity }) => {
                  if (offset.x < -100 || velocity.x < -500) goNext();
                  else if (offset.x > 100 || velocity.x > 500) goPrev();
                }}
              >
                <Image 
                  src={selectedItem.src} 
                  alt={selectedItem.title} 
                  fill 
                  draggable={false}
                  className="object-cover select-none pointer-events-none" 
                  priority 
                  sizes="100vw"
                  quality={80}
                />

                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="absolute bottom-0 inset-x-0 p-8 md:p-16 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent pointer-events-none flex flex-col justify-end"
                >
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-sm">
                      <Sparkles className="w-4 h-4 text-red-400" />
                      <span className="text-white font-bold uppercase tracking-[0.2em] text-[10px] md:text-sm drop-shadow-md">
                        {selectedItem.category}
                      </span>
                    </span>
                  </div>

                  <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter drop-shadow-2xl">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BF2024] to-[#0055ff]">
                      {selectedItem.title}
                    </span>
                  </h2>
                </motion.div>
              </motion.div>

            </div>
          )}
        </AnimatePresence>
      </Portal>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </section>
  );
}