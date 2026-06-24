'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import {
  Shield, Search, Users, Key, ChevronDown, ChevronRight,
  Lock, CheckCircle, Bell, ClipboardCheck, CreditCard,
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { getUserTier } from '@/lib/user-tracking'
import { TIER_DEFINITIONS, type UserTier, TIER_ORDER } from '@/lib/tiers'
import PhaseVideoEmbed from '@/components/journey/PhaseVideoEmbed'
import ResourcesBackLink from '@/components/ResourcesBackLink'
import PlainEnglishToggleBar from '@/components/learn/PlainEnglishToggleBar'
import { usePlainEnglish } from '@/lib/hooks/usePlainEnglish'
import { applyPlainEnglishCopy } from '@/lib/plain-english'
import { markGuideRead } from '@/lib/guide-progress'
import NqHubTabLayout from '@/components/hub/NqHubTabLayout'
import NqHubSubnav from '@/components/hub/NqHubSubnav'
import {
  PLAYBOOK_CATEGORIES,
  ScriptUpgradeTeaser,
  type PlaybookResource,
} from '@/app/resources/playbooks'

const CATEGORY_META: Record<
  string,
  { icon: ReactNode; color: string }
> = {
  preparation: { icon: <CreditCard className="h-6 w-6" />, color: 'text-cyan-600' },
  'pre-approval': { icon: <Shield className="h-6 w-6" />, color: 'text-emerald-600' },
  'house-hunting': { icon: <Search className="h-6 w-6" />, color: 'text-yellow-600' },
  negotiation: { icon: <Users className="h-6 w-6" />, color: 'text-orange-500' },
  underwriting: { icon: <ClipboardCheck className="h-6 w-6" />, color: 'text-teal-600' },
  closing: { icon: <Key className="h-6 w-6" />, color: 'text-cyan-600' },
  'loan-programs': { icon: <Shield className="h-6 w-6" />, color: 'text-violet-600' },
  'post-closing': { icon: <CheckCircle className="h-6 w-6" />, color: 'text-green-700' },
  methodology: { icon: <Shield className="h-6 w-6" />, color: 'text-slate-700' },
}

function ResourceCard({
  resource,
  isOpen,
  onToggle,
  phaseId,
  plainEnglish,
}: {
  resource: PlaybookResource
  isOpen: boolean
  onToggle: () => void
  phaseId: string
  plainEnglish: boolean
}) {
  const typeColors: Record<string, string> = {
    guide: 'bg-blue-100 text-blue-700',
    script: 'bg-emerald-100 text-emerald-700',
    checklist: 'bg-amber-100 text-amber-700',
    tip: 'bg-slate-100 text-slate-700',
  }

  return (
    <div id={`resource-${resource.id}`} className="nq-hub-resource-card scroll-mt-24">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/50"
      >
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${typeColors[resource.type]}`}>
              {resource.type}
            </span>
            {resource.tierRequired ? (
              <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                <Lock className="h-3 w-3" />
                {TIER_DEFINITIONS[resource.tierRequired].name}
              </span>
            ) : null}
          </div>
          <p className="text-sm font-semibold text-[var(--nq-ed-text)]">{resource.title}</p>
          <p className="mt-0.5 text-xs text-[var(--nq-ed-muted)]">
            {applyPlainEnglishCopy(resource.summary, plainEnglish)}
          </p>
        </div>
        {isOpen ? (
          <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-slate-400" />
        ) : (
          <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-400" />
        )}
      </button>
      {isOpen ? (
        <div className="border-t border-[var(--nq-ed-line-soft)] px-5 pb-5 pt-4">
          {resource.content}
          <div className="mt-4 border-t border-[var(--nq-ed-line-soft)] pt-3">
            <Link
              href={`/customized-journey#phase-${phaseId}`}
              className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[var(--nq-ed-accent)] hover:underline"
            >
              Apply this in Action Roadmap <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function ResourcesPage() {
  const pathname = usePathname()
  useAuth()
  const plainEnglish = usePlainEnglish()
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})
  const [recommendedPhase, setRecommendedPhase] = useState<string | null>(null)
  const [userTier, setUserTier] = useState<UserTier>('foundations')

  useEffect(() => {
    setUserTier(getUserTier())
  }, [])

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const nextOpen = !prev[id]
      if (nextOpen) markGuideRead(id)
      return { ...prev, [id]: nextOpen }
    })
  }

  const hasAccess = (tierRequired?: UserTier) => {
    if (!tierRequired) return true
    const currentIndex = TIER_ORDER.indexOf(userTier)
    const requiredIndex = TIER_ORDER.indexOf(tierRequired)
    return currentIndex >= requiredIndex
  }

  useEffect(() => {
    if (Object.keys(openItems).length > 0) return

    const defaults: Record<string, boolean> = {}
    PLAYBOOK_CATEGORIES.forEach((category) => {
      const firstVisible = category.resources.find((r) => hasAccess(r.tierRequired))
      if (firstVisible) defaults[firstVisible.id] = true
    })

    if (Object.keys(defaults).length > 0) {
      setOpenItems(defaults)
    }
  }, [openItems, userTier])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash.replace('#', '')
    if (hash.startsWith('resource-')) {
      const id = hash.replace('resource-', '')
      setOpenItems((prev) => ({ ...prev, [id]: true }))
      markGuideRead(id)
    }

    const current = localStorage.getItem('currentPhase')
    if (current) {
      setRecommendedPhase(current)
      return
    }

    try {
      const status = JSON.parse(localStorage.getItem('phaseStatus') || '{}') as Record<string, string>
      const phaseOrder = ['preparation', 'pre-approval', 'loan-programs', 'house-hunting', 'negotiation', 'underwriting', 'closing', 'post-closing']
      const next = phaseOrder.find((p) => status[p] !== 'complete')
      if (next) setRecommendedPhase(next)
    } catch {
      /* no-op */
    }
  }, [])

  return (
    <NqHubTabLayout tab="guides" backLink={<ResourcesBackLink />} maxWidth="5xl">
      <NqHubSubnav
        items={[
          { href: '/results', label: 'Savings Snapshot', active: pathname === '/results' },
          { href: '/inbox', label: 'Inbox', icon: <Bell className="h-4 w-4" />, active: pathname === '/inbox' },
          { href: '/customized-journey', label: 'Action Roadmap', active: pathname === '/customized-journey' },
          { label: 'Playbooks', active: true },
        ]}
      />
      <p className="nq-sl-section-lede mb-2 mt-4">
        Deep references for every phase — use alongside your{' '}
        <Link href="/customized-journey" className="font-semibold text-[var(--nq-ed-accent)] hover:underline">
          Action Roadmap
        </Link>
        .
      </p>
      <p className="mb-6 text-sm text-[var(--nq-ed-muted)]">
        Unfamiliar term? See the{' '}
        <Link href="/glossary" className="font-semibold text-[var(--nq-ed-accent)] hover:underline">
          glossary
        </Link>{' '}
        or browse the{' '}
        <Link href="/learn/faq" className="font-semibold text-[var(--nq-ed-accent)] hover:underline">
          homebuying FAQ
        </Link>
        . Topic index:{' '}
        <Link href="/learn" className="font-semibold text-[var(--nq-ed-accent)] hover:underline">
          /learn
        </Link>
        . Turn on Plain English below for simpler wording.
      </p>
      <PlainEnglishToggleBar className="mb-6" />

      <div className="space-y-8">
        {PLAYBOOK_CATEGORIES.map((category) => {
          const meta = CATEGORY_META[category.id] ?? CATEGORY_META.methodology
          return (
            <motion.section
              key={category.id}
              id={`phase-${category.id}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="mb-3 flex items-center gap-3">
                <span className={meta.color}>{meta.icon}</span>
                <h2 className="text-lg font-bold text-[var(--nq-ed-text)]">{category.title}</h2>
                {recommendedPhase === category.id ? (
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                    Recommended now
                  </span>
                ) : null}
              </div>

              <PhaseVideoEmbed phaseId={category.id} />

              <div className="space-y-3">
                {category.resources.map((resource) => {
                  const locked = !hasAccess(resource.tierRequired)
                  if (locked) {
                    return (
                      <div
                        key={resource.id}
                        id={`resource-${resource.id}`}
                        className="nq-hub-panel scroll-mt-24 px-5 py-4"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                <Lock className="h-3 w-3" />
                                {resource.tierRequired ? TIER_DEFINITIONS[resource.tierRequired].name : 'Upgrade'}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-slate-600">{resource.title}</p>
                            <p className="mt-0.5 text-xs text-slate-400">{resource.summary}</p>
                            {resource.teaser ? (
                              <div className="mt-3">
                                <ScriptUpgradeTeaser resourceId={resource.id} teaser={resource.teaser} />
                              </div>
                            ) : null}
                          </div>
                          <Link
                            href={`/upgrade?source=resources-${resource.id}`}
                            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--nq-ed-accent)] px-3 py-2 text-xs font-bold text-white"
                          >
                            Upgrade to Momentum <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    )
                  }
                  return (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      isOpen={!!openItems[resource.id]}
                      onToggle={() => toggleItem(resource.id)}
                      phaseId={category.id}
                      plainEnglish={plainEnglish}
                    />
                  )
                })}
              </div>
            </motion.section>
          )
        })}
      </div>

      <div className="nq-hub-panel mt-10 flex items-start gap-3 p-4">
        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--nq-ed-accent)]" />
        <p className="text-xs leading-relaxed text-[var(--nq-ed-muted)]">
          <strong className="text-[var(--nq-ed-text)]">How we make money:</strong> We charge for optional premium
          plan features — never through commissions, referrals, or kickbacks from lenders, agents, or title
          companies.
        </p>
      </div>
    </NqHubTabLayout>
  )
}
