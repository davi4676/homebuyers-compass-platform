'use client'

import { motion } from 'framer-motion'
import { TIER_DEFINITIONS, type UserTier, TIER_ORDER, formatTierPrice } from '@/lib/tiers'
import { Sparkles, Zap, Shield, Crown, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface TierPreviewSwitcherEnhancedProps {
  currentTier: UserTier
  previewTier: UserTier
  onPreviewChange: (tier: UserTier) => void
  variant?: 'default' | 'compact'
  showPricing?: boolean
  className?: string
}

export default function TierPreviewSwitcherEnhanced({
  currentTier,
  previewTier,
  onPreviewChange,
  variant = 'default',
  showPricing = true,
  className = ''
}: TierPreviewSwitcherEnhancedProps) {
  const tiers = TIER_ORDER
  const [isCollapsed, setIsCollapsed] = useState(false)

  const getTierIcon = (tier: UserTier) => {
    switch (tier) {
      case 'foundations': return <Sparkles className="w-4 h-4" />
      case 'momentum': return <Zap className="w-4 h-4" />
      case 'navigator': return <Shield className="w-4 h-4" />
      case 'navigator_plus': return <Crown className="w-4 h-4" />
    }
  }

  const getTierColor = (tier: UserTier) => {
    switch (tier) {
      case 'foundations': return '#6B7280'
      case 'momentum': return '#06b6d4'
      case 'navigator': return '#f97316'
      case 'navigator_plus': return '#D4AF37'
    }
  }

  const getTierGradient = (tier: UserTier) => {
    switch (tier) {
      case 'foundations': return 'from-gray-600/20 to-gray-500/20'
      case 'momentum': return 'from-cyan-500/20 to-blue-500/20'
      case 'navigator': return 'from-orange-500/20 to-red-500/20'
      case 'navigator_plus': return 'from-[#D4AF37]/20 to-[#FFD700]/20'
    }
  }

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`inline-flex items-center gap-2 ${className}`}
      >
        <span className="text-sm text-gray-400">View as:</span>
        <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
          {tiers.map((tier) => {
            const tierDef = TIER_DEFINITIONS[tier]
            const isActive = previewTier === tier
            const isCurrentPlan = currentTier === tier
            const color = getTierColor(tier)
            
            return (
              <button
                key={tier}
                onClick={() => onPreviewChange(tier)}
                className={`
                  relative px-3 py-1.5 rounded-md font-semibold text-sm
                  transition-all duration-200
                  ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'}
                `}
                style={{
                  backgroundColor: isActive ? color : 'transparent',
                }}
              >
                <div className="flex items-center gap-1.5">
                  {getTierIcon(tier)}
                  <span className="hidden sm:inline">{tierDef.name}</span>
                  {isCurrentPlan && <span className="text-xs">✓</span>}
                </div>
                
                {isActive && (
                  <motion.div
                    layoutId="activeTier"
                    className="absolute inset-0 rounded-md"
                    style={{
                      backgroundColor: color,
                      filter: 'blur(8px)',
                      opacity: 0.3,
                      zIndex: -1,
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-8 ${className}`}
    >
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: `${getTierColor(previewTier)}20`,
                color: getTierColor(previewTier),
              }}
            >
              {getTierIcon(previewTier)}
            </div>
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Viewing as:{' '}
                <span style={{ color: getTierColor(previewTier) }}>
                  {TIER_DEFINITIONS[previewTier].name}
                </span>
              </h3>
              <p className="text-sm text-gray-400">
                {previewTier === currentTier 
                  ? "This is your current plan. Switch to preview other plans." 
                  : "Previewing what you'd get with this plan."}
              </p>
            </div>
          </div>
          
          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </motion.div>
          </button>
        </div>

        {/* Tier Selection */}
        <motion.div
          initial={false}
          animate={{ height: isCollapsed ? 0 : 'auto', opacity: isCollapsed ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tiers.map((tier) => {
              const tierDef = TIER_DEFINITIONS[tier]
              const isActive = previewTier === tier
              const isCurrentPlan = currentTier === tier
              const color = getTierColor(tier)
              const gradient = getTierGradient(tier)
              
              return (
                <motion.button
                  key={tier}
                  onClick={() => onPreviewChange(tier)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all duration-300
                    ${isActive 
                      ? 'border-current shadow-lg' 
                      : 'border-gray-700 hover:border-gray-600'}
                    bg-gradient-to-br ${gradient}
                  `}
                  style={{
                    borderColor: isActive ? color : undefined,
                    boxShadow: isActive ? `0 0 20px ${color}40` : undefined,
                  }}
                >
                  {/* Current Plan Badge */}
                  {isCurrentPlan && (
                    <div className="absolute -top-2 -right-2">
                      <div
                        className="px-2 py-0.5 rounded-full text-xs font-bold text-white flex items-center gap-1"
                        style={{ backgroundColor: color }}
                      >
                        <span>✓</span>
                        <span className="hidden sm:inline">Current</span>
                      </div>
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 mx-auto"
                    style={{
                      backgroundColor: `${color}20`,
                      color: color,
                    }}
                  >
                    {getTierIcon(tier)}
                  </div>

                  {/* Tier Name */}
                  <div className="text-center">
                    <div className="font-semibold text-white mb-1">
                      {tierDef.name}
                    </div>
                    
                    {/* Pricing */}
                    {showPricing && (
                      <div className="text-xs text-gray-400">
                        <span className="font-semibold" style={{ color }}>
                          {formatTierPrice(tierDef)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Help Text */}
          {previewTier !== currentTier && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/30"
            >
              <p className="text-sm text-gray-300 text-center">
                💡 Scroll down to see what's included and upgrade to{' '}
                <span className="font-semibold" style={{ color: getTierColor(previewTier) }}>
                  {TIER_DEFINITIONS[previewTier].name}
                </span>
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
