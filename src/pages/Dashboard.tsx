import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, Code2, Image, Crosshair, Package, Mic,
  Sun, Map, Wrench, Route, Zap, Star, TrendingUp, Users, Shield,
  Paintbrush, Sword, Wifi
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const tools = [
  { path: '/ai-chat', icon: MessageSquare, label: 'هوش مصنوعی SAMP', desc: 'پاسخ به تمام سوالات SA-MP', color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30', badge: 'AI' },
  { path: '/server-browser', icon: Wifi, label: 'سرور براوزر', desc: 'سرورهای ایرانی با IP و تعداد بازیکنان', color: 'from-green-500/20 to-green-600/10', border: 'border-green-500/30', badge: 'LIVE' },
  { path: '/script-builder', icon: Code2, label: 'اسکریپت ساز', desc: 'تولید اسکریپت .cs .lua .dat .sf', color: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/30', badge: 'CODE' },
  { path: '/image-editor', icon: Paintbrush, label: 'ویرایشگر تصویر', desc: 'ویرایش مثل PicsArt — حذف پس‌زمینه', color: 'from-pink-500/20 to-pink-600/10', border: 'border-pink-500/30', badge: 'EDIT' },
  { path: '/skin-pack', icon: Image, label: 'اسکین پک', desc: 'تغییر رنگ لباس اسکین‌ها', color: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/30', badge: 'IMG' },
  { path: '/fist-icon', icon: Crosshair, label: 'فیست آیکون ساز', desc: 'ساخت آیکون فیست برای SAMP', color: 'from-red-500/20 to-red-600/10', border: 'border-red-500/30', badge: 'ICON' },
  { path: '/txd-editor', icon: Package, label: 'ویرایشگر TXD', desc: 'ویرایش و بررسی فایل‌های TXD', color: 'from-yellow-500/20 to-yellow-600/10', border: 'border-yellow-500/30', badge: 'TXD' },
  { path: '/weapon-dat', icon: Sword, label: 'weapon.dat ساز', desc: 'ساخت weapon.dat با پریست و ویرایش', color: 'from-rose-500/20 to-rose-600/10', border: 'border-rose-500/30', badge: 'DAT' },
  { path: '/timecycle', icon: Sun, label: 'تایم سایکل ساز', desc: 'تولید timecyc.dat با رنگ دلخواه', color: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-500/30', badge: 'ENV' },
  { path: '/map-colorizer', icon: Map, label: 'رنگ‌کننده نقشه', desc: '144 نقشه یکجا رنگ کن و ZIP بگیر', color: 'from-cyan-500/20 to-cyan-600/10', border: 'border-cyan-500/30', badge: 'MAP' },
  { path: '/mod-builder', icon: Wrench, label: 'ساخت مود/پک', desc: 'ساخت و مدیریت پک‌ها و ایسبورکا', color: 'from-indigo-500/20 to-indigo-600/10', border: 'border-indigo-500/30', badge: 'MOD' },
  { path: '/voice-chat', icon: Mic, label: 'وایس چت', desc: 'صحبت با دیگر کاربران', color: 'from-fuchsia-500/20 to-fuchsia-600/10', border: 'border-fuchsia-500/30', badge: 'VOICE' },
  { path: '/road-textures', icon: Route, label: 'جاده و تکسچر', desc: 'تکسچرهای بهینه با امتیاز FPS', color: 'from-teal-500/20 to-teal-600/10', border: 'border-teal-500/30', badge: 'FPS' },
];

const stats = [
  { icon: Users, label: 'کاربر فعال', value: '12,847', color: 'text-blue-400' },
  { icon: Code2, label: 'اسکریپت ساخته شده', value: '48,321', color: 'text-green-400' },
  { icon: TrendingUp, label: 'نقشه رنگ‌شده', value: '7,293', color: 'text-orange-400' },
  { icon: Shield, label: 'پک ساخته شده', value: '3,102', color: 'text-purple-400' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const displayName = user?.phone
    ? user.phone.replace('+98', '0')
    : user?.email?.split('@')[0] || 'بازیکن';

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden border border-orange-500/20" style={{ background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)' }}>
        <div className="absolute inset-0 bg-orange-glow" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />

        {/* GTA SA Background image overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(https://images.pexels.com/photos/1082407/pexels-photo-1082407.jpeg?auto=compress&cs=tinysrgb&w=1200)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="badge-orange mb-4">
                <Star size={10} className="text-gold-400" />
                <span>SA-MP Professional Toolkit</span>
              </div>
              <h1 className="gta-text text-3xl md:text-5xl text-white mb-2">
                SAMP<span className="text-orange-500"> TOOLS</span>
              </h1>
              <p className="text-gray-300 font-rajdhani text-lg">
                سلام، <span className="text-orange-400 font-bold">{displayName}</span>! آماده‌ای؟ 🎮
              </p>
              <p className="text-gray-500 font-rajdhani text-sm mt-1">
                ابزار حرفه‌ای ساخت و ویرایش فایل‌های GTA San Andreas Multiplayer
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <p className="font-orbitron text-xs text-gray-600 tracking-widest">CREATED BY</p>
                <p className="font-orbitron font-black text-orange-500 text-xl tracking-widest">@XchoR MMD</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card text-center">
            <Icon size={20} className={`${color} mx-auto mb-2`} />
            <p className={`font-orbitron font-black text-xl ${color}`}>{value}</p>
            <p className="text-gray-500 text-xs font-rajdhani mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Tools grid */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <Zap size={18} className="text-orange-500" />
          <h2 className="font-rajdhani font-bold text-xl text-white">ابزارها</h2>
          <div className="flex-1 h-px bg-dark-50" />
          <span className="text-xs text-gray-500 font-rajdhani">{tools.length} ابزار</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tools.map(({ path, icon: Icon, label, desc, color, border, badge }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`card-hover text-left bg-gradient-to-br ${color} border ${border} group relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 bg-orange-500/5 rounded-full -translate-y-8 translate-x-8" />
              </div>

              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} border ${border} flex items-center justify-center`}>
                  <Icon size={18} className="text-white" />
                </div>
                <span className="badge badge-orange text-[9px]">{badge}</span>
              </div>

              <h3 className="font-rajdhani font-bold text-white text-base mb-1 group-hover:text-orange-400 transition-colors">
                {label}
              </h3>
              <p className="text-gray-500 text-xs font-rajdhani leading-relaxed">{desc}</p>

              <div className="mt-3 flex items-center gap-1 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-rajdhani">باز کردن</span>
                <Zap size={10} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick tips */}
      <div className="card border-orange-500/20">
        <h3 className="font-rajdhani font-bold text-orange-500 mb-4 flex items-center gap-2">
          <Star size={16} />
          نکات سریع SA-MP
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { tip: 'برای ساخت اسکریپت فیلترسکریپت، از بخش اسکریپت ساز استفاده کنید', type: 'اسکریپت' },
            { tip: 'تایم سایکل کد خود را در بخش تایم سایکل ساز رنگ‌بندی کنید', type: 'تایم سایکل' },
            { tip: 'اسکین پک خود را با آپلود PNG و انتخاب رنگ دلخواه بسازید', type: 'اسکین' },
          ].map(({ tip, type }) => (
            <div key={type} className="flex gap-3 p-3 bg-dark-300 rounded-lg">
              <div className="w-1 rounded-full bg-orange-500 shrink-0" />
              <div>
                <span className="badge-orange text-[9px] mb-1">{type}</span>
                <p className="text-gray-400 text-xs font-rajdhani mt-1">{tip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
