/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea6c0a',
          700: '#c2570a',
          800: '#9a3412',
          900: '#7c2d12',
        },
        dark: {
          50: '#2a2a2a',
          100: '#222222',
          200: '#1c1c1c',
          300: '#161616',
          400: '#111111',
          500: '#0d0d0d',
          600: '#0a0a0a',
          700: '#080808',
          800: '#050505',
          900: '#020202',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      backgroundImage: {
        'gta-gradient': 'linear-gradient(135deg, #111111 0%, #1c1c1c 50%, #111111 100%)',
        'orange-glow': 'radial-gradient(ellipse at center, rgba(249,115,22,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'orange-glow': '0 0 20px rgba(249,115,22,0.4), 0 0 40px rgba(249,115,22,0.2)',
        'orange-sm': '0 0 10px rgba(249,115,22,0.3)',
        'gold-glow': '0 0 20px rgba(245,158,11,0.4)',
      },
      animation: {
        'pulse-orange': 'pulse-orange 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-orange': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.85 },
        },
        'slide-in': {
          from: { transform: 'translateX(-20px)', opacity: 0 },
          to: { transform: 'translateX(0)', opacity: 1 },
        },
        'fade-in': {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(249,115,22,0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(249,115,22,0.6), 0 0 50px rgba(249,115,22,0.3)' },
        },
      },
    },
  },
  plugins: [],
};
