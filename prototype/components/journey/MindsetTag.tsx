'use client'

type MindsetTagProps = {
  mindset: string
  className?: string
  /** Smaller padding for tight headers */
  compact?: boolean
}

export default function MindsetTag({
  mindset,
  className = '',
  compact = false,
}: MindsetTagProps) {
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full border border-slate-200/90 bg-slate-50/90 font-medium text-slate-700 shadow-sm ring-1 ring-slate-100/80 ${
        compact ? 'px-2.5 py-0.5 text-[11px] leading-snug' : 'px-3 py-1 text-xs leading-snug sm:text-sm'
      } ${className}`}
      title={mindset}
    >
      <span className="truncate">&ldquo;{mindset}&rdquo;</span>
    </span>
  )
}
