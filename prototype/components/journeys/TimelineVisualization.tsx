'use client'

import { motion } from 'framer-motion'
import { Check, Circle } from 'lucide-react'

export interface TimelineMilestone {
  id: string
  label: string
  sublabel?: string
  completed?: boolean
}

interface TimelineVisualizationProps {
  milestones: TimelineMilestone[]
  title?: string
  variant?: 'single' | 'dual'
  secondTrack?: { title: string; milestones: TimelineMilestone[] }
  className?: string
}

export default function TimelineVisualization({
  milestones,
  title,
  variant = 'single',
  secondTrack,
  className = '',
}: TimelineVisualizationProps) {
  const renderTrack = (milestonesList: TimelineMilestone[], trackTitle?: string) => (
    <div className="relative">
      {trackTitle && (
        <h4 className="text-sm font-semibold text-slate-700 mb-3">{trackTitle}</h4>
      )}
      <div className="relative pl-8">
        <div
          className="absolute left-3 top-0 bottom-0 w-0.5 rounded-full bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200"
          aria-hidden
        />
        {milestonesList.map((m, i) => (
          <div key={m.id} className="relative flex gap-3 pb-6 last:pb-0">
            <span
              className={`
                absolute left-0 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 bg-white shadow-sm
                ${m.completed ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-300 text-slate-400'}
              `}
            >
              {m.completed ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : <Circle className="h-3 w-3" />}
            </span>
            <div className="pt-0.5">
              <p className="font-medium text-slate-900">{m.label}</p>
              {m.sublabel && <p className="text-sm text-slate-500">{m.sublabel}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-md ${className}`}
    >
      {title && <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>}
      {variant === 'dual' && secondTrack ? (
        <div className="grid sm:grid-cols-2 gap-6">
          {renderTrack(milestones, 'Selling')}
          {renderTrack(secondTrack.milestones, secondTrack.title)}
        </div>
      ) : (
        renderTrack(milestones)
      )}
    </motion.div>
  )
}
