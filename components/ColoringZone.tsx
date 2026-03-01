'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, Download, Smartphone, ChevronLeft, 
  Eraser, Palette, Pipette, Trash2, Eye, EyeOff,
  Wand2, Star, Sun, Heart, Smile, X, Plus, Minus, Hand, Paintbrush,
  Volume2, VolumeX, Volume1, ChevronRight, PaintBucket, Printer
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

const PRESET_PALETTE = ['#BF2024', '#EF4444', '#F97316', '#FACC15', '#22C55E', '#10B981', '#0055ff', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#745239', '#EC4899', '#F43F5E', '#71717A', '#000000', '#FFFFFF', '#FCCEAD'];
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
  const [tool, setTool] = useState<'brush' | 'magic' | 'eraser' | 'pan' | 'picker' | 'stamp' | 'fill'>('brush');
  const [selectedStamp, setSelectedStamp] = useState(STAMP_LIST[0]);
  
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showMobileSizePicker, setShowMobileSizePicker] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [zenMode, setZenMode] = useState(false);

  // --- AUDIO ---
  const [ambientVolume, setAmbientVolume] = useState(15);
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

  const [lastPoint, setLastPoint] = useState<{x: number, y: number} | null>(null);
  
  const [undoStack, setUndoStack] = useState<string[]>([]);
  
  // 🚀 ZMIANA: Poprawiona obsługa orientacji z opcją pominięcia
  const [isPortrait, setIsPortrait] = useState(false);
  const [forceDismissOrientation, setForceDismissOrientation] = useState(false);

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [dynamicCursor, setDynamicCursor] = useState('default');

  const [showBrushPreview, setShowBrushPreview] = useState(false);
  const brushPreviewTimer = useRef<NodeJS.Timeout | null>(null);

  // --- FUNKCJE POMOCNICZE ---
  const selectColor = useCallback((color: string) => {
    setSelectedColor(color);
    if (tool === 'eraser' || tool === 'picker') setTool('brush');
    setShowColorPicker(false);
    setRecentColors(prev => [color, ...prev.filter(c => c !== color)].slice(0, 5));
  }, [tool]);

  const playSfx = useCallback((type: string) => { 
    const a = new Audio(`/sfx/${type}.mp3`); a.volume = 0.1; a.play().catch(() => {}); 
  }, []);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setUndoStack(prev => [...prev.slice(-20), canvas.toDataURL()]);
  }, []);

  const undo = useCallback(() => {
    if (undoStack.length <= 1) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    const img = new window.Image();
    img.src = undoStack[undoStack.length - 2];
    img.onload = () => {
      ctx.globalCompositeOperation = 'source-over'; 
      ctx.clearRect(0, 0, 1280, 720); 
      ctx.drawImage(img, 0, 0);
      setUndoStack(prev => prev.slice(0, -1));
      playSfx('click');
    };
  }, [undoStack, playSfx]);

  const resetCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 1280, 720);
      setUndoStack([canvas.toDataURL()]);
      playSfx('erase');
    }
  }, [playSfx]);

  const toggleMute = () => setIsMuted(prev => !prev);
  
  const handleVolumeChange = (val: number) => {
    setAmbientVolume(val);
    if (isMuted && val > 0) setIsMuted(false); 
  };

  const getVolumeIcon = () => {
    if (isMuted || ambientVolume === 0) return <VolumeX size={16} className="text-zinc-500" />;
    if (ambientVolume < 50) return <Volume1 size={16} className="text-white/40" />;
    return <Volume2 size={16} className="text-green-400" />;
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
        setOffset({ x: offset.x - (dx * (ratio - 1)), y: offset.y - (dy * (ratio - 1)) });
        setScale(safeScale);
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

  // --- FLOOD FILL ALGORITHM ---
  const fillCanvas = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    const ghost = ghostCanvasRef.current;
    if (!canvas || !ghost) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const gCtx = ghost.getContext('2d', { willReadFrequently: true });
    if (!ctx || !gCtx) return;

    const width = canvas.width;
    const height = canvas.height;
    const startX = Math.floor(x);
    const startY = Math.floor(y);

    if (startX < 0 || startX >= width || startY < 0 || startY >= height) return;

    const imgData = ctx.getImageData(0, 0, width, height);
    const gData = gCtx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const ghostData = gData.data;

    const hexToRgb = (h: string) => {
        const int = parseInt(h.replace('#', ''), 16);
        return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
    };
    const [fR, fG, fB] = hexToRgb(selectedColor);

    const startPos = (startY * width + startX) * 4;
    const sR = data[startPos], sG = data[startPos+1], sB = data[startPos+2];

    if (ghostData[startPos] < 100 && ghostData[startPos+1] < 100 && ghostData[startPos+2] < 100) return;
    if (Math.abs(sR - fR) < 10 && Math.abs(sG - fG) < 10 && Math.abs(sB - fB) < 10) return;

    const stack = new Int32Array(width * height * 2);
    let ptr = 0;
    stack[ptr++] = startX;
    stack[ptr++] = startY;

    const visited = new Uint8Array(width * height);

    while (ptr > 0) {
        const currentY = stack[--ptr];
        const currentX = stack[--ptr];
        const idx = currentY * width + currentX;
        
        if (visited[idx]) continue;
        visited[idx] = 1;

        const p = idx * 4;
        
        if (ghostData[p] < 100 && ghostData[p+1] < 100 && ghostData[p+2] < 100) continue; 
        if (Math.abs(data[p] - sR) > 15 || Math.abs(data[p+1] - sG) > 15 || Math.abs(data[p+2] - sB) > 15) continue; 

        data[p] = fR; data[p+1] = fG; data[p+2] = fB; data[p+3] = 255;

        if (currentX > 0) { stack[ptr++] = currentX - 1; stack[ptr++] = currentY; }
        if (currentX < width - 1) { stack[ptr++] = currentX + 1; stack[ptr++] = currentY; }
        if (currentY > 0) { stack[ptr++] = currentX; stack[ptr++] = currentY - 1; }
        if (currentY < height - 1) { stack[ptr++] = currentX; stack[ptr++] = currentY + 1; }
    }
    
    ctx.putImageData(imgData, 0, 0);
    saveState();
    playSfx('paint');
  }, [selectedColor, saveState, playSfx]);

  const cursorCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- EFEKTY ---
  useEffect(() => {
    if (isTouchDevice) return; 
    const activeTool = isTemporaryPan ? 'pan' : tool;
    if (['brush', 'magic', 'eraser'].includes(activeTool)) {
      if (!cursorCanvasRef.current) {
        cursorCanvasRef.current = document.createElement('canvas');
      }
      const cursorCanvas = cursorCanvasRef.current;
      const size = Math.max(4, lineWidth * scale); 
      cursorCanvas.width = size + 4; cursorCanvas.height = size + 4;
      const ctx = cursorCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
        ctx.beginPath(); ctx.arc(cursorCanvas.width / 2, cursorCanvas.height / 2, size / 2, 0, Math.PI * 2);
        if (activeTool === 'eraser') {
          ctx.strokeStyle = 'black'; ctx.lineWidth = 1.5; ctx.stroke();
          ctx.strokeStyle = 'white'; ctx.lineWidth = 1; ctx.stroke();
        } else {
          ctx.fillStyle = activeTool === 'magic' ? 'rgba(255, 255, 255, 0.3)' : selectedColor;
          ctx.fill(); ctx.strokeStyle = 'white'; ctx.lineWidth = 1.5; ctx.stroke();
        }
      }
      setDynamicCursor(`url(${cursorCanvas.toDataURL()}) ${cursorCanvas.width / 2} ${cursorCanvas.height / 2}, crosshair`);
    } else if (activeTool === 'fill') {
      setDynamicCursor('crosshair');
    } else {
      setDynamicCursor(activeTool === 'pan' ? (isPanning ? 'grabbing' : 'grab') : 'crosshair');
    }
  }, [tool, lineWidth, selectedColor, scale, isPanning, isTouchDevice, isTemporaryPan]);

  // --- BLOKADA SCROLL'a POD SPODEM ---
  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    // Jeżeli mamy globalną klasę do ukrywania UI (NavBar itp), możemy jej użyć:
    document.body.classList.add('game-mode');
    return () => {
      document.body.classList.remove('overflow-hidden');
      document.body.classList.remove('game-mode');
    };
  }, []);

  useEffect(() => {
    const audio = new Audio('/sfx/ambient.mp3');
    audio.loop = true; 
    audio.volume = isMuted ? 0 : (ambientVolume / 100); 
    audio.play().catch(() => {});
    ambientAudioRef.current = audio;
    return () => { audio.pause(); audio.src = ''; };
  }, []);

  // Keyboard Shortcuts (Ctrl+Z)
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

  // 🚀 ZMIANA: Lepsza metoda wykrywania orientacji za pomocą matchMedia i EventListenera
  useEffect(() => {
    trackEvent('coloring_start', { template_id: template.id, template_title: template.title });
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);

    const mql = window.matchMedia('(orientation: portrait)');
    
    // Ustaw stan początkowy
    setIsPortrait(mql.matches);

    // Nasłuchiwanie zmian orientacji (to jest znacznie bardziej niezawodne na Androidzie niż resize)
    const handleOrientationChange = (e: MediaQueryListEvent) => {
        setIsPortrait(e.matches);
        // Jeśli obróciliśmy telefon prawidłowo do poziomu, możemy zresetować wymuszone ignorowanie
        if (!e.matches) {
            setForceDismissOrientation(false);
        }
    };

    if (mql.addEventListener) {
        mql.addEventListener('change', handleOrientationChange);
    } else {
        // Fallback dla bardzo starych przeglądarek
        mql.addListener(handleOrientationChange);
    }

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

    return () => {
        if (mql.removeEventListener) {
            mql.removeEventListener('change', handleOrientationChange);
        } else {
            mql.removeListener(handleOrientationChange);
        }
    };
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

  const handlePrint = () => {
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
      const dataUrl = exportCanvas.toDataURL('image/png');
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const logoUrl = `${window.location.origin}/logo.png`;
        printWindow.document.write(`
          <html>
            <head>
              <title>Wydrukuj Kolorowankę Urwisa</title>
              <style>
                body {
                  margin: 0;
                  padding: 20px;
                  display: flex;
                  flex-direction: column;
                  height: 100vh;
                  box-sizing: border-box;
                  font-family: sans-serif;
                }
                .img-container {
                  flex: 1;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 0;
                  margin-bottom: 20px;
                }
                .img-container img {
                  max-width: 100%;
                  max-height: 100%;
                  object-fit: contain;
                }
                .footer {
                  display: flex;
                  flex-direction: row;
                  align-items: flex-end;
                  height: 80px; 
                  border-top: 2px solid #eee;
                  padding-top: 10px;
                }
                .title-section {
                  width: 66.66%;
                  font-size: 24px;
                  font-weight: bold;
                  text-transform: uppercase;
                  color: #333;
                }
                .logo-section {
                  width: 33.33%;
                  display: flex;
                  flex-direction: row;
                  align-items: center;
                  justify-content: flex-end;
                  font-size: 18px;
                  font-weight: bold;
                  color: #666;
                  gap: 12px;
                }
                .logo-section img {
                  height: 40px;
                }
                @media print {
                  @page { margin: 0; size: landscape; }
                  body { margin: 0; padding: 10mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
              </style>
            </head>
            <body>
              <div class="img-container">
                <img src="${dataUrl}" onload="setTimeout(() => { window.print(); window.close(); }, 500);"/>
              </div>
              <div class="footer">
                <div class="title-section">${template.title}</div>
                <div class="logo-section">
                  <div>sklep-urwis.pl</div>
                  <img src="${logoUrl}" onerror="this.style.display='none'"/>
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        playSfx('success');
      }
    };
  };

  const getPos = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current; if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: (clientX - rect.left) * (1280 / rect.width), y: (clientY - rect.top) * (720 / rect.height) };
  };

  const handleStart = (e: any) => {
    if (e.touches && e.touches.length === 2) {
      setIsDrawing(false); setIsPanning(true); setIsTemporaryPan(true);
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      setInitialPinchDistance(dist); setInitialScale(scale);
      
      setPanStart({ 
        x: ((e.touches[0].clientX + e.touches[1].clientX) / 2) - offset.x, 
        y: ((e.touches[0].clientY + e.touches[1].clientY) / 2) - offset.y 
      });
      return;
    }
    const cx = e.touches ? e.touches[0].clientX : e.clientX; 
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const pos = getPos(cx, cy);
    
    if (tool === 'picker') {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            const pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data;
            if (pixel[3] > 0) {
                const hex = `#${[pixel[0], pixel[1], pixel[2]].map(x => x.toString(16).padStart(2, '0')).join('')}`;
                selectColor(hex);
            } else {
                selectColor('#FFFFFF');
            }
            playSfx('click');
        }
        return;
    }

    if (tool === 'pan' || e.button === 1) {
      setIsPanning(true); setPanStart({ x: cx - offset.x, y: cy - offset.y });
    } else if (tool === 'fill') {
      fillCanvas(pos.x, pos.y);
    } else {
      setIsDrawing(true); setLastPoint(pos);
      if (tool !== 'stamp') {
          playSfx(tool === 'eraser' ? 'erase' : 'paint');
      }
    }
  };

  const handleMove = (e: any) => {
    if (e.touches && e.touches.length === 2 && initialPinchDistance) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const newScale = Math.max(1, Math.min(5, initialScale * (dist / initialPinchDistance)));
      setScale(newScale);

      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      setOffset({ x: cx - panStart.x, y: cy - panStart.y });
      return;
    }
    const cx = e.touches ? e.touches[0].clientX : e.clientX; 
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const pos = getPos(cx, cy);
    if (isPanning) {
      setOffset({ x: cx - panStart.x, y: cy - panStart.y });
      return;
    }
    if (!isDrawing || !lastPoint) return;
    const ctx = canvasRef.current?.getContext('2d'); if (!ctx) return;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = lineWidth;
    if (tool === 'magic') {
      rainbowHue.current = (rainbowHue.current + 5) % 360;
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = `hsl(${rainbowHue.current}, 100%, 50%)`;
    } else {
      ctx.globalCompositeOperation = 'source-over'; 
      ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : selectedColor;
    }
    ctx.beginPath(); ctx.moveTo(lastPoint.x, lastPoint.y); ctx.lineTo(pos.x, pos.y); ctx.stroke();
    setLastPoint(pos);
  };

  const handleEnd = () => { 
    if (isDrawing) saveState();
    setIsDrawing(false); setIsPanning(false); setIsTemporaryPan(false); setLastPoint(null);
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-zinc-950 overflow-hidden touch-none select-none flex flex-row gap-2 text-white font-sans"
      style={{ 
        paddingTop: 'max(0.5rem, env(safe-area-inset-top))', 
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(0.5rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.5rem, env(safe-area-inset-right))' 
      }}
    >
      
      {/* 📱 BLOKADA ORIENTACJI */}
      <AnimatePresence>
        {isTouchDevice && isPortrait && !forceDismissOrientation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[5000] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6">
            
            {/* 🚀 ZMIANA: Przycisk pozwalający zamknąć komunikat, jeśli API zawiodło */}
            <button 
              onClick={() => {
                setForceDismissOrientation(true);
                trackEvent('coloring_orientation_bypassed');
              }}
              className="absolute top-6 right-6 p-4 text-zinc-400 hover:text-white border-none bg-transparent"
            >
              <X size={28} />
            </button>

            <motion.div animate={{ rotate: 90 }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-20 h-20 bg-white/10 border-2 border-white/30 rounded-3xl mb-6 flex items-center justify-center text-white">
              <Smartphone size={32} />
            </motion.div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Obróć telefon</h2>
            <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest max-w-[200px] mb-8">Do wygodnego rysowania potrzebujemy więcej miejsca poziomo!</p>
            
            <p className="text-zinc-600 font-bold uppercase text-[8px] tracking-widest mt-8">Jeśli obróciłeś i komunikat nie znika, kliknij krzyżyk w rogu.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT PANEL */}
      {!zenMode && (
        <motion.div initial={{ x: -100 }} animate={{ x: 0 }} className="w-14 lg:w-72 shrink-0 flex flex-col gap-2 overflow-y-auto py-1 bg-zinc-950 lg:bg-transparent border-r border-white/5 z-40 scrollbar-hide">
          <button onClick={() => setShowExitConfirm(true)} aria-label="Wróć" className="w-full aspect-square lg:aspect-auto lg:py-4 lg:px-5 bg-white/10 rounded-2xl flex items-center justify-center lg:justify-start border border-white/20 hover:bg-red-600 transition-colors cursor-pointer outline-none">
            <ChevronLeft size={20} /><span className="hidden lg:block ml-3 font-black uppercase text-xs">Wróć</span>
          </button>
          
          <div className="flex lg:hidden flex-col gap-2 mt-1">
            <button 
              onClick={() => setShowColorPicker(true)} 
              className={`w-full aspect-square rounded-2xl border-4 transition-all flex items-center justify-center border-white/30 cursor-pointer outline-none relative overflow-hidden`} 
              style={{ backgroundColor: tool === 'magic' ? 'transparent' : selectedColor }}
            >
              {tool === 'magic' ? <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000)] animate-spin-slow rounded-xl" /> : <Palette size={20} />}
            </button>
            <button onClick={() => setTool('brush')} className={`w-full aspect-square rounded-2xl flex items-center justify-center transition-all border cursor-pointer outline-none ${tool === 'brush' ? 'bg-white text-zinc-900 border-white scale-110 shadow-lg' : 'bg-white/5 border-white/20 text-white'}`}><Paintbrush size={20}/></button>
            <button onClick={() => setTool('fill')} className={`w-full aspect-square rounded-2xl flex items-center justify-center transition-all border cursor-pointer outline-none ${tool === 'fill' ? 'bg-white text-zinc-900 border-white scale-110 shadow-lg' : 'bg-white/5 border-white/20 text-white'}`}><PaintBucket size={20}/></button>
            <button onClick={() => setTool('picker')} className={`w-full aspect-square rounded-2xl flex items-center justify-center transition-all border cursor-pointer outline-none ${tool === 'picker' ? 'bg-white text-zinc-900 border-white scale-110 shadow-lg' : 'bg-white/5 border-white/20 text-white'}`}><Pipette size={20}/></button>
            <button onClick={() => setTool('pan')} className={`w-full aspect-square rounded-2xl flex items-center justify-center transition-all border cursor-pointer outline-none ${tool === 'pan' ? 'bg-white text-zinc-900 border-white scale-110 shadow-lg' : 'bg-white/5 border-white/20 text-white'}`}><Hand size={20}/></button>
          </div>

          <div className="hidden lg:flex flex-col gap-8 p-4">
             <div className="grid grid-cols-2 gap-3">
               {[ {id:'brush',n:'Pędzel',i:Paintbrush}, {id:'fill',n:'Wiadro',i:PaintBucket}, {id:'eraser',n:'Gumka',i:Eraser}, {id:'magic',n:'Tęcza',i:Wand2}, {id:'picker',n:'Pipeta',i:Pipette}, {id:'pan',n:'Rączka',i:Hand} ].map(t => (
                 <button key={t.id} onClick={() => setTool(t.id as any)} className={`p-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all cursor-pointer outline-none ${tool===t.id ? 'bg-white text-zinc-900 border-white shadow-lg' : 'bg-white/5 text-white border-transparent'}`}>
                   <t.i size={24} /><span className="text-[10px] font-black uppercase">{t.n}</span>
                 </button>
               ))}
             </div>
             
             <div className="grid grid-cols-6 gap-2 bg-white/5 px-4 pt-4 pb-2 rounded-t-3xl border border-white/10 border-b-0">
                {PRESET_PALETTE.map(c => <button key={c} onClick={() => selectColor(c)} className={`aspect-square rounded-full border-2 cursor-pointer outline-none ${selectedColor===c?'border-white scale-110 shadow-md':'border-white/10'}`} style={{ backgroundColor: c }} />)}
             </div>
             <label className="w-full py-4 mb-2 bg-white/10 rounded-b-3xl border border-white/10 flex items-center justify-center gap-2 font-black uppercase text-xs cursor-pointer outline-none hover:bg-white/20 transition-all relative overflow-hidden group">
               <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-[200%] h-[200%] -top-1/2 -left-1/2" onChange={(e) => selectColor(e.target.value)} />
               <Pipette size={18} className="group-hover:scale-110 transition-transform" /> Własny kolor
             </label>
          </div>
        </motion.div>
      )}

      {/* CENTER WORKSPACE */}
      <div className="flex-1 flex flex-col items-center justify-center relative min-w-0" onWheel={handleWheel}>
        <div 
          ref={containerRef} onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd} onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd} 
          className="relative w-full max-h-full aspect-video bg-white shadow-2xl border-4 border-zinc-900 overflow-hidden" style={{ cursor: dynamicCursor }}
        >
          <motion.div animate={{ scale, x: offset.x, y: offset.y }} className="absolute inset-0 w-full h-full origin-center">
            <canvas ref={canvasRef} width={1280} height={720} className="absolute inset-0 w-full h-full pointer-events-none" />
            <Image src={template.src} alt={template.title} fill priority draggable={false} className="object-fill pointer-events-none select-none" style={{ mixBlendMode: 'multiply' }} />
          </motion.div>

          <AnimatePresence>
            {showBrushPreview && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
                    <div className="rounded-full shadow-2xl border-4 border-white backdrop-blur-sm" style={{ width: lineWidth * scale, height: lineWidth * scale, backgroundColor: tool === 'eraser' ? '#FFFFFF' : selectedColor }} />
                </motion.div>
            )}
          </AnimatePresence>

          <button onClick={() => setZenMode(!zenMode)} className="absolute bottom-4 left-4 z-30 w-10 h-10 bg-zinc-900/80 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-md cursor-pointer outline-none">
            {zenMode ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>
      </div>

      {/* RIGHT PANEL - CUSTOM MOBILE SLIDER */}
      {!zenMode && (
        <motion.div initial={{ x: 100 }} animate={{ x: 0 }} className="w-14 lg:w-72 shrink-0 flex flex-col gap-2 py-1 bg-zinc-950 lg:bg-transparent border-l border-white/5 z-40">
          
          {/* MOBILE UI */}
          <div className="lg:hidden flex flex-col gap-2 h-full select-none">
             <div className="flex-1"></div>
             
             <button onClick={() => setShowMobileSizePicker(true)} className="w-full aspect-square bg-white/5 border border-white/20 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-lg cursor-pointer outline-none hover:bg-white/10 transition-colors">
                <div className="rounded-full bg-white mb-1 shadow-md transition-all duration-300" style={{ width: Math.min(24, Math.max(4, lineWidth/2)), height: Math.min(24, Math.max(4, lineWidth/2)) }} />
                <div className="text-[9px] font-black uppercase text-zinc-300">Rozmiar</div>
             </button>
             
             <button onClick={() => { setTool('eraser'); playSfx('click'); }} className={`w-full aspect-square rounded-2xl flex items-center justify-center shrink-0 border transition-all cursor-pointer outline-none ${tool === 'eraser' ? 'bg-white text-zinc-900 border-white shadow-xl scale-110' : 'bg-white/5 border-white/10 text-white'}`}><Eraser size={20}/></button>
             <button onClick={resetCanvas} className="w-full aspect-square rounded-2xl flex items-center justify-center shrink-0 border border-white/10 bg-white/5 text-white cursor-pointer outline-none hover:bg-red-600 transition-colors"><Trash2 size={20}/></button>
             <button onClick={undo} disabled={undoStack.length <= 1} className="w-full aspect-square rounded-2xl flex items-center justify-center shrink-0 border border-white/10 bg-white/5 text-white disabled:opacity-20 cursor-pointer outline-none hover:bg-white/20 transition-colors"><RotateCcw size={18}/></button>
             <button onClick={handlePrint} className="w-full aspect-square bg-[#0055ff] text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg active:scale-90 transition-transform cursor-pointer outline-none mb-1"><Printer size={20} /></button>
             <button onClick={handleDownload} className="w-full aspect-square bg-green-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg active:scale-90 transition-transform cursor-pointer outline-none"><Download size={20} /></button>
          </div>

          {/* DESKTOP UI */}
          <div className="hidden lg:flex flex-col gap-6 p-6 bg-white/5 rounded-3xl border border-white/10 h-full">
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase"><span>Rozmiar</span><span>{lineWidth}px</span></div>
                <input type="range" min="1" max="60" value={lineWidth} onChange={(e) => setLineWidth(parseInt(e.target.value))} className="w-full accent-[#0055ff]" />
              </div>
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex justify-between text-[10px] font-black uppercase"><span>Głośność</span><span>{isMuted ? 0 : ambientVolume}%</span></div>
                <div className="flex items-center gap-3">
                  <button onClick={toggleMute} className="cursor-pointer outline-none">{getVolumeIcon()}</button>
                  <input type="range" min="0" max="100" value={isMuted ? 0 : ambientVolume} onChange={(e) => handleVolumeChange(parseInt(e.target.value))} className="w-full accent-green-400" />
                </div>
              </div>
              <div className="mt-auto space-y-3">
                <button onClick={resetCanvas} className="w-full py-3 bg-white/10 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-xs cursor-pointer outline-none hover:bg-red-600 transition-colors"><Trash2 size={16}/> Urwis Zmywa farbę!</button>
                <button onClick={undo} disabled={undoStack.length <= 1} className="w-full py-3 bg-white/10 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-xs disabled:opacity-30 cursor-pointer outline-none hover:bg-white/20 transition-colors"><RotateCcw size={16}/> Cofnij <span className="text-[9px] opacity-50 font-normal ml-1">(Ctrl+Z)</span></button>
                <div className="flex gap-2 w-full">
                  <button onClick={handlePrint} className="flex-1 py-4 bg-[#0055ff] text-white rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-2 shadow-xl hover:bg-blue-600 transition-all cursor-pointer outline-none"><Printer size={18} /> Drukuj</button>
                  <button onClick={handleDownload} className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-2 shadow-xl hover:bg-green-600 transition-all cursor-pointer outline-none"><Download size={18} /> Zapisz</button>
                </div>
              </div>
          </div>
        </motion.div>
      )}

      {/* MODAL: EXIT */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 text-center">
             <div className="bg-zinc-900 border border-white/10 p-8 rounded-4xl max-w-sm w-full">
              <h3 className="text-xl font-black uppercase italic mb-8">Zakończyć?</h3>
              <div className="flex gap-3">
                <button onClick={() => setShowExitConfirm(false)} className="flex-1 py-4 bg-white/5 rounded-2xl font-black uppercase text-[10px] cursor-pointer outline-none">Wróć</button>
                <button onClick={onClose} className="flex-1 py-4 bg-red-600 rounded-2xl font-black uppercase text-[10px] cursor-pointer outline-none">Wyjdź</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: SIZE PICKER (Mobile) */}
      <AnimatePresence>
        {showMobileSizePicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[1100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 lg:hidden" onClick={() => setShowMobileSizePicker(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-zinc-900 border border-white/10 p-6 rounded-[2.5rem] w-full max-w-sm" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black uppercase italic tracking-tighter">Rozmiar Pędzla: {lineWidth}px</h3>
                <button onClick={() => setShowMobileSizePicker(false)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center cursor-pointer outline-none"><X size={20}/></button>
              </div>
              
              <div className="flex items-center gap-4 mb-8 bg-zinc-950 p-4 rounded-3xl border border-white/5">
                <button onClick={() => setLineWidth(Math.max(1, lineWidth - 1))} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0 text-white font-black hover:bg-white/10 active:scale-95 transition-all outline-none"><Minus size={20} /></button>
                <input type="range" min="1" max="60" value={lineWidth} onChange={(e) => setLineWidth(parseInt(e.target.value))} className="w-full accent-[#0055ff] h-8" />
                <button onClick={() => setLineWidth(Math.min(60, lineWidth + 1))} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0 text-white font-black hover:bg-white/10 active:scale-95 transition-all outline-none"><Plus size={20} /></button>
              </div>

              <div className="flex justify-between">
                 {[5, 15, 30, 45, 60].map(val => (
                   <button key={val} onClick={() => setLineWidth(val)} className={`w-12 h-12 rounded-full flex items-center justify-center border-2 cursor-pointer outline-none transition-all ${lineWidth === val ? 'border-[#0055ff] bg-[#0055ff]/10 scale-110' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                      <div className="rounded-full bg-white" style={{ width: Math.max(4, val/2.5), height: Math.max(4, val/2.5) }} />
                   </button>
                 ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: COLOR PICKER (Mobile) */}
      <AnimatePresence>
        {showColorPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[1100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 lg:hidden">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-zinc-900 border border-white/10 p-6 rounded-[2.5rem] max-w-sm w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black uppercase italic tracking-tighter">Paleta Urwisa</h3>
                <button onClick={() => setShowColorPicker(false)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center cursor-pointer outline-none"><X size={20}/></button>
              </div>
              <div className="grid grid-cols-6 gap-3 mb-4">
                {PRESET_PALETTE.map(c => <button key={c} onClick={() => selectColor(c)} className={`aspect-square rounded-full border-2 cursor-pointer outline-none ${selectedColor === c ? 'border-white scale-110 shadow-lg' : 'border-white/10'}`} style={{ backgroundColor: c }} />)}
              </div>
              
              <label className="w-full py-4 mb-3 bg-white/10 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-sm border border-white/20 shadow-lg cursor-pointer outline-none hover:bg-white/20 transition-all relative overflow-hidden">
                <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-[200%] h-[200%] -top-1/2 -left-1/2" onChange={(e) => selectColor(e.target.value)} />
                <Pipette size={20} /> WŁASNY KOLOR
              </label>

              <button onClick={() => { setTool('magic'); setShowColorPicker(false); }} className="w-full py-4 bg-linear-to-r from-red-500 to-blue-500 rounded-2xl font-black uppercase text-sm shadow-lg cursor-pointer outline-none flex justify-center items-center gap-2 hover:opacity-90 transition-opacity"><Wand2 size={20} /> TĘCZOWY PĘDZEL</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}