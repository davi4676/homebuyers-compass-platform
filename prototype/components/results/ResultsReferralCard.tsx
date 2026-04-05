'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowRight, Copy, Check } from 'lucide-react'
import {
  REFERRAL_PROGRAM_HEADLINE,
  referralProgramUrl,
} from '@/lib/referral-program'

export default function ResultsReferralCard({ referralSlug }: { referralSlug: string }) {
  const url = referralProgramUrl(referralSlug)
  const [copied, setCopied] = useState(false)

  const copy = useCallback(() => {
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [url])

  return (
    <div className="mt-4 rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50/80 to-white p-4 shadow-sm ring-1 ring-teal-100/60">
      <p className="text-sm font-semibold text-slate-800">{REFERRAL_PROGRAM_HEADLINE}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Link
          href="/customized-journey?tab=phase"
          className="inline-flex items-center gap-1 text-sm font-bold text-teal-800 underline decoration-teal-600/50 underline-offset-2 hover:text-teal-950"
        >
          Share My Link
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
        </Link>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>
      <p className="mt-2 truncate text-xs text-slate-500" title={url}>
        {url}
      </p>
    </div>
  )
}
