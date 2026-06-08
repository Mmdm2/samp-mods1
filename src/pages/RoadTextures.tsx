import { useState, useEffect } from 'react';
import { Route, RefreshCw, Download, Zap, Star, Filter, ExternalLink, Clock } from 'lucide-react';

interface TexturePack {
  id: string;
  title: string;
  description: string;
  category: 'road' | 'building' | 'nature' | 'water' | 'sky' | 'vehicle';
  image_url: string;
  fps_rating: number;
  tags: string[];
  author: string;
  downloads: number;
  rating: number;
  size: string;
  fetched_at: string;
}

// Static texture packs (simulating daily-updated content)
const TEXTURE_PACKS: TexturePack[] = [
  {
    id: '1', title: 'Ultra HD Road Pack v2', description: 'تکسچر جاده با کیفیت 4K — بهینه برای FPS بالا',
    category: 'road', image_url: 'https://images.pexels.com/photos/1197095/pexels-photo-1197095.jpeg?auto=compress&cs=tinysrgb&w=400',
    fps_rating: 90, tags: ['HD', '4K', 'road', 'optimized'], author: 'GTA_Modder', downloads: 12847, rating: 4.8, size: '45 MB', fetched_at: new Date().toISOString(),
  },
  {
    id: '2', title: 'Los Santos Streets Remastered', description: 'بازسازی کامل خیابان‌های لس‌سانتوس',
    category: 'road', image_url: 'https://images.pexels.com/photos/1411264/pexels-photo-1411264.jpeg?auto=compress&cs=tinysrgb&w=400',
    fps_rating: 75, tags: ['LS', 'street', 'HD'], author: 'SanAndreas_Dev', downloads: 8432, rating: 4.6, size: '78 MB', fetched_at: new Date().toISOString(),
  },
  {
    id: '3', title: 'Desert Road Texture FPS Boost', description: 'جاده‌های بیابانی با حداقل افت FPS',
    category: 'road', image_url: 'https://images.pexels.com/photos/1252869/pexels-photo-1252869.jpeg?auto=compress&cs=tinysrgb&w=400',
    fps_rating: 95, tags: ['FPS', 'desert', 'performance'], author: 'FPS_King', downloads: 6321, rating: 4.9, size: '28 MB', fetched_at: new Date().toISOString(),
  },
  {
    id: '4', title: 'City Building Pack HQ', description: 'تکسچر ساختمان‌های شهری با کیفیت بالا',
    category: 'building', image_url: 'https://images.pexels.com/photos/161154/staircase-spiral-architecture-interior-161154.jpeg?auto=compress&cs=tinysrgb&w=400',
    fps_rating: 65, tags: ['building', 'city', 'HQ'], author: 'UrbanModder', downloads: 5129, rating: 4.4, size: '120 MB', fetched_at: new Date().toISOString(),
  },
  {
    id: '5', title: 'Nature Greenery Pack', description: 'درختان و گیاهان واقعی‌تر',
    category: 'nature', image_url: 'https://images.pexels.com/photos/145683/pexels-photo-145683.jpeg?auto=compress&cs=tinysrgb&w=400',
    fps_rating: 70, tags: ['nature', 'trees', 'HD'], author: 'NatureMod', downloads: 4892, rating: 4.5, size: '95 MB', fetched_at: new Date().toISOString(),
  },
  {
    id: '6', title: 'Ocean Water Ultra', description: 'آب اقیانوس با افکت موج واقعی',
    category: 'water', image_url: 'https://images.pexels.com/photos/1295138/pexels-photo-1295138.jpeg?auto=compress&cs=tinysrgb&w=400',
    fps_rating: 60, tags: ['water', 'ocean', 'reflection'], author: 'WaterMaster', downloads: 3847, rating: 4.7, size: '55 MB', fetched_at: new Date().toISOString(),
  },
  {
    id: '7', title: 'Sky Box Ultra HD', description: 'آسمان واقعی با ابرهای دینامیک',
    category: 'sky', image_url: 'https://images.pexels.com/photos/209831/pexels-photo-209831.jpeg?auto=compress&cs=tinysrgb&w=400',
    fps_rating: 85, tags: ['sky', 'clouds', 'HDR'], author: 'SkyModder', downloads: 7321, rating: 4.6, size: '42 MB', fetched_at: new Date().toISOString(),
  },
  {
    id: '8', title: 'Highway Markings Remaster', description: 'خطوط و علائم بزرگراه واقعی‌سازی شده',
    category: 'road', image_url: 'https://images.pexels.com/photos/1141853/pexels-photo-1141853.jpeg?auto=compress&cs=tinysrgb&w=400',
    fps_rating: 92, tags: ['highway', 'markings', 'optimized'], author: 'RoadMark', downloads: 4211, rating: 4.8, size: '18 MB', fetched_at: new Date().toISOString(),
  },
  {
    id: '9', title: 'Vehicle Paint Shader Pack', description: 'رنگ‌آمیزی بهتر برای ماشین‌ها',
    category: 'vehicle', image_url: 'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=400',
    fps_rating: 88, tags: ['vehicle', 'shader', 'paint'], author: 'CarMod_Pro', downloads: 9847, rating: 4.9, size: '32 MB', fetched_at: new Date().toISOString(),
  },
  {
    id: '10', title: 'Low Poly FPS Optimizer', description: 'تکسچرهای سبک برای سیستم‌های ضعیف',
    category: 'road', image_url: 'https://images.pexels.com/photos/1005417/pexels-photo-1005417.jpeg?auto=compress&cs=tinysrgb&w=400',
    fps_rating: 99, tags: ['low-poly', 'FPS', 'performance', 'lite'], author: 'LowPolyKing', downloads: 21847, rating: 4.7, size: '8 MB', fetched_at: new Date().toISOString(),
  },
  {
    id: '11', title: 'Graffiti Wall Pack', description: 'دیوارهای گرافیتی واقعی سبک SA',
    category: 'building', image_url: 'https://images.pexels.com/photos/1070536/pexels-photo-1070536.jpeg?auto=compress&cs=tinysrgb&w=400',
    fps_rating: 82, tags: ['graffiti', 'wall', 'art'], author: 'GraffitiDev', downloads: 3109, rating: 4.3, size: '67 MB', fetched_at: new Date().toISOString(),
  },
  {
    id: '12', title: 'Wet Road After Rain', description: 'جاده خیس با بازتاب چراغ‌ها',
    category: 'road', image_url: 'https://images.pexels.com/photos/1001965/pexels-photo-1001965.jpeg?auto=compress&cs=tinysrgb&w=400',
    fps_rating: 72, tags: ['rain', 'reflection', 'wet', 'night'], author: 'RainMod', downloads: 6782, rating: 4.6, size: '52 MB', fetched_at: new Date().toISOString(),
  },
];

const CATEGORIES = ['همه', 'road', 'building', 'nature', 'water', 'sky', 'vehicle'];
const CATEGORY_LABELS: Record<string, string> = {
  'همه': 'همه', 'road': 'جاده', 'building': 'ساختمان', 'nature': 'طبیعت',
  'water': 'آب', 'sky': 'آسمان', 'vehicle': 'ماشین',
};

function FPSBadge({ fps }: { fps: number }) {
  const color = fps >= 90 ? 'text-green-400 border-green-500/30 bg-green-500/10' : fps >= 70 ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' : 'text-red-400 border-red-500/30 bg-red-500/10';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-rajdhani font-bold border ${color}`}>
      <Zap size={8} /> {fps} FPS
    </span>
  );
}

export default function RoadTextures() {
  const [packs, setPacks] = useState<TexturePack[]>(TEXTURE_PACKS);
  const [category, setCategory] = useState('همه');
  const [sortBy, setSortBy] = useState<'fps' | 'downloads' | 'rating'>('fps');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated] = useState(new Date().toLocaleDateString('fa-IR'));

  const filtered = packs
    .filter(p => category === 'همه' || p.category === category)
    .sort((a, b) => {
      if (sortBy === 'fps') return b.fps_rating - a.fps_rating;
      if (sortBy === 'downloads') return b.downloads - a.downloads;
      return b.rating - a.rating;
    });

  async function refresh() {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1500));
    // In production: fetch from external API or Supabase
    setPacks([...TEXTURE_PACKS].sort(() => Math.random() - 0.5));
    setRefreshing(false);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock size={12} className="text-gray-500" />
            <span className="text-xs text-gray-500 font-rajdhani">آخرین بروزرسانی: {lastUpdated}</span>
          </div>
          <p className="text-xs text-gray-600 font-rajdhani">{packs.length} پک تکسچر • بروز می‌شود روزانه</p>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="btn-outline flex items-center gap-2"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'بروزرسانی...' : 'بروزرسانی'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-rajdhani font-bold border transition-all ${category === c ? 'bg-orange-500/15 border-orange-500/40 text-orange-400' : 'border-dark-50 text-gray-500 hover:border-orange-500/20 hover:text-gray-300'}`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Filter size={12} className="text-gray-500" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="bg-dark-200 border border-dark-50 text-gray-400 text-xs font-rajdhani rounded-lg px-2 py-1.5 focus:outline-none"
          >
            <option value="fps">بر اساس FPS</option>
            <option value="downloads">بر اساس دانلود</option>
            <option value="rating">بر اساس امتیاز</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(pack => (
          <div key={pack.id} className="card-hover p-0 overflow-hidden group">
            {/* Image */}
            <div className="relative h-40 overflow-hidden">
              <img
                src={pack.image_url}
                alt={pack.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-400 via-transparent to-transparent" />
              <div className="absolute top-2 right-2">
                <FPSBadge fps={pack.fps_rating} />
              </div>
              <div className="absolute top-2 left-2">
                <span className="badge badge-orange text-[9px]">{CATEGORY_LABELS[pack.category]}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-rajdhani font-bold text-white text-sm group-hover:text-orange-400 transition-colors leading-tight">{pack.title}</h3>
                <p className="text-[11px] text-gray-500 mt-1 font-rajdhani leading-relaxed">{pack.description}</p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-600 font-rajdhani">
                <div className="flex items-center gap-1">
                  <Star size={9} className="text-yellow-400" />
                  <span>{pack.rating}</span>
                </div>
                <span>{pack.downloads.toLocaleString()} دانلود</span>
                <span>{pack.size}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {pack.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-1.5 py-0.5 bg-dark-300 border border-dark-50 rounded text-[9px] text-gray-500 font-rajdhani">{tag}</span>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-dark-50">
                <span className="text-[10px] text-gray-600 font-rajdhani flex-1">by {pack.author}</span>
                <button className="flex items-center gap-1 text-[11px] font-rajdhani font-bold text-orange-400 hover:text-orange-300 transition-colors">
                  <Download size={10} /> دانلود
                </button>
                <button className="p-1 text-gray-600 hover:text-white transition-colors">
                  <ExternalLink size={10} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FPS guide */}
      <div className="card border-orange-500/10">
        <h3 className="font-rajdhani font-bold text-orange-500 flex items-center gap-2 mb-4">
          <Zap size={16} /> راهنمای FPS
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { range: '90+ FPS', label: 'عالی', desc: 'برای همه سیستم‌ها مناسب است', color: 'text-green-400', bg: 'bg-green-500/10' },
            { range: '70-89 FPS', label: 'خوب', desc: 'نیاز به سیستم متوسط', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { range: 'زیر 70 FPS', label: 'سنگین', desc: 'نیاز به سیستم قوی', color: 'text-red-400', bg: 'bg-red-500/10' },
          ].map(({ range, label, desc, color, bg }) => (
            <div key={range} className={`${bg} rounded-xl p-4`}>
              <div className={`font-orbitron font-black text-lg ${color}`}>{range}</div>
              <div className={`font-rajdhani font-bold ${color} mt-1`}>{label}</div>
              <p className="text-xs text-gray-500 mt-1 font-rajdhani">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
