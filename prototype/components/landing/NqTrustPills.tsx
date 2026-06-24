import { Check } from 'lucide-react'

type Props = {
  items: string[]
}

export default function NqTrustPills({ items }: Props) {
  return (
    <div className="nq-sl-trust-row">
      {items.map((label) => (
        <span key={label} className="nq-sl-trust-pill">
          <Check className="h-3.5 w-3.5 text-[var(--nq-ed-accent)]" />
          {label}
        </span>
      ))}
    </div>
  )
}
