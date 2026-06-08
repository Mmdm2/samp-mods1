import { useState, useRef } from 'react';
import { Map, Upload, Download, Palette, RefreshCw, Info, CheckCircle } from 'lucide-react';

const COLOR_PRESETS = [
  { name: 'نارنجی گرم', hex: '#FF6B00' },
  { name: 'قرمز', hex: '#CC0000' },
  { name: 'آبی', hex: '#0055FF' },
  { name: 'سبز', hex: '#00AA44' },
  { name: 'طلایی', hex: '#FFD700' },
  { name: 'بنفش', hex: '#8800CC' },
  { name: 'سفید', hex: '#FFFFFF' },
  { name: 'سیاه', hex: '#000000' },
  { name: 'فیروزه‌ای', hex: '#00BCD4' },
  { name: 'صورتی', hex: '#FF1493' },
];

const BLEND_MODES = [
  { val: 'overlay', label: 'Overlay (ملایم)' },
  { val: 'multiply', label: 'Multiply (تیره‌تر)' },
  { val: 'screen', label: 'Screen (روشن‌تر)' },
  { val: 'color', label: 'Color (رنگ خالص)' },
  { val: 'hue', label: 'Hue (رنگ‌دهی)' },
];

interface MapImage {
  name: string;
  original: string;
  processed: string | null;
  index: number;
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 255, g: 100, b: 0 };
}

async function colorizeImage(dataUrl: string, hex: string, opacity: number, blendMode: string): Promise<string> {
  return new Promise(resolve => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;

      ctx.drawImage(img, 0, 0);

      const { r, g, b } = hexToRgb(hex);
      const alpha = opacity / 100;

      if (blendMode === 'color' || blendMode === 'hue' || blendMode === 'overlay' || blendMode === 'multiply' || blendMode === 'screen') {
        ctx.globalAlpha = alpha;
        ctx.globalCompositeOperation = blendMode as GlobalCompositeOperation;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }

      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}

export default function MapColorizer() {
  const [maps, setMaps] = useState<MapImage[]>([]);
  const [color, setColor] = useState('#FF6B00');
  const [opacity, setOpacity] = useState(40);
  const [blendMode, setBlendMode] = useState('overlay');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<File[]>([]);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const incoming = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, 144);
    const newMaps = incoming.map((f, i) => ({
      name: f.name,
      original: URL.createObjectURL(f),
      processed: null as string | null,
      index: maps.length + i,
    }));
    setMaps(prev => [...prev, ...newMaps]);
    filesRef.current = [...filesRef.current, ...incoming];
  }

  async function processAll() {
    const files = filesRef.current;
    if (files.length === 0 && maps.length === 0) return;
    setProcessing(true);
    setProgress(0);

    const updated: MapImage[] = [];
    for (let i = 0; i < maps.length; i++) {
      const map = maps[i];
      const reader = new FileReader();
      const file = files[i];
      if (!file) { updated.push(map); continue; }

      const dataUrl = await new Promise<string>(res => {
        reader.onload = e => res(e.target!.result as string);
        reader.readAsDataURL(file);
      });

      const processed = await colorizeImage(dataUrl, color, opacity, blendMode);
      updated.push({ ...map, processed });
      setProgress(Math.round(((i + 1) / maps.length) * 100));
    }

    setMaps(updated);
    setProcessing(false);
  }

  async function downloadAll() {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const folder = zip.folder('colored_maps')!;

    for (const map of maps) {
      if (!map.processed) continue;
      const base64 = map.processed.split(',')[1];
      folder.file(`colored_${map.name}`, base64, { base64: true });
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gta_sa_maps_colored.zip';
    a.click();
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
        <p className="text-xs text-gray-300 font-rajdhani">
          تا <strong className="text-orange-400">144 نقشه PNG</strong> آپلود کنید، رنگ دلخواه را انتخاب کنید، و همه را یکجا رنگ کنید و به صورت ZIP دانلود کنید.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Controls */}
        <div className="space-y-4">
          {/* Color */}
          <div className="card">
            <h3 className="font-rajdhani font-bold text-orange-500 flex items-center gap-2 mb-4">
              <Palette size={16} /> رنگ
            </h3>
            <div className="grid grid-cols-5 gap-1.5 mb-3">
              {COLOR_PRESETS.map(c => (
                <button
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  title={c.name}
                  className={`w-full aspect-square rounded-lg border-2 transition-all ${color === c.hex ? 'border-white scale-110' : 'border-transparent hover:border-white/50'}`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-9 rounded-lg cursor-pointer bg-dark-300 border border-dark-50" />
              <input type="text" value={color} onChange={e => setColor(e.target.value)} className="input-dark flex-1 font-mono text-sm" dir="ltr" />
            </div>
          </div>

          {/* Settings */}
          <div className="card space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-rajdhani mb-2 block">
                شفافیت رنگ: <span className="text-orange-400">{opacity}%</span>
              </label>
              <input type="range" min="5" max="100" value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="w-full accent-orange-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-rajdhani mb-2 block">حالت ترکیب</label>
              <select
                value={blendMode}
                onChange={e => setBlendMode(e.target.value)}
                className="input-dark text-sm"
              >
                {BLEND_MODES.map(b => (
                  <option key={b.val} value={b.val}>{b.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="btn-outline w-full flex items-center justify-center gap-2"
            >
              <Upload size={15} /> آپلود نقشه‌ها (max 144)
            </button>
            <input ref={fileRef} type="file" multiple accept="image/*" onChange={e => handleFiles(e.target.files)} className="hidden" />

            <button
              onClick={processAll}
              disabled={!maps.length || processing}
              className="btn-orange w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {processing ? (
                <><RefreshCw size={15} className="animate-spin" /> {progress}% رنگ‌آمیزی...</>
              ) : (
                <><Palette size={15} /> رنگ‌آمیزی همه ({maps.length})</>
              )}
            </button>

            {maps.some(m => m.processed) && (
              <button onClick={downloadAll} className="btn-orange w-full flex items-center justify-center gap-2">
                <Download size={15} /> دانلود ZIP همه نقشه‌ها
              </button>
            )}
          </div>

          {/* Stats */}
          {maps.length > 0 && (
            <div className="card text-center">
              <p className="text-2xl font-orbitron font-black text-orange-500">{maps.length}</p>
              <p className="text-xs text-gray-500 font-rajdhani">نقشه آپلود شده</p>
              <div className="flex justify-center gap-4 mt-2">
                <div>
                  <p className="text-sm font-bold text-green-400">{maps.filter(m => m.processed).length}</p>
                  <p className="text-[10px] text-gray-600 font-rajdhani">پردازش شده</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500">{maps.filter(m => !m.processed).length}</p>
                  <p className="text-[10px] text-gray-600 font-rajdhani">در انتظار</p>
                </div>
              </div>
              {processing && (
                <div className="mt-3">
                  <div className="h-2 bg-dark-300 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Gallery */}
        <div className="lg:col-span-3">
          {maps.length === 0 ? (
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
              className="border-2 border-dashed border-dark-50 hover:border-orange-500/50 rounded-xl p-16 text-center cursor-pointer transition-all group h-full flex flex-col items-center justify-center"
            >
              <Map size={48} className="text-gray-700 group-hover:text-orange-500 mb-4 transition-colors" />
              <p className="font-rajdhani font-bold text-white text-lg">نقشه‌های PNG را آپلود کنید</p>
              <p className="text-sm text-gray-500 mt-2 font-rajdhani">تا 144 فایل — بکشید یا کلیک کنید</p>
              <p className="text-xs text-gray-600 mt-1 font-rajdhani">PNG, JPG, WEBP پشتیبانی می‌شود</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 max-h-[600px] overflow-y-auto pr-1">
              {maps.map((m, i) => (
                <div key={i} className="card p-1.5 relative group">
                  <div className="relative">
                    <img
                      src={m.processed || m.original}
                      alt={m.name}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    {m.processed && (
                      <div className="absolute top-1 right-1">
                        <CheckCircle size={12} className="text-green-400" />
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setMaps(prev => prev.filter((_, idx) => idx !== i));
                        filesRef.current = filesRef.current.filter((_, idx) => idx !== i);
                      }}
                      className="absolute top-1 left-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >×</button>
                  </div>
                  <p className="text-[9px] text-gray-600 font-rajdhani text-center mt-1 truncate">{m.name}</p>
                  {m.processed && (
                    <button
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = m.processed!;
                        a.download = `colored_${m.name}`;
                        a.click();
                      }}
                      className="w-full text-[9px] font-rajdhani text-orange-400 hover:text-orange-300 transition-colors flex items-center justify-center gap-0.5 mt-0.5"
                    >
                      <Download size={8} /> دانلود
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
