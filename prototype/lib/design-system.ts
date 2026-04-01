/**
 * Design System Configuration
 * Bank-Grade Trust Design for Mortgage Platform
 */

export const COLORS = {
  // Primary: Lighter blue - trust, stability
  primary: {
    main: '#0284c7',
    light: '#38bdf8',
    dark: '#0369a1',
    hover: '#0ea5e9',
  },
  // Secondary: Lighter green - growth, money
  secondary: {
    main: '#16a34a',
    light: '#4ade80',
    dark: '#15803d',
    hover: '#22c55e',
  },
  // Accent: Gold - premium, success (lighter)
  accent: {
    main: '#eab308',
    light: '#fde047',
    dark: '#ca8a04',
    hover: '#facc15',
  },
  // Warning: Amber - caution, attention
  warning: {
    main: '#f59e0b',
    light: '#fcd34d',
    dark: '#d97706',
  },
  // Success: Emerald - approval, go-ahead
  success: {
    main: '#10b981',
    light: '#6ee7b7',
    dark: '#059669',
  },
  // Error: Red for costs/danger (softer)
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#b91c1c',
  },
  // Neutral grays - dark palette
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  // Cyan theme - lighter
  cyan: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },
}

export const TYPOGRAPHY = {
  fonts: {
    header: 'Inter, system-ui, sans-serif',
    body: 'Source Sans Pro, system-ui, sans-serif',
    numbers: 'Roboto Mono, monospace',
    legal: 'IBM Plex Sans, sans-serif',
  },
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
}

export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
}

export const BORDER_RADIUS = {
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
}

export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
}

// Utility: merge class names (clsx-compatible)
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Button variants and sizes for UI components
export const buttonVariants = {
  primary:
    'bg-brand-forest text-white hover:bg-brand-sage dark:bg-cyan-600 dark:hover:bg-cyan-500',
  cta:
    'bg-brand-terracotta text-white hover:opacity-90 dark:bg-orange-600 dark:hover:bg-orange-500',
  secondary: 'bg-[#228B22] text-white hover:bg-[#2E8B57]',
  outline:
    'border-2 border-brand-forest text-brand-forest hover:bg-brand-forest/10 dark:border-cyan-500 dark:text-cyan-400',
  ghost: 'text-brand-forest hover:bg-brand-forest/10 dark:text-cyan-400 dark:hover:bg-white/10',
  danger: 'bg-[#DC143C] text-white hover:bg-[#8B0000]',
}
export const buttonSizes = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-6 py-3',
}

// Card styles for UI components (dark)
export const cardStyles = {
  base: 'rounded-xl border border-gray-600 bg-gray-800 shadow-sm',
  elevated: 'rounded-xl border border-gray-600 bg-gray-800 shadow-lg',
  hover: 'hover:shadow-md hover:border-gray-500 transition-shadow',
  interactive: 'cursor-pointer hover:shadow-md hover:border-cyan-500/50 transition-all',
}

// Trust signal badges and certifications
export const TRUST_BADGES = {
  bbb: {
    name: 'Better Business Bureau',
    url: '#',
    icon: '🏆',
  },
  soc2: {
    name: 'SOC 2 Type II Certified',
    url: '#',
    icon: '🔒',
  },
  encrypted: {
    name: '256-bit SSL Encryption',
    url: '#',
    icon: '🔐',
  },
  verified: {
    name: 'Verified Reviews',
    url: '#',
    icon: '✓',
  },
}
