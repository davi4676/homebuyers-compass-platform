'use client'

import { CheckCircle2, Lock } from 'lucide-react'
import { cn } from '@/lib/design-system'

export type AchievementBadgeProps = {
  label: string
  earned: boolean
  description?: string
}

export function AchievementBadge({ label, earned, description }: AchievementBadgeProps) {
  return (
    <div
      className={cn(
        'flex min-w-[140px] flex-1 flex-col gap-1 rounded-xl border px-3 py-3 sm:min-w-[160px]',
        earned
          ? 'border-teal-200 bg-teal-50/80 text-[#134e4a]'
          : 'border-slate-200 bg-slate-50/90 text-slate-500'
      )}
      title={description}
    >
      <div className="flex items-center gap-2">
        {earned ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-600" aria-hidden />
        ) : (
          <Lock className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        )}
        <span className={cn('text-xs font-bold uppercase tracking-wide', earned ? 'text-teal-800' : 'text-slate-500')}>
          {earned ? 'Done' : 'Next up'}
        </span>
      </div>
      <p className={cn('text-sm font-semibold leading-snug', earned ? 'text-[#0f172a]' : 'text-slate-600')}>{label}</p>
      {description ? <p className="text-[11px] leading-snug text-slate-500">{description}</p> : null}
    </div>
  )
}
