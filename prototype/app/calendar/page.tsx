'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, LayoutList, CalendarDays } from 'lucide-react'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'

type MilestoneStatus = 'completed' | 'upcoming' | 'future'

export interface JourneyMilestone {
  id: string
  title: string
  description: string
  date: Date
}

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function getMilestoneStatus(date: Date, today: Date): MilestoneStatus {
  const d = startOfDay(date)
  const t = startOfDay(today)
  if (d < t) return 'completed'
  const end = addDays(t, 7)
  if (d <= end) return 'upcoming'
  return 'future'
}

/** Default milestone set — relative to journey anchor (simulates action-plan timeline). */
function buildDefaultMilestones(anchor: Date): JourneyMilestone[] {
  const a = startOfDay(anchor)
  const defs: { day: number; title: string; description: string }[] = [
    { day: 1, title: 'Pull credit report', description: 'Request free annual reports and review for errors.' },
    { day: 2, title: 'Review budget', description: 'Align monthly payment with savings and DTI comfort.' },
    { day: 8, title: 'Research lenders', description: 'Compare rates, fees, and loan types that fit your timeline.' },
    { day: 10, title: 'Pre-approval documents', description: 'Gather W-2s, pay stubs, and asset statements.' },
    { day: 18, title: 'Submit pre-approval application', description: 'File with chosen lender; aim for written pre-approval.' },
    { day: 22, title: 'Pre-approval follow-up', description: 'Address lender conditions and finalize letter amount.' },
    { day: 35, title: 'Begin property search', description: 'Tour homes in budget; refine must-haves vs. nice-to-haves.' },
    { day: 65, title: 'Make first offer', description: 'Submit competitive offer with inspection and financing contingencies.' },
    { day: 95, title: 'Under contract', description: 'Open escrow; schedule inspection and appraisal.' },
    { day: 105, title: 'Inspection & appraisal', description: 'Negotiate repairs; confirm value supports loan.' },
    { day: 125, title: 'Final walkthrough', description: 'Verify repairs and condition before closing.' },
    { day: 128, title: 'Closing day', description: 'Sign documents; receive keys when funds clear.' },
  ]
  return defs.map((def, i) => ({
    id: `m-${i}`,
    title: def.title,
    description: def.description,
    date: addDays(a, def.day),
  }))
}

const GANTT_PHASES: {
  key: string
  label: string
  startDay: number
  endDay: number
  color: string
  bar: string
}[] = [
  { key: 'prep', label: 'Preparation', startDay: 0, endDay: 14, color: 'text-blue-700', bar: 'bg-blue-500' },
  { key: 'pre', label: 'Pre-Approval', startDay: 14, endDay: 35, color: 'text-teal-700', bar: 'bg-[#0d9488]' },
  { key: 'search', label: 'Search', startDay: 35, endDay: 65, color: 'text-green-700', bar: 'bg-green-600' },
  { key: 'offer', label: 'Offer & Contract', startDay: 65, endDay: 105, color: 'text-[#c0622a]', bar: 'bg-[#c0622a]' },
  { key: 'close', label: 'Closing', startDay: 105, endDay: 135, color: 'text-[#1a6b3c]', bar: 'bg-[#1a6b3c]' },
]

function monthMatrix(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1)
  const startPad = (first.getDay() + 6) % 7 // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < startPad; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)
  const rows: (Date | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
  return rows
}

export default function CalendarPage() {
  const today = useMemo(() => startOfDay(new Date()), [])
  const journeyAnchor = useMemo(() => addDays(today, -45), [today])
  const milestones = useMemo(() => buildDefaultMilestones(journeyAnchor), [journeyAnchor])

  const [view, setView] = useState<'month' | 'gantt'>('month')
  const [cursor, setCursor] = useState(() => {
    const n = new Date()
    return new Date(n.getFullYear(), n.getMonth(), 1)
  })
  const [popover, setPopover] = useState<{ date: Date; items: JourneyMilestone[] } | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 3200)
  }, [])

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const matrix = useMemo(() => monthMatrix(year, month), [year, month])

  const milestonesByDay = useMemo(() => {
    const map = new Map<string, JourneyMilestone[]>()
    for (const m of milestones) {
      const key = `${m.date.getFullYear()}-${m.date.getMonth()}-${m.date.getDate()}`
      const arr = map.get(key) ?? []
      arr.push(m)
      map.set(key, arr)
    }
    return map
  }, [milestones])

  const totalDays = 140
  const progressByPhase = useMemo(() => {
    const elapsed = Math.min(
      totalDays,
      Math.max(0, Math.floor((today.getTime() - journeyAnchor.getTime()) / (24 * 60 * 60 * 1000)))
    )
    return GANTT_PHASES.map((p) => {
      const phaseLen = p.endDay - p.startDay
      const doneInPhase = Math.min(phaseLen, Math.max(0, elapsed - p.startDay))
      const pct = phaseLen <= 0 ? 0 : Math.round((doneInPhase / phaseLen) * 100)
      return { ...p, pct: Math.min(100, pct) }
    })
  }, [today, journeyAnchor])

  const goPrevMonth = () => setCursor(new Date(year, month - 1, 1))
  const goNextMonth = () => setCursor(new Date(year, month + 1, 1))
  const goToday = () => {
    const n = new Date()
    setCursor(new Date(n.getFullYear(), n.getMonth(), 1))
  }

  const monthLabel = cursor.toLocaleString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="app-page-shell">
      <header className="sticky top-0 z-20 border-b border-[#e7e5e4] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <BackToMyJourneyLink />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setView('month')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition ${
                view === 'month'
                  ? 'bg-[#1a6b3c] text-white'
                  : 'border border-[#e7e5e4] bg-white text-[#57534e] hover:border-[#1a6b3c]/40'
              }`}
            >
              <CalendarDays className="h-4 w-4" aria-hidden />
              Month
            </button>
            <button
              type="button"
              onClick={() => setView('gantt')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition ${
                view === 'gantt'
                  ? 'bg-[#1a6b3c] text-white'
                  : 'border border-[#e7e5e4] bg-white text-[#57534e] hover:border-[#1a6b3c]/40'
              }`}
            >
              <LayoutList className="h-4 w-4" aria-hidden />
              Timeline
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0d9488]">Journey calendar</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-[#1c1917]">Your home buying timeline</h1>
            <p className="mt-2 max-w-2xl text-[#57534e]">
              Milestones from your action plan. Switch to the Gantt view to see phases across your full journey.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              showToast('Google Calendar sync is not connected in this demo. Use export or reminders from your journey.')
            }
            className="rounded-xl border border-[#e7e5e4] bg-white px-4 py-2.5 text-sm font-semibold text-[#1a6b3c] shadow-sm transition hover:bg-[#f5f5f4]"
          >
            Sync to Google Calendar
          </button>
        </div>

        {view === 'month' ? (
          <section className="rounded-xl border border-[#e7e5e4] bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl font-bold text-[#1c1917]">{monthLabel}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={goPrevMonth}
                  className="rounded-lg border border-[#e7e5e4] p-2 hover:bg-[#fafaf9]"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={goToday}
                  className="rounded-lg border border-[#1a6b3c]/30 bg-[#1a6b3c]/5 px-3 py-2 text-sm font-semibold text-[#1a6b3c] hover:bg-[#1a6b3c]/10"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={goNextMonth}
                  className="rounded-lg border border-[#e7e5e4] p-2 hover:bg-[#fafaf9]"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mb-3 flex flex-wrap gap-4 text-xs text-[#57534e]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#16a34a]" /> Completed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#0d9488]" /> Next 7 days
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#c0622a]" /> Future
              </span>
            </div>

            <div className="grid grid-cols-7 gap-px rounded-lg bg-[#e7e5e4] text-center text-xs font-semibold text-[#78716c]">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <div key={d} className="bg-[#fafaf9] py-2">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-b-lg border border-t-0 border-[#e7e5e4] bg-[#e7e5e4]">
              {matrix.flat().map((cell, idx) => {
                if (!cell) {
                  return <div key={`empty-${idx}`} className="min-h-[5.5rem] bg-[#fafaf9]" />
                }
                const key = `${cell.getFullYear()}-${cell.getMonth()}-${cell.getDate()}`
                const dayMilestones = milestonesByDay.get(key) ?? []
                const isToday = sameDay(cell, today)
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      if (dayMilestones.length) setPopover({ date: cell, items: dayMilestones })
                      else setPopover(null)
                    }}
                    className={`relative min-h-[5.5rem] bg-white p-1.5 text-left text-sm transition hover:bg-[#fafaf9] ${
                      isToday ? 'ring-2 ring-inset ring-[#0d9488]' : ''
                    }`}
                  >
                    <span className={`font-semibold ${isToday ? 'text-[#0d9488]' : 'text-[#1c1917]'}`}>
                      {cell.getDate()}
                    </span>
                    <div className="mt-1 flex flex-wrap gap-0.5">
                      {dayMilestones.slice(0, 4).map((m) => {
                        const st = getMilestoneStatus(m.date, today)
                        const dot =
                          st === 'completed'
                            ? 'bg-[#16a34a]'
                            : st === 'upcoming'
                              ? 'bg-[#0d9488]'
                              : 'bg-[#c0622a]'
                        return <span key={m.id} className={`h-1.5 w-1.5 rounded-full ${dot}`} title={m.title} />
                      })}
                      {dayMilestones.length > 4 ? (
                        <span className="text-[10px] text-[#78716c]">+{dayMilestones.length - 4}</span>
                      ) : null}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        ) : (
          <section className="rounded-xl border border-[#e7e5e4] bg-white p-4 shadow-sm sm:p-6">
            <h2 className="font-display text-xl font-bold text-[#1c1917]">Journey phases (Gantt)</h2>
            <p className="mt-1 text-sm text-[#57534e]">
              Relative to your journey start ({journeyAnchor.toLocaleDateString()}). Percent shows estimated completion.
            </p>
            <div className="mt-6 space-y-4">
              {progressByPhase.map((p) => (
                <div key={p.key}>
                  <div className="mb-1 flex flex-wrap justify-between gap-2 text-sm">
                    <span className={`font-semibold ${p.color}`}>{p.label}</span>
                    <span className="text-[#57534e]">
                      Day {p.startDay} – {p.endDay} · {p.pct}% complete
                    </span>
                  </div>
                  <div className="h-10 w-full overflow-hidden rounded-lg bg-[#f5f5f4]">
                    <div
                      className={`flex h-full items-center justify-end pr-2 text-xs font-bold text-white ${p.bar}`}
                      style={{ width: `${p.pct}%`, minWidth: p.pct > 0 ? '2.5rem' : 0 }}
                    >
                      {p.pct > 15 ? `${p.pct}%` : ''}
                    </div>
                  </div>
                  <p className="mt-0.5 text-xs text-[#78716c]">
                    Start {addDays(journeyAnchor, p.startDay).toLocaleDateString()} · End{' '}
                    {addDays(journeyAnchor, p.endDay).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {popover && (
          <div
            className="fixed inset-0 z-40 flex items-end justify-center bg-black/30 p-4 sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cal-pop-title"
            onClick={() => setPopover(null)}
          >
            <div
              className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-xl border border-[#e7e5e4] bg-white p-5 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="cal-pop-title" className="font-display text-lg font-bold text-[#1c1917]">
                {popover.date.toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              <ul className="mt-4 space-y-4">
                {popover.items.map((m) => (
                  <li key={m.id} className="border-b border-[#f5f5f4] pb-4 last:border-0 last:pb-0">
                    <p className="font-semibold text-[#1c1917]">{m.title}</p>
                    <p className="mt-1 text-sm text-[#57534e]">{m.description}</p>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-4 w-full rounded-xl bg-[#1a6b3c] py-2.5 text-sm font-semibold text-white hover:bg-[#155c33]"
                onClick={() => setPopover(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {toast ? (
          <div
            className="fixed bottom-6 left-1/2 z-50 max-w-sm -translate-x-1/2 rounded-xl border border-[#e7e5e4] bg-white px-4 py-3 text-sm font-medium text-[#1c1917] shadow-lg"
            role="status"
          >
            {toast}
          </div>
        ) : null}

        <p className="mt-8 text-center text-sm text-[#57534e]">
          <Link href="/customized-journey" className="font-semibold text-[#1a6b3c] hover:underline">
            Open My Journey
          </Link>{' '}
          for live tasks tied to these milestones.
        </p>
      </main>
    </div>
  )
}
