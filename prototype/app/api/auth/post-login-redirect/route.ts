import { NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth-server'
import { getUserQuizState } from '@/lib/user-store'

/**
 * Returns where to send the user after login/signup:
 * - If they have completed quiz (saved state with enough data), redirect to /results with query params.
 * - Otherwise redirect to /quiz (with transactionType if known).
 * Used when user comes from primary CTAs (e.g. Find My Savings) so they land on results or quiz accordingly.
 */
export async function GET(request: Request) {
  const session = await getSessionFromRequest()
  if (!session) {
    return NextResponse.json({ redirect: '/auth', message: 'Not authenticated' }, { status: 200 })
  }

  const { searchParams } = new URL(request.url)
  const preferredTransactionType = searchParams.get('transactionType') || 'first-time'

  const state = getUserQuizState(session.userId)
  const transactionType = state?.transactionType || preferredTransactionType

  // Consider "has results" if they have quiz answers with at least one key beyond transactionType (e.g. income, city)
  const answers = state?.quizAnswers ?? {}
  const keys = Object.keys(answers).filter((k) => k !== 'transactionType' && answers[k] != null && answers[k] !== '')
  const hasCompletedQuiz = keys.length > 0 && (answers.income != null || answers.city != null || answers.currentHomeValue != null)

  if (hasCompletedQuiz) {
    const params = new URLSearchParams()
    params.set('transactionType', transactionType)
    const allowed = [
      'income',
      'monthlyDebt',
      'downPayment',
      'city',
      'timeline',
      'creditScore',
      'agentStatus',
      'concern',
      'currentHomeValue',
      'currentMortgageBalance',
      'expectedSalePrice',
      'currentRate',
      'currentMonthlyPayment',
      'currentYearsRemaining',
      'yearsRemaining',
      'refinanceGoals',
      'cashoutAmount',
      'propertyType',
      'previousRefinances',
      'ownedYears',
      'saleStatus',
      'additionalSavings',
      'agentCommission',
      'repairsAndConcessions',
      'debtPayoff',
      'sellingClosingCosts',
    ]
    allowed.forEach((k) => {
      const v = answers[k]
      if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
    })
    return NextResponse.json({
      redirect: `/results?${params.toString()}`,
      reason: 'has_results',
    })
  }

  return NextResponse.json({
    redirect: `/quiz?transactionType=${transactionType}`,
    reason: 'needs_quiz',
  })
}
