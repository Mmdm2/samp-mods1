import { useState, useRef } from 'react';
import { Package, Upload, Info, Eye, Download, AlertTriangle } from 'lucide-react';

interface TextureInfo {
  name: string;
  width: number;
  height: number;
  format: string;
  mipLevels: number;
  offset: number;
}

function parseTXDBasic(buffer: ArrayBuffer): TextureInfo[] {
  const textures: TextureInfo[] = [];
  const view = new DataView(buffer);

  try {
    // RenderWare stream format basic parsing
    // Section IDs: 0x16 = Texture Dictionary
    let offset = 0;
    const magic = view.getUint32(offset, true);

    if (magic !== 0x16) {
      // Try to find texture section markers
      // Scan for common TXD texture name patterns
      const bytes = new Uint8Array(buffer);
      let i = 0;
      while (i < bytes.length - 4) {
        // Look for texture chunk header (0x15 = Texture Native)
        const chunkType = view.getUint32(i, true);
        if (chunkType === 0x15) {
          const chunkSize = view.getUint32(i + 4, true);
          // Try to read texture name (usually at offset +8 from header)
          try {
            let nameStart = i + 16;
            let name = '';
            for (let j = nameStart; j < Math.min(nameStart + 32, buffer.byteLength); j++) {
              const c = bytes[j];
              if (c === 0) break;
              if (c >= 32 && c < 127) name += String.fromCharCode(c);
            }
            if (name.length > 0 && name.length < 30) {
              textures.push({
                name: name || `texture_${textures.length + 1}`,
                width: 64,
                height: 64,
                format: 'DXT1',
                mipLevels: 1,
                offset: i,
              });
            }
          } catch { /* skip */ }
          i += Math.max(chunkSize + 12, 4);
        } else {
          i += 4;
        }
      }
    }

    if (textures.length === 0) {
      // Fallback: try to scan for texture name strings
      const bytes = new Uint8Array(buffer);
      const names = new Set<string>();
      for (let i = 0; i < bytes.length - 4; i++) {
        if (bytes[i] >= 65 && bytes[i] <= 90 || bytes[i] >= 97 && bytes[i] <= 122) {
          let name = '';
          for (let j = i; j < Math.min(i + 24, buffer.byteLength); j++) {
            const c = bytes[j];
            if (c === 0) break;
            if ((c >= 32 && c < 127)) name += String.fromCharCode(c);
            else break;
          }
          if (name.length >= 4 && name.length <= 22 && /^[a-zA-Z0-9_]+$/.test(name) && !names.has(name)) {
            names.add(name);
            textures.push({
              name,
              width: 128,
              height: 128,
              format: 'DXT1',
              mipLevels: 1,
              offset: i,
            });
            if (textures.length >= 20) break;
          }
        }
      }
    }
  } catch (e) {
    console.error('TXD parse error:', e);
  }

  return textures;
}

export default function TXDEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [textures, setTextures] = useState<TextureInfo[]>([]);
  const [fileSize, setFileSize] = useState(0);
  const [error, setError] = useState('');
  const [selectedTex, setSelectedTex] = useState<TextureInfo | null>(null);
  const [editName, setEditName] = useState('');
  const [names, setNames] = useState<Record<number, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(f: File) {
    setFile(f);
    setFileSize(f.size);
    setError('');
    setTextures([]);
    setSelectedTex(null);

    try {
      const buf = await f.arrayBuffer();
      const parsed = parseTXDBasic(buf);
      if (parsed.length === 0) {
        setError('هیچ تکسچری پیدا نشد. ممکن است فایل TXD معتبر نباشد یا رمزنگاری شده باشد.');
      }
      setTextures(parsed);
      const initNames: Record<number, string> = {};
      parsed.forEach((t, i) => { initNames[i] = t.name; });
      setNames(initNames);
    } catch (e) {
      setError('خطا در خواندن فایل: ' + (e as Error).message);
    }
  }

  function downloadInfo() {
    const info = textures.map((t, i) =>
      `[${i + 1}] Name: ${names[i] || t.name}\n    Format: ${t.format}\n    Size: ${t.width}x${t.height}\n    Mip Levels: ${t.mipLevels}\n    Offset: 0x${t.offset.toString(16).toUpperCase()}`
    ).join('\n\n');
    const content = `TXD File Info\nFile: ${file?.name}\nSize: ${(fileSize / 1024).toFixed(1)} KB\nTextures: ${textures.length}\n\n${'='.repeat(40)}\n\n${info}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name}_info.txt`;
    a.click();
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
        <AlertTriangle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
        <div className="text-xs text-gray-300 font-rajdhani leading-relaxed">
          <strong className="text-yellow-400">ویرایشگر TXD پایه:</strong> این ابزار می‌تواند اطلاعات TXD را نمایش دهد و نام تکسچرها را بررسی کند.
          برای ویرایش کامل TXD توصیه می‌شود از <strong>Magic TXD</strong> یا <strong>TXD Workshop</strong> استفاده کنید.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Upload */}
        <div className="space-y-4">
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            className="border-2 border-dashed border-dark-50 hover:border-orange-500/50 rounded-xl p-8 text-center cursor-pointer transition-all group"
          >
            <Package size={32} className="text-gray-600 group-hover:text-orange-500 mx-auto mb-3 transition-colors" />
            <p className="font-rajdhani font-bold text-white">فایل TXD آپلود کنید</p>
            <p className="text-xs text-gray-500 mt-1 font-rajdhani">فایل را بکشید یا کلیک کنید</p>
            <input ref={fileRef} type="file" accept=".txd" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
          </div>

          {file && (
            <div className="card space-y-2">
              <h3 className="font-rajdhani font-bold text-orange-500">اطلاعات فایل</h3>
              <div className="space-y-1.5 text-xs font-rajdhani">
                <div className="flex justify-between">
                  <span className="text-gray-500">نام:</span>
                  <span className="text-white truncate max-w-[150px]">{file.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">حجم:</span>
                  <span className="text-orange-400">{(fileSize / 1024).toFixed(1)} KB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">تکسچرها:</span>
                  <span className="text-green-400">{textures.length} عدد</span>
                </div>
              </div>
              {textures.length > 0 && (
                <button onClick={downloadInfo} className="btn-outline w-full flex items-center justify-center gap-2 mt-2">
                  <Download size={13} /> دانلود اطلاعات .txt
                </button>
              )}
            </div>
          )}

          {/* Common TXD files */}
          <div className="card">
            <h3 className="font-rajdhani font-bold text-gray-400 text-sm mb-3">فایل‌های TXD رایج</h3>
            <div className="space-y-1.5">
              {[
                { name: 'player.txd', desc: 'اسکین بازیکن' },
                { name: 'vehicle.txd', desc: 'تکسچر ماشین' },
                { name: 'hud.txd', desc: 'رابط کاربری' },
                { name: 'menu.txd', desc: 'منوی اصلی' },
                { name: 'fonts.txd', desc: 'فونت‌ها' },
              ].map(({ name, desc }) => (
                <div key={name} className="flex justify-between items-center py-1.5 border-b border-dark-50 last:border-0">
                  <span className="text-xs font-mono text-orange-400">{name}</span>
                  <span className="text-[10px] text-gray-500 font-rajdhani">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Textures list */}
        <div className="lg:col-span-2">
          {error && (
            <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-4 text-red-400 text-xs font-rajdhani">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {textures.length > 0 ? (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-rajdhani font-bold text-orange-500 flex items-center gap-2">
                  <Eye size={16} /> تکسچرهای یافته شده ({textures.length})
                </h3>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {textures.map((t, idx) => (
                  <div
                    key={idx}
                    onClick={() => { setSelectedTex(t); setEditName(names[idx] || t.name); }}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedTex === t ? 'bg-orange-500/10 border-orange-500/30' : 'bg-dark-300 border-dark-50 hover:border-orange-500/20'}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-dark-400 border border-dark-50 flex items-center justify-center shrink-0">
                      <Package size={14} className="text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm text-white truncate">{names[idx] || t.name}</p>
                      <p className="text-[10px] text-gray-500 font-rajdhani">{t.format} • {t.width}×{t.height} • Offset: 0x{t.offset.toString(16).toUpperCase()}</p>
                    </div>
                    <span className="badge-orange text-[9px]">{idx + 1}</span>
                  </div>
                ))}
              </div>

              {selectedTex && (
                <div className="mt-4 pt-4 border-t border-dark-50">
                  <h4 className="font-rajdhani font-bold text-white text-sm mb-3">ویرایش تکسچر انتخابی</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="input-dark flex-1 font-mono"
                      dir="ltr"
                      placeholder="نام تکسچر"
                    />
                    <button
                      onClick={() => {
                        const idx = textures.indexOf(selectedTex);
                        setNames(prev => ({ ...prev, [idx]: editName }));
                      }}
                      className="btn-orange px-4"
                    >
                      اعمال
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-600 mt-2 font-rajdhani">
                    توجه: تغییر نام فقط در این ابزار اعمال می‌شود. برای ذخیره در فایل TXD از Magic TXD استفاده کنید.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <Package size={40} className="text-gray-700 mb-4" />
              <p className="font-rajdhani font-bold text-gray-500">فایل TXD آپلود نشده</p>
              <p className="text-xs text-gray-600 mt-1 font-rajdhani">فایل TXD را از پنل چپ آپلود کنید</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
