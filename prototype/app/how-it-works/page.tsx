import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How NestQuest Works',
  description:
    'From your first question to closing day: take the 90-second assessment, see your savings number, explore matched DPA programs, follow your week-by-week plan, and close with confidence.',
}

const steps = [
  {
    n: 1,
    icon: '⚡',
    title: 'Take the 90-Second Assessment',
    body:
      'Answer 3 questions about your situation. No credit check. No personal data required.',
    cta: { label: 'Start Now →', href: '/quiz' as const },
  },
  {
    n: 2,
    icon: '💰',
    title: 'See Your Personalized Savings Number',
    body:
      "We calculate exactly how much you could save based on your buyer type, location, and timeline. Most buyers discover $8,000–$15,000 in savings they didn't know existed.",
  },
  {
    n: 3,
    icon: '🔍',
    title: 'Explore Your Matched DPA Programs',
    body:
      'We search the largest database of down payment assistance programs in the country — over 2,400 programs — and match you to the ones you actually qualify for.',
  },
  {
    n: 4,
    icon: '📅',
    title: 'Follow Your Week-by-Week Action Plan',
    body:
      'Your personalized roadmap tells you exactly what to do each week from now until closing. No guessing. No overwhelm.',
  },
  {
    n: 5,
    icon: '🏠',
    title: 'Close With Confidence',
    body:
      'Our users close with an average of $5,593 more in their pocket than buyers who go it alone. That\'s money that stays with you — not with agents, lenders, or title companies.',
  },
] as const

const trustPillars = [
  'No Affiliate Kickbacks',
  'Government-Backed Guidance',
  'Built for First-Time Buyers',
] as const

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-millennial-bg text-millennial-text antialiased">
      <header className="border-b border-millennial-border bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
          <h1 className="font-display text-4xl font-bold tracking-tight text-millennial-text md:text-5xl">
            How NestQuest Works
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-millennial-text-muted md:text-xl">
            From your first question to your closing day — here&apos;s exactly what happens.
          </p>
        </div>
      </header>

      <div>
        {steps.map((step, i) => (
          <section
            key={step.n}
            className={i % 2 === 0 ? 'bg-white' : 'bg-stone-100/60'}
            aria-labelledby={`step-${step.n}-heading`}
          >
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
              <div
                className={`flex flex-col gap-10 md:flex-row md:items-center md:gap-16 lg:gap-20 ${
                  i % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className="flex flex-1 flex-col items-center justify-center md:items-center">
                  <div className="relative flex flex-col items-center">
                    <span
                      className="font-display text-[5.5rem] font-bold leading-none text-millennial-cta-primary sm:text-[6.5rem] md:text-[7rem]"
                      aria-hidden
                    >
                      {step.n}
                    </span>
                    <span className="mt-2 text-5xl sm:text-6xl" aria-hidden>
                      {step.icon}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h2
                    id={`step-${step.n}-heading`}
                    className="font-display text-2xl font-bold tracking-tight text-millennial-text md:text-3xl"
                  >
                    {step.title}
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-millennial-text-muted">
                    {step.body}
                  </p>
                  {'cta' in step && step.cta ? (
                    <p className="mt-6">
                      <Link
                        href={step.cta.href}
                        className="inline-flex items-center font-semibold text-millennial-cta-primary underline decoration-millennial-primary-light decoration-2 underline-offset-4 transition-colors hover:text-millennial-cta-hover"
                      >
                        {step.cta.label}
                      </Link>
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="border-y border-millennial-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <h2 className="text-center font-display text-3xl font-bold tracking-tight text-millennial-text md:text-4xl">
            Why NestQuest Is Different
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8 lg:gap-12">
            {trustPillars.map((title) => (
              <div
                key={title}
                className="rounded-2xl border border-millennial-border bg-millennial-bg/50 p-10 text-center shadow-sm"
              >
                <h3 className="font-display text-lg font-semibold leading-snug text-millennial-text md:text-xl">
                  {title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-stone-100/60 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="font-display text-2xl font-semibold text-millennial-text md:text-3xl">
            Ready to see your savings?
          </p>
          <Link
            href="/quiz"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-millennial-cta-primary px-8 py-4 text-lg font-semibold text-white shadow-md transition-colors hover:bg-millennial-cta-hover"
          >
            Find My Savings →
          </Link>
        </div>
      </section>
    </div>
  )
}
