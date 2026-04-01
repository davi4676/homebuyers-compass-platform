'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Settings, X, Zap, BarChart3 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserTier, TIER_DEFINITIONS, TIER_ORDER, formatTierPrice } from '@/lib/tiers'
import { getUserTier, setUserTier } from '@/lib/user-tracking'

export default function DeveloperTierSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentTier, setCurrentTier] = useState<UserTier>('foundations')
  const [isDevMode, setIsDevMode] = useState(false)

  // Check if we're in development mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Show in development or if localStorage has dev mode enabled
      const devMode = 
        process.env.NODE_ENV === 'development' || 
        localStorage.getItem('devMode') === 'true' ||
        window.location.hostname === 'localhost'
      setIsDevMode(devMode)
      
      // Load current tier
      setCurrentTier(getUserTier())
    }
  }, [])

  // Keyboard shortcut: Ctrl+Shift+T to toggle
  useEffect(() => {
    if (!isDevMode) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDevMode])

  const handleTierChange = (tier: UserTier) => {
    setUserTier(tier)
    setCurrentTier(tier)
    // Trigger a custom event so components can react
    window.dispatchEvent(new CustomEvent('tierChanged', { detail: { tier } }))
    // Reload the page to update all components
    setTimeout(() => {
      window.location.reload()
    }, 300)
  }

  // Don't render if not in dev mode
  if (!isDevMode) return null

  const tiers = TIER_ORDER

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center gap-2 group"
        title="Developer Tier Switcher (Ctrl+Shift+T)"
      >
        <Zap size={20} className="group-hover:rotate-12 transition-transform" />
        <span className="hidden md:inline text-sm font-semibold">
          {TIER_DEFINITIONS[currentTier].name}
        </span>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 400, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 400, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-4 bottom-20 z-50 bg-gray-900 border-2 border-purple-500/50 rounded-xl p-6 shadow-2xl w-80 max-w-[calc(100vw-2rem)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Settings className="text-purple-400" size={20} />
                  <h3 className="text-lg font-bold text-white">Developer Tier Switcher</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Current Tier Display */}
              <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-purple-500/30">
                <p className="text-xs text-gray-400 mb-1">Current Tier</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {TIER_DEFINITIONS[currentTier].name}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {TIER_DEFINITIONS[currentTier].description}
                </p>
              </div>

              {/* Tier Buttons */}
              <div className="space-y-3">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                  Switch Tier
                </p>
                {tiers.map((tier) => {
                  const tierDef = TIER_DEFINITIONS[tier]
                  const isActive = currentTier === tier
                  
                  return (
                    <button
                      key={tier}
                      onClick={() => handleTierChange(tier)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        isActive
                          ? 'border-purple-500 bg-purple-900/30 shadow-lg shadow-purple-500/20'
                          : 'border-gray-700 bg-gray-800/50 hover:border-purple-500/50 hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-white">{tierDef.name}</span>
                        {isActive && (
                          <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{tierDef.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatTierPrice(tierDef)}</p>
                    </button>
                  )
                })}
              </div>

              {/* Analytics Dashboard (app creator) */}
              <div className="mt-6 pt-4 border-t border-gray-700">
                <Link
                  href="/analytics-dashboard"
                  className="flex items-center gap-2 w-full p-3 rounded-lg border border-gray-600 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium"
                >
                  <BarChart3 className="w-4 h-4 text-[#06b6d4]" />
                  Analytics Dashboard
                </Link>
              </div>

              {/* Keyboard Shortcut Hint */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-500 text-center">
                  Press <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300">Ctrl+Shift+T</kbd> to toggle
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
