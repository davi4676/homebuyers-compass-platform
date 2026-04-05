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
    <div className="min-h-screen bg-gradient-to-b from-millennial-bg via-white to-[#f0f7f5] text-millennial-text">
      <section className="relative overflow-hidden border-b border-millennial-border/80">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            background:
              'radial-gradient(900px 420px at 15% -10%, rgba(13,148,136,0.18), transparent 55%), radial-gradient(700px 380px at 90% 10%, rgba(30,58,95,0.12), transparent 50%)',
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14">
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-teal-800/90">
            B2B · NestQuest for Professionals
          </p>
          <h1 className="text-center font-display text-3xl font-bold leading-tight text-[rgb(var(--navy))] sm:text-4xl md:text-5xl">
            Homebuyer readiness at scale — for mission-driven institutions
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-center text-lg text-millennial-text-muted sm:text-xl">
            Branded assessments, savings snapshots, and client-ready reports your team can deliver in one workflow.
            We prioritize{' '}
            <strong className="font-semibold text-[rgb(var(--navy))]">
              HUD-approved housing counseling agencies, credit unions, and CDFIs
            </strong>{' '}
            — organizations that are actively buying digital tools to support{' '}
            <strong className="font-semibold text-[rgb(var(--navy))]">first-generation and low-income buyers</strong>, with
            procurement budgets and compliance-ready expectations.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={scrollToDemo}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-millennial-cta-primary to-millennial-cta-secondary px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-teal-900/15 transition hover:opacity-95"
            >
              Request a demo
              <ArrowRight className="h-5 w-5" aria-hidden />
            </button>
            <Link
              href="/"
              className="inline-flex items-center rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-base font-semibold text-slate-800 transition hover:border-teal-300 hover:bg-teal-50/50"
            >
              Consumer product
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <h2 className="text-center font-display text-2xl font-bold text-[rgb(var(--navy))] sm:text-3xl">
          Why HUD agencies, credit unions, and CDFIs lead the list
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-millennial-text-muted">
          These partners are scaling digital services for first-gen and LMI households, often with formal procurement
          and grant reporting — so they value a structured, branded toolkit with defensible outcomes.
        </p>
        <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-teal-200/90 bg-gradient-to-r from-teal-50/90 to-white px-5 py-4 shadow-sm ring-1 ring-teal-100/80 sm:px-6">
          <p className="text-center text-sm leading-relaxed text-slate-800">
            <span className="font-display font-bold text-[rgb(var(--navy))]">Partner economics.</span>{' '}
            A single <strong className="font-semibold text-slate-900">CDFI</strong> or multi-program institutional
            contract can represent on the order of{' '}
            <strong className="font-semibold text-teal-900">
              $2,000–$10,000/month
            </strong>{' '}
            in recurring revenue at scale, depending on seats, programs, and integrations — one reason we focus here
            first.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-teal-100 bg-white p-6 shadow-sm ring-1 ring-teal-50"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
              <Building2 className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="font-display text-lg font-bold text-[rgb(var(--navy))]">HUD-approved counseling agencies</h3>
            <p className="mt-2 text-sm leading-relaxed text-millennial-text-muted">
              Education, intake, and reporting pressure in one workflow: readiness scoring, savings snapshots, and
              grant-ready exports so counselors spend time with clients — not spreadsheets.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[rgb(var(--navy))]/10 text-[rgb(var(--navy))]">
              <Shield className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="font-display text-lg font-bold text-[rgb(var(--navy))]">Credit unions</h3>
            <p className="mt-2 text-sm leading-relaxed text-millennial-text-muted">
              Member-first affordability clarity, responsible product fit, and a branded journey alongside mortgage and
              financial wellness — strong fit for branches with committed procurement for digital member tools.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="rounded-2xl border border-teal-100 bg-white p-6 shadow-sm ring-1 ring-teal-50"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
              <LineChart className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="font-display text-lg font-bold text-[rgb(var(--navy))]">CDFIs</h3>
            <p className="mt-2 text-sm leading-relaxed text-millennial-text-muted">
              Lending plus community development missions: digital homebuyer readiness scales across programs and
              geographies. Larger partnerships often sit in the same range as multi-seat Growth or Enterprise plans — with
              room to grow into recurring program fees.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-millennial-border/80 bg-white/80 py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center font-display text-2xl font-bold text-[rgb(var(--navy))] sm:text-3xl">
            What teams get
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                className="flex gap-4 rounded-xl border border-slate-100 bg-millennial-bg/40 p-5 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h3 className="font-display font-bold text-[rgb(var(--navy))]">{title}</h3>
                  <p className="mt-1 text-sm text-millennial-text-muted">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-display text-2xl font-bold text-[rgb(var(--navy))] sm:text-3xl">
          Simple B2B pricing
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-millennial-text-muted">
          <strong className="font-semibold text-slate-800">Starter</strong> ($299/mo),{' '}
          <strong className="font-semibold text-slate-800">Growth</strong> ($799/mo), and{' '}
          <strong className="font-semibold text-slate-800">Enterprise</strong> ($1,999/mo) — annual and institution-wide
          contracts available. Talk to us for HUD agency, CDFI, or multi-branch credit union bundles.
        </p>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-2xl border p-6 shadow-sm transition ${
                tier.popular
                  ? 'border-teal-400 bg-gradient-to-b from-teal-50/90 to-white ring-2 ring-teal-400/40'
                  : 'border-slate-200 bg-white'
              }`}
            >
              {tier.popular ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-teal-600 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                  Most popular
                </span>
              ) : null}
              <h3 className="font-display text-xl font-bold text-[rgb(var(--navy))]">{tier.name}</h3>
              <p className="mt-2 min-h-[40px] text-sm text-millennial-text-muted">{tier.description}</p>
              <p className="mt-6 font-display text-4xl font-black tabular-nums text-[rgb(var(--navy))]">
                ${tier.price.toLocaleString('en-US')}
                <span className="text-lg font-semibold text-millennial-text-muted">/mo</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
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
                    ? 'bg-teal-600 text-white shadow hover:bg-teal-700'
                    : 'border-2 border-slate-200 bg-white text-slate-900 hover:border-teal-300'
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section id="demo" className="scroll-mt-24 border-t border-millennial-border/80 bg-gradient-to-b from-[#ecfdf5]/80 to-millennial-bg pb-20 pt-16">
        <div className="mx-auto max-w-xl px-4 sm:px-6">
          <h2 className="text-center font-display text-2xl font-bold text-[rgb(var(--navy))] sm:text-3xl">
            Request a demo
          </h2>
          <p className="mt-3 text-center text-millennial-text-muted">
            Tell us about your organization. We&apos;ll follow up within two business days with a tailored walkthrough.
          </p>

          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-10 rounded-2xl border border-teal-200 bg-white p-8 text-center shadow-lg"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-800">
                <Check className="h-8 w-8" aria-hidden />
              </div>
              <h3 className="font-display text-xl font-bold text-[rgb(var(--navy))]">Thanks — you&apos;re on the list</h3>
              <p className="mt-2 text-sm text-millennial-text-muted">
                We received your request. Check your inbox for a confirmation from our team shortly.
              </p>
              <Link href="/" className="mt-6 inline-block font-semibold text-teal-800 underline hover:text-teal-950">
                ← Back to NestQuest home
              </Link>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8"
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
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-millennial-cta-primary to-millennial-cta-secondary py-3.5 text-base font-bold text-white shadow-md transition hover:opacity-95 disabled:opacity-60"
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
    </div>
  )
}
