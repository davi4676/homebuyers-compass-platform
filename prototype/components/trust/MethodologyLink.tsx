import Link from 'next/link'
import type { ReactNode } from 'react'

type MethodologyLinkProps = {
  className?: string
  children?: ReactNode
}

/** Links savings claims to the bias-free methodology section in Playbooks. */
export default function MethodologyLink({ className = '', children }: MethodologyLinkProps) {
  return (
    <Link
      href="/resources#phase-methodology"
      className={`font-medium text-[var(--nq-ed-accent,#0d9488)] underline-offset-2 hover:underline ${className}`}
    >
      {children ?? 'How we calculate savings'}
    </Link>
  )
}
