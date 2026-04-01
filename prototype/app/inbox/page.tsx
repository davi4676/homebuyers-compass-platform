'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Bell, CheckCircle, Clock3, ArrowRight, AlertTriangle } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useLifecycleReminders } from '@/lib/hooks/useLifecycleReminders'
import { useWebPush } from '@/lib/hooks/useWebPush'
import NextBestActionSticky from '@/components/NextBestActionSticky'
import { useExperiment } from '@/lib/hooks/useExperiment'

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
  const [phaseStatus, setPhaseStatus] = useState<Record<string, PhaseStatus>>({})
  const [currentPhase, setCurrentPhase] = useState<string>('preparation')
  const {
    preferences,
    notifications,
    updatePreferences,
    markRead,
    runNow,
  } = useLifecycleReminders()
  const webPush = useWebPush()

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = JSON.parse(localStorage.getItem('phaseStatus') || '{}') as Record<string, PhaseStatus>
      setPhaseStatus(saved)
    } catch {
      setPhaseStatus({})
    }
    setCurrentPhase(localStorage.getItem('currentPhase') || 'preparation')
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
    <div className="min-h-screen bg-[rgb(var(--sky-light))] text-slate-800 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
        <div className="relative h-24 sm:h-28 overflow-hidden rounded-2xl mb-6">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                'linear-gradient(135deg, rgba(30,58,95,0.85) 0%, rgba(30,64,175,0.75) 50%, rgba(59,130,246,0.6) 100%), url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1400&q=80)',
            }}
          />
          <div className="absolute inset-0 flex items-center px-6 sm:px-10">
            <div>
              <p className="text-white text-lg sm:text-xl font-semibold">Action Inbox</p>
              <p className="text-white/70 text-sm">Your reminders, next best steps, and milestones</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="mb-4">
          <NextBestActionSticky
            title="Complete one phase task this week"
            description="Stay consistent to reduce overpay risk and keep your plan moving."
            ctaLabel="Open roadmap"
            ctaHref="/customized-journey?tab=phase"
            secondaryLabel="Overview & snapshot"
            secondaryHref="/customized-journey?tab=overview"
          />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 sm:px-6 py-3 mb-4 flex flex-wrap items-center gap-2">
          <Link href="/customized-journey?tab=overview" className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 ${
            pathname === '/customized-journey'
              ? 'bg-[rgb(var(--navy))] text-white border-[rgb(var(--navy))] shadow-sm'
              : 'bg-white border-slate-200 text-[#1e293b] hover:border-slate-300 hover:bg-slate-50'
          }`}>
            {pathname === '/customized-journey' && <span className="w-1.5 h-1.5 rounded-full bg-white/90" aria-hidden="true" />}
            Overview
          </Link>
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-[rgb(var(--navy))] text-white border border-[rgb(var(--navy))] shadow-sm transition-all duration-200 ease-out">
            <Bell className="w-4 h-4" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/90" aria-hidden="true" />
            Inbox
          </span>
          <Link
            href="/customized-journey?tab=phase"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#1e293b] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 active:translate-y-0"
          >
            Your phase
          </Link>
          <Link
            href="/customized-journey?tab=library"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#1e293b] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 active:translate-y-0"
          >
            Library
          </Link>
          <Link href="/results" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border border-slate-200 bg-white text-[#1e293b] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 active:translate-y-0">
            Edit snapshot
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Progress</p>
            <p className="text-2xl font-bold text-[#1e293b]">{completion.done}/{completion.total}</p>
            <p className="text-sm text-slate-600">Phases complete ({completion.pct}%)</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Current phase</p>
            <p className="text-xl font-bold text-[#1e293b]">{PHASES.find((p) => p.id === currentPhase)?.label || 'Preparation & Planning'}</p>
            <p className="text-sm text-slate-600">Stay focused on one step at a time</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Next deadline</p>
            <p className="text-xl font-bold text-[#1e293b]">{nextPhase.label}</p>
            <p className="text-sm text-slate-600">Estimated time: {nextPhase.eta}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-[rgb(var(--coral))]" />
            <h2 className="text-lg font-bold text-[#1e293b]">Today&apos;s next best action</h2>
          </div>
          <p className="text-slate-700">{NEXT_ACTION[nextPhase.id]}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/customized-journey?tab=phase" className="inline-flex items-center gap-2 rounded-lg bg-[rgb(var(--coral))] px-4 py-2 text-sm font-semibold text-white">
              Start next action <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/customized-journey?tab=library" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#1e293b]">
              Open Library
            </Link>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-700">
            Missing key phases can increase overpay risk. Complete one phase each week to maintain momentum and protect savings.
          </p>
        </div>

        <div className="mt-4 bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#1e293b]">Weekly reminder</p>
            <p className="text-xs text-slate-600">Get a weekly nudge to complete one phase and keep momentum.</p>
            {preferences?.enabled && preferences?.nextReminderAt && (
              <p className="text-xs text-slate-500 mt-1">
                Next reminder: {new Date(preferences.nextReminderAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {preferences?.enabled && (
              <button
                onClick={() => snoozeReminder(1)}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold border bg-white text-[#1e293b] border-slate-300 hover:border-slate-400 transition-colors"
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
              className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                preferences?.enabled
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-[#1e293b] border-slate-300 hover:border-slate-400'
              }`}
            >
              {preferences?.enabled ? 'Reminders on' : 'Turn on reminders'}
            </button>
            <button
              onClick={runNow}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold border bg-white text-[#1e293b] border-slate-300 hover:border-slate-400 transition-colors"
            >
              Send test now
            </button>
          </div>
        </div>

        <div className="mt-4 bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-[#1e293b] mb-2">Reminder channels</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {(['in-app', 'email', 'push'] as const).map((channel) => (
              <button
                key={channel}
                onClick={() => toggleChannel(channel)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
                  hasChannel(channel)
                    ? 'bg-[rgb(var(--navy))] text-white border-[rgb(var(--navy))]'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
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
                    channels: Array.from(new Set([...(preferences?.channels || ['in-app']), 'push'])),
                  })
                }
              }}
              disabled={!webPush.supported || !webPush.configured || webPush.subscribed}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold border bg-white text-[#1e293b] border-slate-300 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold border bg-white text-[#1e293b] border-slate-300 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Disable browser push
            </button>
            <p className="text-xs text-slate-500">
              {webPush.supported
                ? webPush.configured
                  ? `Permission: ${webPush.permission}`
                  : 'Push backend not configured (missing VAPID env vars).'
                : 'Browser push is not supported on this device/browser.'}
            </p>
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="mt-4 bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-[#1e293b] mb-3">Recent reminders</p>
            <div className="space-y-2">
              {notifications.slice(0, 5).map((n) => (
                <div key={n.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{n.title}</p>
                    <p className="text-xs text-slate-500">{n.message}</p>
                  </div>
                  {!n.readAt && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="text-xs font-semibold text-[rgb(var(--navy))] hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-800">How we make money:</strong> We charge for optional premium plan features — never through commissions, referrals, or kickbacks from lenders, agents, or title companies.
          </p>
        </div>
      </main>
    </div>
  )
}

