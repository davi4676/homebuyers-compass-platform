'use client'

type Props = {
  displayPhaseOrder: number
  phaseTotalForDisplay: number
  phaseHeadingTitle: string
  milestoneIndexInPhase: number
  milestonesInPhase: number
  progressPct: number
  accentColor: string
  /** When true, omits outer card chrome — for use inside a parent panel. */
  inset?: boolean
}

export default function JourneyTodayStatusStrip({
  displayPhaseOrder,
  phaseTotalForDisplay,
  phaseHeadingTitle,
  milestoneIndexInPhase,
  milestonesInPhase,
  progressPct,
  accentColor,
  inset = false,
}: Props) {
  return (
    <div
      className={
        inset
          ? 'flex flex-col gap-2 border-b border-[var(--nq-ed-line)] pb-4 sm:flex-row sm:items-center sm:justify-between'
          : 'nq-ed-soft-card flex flex-col gap-2 border border-[var(--nq-ed-line)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5'
      }
      aria-label="Journey status"
    >
      <p className="text-sm font-medium text-[var(--nq-ed-text)] sm:text-[15px]">
        <span className="text-[var(--nq-ed-muted)]">Phase {displayPhaseOrder} of {phaseTotalForDisplay}</span>
        {' · '}
        {phaseHeadingTitle}
        {' · '}
        <span className="text-[var(--nq-ed-muted)]">
          Milestone {milestoneIndexInPhase} of {milestonesInPhase}
        </span>
      </p>
      <div className="h-1.5 w-full shrink-0 overflow-hidden rounded-full bg-[var(--nq-ed-line-soft)] sm:max-w-[8rem]">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${progressPct}%`, background: accentColor }}
          aria-hidden
        />
      </div>
    </div>
  )
}
