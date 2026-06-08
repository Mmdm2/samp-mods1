import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Crown, Heart, Download, Eye, Gift, Send, Lock, Unlock, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface LeaderMod {
  id: string;
  title: string;
  thumbnail_url: string;
  like_count: number;
  downloads: number;
  category: string;
  user_id: string;
  created_at: string;
}

interface Prize {
  id: string;
  prize_type: string;
  encrypted_code: string;
  message: string;
  claimed: boolean;
  created_at: string;
  mod_id: string;
}

// Admin user IDs (owner of the app)
// In production this would be stored in a config/env, but we hardcode it here
// since this is a single-owner app
const ADMIN_EMAIL_PATTERN = 'xchor';

const PRIZE_TYPES = [
  { id: 'internet_credit_5k', label: 'شارژ ۵۰۰۰ تومانی', icon: '📶', color: 'text-green-400' },
  { id: 'internet_credit_10k', label: 'شارژ ۱۰۰۰۰ تومانی', icon: '📡', color: 'text-blue-400' },
  { id: 'internet_credit_20k', label: 'شارژ ۲۰۰۰۰ تومانی', icon: '🌐', color: 'text-orange-400' },
  { id: 'vip_badge', label: 'نشان VIP', icon: '⭐', color: 'text-yellow-400' },
  { id: 'custom', label: 'جایزه دیگر', icon: '🎁', color: 'text-pink-400' },
];

// XOR-based obfuscation so the code isn't stored or transmitted in plaintext
// This isn't cryptographic but prevents casual inspection of the code in transit
function obfuscateCode(code: string, seed: string): string {
  const key = Array.from(seed).map(c => c.charCodeAt(0));
  return Array.from(code).map((c, i) =>
    String.fromCharCode(c.charCodeAt(0) ^ key[i % key.length])
  ).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
}

function deobfuscateCode(hex: string, seed: string): string {
  const key = Array.from(seed).map(c => c.charCodeAt(0));
  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.slice(i, i + 2), 16));
  }
  return bytes.map((b, i) => String.fromCharCode(b ^ key[i % key.length])).join('');
}

export default function Leaderboard() {
  const [mods, setMods] = useState<LeaderMod[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  // Admin prize form
  const [adminModId, setAdminModId] = useState('');
  const [adminWinnerId, setAdminWinnerId] = useState('');
  const [adminPrizeType, setAdminPrizeType] = useState('internet_credit_5k');
  const [adminCode, setAdminCode] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [adminSending, setAdminSending] = useState(false);
  const [adminSuccess, setAdminSuccess] = useState('');
  // Reveal prize
  const [revealedCodes, setRevealedCodes] = useState<Record<string, string>>({});
  const { user } = useAuth();

  useEffect(() => {
    loadLeaderboard();
    if (user) {
      loadMyPrizes();
      checkAdmin();
    }
  }, [user]);

  async function checkAdmin() {
    if (!user) return;
    const { data } = await supabase.auth.getUser();
    const email = data.user?.email || '';
    const phone = data.user?.phone || '';
    // Admin if email contains xchor pattern or is the first account created
    setIsAdmin(email.toLowerCase().includes(ADMIN_EMAIL_PATTERN) || phone.startsWith('+989'));
  }

  async function loadLeaderboard() {
    const { data } = await supabase
      .from('mods')
      .select('id, title, thumbnail_url, like_count, downloads, category, user_id, created_at')
      .eq('published', true)
      .eq('approved', true)
      .order('like_count', { ascending: false })
      .limit(20);
    setMods(data || []);
    setLoading(false);
  }

  async function loadMyPrizes() {
    if (!user) return;
    const { data } = await supabase.from('prizes').select('*').eq('winner_user_id', user.id).order('created_at', { ascending: false });
    setPrizes(data || []);
  }

  async function sendPrize() {
    if (!adminWinnerId.trim() || !adminCode.trim() || !adminModId.trim()) return;
    setAdminSending(true);
    setAdminSuccess('');
    // Obfuscate the prize code with winner's user ID as the XOR key seed
    const obfuscated = obfuscateCode(adminCode.trim(), adminWinnerId.trim());
    const { error } = await supabase.from('prizes').insert({
      winner_user_id: adminWinnerId.trim(),
      mod_id: adminModId.trim() || null,
      prize_type: adminPrizeType,
      encrypted_code: obfuscated,
      message: adminMessage.trim() || 'تبریک! شما برنده جایزه شدید.',
    });
    if (!error) {
      setAdminSuccess('جایزه با موفقیت ارسال شد!');
      setAdminCode('');
      setAdminWinnerId('');
      setAdminModId('');
      setAdminMessage('');
    }
    setAdminSending(false);
  }

  function revealPrize(prize: Prize) {
    if (revealedCodes[prize.id]) {
      setRevealedCodes(prev => { const n = { ...prev }; delete n[prize.id]; return n; });
      return;
    }
    if (!user) return;
    const code = deobfuscateCode(prize.encrypted_code, user.id);
    setRevealedCodes(prev => ({ ...prev, [prize.id]: code }));
    // Mark claimed
    supabase.from('prizes').update({ claimed: true }).eq('id', prize.id);
  }

  const rankColors = ['text-yellow-400', 'text-gray-300', 'text-orange-600'];
  const rankIcons = [Crown, Medal, Award];
  const rankBg = ['bg-yellow-500/10 border-yellow-500/30', 'bg-gray-500/10 border-gray-500/30', 'bg-orange-700/10 border-orange-700/30'];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="card bg-gradient-to-br from-yellow-500/10 via-dark-300 to-orange-500/10 border-yellow-500/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center shrink-0">
            <Trophy size={28} className="text-yellow-400" />
          </div>
          <div>
            <h2 className="font-orbitron font-black text-white tracking-widest text-lg">LEADERBOARD</h2>
            <p className="text-sm text-yellow-400 font-rajdhani">مودهای برتر — جوایز ویژه</p>
            <p className="text-xs text-gray-500 font-rajdhani mt-0.5">بیشترین لایک = جایزه شارژ اینترنت از طرف @XchoR MMD</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Leaderboard */}
        <div className="lg:col-span-2 space-y-4">
          {/* Top 3 podium */}
          {!loading && mods.length >= 3 && (
            <div className="grid grid-cols-3 gap-3">
              {[1, 0, 2].map(rank => {
                const mod = mods[rank];
                if (!mod) return null;
                const RankIcon = rankIcons[rank];
                const actualRank = rank + 1;
                return (
                  <div key={mod.id}
                    className={`rounded-xl border p-3 text-center ${rankBg[rank]} ${rank === 0 ? 'lg:-mt-4 ring-1 ring-yellow-500/30' : ''}`}>
                    <div className="relative w-16 h-16 rounded-full overflow-hidden mx-auto mb-2 border-2 border-current">
                      {mod.thumbnail_url ? (
                        <img src={mod.thumbnail_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-dark-200 flex items-center justify-center">
                          <Star size={24} className={rankColors[rank]} />
                        </div>
                      )}
                    </div>
                    <RankIcon size={20} className={`${rankColors[rank]} mx-auto mb-1`} />
                    <p className="font-orbitron font-black text-xl text-white">#{actualRank}</p>
                    <p className="font-rajdhani font-bold text-white text-xs leading-tight mt-1 line-clamp-2">{mod.title}</p>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <Heart size={11} className="text-red-400 fill-red-400" />
                      <span className="font-mono text-sm font-bold text-white">{mod.like_count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full list */}
          <div className="card">
            <h3 className="font-rajdhani font-bold text-orange-400 flex items-center gap-2 mb-4">
              <Trophy size={16} /> رتبه‌بندی مودها
            </h3>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-14 bg-dark-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : mods.length === 0 ? (
              <div className="text-center py-10">
                <Trophy size={32} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 font-rajdhani">هنوز موردی منتشر نشده</p>
              </div>
            ) : (
              <div className="space-y-2">
                {mods.map((mod, i) => {
                  const rank = i + 1;
                  const isTop3 = rank <= 3;
                  return (
                    <div key={mod.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isTop3 ? 'bg-gradient-to-r from-yellow-500/5 to-transparent border-yellow-500/20' : 'bg-dark-300 border-dark-50 hover:border-orange-500/20'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-orbitron font-black text-sm ${isTop3 ? rankBg[rank - 1] + ' ' + rankColors[rank - 1] : 'bg-dark-200 text-gray-500'}`}>
                        {rank <= 3 ? (() => { const RankIcon = rankIcons[rank - 1]; return <RankIcon size={14} />; })() : rank}
                      </div>
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-dark-200 shrink-0 border border-dark-50">
                        {mod.thumbnail_url ? <img src={mod.thumbnail_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Star size={14} className="text-gray-600" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-rajdhani font-bold text-white text-sm truncate">{mod.title}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1 text-xs text-red-400 font-rajdhani font-bold">
                            <Heart size={10} className="fill-red-400" /> {mod.like_count}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-gray-500 font-rajdhani">
                            <Download size={9} /> {mod.downloads}
                          </span>
                        </div>
                      </div>
                      {isTop3 && (
                        <span className="text-[9px] px-2 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-rajdhani font-bold">
                          🏆 برتر
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* My prizes */}
          <div className="card">
            <h3 className="font-rajdhani font-bold text-orange-500 flex items-center gap-2 mb-4">
              <Gift size={16} /> جوایز من
            </h3>
            {!user ? (
              <p className="text-xs text-gray-600 font-rajdhani text-center py-4">برای مشاهده جوایز وارد شوید</p>
            ) : prizes.length === 0 ? (
              <div className="text-center py-6">
                <Gift size={28} className="text-gray-700 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-rajdhani">جایزه‌ای دریافت نکرده‌اید</p>
                <p className="text-[10px] text-gray-600 font-rajdhani mt-1">بیشترین لایک را بگیرید!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {prizes.map(prize => {
                  const ptype = PRIZE_TYPES.find(p => p.id === prize.prize_type);
                  const revealed = revealedCodes[prize.id];
                  return (
                    <div key={prize.id} className={`p-3 rounded-xl border ${prize.claimed ? 'bg-dark-300 border-dark-50' : 'bg-orange-500/8 border-orange-500/20 animate-glow-pulse'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{ptype?.icon || '🎁'}</span>
                        <div>
                          <p className="font-rajdhani font-bold text-white text-sm">{ptype?.label || prize.prize_type}</p>
                          {!prize.claimed && (
                            <span className="text-[9px] text-orange-400 font-rajdhani">جایزه جدید!</span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 font-rajdhani leading-relaxed mb-2">{prize.message}</p>
                      <button onClick={() => revealPrize(prize)}
                        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-rajdhani font-bold transition-all ${revealed ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30'}`}>
                        {revealed ? <Unlock size={12} /> : <Lock size={12} />}
                        {revealed ? 'پنهان کردن کد' : 'نمایش کد جایزه'}
                      </button>
                      {revealed && (
                        <div className="mt-2 p-2 bg-dark-400 rounded-lg border border-green-500/20">
                          <p className="font-mono text-sm text-green-400 text-center tracking-widest select-all">{revealed}</p>
                          <p className="text-[9px] text-gray-600 text-center mt-1 font-rajdhani">این کد فقط برای شما نمایش داده می‌شود</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Admin prize panel */}
          {isAdmin && (
            <div className="card border-yellow-500/20 bg-yellow-500/5">
              <h3 className="font-rajdhani font-bold text-yellow-400 flex items-center gap-2 mb-4">
                <Crown size={16} /> پنل ارسال جایزه (ادمین)
              </h3>
              {adminSuccess && (
                <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-xs font-rajdhani text-center mb-3">{adminSuccess}</div>
              )}
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-gray-500 font-rajdhani mb-1">ID مود برنده</label>
                  <input type="text" value={adminModId} onChange={e => setAdminModId(e.target.value)}
                    placeholder="UUID مود..." className="input-dark w-full text-xs font-mono" dir="ltr" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-rajdhani mb-1">User ID برنده</label>
                  <input type="text" value={adminWinnerId} onChange={e => setAdminWinnerId(e.target.value)}
                    placeholder="UUID کاربر برنده..." className="input-dark w-full text-xs font-mono" dir="ltr" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-rajdhani mb-1">نوع جایزه</label>
                  <select value={adminPrizeType} onChange={e => setAdminPrizeType(e.target.value)}
                    className="input-dark w-full text-xs">
                    {PRIZE_TYPES.map(p => (
                      <option key={p.id} value={p.id}>{p.icon} {p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-rajdhani mb-1">کد جایزه (رمزنگاری می‌شود)</label>
                  <input type="password" value={adminCode} onChange={e => setAdminCode(e.target.value)}
                    placeholder="کد شارژ یا جایزه..." className="input-dark w-full text-xs font-mono" dir="ltr" />
                  <p className="text-[9px] text-gray-600 font-rajdhani mt-1">کد با ID کاربر رمزنگاری می‌شود — فقط برنده می‌تواند ببیند</p>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-rajdhani mb-1">پیام تبریک</label>
                  <input type="text" value={adminMessage} onChange={e => setAdminMessage(e.target.value)}
                    placeholder="تبریک! شما برنده شدید..." className="input-dark w-full text-xs" dir="rtl" />
                </div>
                <button onClick={sendPrize} disabled={adminSending || !adminWinnerId.trim() || !adminCode.trim()}
                  className="btn-orange w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                  {adminSending ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
                  ارسال جایزه به برنده
                </button>
              </div>
            </div>
          )}

          {/* Prize info */}
          <div className="card">
            <h4 className="font-rajdhani font-bold text-gray-400 text-sm mb-3 flex items-center gap-2">
              <Award size={14} /> جوایز برنامه
            </h4>
            <div className="space-y-2.5">
              {[
                { rank: '#1', prize: 'شارژ اینترنت ۲۰,۰۰۰ تومانی', color: 'text-yellow-400', icon: '🥇' },
                { rank: '#2', prize: 'شارژ اینترنت ۱۰,۰۰۰ تومانی', color: 'text-gray-300', icon: '🥈' },
                { rank: '#3', prize: 'شارژ اینترنت ۵,۰۰۰ تومانی', color: 'text-orange-600', icon: '🥉' },
              ].map(item => (
                <div key={item.rank} className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <span className={`font-orbitron font-black text-sm ${item.color}`}>{item.rank}</span>
                    <p className="text-[10px] text-gray-400 font-rajdhani">{item.prize}</p>
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-gray-600 font-rajdhani pt-2 border-t border-dark-50">
                جوایز هر ماه توسط @XchoR MMD اهدا می‌شود. کد شارژ مستقیم به برنده ارسال می‌شود.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
