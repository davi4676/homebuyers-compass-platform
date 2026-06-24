import type { ReactNode } from 'react'
import NqMarqueeTicker from '@/components/landing/NqMarqueeTicker'

type Props = {
  children: ReactNode
  backLink?: ReactNode
  showMarquee?: boolean
  maxWidth?: '3xl' | '5xl' | '6xl'
  className?: string
}

const MAX_W = {
  '3xl': 'max-w-3xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
} as const

export default function NqHubPageShell({
  children,
  backLink,
  showMarquee = true,
  maxWidth = '5xl',
  className = '',
}: Props) {
  return (
    <div className={`app-page-shell nq-ed-page-wash min-h-screen font-sans antialiased ${className}`.trim()}>
      {showMarquee ? <NqMarqueeTicker /> : null}
      {backLink ? (
        <div className={`mx-auto ${MAX_W[maxWidth]} px-4 pt-4 sm:px-6`}>
          <div className="mb-4">{backLink}</div>
        </div>
      ) : null}
      {children}
    </div>
  )
}
