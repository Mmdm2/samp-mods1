import { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, Key, Shield, Upload, Download, Package, Plus, Eye, EyeOff, Copy, Check, AlertTriangle, Star, X, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Pack {
  id: string;
  user_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  file_url: string;
  price_display: string;
  encryption_key_hash: string;
  total_sales: number;
  created_at: string;
}

interface License {
  id: string;
  pack_id: string;
  license_key: string;
  active: boolean;
  issued_at: string;
  expires_at: string | null;
}

// --- AES-GCM encryption using Web Crypto API ---
async function generateKey(): Promise<{ raw: string; cryptoKey: CryptoKey }> {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const raw = Array.from(new Uint8Array(await crypto.subtle.exportKey('raw', key)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  return { raw, cryptoKey: key };
}

async function importKey(hexKey: string): Promise<CryptoKey> {
  const raw = new Uint8Array(hexKey.match(/.{2}/g)!.map(h => parseInt(h, 16)));
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

async function encryptFile(file: File, hexKey: string): Promise<Blob> {
  const key = await importKey(hexKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = await file.arrayBuffer();
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  // Prepend IV to ciphertext: [12 bytes IV][ciphertext]
  const combined = new Uint8Array(12 + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), 12);
  return new Blob([combined], { type: 'application/octet-stream' });
}

async function decryptFile(encryptedBlob: Blob, hexKey: string, originalName: string): Promise<void> {
  const key = await importKey(hexKey);
  const buffer = await encryptedBlob.arrayBuffer();
  const iv = new Uint8Array(buffer, 0, 12);
  const ciphertext = buffer.slice(12);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  const url = URL.createObjectURL(new Blob([plaintext]));
  const a = document.createElement('a');
  a.href = url;
  a.download = originalName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function formatBytes(b: number) {
  if (!b) return '';
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PackStore() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [myLicenses, setMyLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'browse' | 'create' | 'my'>('browse');
  const [selected, setSelected] = useState<Pack | null>(null);
  const [copiedKey, setCopiedKey] = useState('');
  // Create pack form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('رایگان');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newThumb, setNewThumb] = useState<File | null>(null);
  const [newThumbPreview, setNewThumbPreview] = useState('');
  const [creating, setCreating] = useState(false);
  const [createProgress, setCreateProgress] = useState(0);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  // Download with key
  const [downloadKey, setDownloadKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  useEffect(() => { loadPacks(); if (user) loadMyLicenses(); }, [user]);

  async function loadPacks() {
    const { data } = await supabase.from('mod_packs').select('*').order('created_at', { ascending: false });
    setPacks(data || []);
    setLoading(false);
  }

  async function loadMyLicenses() {
    if (!user) return;
    const { data } = await supabase.from('pack_licenses').select('*').eq('user_id', user.id);
    setMyLicenses(data || []);
  }

  async function createPack() {
    if (!newTitle.trim() || !newFile || !user) { setCreateError('عنوان و فایل اجباری است.'); return; }
    setCreating(true); setCreateError(''); setCreateSuccess('');
    try {
      setCreateProgress(10);
      // Generate AES-256 key
      const { raw: hexKey } = await generateKey();
      setCreateProgress(20);
      // Encrypt the file
      const encBlob = await encryptFile(newFile, hexKey);
      setCreateProgress(40);
      // Hash the key (stored for future verification, NOT the key itself)
      const keyHash = await sha256(hexKey);
      // Upload encrypted file to Supabase Storage
      const ts = Date.now();
      const uid = user.id;
      const { data: fileData, error: fileErr } = await supabase.storage
        .from('mods').upload(`packs/${uid}/${ts}/pack_enc`, encBlob, { upsert: true });
      if (fileErr) throw new Error(fileErr.message);
      setCreateProgress(70);
      const { data: urlData } = supabase.storage.from('mods').getPublicUrl(fileData.path);
      const fileUrl = urlData.publicUrl;
      // Upload thumbnail
      let thumbUrl = '';
      if (newThumb) {
        const { data: td } = await supabase.storage.from('mods').upload(`packs/${uid}/${ts}/thumb`, newThumb, { upsert: true });
        if (td) {
          const { data: tu } = supabase.storage.from('mods').getPublicUrl(td.path);
          thumbUrl = tu.publicUrl;
        }
      }
      setCreateProgress(85);
      // Save pack metadata (encryption key hash — NOT the key)
      const { data: packData, error: packErr } = await supabase.from('mod_packs').insert({
        user_id: uid,
        title: newTitle.trim(),
        description: newDesc.trim(),
        thumbnail_url: thumbUrl,
        file_url: fileUrl,
        price_display: newPrice.trim() || 'رایگان',
        encryption_key_hash: keyHash,
      }).select().maybeSingle();
      if (packErr) throw new Error(packErr.message);
      setCreateProgress(95);
      // Grant license to creator automatically
      if (packData) {
        await supabase.from('pack_licenses').insert({
          pack_id: packData.id,
          user_id: uid,
          license_key: hexKey,
          active: true,
        });
      }
      setCreateProgress(100);
      setCreateSuccess(
        `پک با موفقیت ساخته شد!\n\n🔑 کلید رمزنگاری (AES-256):\n${hexKey}\n\nاین کلید را در جای امنی نگه دارید. بدون این کلید فایل قابل باز شدن نیست.`
      );
      setNewTitle(''); setNewDesc(''); setNewFile(null); setNewThumb(null); setNewThumbPreview('');
      loadPacks();
    } catch (e) {
      setCreateError('خطا: ' + (e as Error).message);
    } finally {
      setCreating(false);
    }
  }

  async function downloadWithKey(pack: Pack) {
    if (!downloadKey.trim()) { setDownloadError('کلید رمزگشایی را وارد کنید.'); return; }
    setDownloading(true); setDownloadError('');
    try {
      // Verify key hash matches
      const inputHash = await sha256(downloadKey.trim());
      if (inputHash !== pack.encryption_key_hash) {
        setDownloadError('کلید نادرست است. با صاحب پک تماس بگیرید.');
        setDownloading(false); return;
      }
      // Download encrypted file
      const res = await fetch(pack.file_url);
      if (!res.ok) throw new Error('خطا در دریافت فایل از سرور');
      const blob = await res.blob();
      // Decrypt and download
      await decryptFile(blob, downloadKey.trim(), `${pack.title}.pack`);
      setDownloadKey('');
      setSelected(null);
    } catch (e) {
      setDownloadError('خطا: ' + (e as Error).message);
    } finally {
      setDownloading(false);
    }
  }

  function copyKey(key: string) {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  }

  const ownedPackIds = new Set(myLicenses.map(l => l.pack_id));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="card bg-gradient-to-r from-blue-500/10 via-dark-300 to-dark-300 border-blue-500/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0">
            <Shield size={24} className="text-blue-400" />
          </div>
          <div>
            <h2 className="font-orbitron font-black text-white tracking-widest">PACK STORE</h2>
            <p className="text-sm text-blue-400 font-rajdhani">پک‌های رمزنگاری‌شده — رمزگذاری AES-256</p>
            <p className="text-xs text-gray-500 font-rajdhani mt-0.5">محتوا بدون کلید قابل استفاده نیست</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'browse', label: 'مرور پک‌ها', icon: Package },
          { id: 'create', label: 'ساخت پک جدید', icon: Plus },
          { id: 'my', label: 'لایسنس‌های من', icon: Key },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-rajdhani font-semibold transition-all ${tab === t.id ? 'bg-blue-500/15 border-blue-500/40 text-blue-400' : 'bg-dark-300 border-dark-50 text-gray-500 hover:text-white'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Browse */}
      {tab === 'browse' && (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-dark-300 rounded-xl border border-dark-50 overflow-hidden animate-pulse">
                  <div className="h-36 bg-dark-200" />
                  <div className="p-3 space-y-2"><div className="h-4 bg-dark-200 rounded w-3/4" /><div className="h-3 bg-dark-200 rounded" /></div>
                </div>
              ))}
            </div>
          ) : packs.length === 0 ? (
            <div className="card flex flex-col items-center py-16 text-center">
              <Shield size={40} className="text-gray-700 mb-4" />
              <p className="font-rajdhani font-bold text-gray-500">هنوز پکی منتشر نشده</p>
              <button onClick={() => setTab('create')} className="btn-orange mt-4 flex items-center gap-2">
                <Plus size={14} /> اولین پک را بسازید
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {packs.map(pack => {
                const owned = ownedPackIds.has(pack.id);
                return (
                  <div key={pack.id} onClick={() => { setSelected(pack); setDownloadError(''); setDownloadKey(''); }}
                    className="bg-dark-300 rounded-xl border border-dark-50 hover:border-blue-500/30 transition-all cursor-pointer overflow-hidden group">
                    <div className="relative h-36 bg-dark-200 overflow-hidden">
                      {pack.thumbnail_url ? (
                        <img src={pack.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={36} className="text-gray-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-400/80 to-transparent" />
                      <div className="absolute top-2 right-2">
                        {owned ? (
                          <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 font-rajdhani">
                            <Unlock size={8} /> دارم
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 font-rajdhani">
                            <Lock size={8} /> قفل
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-rajdhani font-bold text-white text-sm truncate">{pack.title}</h3>
                      <p className="text-[10px] text-gray-500 font-rajdhani mt-0.5 line-clamp-2">{pack.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs font-rajdhani font-bold ${pack.price_display === 'رایگان' ? 'text-green-400' : 'text-orange-400'}`}>
                          {pack.price_display}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-gray-600 font-rajdhani">
                          <Shield size={9} /> AES-256
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create pack */}
      {tab === 'create' && (
        <div className="max-w-xl mx-auto space-y-4">
          <div className="flex gap-3 p-4 bg-blue-500/8 border border-blue-500/15 rounded-xl">
            <Shield size={16} className="text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-300 font-rajdhani leading-relaxed">
              فایل شما با <strong className="text-blue-400">رمزنگاری AES-256-GCM</strong> محافظت می‌شود.
              بدون کلید ۶۴ کاراکتری که هنگام ساخت به شما داده می‌شود، هیچکس نمی‌تواند فایل را باز کند.
              کلید را فقط به خریداران اعتماد شده بدهید.
            </p>
          </div>

          {createError && (
            <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-rajdhani">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" /> {createError}
            </div>
          )}

          {createSuccess && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl space-y-2">
              <p className="text-green-400 font-rajdhani font-bold text-sm">پک ساخته شد!</p>
              <div className="bg-dark-400 rounded-lg p-3 border border-green-500/20">
                <p className="text-[10px] text-gray-400 font-rajdhani mb-1">🔑 کلید AES-256 پک شما:</p>
                <p className="font-mono text-xs text-green-400 break-all leading-relaxed">{createSuccess.split('\n').find(l => l.length > 30)}</p>
                <button
                  onClick={() => copyKey(createSuccess.split('\n').find(l => l.length > 30) || '')}
                  className="mt-2 flex items-center gap-1.5 text-[10px] text-blue-400 hover:text-blue-300 font-rajdhani transition-colors">
                  {copiedKey ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                  {copiedKey ? 'کپی شد' : 'کپی کلید'}
                </button>
              </div>
              <p className="text-[10px] text-yellow-400 font-rajdhani">⚠️ این کلید فقط یک بار نمایش داده می‌شود. آن را ذخیره کنید!</p>
            </div>
          )}

          {creating && (
            <div className="card space-y-2">
              <div className="flex justify-between text-xs font-rajdhani">
                <span className="text-blue-400">رمزنگاری و آپلود...</span>
                <span className="font-mono text-gray-400">{createProgress}%</span>
              </div>
              <div className="h-2 bg-dark-400 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500" style={{ width: `${createProgress}%` }} />
              </div>
            </div>
          )}

          <div className="card space-y-4">
            <div>
              <label className="block text-xs text-gray-400 font-rajdhani mb-1.5">عنوان پک *</label>
              <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                placeholder="نام پک شما..." className="input-dark w-full" dir="rtl" maxLength={80} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 font-rajdhani mb-1.5">قیمت یا شرط دسترسی</label>
              <input type="text" value={newPrice} onChange={e => setNewPrice(e.target.value)}
                placeholder="مثال: رایگان / ۵۰,۰۰۰ تومان" className="input-dark w-full" dir="rtl" maxLength={40} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 font-rajdhani mb-1.5">توضیحات</label>
              <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)}
                placeholder="محتوای پک را توضیح دهید..." rows={3}
                className="input-dark w-full resize-none" dir="rtl" maxLength={500} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 font-rajdhani mb-1.5">تصویر کاور</label>
              <div onClick={() => thumbRef.current?.click()}
                className={`border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all h-24 flex items-center justify-center ${newThumbPreview ? '' : 'border-dark-50 hover:border-blue-500/40'}`}>
                {newThumbPreview ? (
                  <img src={newThumbPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center"><Upload size={20} className="text-gray-600 mx-auto mb-1" /><p className="text-xs text-gray-500 font-rajdhani">کاور پک</p></div>
                )}
                <input ref={thumbRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) { setNewThumb(f); setNewThumbPreview(URL.createObjectURL(f)); } }} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 font-rajdhani mb-1.5">فایل پک (رمزنگاری می‌شود) *</label>
              <div onClick={() => fileRef.current?.click()} onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); setNewFile(e.dataTransfer.files[0]); }}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${newFile ? 'border-green-500/40 bg-green-500/5' : 'border-dark-50 hover:border-blue-500/40'}`}>
                <input ref={fileRef} type="file" className="hidden" onChange={e => setNewFile(e.target.files?.[0] || null)} />
                {newFile ? (
                  <div className="flex items-center gap-2 justify-center">
                    <Lock size={16} className="text-green-400" />
                    <p className="text-sm text-white font-rajdhani truncate max-w-xs">{newFile.name}</p>
                    <button onClick={e => { e.stopPropagation(); setNewFile(null); }} className="text-red-400"><X size={12} /></button>
                  </div>
                ) : (
                  <div><Lock size={20} className="text-gray-600 mx-auto mb-1" /><p className="text-xs text-gray-500 font-rajdhani">فایل برای رمزنگاری</p></div>
                )}
              </div>
            </div>
            <button onClick={createPack} disabled={creating || !newTitle.trim() || !newFile || !user}
              className="btn-orange w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50">
              {creating ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Shield size={16} />}
              رمزنگاری و انتشار پک
            </button>
          </div>
        </div>
      )}

      {/* My licenses */}
      {tab === 'my' && (
        <div className="max-w-xl mx-auto">
          {!user ? (
            <div className="card text-center py-10">
              <Key size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 font-rajdhani">برای مشاهده لایسنس‌ها وارد شوید</p>
            </div>
          ) : myLicenses.length === 0 ? (
            <div className="card text-center py-10">
              <Key size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 font-rajdhani">هنوز لایسنسی ندارید</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myLicenses.map(lic => {
                const pack = packs.find(p => p.id === lic.pack_id);
                return (
                  <div key={lic.id} className="card">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                        <Key size={16} className="text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-rajdhani font-bold text-white text-sm">{pack?.title || 'پک ناشناخته'}</p>
                        <p className="text-[10px] text-gray-500 font-rajdhani mt-0.5">صادر شده: {new Date(lic.issued_at).toLocaleDateString('fa-IR')}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 bg-dark-400 rounded-lg px-3 py-1.5 border border-dark-50 relative">
                            <p className={`font-mono text-xs text-green-400 break-all ${showKey ? '' : 'blur-sm select-none'}`}>
                              {lic.license_key}
                            </p>
                          </div>
                          <button onClick={() => setShowKey(s => !s)}
                            className="p-2 rounded-lg bg-dark-200 border border-dark-50 text-gray-400 hover:text-white transition-colors">
                            {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button onClick={() => copyKey(lic.license_key)}
                            className="p-2 rounded-lg bg-dark-200 border border-dark-50 text-gray-400 hover:text-green-400 transition-colors">
                            {copiedKey === lic.license_key ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Pack detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-dark-300 rounded-2xl border border-dark-50 max-w-md w-full overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="relative h-40 bg-dark-200">
              {selected.thumbnail_url ? (
                <img src={selected.thumbnail_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Package size={40} className="text-gray-600" /></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-300 via-dark-300/10 to-transparent" />
              <button onClick={() => setSelected(null)}
                className="absolute top-3 left-3 w-8 h-8 rounded-full bg-dark-400/80 flex items-center justify-center text-gray-400 hover:text-white">
                <X size={16} />
              </button>
              <div className="absolute bottom-3 right-4">
                <h3 className="font-rajdhani font-black text-white text-lg">{selected.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[9px] text-blue-400 font-rajdhani"><Shield size={9} /> AES-256</span>
                  <span className={`text-xs font-rajdhani font-bold ${selected.price_display === 'رایگان' ? 'text-green-400' : 'text-orange-400'}`}>{selected.price_display}</span>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-300 font-rajdhani leading-relaxed">{selected.description || 'بدون توضیحات'}</p>
              <div className="flex gap-2 p-3 bg-blue-500/8 border border-blue-500/15 rounded-xl">
                <Lock size={14} className="text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400 font-rajdhani leading-relaxed">
                  این فایل با رمزنگاری <strong className="text-blue-400">AES-256</strong> محافظت شده. برای دانلود و استفاده به کلید رمزگشایی از صاحب پک نیاز دارید.
                </p>
              </div>
              {ownedPackIds.has(selected.id) ? (
                <div className="space-y-2">
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2">
                    <Unlock size={14} className="text-green-400" />
                    <p className="text-xs text-green-400 font-rajdhani">شما لایسنس این پک را دارید. کلید را از بخش «لایسنس‌های من» بگیرید.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 font-rajdhani mb-1.5">کلید رمزگشایی</label>
                    <div className="relative">
                      <input
                        type={showKey ? 'text' : 'password'}
                        value={downloadKey}
                        onChange={e => setDownloadKey(e.target.value)}
                        placeholder="کلید AES-256 (۶۴ کاراکتر)..."
                        className="input-dark w-full font-mono text-xs pr-10"
                        dir="ltr"
                      />
                      <button onClick={() => setShowKey(s => !s)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                        {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  {downloadError && (
                    <p className="text-xs text-red-400 font-rajdhani flex items-center gap-1">
                      <AlertTriangle size={12} /> {downloadError}
                    </p>
                  )}
                  <button onClick={() => downloadWithKey(selected)} disabled={downloading || !downloadKey.trim()}
                    className="btn-orange w-full flex items-center justify-center gap-2 disabled:opacity-50">
                    {downloading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Download size={15} />}
                    رمزگشایی و دانلود
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
