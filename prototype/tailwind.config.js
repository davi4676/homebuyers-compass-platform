/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['var(--font-dm-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-dm-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        savingsPulse: {
          '0%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(13, 148, 136, 0.4)',
          },
          '70%': {
            transform: 'scale(1.02)',
            boxShadow: '0 0 0 20px rgba(13, 148, 136, 0)',
          },
          '100%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(13, 148, 136, 0)',
          },
        },
      },
      animation: {
        'savings-pulse': 'savingsPulse 1s ease-out 0.5s 1 both',
      },
      fontSize: {
        'nav': ['0.9375rem', { lineHeight: '1.25rem', fontWeight: '500' }],
        'logo': ['1.25rem', { lineHeight: '1.5rem', fontWeight: '700' }],
        'logo-md': ['1.5rem', { lineHeight: '1.75rem', fontWeight: '700' }],
      },
      colors: {
        /** Phase 2 “Millennial Sweet Spot” tokens (use as bg-millennial-* / text-millennial-*) */
        millennial: {
          bg: '#fafaf5',
          surface: '#ffffff',
          border: '#e7e5e4',
          primary: '#0d9488',
          'primary-hover': '#0b7a72',
          'primary-light': '#ccfbf1',
          accent: '#c0622a',
          'accent-light': '#fed7aa',
          text: '#1c1917',
          'text-muted': '#57534e',
          'text-subtle': '#a8a29e',
          'cta-primary': '#0d9488',
          'cta-hover': '#0b7a72',
          'cta-secondary': '#1a6b3c',
          'cta-gold': '#d4a017',
        },
        brand: {
          cream: '#FAF7F2',
          forest: '#1B4332',
          sage: '#52796F',
          terracotta: '#C1440E',
          gold: '#D4A017',
          charcoal: '#2D2D2D',
          mist: '#EAF0EC',
        },
        /** Unified design system tokens */
        unified: {
          bg: '#fafaf9',
          surface: '#ffffff',
          primary: '#1a6b3c',
          'primary-hover': '#155c33',
          accent: '#0d9488',
          highlight: '#c0622a',
          'text-primary': '#1c1917',
          'text-secondary': '#57534e',
          'text-muted': '#a8a29e',
          border: '#e7e5e4',
          success: '#16a34a',
          warning: '#d97706',
        },
        /** Dark theme accent (legacy crypto/teal) — use with dark: */
        darkaccent: {
          teal: '#06b6d4',
          bg: '#0a0a0a',
          surface: '#171717',
        },
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        compass: {
          blue: '#0ea5e9',
          dark: '#0369a1',
          light: '#e0f2fe',
        },
        surface: {
          DEFAULT: '#0f172a',
          card: '#1e293b',
          muted: '#334155',
          border: '#475569',
        },
      },
    },
  },
  plugins: [],
}

