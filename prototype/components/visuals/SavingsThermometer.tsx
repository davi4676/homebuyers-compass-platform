'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Target } from 'lucide-react'
import { formatCurrency } from '@/lib/calculations'

interface SavingsThermometerProps {
  current: number
  target: number
  label?: string
  showTarget?: boolean
}

export default function SavingsThermometer({
  current,
  target,
  label = 'Potential Savings',
  showTarget = true,
}: SavingsThermometerProps) {
  const percentage = Math.min((current / target) * 100, 100)
  const milestones = [
    { value: target * 0.25, label: '25%' },
    { value: target * 0.5, label: '50%' },
    { value: target * 0.75, label: '75%' },
    { value: target, label: '100%' },
  ]

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-2xl border border-[#50C878]/30 p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{label}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#50C878]">
              {formatCurrency(current)}
            </span>
            {showTarget && (
              <>
                <span className="text-gray-400">of</span>
                <span className="text-xl font-semibold text-gray-300">
                  {formatCurrency(target)}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-[#50C878]">{Math.round(percentage)}%</div>
          <div className="text-sm text-gray-400">Complete</div>
        </div>
      </div>

      {/* Thermometer */}
      <div className="relative">
        <div className="h-8 bg-gray-800 rounded-full overflow-hidden border-2 border-gray-700">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-[#50C878] to-[#228B22] rounded-full flex items-center justify-end pr-2"
          >
            {percentage > 10 && (
              <TrendingUp className="w-5 h-5 text-white" />
            )}
          </motion.div>
        </div>

        {/* Milestone Markers */}
        <div className="flex justify-between mt-2">
          {milestones.map((milestone, index) => (
            <div
              key={index}
              className={`text-xs ${
                current >= milestone.value ? 'text-[#50C878] font-semibold' : 'text-gray-500'
              }`}
            >
              {milestone.label}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Message */}
      {percentage >= 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-4 rounded-lg bg-[#50C878]/20 border border-[#50C878]/30 flex items-center gap-2"
        >
          <Target className="w-5 h-5 text-[#50C878]" />
          <span className="text-sm font-semibold text-[#50C878]">
            Target Achieved! 🎉
          </span>
        </motion.div>
      )}
    </div>
  )
}
