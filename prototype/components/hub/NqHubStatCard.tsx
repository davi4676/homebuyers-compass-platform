import type { ReactNode } from 'react'

type Props = {
  label: string
  value: ReactNode
  hint?: string
  className?: string
}

/** Glass stat tile for hub dashboards (Inbox, Find Funds, etc.). */
export default function NqHubStatCard({ label, value, hint, className = '' }: Props) {
  return (
    <div className={`nq-hub-stat-card ${className}`.trim()}>
      <p className="nq-hub-stat-label">{label}</p>
      <p className="nq-hub-stat-value">{value}</p>
      {hint ? <p className="nq-hub-stat-hint">{hint}</p> : null}
    </div>
  )
}
