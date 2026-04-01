/**
 * Canonical personalization: quiz + affordability/readiness → flat {{tokens}} for NQ copy and email.
 * Optional segments in roadmap copy use `[[s: ... {{token}} ...]]` (only rendered when snapshot exists).
 */

import type { NQGuidedStep } from '@/lib/nq-guided-steps'
import type { QuizData, AffordabilityResult, ReadinessScore, Timeline } from '@/lib/calculations'
import {
  calculateAffordability,
  calculateReadinessScore,
  formatCurrency,
} from '@/lib/calculations'

const QUIZ_DATA_KEY = 'quizData'

export interface UserSnapshot {
  /** Flat replacement map for {{token}} in strings */
  tokens: Record<string, string>
  /** Core inputs/outputs for server-side email, etc. */
  quiz: QuizData
  affordability: AffordabilityResult
  readiness: ReadinessScore
  asOf: string
}

function timelineLabel(t: Timeline): string {
  switch (t) {
    case '3-months':
      return '~3 months'
    case '6-months':
      return '~6 months'
    case '1-year':
      return '~12 months'
    case 'exploring':
      return 'open-ended exploration'
    default:
      return String(t)
  }
}

function creditBandLabel(band: string): string {
  return band.replace(/-/g, '–')
}

function targetComfortNote(quiz: QuizData, aff: AffordabilityResult): string {
  const t = quiz.targetHomePrice
  if (!t || t <= 0) {
    return 'Use your comfortable max from the snapshot as your walk-away ceiling until you pick a specific listing.'
  }
  if (aff.targetComfortable) {
    return 'Your target price is **at or below** the comfortable range from your snapshot—use that as your green light for offers.'
  }
  if (aff.targetAffordable && aff.maxApproved > 0 && t <= aff.maxApproved) {
    return "Your target is **above** your comfortable snapshot max but still near what a lender may approve—negotiate **payment + reserves**, not just price."
  }
  return 'Your target is **above** what your snapshot suggests lenders may approve—either add down payment, improve DTI/credit, or recalibrate price before you fall in love with a listing.'
}

/** Parse localStorage `quizData` into QuizData when transaction is first-time buyer. */
export function parseStoredQuizData(raw: string | null): QuizData | null {
  if (!raw) return null
  try {
    const p = JSON.parse(raw) as Record<string, unknown>
    const tt = (p.transactionType as string) || 'first-time'
    if (tt !== 'first-time') return null

    const income = Number(p.income)
    const down = Number(p.downPayment)
    if (!Number.isFinite(income) && !Number.isFinite(down)) return null

    const monthlyDebt = Number(p.monthlyDebt) || 0
    const downPayment = Number.isFinite(down) ? Math.max(0, down) : 0
    const city = String(p.city || '').trim() || 'your area'

    return {
      income: Number.isFinite(income) && income > 0 ? income : 60_000,
      monthlyDebt,
      downPayment: downPayment || 20_000,
      city,
      ...(p.zipCode != null && String(p.zipCode).trim() !== ''
        ? { zipCode: String(p.zipCode).trim() }
        : {}),
      timeline: (p.timeline || '6-months') as QuizData['timeline'],
      creditScore: (p.creditScore || '650-700') as QuizData['creditScore'],
      agentStatus: (p.agentStatus || 'not-yet') as QuizData['agentStatus'],
      concern: (p.concern || 'hidden-costs') as QuizData['concern'],
      ...(p.targetHomePrice != null && p.targetHomePrice !== ''
        ? { targetHomePrice: Number(p.targetHomePrice) }
        : {}),
    }
  } catch {
    return null
  }
}

export function loadQuizDataFromLocalStorage(): QuizData | null {
  if (typeof window === 'undefined') return null
  try {
    return parseStoredQuizData(localStorage.getItem(QUIZ_DATA_KEY))
  } catch {
    return null
  }
}

/** Build snapshot from quiz answers (client localStorage or server `quizAnswers`). */
export function buildUserSnapshot(
  quiz: QuizData | null,
  opts?: { firstName?: string | null }
): UserSnapshot | null {
  if (!quiz) return null
  const affordability = calculateAffordability(quiz)
  const readiness = calculateReadinessScore(quiz, affordability)

  const fn = opts?.firstName?.trim() || ''
  const targetPrice = quiz.targetHomePrice && quiz.targetHomePrice > 0 ? quiz.targetHomePrice : null
  const targetOrRealistic = targetPrice ?? Math.round(affordability.realisticMax)
  const maintainLow = formatCurrency(Math.round(targetOrRealistic * 0.01))
  const maintainHigh = formatCurrency(Math.round(targetOrRealistic * 0.03))

  const tokens: Record<string, string> = {
    firstName: fn,
    greetingName: fn ? ` ${fn}` : '',
    city: quiz.city,
    timeline: timelineLabel(quiz.timeline),
    creditBand: creditBandLabel(String(quiz.creditScore)),
    downPayment: formatCurrency(Math.round(quiz.downPayment)),
    incomeAnnual: formatCurrency(Math.round(quiz.income)),
    realisticMax: formatCurrency(Math.round(affordability.realisticMax)),
    maxApproved: formatCurrency(Math.round(affordability.maxApproved)),
    monthlyPayment: formatCurrency(Math.round(affordability.monthlyPayment)),
    readiness: String(readiness.total),
    readinessHint: readiness.interpretation,
    targetHome: targetPrice != null ? formatCurrency(Math.round(targetPrice)) : '',
    targetMonthly:
      affordability.targetMonthlyPayment != null
        ? formatCurrency(Math.round(affordability.targetMonthlyPayment))
        : '',
    targetHomeOrRealistic: formatCurrency(Math.round(targetOrRealistic)),
    targetComfortNote: targetComfortNote(quiz, affordability),
    maintainLow,
    maintainHigh,
  }

  return {
    tokens,
    quiz,
    affordability,
    readiness,
    asOf: new Date().toISOString(),
  }
}

/** Merge server-stored `quizAnswers` (same shape as localStorage) into snapshot. */
export function buildUserSnapshotFromQuizAnswers(
  answers: Record<string, unknown> | null | undefined,
  opts?: { firstName?: string | null }
): UserSnapshot | null {
  if (!answers) return null
  const tt = (answers.transactionType as string) || 'first-time'
  if (tt !== 'first-time') return null
  try {
    const quiz = parseStoredQuizData(JSON.stringify(answers))
    return buildUserSnapshot(quiz, opts)
  } catch {
    return null
  }
}

const TOKEN_RE = /\{\{(\w+)\}\}/g

/** Replace `{{token}}` using snapshot tokens; unknown keys → empty string. */
export function replaceTokens(text: string, tokens: Record<string, string>): string {
  return text.replace(TOKEN_RE, (_, key: string) => tokens[key] ?? '')
}

/**
 * Full personalization for one NQ field: optional snapshot blocks + tokens.
 * Collapses double spaces left by empty replacements.
 */
export function personalizeNqField(text: string, snapshot: UserSnapshot | null): string {
  let t = text
  if (!snapshot) {
    t = t.replace(/\[\[s:[\s\S]*?\]\]/g, '')
  } else {
    t = t.replace(/\[\[s:([\s\S]*?)\]\]/g, (_, inner: string) => {
      const out = replaceTokens(inner.trim(), snapshot.tokens).trim()
      return out ? ` ${out}` : ''
    })
  }
  t = replaceTokens(t, snapshot?.tokens ?? {})
  return t.replace(/\s{2,}/g, ' ').trim()
}

export function personalizeNqStep(step: NQGuidedStep, snapshot: UserSnapshot | null): NQGuidedStep {
  return {
    ...step,
    nqContext: personalizeNqField(step.nqContext, snapshot),
    nqWhatToDo: personalizeNqField(step.nqWhatToDo, snapshot),
    nqWhatItMeans:
      step.nqWhatItMeans != null ? personalizeNqField(step.nqWhatItMeans, snapshot) : undefined,
    nqWhyItMattersCards: step.nqWhyItMattersCards?.map((c) => ({
      title: c.title,
      detail: personalizeNqField(c.detail, snapshot),
    })),
    nqEncouragement: step.nqEncouragement
      ? personalizeNqField(step.nqEncouragement, snapshot)
      : undefined,
    nqPhaseChecklist: step.nqPhaseChecklist?.map((line) => personalizeNqField(line, snapshot)),
  }
}

/** One-line for reminder email / push (plain text). */
export function getSnapshotOneLiner(snapshot: UserSnapshot | null): string {
  if (!snapshot) {
    return 'Complete one roadmap task this week to keep momentum and protect your savings opportunities.'
  }
  const { tokens } = snapshot
  return `You're tracking about ${tokens.realisticMax} comfortable max, ${tokens.downPayment} toward down payment, and readiness ${tokens.readiness}/100—open your roadmap for the next best step.`
}
