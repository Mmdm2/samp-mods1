import { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Palette, RefreshCw } from 'lucide-react';

const SIZES = [16, 32, 48, 64, 128, 256];

type FistStyle = 'classic' | 'detailed' | 'neon' | 'pixel' | 'shadow' | 'graffiti';
type BgShape = 'none' | 'circle' | 'square' | 'hexagon' | 'diamond';
type Accessory = 'none' | 'ring' | 'bandage' | 'glove' | 'blood' | 'knuckles';

interface FistConfig {
  style: FistStyle;
  fistColor: string;
  bgShape: BgShape;
  bgColor: string;
  bgGradient: boolean;
  bgGradientColor: string;
  outlineColor: string;
  outlineWidth: number;
  accessory: Accessory;
  accessoryColor: string;
  textOverlay: string;
  textColor: string;
  fontSize: number;
  rotation: number;
  flipX: boolean;
  shadowEnabled: boolean;
  shadowColor: string;
  glowEnabled: boolean;
  glowColor: string;
}

const DEFAULT_CONFIG: FistConfig = {
  style: 'classic',
  fistColor: '#FF6B00',
  bgShape: 'circle',
  bgColor: '#1a1a1a',
  bgGradient: false,
  bgGradientColor: '#000000',
  outlineColor: '#FF8C00',
  outlineWidth: 2,
  accessory: 'none',
  accessoryColor: '#FFD700',
  textOverlay: '',
  textColor: '#FFFFFF',
  fontSize: 14,
  rotation: 0,
  flipX: false,
  shadowEnabled: false,
  shadowColor: '#000000',
  glowEnabled: true,
  glowColor: '#FF6B00',
};

const PRESETS: Array<{ name: string; icon: string; config: Partial<FistConfig> }> = [
  { name: 'کلاسیک نارنجی', icon: '🔥', config: { style: 'classic', fistColor: '#FF6B00', bgShape: 'circle', bgColor: '#1a1a1a', outlineColor: '#FF8C00', glowEnabled: true, glowColor: '#FF6B00', accessory: 'none' } },
  { name: 'طلایی VIP', icon: '👑', config: { style: 'detailed', fistColor: '#FFD700', bgShape: 'hexagon', bgColor: '#1a1200', outlineColor: '#FFA500', glowEnabled: true, glowColor: '#FFD700', accessory: 'ring', accessoryColor: '#FFD700' } },
  { name: 'خون‌آلود', icon: '🩸', config: { style: 'classic', fistColor: '#CC2222', bgShape: 'circle', bgColor: '#0d0000', outlineColor: '#FF0000', accessory: 'blood', accessoryColor: '#AA0000', glowColor: '#FF0000' } },
  { name: 'نئون سایبر', icon: '⚡', config: { style: 'neon', fistColor: '#00FFFF', bgShape: 'square', bgColor: '#000011', outlineColor: '#00FFFF', glowEnabled: true, glowColor: '#00FFFF', accessory: 'none' } },
  { name: 'پیکسل ۸ بیت', icon: '🕹️', config: { style: 'pixel', fistColor: '#44AA22', bgShape: 'square', bgColor: '#002200', outlineColor: '#66FF44', glowEnabled: false, accessory: 'none' } },
  { name: 'بنفش گنگ', icon: '💜', config: { style: 'classic', fistColor: '#8B00CC', bgShape: 'diamond', bgColor: '#0d001a', outlineColor: '#CC44FF', glowEnabled: true, glowColor: '#8B00CC', accessory: 'knuckles', accessoryColor: '#CC44FF' } },
  { name: 'شاهین قرمز', icon: '🦅', config: { style: 'shadow', fistColor: '#CC0000', bgShape: 'circle', bgColor: '#0a0000', outlineColor: '#FF4444', shadowEnabled: true, shadowColor: '#FF0000', glowEnabled: true } },
  { name: 'سربازی', icon: '🪖', config: { style: 'detailed', fistColor: '#4A7C34', bgShape: 'none', bgColor: 'transparent', outlineColor: '#2D4E1E', accessory: 'glove', accessoryColor: '#2D4E1E', glowEnabled: false } },
];

function drawBackground(ctx: CanvasRenderingContext2D, size: number, cfg: FistConfig) {
  if (cfg.bgShape === 'none') return;
  const cx = size / 2, cy = size / 2, r = size * 0.46;

  let fill: CanvasGradient | string;
  if (cfg.bgGradient) {
    const g = ctx.createRadialGradient(cx, cy * 0.7, 0, cx, cy, r);
    g.addColorStop(0, cfg.bgGradientColor);
    g.addColorStop(1, cfg.bgColor);
    fill = g;
  } else {
    fill = cfg.bgColor;
  }

  ctx.beginPath();
  if (cfg.bgShape === 'circle') {
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  } else if (cfg.bgShape === 'square') {
    const m = size * 0.06;
    ctx.roundRect(m, m, size - m * 2, size - m * 2, size * 0.1);
  } else if (cfg.bgShape === 'hexagon') {
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 - Math.PI / 6;
      const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
  } else if (cfg.bgShape === 'diamond') {
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r, cy);
    ctx.closePath();
  }

  ctx.fillStyle = fill;
  ctx.fill();

  // Border
  ctx.strokeStyle = cfg.outlineColor;
  ctx.lineWidth = cfg.outlineWidth * (size / 64);
  ctx.stroke();
}

function drawFistShape(ctx: CanvasRenderingContext2D, size: number, cfg: FistConfig) {
  const s = size / 128;
  const cx = size / 2, cy = size / 2;

  if (cfg.style === 'pixel') {
    // Pixel art style — block shapes
    const ps = Math.max(2, Math.round(4 * s)); // pixel size
    const pixels = [
      // fingers row 1
      [1,0],[2,0],[3,0],[4,0],
      // fingers row 2
      [1,1],[2,1],[3,1],[4,1],
      // palm rows
      [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],
      [0,3],[1,3],[2,3],[3,3],[4,3],[5,3],
      [0,4],[1,4],[2,4],[3,4],[4,4],
      // thumb
      [5,3],[6,3],
      // wrist
      [1,5],[2,5],[3,5],[4,5],
    ];
    const ox = cx - 3.5 * ps * 2.5;
    const oy = cy - 3 * ps * 2.5;
    pixels.forEach(([px, py]) => {
      ctx.fillStyle = cfg.fistColor;
      ctx.fillRect(ox + px * ps * 2.5, oy + py * ps * 2.5, ps * 2.5 - 1, ps * 2.5 - 1);
    });
    return;
  }

  // Vector fist for all other styles
  ctx.save();

  if (cfg.glowEnabled && cfg.style === 'neon') {
    ctx.shadowColor = cfg.glowColor;
    ctx.shadowBlur = 15 * s;
  } else if (cfg.glowEnabled) {
    ctx.shadowColor = cfg.glowColor;
    ctx.shadowBlur = 8 * s;
  }
  if (cfg.shadowEnabled && cfg.style === 'shadow') {
    ctx.shadowColor = cfg.shadowColor;
    ctx.shadowBlur = 20 * s;
    ctx.shadowOffsetX = 4 * s;
    ctx.shadowOffsetY = 4 * s;
  }

  const lw = (cfg.style === 'neon' ? 2.5 : cfg.outlineWidth) * s;
  ctx.strokeStyle = cfg.outlineColor;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (cfg.style === 'graffiti') {
    ctx.globalAlpha = 0.92;
  }

  // === FINGERS (4 rounded rects) ===
  const fingerW = 10 * s, fingerH = 24 * s;
  const fingerStartX = cx - 19 * s;
  const fingerStartY = cy - 30 * s;
  const fingerGap = 1.5 * s;

  for (let i = 0; i < 4; i++) {
    const fx = fingerStartX + i * (fingerW + fingerGap);
    ctx.beginPath();
    ctx.roundRect(fx, fingerStartY, fingerW, fingerH, 3.5 * s);
    ctx.fillStyle = cfg.fistColor;
    ctx.fill();
    ctx.stroke();
  }

  // Knuckle dividers
  ctx.strokeStyle = cfg.style === 'neon' ? cfg.outlineColor : `rgba(0,0,0,0.25)`;
  ctx.lineWidth = 1.2 * s;
  for (let i = 0; i < 3; i++) {
    const lx = fingerStartX + (i + 1) * (fingerW + fingerGap) - fingerGap / 2;
    ctx.beginPath();
    ctx.moveTo(lx, fingerStartY + fingerH * 0.25);
    ctx.lineTo(lx, fingerStartY + fingerH * 0.75);
    ctx.stroke();
  }

  // === PALM ===
  ctx.strokeStyle = cfg.outlineColor;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.roundRect(cx - 24 * s, cy - 10 * s, 48 * s, 34 * s, 5 * s);
  ctx.fillStyle = cfg.fistColor;
  ctx.fill();
  ctx.stroke();

  // === THUMB ===
  ctx.beginPath();
  ctx.roundRect(cx + 22 * s, cy - 6 * s, 18 * s, 13 * s, 4 * s);
  ctx.fillStyle = cfg.fistColor;
  ctx.fill();
  ctx.stroke();

  // === WRIST ===
  ctx.beginPath();
  ctx.roundRect(cx - 18 * s, cy + 22 * s, 36 * s, 14 * s, 3 * s);
  ctx.fillStyle = cfg.fistColor;
  ctx.fill();
  ctx.stroke();

  // === HIGHLIGHT (for detailed style) ===
  if (cfg.style === 'detailed') {
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(cx - 20 * s, cy - 8 * s, 20 * s, 12 * s, 3 * s);
    ctx.fill();
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 4; i++) {
      const fx = fingerStartX + i * (fingerW + fingerGap);
      ctx.beginPath();
      ctx.roundRect(fx + 2 * s, fingerStartY + 2 * s, fingerW * 0.5, fingerH * 0.35, 2 * s);
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.restore();
}

function drawAccessory(ctx: CanvasRenderingContext2D, size: number, cfg: FistConfig) {
  if (cfg.accessory === 'none') return;
  const s = size / 128;
  const cx = size / 2, cy = size / 2;

  ctx.save();
  ctx.strokeStyle = cfg.accessoryColor;
  ctx.fillStyle = cfg.accessoryColor;

  if (cfg.accessory === 'ring') {
    // Gold ring on middle finger
    const rx = cx - 5 * s, ry = cy - 26 * s;
    ctx.lineWidth = 3 * s;
    ctx.beginPath();
    ctx.roundRect(rx - 1 * s, ry, 10 * s, 5 * s, 2 * s);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 0.5 * s;
    ctx.stroke();
    // Stone on ring
    ctx.fillStyle = '#00AAFF';
    ctx.beginPath();
    ctx.ellipse(rx + 4 * s, ry + 2.5 * s, 2.5 * s, 1.8 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (cfg.accessory === 'bandage') {
    // White bandage strips across knuckles
    ctx.fillStyle = '#f0f0f0';
    ctx.globalAlpha = 0.85;
    const bx = cx - 24 * s;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.rect(bx + i * 16 * s, cy - 8 * s, 11 * s, 3.5 * s);
      ctx.fill();
    }
    // Tape lines
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 0.8 * s;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(bx + i * 16 * s + 2 * s, cy - 8 * s);
      ctx.lineTo(bx + i * 16 * s + 2 * s, cy - 4.5 * s);
      ctx.stroke();
    }
  } else if (cfg.accessory === 'glove') {
    // Dark glove overlay
    ctx.fillStyle = cfg.accessoryColor;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.roundRect(cx - 24 * s, cy - 32 * s, 56 * s, 72 * s, 5 * s);
    ctx.fill();
    // Knuckle reinforcements
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#000';
    for (let i = 0; i < 4; i++) {
      const fx = cx - 20 * s + i * 11.5 * s;
      ctx.beginPath();
      ctx.ellipse(fx + 5 * s, cy - 12 * s, 4 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (cfg.accessory === 'blood') {
    // Blood drips
    ctx.fillStyle = cfg.accessoryColor;
    ctx.globalAlpha = 0.9;
    const drips = [
      { x: cx - 18 * s, l: 12 * s },
      { x: cx - 5 * s, l: 18 * s },
      { x: cx + 8 * s, l: 10 * s },
      { x: cx + 19 * s, l: 15 * s },
    ];
    drips.forEach(({ x, l }) => {
      ctx.beginPath();
      ctx.rect(x, cy + 20 * s, 4 * s, l);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + 2 * s, cy + 20 * s + l, 3.5 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    // Splatter on knuckles
    ctx.globalAlpha = 0.7;
    for (let i = 0; i < 6; i++) {
      const rx = cx + (Math.random() - 0.5) * 40 * s;
      const ry = cy - 10 * s + (Math.random() - 0.5) * 20 * s;
      ctx.beginPath();
      ctx.ellipse(rx, ry, 2.5 * s, 1.5 * s, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (cfg.accessory === 'knuckles') {
    // Metal knuckle duster
    ctx.fillStyle = cfg.accessoryColor;
    ctx.globalAlpha = 0.85;
    for (let i = 0; i < 4; i++) {
      const kx = cx - 20 * s + i * 11 * s;
      ctx.beginPath();
      ctx.roundRect(kx, cy - 18 * s, 10 * s, 8 * s, 2 * s);
      ctx.fill();
      // hole
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.ellipse(kx + 5 * s, cy - 14 * s, 3 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.85;
    }
    // connecting bar
    ctx.fillStyle = cfg.accessoryColor;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.roundRect(cx - 21 * s, cy - 12 * s, 45 * s, 4 * s, 2 * s);
    ctx.fill();
  }

  ctx.restore();
}

function drawTextOverlay(ctx: CanvasRenderingContext2D, size: number, cfg: FistConfig) {
  if (!cfg.textOverlay.trim()) return;
  const s = size / 128;
  ctx.save();
  ctx.font = `bold ${cfg.fontSize * s * 1.5}px Rajdhani, Orbitron, sans-serif`;
  ctx.fillStyle = cfg.textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2 * s;
  ctx.strokeText(cfg.textOverlay, size / 2, size - 4 * s);
  ctx.fillText(cfg.textOverlay, size / 2, size - 4 * s);
  ctx.restore();
}

function renderFist(canvas: HTMLCanvasElement, cfg: FistConfig, size: number) {
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, size, size);

  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.rotate((cfg.rotation * Math.PI) / 180);
  if (cfg.flipX) ctx.scale(-1, 1);
  ctx.translate(-size / 2, -size / 2);

  drawBackground(ctx, size, cfg);
  drawFistShape(ctx, size, cfg);
  drawAccessory(ctx, size, cfg);
  drawTextOverlay(ctx, size, cfg);

  ctx.restore();
}

export default function FistIconMaker() {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [cfg, setCfg] = useState<FistConfig>(DEFAULT_CONFIG);
  const [previewSize, setPreviewSize] = useState(192);

  const update = useCallback((patch: Partial<FistConfig>) => {
    setCfg(prev => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    if (previewRef.current) renderFist(previewRef.current, cfg, previewSize);
  }, [cfg, previewSize]);

  function applyPreset(p: typeof PRESETS[0]) {
    setCfg(prev => ({ ...prev, ...p.config }));
  }

  function downloadSize(size: number) {
    const c = document.createElement('canvas');
    renderFist(c, cfg, size);
    const a = document.createElement('a');
    a.href = c.toDataURL('image/png');
    a.download = `fist_${size}x${size}.png`;
    a.click();
  }

  async function downloadAll() {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    for (const sz of SIZES) {
      const c = document.createElement('canvas');
      renderFist(c, cfg, sz);
      zip.file(`fist_${sz}x${sz}.png`, c.toDataURL('image/png').split(',')[1], { base64: true });
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fist_icons_all.zip';
    a.click();
  }

  const sliderRow = (label: string, key: keyof FistConfig, min: number, max: number) => (
    <div key={key}>
      <div className="flex justify-between mb-1">
        <label className="text-[10px] text-gray-400 font-rajdhani">{label}</label>
        <span className="text-[10px] text-orange-400 font-mono">{cfg[key] as number}</span>
      </div>
      <input type="range" min={min} max={max} value={cfg[key] as number}
        onChange={e => update({ [key]: Number(e.target.value) })}
        className="w-full accent-orange-500" />
    </div>
  );

  const colorRow = (label: string, key: keyof FistConfig) => (
    <div key={key} className="flex items-center gap-2">
      <input type="color" value={cfg[key] as string}
        onChange={e => update({ [key]: e.target.value })}
        className="w-8 h-7 rounded cursor-pointer border border-dark-50 bg-dark-300" />
      <span className="text-[10px] text-gray-400 font-rajdhani flex-1">{label}</span>
      <span className="text-[10px] font-mono text-gray-600">{cfg[key] as string}</span>
    </div>
  );

  const toggleRow = (label: string, key: keyof FistConfig) => (
    <div key={key} className="flex items-center justify-between">
      <span className="text-[10px] text-gray-400 font-rajdhani">{label}</span>
      <button onClick={() => update({ [key]: !cfg[key] })}
        className={`relative w-9 h-5 rounded-full transition-colors ${cfg[key] ? 'bg-orange-500' : 'bg-dark-50'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${cfg[key] ? 'left-4' : 'left-0.5'}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Presets */}
      <div className="card">
        <h3 className="font-rajdhani font-bold text-orange-500 flex items-center gap-2 mb-4">
          <Palette size={16} /> پریست‌های آماده
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {PRESETS.map(p => (
            <button key={p.name} onClick={() => applyPreset(p)}
              className="flex flex-col items-center gap-1 p-2 bg-dark-300 border border-dark-50 rounded-xl hover:border-orange-500/30 transition-all group">
              <span className="text-xl">{p.icon}</span>
              <span className="text-[9px] text-gray-500 font-rajdhani text-center leading-tight group-hover:text-white transition-colors">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Controls Column 1 */}
        <div className="space-y-4">
          {/* Style */}
          <div className="card space-y-3">
            <h4 className="font-rajdhani font-bold text-white text-sm">استایل مشت</h4>
            <div className="grid grid-cols-3 gap-1.5">
              {(['classic', 'detailed', 'neon', 'pixel', 'shadow', 'graffiti'] as FistStyle[]).map(s => (
                <button key={s} onClick={() => update({ style: s })}
                  className={`py-2 text-[10px] font-rajdhani font-bold rounded-lg border uppercase tracking-wide transition-all ${cfg.style === s ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' : 'border-dark-50 text-gray-500 hover:text-white'}`}>
                  {s === 'classic' ? 'کلاسیک' : s === 'detailed' ? 'جزئی' : s === 'neon' ? 'نئون' : s === 'pixel' ? 'پیکسل' : s === 'shadow' ? 'سایه' : 'گرافیتی'}
                </button>
              ))}
            </div>
          </div>

          {/* Background */}
          <div className="card space-y-3">
            <h4 className="font-rajdhani font-bold text-white text-sm">پس‌زمینه</h4>
            <div className="grid grid-cols-5 gap-1">
              {(['none', 'circle', 'square', 'hexagon', 'diamond'] as BgShape[]).map(s => (
                <button key={s} onClick={() => update({ bgShape: s })}
                  className={`py-2 text-[9px] font-rajdhani rounded-lg border transition-all ${cfg.bgShape === s ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' : 'border-dark-50 text-gray-500'}`}>
                  {s === 'none' ? 'هیچ' : s === 'circle' ? '●' : s === 'square' ? '■' : s === 'hexagon' ? '⬡' : '◆'}
                </button>
              ))}
            </div>
            {colorRow('رنگ پس‌زمینه', 'bgColor')}
            {toggleRow('گرادیان', 'bgGradient')}
            {cfg.bgGradient && colorRow('رنگ دوم گرادیان', 'bgGradientColor')}
          </div>
        </div>

        {/* Controls Column 2 */}
        <div className="space-y-4">
          {/* Colors */}
          <div className="card space-y-3">
            <h4 className="font-rajdhani font-bold text-white text-sm">رنگ‌بندی</h4>
            {colorRow('رنگ مشت', 'fistColor')}
            {colorRow('رنگ لبه', 'outlineColor')}
            {sliderRow('ضخامت لبه', 'outlineWidth', 0, 6)}
          </div>

          {/* Glow / Shadow */}
          <div className="card space-y-3">
            <h4 className="font-rajdhani font-bold text-white text-sm">جلوه‌های نوری</h4>
            {toggleRow('گلو فعال', 'glowEnabled')}
            {cfg.glowEnabled && colorRow('رنگ گلو', 'glowColor')}
            {toggleRow('سایه فعال', 'shadowEnabled')}
            {cfg.shadowEnabled && colorRow('رنگ سایه', 'shadowColor')}
          </div>

          {/* Transform */}
          <div className="card space-y-3">
            <h4 className="font-rajdhani font-bold text-white text-sm">تبدیل</h4>
            {sliderRow('چرخش', 'rotation', -180, 180)}
            {toggleRow('آینه افقی', 'flipX')}
          </div>
        </div>

        {/* Controls Column 3 */}
        <div className="space-y-4">
          {/* Accessory */}
          <div className="card space-y-3">
            <h4 className="font-rajdhani font-bold text-white text-sm">اکسسوری</h4>
            <div className="grid grid-cols-3 gap-1.5">
              {(['none', 'ring', 'bandage', 'glove', 'blood', 'knuckles'] as Accessory[]).map(a => (
                <button key={a} onClick={() => update({ accessory: a })}
                  className={`py-2 text-[9px] font-rajdhani font-bold rounded-lg border transition-all ${cfg.accessory === a ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' : 'border-dark-50 text-gray-500 hover:text-white'}`}>
                  {a === 'none' ? 'هیچ' : a === 'ring' ? '💍 انگشتر' : a === 'bandage' ? '🩹 باند' : a === 'glove' ? '🧤 دستکش' : a === 'blood' ? '🩸 خون' : '🥊 ناکل'}
                </button>
              ))}
            </div>
            {cfg.accessory !== 'none' && colorRow('رنگ اکسسوری', 'accessoryColor')}
          </div>

          {/* Text overlay */}
          <div className="card space-y-3">
            <h4 className="font-rajdhani font-bold text-white text-sm">متن روی آیکون</h4>
            <input type="text" value={cfg.textOverlay}
              onChange={e => update({ textOverlay: e.target.value })}
              placeholder="متن دلخواه..."
              className="input-dark text-sm" maxLength={12} />
            {cfg.textOverlay && (
              <>
                {colorRow('رنگ متن', 'textColor')}
                {sliderRow('سایز متن', 'fontSize', 8, 32)}
              </>
            )}
          </div>
        </div>

        {/* Preview + Download */}
        <div className="space-y-4">
          {/* Preview */}
          <div className="card flex flex-col items-center gap-4">
            <h4 className="font-rajdhani font-bold text-orange-500 text-sm self-start">پیش‌نمایش</h4>

            {/* Size selector for preview */}
            <div className="flex gap-1 flex-wrap justify-center">
              {[64, 128, 192, 256].map(sz => (
                <button key={sz} onClick={() => setPreviewSize(sz)}
                  className={`px-2 py-1 text-[9px] font-rajdhani rounded border transition-all ${previewSize === sz ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' : 'border-dark-50 text-gray-500'}`}>
                  {sz}px
                </button>
              ))}
            </div>

            <div className="p-3 bg-dark-500 rounded-xl border border-dark-50" style={{
              backgroundImage: 'linear-gradient(45deg,#1a1a1a 25%,transparent 25%),linear-gradient(-45deg,#1a1a1a 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#1a1a1a 75%),linear-gradient(-45deg,transparent 75%,#1a1a1a 75%)',
              backgroundSize: '12px 12px',
              backgroundPosition: '0 0,0 6px,6px -6px,-6px 0',
            }}>
              <canvas ref={previewRef} width={previewSize} height={previewSize}
                style={{ width: 192, height: 192, imageRendering: 'pixelated', display: 'block' }} />
            </div>

            <button onClick={() => update({ ...DEFAULT_CONFIG })}
              className="text-xs text-gray-500 hover:text-orange-400 transition-colors font-rajdhani flex items-center gap-1">
              <RefreshCw size={10} /> ریست
            </button>
          </div>

          {/* Download */}
          <div className="card space-y-2">
            <h4 className="font-rajdhani font-bold text-white text-sm mb-3">دانلود</h4>
            <div className="grid grid-cols-3 gap-1.5">
              {SIZES.map(sz => (
                <button key={sz} onClick={() => downloadSize(sz)}
                  className="flex flex-col items-center gap-0.5 p-2 bg-dark-300 border border-dark-50 hover:border-orange-500/30 rounded-lg transition-all text-gray-400 hover:text-orange-400">
                  <Download size={11} />
                  <span className="text-[9px] font-rajdhani font-bold">{sz}×{sz}</span>
                </button>
              ))}
            </div>
            <button onClick={downloadAll} className="btn-orange w-full flex items-center justify-center gap-2 text-sm">
              <Download size={14} /> همه سایزها (ZIP)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
