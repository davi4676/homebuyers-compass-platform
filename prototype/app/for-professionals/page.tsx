'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Building2,
  Check,
  FileBadge,
  Layers,
  LineChart,
  Shield,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'
import { trackActivity } from '@/lib/track-activity'
import NqHubTabLayout from '@/components/hub/NqHubTabLayout'

const ORG_TYPES = [
  { value: 'housing-counseling', label: 'HUD-approved housing counseling agency' },
  { value: 'credit-union', label: 'Credit union' },
  { value: 'cdfi', label: 'CDFI (community development financial institution)' },
  { value: 'cdc', label: 'Community development / nonprofit (other)' },
  { value: 'lender', label: 'Lender / mortgage broker' },
  { value: 'other', label: 'Other' },
] as const

const TIERS = [
  {
    name: 'Starter',
    price: 299,
    description: 'Pilot one counselor or loan officer with your brand.',
    features: ['1 licensed seat', 'Branded client reports', 'Email export & PDFs', 'Email support'],
    cta: 'Request demo',
    popular: false,
  },
  {
    name: 'Growth',
    price: 799,
    description: 'Scale across a small team with a consistent experience.',
    features: ['5 seats', 'White-label experience', 'Shared team workspace', 'Priority support'],
    cta: 'Request demo',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 1999,
    description: 'Organization-wide rollout with integrations.',
    features: ['Unlimited seats', 'API access', 'Custom integrations', 'Dedicated success'],
    cta: 'Talk to sales',
    popular: false,
  },
] as const

export default function ForProfessionalsPage() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    organization: '',
    organizationType: '',
    interestedTier: '',
    teamSize: '',
    message: '',
  })

  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg(null)
    trackActivity('tool_used', {
      tool: 'b2b_demo_request',
      org_type: form.organizationType,
      tier: form.interestedTier,
    })
    try {
      const res = await fetch('/api/leads/b2b-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErrorMsg(typeof data.error === 'string' ? data.error : 'Something went wrong')
        setStatus('error')
        return
      }
      setStatus('success')
    } catch {
      setErrorMsg('Network error — please try again.')
      setStatus('error')
    }
  }

  return (
    <NqHubTabLayout
      tab="organizations"
      maxWidth="5xl"
      glassCard={
        <div className="nq-glass nq-savings-glass">
          <p className="nq-savings-glass-label">Client assessment</p>
          <p className="nq-savings-glass-amount !text-2xl sm:!text-3xl">90 sec</p>
          <p className="mt-2 text-sm text-[var(--nq-ed-muted)]">
            Branded readiness checks your team can deliver today.
          </p>
        </div>
      }
    >
      <section className="py-4">
        <h2 className="nq-sl-section-title text-center">Built for mission-driven teams</h2>
        <p className="nq-sl-section-lede mx-auto mt-3 max-w-2xl text-center">
          HUD agencies, credit unions, and CDFIs scaling digital services for first-gen and LMI households.
        </p>
        <div className="nq-hub-panel mx-auto mt-8 max-w-3xl p-5 text-center">
          <p className="text-sm leading-relaxed text-[var(--nq-ed-muted)]">
            <span className="font-display font-bold text-[var(--nq-ed-text)]">Partner economics.</span>{' '}
            Institutional contracts often represent{' '}
            <strong className="font-semibold text-[var(--nq-ed-accent)]">$2,000–$10,000/month</strong> at scale.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="nq-bento-card p-6"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
              <Building2 className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="font-display text-lg font-bold text-[var(--nq-ed-text)]">HUD-approved counseling agencies</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--nq-ed-muted)]">
              Education, intake, and reporting pressure in one workflow: readiness scoring, savings snapshots, and
              grant-ready exports so counselors spend time with clients — not spreadsheets.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="nq-bento-card p-6"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--nq-ed-accent-soft)] text-[var(--nq-ed-accent)]">
              <Shield className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="font-display text-lg font-bold text-[var(--nq-ed-text)]">Credit unions</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--nq-ed-muted)]">
              Member-first affordability clarity, responsible product fit, and a branded journey alongside mortgage and
              financial wellness — strong fit for branches with committed procurement for digital member tools.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="nq-bento-card p-6"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
              <LineChart className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="font-display text-lg font-bold text-[var(--nq-ed-text)]">CDFIs</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--nq-ed-muted)]">
              Lending plus community development missions: digital homebuyer readiness scales across programs and
              geographies. Larger partnerships often sit in the same range as multi-seat Growth or Enterprise plans — with
              room to grow into recurring program fees.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-[var(--nq-ed-line-soft)] py-10">
        <div>
          <h2 className="nq-sl-section-title text-center">What teams get</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                Icon: FileBadge,
                title: 'Branded & audit-friendly',
                body: 'Client-ready outputs and consistent methodology across your organization.',
              },
              {
                Icon: Users,
                title: 'Role-based seats',
                body: 'Counselors, loan officers, and coaches — permissions that match how you work.',
              },
              {
                Icon: LineChart,
                title: 'Outcomes you can show',
                body: 'Progress tracking and exports that support funding and board reporting.',
              },
              {
                Icon: Layers,
                title: 'White-label (Growth+)',
                body: 'Your brand on the experience members already expect from you.',
              },
              {
                Icon: Zap,
                title: 'Fast onboarding',
                body: 'Designed for teams that need to launch in weeks, not quarters.',
              },
              {
                Icon: Sparkles,
                title: 'Enterprise & API',
                body: 'Connect to LOS, CRM, or data warehouse when you are ready.',
              },
            ].map(({ Icon, title, body }) => (
              <div
                key={title}
                className="nq-hub-panel flex gap-4 p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--nq-ed-accent-soft)] text-[var(--nq-ed-accent)]">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h3 className="font-display font-bold text-[var(--nq-ed-text)]">{title}</h3>
                  <p className="mt-1 text-sm text-[var(--nq-ed-muted)]">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10">
        <h2 className="nq-sl-section-title text-center">Simple B2B pricing</h2>
        <p className="nq-sl-section-lede mx-auto mt-3 max-w-2xl text-center">
          Starter ($299/mo), Growth ($799/mo), Enterprise ($1,999/mo) — annual contracts available.
        </p>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`nq-hub-panel relative flex flex-col p-6 ${
                tier.popular ? 'ring-2 ring-[var(--nq-ed-accent)]' : ''
              }`}
            >
              {tier.popular ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-teal-600 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                  Most popular
                </span>
              ) : null}
              <h3 className="font-display text-xl font-bold text-[var(--nq-ed-text)]">{tier.name}</h3>
              <p className="mt-2 min-h-[40px] text-sm text-[var(--nq-ed-muted)]">{tier.description}</p>
              <p className="mt-6 font-display text-4xl font-black tabular-nums text-[var(--nq-ed-text)]">
                ${tier.price.toLocaleString('en-US')}
                <span className="text-lg font-semibold text-[var(--nq-ed-muted)]">/mo</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[var(--nq-ed-muted)]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={scrollToDemo}
                className={`mt-8 w-full rounded-xl py-3 text-center text-sm font-bold ${
                  tier.popular
                    ? 'nq-sl-hero-cta !w-full justify-center'
                    : 'nq-ed-btn-outline !w-full justify-center'
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section id="demo" className="scroll-mt-24 border-t border-[var(--nq-ed-line-soft)] py-12">
        <div className="mx-auto max-w-xl">
          <h2 className="nq-sl-section-title text-center">Request a demo</h2>
          <p className="nq-sl-section-lede mt-3 text-center">
            We&apos;ll follow up within two business days with a tailored walkthrough.
          </p>

          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="nq-hub-panel mt-10 p-8 text-center"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--nq-ed-accent-soft)] text-[var(--nq-ed-accent)]">
                <Check className="h-8 w-8" aria-hidden />
              </div>
              <h3 className="font-display text-xl font-bold text-[var(--nq-ed-text)]">Thanks — you&apos;re on the list</h3>
              <p className="mt-2 text-sm text-[var(--nq-ed-muted)]">
                We received your request. Check your inbox for a confirmation from our team shortly.
              </p>
              <Link href="/" className="mt-6 inline-block font-semibold text-teal-800 underline hover:text-teal-950">
                ← Back to NestQuest home
              </Link>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="nq-hub-panel mt-10 p-6 sm:p-8"
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-semibold text-slate-800">
                    Full name
                  </label>
                  <input
                    id="fullName"
                    required
                    autoComplete="name"
                    value={form.fullName}
                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-900 outline-none ring-teal-400/0 transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-800">
                    Work email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30"
                  />
                </div>
                <div>
                  <label htmlFor="organization" className="block text-sm font-semibold text-slate-800">
                    Organization
                  </label>
                  <input
                    id="organization"
                    required
                    value={form.organization}
                    onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30"
                  />
                </div>
                <div>
                  <label htmlFor="organizationType" className="block text-sm font-semibold text-slate-800">
                    Organization type
                  </label>
                  <select
                    id="organizationType"
                    required
                    value={form.organizationType}
                    onChange={(e) => setForm((f) => ({ ...f, organizationType: e.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30"
                  >
                    <option value="">Select…</option>
                    {ORG_TYPES.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="interestedTier" className="block text-sm font-semibold text-slate-800">
                      Interested plan
                    </label>
                    <select
                      id="interestedTier"
                      value={form.interestedTier}
                      onChange={(e) => setForm((f) => ({ ...f, interestedTier: e.target.value }))}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30"
                    >
                      <option value="">Not sure yet</option>
                      <option value="starter">Starter — $299/mo</option>
                      <option value="growth">Growth — $799/mo</option>
                      <option value="enterprise">Enterprise — $1,999/mo</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="teamSize" className="block text-sm font-semibold text-slate-800">
                      Seats / team size (approx.)
                    </label>
                    <input
                      id="teamSize"
                      placeholder="e.g. 3 counselors"
                      value={form.teamSize}
                      onChange={(e) => setForm((f) => ({ ...f, teamSize: e.target.value }))}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-slate-800">
                    What should we know? <span className="font-normal text-slate-500">(optional)</span>
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Programs you run, integrations, timeline…"
                    className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30"
                  />
                </div>
              </div>

              {errorMsg ? (
                <p className="mt-4 text-sm font-medium text-red-700" role="alert">
                  {errorMsg}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="nq-sl-hero-cta mt-6 !w-full justify-center disabled:opacity-60"
              >
                {status === 'submitting' ? 'Sending…' : 'Submit demo request'}
              </button>
              <p className="mt-4 text-center text-xs text-slate-500">
                By submitting, you agree to be contacted about NestQuest for Professionals. No spam.
              </p>
            </form>
          )}
        </div>
      </section>
    </NqHubTabLayout>
  )
}
