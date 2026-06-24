'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Check, Target } from '@phosphor-icons/react'
import type { NQGuidedStep } from '@/lib/nq-guided-steps'

type Props = {
  displayStep: NQGuidedStep
  phaseChecklistItems?: string[]
  phaseChecklistDone: boolean[]
  togglePhaseChecklist: (idx: number) => void
  renderNqSaysContext: (text: string) => ReactNode
  renderWithAnnualCreditReportLink: (text: string) => ReactNode
  onIDidIt: () => void
  onSkip: () => void
  onBack: () => void
  currentStepMarkedDone: boolean
  isLastStep: boolean
  currentStepIndex: number
  reduceMotion?: boolean
  /** When true, renders inside onboarding card without duplicate outer shell. */
  embedded?: boolean
  /** Phase status row inside the same card shell. */
  headerSlot?: ReactNode
}

export default function JourneyTodayChecklistCard({
  displayStep,
  phaseChecklistItems,
  phaseChecklistDone,
  togglePhaseChecklist,
  renderNqSaysContext,
  renderWithAnnualCreditReportLink,
  onIDidIt,
  onSkip,
  onBack,
  currentStepMarkedDone,
  isLastStep,
  currentStepIndex,
  reduceMotion = false,
  embedded = false,
  headerSlot = null,
}: Props) {
  const body = (
    <>
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--nq-ed-accent-soft)] text-[var(--nq-ed-accent)] ring-1 ring-inset ring-[var(--nq-ed-accent)]/15">
          <Target weight="duotone" className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--nq-ed-muted)]">
            Do this next
          </p>
          <h2 className="mt-1 font-display text-xl font-semibold leading-snug tracking-tight text-[var(--nq-ed-text)] sm:text-2xl">
            {displayStep.title}
          </h2>
          <p className="mt-1 text-xs text-[var(--nq-ed-muted)]">About 4–5 minutes</p>
        </div>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-[var(--nq-ed-muted)]">
        {renderNqSaysContext(displayStep.nqContext)}
      </p>
      <div className="mt-4 rounded-2xl border border-[var(--nq-ed-line)] bg-[#fffdf8] p-4">
        <p className="nq-ed-eyebrow">What to do</p>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--nq-ed-text)]">
          {renderWithAnnualCreditReportLink(displayStep.nqWhatToDo)}
        </p>
      </div>
      {phaseChecklistItems && phaseChecklistItems.length > 0 ? (
        <ul className="mt-4 space-y-2" role="list">
          {phaseChecklistItems.map((item, idx) => (
            <li key={`today-cl-${idx}`} className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={phaseChecklistDone[idx] ?? false}
                onChange={() => togglePhaseChecklist(idx)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--nq-ed-line)] text-[var(--nq-ed-accent)] focus:ring-[var(--nq-ed-accent)]"
              />
              <span
                className={`text-sm leading-relaxed ${
                  phaseChecklistDone[idx]
                    ? 'text-[var(--nq-ed-muted)] line-through'
                    : 'font-medium text-[var(--nq-ed-text)]'
                }`}
              >
                {renderWithAnnualCreditReportLink(item)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onIDidIt}
          disabled={currentStepMarkedDone}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--nq-ed-accent)] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0f6058] disabled:opacity-50"
        >
          <Check weight="duotone" size={18} aria-hidden /> {currentStepMarkedDone ? 'Done' : 'I did it'}
        </button>
        <button
          type="button"
          onClick={onSkip}
          disabled={isLastStep}
          className="text-sm font-semibold text-[var(--nq-ed-muted)] underline underline-offset-2 hover:text-[var(--nq-ed-text)] disabled:opacity-40"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={currentStepIndex === 0}
          className="text-sm font-semibold text-[var(--nq-ed-muted)] underline underline-offset-2 hover:text-[var(--nq-ed-text)] disabled:opacity-40"
        >
          Back
        </button>
      </div>
    </>
  )

  if (embedded) {
    return (
      <div id="journey-today-checklist">
        {body}
      </div>
    )
  }

  return (
    <motion.div
      id="journey-today-checklist"
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.01 : 0.45 }}
      className="relative overflow-hidden rounded-3xl border border-[var(--nq-ed-line)] bg-[var(--nq-ed-surface)] shadow-[0_14px_32px_rgba(29,23,17,0.05)]"
    >
      <span
        className="pointer-events-none absolute left-6 top-0 z-[1] h-[2px] w-9 rounded-b bg-[var(--nq-ed-accent)]"
        aria-hidden
      />
      {headerSlot ? <div className="px-5 pt-5 sm:px-6 sm:pt-6">{headerSlot}</div> : null}
      <div className="p-5 sm:p-6">{body}</div>
    </motion.div>
  )
}
