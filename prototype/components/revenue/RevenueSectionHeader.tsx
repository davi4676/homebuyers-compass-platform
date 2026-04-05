import type { ReactNode } from 'react'

export type RevenueSectionHeaderProps = {
  icon: ReactNode
  title: string
  subtitle: string
  badge?: ReactNode
}

export default function RevenueSectionHeader({
  icon,
  title,
  subtitle,
  badge,
}: RevenueSectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-start gap-3">
      <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-600 [&_svg]:h-5 [&_svg]:w-5">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {badge ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              {badge}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  )
}
