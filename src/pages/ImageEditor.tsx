import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload, Download, Undo2, Redo2, Crop, Eraser, Pen,
  Square, Circle, Type, Pipette, Minus, Plus, RefreshCw,
  Trash2, Image as ImageIcon, ZoomIn, ZoomOut, Layers, Sliders
} from 'lucide-react';

type Tool = 'select' | 'brush' | 'eraser' | 'fill' | 'crop' | 'text' | 'rect' | 'ellipse' | 'eyedropper' | 'bgremove';

interface Filter {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  sepia: number;
  invert: boolean;
}

const DEFAULT_FILTERS: Filter = {
  brightness: 100, contrast: 100, saturation: 100, hue: 0, blur: 0, sepia: 0, invert: false
};

function getCanvas(ref: React.RefObject<HTMLCanvasElement>) {
  return ref.current?.getContext('2d')!;
}

export default function ImageEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [tool, setTool] = useState<Tool>('brush');
  const [color, setColor] = useState('#FF6B00');
  const [brushSize, setBrushSize] = useState(12);
  const [opacity, setOpacity] = useState(100);
  const [bgTolerance, setBgTolerance] = useState(30);
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);
  const [hasImage, setHasImage] = useState(false);
  const [filters, setFilters] = useState<Filter>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [fontSize, setFontSize] = useState(24);
  const [textInput, setTextInput] = useState('');
  const [textBold, setTextBold] = useState(false);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const cropStart = useRef({ x: 0, y: 0 });
  const baseImageData = useRef<ImageData | null>(null);

  // Save snapshot for undo
  function saveSnapshot() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack(prev => [...prev.slice(-19), snapshot]);
    setRedoStack([]);
  }

  function undo() {
    if (!undoStack.length) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(r => [...r, current]);
    setUndoStack(u => u.slice(0, -1));
    ctx.putImageData(prev, 0, 0);
  }

  function redo() {
    if (!redoStack.length) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const next = redoStack[redoStack.length - 1];
    setUndoStack(u => [...u, current]);
    setRedoStack(r => r.slice(0, -1));
    ctx.putImageData(next, 0, 0);
  }

  function loadImage(file: File) {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      const maxW = 900, maxH = 600;
      let w = img.width, h = img.height;
      if (w > maxW) { h = (h * maxW) / w; w = maxW; }
      if (h > maxH) { w = (w * maxH) / h; h = maxH; }
      canvas.width = Math.round(w);
      canvas.height = Math.round(h);
      const overlay = overlayRef.current!;
      overlay.width = canvas.width;
      overlay.height = canvas.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setHasImage(true);
      setUndoStack([]);
      setRedoStack([]);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  function getPos(e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!hasImage) return;
    const pos = getPos(e);
    isDrawing.current = true;
    lastPos.current = pos;
    cropStart.current = pos;

    if (tool === 'crop' || tool === 'rect' || tool === 'ellipse') {
      baseImageData.current = canvasRef.current!.getContext('2d')!.getImageData(
        0, 0, canvasRef.current!.width, canvasRef.current!.height
      );
    }

    if (tool === 'fill') {
      saveSnapshot();
      floodFill(Math.round(pos.x), Math.round(pos.y));
    } else if (tool === 'bgremove') {
      saveSnapshot();
      removeBackground(Math.round(pos.x), Math.round(pos.y));
    } else if (tool === 'eyedropper') {
      const ctx = canvasRef.current!.getContext('2d')!;
      const px = ctx.getImageData(Math.round(pos.x), Math.round(pos.y), 1, 1).data;
      const hex = '#' + [px[0], px[1], px[2]].map(v => v.toString(16).padStart(2, '0')).join('');
      setColor(hex);
      setTool('brush');
    } else if (tool === 'text' && textInput) {
      saveSnapshot();
      const ctx = canvasRef.current!.getContext('2d')!;
      ctx.save();
      ctx.font = `${textBold ? 'bold' : ''} ${fontSize}px Rajdhani, sans-serif`;
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity / 100;
      ctx.fillText(textInput, pos.x, pos.y);
      ctx.restore();
    }
  }

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing.current || !hasImage) return;
    const pos = getPos(e);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    if (tool === 'brush') {
      ctx.save();
      ctx.globalAlpha = opacity / 100;
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.restore();
    } else if (tool === 'eraser') {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = brushSize * 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.restore();
    } else if (tool === 'rect' && baseImageData.current) {
      ctx.putImageData(baseImageData.current, 0, 0);
      const oc = overlayRef.current!.getContext('2d')!;
      oc.clearRect(0, 0, canvas.width, canvas.height);
      oc.save();
      oc.strokeStyle = color;
      oc.lineWidth = brushSize;
      oc.globalAlpha = opacity / 100;
      oc.strokeRect(
        Math.min(cropStart.current.x, pos.x),
        Math.min(cropStart.current.y, pos.y),
        Math.abs(pos.x - cropStart.current.x),
        Math.abs(pos.y - cropStart.current.y)
      );
      oc.restore();
    } else if (tool === 'ellipse' && baseImageData.current) {
      ctx.putImageData(baseImageData.current, 0, 0);
      const oc = overlayRef.current!.getContext('2d')!;
      oc.clearRect(0, 0, canvas.width, canvas.height);
      oc.save();
      oc.strokeStyle = color;
      oc.lineWidth = brushSize;
      oc.globalAlpha = opacity / 100;
      oc.beginPath();
      const cx = (cropStart.current.x + pos.x) / 2;
      const cy = (cropStart.current.y + pos.y) / 2;
      oc.ellipse(cx, cy, Math.abs(pos.x - cropStart.current.x) / 2, Math.abs(pos.y - cropStart.current.y) / 2, 0, 0, Math.PI * 2);
      oc.stroke();
      oc.restore();
    } else if (tool === 'crop') {
      const oc = overlayRef.current!.getContext('2d')!;
      oc.clearRect(0, 0, canvas.width, canvas.height);
      oc.save();
      oc.strokeStyle = '#fff';
      oc.lineWidth = 1;
      oc.setLineDash([5, 5]);
      oc.strokeRect(
        Math.min(cropStart.current.x, pos.x),
        Math.min(cropStart.current.y, pos.y),
        Math.abs(pos.x - cropStart.current.x),
        Math.abs(pos.y - cropStart.current.y)
      );
      oc.restore();
    }

    lastPos.current = pos;
  }

  function onMouseUp(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const pos = getPos(e);

    if (tool === 'brush' || tool === 'eraser') {
      saveSnapshot();
    } else if (tool === 'rect' || tool === 'ellipse') {
      const oc = overlayRef.current!.getContext('2d')!;
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      saveSnapshot();
      ctx.drawImage(overlayRef.current!, 0, 0);
      oc.clearRect(0, 0, canvas.width, canvas.height);
    } else if (tool === 'crop') {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      const oc = overlayRef.current!.getContext('2d')!;
      oc.clearRect(0, 0, canvas.width, canvas.height);

      const x = Math.min(cropStart.current.x, pos.x);
      const y = Math.min(cropStart.current.y, pos.y);
      const w = Math.abs(pos.x - cropStart.current.x);
      const h = Math.abs(pos.y - cropStart.current.y);
      if (w < 5 || h < 5) return;

      saveSnapshot();
      const imgData = ctx.getImageData(x, y, w, h);
      canvas.width = w;
      canvas.height = h;
      const overlay = overlayRef.current!;
      overlay.width = w;
      overlay.height = h;
      ctx.putImageData(imgData, 0, 0);
    }
  }

  function floodFill(startX: number, startY: number) {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const idx = (startY * canvas.width + startX) * 4;
    const [sr, sg, sb, sa] = [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];

    const [fr, fg, fb] = [
      parseInt(color.slice(1, 3), 16),
      parseInt(color.slice(3, 5), 16),
      parseInt(color.slice(5, 7), 16),
    ];
    if (sr === fr && sg === fg && sb === fb) return;

    const tol = bgTolerance;
    function colorMatch(i: number) {
      return Math.abs(data[i] - sr) <= tol &&
        Math.abs(data[i + 1] - sg) <= tol &&
        Math.abs(data[i + 2] - sb) <= tol &&
        Math.abs(data[i + 3] - sa) <= 50;
    }

    const stack = [[startX, startY]];
    const visited = new Uint8Array(canvas.width * canvas.height);

    while (stack.length) {
      const [cx, cy] = stack.pop()!;
      if (cx < 0 || cx >= canvas.width || cy < 0 || cy >= canvas.height) continue;
      const pi = cy * canvas.width + cx;
      if (visited[pi]) continue;
      visited[pi] = 1;
      const ci = pi * 4;
      if (!colorMatch(ci)) continue;
      data[ci] = fr; data[ci + 1] = fg; data[ci + 2] = fb; data[ci + 3] = Math.round(opacity / 100 * 255);
      stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }
    ctx.putImageData(imgData, 0, 0);
  }

  function removeBackground(startX: number, startY: number) {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const idx = (startY * canvas.width + startX) * 4;
    const [sr, sg, sb] = [data[idx], data[idx + 1], data[idx + 2]];
    const tol = bgTolerance;

    function isBackground(i: number) {
      return Math.abs(data[i] - sr) <= tol &&
        Math.abs(data[i + 1] - sg) <= tol &&
        Math.abs(data[i + 2] - sb) <= tol;
    }

    const stack = [[startX, startY]];
    const visited = new Uint8Array(canvas.width * canvas.height);

    while (stack.length) {
      const [cx, cy] = stack.pop()!;
      if (cx < 0 || cx >= canvas.width || cy < 0 || cy >= canvas.height) continue;
      const pi = cy * canvas.width + cx;
      if (visited[pi]) continue;
      visited[pi] = 1;
      if (!isBackground(pi * 4)) continue;
      data[pi * 4 + 3] = 0;
      stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }
    ctx.putImageData(imgData, 0, 0);
  }

  function applyFilters() {
    const canvas = canvasRef.current!;
    if (!hasImage || !canvas) return;
    const ctx = canvas.getContext('2d')!;
    // Re-read base data and apply CSS filter via offscreen approach
    saveSnapshot();
    const tmp = document.createElement('canvas');
    tmp.width = canvas.width;
    tmp.height = canvas.height;
    const tc = tmp.getContext('2d')!;
    tc.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) hue-rotate(${filters.hue}deg) blur(${filters.blur}px) sepia(${filters.sepia}%) ${filters.invert ? 'invert(1)' : ''}`;
    tc.drawImage(canvas, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tmp, 0, 0);
  }

  function downloadImage() {
    const canvas = canvasRef.current!;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edited_image.png';
    a.click();
  }

  function clearCanvas() {
    if (!hasImage) return;
    saveSnapshot();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  const TOOLS: Array<{ id: Tool; icon: React.ElementType; label: string; color?: string }> = [
    { id: 'brush', icon: Pen, label: 'قلم' },
    { id: 'eraser', icon: Eraser, label: 'پاک‌کن' },
    { id: 'fill', icon: Layers, label: 'پر کردن' },
    { id: 'rect', icon: Square, label: 'مستطیل' },
    { id: 'ellipse', icon: Circle, label: 'بیضی' },
    { id: 'text', icon: Type, label: 'متن' },
    { id: 'eyedropper', icon: Pipette, label: 'رنگ‌گیر' },
    { id: 'bgremove', icon: Trash2, label: 'حذف پس‌زمینه', color: 'text-red-400' },
    { id: 'crop', icon: Crop, label: 'برش' },
  ];

  const filterStyle = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) hue-rotate(${filters.hue}deg) blur(${filters.blur}px) sepia(${filters.sepia}%) ${filters.invert ? 'invert(1)' : ''}`;

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] min-h-[600px] bg-dark-400 rounded-xl overflow-hidden border border-dark-50">
      {/* Top toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-dark-300 border-b border-dark-50 shrink-0 flex-wrap">
        <button onClick={() => fileRef.current?.click()} className="btn-orange flex items-center gap-1.5 text-xs py-2">
          <Upload size={13} /> باز کردن
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={e => e.target.files?.[0] && loadImage(e.target.files[0])} className="hidden" />

        <div className="w-px h-6 bg-dark-50" />

        <button onClick={undo} disabled={!undoStack.length} className="p-2 rounded-lg border border-dark-50 text-gray-400 hover:text-white disabled:opacity-30 transition-colors">
          <Undo2 size={14} />
        </button>
        <button onClick={redo} disabled={!redoStack.length} className="p-2 rounded-lg border border-dark-50 text-gray-400 hover:text-white disabled:opacity-30 transition-colors">
          <Redo2 size={14} />
        </button>

        <div className="w-px h-6 bg-dark-50" />

        <button onClick={() => setShowFilters(f => !f)} className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-all ${showFilters ? 'bg-orange-500/15 border-orange-500/40 text-orange-400' : 'border-dark-50 text-gray-400 hover:text-white'}`}>
          <Sliders size={13} /> فیلترها
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-1 text-xs text-gray-400 font-rajdhani">
          <button onClick={() => setZoom(z => Math.max(25, z - 25))} className="p-1.5 hover:text-white transition-colors"><ZoomOut size={14} /></button>
          <span className="w-12 text-center">{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(200, z + 25))} className="p-1.5 hover:text-white transition-colors"><ZoomIn size={14} /></button>
        </div>

        <button onClick={downloadImage} disabled={!hasImage} className="btn-orange flex items-center gap-1.5 text-xs py-2 disabled:opacity-40">
          <Download size={13} /> دانلود PNG
        </button>
      </div>

      {/* Filters bar */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 px-4 py-3 bg-dark-200 border-b border-dark-50 shrink-0">
          {[
            { key: 'brightness', label: 'روشنایی', min: 0, max: 200, def: 100 },
            { key: 'contrast', label: 'کنتراست', min: 0, max: 200, def: 100 },
            { key: 'saturation', label: 'اشباع رنگ', min: 0, max: 300, def: 100 },
            { key: 'hue', label: 'رنگ‌دهی', min: 0, max: 360, def: 0 },
            { key: 'blur', label: 'تاری', min: 0, max: 10, def: 0 },
            { key: 'sepia', label: 'سپیا', min: 0, max: 100, def: 0 },
          ].map(({ key, label, min, max, def }) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 font-rajdhani w-16 text-right">{label}</span>
              <input
                type="range" min={min} max={max}
                value={(filters as any)[key]}
                onChange={e => setFilters(f => ({ ...f, [key]: Number(e.target.value) }))}
                className="w-20 accent-orange-500"
              />
              <span className="text-[10px] text-orange-400 font-mono w-7">{(filters as any)[key]}</span>
              <button onClick={() => setFilters(f => ({ ...f, [key]: def }))} className="text-[10px] text-gray-600 hover:text-orange-400 transition-colors font-rajdhani">↺</button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-rajdhani">معکوس</span>
            <button onClick={() => setFilters(f => ({ ...f, invert: !f.invert }))} className={`w-8 h-4 rounded-full transition-colors ${filters.invert ? 'bg-orange-500' : 'bg-dark-50'}`}>
              <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${filters.invert ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <button onClick={applyFilters} disabled={!hasImage} className="btn-orange text-xs py-1.5 px-3 disabled:opacity-40 flex items-center gap-1.5">
            <RefreshCw size={11} /> اعمال
          </button>
          <button onClick={() => setFilters(DEFAULT_FILTERS)} className="btn-outline text-xs py-1.5 px-3">ریست فیلتر</button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left tools */}
        <div className="w-14 bg-dark-300 border-r border-dark-50 flex flex-col items-center py-3 gap-1.5 shrink-0 overflow-y-auto">
          {TOOLS.map(({ id, icon: Icon, label, color: c }) => (
            <button
              key={id}
              onClick={() => setTool(id)}
              title={label}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${tool === id ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' : 'border-transparent text-gray-500 hover:text-white hover:bg-dark-200'} ${c || ''}`}
            >
              <Icon size={16} />
            </button>
          ))}

          <div className="w-8 h-px bg-dark-50 my-1" />

          {/* Color picker */}
          <div className="relative">
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="w-10 h-10 rounded-xl cursor-pointer border-2 border-dark-50 bg-dark-200"
              title="رنگ"
            />
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 overflow-auto bg-dark-500 flex items-center justify-center relative" style={{ backgroundImage: 'linear-gradient(45deg,#1a1a1a 25%,transparent 25%),linear-gradient(-45deg,#1a1a1a 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#1a1a1a 75%),linear-gradient(-45deg,transparent 75%,#1a1a1a 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0,0 10px,10px -10px,-10px 0' }}>
          {!hasImage ? (
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-dark-50 hover:border-orange-500/50 rounded-2xl p-16 text-center cursor-pointer transition-all group"
            >
              <ImageIcon size={48} className="text-gray-700 group-hover:text-orange-500 mx-auto mb-4 transition-colors" />
              <p className="font-rajdhani font-bold text-gray-500 text-lg">تصویر را آپلود کنید</p>
              <p className="text-xs text-gray-600 mt-1 font-rajdhani">PNG, JPG, WEBP</p>
            </div>
          ) : (
            <div className="relative" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}>
              <canvas
                ref={canvasRef}
                className="block"
                style={{ cursor: tool === 'eyedropper' ? 'crosshair' : tool === 'brush' ? 'cell' : tool === 'eraser' ? 'not-allowed' : 'default', filter: filterStyle }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={() => { if (isDrawing.current) { isDrawing.current = false; } }}
              />
              <canvas
                ref={overlayRef}
                className="absolute inset-0 pointer-events-none"
                style={{ filter: filterStyle }}
              />
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="w-48 bg-dark-300 border-l border-dark-50 p-3 space-y-4 shrink-0 overflow-y-auto">
          {/* Brush size */}
          <div>
            <label className="text-[10px] text-gray-400 font-rajdhani block mb-1.5">اندازه قلم: <span className="text-orange-400">{brushSize}</span></label>
            <input type="range" min="1" max="80" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="w-full accent-orange-500" />
          </div>

          {/* Opacity */}
          <div>
            <label className="text-[10px] text-gray-400 font-rajdhani block mb-1.5">شفافیت: <span className="text-orange-400">{opacity}%</span></label>
            <input type="range" min="1" max="100" value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="w-full accent-orange-500" />
          </div>

          {/* BG tolerance */}
          {(tool === 'bgremove' || tool === 'fill') && (
            <div>
              <label className="text-[10px] text-gray-400 font-rajdhani block mb-1.5">تلرانس رنگ: <span className="text-orange-400">{bgTolerance}</span></label>
              <input type="range" min="1" max="100" value={bgTolerance} onChange={e => setBgTolerance(Number(e.target.value))} className="w-full accent-orange-500" />
            </div>
          )}

          {/* Text options */}
          {tool === 'text' && (
            <div className="space-y-2">
              <input
                type="text"
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                placeholder="متن..."
                className="input-dark text-xs"
              />
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-gray-400 font-rajdhani">سایز:</label>
                <input type="number" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="input-dark w-16 text-xs" min="8" max="200" />
              </div>
              <button
                onClick={() => setTextBold(b => !b)}
                className={`w-full py-1.5 text-xs font-rajdhani font-bold rounded-lg border transition-all ${textBold ? 'bg-orange-500/15 border-orange-500/30 text-orange-400' : 'border-dark-50 text-gray-400'}`}
              >
                <strong>B</strong> ضخیم
              </button>
            </div>
          )}

          {/* Quick colors */}
          <div>
            <label className="text-[10px] text-gray-400 font-rajdhani block mb-1.5">رنگ‌های سریع</label>
            <div className="grid grid-cols-5 gap-1">
              {['#FF6B00', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF', '#000000', '#888888'].map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-full aspect-square rounded border ${color === c ? 'border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Info */}
          {hasImage && canvasRef.current && (
            <div className="space-y-1 text-[10px] text-gray-500 font-rajdhani">
              <p>عرض: {canvasRef.current.width}px</p>
              <p>ارتفاع: {canvasRef.current.height}px</p>
              <p>undo: {undoStack.length}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
