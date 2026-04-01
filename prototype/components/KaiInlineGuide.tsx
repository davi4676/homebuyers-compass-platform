'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Sparkles, X } from 'lucide-react'

interface KaiInlineGuideProps {
  phase: string
  phaseTitle: string
  tips: string[]
  defaultExpanded?: boolean
  userData?: {
    name: string
    zipCode: string
    creditScore: string
    savings: string
  }
}

export default function KaiInlineGuide({ 
  phase, 
  phaseTitle, 
  tips, 
  defaultExpanded = false,
  userData 
}: KaiInlineGuideProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="mb-6"
    >
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30 rounded-xl overflow-hidden">
        {/* Header */}
        <div 
          className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-start gap-3">
            {/* NQ Avatar - Compact */}
            <div className="flex-shrink-0">
              <div className="relative w-12 h-12">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-12 h-12 flex items-center justify-center shadow-lg border-2 border-white/30">
                  <svg viewBox="0 0 100 100" className="w-10 h-10">
                    <circle cx="50" cy="50" r="45" fill="white" opacity="0.95"/>
                    <text x="50" y="20" fontSize="10" fontWeight="bold" fill="#1e293b" textAnchor="middle">N</text>
                    <polygon points="50,30 53,50 50,52 47,50" fill="#ef4444"/>
                    <polygon points="50,70 53,50 50,48 47,50" fill="#3b82f6"/>
                    <circle cx="50" cy="50" r="3" fill="#1e293b"/>
                  </svg>
                </div>
                {/* Waving hand indicator */}
                <motion.div
                  animate={{ rotate: [0, 20, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute -right-1 -top-1 text-lg"
                >
                  👋
                </motion.div>
              </div>
            </div>

            {/* Message */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <span>NQ's Tips for {phaseTitle}</span>
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  </h4>
                  {userData?.name && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Personalized for {userData.name}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsDismissed(true)
                    }}
                    className="text-gray-400 hover:text-white p-1 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-blue-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-blue-400" />
                    )}
                  </motion.div>
                </div>
              </div>
              
              {!isExpanded && (
                <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                  {tips[0]}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3">
                {tips.map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                  >
                    <div className="flex gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <p className="text-sm text-gray-300 leading-relaxed">{tip}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
