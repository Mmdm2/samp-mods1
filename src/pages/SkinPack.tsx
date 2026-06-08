import { useState, useRef, useEffect, useCallback } from 'react';
import { Image, Upload, Download, Palette, RefreshCw, Info } from 'lucide-react';

const PRESET_COLORS = [
  { name: 'نارنجی گرم', hex: '#FF6B00' },
  { name: 'قرمز خون', hex: '#CC0000' },
  { name: 'آبی سرد', hex: '#0055FF' },
  { name: 'سبز ارتش', hex: '#2E7D32' },
  { name: 'بنفش تاریک', hex: '#6A0DAD' },
  { name: 'صورتی نئون', hex: '#FF1493' },
  { name: 'زرد طلایی', hex: '#FFD700' },
  { name: 'فیروزه‌ای', hex: '#00BCD4' },
  { name: 'مشکی کربن', hex: '#1a1a1a' },
  { name: 'سفید برفی', hex: '#F5F5F5' },
  { name: 'قهوه‌ای چوب', hex: '#5D4037' },
  { name: 'خاکستری', hex: '#607D8B' },
];

function isSkinColor(r: number, g: number, b: number): boolean {
  // Approximate skin tone detection
  return (
    r > 120 && r < 255 &&
    g > 80 && g < 210 &&
    b > 60 && b < 180 &&
    r > g && r > b &&
    (r - b) > 20 &&
    Math.abs(r - g) < 80
  );
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 255, g: 100, b: 0 };
}

export default function SkinPack() {
  const [images, setImages] = useState<Array<{ file: File; original: string; processed: string | null; name: string }>>([]);
  const [selectedColor, setSelectedColor] = useState('#FF6B00');
  const [customColor, setCustomColor] = useState('#FF6B00');
  const [intensity, setIntensity] = useState(60);
  const [processing, setProcessing] = useState(false);
  const [mode, setMode] = useState<'clothes' | 'full' | 'overlay'>('clothes');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(async (dataUrl: string, color: string, strength: number, colorMode: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const target = hexToRgb(color);
        const factor = strength / 100;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 10) continue; // skip transparent

          const shouldColor = colorMode === 'full'
            ? true
            : colorMode === 'overlay'
            ? true
            : !isSkinColor(r, g, b);

          if (shouldColor) {
            if (colorMode === 'overlay') {
              // Blend overlay
              data[i]     = Math.min(255, Math.round(r * (1 - factor) + target.r * factor));
              data[i + 1] = Math.min(255, Math.round(g * (1 - factor) + target.g * factor));
              data[i + 2] = Math.min(255, Math.round(b * (1 - factor) + target.b * factor));
            } else {
              // Hue shift while preserving luminosity
              const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
              data[i]     = Math.min(255, Math.round(target.r * luminance * factor + r * (1 - factor)));
              data[i + 1] = Math.min(255, Math.round(target.g * luminance * factor + g * (1 - factor)));
              data[i + 2] = Math.min(255, Math.round(target.b * luminance * factor + b * (1 - factor)));
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = dataUrl;
    });
  }, []);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const newImgs = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({
        file: f,
        name: f.name,
        original: URL.createObjectURL(f),
        processed: null as string | null,
      }));
    setImages(prev => [...prev, ...newImgs]);
  }

  async function processAll() {
    if (!images.length) return;
    setProcessing(true);
    const updated = await Promise.all(
      images.map(async img => {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>(res => {
          reader.onload = e => res(e.target!.result as string);
          reader.readAsDataURL(img.file);
        });
        const processed = await processImage(dataUrl, selectedColor, intensity, mode);
        return { ...img, processed };
      })
    );
    setImages(updated);
    setProcessing(false);
  }

  function downloadOne(img: typeof images[0]) {
    if (!img.processed) return;
    const a = document.createElement('a');
    a.href = img.processed;
    a.download = `colored_${img.name}`;
    a.click();
  }

  async function downloadAll() {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    for (const img of images) {
      if (!img.processed) continue;
      const base64 = img.processed.split(',')[1];
      zip.file(`colored_${img.name}`, base64, { base64: true });
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skin_pack_colored.zip';
    a.click();
  }

  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="flex gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
        <p className="text-xs text-gray-300 font-rajdhani leading-relaxed">
          تصاویر PNG اسکین را آپلود کنید. سیستم رنگ فقط روی لباس اعمال می‌شود (پوست تشخیص داده می‌شه و رنگ نمی‌خوره).
          بعد دانلود کن.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Controls */}
        <div className="space-y-4">
          {/* Color picker */}
          <div className="card">
            <h3 className="font-rajdhani font-bold text-orange-500 flex items-center gap-2 mb-4">
              <Palette size={16} /> انتخاب رنگ
            </h3>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {PRESET_COLORS.map(c => (
                <button
                  key={c.hex}
                  onClick={() => { setSelectedColor(c.hex); setCustomColor(c.hex); }}
                  title={c.name}
                  className={`w-full aspect-square rounded-lg border-2 transition-all ${selectedColor === c.hex ? 'border-white scale-110' : 'border-transparent hover:border-white/50'}`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
            <div>
              <label className="text-xs text-gray-400 font-rajdhani mb-2 block">رنگ سفارشی</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={e => { setCustomColor(e.target.value); setSelectedColor(e.target.value); }}
                  className="w-12 h-10 rounded-lg bg-dark-300 border border-dark-50 cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedColor}
                  onChange={e => { setSelectedColor(e.target.value); setCustomColor(e.target.value); }}
                  className="input-dark flex-1 font-mono text-sm"
                  dir="ltr"
                  placeholder="#FF6B00"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="card space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-rajdhani mb-2 block">
                شدت رنگ: <span className="text-orange-400">{intensity}%</span>
              </label>
              <input
                type="range"
                min="10" max="100"
                value={intensity}
                onChange={e => setIntensity(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-rajdhani mb-2 block">حالت رنگ‌کاری</label>
              <div className="space-y-2">
                {[
                  { val: 'clothes', label: 'فقط لباس (پوست محفوظ)', desc: 'پوست شخصیت حفظ می‌شه' },
                  { val: 'full', label: 'کل تصویر', desc: 'همه پیکسل‌ها رنگ می‌شن' },
                  { val: 'overlay', label: 'لایه روی تصویر', desc: 'ملایم‌تر، تمام تصویر' },
                ].map(({ val, label, desc }) => (
                  <button
                    key={val}
                    onClick={() => setMode(val as typeof mode)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs font-rajdhani transition-all ${mode === val ? 'bg-orange-500/15 border-orange-500/40 text-white' : 'bg-dark-300 border-dark-50 text-gray-400 hover:border-orange-500/20'}`}
                  >
                    <div className="font-semibold">{label}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={processAll}
              disabled={!images.length || processing}
              className="btn-orange w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {processing ? (
                <><RefreshCw size={15} className="animate-spin" /> در حال پردازش...</>
              ) : (
                <><Palette size={15} /> اعمال رنگ ({images.length} تصویر)</>
              )}
            </button>
            {images.some(i => i.processed) && (
              <button onClick={downloadAll} className="btn-outline w-full flex items-center justify-center gap-2">
                <Download size={15} /> دانلود همه به صورت ZIP
              </button>
            )}
          </div>
        </div>

        {/* Upload + gallery */}
        <div className="lg:col-span-2 space-y-4">
          {/* Upload zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
            className="border-2 border-dashed border-dark-50 hover:border-orange-500/50 rounded-xl p-8 text-center cursor-pointer transition-all group"
          >
            <Upload size={32} className="text-gray-600 group-hover:text-orange-500 mx-auto mb-3 transition-colors" />
            <p className="font-rajdhani font-bold text-white">اسکین PNG آپلود کنید</p>
            <p className="text-xs text-gray-500 font-rajdhani mt-1">فایل‌ها را بکشید یا کلیک کنید</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/gif"
              onChange={e => handleFiles(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Gallery */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-1">
              {images.map((img, idx) => (
                <div key={idx} className="card p-2 space-y-2 relative group">
                  {/* Remove button */}
                  <button
                    onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
                  >×</button>

                  {/* Before/After */}
                  <div className="flex gap-1">
                    <div className="flex-1">
                      <p className="text-[9px] text-gray-500 text-center mb-1 font-rajdhani">قبل</p>
                      <img
                        src={img.original}
                        alt="before"
                        className="w-full aspect-square object-contain rounded bg-dark-300"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    </div>
                    {img.processed && (
                      <div className="flex-1">
                        <p className="text-[9px] text-orange-400 text-center mb-1 font-rajdhani">بعد</p>
                        <img
                          src={img.processed}
                          alt="after"
                          className="w-full aspect-square object-contain rounded bg-dark-300"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-gray-500 font-rajdhani text-center truncate">{img.name}</p>

                  {img.processed && (
                    <button
                      onClick={() => downloadOne(img)}
                      className="w-full flex items-center justify-center gap-1 py-1.5 text-[10px] font-rajdhani font-bold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 rounded-lg transition-colors"
                    >
                      <Download size={10} /> دانلود
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
