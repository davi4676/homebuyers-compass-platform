'use client'

import { Shield, Lock, CheckCircle, Award } from 'lucide-react'
import { TRUST_BADGES } from '@/lib/design-system'

export default function TrustSignals() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-6 border-t border-b border-slate-200">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Shield className="w-5 h-5 text-[#50C878]" />
        <span>BBB Accredited</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Lock className="w-5 h-5 text-[#50C878]" />
        <span>SOC 2 Certified</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <CheckCircle className="w-5 h-5 text-[#50C878]" />
        <span>256-bit SSL Encryption</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Award className="w-5 h-5 text-[#D4AF37]" />
        <span>Verified Reviews</span>
      </div>
    </div>
  )
}
