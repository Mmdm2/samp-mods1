import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  MessageSquare, Code2, Image, Crosshair, Package, Mic,
  Sun, Map, Wrench, Route, Home, Menu, X, LogOut, User,
  ChevronRight, Zap, Shield, Paintbrush, Sword, Wifi, BookOpen, Compass,
  Store, Trophy, Lock, Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', icon: Home, label: 'داشبورد', labelEn: 'Dashboard' },
  { path: '/ai-chat', icon: MessageSquare, label: 'هوش مصنوعی', labelEn: 'AI Chat' },
  { path: '/server-browser', icon: Wifi, label: 'سرور براوزر', labelEn: 'Server Browser' },
  { path: '/script-builder', icon: Code2, label: 'اسکریپت ساز', labelEn: 'Script Builder' },
  { path: '/image-editor', icon: Paintbrush, label: 'ویرایشگر تصویر', labelEn: 'Image Editor' },
  { path: '/skin-pack', icon: Image, label: 'اسکین پک', labelEn: 'Skin Pack' },
  { path: '/fist-icon', icon: Crosshair, label: 'فیست آیکون', labelEn: 'Fist Icon' },
  { path: '/txd-editor', icon: Package, label: 'ویرایشگر TXD', labelEn: 'TXD Editor' },
  { path: '/weapon-dat', icon: Sword, label: 'weapon.dat ساز', labelEn: 'Weapon.dat' },
  { path: '/timecycle', icon: Sun, label: 'تایم سایکل', labelEn: 'Timecycle' },
  { path: '/map-colorizer', icon: Map, label: 'رنگ‌کننده نقشه', labelEn: 'Map Colorizer' },
  { path: '/mod-builder', icon: Wrench, label: 'ساخت مود', labelEn: 'Mod Builder' },
  { path: '/voice-chat', icon: Mic, label: 'وایس چت', labelEn: 'Voice Chat' },
  { path: '/road-textures', icon: Route, label: 'جاده و تکسچر', labelEn: 'Road & Textures' },
  { path: '/tutorial', icon: BookOpen, label: 'آموزش مود سازی', labelEn: 'Tutorial' },
  { path: '/explore', icon: Compass, label: 'اکسپلور', labelEn: 'Explore' },
  { path: '/mod-store', icon: Store, label: 'فروشگاه مود', labelEn: 'Mod Store' },
  { path: '/mod-upload', icon: Upload, label: 'آپلود مود', labelEn: 'Upload Mod' },
  { path: '/leaderboard', icon: Trophy, label: 'لیدربورد', labelEn: 'Leaderboard' },
  { path: '/pack-store', icon: Lock, label: 'فروشگاه پک', labelEn: 'Pack Store' },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  const currentPage = navItems.find(item => item.path === location.pathname);

  return (
    <div className="flex min-h-screen bg-dark-400 grid-bg">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-dark-300 border-r border-dark-50 shrink-0 fixed left-0 top-0 h-full z-30">
        {/* Logo */}
        <div className="p-5 border-b border-dark-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
              <Zap size={20} className="text-orange-500" />
            </div>
            <div>
              <h1 className="font-orbitron font-black text-sm text-white tracking-widest">SAMP TOOLS</h1>
              <p className="text-[10px] text-orange-500 font-rajdhani tracking-widest">@XchoR MMD</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label, labelEn }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => isActive ? 'nav-item-active flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 font-rajdhani font-semibold tracking-wide text-sm' : 'nav-item-inactive flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 font-rajdhani font-semibold tracking-wide text-sm text-gray-400 hover:text-orange-400 hover:bg-orange-500/10'}
            >
              <Icon size={16} />
              <div className="flex-1 flex flex-col">
                <span>{label}</span>
                <span className="text-[10px] opacity-60 font-rajdhani">{labelEn}</span>
              </div>
              <ChevronRight size={12} className="opacity-40" />
            </NavLink>
          ))}
        </nav>

        {/* User area */}
        <div className="p-3 border-t border-dark-50">
          {user ? (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
                <User size={14} className="text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white font-rajdhani truncate">{user.phone || user.email || 'بازیکن'}</p>
                <p className="text-[10px] text-green-400 font-rajdhani">آنلاین</p>
              </div>
              <button
                onClick={signOut}
                className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="خروج"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 text-gray-500 text-xs">
              <Shield size={12} />
              <span className="font-rajdhani">وارد نشده‌اید</span>
            </div>
          )}
          <div className="mt-2 px-3">
            <p className="text-[10px] text-gray-600 font-rajdhani">Powered by @XchoR MMD • v2.0</p>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-72 bg-dark-300 border-r border-dark-50 z-50 md:hidden transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-dark-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap size={20} className="text-orange-500" />
            <div>
              <h1 className="font-orbitron font-black text-sm text-white">SAMP TOOLS</h1>
              <p className="text-[10px] text-orange-500">@XchoR MMD</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-80px)]">
          {navItems.map(({ path, icon: Icon, label, labelEn }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => isActive ? 'flex items-center gap-3 px-4 py-3 rounded-lg bg-orange-500/15 text-orange-400 border-l-2 border-orange-500 font-rajdhani font-semibold text-sm' : 'flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 font-rajdhani font-semibold text-sm'}
            >
              <Icon size={16} />
              <span>{label} <span className="text-xs opacity-60">({labelEn})</span></span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-dark-300/80 backdrop-blur-sm border-b border-dark-50 px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 text-gray-400 hover:text-orange-400 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="font-rajdhani font-bold text-base text-white">
                {currentPage?.label || 'SAMP Tools'}
              </h2>
              <p className="text-xs text-gray-500 hidden sm:block font-rajdhani">
                {currentPage?.labelEn || 'GTA San Andreas Multiplayer Toolkit'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="badge-orange hidden sm:flex">
              <Zap size={10} />
              SA-MP Tools
            </div>
            {user && (
              <div className="badge-green hidden sm:flex">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                آنلاین
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 page-enter">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="mobile-nav md:hidden fixed bottom-0 left-0 right-0 bg-dark-300/95 backdrop-blur-sm border-t border-dark-50 px-2 py-2 z-20 justify-around">
          {navItems.slice(0, 5).map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'text-orange-500' : 'text-gray-500'}`}
            >
              <Icon size={18} />
              <span className="text-[9px] font-rajdhani">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
