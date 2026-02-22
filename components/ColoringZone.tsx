'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, Download, ChevronLeft, 
  Eraser, ZoomIn, Palette, Move, Pipette, Trash2, Eye, EyeOff,
  Wand2, Star, Sun, Heart, Smile, X, Plus, Hand
} from 'lucide-react';

// --- WYEKSPORTOWANE INTERFEJSY ---
export interface Template { 
  id: string; 
  title: string; 
  src: string;
  brand?: string;
  difficulty?: string;
  thumb?: string;
}

export interface ColoringZoneProps { 
  template: Template; 
  onClose: () => void; 
}

// --- ANALITYKA GTAG ---
const trackEvent = (action: string, params?: object) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, params);
  }
};

const PRESET_PALETTE = ['#BF2024', '#EF4444', '#F97316', '#FACC15', '#22C55E', '#10B981', '#0055ff', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E', '#71717A', '#000000', '#FFFFFF', '#4B0082'];
const STAMP_LIST = [{ id: 'urwis', icon: Smile }, { id: 'star', icon: Star }, { id: 'sun', icon: Sun }, { id: 'heart', icon: Heart }];

export default function ColoringZone({ template, onClose }: ColoringZoneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ghostCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rainbowHue = useRef(0);
  
  // --- STAN APLIKACJI ---
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState(PRESET_PALETTE[0]);
  const [recentColors, setRecentColors] = useState<string[]>(['#BF2024', '#0055ff', '#FACC15', '#22C55E', '#000000']);
  const [lineWidth, setLineWidth] = useState(15);
  const [tool, setTool] = useState<'brush' | 'magic' | 'eraser' | 'pan' | 'picker' | 'stamp'>('brush');
  const [selectedStamp, setSelectedStamp] = useState(STAMP_LIST[0]);
  
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [trashHold, setTrashHold] = useState(0);
  const [zenMode, setZenMode] = useState(false);

  // Nawigacja (Pan & Zoom)
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [lastPoint, setLastPoint] = useState<{x: number, y: number} | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Historia i Zapis
  const [undoStack, setUndoStack] = useState<string[]>([]);

  // Inicjalizacja & Analityka wejścia
  useEffect(() => {
    trackEvent('coloring_start', { template_id: template.id, template_title: template.title });
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 1280, 720);
        setUndoStack([canvas.toDataURL()]);
      }
    }

    const ghost = document.createElement('canvas');
    ghost.width = 1280;
    ghost.height = 720;
    const gCtx = ghost.getContext('2d', { willReadFrequently: true });
    if (gCtx) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = template.src;
      img.onload = () => {
        gCtx.fillStyle = '#FFFFFF';
        gCtx.fillRect(0, 0, 1280, 720);
        gCtx.drawImage(img, 0, 0, 1280, 720);
        ghostCanvasRef.current = ghost;
      };
    }
  }, [template]);

  const getToolName = () => {
    switch(tool) {
      case 'brush': return 'Pędzel';
      case 'magic': return 'Magia';
      case 'eraser': return 'Gumka';
      case 'pan': return 'Rączka';
      case 'picker': return 'Próbnik';
      case 'stamp': return 'Pieczątka';
      default: return '';
    }
  };

  const getToolIcon = () => {
    switch(tool) {
      case 'pan': return <Hand size={14} className="text-white" />;
      case 'picker': return (
        <div className="flex items-center justify-center relative">
          <Pipette size={14} className="text-white z-10 drop-shadow-md" />
          <div className="absolute inset-[-12px] rounded-full border-[3px] border-white shadow-xl" style={{ backgroundColor: selectedColor }} />
        </div>
      );
      case 'stamp': return <selectedStamp.icon size={14} className="text-white" />;
      default: return null;
    }
  };

  const commitColorToHistory = useCallback((color: string) => {
    if (tool === 'magic' || tool === 'eraser') return;
    setRecentColors(prev => {
      if (prev[0] === color) return prev;
      const filtered = prev.filter(c => c.toLowerCase() !== color.toLowerCase());
      return [color, ...filtered].slice(0, 5);
    });
  }, [tool]);

  const selectColor = (color: string) => {
    setSelectedColor(color);
    setTool('brush');
  };

  const playSfx = useCallback((type: string) => {
    const audio = new Audio(`/sfx/${type}.mp3`);
    audio.volume = 0.1;
    audio.play().catch(() => {});
  }, []);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setUndoStack(prev => {
      if (prev.length > 0 && prev[prev.length - 1] === dataUrl) return prev;
      return [...prev.slice(-20), dataUrl];
    });
  }, []);

  const undo = useCallback(() => {
    if (undoStack.length <= 1) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const previousState = undoStack[undoStack.length - 2];
    const img = new window.Image();
    img.src = previousState;
    img.onload = () => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, 1280, 720);
      ctx.drawImage(img, 0, 0);
      setUndoStack(prev => prev.slice(0, -1));
      playSfx('click');
    };
  }, [undoStack, playSfx]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 1280, 720);
      saveState();
      playSfx('trash');
    }
  }, [saveState, playSfx]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    trackEvent('drawing_download', { template_id: template.id });
    
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1280; exportCanvas.height = 720;
    const eCtx = exportCanvas.getContext('2d')!;
    eCtx.drawImage(canvas, 0, 0);
    
    const img = new window.Image();
    img.src = template.src;
    img.onload = () => {
      eCtx.globalCompositeOperation = 'multiply';
      eCtx.drawImage(img, 0, 0, 1280, 720);
      const link = document.createElement('a');
      link.download = `urwis-art-${template.id}.png`;
      link.href = exportCanvas.toDataURL();
      link.click();
      playSfx('success');
    };
  }, [template, playSfx]);

  const getPos = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setMousePos({ x: clientX, y: clientY });
    return { 
      x: (clientX - rect.left) * (1280 / rect.width), 
      y: (clientY - rect.top) * (720 / rect.height) 
    };
  };

  const pickColorRealTime = (pos: {x: number, y: number}) => {
    const x = Math.floor(pos.x);
    const y = Math.floor(pos.y);
    if (x < 0 || x >= 1280 || y < 0 || y >= 720) return;

    const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true });
    const gCtx = ghostCanvasRef.current?.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) return;

    try {
      const uPixel = ctx.getImageData(x, y, 1, 1).data;
      let r = uPixel[0];
      let g = uPixel[1];
      let b = uPixel[2];

      if (gCtx) {
        const tPixel = gCtx.getImageData(x, y, 1, 1).data;
        r = Math.floor((r * tPixel[0]) / 255);
        g = Math.floor((g * tPixel[1]) / 255);
        b = Math.floor((b * tPixel[2]) / 255);
      }

      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      setSelectedColor(hex);
    } catch (e) {
      console.error("Picker error", e);
    }
  };

  const handleStart = (e: any) => {
    const pos = getPos(e);
    
    if (tool === 'stamp') {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.fillStyle = selectedColor;
        ctx.font = `${lineWidth * 4}px Arial`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const glyphs: Record<string, string> = { star: '⭐', sun: '☀️', heart: '❤️', urwis: '😊' };
        ctx.fillText(glyphs[selectedStamp.id] || '?', pos.x, pos.y);
        commitColorToHistory(selectedColor);
        saveState();
        playSfx('success');
      }
      return;
    }
    
    if (tool === 'picker') {
      setIsDrawing(true);
      pickColorRealTime(pos);
      return;
    }
    
    if (tool === 'pan') {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      setIsPanning(true);
      setPanStart({ x: clientX - offset.x, y: clientY - offset.y });
    } else {
      setIsDrawing(true);
      setLastPoint(pos);
      const ctx = canvasRef.current?.getContext('2d');
      ctx?.beginPath();
      ctx?.moveTo(pos.x, pos.y);
      commitColorToHistory(selectedColor);
      playSfx(tool === 'eraser' ? 'erase' : 'paint');
    }
  };

  const handleMove = (e: any) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setMousePos({ x: clientX, y: clientY });
    const pos = getPos(e);

    if (tool === 'picker' && isDrawing) { 
      pickColorRealTime(pos); 
      return; 
    }

    if (isPanning && tool === 'pan') {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const limitX = (rect.width * scale - rect.width) / 2;
        const limitY = (rect.height * scale - rect.height) / 2;
        setOffset({ 
          x: Math.max(-limitX, Math.min(limitX, clientX - panStart.x)), 
          y: Math.max(-limitY, Math.min(limitY, clientY - panStart.y)) 
        });
      }
      return;
    }

    if (!isDrawing || !lastPoint) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = lineWidth;
    
    if (tool === 'magic') {
      rainbowHue.current = (rainbowHue.current + 5) % 360;
      ctx.strokeStyle = `hsl(${rainbowHue.current}, 100%, 50%)`;
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : selectedColor;
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
    setLastPoint(pos);
  };

  const handleEnd = () => { 
    if (tool === 'picker' && isDrawing) {
      commitColorToHistory(selectedColor);
      setTool('brush');
      playSfx('click');
    }
    if (isDrawing && tool !== 'picker') {
      saveState();
    }
    setIsDrawing(false);
    setIsPanning(false);
    setLastPoint(null);
  };

  const showCursorIndicator = tool === 'picker' || (!isDrawing && !isPanning && (tool === 'pan' || tool === 'stamp'));

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 overflow-hidden touch-none flex flex-row p-2 gap-2 safe-p text-white font-sans">
      
      {/* INDYKATOR KURSORA */}
      <AnimatePresence>
        {showCursorIndicator && (
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1, x: mousePos.x - 20, y: mousePos.y - 60 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', damping: 20, stiffness: 350, mass: 0.5 }} className="fixed top-0 left-0 z-2000 pointer-events-none">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-md border-2 border-white/50 bg-zinc-900/80">
              {getToolIcon()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL PALETY */}
      <AnimatePresence>
        {showColorPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-1100 bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 touch-auto">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-zinc-900 border border-white/10 p-6 rounded-[2.5rem] max-w-sm w-full shadow-2xl text-white">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black uppercase italic tracking-tighter">Paleta Urwisa</h3>
                <button onClick={() => setShowColorPicker(false)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"><X size={20}/></button>
              </div>
              <div className="grid grid-cols-6 gap-3 mb-8">
                {PRESET_PALETTE.map(c => (
                  <button key={c} onClick={() => selectColor(c)} className={`aspect-square rounded-full border-2 transition-transform active:scale-90 ${selectedColor === c ? 'border-white scale-110' : 'border-white/10'}`} style={{ backgroundColor: c }} />
                ))}
                <button onClick={() => { setTool('picker'); setShowColorPicker(false); }} className="aspect-square rounded-full border-2 border-blue-500/50 flex items-center justify-center bg-blue-500/10 text-blue-400 active:scale-90 transition-transform"><Pipette size={18} /></button>
                <label className="aspect-square rounded-full border-2 border-dashed border-white/20 flex items-center justify-center relative bg-white/5 overflow-hidden active:scale-90 transition-transform">
                  <input 
                    type="color" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onInput={(e) => setSelectedColor(e.currentTarget.value)} 
                    onChange={(e) => selectColor(e.currentTarget.value)} 
                  />
                  <Plus size={16} />
                </label>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setTool('magic'); setShowColorPicker(false); }} className="flex-1 py-4 bg-linear-to-r from-red-500 via-green-500 to-blue-500 rounded-2xl text-white font-black uppercase text-xs italic shadow-lg active:scale-95 transition-transform">Tęcza ✨</button>
                <button onClick={() => setShowColorPicker(false)} className="px-8 py-4 bg-white text-zinc-900 rounded-2xl font-black uppercase text-xs active:scale-95 transition-transform">OK</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEWY PANEL */}
      {!zenMode && (
        <motion.div initial={{ x: -100 }} animate={{ x: 0 }} exit={{ x: -100 }} className="w-14 shrink-0 flex flex-col gap-2 overflow-y-auto py-1 scrollbar-hide touch-pan-y">
          <button onClick={() => setShowExitConfirm(true)} className="w-full aspect-square bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shrink-0 shadow-lg active:bg-red-600 transition-colors"><ChevronLeft size={20} /></button>
          
          <div className="p-1 bg-white/5 rounded-3xl border border-white/10 flex flex-col gap-2 shrink-0">
            <button onClick={() => { if(tool === 'brush' || tool === 'magic' || tool === 'picker') setShowColorPicker(true); else setTool('brush'); }} className={`w-full aspect-square rounded-2xl border-4 shadow-xl relative overflow-hidden transition-all ${tool === 'brush' || tool === 'magic' || tool === 'picker' ? 'border-white scale-110' : 'border-white/20'}`} style={{ backgroundColor: tool === 'magic' ? 'transparent' : selectedColor }}>
              {tool === 'magic' && <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000)] animate-spin-slow" />}
              {tool === 'picker' && <div className="absolute inset-0 bg-blue-500 flex items-center justify-center"><Pipette size={16} /></div>}
              {(tool !== 'magic' && tool !== 'picker') && <div className="absolute inset-0 flex items-center justify-center bg-black/10"><Palette size={16} /></div>}
            </button>
            <div className="h-px bg-white/10 mx-2" />
            {recentColors.map((c, i) => (
              <button key={`${c}-${i}`} onClick={() => selectColor(c)} className="w-full aspect-square rounded-full border-2 border-white/10 opacity-60 shrink-0 hover:opacity-100 transition-opacity" style={{ backgroundColor: c }} />
            ))}
          </div>

          <div className="flex flex-col gap-1.5 p-1.5 bg-white/5 rounded-2xl border border-white/10 shrink-0 text-white">
            {STAMP_LIST.map(s => (
              <button key={s.id} onClick={() => { setSelectedStamp(s); setTool('stamp'); }} className={`w-full aspect-square rounded-lg border-2 flex items-center justify-center transition-all ${selectedStamp.id === s.id && tool === 'stamp' ? 'border-white bg-white/20 scale-110' : 'border-transparent opacity-40 hover:opacity-100'}`}><s.icon size={14}/></button>
            ))}
          </div>
        </motion.div>
      )}

      {/* CENTRUM - GŁÓWNE PŁÓTNO */}
      <div className="flex-1 flex flex-col items-center justify-center relative min-w-0">
        
        {/* STATUS BAR */}
        {!zenMode && (
          <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="absolute top-4 z-30 bg-zinc-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-3 shadow-2xl text-white">
            <div className={`w-2 h-2 rounded-full ${isDrawing || isPanning ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">{getToolName()}</span>
            <div className="w-px h-3 bg-white/10" />
            <span className="text-[10px] font-bold opacity-60">Zoom {scale.toFixed(1)}x</span>
          </motion.div>
        )}

        <div 
          ref={containerRef} 
          onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd} 
          onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd} 
          className="relative w-full max-h-full aspect-video bg-white shadow-2xl border-4 border-zinc-900 overflow-hidden cursor-none"
        >
          <motion.div animate={{ scale, x: offset.x, y: offset.y }} transition={{ type: 'spring', stiffness: 350, damping: 35 }} className="absolute inset-0 w-full h-full origin-center">
            <canvas ref={canvasRef} width={1280} height={720} className="absolute inset-0 w-full h-full pointer-events-none" />
            <img src={template.src} className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none" style={{ mixBlendMode: 'multiply' }} />
          </motion.div>
          
          {/* PRZYCISKI DOLNE */}
          <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2">
            <button onClick={() => setZenMode(!zenMode)} className="w-10 h-10 bg-zinc-900/80 text-white rounded-full flex items-center justify-center border border-white/20 backdrop-blur-md shadow-xl active:scale-90 transition-all">
              {zenMode ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
            <button 
              onClick={undo} 
              disabled={undoStack.length <= 1}
              className={`w-10 h-10 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-md shadow-xl active:scale-75 transition-all ${undoStack.length > 1 ? 'bg-zinc-900/80 text-white opacity-100 cursor-pointer' : 'bg-zinc-900/40 text-white/20 opacity-50 cursor-not-allowed'}`}
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* PRAWY PANEL */}
      {!zenMode && (
        <motion.div initial={{ x: 100 }} animate={{ x: 0 }} exit={{ x: 100 }} className="w-14 shrink-0 flex flex-col gap-2 overflow-y-auto py-1 items-center scrollbar-hide touch-pan-y text-white">
          <button onPointerDown={() => setTrashHold(Date.now())} onPointerUp={() => { if(Date.now() - trashHold > 1200) clearCanvas(); setTrashHold(0); }} onPointerLeave={() => setTrashHold(0)} className="w-full aspect-square bg-white/5 rounded-2xl flex items-center justify-center text-zinc-500 shrink-0 border border-white/10 relative overflow-hidden active:text-red-500 transition-colors">
            <Trash2 size={18} />
            {trashHold > 0 && <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.2 }} className="absolute bottom-0 left-0 h-1 bg-red-600 shadow-[0_0_10px_#ef4444]" />}
          </button>
          
          <div className="flex-1 w-full flex flex-row gap-1 shrink-0 min-h-[240px]">
            <div className="flex-1 bg-white/5 rounded-full border border-white/10 flex flex-col items-center py-3 relative overflow-hidden">
               <div className="h-10 flex items-center justify-center shrink-0">
                  <div className="rounded-full bg-white transition-all duration-75" style={{ width: `${Math.max(2, lineWidth/2.5)}px`, height: `${Math.max(2, lineWidth/2.5)}px` }} />
               </div>
               <div className="flex-1 relative w-full flex justify-center my-1 overflow-hidden">
                  <input 
                    type="range" min="1" max="60" value={lineWidth} step="1" 
                    onChange={(e) => setLineWidth(parseInt(e.currentTarget.value))} 
                    className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer z-20" 
                    style={{ WebkitAppearance: 'slider-vertical' } as any} 
                  />
                  <div className="w-1 h-full bg-white/10 rounded-full" />
               </div>
            </div>
            
            <div className="flex-1 bg-white/5 rounded-full border border-white/10 flex flex-col items-center py-3 relative overflow-hidden">
               <div className="h-10 flex items-center justify-center shrink-0"><ZoomIn size={14} className="text-white/60" /></div>
               <div className="flex-1 relative w-full flex justify-center my-1 overflow-hidden">
                  <input 
                    type="range" min="1" max="4" step="0.1" value={scale} 
                    onChange={(e) => { const s = parseFloat(e.currentTarget.value); setScale(s); if(s===1) setOffset({x:0,y:0}); }} 
                    className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer z-20" 
                    style={{ WebkitAppearance: 'slider-vertical' } as any} 
                  />
                  <div className="w-1 h-full bg-[#0055ff]/30 rounded-full" />
               </div>
            </div>
          </div>

          <button onClick={() => { setTool('eraser'); playSfx('click'); }} className={`w-full aspect-square rounded-2xl flex items-center justify-center shrink-0 border border-white/10 transition-all ${tool === 'eraser' ? 'bg-white text-zinc-900 shadow-xl scale-110' : 'bg-white/5 opacity-40 hover:opacity-100'}`}><Eraser size={20}/></button>
          <button onClick={() => { setTool('pan'); playSfx('click'); }} className={`w-full aspect-square rounded-2xl flex items-center justify-center shrink-0 border border-white/10 transition-all ${tool === 'pan' ? 'bg-[#0055ff] text-white shadow-lg scale-110' : 'bg-white/5 opacity-40 hover:opacity-100'}`}><Move size={20}/></button>
          <button onClick={handleDownload} className="w-full aspect-square bg-white text-zinc-900 rounded-2xl flex items-center justify-center shadow-xl shrink-0 active:scale-95 transition-transform"><Download size={20} /></button>
        </motion.div>
      )}

      {/* POTWIERDZENIE WYJŚCIA */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-1200 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 text-center touch-auto">
             <div className="bg-zinc-900 border border-white/10 p-8 rounded-[3rem] max-w-sm w-full shadow-2xl text-white">
              <h3 className="text-xl font-black uppercase italic mb-8">Zakończyć kolorowanie?</h3>
              <div className="flex gap-3">
                <button onClick={() => setShowExitConfirm(false)} className="flex-1 py-4 bg-white/5 rounded-2xl font-black uppercase text-[10px] active:scale-95 transition-transform">Wróć</button>
                <button onClick={onClose} className="flex-1 py-4 bg-[#BF2024] rounded-2xl font-black uppercase text-[10px] active:scale-95 transition-transform">Wyjdź</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}