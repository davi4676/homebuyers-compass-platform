'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, Copy, Home, Share2, Check, Gift } from 'lucide-react'
import type { UserSnapshot } from '@/lib/user-snapshot'
import { formatCurrency } from '@/lib/calculations'
import {
  REFERRAL_PROGRAM_HEADLINE,
  referralProgramUrl,
} from '@/lib/referral-program'

const REFI_MONITOR_LS = 'nq_homeowner_refi_monitor'

function estimatePlaceholderEquity(snapshot: UserSnapshot | null): number {
  if (!snapshot) return 42_000
  const quiz = snapshot.quiz
  const target = quiz.targetHomePrice
  const price =
    typeof target === 'number' && target > 0
      ? target
      : snapshot.affordability.realisticMax > 0
        ? snapshot.affordability.realisticMax
        : 350_000
  const down =
    typeof quiz.downPayment === 'number' && quiz.downPayment >= 0
      ? quiz.downPayment
      : Math.round(price * 0.1)
  const loan = Math.max(0, price - down)
  const appreciation = price * 0.045
  const principalPaid = loan * 0.02
  return Math.max(0, Math.round(down + appreciation + principalPaid))
}

export default function HomeownerHubSection({
  snapshot,
  referralSlug,
}: {
  snapshot: UserSnapshot | null
  referralSlug: string
}) {
  const [refiOn, setRefiOn] = useState(false)
  const [copied, setCopied] = useState(false)
  const equity = estimatePlaceholderEquity(snapshot)
  const refUrl = referralProgramUrl(referralSlug)

  useEffect(() => {
    try {
      const v = localStorage.getItem(REFI_MONITOR_LS)
      setRefiOn(v === '1')
    } catch {
      /* ignore */
    }
  }, [])

  const toggleRefi = useCallback(() => {
    setRefiOn((prev) => {
      const next = !prev
      try {
        localStorage.setItem(REFI_MONITOR_LS, next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  const copyLink = useCallback(() => {
    void navigator.clipboard.writeText(refUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [refUrl])

  const shareMail = `mailto:?subject=${encodeURIComponent('NestQuest home buying help')}&body=${encodeURIComponent(
    `${REFERRAL_PROGRAM_HEADLINE} ${refUrl}`
  )}`

  const shareSms = `sms:?&body=${encodeURIComponent(
    `${REFERRAL_PROGRAM_HEADLINE} ${refUrl}`
  )}`

  return (
    <section className="space-y-5 rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-50/60 to-white p-4 shadow-sm sm:p-5" aria-labelledby="homeowner-hub-heading">
      <h3 id="homeowner-hub-heading" className="text-lg font-bold text-slate-900 sm:text-xl">
        <span aria-hidden>🏡</span> Homeowner Hub
      </h3>
      <p className="text-sm text-slate-600">
        You closed! Now protect your investment and plan your next move.
      </p>

      <div
        className="rounded-2xl border-2 border-teal-300/80 bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 p-4 text-white shadow-lg shadow-teal-900/20 sm:p-6"
        aria-labelledby="homeowner-referral-heading"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <Gift className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0">
              <p id="homeowner-referral-heading" className="text-xs font-semibold uppercase tracking-wide text-teal-100">
                Referral program
              </p>
              <p className="mt-1 text-lg font-bold leading-snug sm:text-xl">{REFERRAL_PROGRAM_HEADLINE}</p>
              <p className="mt-2 text-sm text-teal-50/95">
                Your link is ready — copy it or share in one tap. You and your friend both save at checkout (demo).
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:min-w-[280px]">
            <code className="min-w-0 flex-1 truncate rounded-xl bg-black/20 px-3 py-2.5 text-center text-xs text-white sm:text-left sm:text-sm">
              {refUrl}
            </code>
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-teal-900 hover:bg-teal-50"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-white/20 pt-4">
          <a
            href={shareMail}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-white/15 px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/25 sm:flex-none"
          >
            Email
          </a>
          <a
            href={shareSms}
            className="inline-flex flex-1 items-center justify-center rounded-xl border-2 border-white/40 px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/10 sm:flex-none"
          >
            Text
          </a>
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-white/40 px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/10 sm:flex-none"
          >
            <Share2 className="h-4 w-4" aria-hidden />
            Copy again
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-teal-600" aria-hidden />
              <h4 className="font-semibold text-slate-900">Refinance Monitor</h4>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={refiOn}
              onClick={toggleRefi}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                refiOn ? 'bg-teal-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 translate-x-0.5 transform rounded-full bg-white shadow transition ${
                  refiOn ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            We&apos;ll alert you when rates drop enough to save you $200+/month. Currently monitoring rates for your loan
            profile.
          </p>
          <p className="mt-2 text-xs text-slate-500">{refiOn ? 'Monitoring is on.' : 'Turn on to receive alerts (demo).'}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-teal-600" aria-hidden />
            <h4 className="font-semibold text-slate-900">Equity Tracker</h4>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Your estimated equity today: <strong className="text-slate-900">{formatCurrency(equity)}</strong>. Based on your
            purchase price and current market trends.
          </p>
          <p className="mt-2 text-xs italic text-slate-500">Illustrative estimate — not an appraisal.</p>
        </div>
      </div>
    </section>
  )
}
