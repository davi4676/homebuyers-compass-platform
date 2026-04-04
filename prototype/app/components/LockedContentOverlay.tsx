'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Lock, Crown, Zap, ArrowRight } from 'lucide-react'

interface LockedContentOverlayProps {
  title: string
  description: string
  features?: string[]
  ctaText?: string
  ctaLink?: string
  pricing?: string
  blur?: boolean
  children?: React.ReactNode
}

export default function LockedContentOverlay({
  title,
  description,
  features = [],
  ctaText = 'Upgrade to Momentum',
  ctaLink = '/upgrade',
  pricing = '$29',
  blur = true,
  children
}: LockedContentOverlayProps) {
  return (
    <div className="relative">
      {/* Blurred Content */}
      {blur && children && (
        <div className="pointer-events-none select-none blur-sm opacity-30">
          {children}
        </div>
      )}

      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`${blur ? 'absolute inset-0' : ''} flex items-center justify-center ${blur ? 'bg-gradient-to-br from-gray-900/95 to-gray-800/95' : 'bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-2 border-yellow-500/30 rounded-xl p-8'}`}
      >
        <div className="text-center max-w-md px-6 py-8">
          {/* Lock Icon with Crown */}
          <div className="relative inline-block mb-4">
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full p-4">
              <Lock className="text-yellow-400" size={40} />
            </div>
            <Crown className="absolute -top-2 -right-2 text-yellow-400" size={24} />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-white mb-2">
            {title}
          </h3>

          {/* Description */}
          <p className="text-gray-300 mb-4">
            {description}
          </p>

          {/* Features List */}
          {features.length > 0 && (
            <ul className="text-left space-y-2 mb-6 bg-gray-800/50 rounded-lg p-4">
              {features.map((feature, idx) => (
                <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                  <Zap className="text-yellow-400 flex-shrink-0 mt-0.5" size={14} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Pricing */}
          {pricing && (
            <p className="text-sm text-gray-400 mb-4">
              Starting at <span className="text-[#06b6d4] font-bold text-lg">{pricing}</span> one-time
            </p>
          )}

          {/* CTA Button */}
          <Link
            href={ctaLink}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:from-yellow-400 hover:to-orange-400 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Crown size={18} />
            {ctaText}
            <ArrowRight size={18} />
          </Link>

          <p className="text-xs text-gray-500 mt-3">
            30-day money-back guarantee
          </p>
        </div>
      </motion.div>
    </div>
  )
}

// Blur Overlay Component (for partial reveals)
export function BlurOverlay({ 
  text, 
  ctaLink = '/upgrade' 
}: { 
  text: string
  ctaLink?: string 
}) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/90 to-transparent flex items-end justify-center pb-4 z-10">
        <Link
          href={ctaLink}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-all text-sm"
        >
          <Lock size={14} />
          {text}
        </Link>
      </div>
    </div>
  )
}

// Tier Badge Component
export function PremiumBadge({ 
  tier = 'Foundations',
  size = 'sm'
}: { 
  tier?: string
  size?: 'xs' | 'sm' | 'md' 
}) {
  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1'
  }

  return (
    <span className={`inline-flex items-center gap-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-400 rounded-full font-bold ${sizeClasses[size]}`}>
      <Crown size={size === 'xs' ? 10 : size === 'sm' ? 12 : 14} />
      {tier}
    </span>
  )
}
