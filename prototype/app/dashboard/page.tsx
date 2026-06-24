'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Bell,
  CurrencyDollar,
  MapTrifold,
  Sparkle,
  TrendUp,
} from '@phosphor-icons/react'
import { ProgressDashboard } from '@/components/ProgressDashboard'
import { useAuth } from '@/lib/hooks/useAuth'
import { buildUserSnapshot, loadQuizDataFromLocalStorage } from '@/lib/user-snapshot'
import type { UserSnapshot } from '@/lib/user-snapshot'
import { formatCurrency } from '@/lib/calculations'

type TransactionType = 'first-time' | 'repeat-buyer' | 'refinance'

function readTransactionType(): TransactionType {
  try {
    const raw = localStorage.getItem('quizData')
    if (!raw) return 'first-time'
    const parsed = JSON.parse(raw) as { transactionType?: string }
    if (parsed.transactionType === 'repeat-buyer' || parsed.transactionType === 'refinance') {
      return parsed.transactionType
    }
  } catch {
    /* ignore */
  }
  return 'first-time'
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [snapshot, setSnapshot] = useState<UserSnapshot | null>(null)
  const [transactionType, setTransactionType] = useState<TransactionType>('first-time')

  useEffect(() => {
    const q = loadQuizDataFromLocalStorage()
    setSnapshot(q ? buildUserSnapshot(q, { firstName: user?.firstName }) : null)
    setTransactionType(readTransactionType())
  }, [user?.firstName])

  const quickLinks = useMemo(() => {
    const base = [
      {
        href: '/customized-journey?tab=today',
        label: 'My Journey',
        desc: 'Today’s checklist and 8-phase roadmap',
        icon: MapTrifold,
      },
      {
        href: '/results',
        label: 'Your numbers',
        desc: 'Savings snapshot and readiness score',
        icon: TrendUp,
      },
      {
        href: '/down-payment-optimizer',
        label: 'Find Funds',
        desc: 'Down payment programs and grants',
        icon: CurrencyDollar,
      },
      {
        href: '/inbox',
        label: 'Inbox',
        desc: 'Reminders and journey briefing',
        icon: Bell,
      },
    ]
    if (transactionType === 'refinance') {
      return [
        {
          href: '/refinance-optimizer',
          label: 'Refinance hub',
          desc: 'Rates, equity, and refinance tools',
          icon: Sparkle,
        },
        ...base,
      ]
    }
    return base
  }, [transactionType])

  return (
    <div className="app-page-shell nq-ed-page-wash min-h-screen pb-16">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="nq-sl-brand-line">NestQuest</p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-[var(--nq-ed-text)] sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--nq-ed-muted)] sm:text-base">
          Your home base — progress, numbers, and shortcuts to what matters next.
        </p>

        {snapshot ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="nq-ed-soft-card rounded-xl border border-[var(--nq-ed-line)] px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--nq-ed-muted)]">
                Readiness
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--nq-ed-text)]">
                {Math.round(snapshot.readiness.total)}
                <span className="text-base font-semibold text-[var(--nq-ed-muted)]">/100</span>
              </p>
            </div>
            <div className="nq-ed-soft-card rounded-xl border border-[var(--nq-ed-line)] px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--nq-ed-muted)]">
                Down payment
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--nq-ed-text)]">
                {snapshot.tokens.downPayment || formatCurrency(snapshot.quiz.downPayment)}
              </p>
            </div>
            <div className="nq-ed-soft-card rounded-xl border border-[var(--nq-ed-line)] px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--nq-ed-muted)]">
                Target home
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--nq-ed-text)]">
                {snapshot.tokens.targetHome || '—'}
              </p>
            </div>
          </div>
        ) : (
          <div className="nq-ed-soft-card mt-6 rounded-xl border border-[var(--nq-ed-line)] px-4 py-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
            <p className="text-sm text-[var(--nq-ed-muted)]">
              Run the assessment once to populate your dashboard with personalized numbers.
            </p>
            <Link
              href="/quiz?type=first-time"
              className="nq-sl-hero-cta mt-3 inline-flex shrink-0 sm:mt-0"
            >
              Start assessment
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        <section className="mt-8" aria-label="Quick navigation">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--nq-ed-muted)]">
            Go to
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {quickLinks.map(({ href, label, desc, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-start gap-3 rounded-xl border border-[var(--nq-ed-line)] bg-white/80 p-4 shadow-sm transition hover:border-[var(--nq-ed-accent)] hover:shadow-md"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--nq-ed-accent-soft)] text-[var(--nq-ed-accent)]">
                  <Icon weight="duotone" size={22} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-display text-base font-semibold text-[var(--nq-ed-text)] group-hover:text-[var(--nq-ed-accent)]">
                    {label}
                  </span>
                  <span className="mt-0.5 block text-sm text-[var(--nq-ed-muted)]">{desc}</span>
                </span>
                <ArrowRight
                  className="mt-1 h-4 w-4 shrink-0 text-[var(--nq-ed-muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--nq-ed-accent)]"
                  aria-hidden
                />
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10" aria-label="Progress">
          <ProgressDashboard title="Your progress" />
        </section>
      </div>
    </div>
  )
}
