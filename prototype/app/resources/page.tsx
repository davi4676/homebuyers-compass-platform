'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import {
  BookOpen, FileText, DollarSign, Shield, Search,
  Users, Key, TrendingUp, ChevronDown, ChevronRight,
  Lock, CheckCircle, AlertTriangle, Lightbulb, Bell,
  ClipboardCheck, Calculator, CreditCard, Clock
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { getUserTier } from '@/lib/user-tracking'
import { TIER_DEFINITIONS, type UserTier, TIER_ORDER } from '@/lib/tiers'
import { EDUCATIONAL_VIDEO_IDS } from '@/lib/educational-videos'
import ResourcesBackLink from '@/components/ResourcesBackLink'

type ResourceCategory = {
  id: string
  title: string
  icon: React.ReactNode
  color: string
  tierRequired?: UserTier
  resources: Resource[]
  /** Optional YouTube video ID (e.g. "dQw4w9WgXcQ") for phase overview video */
  videoId?: string
}

type Resource = {
  id: string
  title: string
  summary: string
  tierRequired?: UserTier
  type: 'guide' | 'script' | 'checklist' | 'tip'
  content: React.ReactNode
}

const RESOURCES: ResourceCategory[] = [
  {
    id: 'preparation',
    title: 'Phase 1 — Preparation & Credit',
    icon: <CreditCard className="w-6 h-6" />,
    color: 'text-cyan-600',
    resources: [
      {
        id: 'credit-score-guide',
        title: 'How Your Credit Score Affects Your Mortgage Rate',
        summary: 'A 1-point difference in rate costs $50,000+ over 30 years.',
        type: 'guide',
        content: (
          <div className="space-y-4 text-sm text-slate-700">
            <p>Lenders use your credit score to determine your interest rate. Even a 0.5% rate difference on a $350,000 loan adds up to $33,000 in extra interest over 30 years.</p>
            <div className="bg-slate-50 rounded-xl p-4 border">
              <p className="font-semibold mb-2">Rate tiers by credit score:</p>
              <ul className="space-y-1">
                <li>760+ → Best rates (e.g. 6.5%)</li>
                <li>740–759 → +0.125%</li>
                <li>720–739 → +0.25%</li>
                <li>700–719 → +0.5%</li>
                <li>Below 700 → +1% or more</li>
              </ul>
            </div>
            <p className="font-semibold">Quick wins to raise your score in 30–60 days:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Pay credit cards below 30% utilization</li>
              <li>Don't close old accounts (hurts history length)</li>
              <li>Dispute any errors on your report</li>
              <li>Avoid opening new credit lines</li>
            </ul>
          </div>
        ),
      },
      {
        id: 'doc-checklist',
        title: 'Document Checklist: Everything Lenders Ask For',
        summary: 'Have these ready before you apply.',
        type: 'checklist',
        content: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>Gather these before starting pre-approval to avoid delays:</p>
            {[
              { group: 'Identity', items: ['Government-issued photo ID', 'Social Security number'] },
              { group: 'Income', items: ['2 years W-2s or 1099s', '2 recent pay stubs', '2 years tax returns (federal)', 'Profit & loss if self-employed'] },
              { group: 'Assets', items: ['2 months bank statements (all accounts)', '401(k) / investment account statements', 'Gift letter if receiving money from family'] },
              { group: 'Debts', items: ['List of all monthly debt payments', 'Rental history / landlord contact'] },
            ].map(g => (
              <div key={g.group} className="bg-slate-50 rounded-xl p-3 border">
                <p className="font-semibold mb-2">{g.group}</p>
                <ul className="space-y-1">
                  {g.items.map(i => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ),
      },
    ],
  },
  {
    id: 'pre-approval',
    title: 'Phase 2 — Getting Pre-Approved',
    icon: <Shield className="w-6 h-6" />,
    color: 'text-emerald-600',
    resources: [
      {
        id: 'shop-lenders',
        title: 'Why You Must Shop At Least 3 Lenders',
        summary: 'Rates vary by 0.25–0.5% between lenders on the same day.',
        type: 'guide',
        content: (
          <div className="space-y-4 text-sm text-slate-700">
            <p>Studies show buyers who get 5+ quotes save an average of $1,500 in the first year alone. Yet most buyers only contact one lender.</p>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <p className="font-semibold text-amber-800 mb-1">⚠️ The credit check myth</p>
              <p className="text-amber-700">Multiple mortgage inquiries within a 14-day window count as a single hard pull on your credit. Shop freely.</p>
            </div>
            <p className="font-semibold">What to compare line-by-line:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Interest rate (not just APR)</li>
              <li>Origination fees (Section A of Loan Estimate)</li>
              <li>Discount points (are you buying the rate down?)</li>
              <li>Lender credits (reduces closing costs but raises rate)</li>
              <li>Total cash to close</li>
            </ul>
          </div>
        ),
      },
      {
        id: 'negotiation-script-lender',
        title: 'Script: Negotiating With Your Lender',
        summary: 'Use this when you have a competing offer.',
        type: 'script',
        tierRequired: 'momentum',
        content: (
          <div className="space-y-4 text-sm text-slate-700">
            <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-300 italic">
              <p>"I've received a competing Loan Estimate from [Bank Name] offering [rate]% with [X] in origination fees. I'd prefer to work with you — can you match or improve on that? I'm ready to move forward today if so."</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-emerald-800">
              <p className="font-semibold mb-1">Why this works:</p>
              <p>Creates urgency, references a real competing offer, and gives them a clear path to win your business.</p>
            </div>
            <p className="font-semibold">What's negotiable in most cases:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Origination/processing fees (most negotiable)</li>
              <li>Application fees</li>
              <li>Rate lock fees</li>
              <li>Title insurance (Section C — shop separately)</li>
            </ul>
            <p className="text-slate-500">Less negotiable: government fees, property taxes, recording fees.</p>
          </div>
        ),
      },
      {
        id: 'readiness-score-script',
        title: 'Script: Using Your Readiness Score as Leverage',
        summary: 'A 70+ score can unlock better terms.',
        type: 'script',
        tierRequired: 'momentum',
        content: (
          <div className="space-y-4 text-sm text-slate-700">
            <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-300 italic">
              <p>"My readiness score is [X], which demonstrates strong financial preparedness across credit, DTI, down payment, and timeline. This positions me as a low-risk borrower. How can we translate this into better rates or reduced fees?"</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-200 text-blue-800">
              <p>Best used when your score is 70 or higher. Lenders value low-risk borrowers and will often negotiate to keep qualified buyers.</p>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: 'closing',
    title: 'Phase 6 — Closing Costs Demystified',
    icon: <Key className="w-6 h-6" />,
    color: 'text-cyan-600',
    resources: [
      {
        id: 'closing-cost-guide',
        title: 'Every Closing Fee Explained (and Which Ones to Negotiate)',
        summary: 'Most buyers see this for the first time at the closing table.',
        type: 'guide',
        content: (
          <div className="space-y-4 text-sm text-slate-700">
            <p>Closing costs are typically 2–5% of the purchase price. On a $350,000 home that's $7,000–$17,500. Here's what's in there:</p>
            {[
              { section: 'Section A: Origination Charges (negotiable)', items: ['Origination fee / underwriting fee', 'Discount points (optional — you buy down the rate)', 'Application fee'] },
              { section: 'Section B: Services You Cannot Shop For', items: ['Appraisal fee', 'Credit report fee', 'Flood determination fee'] },
              { section: 'Section C: Services You CAN Shop For', items: ['Title insurance (shop 3+ companies)', 'Settlement/closing agent fee', 'Escrow fee'] },
              { section: 'Prepaids (not junk — but surprise buyers)', items: ['First year homeowners insurance (paid upfront)', 'Property tax escrow (2–3 months)', 'Prepaid daily interest from closing to end of month'] },
            ].map(g => (
              <div key={g.section} className="bg-slate-50 rounded-xl p-4 border">
                <p className="font-semibold mb-2">{g.section}</p>
                <ul className="list-disc list-inside space-y-1">
                  {g.items.map(i => <li key={i}>{i}</li>)}
                </ul>
              </div>
            ))}
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
              <p className="font-semibold text-emerald-800 mb-1">💡 Pro tip:</p>
              <p className="text-emerald-700">Shopping title insurance alone can save $500–$1,000. Most buyers don't know they can.</p>
            </div>
          </div>
        ),
      },
      {
        id: 'closing-script',
        title: 'Script: Negotiating Closing Costs at the Table',
        summary: 'Works best 3+ days before closing when you review the Closing Disclosure.',
        type: 'script',
        tierRequired: 'momentum',
        content: (
          <div className="space-y-4 text-sm text-slate-700">
            <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-300 italic">
              <p>"I've reviewed my Closing Disclosure and noticed [fee name] is $X. I found a competing quote for $Y. Can you match that, or credit me $Z toward closing costs? I'm ready to proceed today if so."</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
              <p className="text-amber-800"><span className="font-semibold">Note:</span> You have 3 business days to review the Closing Disclosure before signing. Use this window to negotiate.</p>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: 'negotiation',
    title: 'Phase 4 — Negotiation & Inspection',
    icon: <Users className="w-6 h-6" />,
    color: 'text-orange-500',
    resources: [
      {
        id: 'inspection-guide',
        title: 'Home Inspection: What to Look For and Negotiate',
        summary: 'Never waive the inspection, even in a hot market.',
        type: 'guide',
        tierRequired: 'momentum',
        content: (
          <div className="space-y-4 text-sm text-slate-700">
            <p>A home inspection costs $300–$500 and can uncover issues worth $5,000–$50,000+ in repairs. The inspection report gives you negotiating power.</p>
            <p className="font-semibold">Focus areas:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Foundation cracks or settling</li>
              <li>Roof age and condition (15–20 year lifespan)</li>
              <li>HVAC age and condition</li>
              <li>Electrical panel (knob-and-tube or aluminum wiring = red flag)</li>
              <li>Water damage / mold signs in basement and attic</li>
              <li>Plumbing — look for polybutylene pipe</li>
            </ul>
            <div className="bg-slate-50 rounded-xl p-4 border">
              <p className="font-semibold mb-2">After inspection: how to negotiate</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Ask for repairs on major items (roof, HVAC, foundation)</li>
                <li>Or ask for a price reduction / closing cost credit</li>
                <li>Don't nickel-and-dime cosmetic items</li>
              </ul>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: 'house-hunting',
    title: 'Phase 3 — House Hunting & Offer Strategy',
    icon: <Search className="w-6 h-6" />,
    color: 'text-yellow-600',
    resources: [
      {
        id: 'offer-guardrails',
        title: 'Offer Guardrails: Stay Competitive Without Overpaying',
        summary: 'How to set a hard cap and avoid emotional overbidding.',
        type: 'guide',
        content: (
          <div className="space-y-4 text-sm text-slate-700">
            <p>Before touring homes, set a hard walk-away number based on your comfortable budget, not lender max approval. This protects your monthly cash flow and reduces decision stress.</p>
            <div className="bg-slate-50 rounded-xl p-4 border">
              <p className="font-semibold mb-2">Offer rules that reduce regret:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Set max offer before making your first bid</li>
                <li>Use recent comparable sales, not listing hype</li>
                <li>Keep inspection and financing contingencies unless risk is explicitly priced in</li>
                <li>Plan two backup properties to avoid scarcity panic</li>
              </ul>
            </div>
          </div>
        ),
      },
      {
        id: 'offer-script',
        title: 'Script: Presenting a Strong Offer Without Overcommitting',
        summary: 'Use this with your agent to stay assertive and disciplined.',
        type: 'script',
        tierRequired: 'momentum',
        content: (
          <div className="space-y-4 text-sm text-slate-700">
            <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-300 italic">
              <p>"We love the property and are prepared to move quickly. Our strongest offer today is $[X], with financing and inspection contingencies in place. If terms align, we can proceed immediately."</p>
            </div>
            <p>This keeps urgency high while preserving your protections and budget discipline.</p>
          </div>
        ),
      },
    ],
  },
  {
    id: 'underwriting',
    title: 'Phase 5 — Underwriting & Appraisal',
    icon: <ClipboardCheck className="w-6 h-6" />,
    color: 'text-teal-600',
    resources: [
      {
        id: 'underwriting-checklist',
        title: 'Underwriting Checklist: What to Do (and Not Do) Before Closing',
        summary: 'Avoid last-minute denials and delays.',
        type: 'checklist',
        content: (
          <div className="space-y-4 text-sm text-slate-700">
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> Respond to lender document requests within 24 hours</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> Keep pay stubs and account balances stable</li>
              <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> Do not open new credit cards or auto loans</li>
              <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> Do not move large unexplained cash deposits</li>
            </ul>
          </div>
        ),
      },
      {
        id: 'appraisal-low-guide',
        title: 'If Appraisal Comes in Low: Your 4 Options',
        summary: 'Action plan for one of the most stressful moments.',
        type: 'guide',
        tierRequired: 'momentum',
        content: (
          <div className="space-y-4 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Request seller price reduction</li>
              <li>Split difference with seller</li>
              <li>Bring additional cash to close</li>
              <li>Challenge appraisal with stronger comparables</li>
            </ol>
            <p>Choose based on your cash reserves and long-term monthly affordability, not sunk-cost emotion.</p>
          </div>
        ),
      },
    ],
  },
  {
    id: 'methodology',
    title: 'Bias-Free Methodology',
    icon: <Shield className="w-6 h-6" />,
    color: 'text-slate-700',
    resources: [
      {
        id: 'why-unbiased',
        title: 'How NestQuest Recommendations Stay Unbiased',
        summary: 'What data we use and what incentives we intentionally avoid.',
        type: 'tip',
        content: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>Recommendations are generated from your quiz inputs, affordability math, closing-cost assumptions, and risk heuristics.</p>
            <p>We do <strong>not</strong> optimize recommendations for lender referrals, commissions, title partnerships, or affiliate payouts.</p>
            <div className="bg-slate-50 rounded-xl p-4 border">
              <p className="font-semibold mb-2">In practice, this means:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>We prioritize your affordability comfort zone over lender max approvals</li>
                <li>We surface negotiable fees even when providers prefer you not to ask</li>
                <li>We provide scripts that improve your bargaining position, not ours</li>
              </ul>
            </div>
          </div>
        ),
      },
    ],
  },
]

function ResourceCard({
  resource,
  isOpen,
  onToggle,
  phaseId,
}: {
  resource: Resource
  isOpen: boolean
  onToggle: () => void
  phaseId: string
}) {
  const typeColors: Record<string, string> = {
    guide: 'bg-blue-100 text-blue-700',
    script: 'bg-emerald-100 text-emerald-700',
    checklist: 'bg-amber-100 text-amber-700',
    tip: 'bg-slate-100 text-slate-700',
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${typeColors[resource.type]}`}>
              {resource.type}
            </span>
            {resource.tierRequired && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700 flex items-center gap-1">
                <Lock className="w-3 h-3" />{' '}
                {resource.tierRequired ? TIER_DEFINITIONS[resource.tierRequired].name : 'Upgrade'}
              </span>
            )}
          </div>
          <p className="font-semibold text-[#1e293b] text-sm">{resource.title}</p>
          <p className="text-xs text-slate-500 mt-0.5">{resource.summary}</p>
        </div>
        {isOpen ? <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 mt-1" /> : <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 mt-1" />}
      </button>
      {isOpen && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4">
          {resource.content}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link href={`/customized-journey#phase-${phaseId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[rgb(var(--navy))] hover:underline">
              Apply this in Action Roadmap <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ResourcesPage() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})
  const [recommendedPhase, setRecommendedPhase] = useState<string | null>(null)
  const [userTier] = useState<UserTier>(() => {
    if (typeof window !== 'undefined') return getUserTier()
    return 'foundations'
  })

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const hasAccess = (tierRequired?: UserTier) => {
    if (!tierRequired) return true
    const currentIndex = TIER_ORDER.indexOf(userTier)
    const requiredIndex = TIER_ORDER.indexOf(tierRequired)
    return currentIndex >= requiredIndex
  }

  // Show content immediately so users don't think resources are empty.
  useEffect(() => {
    if (Object.keys(openItems).length > 0) return

    const defaults: Record<string, boolean> = {}
    RESOURCES.forEach((category) => {
      const firstVisible = category.resources.find((r) => hasAccess(r.tierRequired))
      if (firstVisible) defaults[firstVisible.id] = true
    })

    if (Object.keys(defaults).length > 0) {
      setOpenItems(defaults)
    }
  }, [openItems, userTier])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const current = localStorage.getItem('currentPhase')
    if (current) {
      setRecommendedPhase(current)
      return
    }

    try {
      const status = JSON.parse(localStorage.getItem('phaseStatus') || '{}') as Record<string, string>
      const phaseOrder = ['preparation', 'pre-approval', 'house-hunting', 'negotiation', 'underwriting', 'closing']
      const next = phaseOrder.find((p) => status[p] !== 'complete')
      if (next) setRecommendedPhase(next)
    } catch {
      // no-op
    }
  }, [])

  return (
    <div className="app-page-shell">
      <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-6">
        <ResourcesBackLink />
      </div>
      {/* Background strip */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-2">
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
              <p className="text-white text-lg sm:text-xl font-semibold">Playbooks</p>
              <p className="text-white/70 text-sm">Guides, scripts, and checklists for every phase</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-white border border-slate-200 rounded-xl px-4 sm:px-6 py-3 mb-4 flex flex-wrap items-center gap-2">
          <Link href="/results" className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 ${
            pathname === '/results'
              ? 'bg-[rgb(var(--navy))] text-white border-[rgb(var(--navy))] shadow-sm'
              : 'bg-white border-slate-200 text-[#1e293b] hover:border-slate-300 hover:bg-slate-50'
          }`}>
            {pathname === '/results' && <span className="w-1.5 h-1.5 rounded-full bg-white/90" aria-hidden="true" />}
            Savings Snapshot
          </Link>
          <Link href="/inbox" className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 ${
            pathname === '/inbox'
              ? 'bg-[rgb(var(--navy))] text-white border-[rgb(var(--navy))] shadow-sm'
              : 'bg-white border-slate-200 text-[#1e293b] hover:border-slate-300 hover:bg-slate-50'
          }`}>
            <Bell className="w-4 h-4" />
            {pathname === '/inbox' && <span className="w-1.5 h-1.5 rounded-full bg-white/90" aria-hidden="true" />}
            Inbox
          </Link>
          <Link href="/customized-journey" className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 ${
            pathname === '/customized-journey'
              ? 'bg-[rgb(var(--navy))] text-white border-[rgb(var(--navy))] shadow-sm'
              : 'bg-white border-slate-200 text-[#1e293b] hover:border-slate-300 hover:bg-slate-50'
          }`}>
            {pathname === '/customized-journey' && <span className="w-1.5 h-1.5 rounded-full bg-white/90" aria-hidden="true" />}
            Action Roadmap
          </Link>
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-[rgb(var(--navy))] text-white border border-[rgb(var(--navy))] shadow-sm transition-all duration-200 ease-out">
            <span className="w-1.5 h-1.5 rounded-full bg-white/90" aria-hidden="true" />
            Playbooks
          </span>
        </div>
        <div className="mb-6">
          <p className="text-slate-600 text-sm">
            All the detailed educational content removed from the main journey view. Use these resources alongside your{' '}
            <Link href="/customized-journey" className="text-[rgb(var(--coral))] hover:underline font-medium">
              Action Roadmap
            </Link>
            .
          </p>
        </div>

        <div className="space-y-8">
          {RESOURCES.map((category) => (
            <motion.section
              key={category.id}
              id={`phase-${category.id}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className={category.color}>{category.icon}</span>
                <h2 className="text-lg font-bold text-[#1e293b]">{category.title}</h2>
                {recommendedPhase === category.id && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">Recommended now</span>
                )}
              </div>

              {EDUCATIONAL_VIDEO_IDS[category.id]?.trim() && (
                <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video max-w-2xl">
                  <iframe
                    src={`https://www.youtube.com/embed/${EDUCATIONAL_VIDEO_IDS[category.id]}`}
                    title={`${category.title} — Watch video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              )}

              <div className="space-y-3">
                {category.resources.map((resource) => {
                  const locked = !hasAccess(resource.tierRequired)
                  return locked ? (
                    <div key={resource.id} className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700 flex items-center gap-1">
                            <Lock className="w-3 h-3" />{' '}
                {resource.tierRequired ? TIER_DEFINITIONS[resource.tierRequired].name : 'Upgrade'}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-600 text-sm">{resource.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{resource.summary}</p>
                      </div>
                      <Link
                        href={`/upgrade?source=resources-${resource.id}`}
                        className="shrink-0 inline-flex items-center gap-1.5 bg-[rgb(var(--coral))] text-white px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap"
                      >
                        Upgrade to Momentum <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ) : (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      isOpen={!!openItems[resource.id]}
                      onToggle={() => toggleItem(resource.id)}
                      phaseId={category.id}
                    />
                  )
                })}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Trust signal */}
        <div className="mt-10 rounded-xl bg-slate-50 border border-slate-200 p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-800">How we make money:</strong> We charge for optional premium plan features — never through commissions, referrals, or kickbacks from lenders, agents, or title companies.
          </p>
        </div>
      </main>
    </div>
  )
}
