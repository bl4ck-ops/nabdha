/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        tajawal: ['Tajawal', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#fff0f3',
          100: '#ffe4e8',
          200: '#ffccd5',
          300: '#ffa0b4',
          400: '#ff6b8a',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        surface: '#fffaf9',
      },
      boxShadow: {
        'warm-sm': '0 1px 3px 0 rgba(225, 29, 72, 0.08)',
        'warm':    '0 4px 14px 0 rgba(225, 29, 72, 0.12)',
        'warm-lg': '0 10px 30px 0 rgba(225, 29, 72, 0.18)',
        'warm-xl': '0 20px 40px 0 rgba(225, 29, 72, 0.22)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.35s ease-out',
        'heartbeat':  'heartbeat 1.2s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'slide-in':   'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.18)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.55' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
