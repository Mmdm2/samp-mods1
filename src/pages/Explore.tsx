import { useState } from 'react';
import { Search, Download, Star, Eye, Tag, Grid3X3, List, Filter, ExternalLink, Flame, Clock, TrendingUp } from 'lucide-react';

interface ExploreItem {
  id: number;
  title: string;
  titleEn: string;
  category: 'script' | 'skin' | 'map' | 'mod' | 'sound' | 'vehicle';
  tags: string[];
  rating: number;
  downloads: number;
  views: number;
  author: string;
  date: string;
  description: string;
  image: string;
  featured?: boolean;
  hot?: boolean;
}

const ITEMS: ExploreItem[] = [
  {
    id: 1,
    title: 'سیستم VIP کامل',
    titleEn: 'Full VIP System',
    category: 'script',
    tags: ['pawn', 'vip', 'roleplay'],
    rating: 4.8,
    downloads: 2341,
    views: 8920,
    author: 'AliCoder',
    date: '۲ روز پیش',
    description: 'سیستم VIP کامل با ۵ سطح، ماشین‌های اختصاصی، و دسترسی به مناطق خاص.',
    image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400',
    featured: true,
    hot: true,
  },
  {
    id: 2,
    title: 'اسکین پلیس ایران',
    titleEn: 'Iran Police Skin Pack',
    category: 'skin',
    tags: ['police', 'iran', 'roleplay'],
    rating: 4.6,
    downloads: 1890,
    views: 6340,
    author: 'SkinMaster',
    date: '۱ هفته پیش',
    description: 'پک اسکین پلیس ایران شامل ۸ اسکین متفاوت برای سرورهای رول‌پلی.',
    image: 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=400',
    featured: true,
  },
  {
    id: 3,
    title: 'نقشه تهران',
    titleEn: 'Tehran Custom Map',
    category: 'map',
    tags: ['iran', 'tehran', 'custom'],
    rating: 4.9,
    downloads: 3120,
    views: 12500,
    author: 'MapperPro',
    date: '۳ روز پیش',
    description: 'نقشه اضافه‌شده تهران با خیابان‌ها، ساختمان‌ها و لوکیشن‌های واقعی.',
    image: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400',
    hot: true,
  },
  {
    id: 4,
    title: 'مود ماشین پراید',
    titleEn: 'Peugeot Pars / Pride Mod',
    category: 'vehicle',
    tags: ['car', 'iran', 'pride'],
    rating: 4.7,
    downloads: 4560,
    views: 15200,
    author: 'IranCars',
    date: '۵ روز پیش',
    description: 'مود ماشین پراید و پژو پارس با جزئیات بالا برای جایگزینی ماشین‌های اصلی.',
    image: 'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=400',
    featured: true,
    hot: true,
  },
  {
    id: 5,
    title: 'سیستم انتی‌چیت پیشرفته',
    titleEn: 'Advanced AntiCheat',
    category: 'script',
    tags: ['anticheat', 'security', 'pawn'],
    rating: 4.5,
    downloads: 1230,
    views: 4100,
    author: 'SecureRP',
    date: '۲ هفته پیش',
    description: 'سیستم انتی‌چیت با تشخیص speed hack، fly hack، aimbot و teleport.',
    image: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 6,
    title: 'افکت‌های صدای ایرانی',
    titleEn: 'Persian Sound Effects',
    category: 'sound',
    tags: ['sound', 'persian', 'audio'],
    rating: 4.3,
    downloads: 890,
    views: 3200,
    author: 'AudioFX',
    date: '۱ ماه پیش',
    description: 'مجموعه افکت‌های صوتی فارسی برای سرورهای رول‌پلی ایرانی.',
    image: 'https://images.pexels.com/photos/1626481/pexels-photo-1626481.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 7,
    title: 'سیستم خانه و آپارتمان',
    titleEn: 'House & Apartment System',
    category: 'script',
    tags: ['house', 'roleplay', 'pawn'],
    rating: 4.6,
    downloads: 2780,
    views: 9800,
    author: 'RPCoder',
    date: '۳ هفته پیش',
    description: 'سیستم کامل خانه، آپارتمان، خرید، فروش و تزئین برای سرورهای RP.',
    image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 8,
    title: 'اسکین‌های GTA SA HD',
    titleEn: 'HD Player Skins Pack',
    category: 'skin',
    tags: ['hd', 'skin', 'highquality'],
    rating: 4.4,
    downloads: 5610,
    views: 18900,
    author: 'HDSkins',
    date: '۴ روز پیش',
    description: '۵۰ اسکین با کیفیت بالا برای بازیکن‌ها، شامل لباس‌های مختلف.',
    image: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=400',
    hot: true,
  },
  {
    id: 9,
    title: 'سیستم دزدی بانک',
    titleEn: 'Bank Robbery System',
    category: 'script',
    tags: ['bank', 'robbery', 'roleplay'],
    rating: 4.7,
    downloads: 1950,
    views: 7300,
    author: 'CrimeRP',
    date: '۱ هفته پیش',
    description: 'سیستم دزدی بانک با مراحل مختلف، پلیس آگاه، و پاداش.',
    image: 'https://images.pexels.com/photos/50987/money-card-business-finance-50987.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 10,
    title: 'تکسچر جاده واقعی',
    titleEn: 'Realistic Road Textures',
    category: 'mod',
    tags: ['texture', 'road', 'hd'],
    rating: 4.8,
    downloads: 3400,
    views: 11200,
    author: 'TexturePro',
    date: '۶ روز پیش',
    description: 'پک تکسچر جاده‌های واقعی برای GTA SA با کیفیت ۲x بهتر از اصلی.',
    image: 'https://images.pexels.com/photos/259984/pexels-photo-259984.jpeg?auto=compress&cs=tinysrgb&w=400',
    featured: true,
  },
  {
    id: 11,
    title: 'موسیقی فارسی GTA SA',
    titleEn: 'Persian Radio Station',
    category: 'sound',
    tags: ['music', 'radio', 'persian'],
    rating: 4.2,
    downloads: 2100,
    views: 7900,
    author: 'RadioFarsi',
    date: '۲ ماه پیش',
    description: 'استیشن رادیو فارسی با ۲۰ آهنگ ایرانی برای درون بازی.',
    image: 'https://images.pexels.com/photos/164693/pexels-photo-164693.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 12,
    title: 'اسکریپت گنگ‌وار',
    titleEn: 'Gang War Script',
    category: 'script',
    tags: ['gang', 'war', 'turf'],
    rating: 4.5,
    downloads: 1670,
    views: 5800,
    author: 'GangRP',
    date: '۱۰ روز پیش',
    description: 'سیستم گنگ‌وار با منطقه‌های قابل تصرف، آمار، و سیستم درخت‌واره.',
    image: 'https://images.pexels.com/photos/1769735/pexels-photo-1769735.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'همه', labelEn: 'All' },
  { id: 'script', label: 'اسکریپت', labelEn: 'Scripts' },
  { id: 'skin', label: 'اسکین', labelEn: 'Skins' },
  { id: 'map', label: 'نقشه', labelEn: 'Maps' },
  { id: 'vehicle', label: 'ماشین', labelEn: 'Vehicles' },
  { id: 'mod', label: 'مود', labelEn: 'Mods' },
  { id: 'sound', label: 'صدا', labelEn: 'Sounds' },
];

const SORT_OPTIONS = [
  { id: 'hot', label: 'محبوب', icon: Flame },
  { id: 'new', label: 'جدید', icon: Clock },
  { id: 'top', label: 'برتر', icon: TrendingUp },
];

const categoryColors: Record<string, string> = {
  script: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  skin: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  map: 'text-green-400 bg-green-500/10 border-green-500/20',
  vehicle: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  mod: 'text-red-400 bg-red-500/10 border-red-500/20',
  sound: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
};

const categoryLabels: Record<string, string> = {
  script: 'اسکریپت',
  skin: 'اسکین',
  map: 'نقشه',
  vehicle: 'ماشین',
  mod: 'مود',
  sound: 'صدا',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star size={10} className="text-yellow-400 fill-yellow-400" />
      <span className="text-[10px] text-yellow-400 font-mono">{rating.toFixed(1)}</span>
    </div>
  );
}

function ItemCard({ item, view }: { item: ExploreItem; view: 'grid' | 'list' }) {
  const catColor = categoryColors[item.category] || categoryColors.script;

  if (view === 'list') {
    return (
      <div className="flex gap-4 p-4 bg-dark-300 rounded-xl border border-dark-50 hover:border-orange-500/20 transition-all group">
        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
          <img src={item.image} alt={item.titleEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-rajdhani font-bold text-white text-sm">{item.title}</h3>
                {item.hot && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 font-rajdhani">داغ</span>}
              </div>
              <p className="text-[10px] text-gray-500 font-rajdhani mt-0.5">{item.description.slice(0, 80)}...</p>
            </div>
            <div className={`text-[9px] px-2 py-0.5 rounded-full border font-rajdhani shrink-0 ${catColor}`}>
              {categoryLabels[item.category]}
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <StarRating rating={item.rating} />
            <span className="flex items-center gap-1 text-[10px] text-gray-500 font-rajdhani">
              <Download size={9} /> {item.downloads.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-gray-500 font-rajdhani">
              <Eye size={9} /> {item.views.toLocaleString()}
            </span>
            <span className="text-[10px] text-gray-600 font-rajdhani">{item.author}</span>
            <span className="text-[10px] text-gray-600 font-rajdhani mr-auto">{item.date}</span>
          </div>
        </div>
        <button className="btn-orange px-3 py-1.5 text-xs shrink-0 self-center">
          <Download size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-dark-300 rounded-xl border border-dark-50 hover:border-orange-500/30 transition-all duration-200 overflow-hidden group">
      <div className="relative h-36 overflow-hidden">
        <img src={item.image} alt={item.titleEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-400/90 via-transparent to-transparent" />
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-rajdhani ${catColor}`}>
            {categoryLabels[item.category]}
          </span>
          {item.hot && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 font-rajdhani flex items-center gap-0.5">
              <Flame size={8} /> داغ
            </span>
          )}
        </div>
        {item.featured && (
          <div className="absolute top-2 right-2">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-rajdhani font-bold text-white text-sm leading-tight">{item.title}</h3>
        <p className="text-[10px] text-gray-500 font-rajdhani mt-0.5 leading-relaxed line-clamp-2">{item.description}</p>

        <div className="flex flex-wrap gap-1 mt-2">
          {item.tags.slice(0, 3).map(tag => (
            <span key={tag} className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-dark-400 border border-dark-50 text-gray-500 font-rajdhani">
              <Tag size={7} /> {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-dark-50">
          <div className="flex items-center gap-3">
            <StarRating rating={item.rating} />
            <span className="flex items-center gap-1 text-[10px] text-gray-500 font-rajdhani">
              <Download size={9} /> {item.downloads.toLocaleString()}
            </span>
          </div>
          <button className="flex items-center gap-1 text-[10px] text-orange-400 hover:text-orange-300 font-rajdhani transition-colors">
            <ExternalLink size={10} /> دانلود
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Explore() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('hot');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selected, setSelected] = useState<ExploreItem | null>(null);

  const filtered = ITEMS.filter(item => {
    if (category !== 'all' && item.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      return item.title.includes(q) || item.titleEn.toLowerCase().includes(q) || item.tags.some(t => t.includes(q));
    }
    return true;
  }).sort((a, b) => {
    if (sort === 'hot') return b.downloads - a.downloads;
    if (sort === 'top') return b.rating - a.rating;
    return 0; // new — keep original order (newest added first)
  });

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden border border-dark-50">
        <img
          src="https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="GTA SA"
          className="w-full h-36 object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-400/95 via-dark-400/60 to-transparent flex items-center">
          <div className="px-6">
            <h2 className="font-orbitron font-black text-white tracking-widest text-lg">EXPLORE</h2>
            <p className="text-sm text-orange-400 font-rajdhani mt-1">اسکریپت، اسکین، نقشه و مود SA-MP</p>
            <div className="flex gap-3 mt-3">
              <span className="badge-orange"><Flame size={10} /> {ITEMS.filter(i => i.hot).length} محبوب</span>
              <span className="badge-gold"><Star size={10} /> {ITEMS.filter(i => i.featured).length} ویژه</span>
              <span className="badge-green"><Grid3X3 size={10} /> {ITEMS.length} آیتم</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="جستجو در اسکریپت‌ها، اسکین‌ها، مودها..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-dark w-full pr-9 text-sm"
            dir="rtl"
          />
        </div>
        <div className="flex gap-2">
          {SORT_OPTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-rajdhani transition-all ${sort === s.id ? 'bg-orange-500/15 border-orange-500/40 text-orange-400' : 'bg-dark-300 border-dark-50 text-gray-500 hover:text-white'}`}
            >
              <s.icon size={12} />
              {s.label}
            </button>
          ))}
          <button
            onClick={() => setView(v => v === 'grid' ? 'list' : 'grid')}
            className="p-2 rounded-lg border bg-dark-300 border-dark-50 text-gray-500 hover:text-orange-400 transition-colors"
          >
            {view === 'grid' ? <List size={15} /> : <Grid3X3 size={15} />}
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-rajdhani font-semibold whitespace-nowrap transition-all ${category === cat.id ? 'bg-orange-500/15 border-orange-500/50 text-orange-400' : 'bg-dark-300 border-dark-50 text-gray-500 hover:text-white'}`}
          >
            {cat.label}
            {cat.id !== 'all' && (
              <span className="text-[9px] bg-dark-400 rounded-full px-1.5 py-0.5 font-mono">
                {ITEMS.filter(i => i.category === cat.id).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="flex items-center gap-2 text-xs text-gray-500 font-rajdhani">
        <Filter size={12} />
        {filtered.length} نتیجه یافت شد
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <Search size={36} className="text-gray-700 mb-3" />
          <p className="font-rajdhani font-bold text-gray-500">نتیجه‌ای یافت نشد</p>
          <p className="text-xs text-gray-600 mt-1 font-rajdhani">جستجوی دیگری امتحان کنید</p>
        </div>
      ) : (
        <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
          {filtered.map(item => (
            <div key={item.id} onClick={() => setSelected(item)} className="cursor-pointer">
              <ItemCard item={item} view={view} />
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div
            className="bg-dark-300 rounded-2xl border border-dark-50 max-w-lg w-full overflow-hidden animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative h-48">
              <img src={selected.image} alt={selected.titleEn} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-300 via-dark-300/30 to-transparent" />
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 left-3 w-8 h-8 rounded-full bg-dark-400/80 flex items-center justify-center text-gray-400 hover:text-white"
              >
                ×
              </button>
              <div className="absolute bottom-3 right-4">
                <h3 className="font-rajdhani font-black text-white text-xl">{selected.title}</h3>
                <p className="text-xs text-orange-400 font-rajdhani">{selected.titleEn}</p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-300 font-rajdhani leading-relaxed">{selected.description}</p>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'امتیاز', value: selected.rating.toFixed(1), icon: Star, color: 'text-yellow-400' },
                  { label: 'دانلود', value: selected.downloads.toLocaleString(), icon: Download, color: 'text-green-400' },
                  { label: 'بازدید', value: selected.views.toLocaleString(), icon: Eye, color: 'text-blue-400' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-dark-400 rounded-xl p-3 text-center border border-dark-50">
                    <Icon size={16} className={`${color} mx-auto mb-1`} />
                    <p className="font-mono text-sm text-white font-bold">{value}</p>
                    <p className="text-[10px] text-gray-500 font-rajdhani">{label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {selected.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 rounded-full bg-dark-400 border border-dark-50 text-gray-400 font-rajdhani">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 font-rajdhani">
                <span>سازنده: <span className="text-orange-400">{selected.author}</span></span>
                <span>{selected.date}</span>
              </div>

              <button className="btn-orange w-full flex items-center justify-center gap-2">
                <Download size={15} /> دانلود رایگان
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
