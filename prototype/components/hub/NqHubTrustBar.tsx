import { Check } from 'lucide-react'

const DEFAULT_ITEMS = [
  'HUD-Approved Resources',
  'CFPB-Aligned',
  '2,000+ Grant Programs',
  'Zero Conflicts of Interest',
] as const

type Props = {
  items?: readonly string[]
  className?: string
}

export default function NqHubTrustBar({ items = DEFAULT_ITEMS, className = '' }: Props) {
  return (
    <div
      className={`border-y border-[var(--nq-ed-line-soft)] bg-[color-mix(in_srgb,var(--nq-ed-surface)_92%,transparent)] py-5 ${className}`}
    >
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 text-sm font-medium text-[var(--nq-ed-muted)]">
        {items.map((label) => (
          <span key={label} className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-[var(--nq-ed-accent)]" />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
