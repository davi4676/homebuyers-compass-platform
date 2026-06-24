import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
}

/** Breaks out of a sidebar-offset column to full viewport width (marquee, hero, funnel). */
export default function NqHubFullBleed({ children, className = '' }: Props) {
  return (
    <div className={`relative left-1/2 mb-4 w-screen max-w-[100vw] -translate-x-1/2 ${className}`.trim()}>
      {children}
    </div>
  )
}
