import { useState, useEffect, useCallback } from 'react';
import { Users, Wifi, RefreshCw, Star, Globe, Copy, Check, Zap, Signal, Filter } from 'lucide-react';

interface Server {
  ip: string;
  hostname: string;
  players: number;
  maxPlayers: number;
  gamemode: string;
  language: string;
  country: string;
  tags: string[];
  website: string;
  ping?: number;
  online?: boolean;
  isIranian?: boolean;
}

const FUNC_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/samp-servers`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const GAMEMODE_BADGES: Record<string, string> = {
  roleplay: 'badge-orange',
  'role play': 'badge-orange',
  rp: 'badge-orange',
  deathmatch: 'bg-red-500/20 text-red-400 border border-red-500/30',
  dm: 'bg-red-500/20 text-red-400 border border-red-500/30',
  freeroam: 'bg-green-500/20 text-green-400 border border-green-500/30',
  tdm: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
};

function PingBadge({ ping }: { ping?: number }) {
  if (!ping) return null;
  const color = ping < 60 ? 'text-green-400' : ping < 120 ? 'text-yellow-400' : 'text-red-400';
  const bars = ping < 60 ? 4 : ping < 120 ? 3 : ping < 200 ? 2 : 1;
  return (
    <div className={`flex items-center gap-1 text-[10px] font-mono ${color}`}>
      <span>{ping}ms</span>
      <div className="flex items-end gap-0.5">
        {[1, 2, 3, 4].map(b => (
          <div key={b} className={`w-1 rounded-sm ${b <= bars ? color.replace('text-', 'bg-') : 'bg-dark-50'}`} style={{ height: b * 3 }} />
        ))}
      </div>
    </div>
  );
}

function PlayerBar({ players, max }: { players: number; max: number }) {
  const pct = Math.min(100, (players / max) * 100);
  const color = pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-yellow-500' : 'bg-green-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-dark-400 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-mono text-gray-400 whitespace-nowrap">{players}/{max}</span>
    </div>
  );
}

export default function ServerBrowser() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [source, setSource] = useState<'live' | 'static'>('static');
  const [filter, setFilter] = useState<'all' | 'roleplay' | 'dm' | 'freeroam'>('all');
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('samp_favs') || '[]'); } catch { return []; }
  });
  const [copied, setCopied] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadServers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(FUNC_URL, {
        headers: { Authorization: `Bearer ${ANON_KEY}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setServers(data.servers || []);
      setSource(data.source || 'static');
      setLastUpdated(new Date());
    } catch (e) {
      setError('خطا در بارگذاری سرورها: ' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadServers(); }, [loadServers]);

  function copyIP(ip: string) {
    navigator.clipboard.writeText(ip);
    setCopied(ip);
    setTimeout(() => setCopied(null), 2000);
  }

  function toggleFav(ip: string) {
    const next = favorites.includes(ip) ? favorites.filter(f => f !== ip) : [...favorites, ip];
    setFavorites(next);
    localStorage.setItem('samp_favs', JSON.stringify(next));
  }

  const filtered = servers.filter(s => {
    const matchSearch = !search || s.hostname.toLowerCase().includes(search.toLowerCase()) || s.ip.includes(search) || s.gamemode.toLowerCase().includes(search.toLowerCase());
    const gm = s.gamemode.toLowerCase();
    const matchFilter = filter === 'all' ||
      (filter === 'roleplay' && (gm.includes('rp') || gm.includes('role') || gm.includes('نقش'))) ||
      (filter === 'dm' && (gm.includes('dm') || gm.includes('death') || gm.includes('tdm'))) ||
      (filter === 'freeroam' && (gm.includes('free') || gm.includes('فری')));
    return matchSearch && matchFilter;
  });

  const totalPlayers = servers.reduce((sum, s) => sum + s.players, 0);

  return (
    <div className="space-y-5">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'سرور آنلاین', value: servers.filter(s => s.online !== false).length, icon: Signal, color: 'text-green-400' },
          { label: 'کل بازیکنان', value: totalPlayers.toLocaleString(), icon: Users, color: 'text-orange-400' },
          { label: 'سرور ایرانی', value: servers.filter(s => s.isIranian).length, icon: Globe, color: 'text-blue-400' },
          { label: 'منبع', value: source === 'live' ? 'زنده' : 'آفلاین', icon: Wifi, color: source === 'live' ? 'text-green-400' : 'text-yellow-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card text-center">
            <Icon size={18} className={`${color} mx-auto mb-1`} />
            <p className={`font-orbitron font-black text-lg ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 font-rajdhani">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-40">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="جستجو نام سرور، IP، گیم‌مود..."
            className="input-dark pl-4 pr-4 text-sm"
          />
        </div>

        <div className="flex gap-1.5">
          {[
            { val: 'all', label: 'همه' },
            { val: 'roleplay', label: 'رول پلی' },
            { val: 'dm', label: 'DM / TDM' },
            { val: 'freeroam', label: 'فری رومَ' },
          ].map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setFilter(val as typeof filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-rajdhani font-bold border transition-all ${filter === val ? 'bg-orange-500/15 border-orange-500/40 text-orange-400' : 'border-dark-50 text-gray-500 hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={loadServers}
          disabled={loading}
          className="btn-outline flex items-center gap-1.5 py-2"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span className="text-xs">بروزرسانی</span>
        </button>
      </div>

      {lastUpdated && (
        <p className="text-[10px] text-gray-600 font-rajdhani -mt-2">
          آخرین بروزرسانی: {lastUpdated.toLocaleTimeString('fa-IR')} •
          {source === 'live' ? ' داده زنده از open.mp' : ' داده آفلاین'}
        </p>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-rajdhani">
          {error}
        </div>
      )}

      {/* Server list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-400 font-rajdhani">در حال بارگذاری سرورها...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="card text-center py-12">
              <Signal size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 font-rajdhani">سروری یافت نشد</p>
            </div>
          )}

          {filtered.map((server, idx) => (
            <div
              key={server.ip}
              className={`card-hover p-4 animate-fade-in ${!server.online ? 'opacity-60' : ''}`}
              style={{ animationDelay: `${idx * 0.03}s` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Rank + online status */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-8 text-center">
                    <span className="text-xs font-orbitron text-gray-600">#{idx + 1}</span>
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${server.online !== false ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`} />
                </div>

                {/* Server info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-rajdhani font-bold text-white text-base leading-tight">{server.hostname}</h3>
                    {server.isIranian && (
                      <span className="text-sm">🇮🇷</span>
                    )}
                    {favorites.includes(server.ip) && (
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="font-mono text-orange-400">{server.ip}</span>
                    <span className="text-gray-500 font-rajdhani">{server.gamemode}</span>
                    <span className="text-gray-600 font-rajdhani">{server.language}</span>
                  </div>

                  <div className="mt-2">
                    <PlayerBar players={server.players} max={server.maxPlayers} />
                  </div>
                </div>

                {/* Ping + actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <PingBadge ping={server.ping} />

                  <div className="flex items-center gap-1">
                    {/* Copy IP */}
                    <button
                      onClick={() => copyIP(server.ip)}
                      className="p-2 rounded-lg border border-dark-50 text-gray-500 hover:text-orange-400 hover:border-orange-500/30 transition-all"
                      title="کپی IP"
                    >
                      {copied === server.ip ? (
                        <Check size={13} className="text-green-400" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>

                    {/* Favorite */}
                    <button
                      onClick={() => toggleFav(server.ip)}
                      className={`p-2 rounded-lg border transition-all ${favorites.includes(server.ip) ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400' : 'border-dark-50 text-gray-500 hover:text-yellow-400'}`}
                      title="علاقه‌مندی"
                    >
                      <Star size={13} className={favorites.includes(server.ip) ? 'fill-yellow-400' : ''} />
                    </button>

                    {/* Connect button */}
                    <button
                      onClick={() => { window.location.href = `samp://${server.ip}`; }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/20 transition-all text-xs font-rajdhani font-bold"
                    >
                      <Zap size={11} /> اتصال
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="card border-orange-500/10">
        <h4 className="font-rajdhani font-bold text-gray-400 text-sm mb-3 flex items-center gap-2">
          <Globe size={14} /> راهنمای اتصال به سرور
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-500 font-rajdhani">
          <p>🎮 روی دکمه «اتصال» کلیک کنید تا SA-MP باز شود</p>
          <p>📋 IP را کپی کرده و در SA-MP وارد کنید</p>
          <p>⭐ سرورهای مورد علاقه را با ستاره مشخص کنید</p>
          <p>🔄 هر دقیقه بروزرسانی می‌شود</p>
        </div>
      </div>
    </div>
  );
}
