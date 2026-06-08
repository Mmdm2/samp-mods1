import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onDone: () => void;
}

export default function LoadingScreen({ onDone }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('بارگذاری...');

  useEffect(() => {
    const steps = [
      { pct: 15, text: 'بارگذاری دارایی‌ها...' },
      { pct: 30, text: 'آماده‌سازی اسکریپت‌ها...' },
      { pct: 50, text: 'اتصال به سرور...' },
      { pct: 70, text: 'بارگذاری تکسچرها...' },
      { pct: 85, text: 'آماده‌سازی SAMP Tools...' },
      { pct: 100, text: 'خوش آمدید!' },
    ];

    let i = 0;
    const iv = setInterval(() => {
      if (i >= steps.length) {
        clearInterval(iv);
        setTimeout(onDone, 400);
        return;
      }
      setProgress(steps[i].pct);
      setStatusText(steps[i].text);
      i++;
    }, 320);

    return () => clearInterval(iv);
  }, [onDone]);

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-between overflow-hidden">
      {/* Scanlines overlay */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{
        backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px)'
      }} />

      {/* Sky gradient */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to bottom, #0a0a1a 0%, #0d1a0d 35%, #1a1a00 55%, #2a1500 70%, #1a0800 85%, #000 100%)'
      }} />

      {/* Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() > 0.8 ? 2 : 1,
              height: Math.random() > 0.8 ? 2 : 1,
              top: `${Math.random() * 50}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2,
              animation: `flicker ${1 + Math.random() * 2}s infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Horizon glow */}
      <div className="absolute bottom-40 left-0 right-0 h-32 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 100% at 50% 100%, rgba(249,115,22,0.25) 0%, rgba(255,50,0,0.12) 40%, transparent 70%)'
      }} />

      {/* Moon */}
      <div className="absolute top-16 right-24 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-300 shadow-[0_0_20px_rgba(255,255,150,0.4)]" />

      {/* Palm trees SVG scene */}
      <div className="relative flex-1 flex items-end justify-center w-full max-w-2xl pb-8 z-10">
        <svg viewBox="0 0 700 340" className="w-full h-auto max-h-72" preserveAspectRatio="xMidYMax meet">
          {/* Ground */}
          <rect x="0" y="280" width="700" height="60" fill="#0a0a0a" />
          <rect x="0" y="275" width="700" height="10" fill="#1a1200" opacity="0.8" />

          {/* Reflection on ground */}
          <ellipse cx="350" cy="285" rx="300" ry="8" fill="rgba(249,115,22,0.08)" />

          {/* LEFT LARGE PALM */}
          {/* Trunk */}
          <path d="M110 285 Q105 240 100 195 Q108 185 116 195 Q112 240 118 285Z" fill="#8B6914" />
          {/* Curve in trunk */}
          <path d="M108 260 Q102 230 100 195" stroke="#6B4F10" strokeWidth="2" fill="none" opacity="0.5" />
          {/* Fronds */}
          <path d="M108 195 Q75 175 55 155 Q58 148 68 152 Q80 162 108 195Z" fill="#2D7A1F" />
          <path d="M108 195 Q85 160 80 135 Q85 130 92 135 Q98 148 108 195Z" fill="#348A24" />
          <path d="M108 195 Q108 155 112 130 Q118 128 122 134 Q120 158 108 195Z" fill="#3A9428" />
          <path d="M108 195 Q130 158 140 135 Q146 134 148 140 Q142 160 108 195Z" fill="#348A24" />
          <path d="M108 195 Q140 175 160 158 Q164 155 162 162 Q150 176 108 195Z" fill="#2D7A1F" />
          <path d="M108 195 Q95 172 88 155 Q82 148 88 148 Q96 155 108 195Z" fill="#267018" />
          {/* Coconuts */}
          <circle cx="104" cy="193" r="5" fill="#C68642" />
          <circle cx="112" cy="190" r="4.5" fill="#B5762E" />
          <circle cx="108" cy="196" r="4" fill="#C68642" />

          {/* CENTER TALL PALM */}
          <path d="M345 285 Q340 230 332 170 Q342 155 352 170 Q345 230 355 285Z" fill="#9B7420" />
          <path d="M342 240 Q335 200 332 170" stroke="#7A5A18" strokeWidth="2" fill="none" opacity="0.4" />
          {/* Fronds */}
          <path d="M342 170 Q295 145 268 118 Q272 110 282 115 Q302 128 342 170Z" fill="#33881A" />
          <path d="M342 170 Q310 130 305 100 Q312 96 320 102 Q328 120 342 170Z" fill="#3D9922" />
          <path d="M342 170 Q338 120 342 90 Q348 88 354 96 Q352 128 342 170Z" fill="#44AA28" />
          <path d="M342 170 Q372 128 382 100 Q388 98 390 106 Q384 128 342 170Z" fill="#3D9922" />
          <path d="M342 170 Q378 148 400 122 Q406 118 404 126 Q390 148 342 170Z" fill="#33881A" />
          <path d="M342 170 Q322 140 310 118 Q306 110 312 110 Q322 128 342 170Z" fill="#2A7A14" />
          {/* Coconuts */}
          <circle cx="338" cy="168" r="6" fill="#C68642" />
          <circle cx="347" cy="164" r="5.5" fill="#B5762E" />
          <circle cx="342" cy="172" r="5" fill="#D4974A" />

          {/* RIGHT PALM */}
          <path d="M580 285 Q576 248 572 210 Q580 200 588 210 Q585 248 592 285Z" fill="#8B6914" />
          {/* Fronds */}
          <path d="M580 210 Q548 192 528 172 Q532 165 542 170 Q555 180 580 210Z" fill="#2D7A1F" />
          <path d="M580 210 Q558 175 555 152 Q561 148 568 154 Q574 168 580 210Z" fill="#348A24" />
          <path d="M580 210 Q580 168 584 145 Q590 143 594 150 Q592 172 580 210Z" fill="#3A9428" />
          <path d="M580 210 Q600 172 610 152 Q616 150 618 158 Q612 175 580 210Z" fill="#348A24" />
          <path d="M580 210 Q610 192 628 175 Q632 172 630 180 Q618 192 580 210Z" fill="#2D7A1F" />
          {/* Coconuts */}
          <circle cx="576" cy="208" r="5" fill="#C68642" />
          <circle cx="584" cy="205" r="4.5" fill="#B5762E" />

          {/* Small background palms */}
          <path d="M220 285 Q218 262 215 240 Q221 233 227 240 Q224 262 228 285Z" fill="#5A4510" opacity="0.7" />
          <path d="M217 240 Q198 228 188 215 Q194 210 200 215Z" fill="#1E5512" opacity="0.7" />
          <path d="M217 240 Q220 218 222 208 Q228 208 228 215Z" fill="#236618" opacity="0.7" />
          <path d="M217 240 Q236 228 244 215 Q238 210 232 215Z" fill="#1E5512" opacity="0.7" />

          <path d="M470 285 Q468 255 465 228 Q471 220 477 228 Q474 255 480 285Z" fill="#5A4510" opacity="0.7" />
          <path d="M471 228 Q452 215 442 202 Q448 197 455 202Z" fill="#1E5512" opacity="0.7" />
          <path d="M471 228 Q475 205 477 195 Q483 196 483 202Z" fill="#236618" opacity="0.7" />
          <path d="M471 228 Q490 215 498 202 Q492 197 486 202Z" fill="#1E5512" opacity="0.7" />

          {/* Orange sun/glow on horizon */}
          <ellipse cx="350" cy="280" rx="220" ry="12" fill="rgba(249,115,22,0.15)" />
        </svg>
      </div>

      {/* Bottom HUD - GTA SA style */}
      <div className="relative z-20 w-full px-6 pb-6 space-y-3">
        {/* Title */}
        <div className="text-center mb-2">
          <h1 className="font-orbitron font-black text-2xl tracking-[0.3em] text-white"
            style={{ textShadow: '0 0 30px rgba(249,115,22,0.7), 0 0 60px rgba(249,115,22,0.4)' }}>
            SAMP<span className="text-orange-500"> TOOLS</span>
          </h1>
          <p className="text-orange-500 font-rajdhani text-sm tracking-[0.4em] mt-0.5">@XchoR MMD</p>
        </div>

        {/* Loading bar - GTA SA style */}
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-rajdhani text-gray-400 tracking-widest uppercase">{statusText}</span>
            <span className="text-[11px] font-orbitron text-orange-500">{progress}%</span>
          </div>
          {/* Outer bar */}
          <div className="h-3 bg-dark-500 border border-gray-800 rounded-sm overflow-hidden relative">
            {/* Segment lines (GTA SA style) */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-black z-10"
                style={{ left: `${(i + 1) * 5}%` }}
              />
            ))}
            <div
              className="h-full rounded-sm transition-all duration-300 ease-out relative overflow-hidden"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #c2570a 0%, #f97316 50%, #fb923c 100%)',
              }}
            >
              {/* Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-700 font-rajdhani tracking-widest">
          GTA SAN ANDREAS MULTIPLAYER TOOLKIT v2.0
        </p>
      </div>
    </div>
  );
}
