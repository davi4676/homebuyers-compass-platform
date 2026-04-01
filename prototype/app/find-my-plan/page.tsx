'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Zap,
  Shield,
  Crown,
  Sparkles,
  BookOpen,
  Clock,
  MessageSquare,
  Home,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { trackActivity } from '@/lib/track-activity'
import { TIER_DEFINITIONS, type UserTier, formatTierPrice } from '@/lib/tiers'

/* ─── Question definitions ──────────────────────────────────────────────── */

interface Option {
  id: string
  label: string
  sublabel: string
  score: number
}

interface Question {
  id: string
  emoji: string
  question: string
  subtext: string
  options: Option[]
}

const QUESTIONS: Question[] = [
  {
    id: 'knowledge',
    emoji: '📚',
    question: 'How familiar are you with mortgage concepts?',
    subtext: 'Things like DTI, PMI, interest rate locks, points, and closing costs.',
    options: [
      { id: 'a', label: 'Starting from scratch', sublabel: 'Most of this is new to me', score: 1 },
      { id: 'b', label: 'Know the basics', sublabel: "I've read up but details get confusing", score: 2 },
      { id: 'c', label: 'Reasonably confident', sublabel: 'I understand most of it', score: 3 },
      { id: 'd', label: 'Very comfortable', sublabel: "I know exactly what I'm doing", score: 4 },
    ],
  },
  {
    id: 'process',
    emoji: '🗺️',
    question: 'How well do you understand the home buying timeline?',
    subtext: 'From pre-approval → offer → inspection → underwriting → closing.',
    options: [
      { id: 'a', label: "Don't know the steps", sublabel: 'I need someone to map it for me', score: 1 },
      { id: 'b', label: 'Know the big steps', sublabel: "Not sure what happens in between", score: 2 },
      { id: 'c', label: 'Have a rough map', sublabel: 'A few gaps I want to fill', score: 3 },
      { id: 'd', label: 'Done my research', sublabel: 'I feel prepared for each stage', score: 4 },
    ],
  },
  {
    id: 'support',
    emoji: '🙋',
    question: 'When you hit a confusing moment, what do you want?',
    subtext: 'Be honest — there are no wrong answers here.',
    options: [
      { id: 'a', label: 'Walk me through it live', sublabel: 'Step by step, every time', score: 1 },
      { id: 'b', label: 'An advisor I can ask', sublabel: "Guide me when I'm stuck", score: 2 },
      { id: 'c', label: 'A checklist + explanations', sublabel: "I'll figure it out with good tools", score: 3 },
      { id: 'd', label: 'Just give me the data', sublabel: "I'll handle the rest myself", score: 4 },
    ],
  },
  {
    id: 'experience',
    emoji: '🏠',
    question: 'Have you bought a home before?',
    subtext: "Prior experience shapes how much of the process feels new.",
    options: [
      { id: 'a', label: 'Never, and it all feels new', sublabel: 'Total first-timer', score: 1 },
      { id: 'b', label: "No, but I've helped someone", sublabel: 'Familiar from the sidelines', score: 2 },
      { id: 'c', label: 'Yes, once', sublabel: 'Some experience, some rust', score: 3 },
      { id: 'd', label: 'Yes, multiple times', sublabel: 'Very comfortable with the process', score: 4 },
    ],
  },
  {
    id: 'time',
    emoji: '⏱️',
    question: 'How much time can you put into managing this yourself?',
    subtext: 'The more hands-on you can be, the less you may need.',
    options: [
      { id: 'a', label: 'Very little', sublabel: 'I need someone to do the legwork', score: 1 },
      { id: 'b', label: 'Some time', sublabel: 'Smart reminders and check-ins help', score: 2 },
      { id: 'c', label: 'A fair amount', sublabel: 'I like control but need guidance', score: 3 },
      { id: 'd', label: 'Lots of time', sublabel: "I'm self-directed and hands-on", score: 4 },
    ],
  },
]

/* ─── Tier recommendation logic ─────────────────────────────────────────── */

interface TierRec {
  tier: UserTier
  headline: string
  why: string
  highlights: string[]
}

function getRecommendation(answers: Record<string, number>): TierRec {
  const total = Object.values(answers).reduce((s, v) => s + v, 0)
  // 5–9 → proplus, 10–14 → pro, 15–19 → premium, 20 → premium
  if (total <= 9) {
    return {
      tier: 'navigator_plus',
      headline: 'Concierge+ — Full hand-holding, expert access included',
      why: "You want real guidance at every step and aren't looking to figure this out alone. That's smart — most expensive mistakes happen when people try to navigate it solo.",
      highlights: [
        'Unlimited AI assistant + expert escalation',
        'Week-by-week action plan built for your profile',
        'Document vault + timeline orchestrator',
        'Phone support with 2-hour response time',
        '20 negotiation scripts & all calculators',
      ],
    }
  }
  if (total <= 14) {
    return {
      tier: 'navigator',
      headline: 'Concierge — Step-by-step guidance with AI coaching',
      why: "You have some foundation but want structured support at each stage. The Concierge plan gives you an intelligent guide that anticipates your next move before you have to ask.",
      highlights: [
        'AI coach with financial advice + proactive alerts',
        'Week-by-week personalized action plan',
        'Full deal analyzer for specific homes',
        'Document vault + timeline orchestrator',
        '12 negotiation scripts & all calculators',
      ],
    }
  }
  return {
    tier: 'momentum',
    headline: 'Guided — Smart tools + on-demand support',
    why: "You have a solid base and mainly need the right tools and a plan to stay organized. The Guided plan gives you exactly that — without paying for support you don't need.",
    highlights: [
      'AI assistant for when you have questions (20/day)',
      'Personalized action plan + mortgage savings roadmap',
      'Lender comparison + all essential calculators',
      '3 negotiation scripts & full content library',
      'Email support within 48 hours',
    ],
  }
}

/* ─── Tier display config ────────────────────────────────────────────────── */

const TIER_CONFIG: Record<UserTier, { icon: React.ReactNode; color: string; badge: string; bg: string; border: string }> = {
  foundations: {
    icon: <Sparkles className="w-6 h-6" />,
    color: 'text-slate-700',
    badge: 'bg-slate-100 text-slate-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
  },
  momentum: {
    icon: <Zap className="w-6 h-6 text-indigo-600" />,
    color: 'text-indigo-700',
    badge: 'bg-indigo-100 text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
  navigator: {
    icon: <Shield className="w-6 h-6 text-violet-600" />,
    color: 'text-violet-700',
    badge: 'bg-violet-100 text-violet-700',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
  },
  navigator_plus: {
    icon: <Crown className="w-6 h-6 text-amber-600" />,
    color: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
  },
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function FindMyPlanPage() {
  const router = useRouter()
  const [step, setStep] = useState<number>(0) // 0 = intro, 1–5 = questions, 6 = result
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [selected, setSelected] = useState<string | null>(null)

  const totalSteps = QUESTIONS.length
  const isIntro = step === 0
  const isResult = step === totalSteps + 1
  const currentQuestion = isIntro || isResult ? null : QUESTIONS[step - 1]
  const progress = isIntro ? 0 : isResult ? 100 : Math.round(((step - 1) / totalSteps) * 100)

  const rec = isResult ? getRecommendation(answers) : null
  const tierDef = rec ? TIER_DEFINITIONS[rec.tier] : null
  const tierCfg = rec ? TIER_CONFIG[rec.tier] : null

  function handleSelect(questionId: string, score: number, optionId: string) {
    setSelected(optionId)
    setTimeout(() => {
      setAnswers((prev) => ({ ...prev, [questionId]: score }))
      setSelected(null)
      setStep((s) => s + 1)
    }, 320)
  }

  function handleBack() {
    if (step === 0) return
    setSelected(null)
    setStep((s) => s - 1)
  }

  function handleRestart() {
    setAnswers({})
    setSelected(null)
    setStep(0)
  }

  function handleCTA() {
    if (!rec) return
    trackActivity('tool_used', { tool: 'find_my_plan_cta', tier: rec.tier })
    router.push(`/upgrade?tier=${rec.tier}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            <Home className="h-4 w-4" />
            Home
          </Link>
          {!isIntro && !isResult && (
            <span className="text-xs font-semibold text-slate-400 tabular-nums">
              {step} / {totalSteps}
            </span>
          )}
          <Link href="/upgrade" className="text-sm font-semibold text-[rgb(var(--coral))] hover:underline transition-colors">
            See all plans
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <AnimatePresence mode="wait">

          {/* ── Intro ── */}
          {isIntro && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="text-center"
            >
              <span className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgb(var(--coral))]/10 text-4xl">
                🧭
              </span>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-[#1e293b] sm:text-4xl">
                Find the plan that fits <em>you</em>
              </h1>
              <p className="mt-3 text-base text-slate-500 max-w-lg mx-auto">
                5 quick questions about your experience and how much help you want — we'll match you to the plan that's actually worth paying for.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-indigo-400" /> Financial education level</span>
                <span className="hidden sm:inline text-slate-300">·</span>
                <span className="inline-flex items-center gap-1.5"><Home className="h-4 w-4 text-emerald-400" /> Process understanding</span>
                <span className="hidden sm:inline text-slate-300">·</span>
                <span className="inline-flex items-center gap-1.5"><MessageSquare className="h-4 w-4 text-amber-400" /> Desired support style</span>
              </div>
              <button
                onClick={() => setStep(1)}
                className="mt-10 inline-flex items-center gap-2 rounded-xl bg-[rgb(var(--coral))] px-8 py-4 text-base font-bold text-white shadow-lg hover:opacity-90 transition"
              >
                Start matching <ArrowRight className="h-5 w-5" />
              </button>
              <p className="mt-4 text-xs text-slate-400">Takes about 60 seconds · No email required</p>
            </motion.div>
          )}

          {/* ── Question ── */}
          {currentQuestion && (
            <motion.div
              key={`q-${step}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </button>
                  <span className="text-xs font-semibold text-slate-400">{Math.round(progress)}% done</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-[rgb(var(--coral))]"
                    initial={{ width: `${Math.round(((step - 2) / totalSteps) * 100)}%` }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </div>

              <div className="mb-7">
                <span className="text-4xl">{currentQuestion.emoji}</span>
                <h2 className="mt-3 text-xl font-black tracking-tight text-[#1e293b] sm:text-2xl">
                  {currentQuestion.question}
                </h2>
                <p className="mt-1.5 text-sm text-slate-500">{currentQuestion.subtext}</p>
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((opt) => {
                  const isChosen = selected === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelect(currentQuestion.id, opt.score, opt.id)}
                      disabled={selected !== null}
                      className={`group w-full rounded-xl border-2 px-5 py-4 text-left transition-all duration-200 ${
                        isChosen
                          ? 'border-[rgb(var(--coral))] bg-[rgb(var(--coral))]/5 shadow-md'
                          : 'border-slate-200 bg-white hover:border-[rgb(var(--coral))]/50 hover:bg-[rgb(var(--coral))]/3 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className={`text-sm font-bold ${isChosen ? 'text-[rgb(var(--coral))]' : 'text-slate-800 group-hover:text-[rgb(var(--coral))]'} transition-colors`}>
                            {opt.label}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{opt.sublabel}</p>
                        </div>
                        {isChosen ? (
                          <CheckCircle className="h-5 w-5 shrink-0 text-[rgb(var(--coral))]" />
                        ) : (
                          <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-[rgb(var(--coral))]/50 transition-colors" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── Result ── */}
          {isResult && rec && tierDef && tierCfg && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.97, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <div className="mb-6 text-center">
                <span className="text-4xl">🎯</span>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-[#1e293b] sm:text-3xl">
                  Your plan match
                </h2>
                <p className="mt-1 text-sm text-slate-500">Based on your answers, here's what we recommend.</p>
              </div>

              {/* Recommendation card */}
              <div className={`overflow-hidden rounded-2xl border-2 ${tierCfg.border} ${tierCfg.bg} shadow-lg`}>
                {/* Top band */}
                <div className={`px-5 py-4 sm:px-6 border-b ${tierCfg.border}`}>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${tierCfg.badge}`}>
                      {tierCfg.icon}
                    </span>
                    <div>
                      <span className={`text-xs font-bold uppercase tracking-widest ${tierCfg.color}`}>Recommended</span>
                      <h3 className={`text-lg font-black ${tierCfg.color}`}>{rec.headline}</h3>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-5 sm:px-6 space-y-5">
                  {/* Why */}
                  <div className="rounded-xl border border-slate-200 bg-white/70 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">Why this plan for you</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{rec.why}</p>
                  </div>

                  {/* What's included */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2.5">What you get</p>
                    <ul className="space-y-2">
                      {rec.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2.5 text-sm text-slate-700">
                          <CheckCircle className={`h-4 w-4 mt-0.5 shrink-0 ${tierCfg.color}`} />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pricing */}
                  <div className="rounded-xl border border-slate-200 bg-white/70 p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">One-time or monthly</p>
                      <p className={`text-2xl font-black ${tierCfg.color}`}>{formatTierPrice(tierDef)}</p>
                    </div>
                    <Clock className="h-5 w-5 text-slate-300 shrink-0" />
                  </div>

                  {/* CTA */}
                  <button
                    onClick={handleCTA}
                    className={`relative w-full overflow-hidden rounded-xl px-6 py-4 text-base font-bold text-white shadow-lg transition hover:opacity-90 ${
                      rec.tier === 'navigator_plus'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                        : rec.tier === 'navigator'
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600'
                          : 'bg-gradient-to-r from-indigo-500 to-blue-500'
                    }`}
                  >
                    <span className="absolute inset-0 rounded-xl animate-ping opacity-20 bg-white pointer-events-none" style={{ animationDuration: '2.5s' }} />
                    <span className="relative inline-flex items-center justify-center gap-2">
                      Get the {tierDef.name} plan <ArrowRight className="h-5 w-5" />
                    </span>
                  </button>

                  <p className="text-center text-xs text-slate-400">
                    Not sure?{' '}
                    <Link href="/upgrade" className="underline underline-offset-2 hover:text-slate-600">
                      Compare all plans side by side
                    </Link>
                    {' '}·{' '}
                    <button onClick={handleRestart} className="underline underline-offset-2 hover:text-slate-600">
                      Retake the quiz
                    </button>
                  </p>
                </div>
              </div>

              {/* Other tiers teaser */}
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3 text-center">
                  Other options
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(['momentum', 'navigator', 'navigator_plus'] as UserTier[])
                    .filter((t) => t !== rec.tier)
                    .map((t) => {
                      const def = TIER_DEFINITIONS[t]
                      const cfg = TIER_CONFIG[t]
                      return (
                        <Link
                          key={t}
                          href={`/upgrade?tier=${t}`}
                          className={`rounded-xl border ${cfg.border} ${cfg.bg} p-3 hover:shadow-sm transition-all`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {cfg.icon}
                            <span className={`text-xs font-bold ${cfg.color}`}>{def.name}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed">{def.description}</p>
                          <p className={`mt-1 text-xs font-black ${cfg.color}`}>{formatTierPrice(def)}</p>
                        </Link>
                      )
                    })}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  )
}
