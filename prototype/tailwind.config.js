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
        display: ['var(--font-nq-sans)'],
        body: ['var(--font-nq-sans)'],
        sans: ['var(--font-nq-sans)'],
      },
      keyframes: {
        savingsPulse: {
          '0%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(20, 124, 114, 0.4)',
          },
          '70%': {
            transform: 'scale(1.02)',
            boxShadow: '0 0 0 20px rgba(20, 124, 114, 0)',
          },
          '100%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(20, 124, 114, 0)',
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
        /**
         * Unified editorial palette (Phase 2 "Millennial Sweet Spot" namespace retained for backward compat).
         * Page bg #F3F0E8 · Surface #FBF8F1 · Border #E3DCCF · Ink #171717 · Muted #5F5A51
         * Brand teal #147C72 · Soft teal #E3F1EE · Warm gold #B68A3A
         */
        millennial: {
          bg: '#f3f0e8',
          surface: '#fbf8f1',
          border: '#e3dccf',
          primary: '#147c72',
          'primary-hover': '#0f6058',
          'primary-light': '#e3f1ee',
          accent: '#b68a3a',
          'accent-light': '#f2e5c7',
          text: '#171717',
          'text-muted': '#5f5a51',
          'text-subtle': '#9c9588',
          'cta-primary': '#147c72',
          'cta-hover': '#0f6058',
          'cta-secondary': '#147c72',
          'cta-gold': '#b68a3a',
        },
        brand: {
          cream: '#fbf8f1',
          forest: '#147c72',
          sage: '#3e867f',
          terracotta: '#b68a3a',
          gold: '#b68a3a',
          charcoal: '#171717',
          mist: '#e3f1ee',
        },
        /** Unified design system tokens (aligned to editorial palette) */
        unified: {
          bg: '#f3f0e8',
          surface: '#fbf8f1',
          primary: '#147c72',
          'primary-hover': '#0f6058',
          accent: '#147c72',
          highlight: '#b68a3a',
          'text-primary': '#171717',
          'text-secondary': '#5f5a51',
          'text-muted': '#9c9588',
          border: '#e3dccf',
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

