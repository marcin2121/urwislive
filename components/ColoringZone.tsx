'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image'; // 🚀 IMPORT DLA OPTYMALIZACJI
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, Download, Smartphone, ChevronLeft, 
  Eraser, ZoomIn, Palette, Move, Pipette, Trash2, Eye, EyeOff,
  Wand2, Star, Sun, Heart, Smile, X, Plus, Hand, Paintbrush,
  Volume2, VolumeX, Volume1, Minus
} from 'lucide-react';

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
  
  // --- STANY ---
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

  // --- AUDIO ---
  const [ambientVolume, setAmbientVolume] = useState(15);
  const [lastVolume, setLastVolume] = useState(15); 
  const [isMuted, setIsMuted] = useState(false);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  // --- NAWIGACJA & WIZUALIZACJA ---
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isTemporaryPan, setIsTemporaryPan] = useState(false);
  
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState<number>(1);
  const [pinchCenter, setPinchCenter] = useState<{x: number, y: number} | null>(null);

  const [lastPoint, setLastPoint] = useState<{x: number, y: number} | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [dynamicCursor, setDynamicCursor] = useState('default');

  const [showBrushPreview, setShowBrushPreview] = useState(false);
  const brushPreviewTimer = useRef<NodeJS.Timeout | null>(null);

  // --- FUNKCJE POMOCNICZE ---
  const selectColor = useCallback((color: string) => {
    setSelectedColor(color);
    if (tool === 'eraser') setTool('brush');
    setShowColorPicker(false);
    setRecentColors(prev => [color, ...prev.filter(c => c !== color)].slice(0, 5));
  }, [tool]);

  const playSfx = useCallback((type: string) => { 
    const a = new Audio(`/sfx/${type}.mp3`); a.volume = 0.1; a.play().catch(() => {}); 
  }, []);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setUndoStack(prev => [...prev.slice(-20), dataUrl]);
  }, []);

  const undo = useCallback(() => {
    if (undoStack.length <= 1) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    const img = new window.Image();
    img.src = undoStack[undoStack.length - 2];
    img.onload = () => {
      ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, 1280, 720); ctx.drawImage(img, 0, 0);
      setUndoStack(prev => prev.slice(0, -1));
      playSfx('click');
    };
  }, [undoStack, playSfx]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, 1280, 720);
      saveState(); playSfx('trash');
    }
  }, [saveState, playSfx]);

  const toggleMute = () => setIsMuted(prev => !prev);
  
  const handleVolumeChange = (val: number) => {
    setAmbientVolume(val);
    if (isMuted && val > 0) setIsMuted(false); 
  };

  const getVolumeIcon = () => {
    if (isMuted || ambientVolume === 0) return <VolumeX size={16} className="text-zinc-500 shrink-0" />;
    if (ambientVolume < 50) return <Volume1 size={16} className="text-white/40 shrink-0" />;
    return <Volume2 size={16} className="text-green-400 shrink-0" />;
  };

  const handleBrushChange = (val: number) => {
    setLineWidth(val);
    setShowBrushPreview(true);
    if (brushPreviewTimer.current) clearTimeout(brushPreviewTimer.current);
    brushPreviewTimer.current = setTimeout(() => {
      setShowBrushPreview(false);
    }, 800); 
  };

  const handleZoom = (newScale: number, centerX: number = 0, centerY: number = 0) => {
    const minScale = 1;
    const maxScale = 5;
    const safeScale = Math.max(minScale, Math.min(maxScale, newScale));
    if (safeScale === scale) return;

    if (containerRef.current && safeScale > minScale) {
        const rect = containerRef.current.getBoundingClientRect();
        const dx = (centerX - rect.width / 2) - offset.x;
        const dy = (centerY - rect.height / 2) - offset.y;
        const ratio = safeScale / scale;
        const newOffsetX = offset.x - (dx * (ratio - 1));
        const newOffsetY = offset.y - (dy * (ratio - 1));

        setScale(safeScale);
        setOffset({ x: newOffsetX, y: newOffsetY });
    } else {
        setScale(safeScale);
        if (safeScale === minScale) setOffset({ x: 0, y: 0 }); 
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (zenMode) return;
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    handleZoom(scale + delta, e.clientX, e.clientY);
  };

  useEffect(() => {
    if (isTouchDevice) return; 
    const activeTool = isTemporaryPan ? 'pan' : tool;
    if (activeTool === 'brush' || activeTool === 'magic' || activeTool === 'eraser') {
      const cursorCanvas = document.createElement('canvas');
      const size = Math.max(4, lineWidth * scale); 
      cursorCanvas.width = size + 4; cursorCanvas.height = size + 4;
      const ctx = cursorCanvas.getContext('2d');
      if (ctx) {
        ctx.beginPath(); ctx.arc(cursorCanvas.width / 2, cursorCanvas.height / 2, size / 2, 0, Math.PI * 2);
        if (activeTool === 'eraser') {
          ctx.strokeStyle = 'black'; ctx.lineWidth = 1.5; ctx.stroke();
          ctx.strokeStyle = 'white'; ctx.lineWidth = 1; ctx.stroke();
        } else {
          ctx.fillStyle = activeTool === 'magic' ? 'rgba(255, 255, 255, 0.3)' : selectedColor;
          ctx.fill(); ctx.strokeStyle = 'white'; ctx.lineWidth = 1.5; ctx.stroke();
          ctx.strokeStyle = 'black'; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
      setDynamicCursor(`url(${cursorCanvas.toDataURL()}) ${cursorCanvas.width / 2} ${cursorCanvas.height / 2}, crosshair`);
    } else if (activeTool === 'pan') {
      setDynamicCursor(isPanning ? 'grabbing' : 'grab');
    } else { setDynamicCursor('crosshair'); }
  }, [tool, lineWidth, selectedColor, scale, isPanning, isTouchDevice, isTemporaryPan]);

  useEffect(() => {
    const audio = new Audio('/sfx/ambient.mp3');
    audio.loop = true; 
    audio.volume = isMuted ? 0 : (ambientVolume / 100); 
    audio.play().catch(() => {});
    ambientAudioRef.current = audio;
    return () => { audio.pause(); audio.src = ''; };
  }, []);

  useEffect(() => {
    if (ambientAudioRef.current) { 
      ambientAudioRef.current.volume = isMuted ? 0 : (ambientVolume / 100); 
    }
  }, [ambientVolume, isMuted]);

  useEffect(() => {
    trackEvent('coloring_start', { template_id: template.id, template_title: template.title });
    const checkOrientation = () => setIsPortrait(window.innerHeight > window.innerWidth);
    checkOrientation(); window.addEventListener('resize', checkOrientation);
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, 1280, 720);
        setUndoStack([canvas.toDataURL()]);
      }
    }

    const ghost = document.createElement('canvas');
    ghost.width = 1280; ghost.height = 720;
    const gCtx = ghost.getContext('2d', { willReadFrequently: true });
    if (gCtx) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = template.src;
      img.onload = () => {
        gCtx.fillStyle = '#FFFFFF'; gCtx.fillRect(0, 0, 1280, 720);
        gCtx.drawImage(img, 0, 0, 1280, 720);
        ghostCanvasRef.current = ghost;
      };
    }
    return () => window.removeEventListener('resize', checkOrientation);
  }, [template]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1280; exportCanvas.height = 720;
    const eCtx = exportCanvas.getContext('2d')!;
    eCtx.drawImage(canvas, 0, 0);
    const img = new window.Image();
    img.src = template.src;
    img.onload = () => {
      eCtx.globalCompositeOperation = 'multiply'; eCtx.drawImage(img, 0, 0, 1280, 720);
      const link = document.createElement('a');
      link.download = `urwis-art-${template.id}.png`; link.href = exportCanvas.toDataURL();
      link.click(); playSfx('success');
    };
  };

  const getPos = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current; if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: (clientX - rect.left) * (1280 / rect.width), y: (clientY - rect.top) * (720 / rect.height) };
  };

  const pickColorRealTime = (pos: {x: number, y: number}) => {
    const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true });
    const gCtx = ghostCanvasRef.current?.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    try {
      const uPixel = ctx.getImageData(Math.floor(pos.x), Math.floor(pos.y), 1, 1).data;
      let r = uPixel[0], g = uPixel[1], b = uPixel[2];
      if (gCtx) { 
        const tPixel = gCtx.getImageData(Math.floor(pos.x), Math.floor(pos.y), 1, 1).data; 
        r = Math.floor((r * tPixel[0]) / 255); g = Math.floor((g * tPixel[1]) / 255); b = Math.floor((b * tPixel[2]) / 255); 
      }
      setSelectedColor(`#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`);
    } catch (e) {}
  };

  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    return Math.sqrt(Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2));
  };
  const getCenter = (touch1: React.Touch, touch2: React.Touch) => {
    return { x: (touch1.clientX + touch2.clientX) / 2, y: (touch1.clientY + touch2.clientY) / 2 };
  };

  const handleStart = (e: any) => {
    if (e.touches && e.touches.length === 2) {
      setIsDrawing(false); setIsPanning(true); setIsTemporaryPan(true);
      const dist = getDistance(e.touches[0], e.touches[1]);
      const center = getCenter(e.touches[0], e.touches[1]);
      setInitialPinchDistance(dist); setInitialScale(scale); setPinchCenter(center);
      setPanStart({ x: center.x - offset.x, y: center.y - offset.y });
      return;
    }

    if (e.button === 1) { 
      e.preventDefault(); setIsTemporaryPan(true); setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      return;
    }

    const cx = e.touches ? e.touches[0].clientX : e.clientX; 
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    setMousePos({ x: cx, y: cy });
    
    const pos = getPos(cx, cy);
    if (tool === 'stamp') {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.fillStyle = selectedColor; ctx.font = `${lineWidth * 4}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const glyphs: Record<string, string> = { star: '⭐', sun: '☀️', heart: '❤️', urwis: '😊' };
        ctx.fillText(glyphs[selectedStamp.id] || '?', pos.x, pos.y);
        saveState(); playSfx('success');
      }
      return;
    }
    if (tool === 'picker') { setIsDrawing(true); pickColorRealTime(pos); return; }
    if (tool === 'pan') {
      setIsPanning(true); setPanStart({ x: cx - offset.x, y: cy - offset.y });
    } else {
      setIsDrawing(true); setLastPoint(pos);
      const ctx = canvasRef.current?.getContext('2d'); ctx?.beginPath(); ctx?.moveTo(pos.x, pos.y);
      playSfx(tool === 'eraser' ? 'erase' : 'paint');
    }
  };

  const handleMove = (e: any) => {
    if (e.touches && e.touches.length === 2 && initialPinchDistance !== null && pinchCenter) {
      e.preventDefault(); 
      const dist = getDistance(e.touches[0], e.touches[1]);
      const center = getCenter(e.touches[0], e.touches[1]);
      const scaleChange = dist / initialPinchDistance;
      const newScale = Math.max(1, Math.min(5, initialScale * scaleChange));
      setScale(newScale);

      if (containerRef.current) {
        const limitX = (containerRef.current.getBoundingClientRect().width * newScale - containerRef.current.getBoundingClientRect().width) / 2; 
        const limitY = (containerRef.current.getBoundingClientRect().height * newScale - containerRef.current.getBoundingClientRect().height) / 2;
        setOffset({ 
          x: Math.max(-limitX, Math.min(limitX, center.x - panStart.x)), 
          y: Math.max(-limitY, Math.min(limitY, center.y - panStart.y)) 
        });
      }
      return;
    }

    const cx = e.touches ? e.touches[0].clientX : e.clientX; 
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    setMousePos({ x: cx, y: cy });
    const pos = getPos(cx, cy);
    const activeTool = isTemporaryPan ? 'pan' : tool;
    
    if (activeTool === 'picker' && isDrawing) { pickColorRealTime(pos); return; }
    if (isPanning && activeTool === 'pan') {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const lx = (rect.width * scale - rect.width) / 2; const ly = (rect.height * scale - rect.height) / 2;
        setOffset({ x: Math.max(-lx, Math.min(lx, cx - panStart.x)), y: Math.max(-ly, Math.min(ly, cy - panStart.y)) });
      }
      return;
    }
    if (!isDrawing || !lastPoint || isTemporaryPan || (e.touches && e.touches.length > 1)) return;
    
    const ctx = canvasRef.current?.getContext('2d'); if (!ctx) return;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = lineWidth;
    if (tool === 'magic') {
      rainbowHue.current = (rainbowHue.current + 5) % 360;
      ctx.strokeStyle = `hsl(${rainbowHue.current}, 100%, 50%)`;
    } else {
      ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : selectedColor;
    }
    ctx.beginPath(); ctx.moveTo(lastPoint.x, lastPoint.y); ctx.lineTo(pos.x, pos.y); ctx.stroke();
    setLastPoint(pos);
  };

  const handleEnd = () => { 
    setInitialPinchDistance(null); setPinchCenter(null);
    if (isTemporaryPan) { setIsTemporaryPan(false); setIsPanning(false); return; }
    if (tool === 'picker' && isDrawing) { setTool('brush'); playSfx('click'); }
    if (isDrawing && tool !== 'picker') saveState();
    setIsDrawing(false); setIsPanning(false); setLastPoint(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo]);

  const showCustomCursorIcon = !isTouchDevice && !isTemporaryPan && (tool === 'picker' || tool === 'stamp');

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 overflow-hidden touch-none flex flex-row p-2 gap-2 safe-p text-white font-sans">
      
      {/* 📱 BLOKADA ORIENTACJI */}
      <AnimatePresence>
        {isTouchDevice && isPortrait && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[5000] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6 touch-none">
            <motion.div animate={{ rotate: 90 }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-20 h-20 bg-white/10 border-2 border-white/30 rounded-3xl mb-6 flex items-center justify-center">
              <Smartphone size={32} className="text-white" />
            </motion.div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2">Obróć telefon</h2>
            <p className="text-zinc-400 font-bold uppercase text-[11px] tracking-widest max-w-[250px]">Do rysowania potrzebujemy więcej miejsca!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CUSTOM CURSOR UI */}
      <AnimatePresence>
        {showCustomCursorIcon && (
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1, x: mousePos.x - 20, y: mousePos.y - 60 }} exit={{ scale: 0, opacity: 0 }} className="fixed top-0 left-0 z-[2000] pointer-events-none">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-md border-2 border-white/50 bg-zinc-900/80">
              {tool === 'picker' ? <Pipette size={14} className="text-white" /> : <selectedStamp.icon size={14} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL PALETY */}
      <AnimatePresence>
        {showColorPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[1100] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 lg:hidden">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-zinc-900 border border-white/10 p-6 rounded-[2.5rem] max-w-sm w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black uppercase italic tracking-tighter text-white">Paleta Urwisa</h3>
                <button onClick={() => setShowColorPicker(false)} aria-label="Zamknij paletę kolorów" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <X size={20}/>
                </button>
              </div>
              <div className="grid grid-cols-6 gap-3 mb-8">
                {PRESET_PALETTE.map(c => (
                  <button key={c} onClick={() => selectColor(c)} aria-label={`Wybierz kolor ${c}`} className={`aspect-square rounded-full border-2 ${selectedColor === c ? 'border-white scale-110 shadow-lg' : 'border-white/10'}`} style={{ backgroundColor: c }} />
                ))}
                <label className="aspect-square rounded-full border-2 border-dashed border-white/20 flex items-center justify-center relative bg-white/5" aria-label="Wybierz własny kolor">
                  <input type="color" className="absolute inset-0 opacity-0" onInput={(e) => setSelectedColor(e.currentTarget.value)} onChange={(e) => selectColor(e.currentTarget.value)} />
                  <Plus size={16} />
                </label>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setTool('magic'); setShowColorPicker(false); }} className="flex-1 py-4 bg-linear-to-r from-red-500 to-blue-500 rounded-2xl font-black uppercase text-xs">Tęcza ✨</button>
                <button onClick={() => setShowColorPicker(false)} className="px-8 py-4 bg-white text-zinc-900 rounded-2xl font-black uppercase text-xs">OK</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT PANEL */}
      {!zenMode && (
        <motion.div initial={{ x: -100 }} animate={{ x: 0 }} className="w-14 lg:w-72 shrink-0 flex flex-col gap-2 lg:gap-8 overflow-y-auto py-1 lg:py-4 lg:px-4 bg-zinc-950 lg:bg-transparent border-r border-white/5 z-40 scrollbar-hide touch-pan-y">
          <button onClick={() => setShowExitConfirm(true)} aria-label="Wróć do wyboru kolorowanek" className="w-full lg:py-4 lg:px-5 bg-white/10 rounded-2xl flex items-center justify-center lg:justify-start border border-white/20 hover:bg-red-600 transition-colors group shrink-0 aspect-square lg:aspect-auto">
            <ChevronLeft size={20} /><span className="hidden lg:block ml-3 font-black uppercase text-xs">Wróć</span>
          </button>
          
          <div className="flex lg:hidden flex-col gap-2 shrink-0">
            <button 
              onClick={() => { if(['brush','magic','picker'].includes(tool)) setShowColorPicker(true); else setTool('brush'); }} 
              aria-label="Otwórz paletę kolorów"
              className={`w-full aspect-square rounded-2xl border-4 shadow-lg relative overflow-hidden transition-all flex items-center justify-center ${tool === 'brush' || tool === 'magic' || tool === 'picker' ? 'border-white scale-110' : 'border-white/30'}`} 
              style={{ backgroundColor: tool === 'magic' ? 'transparent' : selectedColor }}
            >
              {tool === 'magic' && <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000)] animate-spin-slow" />}
              {tool === 'picker' && <Pipette size={20} className="text-white drop-shadow-md relative z-10" />}
              {(tool !== 'magic' && tool !== 'picker') && <Palette size={22} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] relative z-10 opacity-90" />}
            </button>

            <div className="flex flex-col gap-1 p-1 bg-white/5 rounded-2xl">
              {recentColors.map(c => <button key={`mob-${c}`} onClick={() => selectColor(c)} aria-label={`Wybierz poprzedni kolor ${c}`} className="w-full aspect-square rounded-full border border-white/10" style={{ backgroundColor: c }} />)}
            </div>
          </div>

          <div className="hidden lg:flex flex-col gap-8 shrink-0">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 block">Narzędzia</span>
              <div className="grid grid-cols-2 gap-3">
                {[ {id:'brush',n:'Pędzel',i:Paintbrush}, {id:'eraser',n:'Gumka',i:Eraser}, {id:'magic',n:'Tęcza',i:Wand2}, {id:'picker',n:'Próbnik',i:Pipette}, {id:'pan',n:'Rączka',i:Hand} ].map(t => (
                  <button key={t.id} onClick={() => setTool(t.id as any)} aria-label={`Wybierz narzędzie: ${t.n}`} className={`p-4 rounded-2xl flex flex-col items-center gap-2 border-2 ${tool===t.id ? 'bg-white text-zinc-900 border-white shadow-lg' : 'bg-white/5 text-white border-transparent'}`}>
                    <t.i size={24} /><span className="text-[10px] font-black uppercase">{t.n}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 block">Paleta</span>
              <div className="grid grid-cols-5 gap-2 bg-white/5 p-4 rounded-3xl border border-white/10">
                {PRESET_PALETTE.map(c => <button key={`desk-${c}`} onClick={() => selectColor(c)} aria-label={`Wybierz kolor ${c}`} className={`aspect-square rounded-full border-2 ${selectedColor===c?'border-white shadow-[0_0_10px_rgba(255,255,255,0.4)] scale-110':'border-white/10'}`} style={{ backgroundColor: c }} />)}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* CENTER WORKSPACE */}
      <div className="flex-1 flex flex-col items-center justify-center relative min-w-0" onWheel={handleWheel}>
        <div 
          ref={containerRef} onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd} onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd} 
          className="relative w-full max-h-full aspect-video bg-white shadow-2xl border-4 border-zinc-900 overflow-hidden" style={{ cursor: dynamicCursor }}
        >
          <motion.div animate={{ scale, x: offset.x, y: offset.y }} transition={{ type: 'spring', stiffness: 350, damping: 35 }} className="absolute inset-0 w-full h-full origin-center">
            <canvas ref={canvasRef} width={1280} height={720} className="absolute inset-0 w-full h-full pointer-events-none" />
            
            {/* 🚀 ZOPTYMALIZOWANY OVERLAY KONTURÓW */}
            <Image 
              src={template.src} 
              alt={`Kolorowanka: ${template.title}`}
              fill
              priority // Kluczowe dla Core Web Vitals (LCP)
              className="object-fill pointer-events-none" 
              style={{ mixBlendMode: 'multiply' }} 
            />
          </motion.div>

          <AnimatePresence>
            {showBrushPreview && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[6000] pointer-events-none flex items-center justify-center">
                    <div className="rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] border-[3px] border-white backdrop-blur-sm transition-all duration-75" style={{ width: lineWidth * scale, height: lineWidth * scale, backgroundColor: tool === 'eraser' ? '#FFFFFF' : tool === 'magic' ? 'rgba(255, 0, 0, 0.5)' : selectedColor }} />
                </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2">
            <button onClick={() => setZenMode(!zenMode)} aria-label={zenMode ? "Wyłącz tryb skupienia" : "Włącz tryb skupienia"} className="w-10 h-10 lg:w-12 lg:h-12 bg-zinc-900/80 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-md text-white">
              {zenMode ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      {!zenMode && (
        <motion.div initial={{ x: 100 }} animate={{ x: 0 }} className="w-14 lg:w-72 shrink-0 flex flex-col gap-2 lg:gap-8 py-1 lg:py-4 lg:px-4 bg-zinc-950 lg:bg-transparent border-l border-white/5 z-40">
          <div className="hidden lg:flex flex-col gap-8 h-full">
            <div className="flex flex-col gap-6 bg-white/5 p-6 rounded-3xl border border-white/10 text-white">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between uppercase text-[10px] font-black"><span>Grubość</span><span>{lineWidth}px</span></div>
                <input type="range" min="1" max="60" value={lineWidth} aria-label="Zmień grubość pędzla" onChange={(e) => handleBrushChange(parseInt(e.target.value))} className="w-full accent-blue-500 cursor-pointer" />
              </div>
              <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
                <div className="flex justify-between uppercase text-[10px] font-black"><span>Zoom</span><span>{scale.toFixed(1)}x</span></div>
                <input type="range" min="1" max="4" step="0.1" value={scale} aria-label="Zmień przybliżenie obrazka" onChange={(e) => setScale(parseFloat(e.target.value))} className="w-full accent-blue-500 cursor-pointer" />
              </div>
              <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
                <div className="flex justify-between uppercase text-[10px] font-black"><span>Muzyka</span><span>{isMuted ? 0 : ambientVolume}%</span></div>
                <div className="flex items-center gap-3">
                  <button onClick={toggleMute} aria-label={isMuted ? "Włącz muzykę" : "Wycisz muzykę"}>{getVolumeIcon()}</button>
                  <input type="range" min="0" max="100" value={isMuted ? 0 : ambientVolume} aria-label="Głośność muzyki w tle" onChange={(e) => handleVolumeChange(parseInt(e.target.value))} className="w-full accent-green-400 cursor-pointer" />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 pl-2">Pieczątki</span>
              <div className="grid grid-cols-4 gap-2 bg-white/5 p-3 rounded-2xl border border-white/10">
                {STAMP_LIST.map(s => <button key={s.id} onClick={() => { setSelectedStamp(s); setTool('stamp'); }} aria-label={`Użyj pieczątki ${s.id}`} className={`aspect-square rounded-xl flex items-center justify-center transition-all ${selectedStamp.id===s.id && tool==='stamp' ? 'bg-white text-zinc-900 shadow-md' : 'text-white hover:bg-white/10'}`}><s.icon size={20}/></button>)}
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <button onClick={undo} disabled={undoStack.length <= 1} aria-label="Cofnij ostatnią kreskę" className="py-4 bg-white/5 rounded-2xl flex flex-col items-center gap-2 border border-white/10 disabled:opacity-30 text-white"><RotateCcw size={20}/><span className="text-[10px] font-black uppercase">Cofnij</span></button>
                <button onPointerDown={() => setTrashHold(Date.now())} onPointerUp={() => { if(Date.now()-trashHold > 1000) clearCanvas(); setTrashHold(0); }} aria-label="Wyczyść całe płótno (przytrzymaj 1 sekundę)" className="py-4 bg-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 border border-white/10 relative overflow-hidden text-red-400"><Trash2 size={20}/><span className="text-[10px] font-black uppercase">Wyczyść</span>{trashHold > 0 && <motion.div initial={{width:0}} animate={{width:'100%'}} transition={{duration:1}} className="absolute bottom-0 left-0 h-1 bg-red-500" />}</button>
              </div>
              <button onClick={handleDownload} aria-label="Pobierz swój gotowy rysunek" className="w-full py-5 bg-[#0055ff] text-white hover:bg-blue-600 rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"><Download size={20} /> Pobierz</button>
            </div>
          </div>

          <div className="lg:hidden flex flex-col gap-2 h-full">
             <div className="flex-1 bg-white/5 rounded-4xl border border-white/10 flex flex-col items-center py-4 relative overflow-hidden">
                <input type="range" min="1" max="60" value={lineWidth} aria-label="Zmień grubość pędzla" onChange={(e) => handleBrushChange(parseInt(e.target.value))} className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer z-20" style={{ WebkitAppearance: 'slider-vertical' } as any} />
                <div className="w-1.5 h-full bg-white/10 rounded-full overflow-hidden flex flex-col justify-end pointer-events-none">
                    <div className="w-full bg-white transition-all duration-75" style={{ height: `${(lineWidth / 60) * 100}%` }} />
                </div>
             </div>
             
             <button onClick={() => { setTool('eraser'); playSfx('click'); }} aria-label="Użyj gumki" className={`w-full aspect-square rounded-2xl flex items-center justify-center shrink-0 border border-white/10 transition-all ${tool === 'eraser' ? 'bg-white text-zinc-900 shadow-xl scale-110' : 'bg-white/5 text-white opacity-40 hover:opacity-100'}`}><Eraser size={20}/></button>
             <button onClick={undo} disabled={undoStack.length <= 1} aria-label="Cofnij kreskę" className="w-full aspect-square rounded-2xl flex items-center justify-center shrink-0 border border-white/10 bg-white/5 text-white disabled:opacity-30"><RotateCcw size={18}/></button>
             <button onPointerDown={() => setTrashHold(Date.now())} onPointerUp={() => { if(Date.now() - trashHold > 1200) clearCanvas(); setTrashHold(0); }} aria-label="Wyczyść płótno (przytrzymaj)" className="w-full aspect-square bg-white/5 rounded-2xl flex items-center justify-center text-zinc-500 shrink-0 border border-white/10 relative overflow-hidden active:text-red-500 transition-colors">
              <Trash2 size={18} />
              {trashHold > 0 && <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.2 }} className="absolute bottom-0 left-0 h-1 bg-red-600 shadow-[0_0_10px_#ef4444]" />}
             </button>
             <button onClick={handleDownload} aria-label="Pobierz rysunek" className="w-full aspect-square bg-[#0055ff] text-white rounded-2xl flex items-center justify-center shrink-0"><Download size={20} /></button>
          </div>
        </motion.div>
      )}

      {/* MODALS */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 text-center">
             <div className="bg-zinc-900 border border-white/10 p-8 rounded-4xl max-w-sm w-full">
              <h3 className="text-xl font-black uppercase italic text-white mb-8">Zakończyć?</h3>
              <div className="flex gap-3">
                <button onClick={() => setShowExitConfirm(false)} className="flex-1 py-4 bg-white/5 rounded-2xl text-white font-black uppercase text-[10px]">Wróć</button>
                <button onClick={onClose} className="flex-1 py-4 bg-red-600 rounded-2xl text-white font-black uppercase text-[10px]">Wyjdź</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}