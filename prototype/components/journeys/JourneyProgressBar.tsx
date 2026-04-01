'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export interface JourneyStepInfo {
  id: string
  label: string
  shortLabel?: string
}

interface JourneyProgressBarProps {
  steps: JourneyStepInfo[]
  currentStep: number
  onStepClick?: (index: number) => void
  allowJump?: boolean
  className?: string
}

export default function JourneyProgressBar({
  steps,
  currentStep,
  onStepClick,
  allowJump = false,
  className = '',
}: JourneyProgressBarProps) {
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-md p-4 ${className}`}
      role="navigation"
      aria-label="Journey progress"
    >
      <div className="mb-3 flex justify-between text-sm">
        <span className="text-slate-600 font-medium">Step {currentStep + 1} of {steps.length}</span>
        <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">{Math.round(progress)}% complete</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4">
        <motion.div
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'tween', duration: 0.4, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 rounded-full shadow-sm"
        />
      </div>
      <div className="flex justify-between gap-1">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isClickable = allowJump && (isCompleted || isCurrent)
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => isClickable && onStepClick?.(index)}
              disabled={!isClickable}
              className={`
                flex-1 min-w-0 flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all duration-200
                ${isClickable ? 'hover:bg-blue-50 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2' : ''}
                ${isCurrent ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' : ''}
                ${isCompleted ? 'text-emerald-600' : !isCurrent ? 'text-slate-400' : ''}
              `}
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={`${step.label}${isCompleted ? ', completed' : isCurrent ? ', current' : ''}`}
            >
              <span
                className={`
                  flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold shadow-sm
                  ${isCompleted ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white' : ''}
                  ${isCurrent ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-slate-200 text-slate-500' : ''}
                `}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <span className="text-xs font-medium truncate w-full text-center hidden sm:block">
                {step.shortLabel ?? step.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
