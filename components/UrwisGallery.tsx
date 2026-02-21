'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Sparkles, Share2, ZoomIn, ZoomOut, Heart } from 'lucide-react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';

export interface GalleryItem {
  id: number | string;
  src: string;
  title: string;
  category: string;
  seoAlt?: string; 
  isNew?: boolean; 
  isPromo?: boolean; 
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
  const [isZoomed, setIsZoomed] = useState(false);
  
  const [favorites, setFavorites] = useState<(number | string)[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Ładowanie ulubionych
  useEffect(() => {
    const saved = localStorage.getItem('urwis-favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  // Obsługa Deep Linkingu
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const produktId = params.get('produkt');
    if (produktId) {
      const found = items.find(i => String(i.id) === produktId);
      if (found) setSelectedId(found.id);
    }
  }, [items]);

  // Aktualizacja URL
  useEffect(() => {
    if (selectedId) {
      window.history.replaceState(null, '', `?produkt=${selectedId}`);
    } else {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [selectedId]);

  const visibleItems = useMemo(() => {
    if (showFavoritesOnly) {
      return items.filter(item => favorites.includes(item.id));
    }
    return items;
  }, [items, showFavoritesOnly, favorites]);

  const toggleFavorite = (e: React.MouseEvent, id: number | string) => {
    e.stopPropagation();
    const isFav = favorites.includes(id);
    
    if (!isFav) {
      toast.success("Dodano do Twojej listy życzeń! ❤️");
    } else {
      toast.info("Usunięto z listy życzeń.");
    }

    setFavorites(prev => {
      const next = isFav ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('urwis-favorites', JSON.stringify(next));
      if (isFav && showFavoritesOnly && next.length === 0) setShowFavoritesOnly(false);
      return next;
    });
  };

  // --- LOGIKA DRAG & DROP KARUZELI ---
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
    setIsZoomed(false);
  };

  const goNext = useCallback(() => {
    if (visibleItems.length <= 1) return;
    setIsZoomed(false);
    setSelectedId((prevId) => {
      if (prevId === null) return null;
      const currentIndex = visibleItems.findIndex(i => i.id === prevId);
      return currentIndex < visibleItems.length - 1 ? visibleItems[currentIndex + 1].id : visibleItems[0].id;
    });
  }, [visibleItems]);

  const goPrev = useCallback(() => {
    if (visibleItems.length <= 1) return;
    setIsZoomed(false);
    setSelectedId((prevId) => {
      if (prevId === null) return null;
      const currentIndex = visibleItems.findIndex(i => i.id === prevId);
      return currentIndex > 0 ? visibleItems[currentIndex - 1].id : visibleItems[visibleItems.length - 1].id;
    });
  }, [visibleItems]);

  // 🚀 NAPRAWA: Definicje brakujących funkcji
  const handleNextClick = (e: React.MouseEvent) => { e.stopPropagation(); goNext(); };
  const handlePrevClick = (e: React.MouseEvent) => { e.stopPropagation(); goPrev(); };

  useEffect(() => {
    document.body.style.overflow = selectedId !== null ? 'hidden' : 'unset';
  }, [selectedId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedId === null) return;
      if (e.key === 'ArrowRight' && !isZoomed) goNext();
      if (e.key === 'ArrowLeft' && !isZoomed) goPrev();
      if (e.key === 'Escape') { setSelectedId(null); setIsZoomed(false); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, goNext, goPrev, isZoomed]);

  const handleScrollLeft = () => scrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' });
  const handleScrollRight = () => scrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' });

  const selectedItem = visibleItems.find(item => item.id === selectedId);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!selectedItem) return;
    const shareData = {
      title: `Sklep Urwis - ${selectedItem.title}`,
      text: `Zobacz co znalazłem w Sklepie Urwis: ${selectedItem.title}!`,
      url: window.location.href, 
    };
    try {
      if (typeof navigator.share === 'function' && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Skopiowano link do schowka!");
      }
    } catch (err) { if ((err as Error).name !== 'AbortError') console.error(err); }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative w-full pb-12 bg-transparent z-40 select-none">
      
      {/* NAGŁÓWEK ULUBIONYCH */}
      <div className="flex justify-end items-center mb-6 px-4 md:px-12">
        <button 
          onClick={() => {
            if (favorites.length === 0 && !showFavoritesOnly) {
              toast.error("Kliknij ❤️ na produktach, które chcesz zapisać!");
              return;
            }
            setShowFavoritesOnly(!showFavoritesOnly);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm border ${
            showFavoritesOnly ? 'bg-[#BF2024] text-white border-red-500' : 'bg-white/50 text-zinc-600 border-zinc-200 hover:bg-white'
          }`}
        >
          <Heart size={18} fill={showFavoritesOnly ? "white" : "none"} className={showFavoritesOnly ? "text-white" : "text-red-500"} />
          {showFavoritesOnly ? "Pokaż wszystko" : `Moja lista (${favorites.length})`}
        </button>
      </div>

      <div className="relative group">
        <button onClick={handleScrollLeft} className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 p-4 bg-white/90 text-blue-600 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all"><ChevronLeft size={28} /></button>
        <button onClick={handleScrollRight} className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 p-4 bg-white/90 text-blue-600 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all"><ChevronRight size={28} /></button>

        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown} onMouseLeave={handleMouseLeaveOrUp} onMouseUp={handleMouseLeaveOrUp} onMouseMove={handleMouseMove}
          className="flex gap-4 md:gap-8 overflow-x-auto px-4 md:px-12 pb-8 hide-scrollbar cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none' }}
        >
          {visibleItems.map((item) => {
            const isFav = favorites.includes(item.id);
            return (
              <motion.div
                key={item.id}
                layoutId={`gallery-card-${item.id}`} 
                onClick={() => handleCardClick(item.id)}
                className="relative flex-none w-[80vw] md:w-[40vw] lg:w-[30vw] h-[50vh] rounded-3xl overflow-hidden shadow-lg group/card bg-zinc-100"
              >
                {item.isNew && <div className="absolute top-4 left-4 z-20 bg-[#BF2024] text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase animate-pulse shadow-lg">Nowość</div>}
                {item.isPromo && !item.isNew && <div className="absolute top-4 left-4 z-20 bg-amber-400 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase shadow-lg">Hit</div>}

                <button onClick={(e) => toggleFavorite(e, item.id)} className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/30 backdrop-blur-md hover:bg-white/80 transition-colors">
                  <Heart size={20} fill={isFav ? "#BF2024" : "none"} className={isFav ? "text-[#BF2024]" : "text-white"} />
                </button>

                <Image 
                  src={item.src} alt={item.seoAlt || item.title} fill draggable={false}
                  className="object-cover transition-transform duration-700 group-hover/card:scale-105 pointer-events-none"
                  sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 30vw" quality={75}
                />
                {/* 🚀 SUGGESTION: bg-linear-to-t */}
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-blue-300 font-bold uppercase tracking-widest text-[10px] mb-1">{item.category}</p>
                  <h3 className="text-white text-2xl md:text-3xl font-black uppercase italic tracking-tight">{item.title}</h3>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <Portal>
        <AnimatePresence>
          {selectedId && selectedItem && (
            /* 🚀 SUGGESTION: z-10000 */
            <div className="fixed inset-0 z-10000 flex items-center justify-center p-4 md:p-8">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => { setSelectedId(null); setIsZoomed(false); }}
                className="absolute inset-0 bg-zinc-950/90 backdrop-blur-2xl cursor-pointer"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,85,255,0.15)_0%,transparent_60%)]" />
              </motion.div>

              {/* PRZYCISKI MODALA */}
              <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50 flex items-center gap-3">
                <motion.button initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => toggleFavorite(e, selectedItem.id)} className="p-3 md:p-4 bg-white/10 text-white rounded-full border border-white/20 backdrop-blur-md">
                  <Heart size={24} fill={favorites.includes(selectedItem.id) ? "#ef4444" : "none"} className={favorites.includes(selectedItem.id) ? "text-red-500" : ""} />
                </motion.button>
                <motion.button initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-3 md:p-4 bg-white/10 text-white rounded-full border border-white/20 backdrop-blur-md" onClick={(e) => { e.stopPropagation(); setIsZoomed(!isZoomed); }}>
                  {isZoomed ? <ZoomOut size={24} /> : <ZoomIn size={24} />}
                </motion.button>
                <motion.button initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-3 md:p-4 bg-blue-600 text-white rounded-full shadow-lg" onClick={handleShare}><Share2 size={24} /></motion.button>
                <motion.button initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-3 md:p-4 bg-white/10 text-white rounded-full border border-white/20 backdrop-blur-md" onClick={() => { setSelectedId(null); setIsZoomed(false); }}><X size={24} /></motion.button>
              </div>
              
              {!isZoomed && visibleItems.length > 1 && (
                <>
                  <button className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-50 p-4 text-white/50 hover:text-white transition-colors" onClick={handlePrevClick}><ChevronLeft size={60} /></button>
                  <button className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-50 p-4 text-white/50 hover:text-white transition-colors" onClick={handleNextClick}><ChevronRight size={60} /></button>
                </>
              )}

              <motion.div
                layoutId={`gallery-card-${selectedItem.id}`}
                drag={!isZoomed ? "x" : false} 
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={(e, { offset, velocity }) => {
                  if (isZoomed) return; 
                  if (offset.x < -100 || velocity.x < -500) goNext();
                  else if (offset.x > 100 || velocity.x > 500) goPrev();
                }}
                /* 🚀 SUGGESTION: rounded-4xl */
                className="relative z-40 w-full max-w-6xl h-[80vh] md:h-[85vh] rounded-4xl overflow-hidden shadow-2xl flex items-center justify-center bg-zinc-900/50"
                onClick={(e) => { e.stopPropagation(); setIsZoomed(!isZoomed); }}
              >
                <motion.div
                  className="relative w-full h-full flex items-center justify-center"
                  style={{ cursor: isZoomed ? 'grab' : 'zoom-in' }}
                  animate={isZoomed ? { scale: 2.5 } : { scale: 1, x: 0, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  drag={isZoomed ? true : false} 
                  dragConstraints={{ left: -800, right: 800, top: -800, bottom: 800 }}
                  dragElastic={0.1}
                  whileDrag={{ cursor: "grabbing" }}
                  onDragStart={(e) => e.stopPropagation()} 
                >
                  <Image 
                    src={selectedItem.src} 
                    alt={selectedItem.seoAlt || selectedItem.title} 
                    fill draggable={false}
                    className="object-contain select-none pointer-events-none" 
                    priority sizes="100vw" quality={100}
                  />
                </motion.div>

                {/* ZNIKAJĄCY TEKST */}
                <motion.div 
                  animate={{ opacity: isZoomed ? 0 : 1, y: isZoomed ? 50 : 0 }}
                  /* 🚀 SUGGESTION: bg-linear-to-t */
                  className="absolute bottom-0 inset-x-0 p-8 md:p-16 bg-linear-to-t from-zinc-950 via-transparent to-transparent pointer-events-none flex flex-col justify-end"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                      <Sparkles className="w-4 h-4 text-red-400" />
                      <span className="text-white font-bold uppercase tracking-[0.2em] text-[10px] md:text-sm">{selectedItem.category}</span>
                    </span>
                  </div>
                  {/* 🚀 SUGGESTION: bg-linear-to-r */}
                  <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff]">
                    {selectedItem.title}
                  </h2>
                </motion.div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Portal>

      <style dangerouslySetInnerHTML={{__html: `.hide-scrollbar::-webkit-scrollbar { display: none; }`}} />
    </section>
  );
}