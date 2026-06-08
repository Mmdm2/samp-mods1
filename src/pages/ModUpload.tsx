import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Video, X, Plus, Tag, Info, CheckCircle, AlertTriangle, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { id: 'vehicle', label: 'ماشین' },
  { id: 'skin', label: 'اسکین' },
  { id: 'map', label: 'نقشه' },
  { id: 'script', label: 'اسکریپت' },
  { id: 'texture', label: 'تکسچر' },
  { id: 'sound', label: 'صدا' },
  { id: 'other', label: 'سایر' },
];

const MAX_MOD_SIZE = 1024 * 1024 * 1024; // 1 GB
const MAX_MEDIA_SIZE = 50 * 1024 * 1024; // 50 MB per image/video

function formatBytes(b: number) {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  return `${(b / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function ModUpload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [version, setVersion] = useState('1.0');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [modFile, setModFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const modRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags(prev => [...prev, t]);
    }
    setTagInput('');
  }

  function removeTag(t: string) {
    setTags(prev => prev.filter(x => x !== t));
  }

  function handleModFile(f: File) {
    if (f.size > MAX_MOD_SIZE) {
      setError(`حجم فایل مود نباید بیشتر از ۱ گیگابایت باشد. حجم فعلی: ${formatBytes(f.size)}`);
      return;
    }
    setError('');
    setModFile(f);
  }

  function handleThumbnail(f: File) {
    if (!f.type.startsWith('image/')) { setError('تصویر کاور باید یک فایل تصویری باشد.'); return; }
    setThumbnail(f);
    setThumbnailPreview(URL.createObjectURL(f));
  }

  function handleMediaFiles(files: FileList) {
    const valid: File[] = [];
    const previews: string[] = [];
    for (const f of Array.from(files)) {
      if (f.size > MAX_MEDIA_SIZE) continue;
      if (!f.type.startsWith('image/') && !f.type.startsWith('video/')) continue;
      valid.push(f);
      previews.push(URL.createObjectURL(f));
    }
    setMediaFiles(prev => [...prev, ...valid].slice(0, 8));
    setMediaPreviews(prev => [...prev, ...previews].slice(0, 8));
  }

  function removeMedia(i: number) {
    setMediaFiles(prev => prev.filter((_, idx) => idx !== i));
    setMediaPreviews(prev => prev.filter((_, idx) => idx !== i));
  }

  async function uploadFile(file: File, path: string, onProgress?: (p: number) => void): Promise<string> {
    // Supabase storage upload with progress simulation
    const { data, error } = await supabase.storage.from('mods').upload(path, file, { upsert: true });
    if (error) throw new Error(error.message);
    const { data: urlData } = supabase.storage.from('mods').getPublicUrl(data.path);
    return urlData.publicUrl;
  }

  async function handleSubmit() {
    if (!title.trim()) { setError('عنوان مود را وارد کنید.'); return; }
    if (!description.trim()) { setError('توضیحات مود را وارد کنید.'); return; }
    if (!user) { setError('برای آپلود باید وارد شده باشید.'); return; }
    setError('');
    setUploading(true);
    setProgress(5);

    try {
      const uid = user.id;
      const ts = Date.now();

      // Upload thumbnail
      let thumbnailUrl = '';
      if (thumbnail) {
        setProgressLabel('آپلود تصویر کاور...');
        setProgress(15);
        thumbnailUrl = await uploadFile(thumbnail, `${uid}/${ts}/thumb_${thumbnail.name}`);
        setProgress(30);
      }

      // Upload media files
      const mediaUrls: string[] = [];
      if (mediaFiles.length > 0) {
        setProgressLabel('آپلود تصاویر و ویدیو...');
        for (let i = 0; i < mediaFiles.length; i++) {
          const url = await uploadFile(mediaFiles[i], `${uid}/${ts}/media_${i}_${mediaFiles[i].name}`);
          mediaUrls.push(url);
          setProgress(30 + Math.round((i + 1) / mediaFiles.length * 30));
        }
      }

      // Upload mod file
      let fileUrl = '';
      let fileSizeBytes = 0;
      if (modFile) {
        setProgressLabel('آپلود فایل مود... (این ممکن است چند دقیقه طول بکشد)');
        setProgress(60);
        fileUrl = await uploadFile(modFile, `${uid}/${ts}/mod_${modFile.name}`);
        fileSizeBytes = modFile.size;
        setProgress(90);
      }

      setProgressLabel('ذخیره اطلاعات...');
      const { error: dbErr } = await supabase.from('mods').insert({
        user_id: uid,
        title: title.trim(),
        description: description.trim(),
        category,
        version: version.trim() || '1.0',
        tags,
        file_url: fileUrl,
        file_size_bytes: fileSizeBytes,
        thumbnail_url: thumbnailUrl,
        media_urls: mediaUrls,
        published: true,
        approved: true,
      });

      if (dbErr) throw new Error(dbErr.message);

      setProgress(100);
      setProgressLabel('آپلود موفق!');
      setSuccess(true);
    } catch (e) {
      setError('خطا در آپلود: ' + (e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
          <CheckCircle size={40} className="text-green-400" />
        </div>
        <h2 className="font-orbitron font-black text-white text-xl">مود آپلود شد!</h2>
        <p className="text-gray-400 font-rajdhani">مود شما با موفقیت در Mod Store منتشر شد.</p>
        <div className="flex gap-3">
          <a href="/mod-store" className="btn-orange flex items-center gap-2">
            <Package size={15} /> مشاهده در Mod Store
          </a>
          <button onClick={() => { setSuccess(false); setTitle(''); setDescription(''); setModFile(null); setThumbnail(null); setThumbnailPreview(''); setMediaFiles([]); setMediaPreviews([]); setTags([]); setProgress(0); }}
            className="btn-outline">آپلود مود دیگر</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="card bg-gradient-to-r from-orange-500/10 to-dark-300 border-orange-500/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shrink-0">
            <Upload size={24} className="text-orange-500" />
          </div>
          <div>
            <h2 className="font-orbitron font-black text-white tracking-wide">آپلود مود</h2>
            <p className="text-sm text-gray-400 font-rajdhani">تا ۱ گیگابایت — تصویر، ویدیو، توضیحات</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300 font-rajdhani">{error}</p>
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between text-sm font-rajdhani">
            <span className="text-orange-400">{progressLabel}</span>
            <span className="text-gray-400 font-mono">{progress}%</span>
          </div>
          <div className="h-3 bg-dark-400 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
          {progress < 100 && modFile && progress >= 60 && (
            <p className="text-xs text-gray-500 font-rajdhani">آپلود فایل بزرگ ممکن است چند دقیقه طول بکشد. صفحه را نبندید.</p>
          )}
        </div>
      )}

      {/* Form */}
      <div className="card space-y-5">
        {/* Title + Version */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-400 font-rajdhani mb-1.5">عنوان مود *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="مثال: پک ماشین‌های ایرانی" className="input-dark w-full" dir="rtl" maxLength={80} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 font-rajdhani mb-1.5">نسخه</label>
            <input type="text" value={version} onChange={e => setVersion(e.target.value)}
              placeholder="1.0" className="input-dark w-full" dir="ltr" maxLength={10} />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs text-gray-400 font-rajdhani mb-1.5">دسته‌بندی *</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-rajdhani transition-all ${category === cat.id ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' : 'bg-dark-300 border-dark-50 text-gray-500 hover:text-white'}`}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs text-gray-400 font-rajdhani mb-1.5">توضیحات *</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder="توضیحات کامل مود خود را بنویسید..." rows={5}
            className="input-dark w-full resize-none" dir="rtl" maxLength={2000} />
          <p className="text-[10px] text-gray-600 font-rajdhani mt-1 text-left">{description.length}/2000</p>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs text-gray-400 font-rajdhani mb-1.5">تگ‌ها (حداکثر ۸)</label>
          <div className="flex gap-2">
            <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => (e.key === 'Enter' || e.key === ',') && (e.preventDefault(), addTag())}
              placeholder="تگ + Enter" className="input-dark flex-1 text-sm" dir="rtl" maxLength={20} />
            <button type="button" onClick={addTag} className="btn-outline px-3"><Plus size={14} /></button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-rajdhani">
                  <Tag size={9} /> {tag}
                  <button onClick={() => removeTag(tag)} className="ml-0.5 text-orange-600 hover:text-red-400"><X size={9} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail */}
        <div>
          <label className="block text-xs text-gray-400 font-rajdhani mb-1.5">تصویر کاور</label>
          <div
            onClick={() => thumbRef.current?.click()}
            className="relative border-2 border-dashed border-dark-50 hover:border-orange-500/40 rounded-xl overflow-hidden cursor-pointer transition-all h-32 flex items-center justify-center group"
          >
            {thumbnailPreview ? (
              <>
                <img src={thumbnailPreview} alt="cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <p className="text-white text-sm font-rajdhani">تغییر تصویر</p>
                </div>
              </>
            ) : (
              <div className="text-center">
                <ImageIcon size={24} className="text-gray-600 mx-auto mb-2 group-hover:text-orange-500 transition-colors" />
                <p className="text-xs text-gray-500 font-rajdhani">کلیک کنید یا بکشید</p>
              </div>
            )}
            <input ref={thumbRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && handleThumbnail(e.target.files[0])} />
          </div>
        </div>

        {/* Media files */}
        <div>
          <label className="block text-xs text-gray-400 font-rajdhani mb-1.5">تصاویر و ویدیوها (حداکثر ۸ فایل — هر کدام تا ۵۰ مگ)</label>
          <div
            onClick={() => mediaRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleMediaFiles(e.dataTransfer.files); }}
            className="border-2 border-dashed border-dark-50 hover:border-orange-500/40 rounded-xl p-4 cursor-pointer transition-all"
          >
            <input ref={mediaRef} type="file" accept="image/*,video/*" multiple className="hidden"
              onChange={e => e.target.files && handleMediaFiles(e.target.files)} />
            {mediaPreviews.length === 0 ? (
              <div className="flex items-center gap-3 justify-center text-gray-500">
                <Video size={20} className="text-gray-600" />
                <p className="text-sm font-rajdhani">تصویر یا ویدیو اضافه کنید</p>
              </div>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {mediaPreviews.map((p, i) => (
                  <div key={i} className="relative w-20 h-14 rounded-lg overflow-hidden bg-dark-400 border border-dark-50 group">
                    {mediaFiles[i]?.type.startsWith('video/') ? (
                      <video src={p} className="w-full h-full object-cover" />
                    ) : (
                      <img src={p} alt="" className="w-full h-full object-cover" />
                    )}
                    <button onClick={e => { e.stopPropagation(); removeMedia(i); }}
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-dark-400/80 flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {mediaPreviews.length < 8 && (
                  <div className="w-20 h-14 rounded-lg border-2 border-dashed border-dark-50 hover:border-orange-500/30 flex items-center justify-center cursor-pointer transition-all">
                    <Plus size={16} className="text-gray-600" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mod file */}
        <div>
          <label className="block text-xs text-gray-400 font-rajdhani mb-1.5">فایل مود (تا ۱ گیگابایت)</label>
          <div
            onClick={() => modRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); e.dataTransfer.files[0] && handleModFile(e.dataTransfer.files[0]); }}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${modFile ? 'border-green-500/40 bg-green-500/5' : 'border-dark-50 hover:border-orange-500/40'}`}
          >
            <input ref={modRef} type="file" className="hidden"
              onChange={e => e.target.files?.[0] && handleModFile(e.target.files[0])} />
            {modFile ? (
              <div className="flex items-center gap-3 justify-center">
                <Package size={20} className="text-green-400" />
                <div className="text-right">
                  <p className="text-sm font-rajdhani font-bold text-white truncate max-w-xs">{modFile.name}</p>
                  <p className="text-xs text-green-400 font-rajdhani">{formatBytes(modFile.size)}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); setModFile(null); }}
                  className="mr-2 text-red-400 hover:text-red-300"><X size={14} /></button>
              </div>
            ) : (
              <div>
                <Upload size={24} className="text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400 font-rajdhani">فایل مود را بکشید یا کلیک کنید</p>
                <p className="text-[10px] text-gray-600 font-rajdhani mt-1">همه فرمت‌ها پشتیبانی می‌شود • حداکثر ۱ گیگابایت</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={uploading || !title.trim() || !description.trim()}
          className="btn-orange w-full flex items-center justify-center gap-2 py-3 text-base disabled:opacity-50"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              در حال آپلود...
            </>
          ) : (
            <>
              <Upload size={18} /> انتشار مود
            </>
          )}
        </button>

        <div className="flex gap-2 p-3 bg-blue-500/8 border border-blue-500/15 rounded-xl">
          <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-400 font-rajdhani leading-relaxed">
            مودهایی که بیشترین لایک را دریافت کنند در <strong className="text-orange-400">Leaderboard</strong> قرار می‌گیرند و ممکن است جوایز ویژه دریافت کنند.
          </p>
        </div>
      </div>
    </div>
  );
}
