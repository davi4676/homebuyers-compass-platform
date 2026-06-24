/**
 * Personalized "read next" recommendations from quiz readiness and profile signals.
 */

export type ReadNextItem = {
  title: string
  href: string
  reason: string
}

type QuizReadNextInput = {
  readiness: number | null
  creditScoreBand?: string | null
  hasDownPaymentGap?: boolean
  dtiHigh?: boolean
}

export function getQuizReadNext(input: QuizReadNextInput): ReadNextItem[] {
  const { readiness, creditScoreBand, hasDownPaymentGap, dtiHigh } = input
  const score = readiness ?? 55
  const items: ReadNextItem[] = []

  if (score < 60 || creditScoreBand === 'below-620' || creditScoreBand === '620-679') {
    items.push({
      title: 'Credit score & your rate',
      href: '/resources#resource-credit-score-guide',
      reason: 'Small score improvements can lower your rate before you apply.',
    })
  }

  if (hasDownPaymentGap || score < 70) {
    items.push({
      title: 'Down Payment Optimizer',
      href: '/down-payment-optimizer',
      reason: 'Stack grants and assistance you may qualify for in your area.',
    })
  }

  if (dtiHigh || score < 75) {
    items.push({
      title: 'DTI deep dive',
      href: '/resources#resource-dti-deep-dive',
      reason: 'Know your debt-to-income picture before lenders set your max.',
    })
  }

  if (score >= 60 && score < 80) {
    items.push({
      title: 'Shop lenders the right way',
      href: '/resources#resource-shop-lenders',
      reason: 'Pre-approval with verified docs puts you in a stronger position.',
    })
  }

  if (score >= 75) {
    items.push({
      title: 'Search without burnout',
      href: '/resources#resource-search-without-burnout',
      reason: 'You are close to touring — pace your search with clear must-haves.',
    })
  }

  if (score >= 80) {
    items.push({
      title: 'Offer guardrails',
      href: '/resources#resource-offer-guardrails',
      reason: 'Set walk-away numbers before you write an offer.',
    })
  }

  // Dedupe by href and cap at 3
  const seen = new Set<string>()
  const unique: ReadNextItem[] = []
  for (const item of items) {
    if (seen.has(item.href)) continue
    seen.add(item.href)
    unique.push(item)
    if (unique.length >= 3) break
  }

  if (unique.length === 0) {
    return [
      {
        title: 'Homebuying FAQ',
        href: '/learn/faq',
        reason: 'Plain-English answers to common first-time buyer questions.',
      },
      {
        title: 'Your Action Roadmap',
        href: '/customized-journey',
        reason: 'See your next milestone in order.',
      },
      {
        title: 'Loan program comparison',
        href: '/resources#resource-loan-program-comparison',
        reason: 'Compare FHA, VA, USDA, and conventional basics.',
      },
    ]
  }

  return unique
}
