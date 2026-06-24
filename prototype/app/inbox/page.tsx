'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Bell, CheckCircle, Clock3, ArrowRight, AlertTriangle } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useLifecycleReminders } from '@/lib/hooks/useLifecycleReminders'
import { useWebPush } from '@/lib/hooks/useWebPush'
import NextBestActionSticky from '@/components/NextBestActionSticky'
import PlainEnglishText from '@/components/PlainEnglishText'
import { useExperiment } from '@/lib/hooks/useExperiment'
import { usePlainEnglish } from '@/lib/hooks/usePlainEnglish'
import { applyPlainEnglishCopy } from '@/lib/plain-english'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'
import NqHubTabLayout from '@/components/hub/NqHubTabLayout'
import NqHubSubnav from '@/components/hub/NqHubSubnav'
import NqHubStatCard from '@/components/hub/NqHubStatCard'
import {
  dismissScheduledPhaseReminder,
  formatReminderDueLabel,
  listDuePhaseReminders,
  listScheduledPhaseReminders,
  markPhaseReminderNotified,
  type ScheduledPhaseReminder,
} from '@/lib/phase-reengagement'

type PhaseStatus = 'not-started' | 'in-progress' | 'complete'

const PHASES = [
  { id: 'preparation', label: 'Preparation & Planning', eta: '2-4 weeks' },
  { id: 'pre-approval', label: 'Pre-Approval', eta: '1-2 weeks' },
  { id: 'house-hunting', label: 'House Hunting', eta: '2-12 weeks' },
  { id: 'negotiation', label: 'Negotiation & Inspection', eta: '1-2 weeks' },
  { id: 'underwriting', label: 'Underwriting', eta: '2-4 weeks' },
  { id: 'closing', label: 'Closing', eta: '1 week' },
]

const NEXT_ACTION: Record<string, string> = {
  preparation: 'Check your credit score and gather your 4 core lender documents.',
  'pre-approval': 'Request quotes from at least 3 lenders this week.',
  'house-hunting': 'Set your walk-away number before your next tour.',
  negotiation: 'Prepare your offer terms and inspection contingency.',
  underwriting: 'Respond to lender document requests within 24 hours.',
  closing: 'Review your Closing Disclosure against your Loan Estimate.',
}

export default function InboxPage() {
  const pathname = usePathname()
  const roadmapExperiment = useExperiment('roadmap_today_view_v2')
  const plainEnglish = usePlainEnglish()
  const [phaseStatus, setPhaseStatus] = useState<Record<string, PhaseStatus>>({})
  const [currentPhase, setCurrentPhase] = useState<string>('preparation')
  const [phaseHydrated, setPhaseHydrated] = useState(false)
  const {
    preferences,
    notifications,
    loading: remindersLoading,
    updatePreferences,
    markRead,
    runNow,
  } = useLifecycleReminders()
  const webPush = useWebPush()
  const [phaseReminders, setPhaseReminders] = useState<ScheduledPhaseReminder[]>([])
  const [duePhaseReminders, setDuePhaseReminders] = useState<ScheduledPhaseReminder[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const refreshPhaseReminders = () => {
      const scheduled = listScheduledPhaseReminders()
      const due = listDuePhaseReminders()
      due.forEach((r) => markPhaseReminderNotified(r.id))
      setPhaseReminders(scheduled.filter((r) => !r.dismissed))
      setDuePhaseReminders(due)
    }
    refreshPhaseReminders()
    window.addEventListener('nq-journey-progress', refreshPhaseReminders)
    return () => window.removeEventListener('nq-journey-progress', refreshPhaseReminders)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = JSON.parse(localStorage.getItem('phaseStatus') || '{}') as Record<string, PhaseStatus>
      setPhaseStatus(saved)
    } catch {
      setPhaseStatus({})
    }
    setCurrentPhase(localStorage.getItem('currentPhase') || 'preparation')
    requestAnimationFrame(() => setPhaseHydrated(true))
  }, [])

  useEffect(() => {
    if (roadmapExperiment.isReady) {
      roadmapExperiment.track('inbox_viewed', { page: 'inbox' })
    }
  }, [roadmapExperiment.isReady, roadmapExperiment.variant])

  const completion = useMemo(() => {
    const total = PHASES.length
    const done = PHASES.filter((p) => phaseStatus[p.id] === 'complete').length
    return { done, total, pct: Math.round((done / total) * 100) }
  }, [phaseStatus])

  const nextPhase = useMemo(() => {
    return PHASES.find((p) => phaseStatus[p.id] !== 'complete') || PHASES[PHASES.length - 1]
  }, [phaseStatus])

  const snoozeReminder = async (days: number) => {
    const d = new Date()
    d.setDate(d.getDate() + days)
    const formatted = d.toISOString().split('T')[0]
    await updatePreferences({ snoozedUntil: formatted })
  }

  const channels = preferences?.channels || ['in-app']
  const hasChannel = (channel: 'email' | 'push' | 'in-app') => channels.includes(channel)
  const toggleChannel = async (channel: 'email' | 'push' | 'in-app') => {
    const next = hasChannel(channel)
      ? channels.filter((c) => c !== channel)
      : [...channels, channel]
    await updatePreferences({ channels: next.length > 0 ? next : ['in-app'] })
  }

  return (
    <NqHubTabLayout
      tab="inbox"
      backLink={<BackToMyJourneyLink />}
      maxWidth="5xl"
      glassCard={
        phaseHydrated ? (
          <div className="nq-glass nq-savings-glass">
            <p className="nq-savings-glass-label">Journey progress</p>
            <p className="nq-savings-glass-amount tabular-nums">
              {completion.done}/{completion.total}
            </p>
            <p className="mt-2 text-sm text-[var(--nq-ed-muted)]">
              {completion.pct}% complete · Next: {nextPhase.label}
            </p>
          </div>
        ) : undefined
      }
    >
        <NqHubSubnav
          items={[
            {
              href: '/customized-journey?tab=today',
              label: 'Overview',
              active: pathname === '/customized-journey',
            },
            { label: 'Inbox', icon: <Bell className="h-4 w-4" />, active: true },
            { href: '/customized-journey?tab=plan', label: 'Your phase' },
            { href: '/customized-journey?tab=library', label: 'Library' },
            { href: '/results', label: 'Edit snapshot' },
          ]}
        />

        <div className="mb-4">
          <NextBestActionSticky
            title={applyPlainEnglishCopy('Complete one phase task this week', plainEnglish)}
            description={applyPlainEnglishCopy(
              'Stay consistent to reduce overpay risk and keep your plan moving.',
              plainEnglish
            )}
            ctaLabel={applyPlainEnglishCopy('Open roadmap', plainEnglish)}
            ctaHref="/customized-journey?tab=today"
            secondaryLabel={applyPlainEnglishCopy('Overview & snapshot', plainEnglish)}
            secondaryHref="/customized-journey?tab=today"
          />
        </div>

        {!phaseHydrated ? (
          <div className="mb-6 grid gap-4 md:grid-cols-3" aria-busy aria-label="Loading progress">
            {[1, 2, 3].map((i) => (
              <div key={i} className="nq-hub-panel animate-pulse p-4">
                <div className="mb-2 h-3 w-20 rounded bg-[var(--nq-ed-line-soft)]" />
                <div className="mb-2 h-8 w-24 rounded bg-[var(--nq-ed-line)]" />
                <div className="h-4 w-full rounded bg-[var(--nq-ed-line-soft)]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <NqHubStatCard
              label="Progress"
              value={`${completion.done}/${completion.total}`}
              hint={`Phases complete (${completion.pct}%)`}
            />
            <NqHubStatCard
              label="Current phase"
              value={PHASES.find((p) => p.id === currentPhase)?.label || 'Preparation & Planning'}
              hint="Stay focused on one step at a time"
            />
            <NqHubStatCard label="Next deadline" value={nextPhase.label} hint={`Estimated time: ${nextPhase.eta}`} />
          </div>
        )}

        {!phaseHydrated ? (
          <div
            className="nq-hub-panel mb-6 animate-pulse p-5"
            aria-busy
            aria-label="Loading next action"
          >
            <div className="mb-3 h-6 w-56 max-w-full rounded-lg bg-[var(--nq-ed-line)]" />
            <div className="h-4 w-full rounded bg-[var(--nq-ed-line-soft)]" />
            <div className="mt-2 h-4 max-w-[85%] rounded bg-[var(--nq-ed-line-soft)]" />
          </div>
        ) : (
          <div className="nq-hub-panel mb-6 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Bell className="h-5 w-5 text-[var(--nq-ed-accent)]" />
              <h2 className="font-display text-lg font-bold tracking-tight text-[var(--nq-ed-text)]">
                Today&apos;s next best action
              </h2>
            </div>
            <PlainEnglishText as="p" className="text-[var(--nq-ed-muted)]" text={NEXT_ACTION[nextPhase.id]} />
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/customized-journey?tab=plan"
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--nq-ed-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--nq-ed-accent-hover)]"
              >
                Start next action <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/customized-journey?tab=library"
                className="nq-ed-btn-outline inline-flex !rounded-lg !px-4 !py-2 text-sm"
              >
                {applyPlainEnglishCopy('Open Library', plainEnglish)}
              </Link>
            </div>
          </div>
        )}

        <div className="nq-hub-panel mb-4 flex items-start gap-3 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <p className="text-sm leading-relaxed text-[var(--nq-ed-muted)]">
            Missing key phases can increase overpay risk. Complete one phase each week to maintain momentum and protect savings.
          </p>
        </div>

        <div className="nq-hub-panel mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-sm font-semibold text-[var(--nq-ed-text)]">Weekly reminder</p>
            <p className="mt-1 text-xs text-[var(--nq-ed-muted)]">
              Get a weekly nudge to complete one phase and keep momentum.
            </p>
            {preferences?.enabled && preferences?.nextReminderAt && (
              <p className="mt-1 text-xs text-[var(--nq-ed-faint)]">
                Next reminder: {new Date(preferences.nextReminderAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {preferences?.enabled && (
              <button
                onClick={() => snoozeReminder(1)}
                className="nq-ed-btn-outline inline-flex !rounded-lg !px-4 !py-2 text-sm"
              >
                Snooze 1 day
              </button>
            )}
            <button
              onClick={() =>
                updatePreferences({
                  enabled: !preferences?.enabled,
                  cadence: 'weekly',
                  channels: ['in-app', 'email', 'push'],
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                })
              }
              className={
                preferences?.enabled
                  ? 'nq-ed-btn-primary inline-flex !rounded-lg !px-4 !py-2 text-sm'
                  : 'nq-ed-btn-outline inline-flex !rounded-lg !px-4 !py-2 text-sm'
              }
            >
              {preferences?.enabled ? 'Reminders on' : 'Turn on reminders'}
            </button>
            <button onClick={runNow} className="nq-ed-btn-outline inline-flex !rounded-lg !px-4 !py-2 text-sm">
              Send test now
            </button>
          </div>
        </div>

        {(duePhaseReminders.length > 0 || phaseReminders.some((r) => !r.notified)) && (
          <div className="nq-hub-panel mb-4 p-4">
            <p className="font-display text-sm font-semibold text-[var(--nq-ed-text)]">Scheduled come-back reminders</p>
            <ul className="mt-3 space-y-3">
              {duePhaseReminders.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-col gap-2 rounded-xl border border-teal-200 bg-teal-50/50 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--nq-ed-text)]">{r.title}</p>
                    <p className="text-xs text-[var(--nq-ed-muted)]">{r.message}</p>
                  </div>
                  <Link
                    href={r.actionUrl}
                    className="inline-flex items-center gap-1 text-sm font-bold text-teal-700 hover:underline"
                  >
                    Open guide <ArrowRight className="h-4 w-4" />
                  </Link>
                </li>
              ))}
              {phaseReminders
                .filter((r) => !r.notified && !duePhaseReminders.some((d) => d.id === r.id))
                .map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-col gap-2 rounded-xl border border-[var(--nq-ed-line)] bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[var(--nq-ed-text)]">{r.title}</p>
                      <p className="text-xs text-[var(--nq-ed-muted)]">
                        Due {formatReminderDueLabel(r.dueAt)} — {r.message}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        dismissScheduledPhaseReminder(r.id)
                        setPhaseReminders((prev) => prev.filter((x) => x.id !== r.id))
                      }}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        )}

        <div className="nq-hub-panel mb-4 p-4">
          <p className="font-display text-sm font-semibold text-[var(--nq-ed-text)]">Reminder channels</p>
          <div className="mb-3 mt-3 flex flex-wrap gap-2">
            {(['in-app', 'email', 'push'] as const).map((channel) => (
              <button
                key={channel}
                onClick={() => toggleChannel(channel)}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                  hasChannel(channel)
                    ? 'border-[var(--nq-ed-accent)] bg-[var(--nq-ed-accent)] text-white'
                    : 'border-[var(--nq-ed-line)] bg-white/80 text-[var(--nq-ed-muted)] hover:border-[var(--nq-ed-accent)] hover:text-[var(--nq-ed-accent)]'
                }`}
              >
                {channel === 'in-app' ? 'In-app' : channel === 'email' ? 'Email' : 'Push'}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={async () => {
                const result = await webPush.subscribe()
                if (result.ok) {
                  await updatePreferences({
                    channels: Array.from(
                      new Set([...(preferences?.channels || ['in-app']), 'push'])
                    ) as ('email' | 'push' | 'in-app')[],
                  })
                }
              }}
              disabled={!webPush.supported || !webPush.configured || webPush.subscribed}
              className="nq-ed-btn-outline inline-flex !rounded-lg !px-4 !py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {webPush.subscribed ? 'Push connected' : 'Enable browser push'}
            </button>
            <button
              onClick={async () => {
                await webPush.unsubscribe()
                await updatePreferences({
                  channels: (preferences?.channels || ['in-app']).filter((c) => c !== 'push'),
                })
              }}
              disabled={!webPush.subscribed}
              className="nq-ed-btn-outline inline-flex !rounded-lg !px-4 !py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Disable browser push
            </button>
            <p className="text-xs text-[var(--nq-ed-faint)]">
              {webPush.supported
                ? webPush.configured
                  ? `Permission: ${webPush.permission}`
                  : 'Push backend not configured (missing VAPID env vars).'
                : 'Browser push is not supported on this device/browser.'}
            </p>
          </div>
        </div>

        <div className="nq-hub-panel p-4">
          <p className="font-display text-sm font-semibold text-[var(--nq-ed-text)]">Recent reminders</p>
          {remindersLoading ? (
            <div className="mt-3 space-y-2" aria-busy aria-label="Loading reminders">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[4.25rem] animate-pulse rounded-lg border border-[var(--nq-ed-line-soft)] bg-white/50"
                />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="mt-3 rounded-xl border border-dashed border-[var(--nq-ed-line)] bg-white/40 px-4 py-8 text-center">
              <PlainEnglishText
                as="p"
                className="mb-4 text-sm text-[var(--nq-ed-muted)]"
                text="No reminders yet. Complete the quiz or open your roadmap to start seeing nudges here."
              />
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Link href="/quiz" className="nq-ed-btn-primary inline-flex !rounded-lg !px-4 !py-2 text-sm">
                  {applyPlainEnglishCopy('Take the quiz', plainEnglish)}
                </Link>
                <Link href="/customized-journey?tab=today" className="nq-ed-btn-outline inline-flex !rounded-lg !px-4 !py-2 text-sm">
                  {applyPlainEnglishCopy('Open roadmap', plainEnglish)}
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {notifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--nq-ed-line-soft)] bg-white/50 p-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--nq-ed-text)]">{n.title}</p>
                    <p className="text-xs text-[var(--nq-ed-muted)]">{n.message}</p>
                  </div>
                  {!n.readAt && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="text-xs font-semibold text-[var(--nq-ed-accent)] hover:underline"
                    >
                      {applyPlainEnglishCopy('Mark read', plainEnglish)}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="nq-hub-panel mt-6 flex items-start gap-3 p-4">
          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
          <p className="text-xs leading-relaxed text-[var(--nq-ed-muted)]">
            <strong className="font-semibold text-[var(--nq-ed-text)]">How we make money:</strong> We charge for
            optional premium plan features — never through commissions, referrals, or kickbacks from lenders, agents,
            or title companies.
          </p>
        </div>
    </NqHubTabLayout>
  )
}

