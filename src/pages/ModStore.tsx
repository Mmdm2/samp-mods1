import { useState, useEffect, useRef } from 'react';
import {
  Heart, Download, Eye, Search, Filter, Upload, Star, Flame,
  Clock, X, MessageSquare, Send, ChevronDown, Award, Share2,
  Play, Image as ImageIcon, Package, Tag, User as UserIcon
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Mod {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  version: string;
  tags: string[];
  file_url: string;
  file_size_bytes: number;
  thumbnail_url: string;
  media_urls: string[];
  downloads: number;
  views: number;
  like_count: number;
  published: boolean;
  created_at: string;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

const CATEGORIES = [
  { id: 'all', label: 'همه' },
  { id: 'vehicle', label: 'ماشین' },
  { id: 'skin', label: 'اسکین' },
  { id: 'map', label: 'نقشه' },
  { id: 'script', label: 'اسکریپت' },
  { id: 'texture', label: 'تکسچر' },
  { id: 'sound', label: 'صدا' },
  { id: 'other', label: 'سایر' },
];

function formatBytes(b: number) {
  if (b === 0) return '—';
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'همین الان';
  if (m < 60) return `${m} دقیقه پیش`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ساعت پیش`;
  const d = Math.floor(h / 24);
  return `${d} روز پیش`;
}

export default function ModStore() {
  const [mods, setMods] = useState<Mod[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<'hot' | 'new' | 'top'>('hot');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Mod | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => { loadMods(); }, [category, sort, search]);
  useEffect(() => { if (user) loadLikedIds(); }, [user]);

  async function loadMods() {
    setLoading(true);
    let q = supabase.from('mods').select('*').eq('published', true).eq('approved', true);
    if (category !== 'all') q = q.eq('category', category);
    if (search.trim()) q = q.ilike('title', `%${search.trim()}%`);
    if (sort === 'hot') q = q.order('like_count', { ascending: false });
    else if (sort === 'top') q = q.order('downloads', { ascending: false });
    else q = q.order('created_at', { ascending: false });
    const { data } = await q.limit(60);
    setMods(data || []);
    setLoading(false);
  }

  async function loadLikedIds() {
    if (!user) return;
    const { data } = await supabase.from('mod_likes').select('mod_id').eq('user_id', user.id);
    setLikedIds(new Set((data || []).map(r => r.mod_id)));
  }

  async function toggleLike(mod: Mod, e: React.MouseEvent) {
    e.stopPropagation();
    if (!user) return;
    const liked = likedIds.has(mod.id);
    if (liked) {
      await supabase.from('mod_likes').delete().eq('mod_id', mod.id).eq('user_id', user.id);
      await supabase.rpc('increment_mod_like', { p_mod_id: mod.id, delta: -1 });
      setLikedIds(prev => { const n = new Set(prev); n.delete(mod.id); return n; });
      setMods(prev => prev.map(m => m.id === mod.id ? { ...m, like_count: Math.max(0, m.like_count - 1) } : m));
      if (selected?.id === mod.id) setSelected(s => s ? { ...s, like_count: Math.max(0, s.like_count - 1) } : s);
    } else {
      await supabase.from('mod_likes').insert({ mod_id: mod.id, user_id: user.id });
      await supabase.rpc('increment_mod_like', { p_mod_id: mod.id, delta: 1 });
      setLikedIds(prev => new Set([...prev, mod.id]));
      setMods(prev => prev.map(m => m.id === mod.id ? { ...m, like_count: m.like_count + 1 } : m));
      if (selected?.id === mod.id) setSelected(s => s ? { ...s, like_count: s.like_count + 1 } : s);
    }
  }

  async function openMod(mod: Mod) {
    setSelected(mod);
    setComments([]);
    setCommentsLoading(true);
    await supabase.rpc('increment_mod_view', { p_mod_id: mod.id });
    const { data } = await supabase.from('mod_comments').select('*').eq('mod_id', mod.id).order('created_at', { ascending: true });
    setComments(data || []);
    setCommentsLoading(false);
    setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  async function postComment() {
    if (!commentText.trim() || !user || !selected) return;
    const text = commentText.trim();
    setCommentText('');
    await supabase.from('mod_comments').insert({ mod_id: selected.id, user_id: user.id, content: text });
    const { data } = await supabase.from('mod_comments').select('*').eq('mod_id', selected.id).order('created_at', { ascending: true });
    setComments(data || []);
    setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  async function handleDownload(mod: Mod) {
    if (!mod.file_url) return;
    await supabase.rpc('increment_mod_download', { p_mod_id: mod.id });
    window.open(mod.file_url, '_blank');
  }

  const catColor: Record<string, string> = {
    vehicle: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    skin: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    map: 'text-green-400 bg-green-500/10 border-green-500/20',
    script: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    texture: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    sound: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    other: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden border border-dark-50">
        <img src="https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="mods" className="w-full h-40 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-500/95 via-dark-500/70 to-transparent flex items-center px-6">
          <div>
            <h2 className="font-orbitron font-black text-white tracking-widest text-xl">MOD STORE</h2>
            <p className="text-sm text-orange-400 font-rajdhani mt-1">مودهای SA-MP را آپلود، لایک و دانلود کنید</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <span className="badge-orange"><Flame size={10} /> {mods.filter(m => m.like_count > 10).length} محبوب</span>
              <span className="badge-green"><Upload size={10} /> آپلود تا ۱ گیگ</span>
              <span className="badge-gold"><Award size={10} /> جوایز ویژه</span>
            </div>
          </div>
          <a href="/mod-upload" className="mr-auto btn-orange flex items-center gap-2 shrink-0">
            <Upload size={16} /> آپلود مود
          </a>
        </div>
      </div>

      {/* Search & sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="جستجوی مود..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-dark w-full pr-9"
            dir="rtl"
          />
        </div>
        <div className="flex gap-2">
          {[
            { id: 'hot', icon: Flame, label: 'داغ' },
            { id: 'new', icon: Clock, label: 'جدید' },
            { id: 'top', icon: Download, label: 'پردانلود' },
          ].map(s => (
            <button key={s.id} onClick={() => setSort(s.id as typeof sort)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-rajdhani transition-all ${sort === s.id ? 'bg-orange-500/15 border-orange-500/40 text-orange-400' : 'bg-dark-300 border-dark-50 text-gray-500 hover:text-white'}`}>
              <s.icon size={12} /> {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setCategory(cat.id)}
            className={`px-4 py-1.5 rounded-full border text-xs font-rajdhani font-semibold whitespace-nowrap transition-all ${category === cat.id ? 'bg-orange-500/15 border-orange-500/50 text-orange-400' : 'bg-dark-300 border-dark-50 text-gray-500 hover:text-white'}`}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-dark-300 rounded-xl border border-dark-50 overflow-hidden animate-pulse">
              <div className="h-40 bg-dark-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-dark-200 rounded w-3/4" />
                <div className="h-3 bg-dark-200 rounded w-full" />
                <div className="h-3 bg-dark-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : mods.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <Package size={40} className="text-gray-700 mb-4" />
          <p className="font-rajdhani font-bold text-gray-500">موردی یافت نشد</p>
          <a href="/mod-upload" className="btn-orange mt-4 flex items-center gap-2 text-sm">
            <Upload size={14} /> اولین مود را آپلود کنید
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mods.map(mod => {
            const liked = likedIds.has(mod.id);
            return (
              <div key={mod.id} onClick={() => openMod(mod)}
                className="bg-dark-300 rounded-xl border border-dark-50 hover:border-orange-500/30 transition-all duration-200 overflow-hidden group cursor-pointer">
                <div className="relative h-40 overflow-hidden bg-dark-200">
                  {mod.thumbnail_url ? (
                    <img src={mod.thumbnail_url} alt={mod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={36} className="text-gray-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-400/80 via-transparent to-transparent" />
                  <span className={`absolute top-2 left-2 text-[9px] px-1.5 py-0.5 rounded-full border font-rajdhani ${catColor[mod.category] || catColor.other}`}>
                    {CATEGORIES.find(c => c.id === mod.category)?.label || mod.category}
                  </span>
                  {mod.like_count >= 10 && (
                    <span className="absolute top-2 right-2 flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 font-rajdhani">
                      <Flame size={8} /> داغ
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-rajdhani font-bold text-white text-sm leading-tight truncate">{mod.title}</h3>
                  <p className="text-[10px] text-gray-500 font-rajdhani mt-0.5 line-clamp-2 leading-relaxed">{mod.description}</p>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-dark-50">
                    <div className="flex items-center gap-3">
                      <button onClick={e => toggleLike(mod, e)}
                        className={`flex items-center gap-1 text-xs font-rajdhani transition-colors ${liked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'}`}>
                        <Heart size={12} className={liked ? 'fill-red-400' : ''} />
                        {mod.like_count}
                      </button>
                      <span className="flex items-center gap-1 text-xs text-gray-600 font-rajdhani">
                        <Download size={10} /> {mod.downloads}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-600 font-rajdhani">{timeAgo(mod.created_at)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setSelected(null)}>
          <div className="bg-dark-300 rounded-2xl border border-dark-50 w-full max-w-2xl my-4 overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>
            {/* Cover */}
            <div className="relative h-56 bg-dark-200">
              {selected.thumbnail_url ? (
                <img src={selected.thumbnail_url} alt={selected.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={48} className="text-gray-600" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-300 via-dark-300/20 to-transparent" />
              <button onClick={() => setSelected(null)}
                className="absolute top-3 left-3 w-8 h-8 rounded-full bg-dark-400/80 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
              <div className="absolute bottom-4 right-4 left-4">
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border font-rajdhani ${catColor[selected.category] || catColor.other}`}>
                      {CATEGORIES.find(c => c.id === selected.category)?.label}
                    </span>
                    <h3 className="font-rajdhani font-black text-white text-xl mt-1 leading-tight">{selected.title}</h3>
                    <p className="text-xs text-gray-400 font-rajdhani">نسخه {selected.version} • {formatBytes(selected.file_size_bytes)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-dark-400 rounded-xl p-3 text-center border border-dark-50">
                  <Heart size={16} className="text-red-400 mx-auto mb-1" />
                  <p className="font-mono text-sm text-white font-bold">{selected.like_count}</p>
                  <p className="text-[10px] text-gray-500 font-rajdhani">لایک</p>
                </div>
                <div className="bg-dark-400 rounded-xl p-3 text-center border border-dark-50">
                  <Download size={16} className="text-green-400 mx-auto mb-1" />
                  <p className="font-mono text-sm text-white font-bold">{selected.downloads}</p>
                  <p className="text-[10px] text-gray-500 font-rajdhani">دانلود</p>
                </div>
                <div className="bg-dark-400 rounded-xl p-3 text-center border border-dark-50">
                  <Eye size={16} className="text-blue-400 mx-auto mb-1" />
                  <p className="font-mono text-sm text-white font-bold">{selected.views}</p>
                  <p className="text-[10px] text-gray-500 font-rajdhani">بازدید</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm text-gray-300 font-rajdhani leading-relaxed">{selected.description}</p>
              </div>

              {/* Tags */}
              {selected.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selected.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-dark-400 border border-dark-50 text-gray-500 font-rajdhani">
                      <Tag size={8} /> {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Media */}
              {selected.media_urls?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 font-rajdhani font-bold mb-2 flex items-center gap-1"><ImageIcon size={12} /> تصاویر و ویدیو</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selected.media_urls.map((url, i) => (
                      <div key={i} className="w-24 h-16 rounded-lg overflow-hidden bg-dark-400 shrink-0 border border-dark-50">
                        {url.match(/\.(mp4|webm|mov)$/i) ? (
                          <video src={url} className="w-full h-full object-cover" />
                        ) : (
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => toggleLike(selected, { stopPropagation: () => {} } as React.MouseEvent)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-rajdhani font-bold transition-all flex-1 justify-center ${likedIds.has(selected.id) ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-dark-200 border-dark-50 text-gray-400 hover:border-red-500/30 hover:text-red-400'}`}>
                  <Heart size={15} className={likedIds.has(selected.id) ? 'fill-red-400' : ''} />
                  {likedIds.has(selected.id) ? 'لایک شد' : 'لایک'} ({selected.like_count})
                </button>
                {selected.file_url && (
                  <button onClick={() => handleDownload(selected)}
                    className="btn-orange flex items-center gap-2 px-4 py-2.5 text-sm flex-1 justify-center">
                    <Download size={15} /> دانلود مود
                  </button>
                )}
              </div>

              {/* Comments */}
              <div>
                <h4 className="font-rajdhani font-bold text-white text-sm flex items-center gap-2 mb-3">
                  <MessageSquare size={14} className="text-orange-400" /> نظرات ({comments.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto mb-3 pr-1">
                  {commentsLoading ? (
                    <div className="flex justify-center py-4"><div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
                  ) : comments.length === 0 ? (
                    <p className="text-center text-xs text-gray-600 font-rajdhani py-4">اولین نظر را بنویسید!</p>
                  ) : (
                    comments.map(c => (
                      <div key={c.id} className="flex gap-2">
                        <div className="w-7 h-7 rounded-full bg-dark-200 border border-dark-50 flex items-center justify-center shrink-0">
                          <UserIcon size={12} className="text-gray-500" />
                        </div>
                        <div className="flex-1 bg-dark-400 rounded-xl px-3 py-2 border border-dark-50">
                          <p className="text-xs text-gray-300 font-rajdhani leading-relaxed">{c.content}</p>
                          <p className="text-[9px] text-gray-600 font-rajdhani mt-1">{timeAgo(c.created_at)}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={commentsEndRef} />
                </div>
                {user ? (
                  <div className="flex gap-2">
                    <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && postComment()}
                      placeholder="نظر خود را بنویسید..." className="input-dark flex-1 text-sm" dir="rtl" />
                    <button onClick={postComment} disabled={!commentText.trim()} className="btn-orange px-3 disabled:opacity-50">
                      <Send size={14} />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-600 font-rajdhani text-center py-2">برای ثبت نظر وارد شوید</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
