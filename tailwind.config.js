/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        paper: {
          DEFAULT: '#F8F6F0',
          dark: '#EFEBE0',
          light: '#FCFBF8',
          card: '#FFFFFF',
        },
        ink: {
          DEFAULT: '#22282B',
          light: '#4A5568',
          muted: '#718096',
          faint: '#A0AEC0',
        },
        primary: {
          DEFAULT: '#E84118',
          dark: '#C8330D',
          light: '#F05D37',
          soft: '#FDF2EE',
        },
        ledger: {
          DEFAULT: '#1E7A46',
          dark: '#165D35',
          light: '#2E9C5E',
          soft: '#EAF5EE',
        },
        stamp: {
          DEFAULT: '#B33A3A',
          dark: '#8C2B2B',
          soft: '#FDF1F1',
        },
        route: {
          DEFAULT: '#2C5F74',
          dark: '#1F4758',
          light: '#3C7B96',
          soft: '#EEF6F9',
        },
        ochre: {
          DEFAULT: '#B8860B',
          dark: '#8C6608',
          soft: '#FDF7E8',
        },
        kraft: { DEFAULT: '#A0673B', dark: '#7A4C29', soft: '#F7EFE7' },
        gunmetal: { DEFAULT: '#566270', dark: '#3E4650', soft: '#EEF0F2' },
        resin: { DEFAULT: '#2E8F82', dark: '#20685F', soft: '#E9F5F3' },
        circuit: { DEFAULT: '#6B5B95', dark: '#4E4270', soft: '#F1EEF7' },
        flint: { DEFAULT: '#7FA6A0', dark: '#5C7E79', soft: '#EDF4F3' },
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(34, 40, 43, 0.05), 0 2px 6px -1px rgba(34, 40, 43, 0.03)',
        'card-hover': '0 12px 28px -4px rgba(34, 40, 43, 0.08), 0 4px 10px -2px rgba(34, 40, 43, 0.04)',
        'floating': '0 16px 36px -6px rgba(34, 40, 43, 0.12), 0 6px 14px -3px rgba(34, 40, 43, 0.06)',
        'stamp': 'inset 0 0 0 2px rgba(30, 122, 70, 0.3)',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pop': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '70%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'stamp-in': {
          '0%': { transform: 'scale(1.4) rotate(-6deg)', opacity: '0' },
          '60%': { transform: 'scale(0.96) rotate(-2deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(-3deg)', opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 320ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 240ms ease-out both',
        'pop': 'pop 280ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'stamp-in': 'stamp-in 360ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
};
