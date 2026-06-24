'use client'

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { useReducedMotion } from 'framer-motion'
import { CheckCircle, Lock } from '@phosphor-icons/react'
import clsx from 'clsx'
import type { UserTier } from '@/lib/tiers'
import { TIER_DEFINITIONS } from '@/lib/tiers'
import { getJourneyPhaseByOrder } from '@/lib/journey-phases-data'
import { getAvgUserSavingsAtPhase } from '@/lib/journey-timeline-avg-savings'

export type JourneyTimelineProps = {
  phaseOrders: readonly number[]
  currentPhaseOrder: number
  effectiveTier: UserTier
  canAccessPhase: (phaseOrder: number) => boolean
  onSelectPhase: (phaseOrder: number) => void
  onLockedPhaseClick?: (phaseOrder: number) => void
  isPhaseComplete: (phaseOrder: number) => boolean
  getPhaseBlockedHint?: (phaseOrder: number) => string | undefined
  /** Down payment / savings toward purchase (e.g. quiz downPayment). */
  currentSavings: number
  /** Hide intro copy + percentile (e.g. compact Today strip). */
  compact?: boolean
}

function weekEstimateLabel(estimatedTime: string): string {
  const t = estimatedTime.trim()
  if (/ongoing/i.test(t)) return 'Ongoing'
  const range = t.match(/(\d+)\s*[-–]\s*(\d+)/)
  if (range) {
    const mid = Math.round((Number(range[1]) + Number(range[2])) / 2)
    return `~${mid} weeks`
  }
  const one = t.match(/(\d+)/)
  if (one) return `~${one[1]} weeks`
  return t
}

function nodeState(
  order: number,
  currentPhaseOrder: number,
  complete: boolean,
  accessible: boolean
): 'complete' | 'current' | 'future' {
  if (complete) return 'complete'
  if (order === currentPhaseOrder && accessible) return 'current'
  return 'future'
}

export default function JourneyTimeline({
  phaseOrders,
  currentPhaseOrder,
  effectiveTier,
  canAccessPhase,
  onSelectPhase,
  onLockedPhaseClick,
  isPhaseComplete,
  getPhaseBlockedHint,
  currentSavings,
  compact = false,
}: JourneyTimelineProps) {
  const reduceMotion = useReducedMotion() ?? false
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [inView, setInView] = useState(false)
  const [badgeVisible, setBadgeVisible] = useState(false)
  const [hoveredOrder, setHoveredOrder] = useState<number | null>(null)
  const baseId = useId()

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const bump = () => {
      const r = el.getBoundingClientRect()
      if (r.top < (typeof window !== 'undefined' ? window.innerHeight : 800) && r.bottom > 0) {
        setInView(true)
      }
    }
    bump()
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setInView(true)
      },
      { threshold: 0.08, rootMargin: '0px 0px 10% 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!inView || reduceMotion) {
      setBadgeVisible(true)
      return
    }
    const t = window.setTimeout(() => setBadgeVisible(true), 1200)
    return () => window.clearTimeout(t)
  }, [inView, reduceMotion])

  const avgAtCurrent = getAvgUserSavingsAtPhase(currentPhaseOrder)
  const percentile = (() => {
    if (avgAtCurrent <= 0) return 0
    return Math.min(99, Math.max(0, Math.round((currentSavings / avgAtCurrent) * 100)))
  })()

  const renderNodeButton = useCallback(
    (phaseOrder: number) => {
      const meta = getJourneyPhaseByOrder(phaseOrder)
      const title = meta?.title ?? `Phase ${phaseOrder}`
      const description = meta?.description ?? ''
      const est = meta?.estimatedTime ?? '—'
      const accessible = canAccessPhase(phaseOrder)
      const complete = isPhaseComplete(phaseOrder)
      const current = phaseOrder === currentPhaseOrder
      const state = nodeState(phaseOrder, currentPhaseOrder, complete, accessible)
      const lockedBeyondFoundations =
        !accessible && phaseOrder > 2 && effectiveTier === 'foundations'
      const blockedHint = getPhaseBlockedHint?.(phaseOrder)
      const showTooltip = hoveredOrder === phaseOrder

      const handleActivate = () => {
        if (accessible) onSelectPhase(phaseOrder)
        else onLockedPhaseClick?.(phaseOrder)
      }

      const weekLine = weekEstimateLabel(meta?.estimatedTime ?? '2-4 weeks')

      return (
        <div
          className="relative flex flex-col items-center"
          onMouseEnter={() => setHoveredOrder(phaseOrder)}
          onMouseLeave={() => setHoveredOrder((h) => (h === phaseOrder ? null : h))}
        >
          <div className="flex min-h-[3rem] w-full flex-col items-center justify-end px-1">
            {current && accessible ? (
              <div className="mb-1 flex flex-col items-center" aria-hidden>
                <span
                  className="h-0 w-0 border-x-[6px] border-x-transparent border-b-[7px] border-b-[color:var(--accent)]"
                  aria-hidden
                />
                <span
                  className="mt-0.5 text-[10px] font-semibold leading-none"
                  style={{ color: 'var(--accent)' }}
                >
                  You are here
                </span>
                <span
                  className={clsx(
                    'mt-1.5 h-1.5 w-1.5 rounded-full',
                    !reduceMotion && 'animate-pulse'
                  )}
                  style={{ background: 'var(--accent)' }}
                />
              </div>
            ) : (
              <div className="min-h-[3rem]" aria-hidden />
            )}
          </div>

          <button
            type="button"
            onClick={handleActivate}
            aria-label={`${title}${accessible ? '' : ', locked'}`}
            aria-expanded={showTooltip}
            className="relative z-10 flex flex-col items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] focus-visible:ring-offset-2"
          >
            <span
              className={clsx(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                state === 'complete' && 'border-[#2D6A4F] bg-[#2D6A4F]',
                state === 'current' && 'journey-timeline-node--current border-[#2D6A4F] bg-white',
                state === 'future' && 'border-[#B7C9C0] bg-[#E8EDEB]'
              )}
            >
              {state === 'complete' ? (
                <CheckCircle weight="duotone" className="text-white" size={26} aria-hidden />
              ) : state === 'current' ? null : (
                <Lock weight="duotone" className="text-slate-400" size={22} aria-hidden />
              )}
            </span>
          </button>

          <p
            className={clsx(
              'mt-2 max-w-[9rem] text-center text-[13px] font-medium leading-tight',
              state === 'future' ? 'text-[color:var(--muted)]' : 'text-[color:var(--text)]'
            )}
          >
            {title}
          </p>
          <p
            className="mt-0.5 text-[11px] italic leading-snug text-[color:var(--muted)]"
          >
            {weekLine}
          </p>

          <div
            role="tooltip"
            id={`${baseId}-tip-${phaseOrder}`}
            className={clsx(
              'absolute left-1/2 top-full z-50 mt-2 w-[min(280px,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-slate-200/90 bg-white p-3 text-left shadow-lg transition-opacity duration-150',
              showTooltip ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
            )}
          >
            <p className="text-sm font-bold text-slate-900">{title}</p>
            <p className="mt-1 text-xs leading-snug text-slate-600">{description}</p>
            <p className="mt-2 text-xs text-slate-500">Estimated time: {est}</p>
            {accessible ? (
              <button
                type="button"
                onClick={() => onSelectPhase(phaseOrder)}
                className="mt-2 text-xs font-semibold text-[#2D6A4F] underline hover:text-[#1b4332]"
              >
                Go to this phase →
              </button>
            ) : (
              <p className="mt-2 text-xs font-medium text-slate-400">
                Go to this phase → <span className="sr-only">(locked)</span>
              </p>
            )}
            {blockedHint ? (
              <p className="mt-1 text-[11px] text-slate-500">{blockedHint}</p>
            ) : !accessible ? (
              <p className="mt-1 text-[11px] text-slate-500">
                {lockedBeyondFoundations ? (
                  <>
                    Momentum unlocks phases beyond 2.{' '}
                    <span className="italic">&ldquo;{TIER_DEFINITIONS.momentum.mindset}&rdquo;</span>
                  </>
                ) : (
                  'Upgrade your plan to unlock this phase.'
                )}
              </p>
            ) : null}
          </div>
        </div>
      )
    },
    [
      baseId,
      canAccessPhase,
      currentPhaseOrder,
      effectiveTier,
      getPhaseBlockedHint,
      hoveredOrder,
      isPhaseComplete,
      onLockedPhaseClick,
      onSelectPhase,
      reduceMotion,
    ]
  )

  const segmentCount = Math.max(0, phaseOrders.length - 1)

  const segmentFill = (index: number) => {
    const leftOrder = phaseOrders[index]
    if (leftOrder === undefined) return false
    return isPhaseComplete(leftOrder)
  }

  const transitionStyle = (i: number): CSSProperties => ({
    transition: reduceMotion ? 'none' : 'width 600ms ease-out',
    transitionDelay: reduceMotion ? '0ms' : `${150 * i}ms`,
    width: inView && segmentFill(i) ? '100%' : '0%',
  })

  return (
    <div className={clsx('space-y-4', compact && 'space-y-3')}>
      {!compact ? (
        <>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-600">{phaseOrders.length}-phase roadmap</p>
          <p className="text-sm text-slate-600">
            Scroll or hover a phase for details. Tap a green step to jump ahead when it&apos;s unlocked for your tier.
          </p>
        </>
      ) : null}

      <div ref={rootRef} className="overflow-visible">
        {/* Desktop / md+: horizontal */}
        <div className="scrollbar-hide hidden overflow-x-auto pb-2 lg:block">
          <div className="flex min-w-max items-center justify-center gap-0 px-2 py-1">
            {phaseOrders.map((order, i) => (
              <div key={order} className="flex items-center">
                {renderNodeButton(order)}
                {i < segmentCount ? (
                  <div
                    className="relative mx-1 h-0.5 min-w-[40px] max-w-[120px] flex-1 shrink"
                    aria-hidden
                  >
                    <div className="absolute inset-0 rounded-full border-t-2 border-dashed border-[#B7C9C0]" />
                    <div
                      className="absolute inset-y-0 left-0 overflow-hidden rounded-full bg-[#2D6A4F]"
                      style={transitionStyle(i)}
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: vertical */}
        <div className="relative pl-4 lg:hidden">
          <div
            className="pointer-events-none absolute bottom-1 left-[18px] top-3 w-0.5 border-l-2 border-dashed border-[#B7C9C0]"
            aria-hidden
          />
          <ul className="relative list-none space-y-0 p-0" role="list">
            {phaseOrders.map((order, i) => {
              const meta = getJourneyPhaseByOrder(order)
              const title = meta?.title ?? `Phase ${order}`
              const description = meta?.description ?? ''
              const est = meta?.estimatedTime ?? '—'
              const accessible = canAccessPhase(order)
              const complete = isPhaseComplete(order)
              const current = order === currentPhaseOrder
              const state = nodeState(order, currentPhaseOrder, complete, accessible)
              const lockedBeyondFoundations =
                !accessible && order > 2 && effectiveTier === 'foundations'
              const blockedHint = getPhaseBlockedHint?.(order)
              const weekLine = weekEstimateLabel(meta?.estimatedTime ?? '2-4 weeks')

              return (
                <li key={order} className="relative flex gap-3 pb-8 last:pb-0">
                  <div className="relative z-10 flex w-14 shrink-0 flex-col items-center">
                    {current && accessible ? (
                      <div className="mb-1 flex flex-col items-center" aria-hidden>
                        <span
                          className="text-[10px] font-semibold leading-none"
                          style={{ color: 'var(--accent)' }}
                        >
                          You are here
                        </span>
                        <span
                          className="mt-1 h-1.5 w-1.5 rounded-full"
                          style={{ background: 'var(--accent)' }}
                        />
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={() =>
                        accessible ? onSelectPhase(order) : onLockedPhaseClick?.(order)
                      }
                      className={clsx(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2',
                        state === 'complete' && 'border-[#2D6A4F] bg-[#2D6A4F]',
                        state === 'current' && 'journey-timeline-node--current border-[#2D6A4F] bg-white',
                        state === 'future' && 'border-[#B7C9C0] bg-[#E8EDEB]'
                      )}
                      aria-label={`${title}${accessible ? '' : ', locked'}`}
                    >
                      {state === 'complete' ? (
                        <CheckCircle weight="duotone" className="text-white" size={26} aria-hidden />
                      ) : state === 'current' ? null : (
                        <Lock weight="duotone" className="text-slate-400" size={22} aria-hidden />
                      )}
                    </button>
                    {i < segmentCount ? (
                      <div className="relative mt-2 h-10 w-0.5 overflow-hidden">
                        <div className="absolute inset-0 border-l-2 border-dashed border-[#B7C9C0]" />
                        <div
                          className="absolute left-0 top-0 h-full w-full origin-top bg-[#2D6A4F]"
                          style={{
                            transform: `scaleY(${inView && segmentFill(i) ? 1 : 0})`,
                            transition: reduceMotion ? 'none' : 'transform 600ms ease-out',
                            transitionDelay: reduceMotion ? '0ms' : `${150 * i}ms`,
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    <p
                      className={clsx(
                        'text-[13px] font-medium leading-tight',
                        state === 'future' ? 'text-[color:var(--muted)]' : 'text-[color:var(--text)]'
                      )}
                    >
                      {title}
                    </p>
                    <p className="mt-0.5 text-[11px] italic text-[color:var(--muted)]">{weekLine}</p>
                    <p className="mt-0.5 text-xs text-slate-600">{description}</p>
                    <p className="mt-1 text-xs text-slate-500">Estimated time: {est}</p>
                    {accessible ? (
                      <button
                        type="button"
                        onClick={() => onSelectPhase(order)}
                        className="mt-1 text-xs font-semibold text-[#2D6A4F] underline"
                      >
                        Go to this phase →
                      </button>
                    ) : (
                      <p className="mt-1 text-xs text-slate-400">Go to this phase → (locked)</p>
                    )}
                    {blockedHint ? (
                      <p className="mt-1 text-[11px] text-slate-500">{blockedHint}</p>
                    ) : !accessible ? (
                      <p className="mt-1 text-[11px] text-slate-500">
                        {lockedBeyondFoundations ? (
                          <>
                            Momentum unlocks phases beyond 2.{' '}
                            <span className="italic">&ldquo;{TIER_DEFINITIONS.momentum.mindset}&rdquo;</span>
                          </>
                        ) : (
                          'Upgrade your plan to unlock this phase.'
                        )}
                      </p>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {!compact ? (
        <div
          className={clsx(
            'mx-auto max-w-xl rounded-full px-4 py-2 text-center text-[13px] font-semibold text-white transition-opacity duration-500',
            badgeVisible ? 'opacity-100' : 'opacity-0'
          )}
          style={{ background: 'var(--success)' }}
          role="status"
        >
          You&apos;re ahead of {percentile}% of NestQuest users at your savings level
        </div>
      ) : null}
    </div>
  )
}
