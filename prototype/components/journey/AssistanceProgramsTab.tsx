'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Lock, X } from 'lucide-react'
import { formatCurrency } from '@/lib/calculations'
import PlainEnglishText from '@/components/PlainEnglishText'
import GlossaryTooltip from '@/components/GlossaryTooltip'
import { usePlainEnglish } from '@/lib/hooks/usePlainEnglish'
import { useAuth } from '@/lib/hooks/useAuth'
import { applyPlainEnglishCopy } from '@/lib/plain-english'
import { trackActivity } from '@/lib/track-activity'
import { TIER_DEFINITIONS, type UserTier } from '@/lib/tiers'
import DpaMatchReportSection from '@/components/journey/DpaMatchReportSection'

const STATES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'FL',
  'GA',
  'TX',
  'NY',
  'NC',
  'OH',
  'PA',
  'WA',
] as const

type ProgramRow = {
  name: string
  max: number
  income: string
  propertyType: string
  officialUrl: string
}

const PROGRAMS: Record<string, ProgramRow[]> = {
  TX: [
    {
      name: 'Texas Homebuyer Program',
      max: 17500,
      income: '≤115% AMI',
      propertyType: 'Primary',
      officialUrl: 'https://www.tdhca.state.tx.us/homeownership/fh-programs/index.htm',
    },
    {
      name: 'City of Austin TDHCA',
      max: 14000,
      income: '≤80% AMI',
      propertyType: 'Primary, 1-unit',
      officialUrl: 'https://www.austintexas.gov/department/housing',
    },
    {
      name: 'SETH Gold Grant',
      max: 12000,
      income: '≤$120k household',
      propertyType: 'Primary',
      officialUrl: 'https://www.southeasttexashfc.com/',
    },
    {
      name: 'Homes for Texas Heroes',
      max: 15000,
      income: 'Career-based',
      propertyType: 'Primary',
      officialUrl: 'https://www.tsahc.org/content/homes-texas-heroes',
    },
    {
      name: 'My First Texas Home',
      max: 5000,
      income: 'Program caps apply',
      propertyType: 'Primary',
      officialUrl: 'https://www.tdhca.state.tx.us/homeownership/fh-programs/my-first-texas-home.htm',
    },
  ],
  default: [
    {
      name: 'State Housing Finance Agency (HFA)',
      max: 15000,
      income: '≤80–120% AMI',
      propertyType: 'Primary',
      officialUrl: 'https://www.hud.gov/topics/buying_a_home',
    },
    {
      name: 'Local First-Time Buyer Grant',
      max: 10000,
      income: '≤$100k',
      propertyType: 'Primary',
      officialUrl: 'https://www.hud.gov/topics/buying_a_home',
    },
    {
      name: 'Community Seconds / Silent Second',
      max: 25000,
      income: 'Varies',
      propertyType: 'Primary',
      officialUrl: 'https://singlefamily.fanniemae.com/',
    },
    {
      name: 'Workforce Housing Initiative',
      max: 8000,
      income: '≤115% AMI',
      propertyType: 'Primary',
      officialUrl: 'https://www.hud.gov/topics/buying_a_home',
    },
    {
      name: 'Down Payment Assistance (DPA) Pool',
      max: 12000,
      income: '≤100% AMI',
      propertyType: '1–4 units',
      officialUrl: 'https://downpaymentresource.com/',
    },
  ],
}

export default function AssistanceProgramsTab({ userTier }: { userTier: UserTier }) {
  const plainEnglish = usePlainEnglish()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [state, setState] = useState<string>('TX')
  const [verifyProgram, setVerifyProgram] = useState<ProgramRow | null>(null)
  const [notifyEmail, setNotifyEmail] = useState('')
  const [notifyStatus, setNotifyStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const rows = useMemo(() => {
    if (state === 'OTHER') return PROGRAMS.default
    return PROGRAMS[state] ?? PROGRAMS.default
  }, [state])
  const cap = TIER_DEFINITIONS[userTier].features.assistancePrograms.maxMatchedInJourney
  const visibleRows = useMemo(() => {
    if (Number.isFinite(cap)) return rows.slice(0, cap)
    return rows
  }, [rows, cap])
  const moreCount = Math.max(0, rows.length - visibleRows.length)
  const totalPotential = useMemo(() => rows.reduce((s, r) => s + r.max, 0), [rows])

  const closeVerifyModal = useCallback(() => {
    setVerifyProgram(null)
    setNotifyEmail('')
    setNotifyStatus('idle')
  }, [])

  useEffect(() => {
    if (!verifyProgram) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeVerifyModal()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [verifyProgram, closeVerifyModal])

  useEffect(() => {
    if (!verifyProgram || authLoading) return
    if (isAuthenticated && user?.email) {
      setNotifyEmail(user.email)
      return
    }
    try {
      const stored = localStorage.getItem('quizLeadEmail')
      if (stored) setNotifyEmail(stored)
    } catch {
      /* ignore */
    }
  }, [verifyProgram, authLoading, isAuthenticated, user?.email])

  const submitNotify = async () => {
    if (!verifyProgram) return
    const email =
      isAuthenticated && user?.email
        ? user.email.trim()
        : notifyEmail.trim()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNotifyStatus('error')
      return
    }
    setNotifyStatus('sending')
    try {
      try {
        localStorage.setItem('quizLeadEmail', email)
        localStorage.setItem('quizLeadEmailCapturedAt', new Date().toISOString())
      } catch {
        /* ignore */
      }
      await fetch('/api/leads/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: `dpa-program-verify:${verifyProgram.name}`,
        }),
      })
      trackActivity('tool_used', {
        tool: 'dpa_program_verify_notify',
        program: verifyProgram.name,
        email_length: email.length,
      })
      setNotifyStatus('sent')
    } catch {
      setNotifyStatus('error')
    }
  }

  return (
    <div
      role="tabpanel"
      id="journey-panel-assistance"
      aria-labelledby="journey-tab-assistance"
      className="scroll-mt-28 space-y-6"
    >
      <DpaMatchReportSection userTier={userTier} />

      <div className="border-t border-slate-200 pt-8">
        <PlainEnglishText
          as="h2"
          className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          text="Assistance programs"
        />
        <p className="mt-2 max-w-prose text-slate-600">
          Programs matched to your profile. We verify current availability before you apply — eligibility confirmed
          directly with each program administrator.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Income limits often reference <GlossaryTooltip term="AMI">AMI</GlossaryTooltip> (area median income). Many offers
          are <GlossaryTooltip term="DPA">DPA</GlossaryTooltip> (down payment assistance).
        </p>
      </div>

      <div className="max-w-xs">
        <label className="block text-sm font-semibold text-slate-700" htmlFor="assistance-state">
          State
        </label>
        <select
          id="assistance-state"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm"
        >
          {STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
          <option value="OTHER">Other / Not listed</option>
        </select>
      </div>

      <p className="text-sm text-slate-700">
        {applyPlainEnglishCopy('Programs found in ', plainEnglish)}
        <strong>{state === 'OTHER' ? 'your area' : state}</strong>
        {': '}
        <strong>{rows.length}</strong>
        {applyPlainEnglishCopy(' · Total potential assistance (upper range): ', plainEnglish)}
        <strong className="text-emerald-700">{formatCurrency(totalPotential)}</strong>
      </p>

      <ul className="space-y-3">
        {visibleRows.map((p) => (
          <li
            key={p.name}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-bold text-slate-900">{p.name}</p>
              <p className="mt-1 text-sm text-slate-600">
                Up to {formatCurrency(p.max)} · Income: {p.income} · {p.propertyType}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                trackActivity('tool_used', {
                  tool: 'dpa_program_verify_open',
                  program: p.name,
                })
                setNotifyStatus('idle')
                setVerifyProgram(p)
              }}
              className="inline-flex shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 px-4 py-2 text-sm font-bold text-slate-800 hover:border-teal-300 hover:bg-teal-50"
            >
              {applyPlainEnglishCopy('Check Eligibility', plainEnglish)}
            </button>
          </li>
        ))}
        {moreCount > 0 ? (
          <li className="rounded-2xl border border-teal-200/90 bg-gradient-to-br from-teal-50 to-emerald-50/80 p-4 shadow-md ring-1 ring-teal-100/80 sm:p-5">
            <p className="flex items-start gap-2 text-sm font-semibold text-teal-950">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden />
              <span>
                You qualify for {moreCount} more programs — upgrade to Momentum to see all of them.
              </span>
            </p>
            <Link
              href={`/upgrade?source=assistance-dpa&tier=momentum`}
              className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-teal-900 underline decoration-teal-600/60 underline-offset-2 hover:text-teal-950"
            >
              See all {rows.length} programs
              <span aria-hidden> →</span>
            </Link>
          </li>
        ) : null}
      </ul>

      <div className="rounded-2xl border border-teal-200 bg-teal-50/80 p-5">
        <PlainEnglishText as="p" className="text-sm font-semibold text-slate-800" text="Want the full scan?" />
        <Link
          href="/down-payment-optimizer"
          className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-teal-800 underline"
        >
          {applyPlainEnglishCopy('Open full down payment optimizer →', plainEnglish)}
        </Link>
      </div>

      <AnimatePresence>
        {verifyProgram ? (
          <motion.div
            key="verify-overlay"
            role="presentation"
            className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/50 p-4 sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeVerifyModal()
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="dpa-verify-title"
              className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 id="dpa-verify-title" className="text-lg font-bold tracking-tight text-slate-900">
                  We&apos;ll Verify This Program For You
                </h3>
                <button
                  type="button"
                  onClick={closeVerifyModal}
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                NestQuest checks current funding availability and eligibility requirements for{' '}
                <strong className="font-semibold text-slate-900">{verifyProgram.name}</strong> before connecting you with
                the administrator. This typically takes 1–2 business days.
              </p>

              {notifyStatus === 'sent' ? (
                <p className="mt-6 text-sm font-semibold text-emerald-800">
                  You&apos;re on the list — we&apos;ll email you when this program is verified.
                </p>
              ) : (
                <div className="mt-6 space-y-3">
                  {isAuthenticated && user?.email ? (
                    <p className="text-xs text-slate-600">
                      We&apos;ll send updates to <span className="font-semibold text-slate-800">{user.email}</span>.
                    </p>
                  ) : null}
                  {!(isAuthenticated && user?.email) ? (
                    <div>
                      <label htmlFor="dpa-verify-email" className="block text-xs font-semibold text-slate-700">
                        Email
                      </label>
                      <input
                        id="dpa-verify-email"
                        type="email"
                        autoComplete="email"
                        value={notifyEmail}
                        onChange={(e) => {
                          setNotifyEmail(e.target.value)
                          setNotifyStatus('idle')
                        }}
                        placeholder="you@example.com"
                        className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                      />
                    </div>
                  ) : null}
                  {notifyStatus === 'error' ? (
                    <p className="text-sm text-red-600">Please enter a valid email address.</p>
                  ) : null}
                  <button
                    type="button"
                    disabled={notifyStatus === 'sending'}
                    onClick={() => void submitNotify()}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-teal-800 disabled:opacity-60"
                  >
                    {notifyStatus === 'sending' ? 'Sending…' : 'Notify Me When Verified →'}
                  </button>
                </div>
              )}

              <button
                type="button"
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-bold text-slate-800 hover:border-teal-300 hover:bg-teal-50"
                onClick={() => {
                  trackActivity('tool_used', {
                    tool: 'dpa_program_verify_self',
                    program: verifyProgram.name,
                  })
                  window.open(verifyProgram.officialUrl, '_blank', 'noopener,noreferrer')
                  closeVerifyModal()
                }}
              >
                I&apos;ll verify myself →
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
