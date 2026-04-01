'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Lock, Circle } from 'lucide-react'
import { UserTier } from '@/lib/tiers'

interface PhaseData {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  estimatedTime: string
  savingsPotential: string
  tierRequired?: UserTier
}

interface RoadmapProgressProps {
  phases: PhaseData[]
  userTier: UserTier
  onPhaseClick: (phase: PhaseData) => void
  getPhaseStatus: (phase: PhaseData) => 'locked' | 'available' | 'completed'
}

export default function RoadmapProgress({
  phases,
  userTier,
  onPhaseClick,
  getPhaseStatus,
}: RoadmapProgressProps) {
  const completedPhases = phases.filter((p) => getPhaseStatus(p) === 'completed').length
  const progress = (completedPhases / phases.length) * 100

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-2xl border border-[#06b6d4]/30 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Your Mortgage Savings Roadmap</h2>
        <div className="text-right">
          <div className="text-sm text-gray-400">Progress</div>
          <div className="text-2xl font-bold text-[#06b6d4]">{Math.round(progress)}%</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-[#06b6d4] to-[#22d3ee]"
          />
        </div>
      </div>

      {/* Phase Timeline */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-800" />

        <div className="space-y-6">
          {phases.map((phase, index) => {
            const status = getPhaseStatus(phase)
            const isLocked = status === 'locked'
            const isCompleted = status === 'completed'

            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start gap-4"
              >
                {/* Status Icon */}
                <div className="relative z-10 flex-shrink-0">
                  {isCompleted ? (
                    <div className="w-12 h-12 rounded-full bg-[#06b6d4] flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  ) : isLocked ? (
                    <div className="w-12 h-12 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-gray-600" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#06b6d4]/20 border-2 border-[#06b6d4] flex items-center justify-center">
                      <Circle className="w-6 h-6 text-[#06b6d4]" />
                    </div>
                  )}
                </div>

                {/* Phase Content */}
                <div
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    isLocked
                      ? 'border-gray-800 bg-gray-900/30 cursor-not-allowed opacity-60'
                      : 'border-[#06b6d4]/30 bg-gray-900/50 hover:border-[#06b6d4]/50 cursor-pointer'
                  }`}
                  onClick={() => !isLocked && onPhaseClick(phase)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold">{phase.title}</h3>
                        {phase.tierRequired && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              isLocked
                                ? 'bg-gray-800 text-gray-500'
                                : 'bg-[#06b6d4]/20 text-[#06b6d4]'
                            }`}
                          >
                            {phase.tierRequired === 'momentum' ? 'momentum' : 'navigator'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{phase.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>⏱️ {phase.estimatedTime}</span>
                        <span>💰 {phase.savingsPotential}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
