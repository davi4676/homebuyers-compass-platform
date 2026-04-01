'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BADGES, type Badge } from '@/lib/gamification'

interface BadgeUnlockAnimationProps {
  badgeId: string
  onClose: () => void
}

export function BadgeUnlockAnimation({ badgeId, onClose }: BadgeUnlockAnimationProps) {
  const [badge, setBadge] = useState<Badge | null>(null)

  useEffect(() => {
    const foundBadge = BADGES.find((b) => b.id === badgeId)
    setBadge(foundBadge || null)
  }, [badgeId])

  if (!badge) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 pointer-events-auto"
          onClick={onClose}
        />

        {/* Badge Card */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
          }}
          className="relative bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-2xl p-8 max-w-md mx-4 pointer-events-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          {/* Badge Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-8xl mb-4 text-center"
          >
            {badge.icon}
          </motion.div>

          {/* Badge Name */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-white text-center mb-2"
          >
            {badge.name}
          </motion.h2>

          {/* Badge Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/90 text-center mb-6"
          >
            {badge.description}
          </motion.p>

          {/* XP Reward */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white/20 rounded-lg p-4 text-center"
          >
            <p className="text-white/80 text-sm mb-1">You earned</p>
            <p className="text-2xl font-bold text-white">+{badge.xpReward} XP</p>
          </motion.div>

          {/* Rarity Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 text-center"
          >
            <span
              className={`inline-block px-4 py-1 rounded-full text-xs font-semibold ${
                badge.rarity === 'legendary'
                  ? 'bg-yellow-400 text-yellow-900'
                  : badge.rarity === 'epic'
                  ? 'bg-purple-400 text-purple-900'
                  : badge.rarity === 'rare'
                  ? 'bg-blue-400 text-blue-900'
                  : 'bg-gray-400 text-gray-900'
              }`}
            >
              {badge.rarity.toUpperCase()}
            </span>
          </motion.div>

          {/* Confetti Effect */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
                scale: 1,
              }}
              animate={{
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() - 0.5) * 400,
                opacity: 0,
                scale: 0,
              }}
              transition={{
                duration: 1.5,
                delay: 0.7 + Math.random() * 0.3,
                ease: 'easeOut',
              }}
              className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400 rounded-full"
              style={{
                transform: `translate(-50%, -50%)`,
              }}
            />
          ))}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
