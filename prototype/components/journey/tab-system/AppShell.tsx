'use client'

import type { ReactNode } from 'react'
import { PREMIUM_UI_TOKENS, cn } from '@/lib/design-system'

type AppShellProps = {
  children: ReactNode
  className?: string
}

export default function AppShell({ children, className }: AppShellProps) {
  return <div className={cn(PREMIUM_UI_TOKENS.patterns.appShell, className)}>{children}</div>
}
