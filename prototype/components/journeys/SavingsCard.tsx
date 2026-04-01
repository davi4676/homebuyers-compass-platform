'use client'

import { motion } from 'framer-motion'
import { TrendingDown, DollarSign, Home, Info } from 'lucide-react'

export type SavingsCardVariant = 'savings' | 'neutral' | 'cost' | 'alert'

interface SavingsCardProps {
  title: string
  value: string
  subtitle?: string
  variant?: SavingsCardVariant
  icon?: React.ReactNode
  tooltip?: string
  className?: string
  children?: React.ReactNode
}

const variantStyles: Record<SavingsCardVariant, string> = {
  savings: 'border-green-200 bg-green-50/80 text-green-800',
  neutral: 'border-blue-200 bg-blue-50/80 text-blue-900',
  cost: 'border-red-200 bg-red-50/80 text-red-800',
  alert: 'border-amber-200 bg-amber-50/80 text-amber-800',
}

const defaultIcons: Record<SavingsCardVariant, React.ReactNode> = {
  savings: <TrendingDown className="h-5 w-5 text-green-600" />,
  neutral: <DollarSign className="h-5 w-5 text-blue-600" />,
  cost: <DollarSign className="h-5 w-5 text-red-600" />,
  alert: <Info className="h-5 w-5 text-amber-600" />,
}

export default function SavingsCard({
  title,
  value,
  subtitle,
  variant = 'neutral',
  icon,
  tooltip,
  className = '',
  children,
}: SavingsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        rounded-xl border-2 p-4 sm:p-5 shadow-md ${variantStyles[variant]} ${className}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="flex shrink-0">{icon ?? defaultIcons[variant]}</span>
            <h3 className="font-semibold text-sm sm:text-base">{title}</h3>
            {tooltip && (
              <span
                className="shrink-0 text-gray-500 cursor-help"
                title={tooltip}
                aria-label={tooltip}
              >
                <Info className="h-4 w-4" />
              </span>
            )}
          </div>
          <p className="mt-1 text-xl sm:text-2xl font-bold tabular-nums">{value}</p>
          {subtitle && <p className="mt-0.5 text-sm opacity-90">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="mt-3 pt-3 border-t border-current/10">{children}</div>}
    </motion.div>
  )
}
