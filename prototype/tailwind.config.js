/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'nav': ['0.9375rem', { lineHeight: '1.25rem', fontWeight: '500' }],
        'logo': ['1.25rem', { lineHeight: '1.5rem', fontWeight: '700' }],
        'logo-md': ['1.5rem', { lineHeight: '1.75rem', fontWeight: '700' }],
      },
      colors: {
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

