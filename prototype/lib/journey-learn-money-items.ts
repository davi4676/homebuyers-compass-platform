/** Learn-tab items with money-forward tags (filters). */

export type LearnMoneyTag = 'saves_money' | 'finds_funds' | 'alternative_solution'

export type LearnMoneyFilterId = 'all' | LearnMoneyTag

export type LearnMoneyItem = {
  id: string
  title: string
  sub: string
  tag: string
  href: string
  moneyTags: LearnMoneyTag[]
  /** Illustrative monthly or one-time $ for MoneyTag */
  savesAmount?: number
  findsAmount?: number
}

/** Shown first on the Learn tab when quiz ICP is solo buyer. */
export const JOURNEY_LEARN_SOLO_ITEMS: LearnMoneyItem[] = [
  {
    id: 'solo-one-income',
    title: 'Qualifying on One Income',
    sub: 'How lenders size you alone — DTI, reserves, and when a co-borrower is optional, not required.',
    tag: 'Solo guide',
    href: '/learn/buying-solo#qualifying-on-one-income',
    moneyTags: ['saves_money', 'finds_funds', 'alternative_solution'],
  },
  {
    id: 'solo-advocate-checklist',
    title: 'The Advocate Checklist',
    sub: 'No partner as a sounding board? Use this saved checklist for inspection, closing costs, and walk-away limits.',
    tag: 'Solo guide',
    href: '/learn/buying-solo#advocate-checklist',
    moneyTags: ['saves_money', 'finds_funds', 'alternative_solution'],
  },
  {
    id: 'solo-negotiate-alone',
    title: 'Negotiating Without a Partner',
    sub: 'Scripts for counteroffers, inspection asks, and pausing when you need a beat — without second-guessing alone.',
    tag: 'Solo guide',
    href: '/learn/buying-solo#negotiating-without-a-partner',
    moneyTags: ['saves_money', 'finds_funds', 'alternative_solution'],
  },
]

export const JOURNEY_LEARN_MONEY_ITEMS: LearnMoneyItem[] = [
  {
    id: 'pmi-trap',
    title: 'The PMI drop-off',
    sub: 'How a little more down can delete a monthly line item.',
    tag: 'Lesson',
    href: '/resources',
    moneyTags: ['saves_money', 'finds_funds'],
    savesAmount: 120,
  },
  {
    id: 'dpa-101',
    title: 'Down payment assistance 101',
    sub: 'What counts as “soft second” vs grant vs forgivable.',
    tag: 'Lesson',
    href: '/resources',
    moneyTags: ['finds_funds'],
    findsAmount: 15000,
  },
  {
    id: 'seller-buydown',
    title: 'Seller-funded buydowns',
    sub: 'When a concession is actually a payment bridge.',
    tag: 'Lesson',
    href: '/resources',
    moneyTags: ['alternative_solution', 'saves_money'],
    savesAmount: 95,
  },
  {
    id: 'arm-tradeoff',
    title: 'ARM tradeoffs without panic',
    sub: 'Matching fixed period to how long you will hold.',
    tag: 'Lesson',
    href: '/resources',
    moneyTags: ['alternative_solution'],
  },
  {
    id: 'closing-compare',
    title: 'Comparing Loan Estimates',
    sub: 'Line items that move vs line items that rarely do.',
    tag: 'Lesson',
    href: '/resources',
    moneyTags: ['saves_money'],
    savesAmount: 2100,
  },
  {
    id: 'house-hack',
    title: 'House hacking basics',
    sub: 'Rent that reduces your net payment — rules of thumb.',
    tag: 'Lesson',
    href: '/resources',
    moneyTags: ['alternative_solution', 'finds_funds'],
  },
]
