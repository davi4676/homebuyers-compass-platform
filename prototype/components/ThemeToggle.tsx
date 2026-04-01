'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

const STORAGE_KEY = 'nq-theme'

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const next = !document.documentElement.classList.contains('dark')
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem(STORAGE_KEY, 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem(STORAGE_KEY, 'light')
    }
    setDark(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-brand-sage/30 bg-brand-mist text-brand-forest transition hover:bg-brand-mist/80 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 ${className}`}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}
