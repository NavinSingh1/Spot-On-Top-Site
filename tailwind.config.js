/** @type {import('tailwindcss').Config} */
const themed = (name) => `rgb(var(--${name}) / <alpha-value>)`;

const PAGE_ZOOM = 0.8;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: `${Math.round(1280 * PAGE_ZOOM)}px`, // 1024px
      '2xl': `${Math.round(1536 * PAGE_ZOOM)}px`, // 1229px
    },
    extend: {
      colors: {
        // Theme-aware surfaces (values live in src/styles/index.css)
        ink: {
          950: themed('ink-950'),
          900: themed('ink-900'),
          850: themed('ink-850'),
          800: themed('ink-800'),
          750: themed('ink-750'),
        },
        line: {
          DEFAULT: themed('line'),
          strong: themed('line-strong'),
        },
        fg: {
          DEFAULT: themed('fg'),
          muted: themed('fg-muted'),
          subtle: themed('fg-subtle'),
        },
        accent: themed('accent-ink'),
        'mint-ink': themed('mint-ink'),
        'iris-ink': themed('iris-ink'),
        'coral-ink': themed('coral-ink'),
        // Brand constants sampled from the design file
        gold: { DEFAULT: '#F5B52E', hover: '#FFC54A', deep: '#C98E12' },
        iris: { DEFAULT: '#8B7CF6', soft: '#A399FF' },
        mint: { DEFAULT: '#20CFA2', deep: '#0F7A63' },
        coral: { DEFAULT: '#F34C6F' },
        navy: { DEFAULT: '#030B1F', 800: '#0A1330', 700: '#111C40' },
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        display: ['Poppins', 'Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      maxWidth: {
        page: '1600px',
      },
      boxShadow: {
        card: '0 24px 60px -30px rgb(0 0 0 / 0.55)',
        glow: '0 0 0 4px rgb(245 181 46 / 0.18)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        progress: { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.45', transform: 'scale(0.8)' },
        },
        travel: { from: { 'stroke-dashoffset': '24' }, to: { 'stroke-dashoffset': '0' } },
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out both',
        'rise-in': 'rise-in 320ms ease-out both',
        'scale-in': 'scale-in 220ms ease-out both',
        progress: 'progress linear both',
        'pulse-dot': 'pulse-dot 1.6s ease-in-out infinite',
        travel: 'travel 1.2s linear infinite',
        'toast-in': 'toast-in 240ms ease-out both',
      },
    },
  },
  plugins: [],
};
