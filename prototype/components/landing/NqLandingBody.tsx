'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpCircle,
  ChevronDown,
  ChevronUp,
  Home,
  RefreshCw,
  User,
  Users,
} from 'lucide-react'
import ScrollRevealSection from '@/components/ScrollRevealSection'
import NqOfferRail from '@/components/landing/NqOfferRail'
import NqFunnelSteps from '@/components/landing/NqFunnelSteps'
import NqTrustPills from '@/components/landing/NqTrustPills'
import NqQualityMetrics from '@/components/landing/NqQualityMetrics'
import NqTestimonialRail from '@/components/landing/NqTestimonialRail'
import HudCounselorHandoffCard from '@/components/journey/HudCounselorHandoffCard'
import NqFaqAccordion from '@/components/landing/NqFaqAccordion'
import TrustSignals from '@/components/trust/TrustSignals'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LANDING_OFFER_IMAGES } from '@/lib/landing-builder-images'

type Props = {
  ctaHref: (transactionType: string) => string
  quizByIcp: (icp: string) => string
  onCtaClick: (source: string, transactionType: string) => void
  showMoreIcp: boolean
  setShowMoreIcp: (fn: (v: boolean) => boolean) => void
}

const OFFERS = [
  {
    name: 'Grant matching',
    amount: '$10k+',
    amountNote: 'potential savings',
    tag: 'programs',
    desc: 'Federal, state, and local assistance matched to your profile.',
    href: '/quiz?type=first-time',
    cta: 'View programs',
    imageSrc: LANDING_OFFER_IMAGES.grants.src,
    imageAlt: 'Family celebrating a new home purchase',
    imagePosition: LANDING_OFFER_IMAGES.grants.position,
  },
  {
    name: 'Closing cost audit',
    amount: '$3k–$8k',
    amountNote: 'typical fee savings',
    tag: 'fees',
    desc: 'See which line items to question before you sign.',
    href: '/quiz?type=first-time',
    cta: 'View savings',
    imageSrc: LANDING_OFFER_IMAGES.fees.src,
    imageAlt: 'Modern new construction home exterior',
    imagePosition: LANDING_OFFER_IMAGES.fees.position,
  },
  {
    name: 'Negotiation scripts',
    amount: '24/7',
    amountNote: 'conversation support',
    tag: 'scripts',
    desc: 'Word-for-word prompts for agents, lenders, and sellers.',
    href: '/quiz?type=first-time',
    cta: 'View scripts',
    imageSrc: LANDING_OFFER_IMAGES.scripts.src,
    imageAlt: 'Couple meeting with a home consultant',
    imagePosition: LANDING_OFFER_IMAGES.scripts.position,
  },
  {
    name: 'Affordability snapshot',
    amount: '90 sec',
    amountNote: 'to your number',
    tag: 'budget',
    desc: 'Comfortable payment — not just max lender approval.',
    href: '/quiz?type=first-time',
    cta: 'Start quiz',
    imageSrc: LANDING_OFFER_IMAGES.budget.src,
    imageAlt: 'Family in the kitchen of a new home',
    imagePosition: LANDING_OFFER_IMAGES.budget.position,
  },
] as const

const FUNNEL = [
  {
    num: '01',
    title: 'Complete the assessment',
    desc: '90-second quiz. No appointment needed.',
  },
  {
    num: '02',
    title: 'Get your savings snapshot',
    desc: 'Programs and fees surfaced for your situation.',
  },
  {
    num: '03',
    title: 'Start your journey',
    desc: 'Clear next steps from pre-approval to closing.',
  },
] as const

const BENEFITS = [
  'Every plan built around your budget — not a lender pitch',
  'Grant and program matching across 2,000+ sources',
  'Message-style guidance when you need the right words',
]

export default function NqLandingBody({
  ctaHref,
  quizByIcp,
  onCtaClick,
  showMoreIcp,
  setShowMoreIcp,
}: Props) {
  const primaryCta = ctaHref('first-time')

  return (
    <>
      {/* 3-step funnel */}
      <ScrollRevealSection>
        <section className="nq-sl-section nq-sl-section--flush-top bg-[color-mix(in_srgb,var(--nq-ed-surface)_60%,transparent)]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <NqFunnelSteps
              steps={[...FUNNEL]}
              ctaHref={primaryCta}
              ctaLabel="See if you qualify"
              onCtaClick={() => onCtaClick('landing_funnel_cta', 'first-time')}
            />
            <div className="mt-5">
              <NqTrustPills items={['Ongoing buyer support', 'No credit pull', 'Free to start']} />
            </div>
          </div>
        </section>
      </ScrollRevealSection>

      {/* What is NestQuest */}
      <ScrollRevealSection>
        <section className="nq-sl-section">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="nq-sl-brand-line">What is NestQuest?</p>
            <h2 className="nq-sl-section-title mt-2 max-w-2xl">
              We match you to grants and programs, then guide every conversation with clear scripts.
            </h2>
            <Link
              href="/how-it-works"
              className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[var(--nq-ed-accent)] hover:underline"
            >
              Learn more <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </ScrollRevealSection>

      {/* Offer rail */}
      <ScrollRevealSection>
        <section className="nq-sl-section">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <NqOfferRail
              offers={OFFERS.map((o) => ({ ...o, href: quizByIcp('first-time') }))}
              onCtaClick={(id) => onCtaClick('landing_offer_card', id)}
            />
            <div className="mt-4">
              <NqTrustPills
                items={['HUD-aligned resources', 'Zero commission conflicts', 'Third-party program data']}
              />
            </div>
          </div>
        </section>
      </ScrollRevealSection>

      {/* Quality metrics + testimonials */}
      <ScrollRevealSection>
        <section className="nq-sl-section">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-10">
            <div>
              <h2 className="nq-sl-section-title">High-quality buyer guidance</h2>
              <p className="nq-sl-section-lede">
                Internal content targets — how we keep savings opportunities and fee clarity front and center.
              </p>
              <div className="mt-5">
                <NqQualityMetrics />
              </div>
            </div>
            <div>
              <h2 className="nq-sl-section-title">User stories</h2>
              <div className="mt-4">
                <NqTestimonialRail />
              </div>
            </div>
          </div>
        </section>
      </ScrollRevealSection>

      {/* Short benefit lines */}
      <ScrollRevealSection>
        <section className="nq-sl-section nq-sl-section--compact border-y border-[var(--nq-ed-line-soft)]">
          <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 sm:px-6">
            {BENEFITS.map((line) => (
              <p key={line} className="nq-sl-benefit-line">
                <ArrowRight className="h-4 w-4" />
                {line}
              </p>
            ))}
          </div>
        </section>
      </ScrollRevealSection>

      {/* ICP path picker — compact */}
      <ScrollRevealSection>
        <section className="nq-sl-section">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="nq-sl-section-title text-center">Which sounds like you?</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {(
                [
                  { type: 'first-time', Icon: Home, title: "First-time buyer", featured: true },
                  { type: 'first-gen', Icon: Users, title: 'First in my family', featured: false },
                  { type: 'solo', Icon: User, title: 'Buying solo', featured: false },
                ] as const
              ).map((row) => {
                const I = row.Icon
                return (
                  <Link
                    key={row.type}
                    href={quizByIcp(row.type)}
                    onClick={() => onCtaClick('landing_icp_grid', row.type)}
                    className={`group flex flex-col items-center rounded-2xl border p-5 text-center transition-all duration-200 hover:-translate-y-1 ${
                      row.featured
                        ? 'border-[var(--nq-ed-accent)] bg-[var(--nq-ed-accent-soft)] shadow-md'
                        : 'border-[var(--nq-ed-line-soft)] bg-[var(--nq-ed-surface)] hover:shadow-sm'
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[var(--nq-ed-accent)] shadow-sm">
                      <I className="h-6 w-6" />
                    </div>
                    <h3 className="mt-3 font-display text-base font-bold text-[var(--nq-ed-text)]">{row.title}</h3>
                    <span className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-[var(--nq-ed-accent)]">
                      Start <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                )
              })}
            </div>

            <AnimatePresence>
              {showMoreIcp ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {(
                      [
                        { type: 'move-up', Icon: ArrowUpCircle, title: 'Upgrade my home' },
                        { type: 'refinance', Icon: RefreshCw, title: 'Refinance' },
                      ] as const
                    ).map((row) => {
                      const I = row.Icon
                      return (
                        <Link
                          key={row.type}
                          href={quizByIcp(row.type)}
                          onClick={() => onCtaClick('landing_icp_grid', row.type)}
                          className="group flex items-center gap-4 rounded-2xl border border-[var(--nq-ed-line-soft)] bg-[var(--nq-ed-surface)] p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--nq-ed-accent-soft)] text-[var(--nq-ed-accent)]">
                            <I className="h-5 w-5" />
                          </div>
                          <span className="font-display font-bold text-[var(--nq-ed-text)]">{row.title}</span>
                          <ArrowRight className="ml-auto h-4 w-4 text-[var(--nq-ed-accent)]" />
                        </Link>
                      )
                    })}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setShowMoreIcp((v) => !v)}
                className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--nq-ed-muted)] hover:text-[var(--nq-ed-text)]"
              >
                {showMoreIcp ? (
                  <>
                    Show less <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Already own a home? <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </ScrollRevealSection>

      {/* HUD counseling */}
      <ScrollRevealSection>
        <section className="nq-sl-section nq-sl-section--compact">
          <div className="mx-auto max-w-2xl px-4 sm:px-6">
            <HudCounselorHandoffCard variant="journey" />
          </div>
        </section>
      </ScrollRevealSection>

      {/* FAQ */}
      <ScrollRevealSection>
        <section className="nq-sl-section bg-[color-mix(in_srgb,var(--nq-ed-surface)_50%,transparent)]">
          <div className="mx-auto max-w-2xl px-4 sm:px-6">
            <h2 className="nq-sl-section-title text-center">Frequently asked questions</h2>
            <div className="mt-5">
              <NqFaqAccordion />
            </div>
          </div>
        </section>
      </ScrollRevealSection>

      <ScrollRevealSection>
        <section className="nq-sl-section nq-sl-section--compact bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <ErrorBoundary fallback={null}>
              <TrustSignals />
            </ErrorBoundary>
          </div>
        </section>
      </ScrollRevealSection>
    </>
  )
}
