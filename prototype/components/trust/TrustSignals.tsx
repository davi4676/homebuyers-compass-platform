'use client'

import { Shield, Lock, CheckCircle, Handshake } from 'lucide-react'

const TRUST_ITEMS = [
  { icon: Handshake, label: 'No lender referral fees' },
  { icon: Shield, label: 'HUD-aligned resources' },
  { icon: CheckCircle, label: 'CFPB-informed guidance' },
  { icon: Lock, label: 'Secure connection (SSL)' },
] as const

export default function TrustSignals() {
  return (
    <div className="nq-glass-trust flex flex-wrap items-center justify-center gap-6 border-y px-4 py-6">
      {TRUST_ITEMS.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-2 text-sm font-medium text-[var(--nq-ed-muted)]">
          <Icon className="h-5 w-5 text-[var(--nq-ed-accent)]" aria-hidden />
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}
