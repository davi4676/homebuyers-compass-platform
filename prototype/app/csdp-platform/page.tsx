'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Shield,
  TrendingUp,
  FileText,
  CheckCircle,
  Lock,
  ArrowRight,
  DollarSign,
  Target,
  Zap,
  Heart,
  Building2,
  Award,
  BarChart3,
  Settings,
  Mail,
  Share2,
} from 'lucide-react'
import Link from 'next/link'
import { getUserTier } from '@/lib/user-tracking'
import { type UserTier, TIER_DEFINITIONS, hasFeature } from '@/lib/tiers'
import CSDPEligibilityAssessment from '@/components/csdp/CSDPEligibilityAssessment'
import FundingModelSelector from '@/components/csdp/FundingModelSelector'
import CampaignCreator from '@/components/csdp/CampaignCreator'
import CommunityActivation from '@/components/csdp/CommunityActivation'
import FundsManagement from '@/components/csdp/FundsManagement'
import ComplianceDashboard from '@/components/csdp/ComplianceDashboard'
import type { Campaign, FundingModel } from '@/components/csdp/csdp-types'
import TrustSignals from '@/components/trust/TrustSignals'
import UserJourneyTracker from '@/components/analytics/UserJourneyTracker'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'

type CSDPPhase = 'overview' | 'eligibility' | 'funding-model' | 'campaign' | 'activation' | 'management' | 'compliance'
type CampaignState = Campaign | { fundingModel: FundingModel } | null

export default function CSDPPlatformPage() {
  const [userTier, setUserTier] = useState<UserTier>('foundations')
  const [currentPhase, setCurrentPhase] = useState<CSDPPhase>('overview')
  const [campaignData, setCampaignData] = useState<CampaignState>(null)
  const [eligibilityStatus, setEligibilityStatus] = useState<'not-started' | 'in-progress' | 'qualified' | 'not-qualified'>('not-started')

  useEffect(() => {
    const tier = getUserTier()
    setUserTier(tier)

    const handleTierChange = (e: CustomEvent) => {
      const newTier = e.detail?.tier as UserTier | undefined
      if (newTier && newTier in TIER_DEFINITIONS) {
        setUserTier(newTier)
      }
    }

    window.addEventListener('tierChanged', handleTierChange as EventListener)
    return () => window.removeEventListener('tierChanged', handleTierChange as EventListener)
  }, [])

  const hasCSDPAccess = hasFeature(userTier, 'crowdsourcedDownPayment.enabled')
  const csdpFeatures = TIER_DEFINITIONS[userTier]?.features?.crowdsourcedDownPayment

  if (!hasCSDPAccess) {
    return (
      <div className="app-page-shell">
        <UserJourneyTracker event="csdp_platform_explainer_viewed" />
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-6">
            <BackToMyJourneyLink />
          </div>
          <section className="text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight text-[#1c1917] md:text-5xl">
              Fund Your Down Payment with Your Community
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-[#57534e]">
              NestQuest&apos;s Crowdsourced Down Payment Platform lets you raise up to $50,000 toward your down payment
              from family, friends, and your expanded network — with full legal compliance and tax documentation.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {['Average campaign raises $18,400', '94% of campaigns reach their goal', '100% legal & IRS-compliant'].map(
                (t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[#0d9488]/30 bg-white px-4 py-2 text-sm font-semibold text-[#1a6b3c] shadow-sm"
                  >
                    {t}
                  </span>
                )
              )}
            </div>
            <p className="mx-auto mt-4 max-w-2xl text-center text-xs leading-relaxed text-[#78716c]">
              Figures shown are illustrative benchmarks from NestQuest prototype campaign modeling, not audited outcomes.
              Always confirm tax and gift rules with a qualified professional before raising funds.
            </p>
          </section>

          <section className="mt-14">
            <h2 className="text-center font-display text-2xl font-bold text-[#1c1917]">How it works</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                {
                  step: '1',
                  title: 'Set Your Goal',
                  body: 'You decide how much you want to raise and set a timeline (30–90 days).',
                },
                {
                  step: '2',
                  title: 'Share With Your Network',
                  body: 'A personalized campaign page is created. Share via text, email, or social media.',
                },
                {
                  step: '3',
                  title: 'Funds Go Directly to Escrow',
                  body: 'Contributions are held in a compliant escrow account and applied at closing.',
                },
              ].map((s) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-[#e7e5e4] bg-white p-6 shadow-sm"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1a6b3c]/10 text-sm font-bold text-[#1a6b3c]">
                    {s.step}
                  </span>
                  <h3 className="mt-4 font-display text-xl font-bold text-[#1c1917]">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#57534e]">{s.body}</p>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="mt-14">
            <p className="mb-3 text-center text-xs font-bold uppercase tracking-wide text-[#78716c]">Sample Campaign</p>
            <div className="mx-auto max-w-lg rounded-xl border border-[#e7e5e4] bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f5f5f4] text-xs font-semibold text-[#78716c]">
                  Photo
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-bold text-[#1c1917]">Maria&apos;s Home Fund</p>
                  <p className="text-sm text-[#57534e]">Illustrative example — not a live campaign.</p>
                </div>
              </div>
              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-[#f5f5f4]">
                <div className="h-full w-[67%] rounded-full bg-[#0d9488]" />
              </div>
              <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
                <span className="font-semibold text-[#1a6b3c]">$33,500 raised of $50,000 goal</span>
                <span className="text-[#57534e]">67%</span>
              </div>
              <p className="mt-2 text-sm text-[#57534e]">14 contributors · 32 days remaining</p>
            </div>
          </section>

          <section className="mt-14 rounded-xl border border-[#1a6b3c]/20 bg-white p-8 shadow-sm">
            <div className="mb-2 flex justify-center">
              <Lock className="h-10 w-10 text-[#1a6b3c]" aria-hidden />
            </div>
            <h2 className="text-center font-display text-2xl font-bold text-[#1c1917]">
              Start Your Campaign — Available with Concierge+
            </h2>
            <p className="mt-2 text-center text-3xl font-bold text-[#1a6b3c]">
              $149<span className="text-lg font-semibold text-[#57534e]">/mo</span>
            </p>
            <ul className="mx-auto mt-6 max-w-md space-y-3 text-left text-[#57534e]">
              <li className="flex gap-2">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#16a34a]" />
                Raise up to $50,000 with compliant campaign tools
              </li>
              <li className="flex gap-2">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#16a34a]" />
                Escrow-ready disbursement and documentation workflows
              </li>
              <li className="flex gap-2">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#16a34a]" />
                Shareable campaign page and contributor receipts
              </li>
              <li className="flex gap-2">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#16a34a]" />
                Regulatory guardrails built for gifts and regulated offerings
              </li>
            </ul>
            <div className="mt-8 text-center">
              <Link
                href="/upgrade?tier=navigator_plus&feature=crowdsourcedDownPayment"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1a6b3c] px-8 py-4 font-semibold text-white transition hover:bg-[#155c33]"
              >
                Unlock your full savings report <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="app-page-shell">
      <UserJourneyTracker event="csdp_platform_viewed" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <BackToMyJourneyLink />
        </div>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-12 h-12 text-[#1a6b3c]" />
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-[#1c1917]">
              Crowdsourced Down Payment Platform
            </h1>
          </div>
          <p className="text-lg text-[#57534e] max-w-3xl mx-auto">
            Transform your down payment from a barrier into a community investment opportunity.
            Get help from those who believe in you, with structures that work for everyone.
          </p>
        </motion.div>

        {/* Phase Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'eligibility', label: 'Eligibility', icon: CheckCircle },
              { id: 'funding-model', label: 'Funding Model', icon: DollarSign },
              { id: 'campaign', label: 'Campaign', icon: Target },
              { id: 'activation', label: 'Activation', icon: Share2 },
              { id: 'management', label: 'Funds', icon: Building2 },
              { id: 'compliance', label: 'Compliance', icon: Shield },
            ].map((phase) => {
              const Icon = phase.icon
              const isActive = currentPhase === phase.id
              return (
                <button
                  key={phase.id}
                  onClick={() => setCurrentPhase(phase.id as CSDPPhase)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    isActive
                      ? 'bg-[#1a6b3c] text-white'
                      : 'bg-white border border-[#e7e5e4] text-[#57534e] hover:border-[#1a6b3c]/50 hover:text-[#1c1917]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {phase.label}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Phase Content */}
        <div className="mb-12">
          {currentPhase === 'overview' && (
            <CSDPOverview
              userTier={userTier}
              csdpFeatures={csdpFeatures}
              onStart={() => setCurrentPhase('eligibility')}
            />
          )}
          {currentPhase === 'eligibility' && (
            <CSDPEligibilityAssessment
              onComplete={(qualified) => {
                setEligibilityStatus(qualified ? 'qualified' : 'not-qualified')
                if (qualified) {
                  setCurrentPhase('funding-model')
                }
              }}
            />
          )}
          {currentPhase === 'funding-model' && (
            <FundingModelSelector
              onSelect={(model: FundingModel) => {
                setCampaignData({ fundingModel: model })
                setCurrentPhase('campaign')
              }}
            />
          )}
          {currentPhase === 'campaign' && (
            <CampaignCreator
              fundingModel={campaignData?.fundingModel}
              onComplete={(campaign: Campaign) => {
                setCampaignData(campaign)
                setCurrentPhase('activation')
              }}
            />
          )}
          {currentPhase === 'activation' && (
            <CommunityActivation
              campaign={campaignData}
              onComplete={() => setCurrentPhase('management')}
            />
          )}
          {currentPhase === 'management' && (
            <FundsManagement campaign={campaignData} />
          )}
          {currentPhase === 'compliance' && (
            <ComplianceDashboard campaign={campaignData} />
          )}
        </div>

        <TrustSignals />
      </div>
    </div>
  )
}

function CSDPOverview({
  userTier,
  csdpFeatures,
  onStart,
}: {
  userTier: UserTier
  csdpFeatures: any
  onStart: () => void
}) {
  return (
    <div className="space-y-8">
      {/* Key Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          {
            icon: Shield,
            title: 'Regulatory Compliance',
            description: 'Built within SEC, FINRA, and state securities regulations',
            accent: 'text-[#0d9488]',
          },
          {
            icon: Users,
            title: 'Social Trust',
            description: 'Multi-layer verification and community accountability',
            accent: 'text-[#c0622a]',
          },
          {
            icon: TrendingUp,
            title: 'Financial Innovation',
            description: 'New models beyond simple gifts/loans',
            accent: 'text-[#16a34a]',
          },
        ].map((feature, idx) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-xl p-6 border border-[#e7e5e4] shadow-sm"
            >
              <Icon className={`w-8 h-8 ${feature.accent} mb-4`} />
              <h3 className="text-xl font-bold mb-2 text-[#1c1917]">{feature.title}</h3>
              <p className="text-[#57534e]">{feature.description}</p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Funding Models Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-8 border border-[#e7e5e4] shadow-sm"
      >
        <h2 className="text-3xl font-bold mb-6 text-[#1c1917]">Available Funding Models</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: 'Social Contribution Model',
              icon: Heart,
              features: [
                'Gift-With-Benefits System',
                'Micro-Loan Network ($100-$5,000)',
                'Contribution Matching (employer programs)',
              ],
            },
            {
              title: 'Community Investment Model',
              icon: Building2,
              features: [
                'Revenue Sharing Notes',
                'Neighborhood Investment Funds',
                'Pay It Forward Chain',
              ],
            },
            {
              title: 'Hybrid Models',
              icon: Heart,
              features: [
                'Rent-to-Equity Conversion',
                'Skill-Based Contribution Exchange',
                'Future Value Sharing',
              ],
            },
          ].map((model, idx) => {
            const Icon = model.icon
            return (
              <div key={idx} className="bg-[#f5f5f4] rounded-xl p-6 border border-[#e7e5e4]">
                <div className="flex items-center gap-3 mb-4">
                  <Icon className="w-6 h-6 text-[#1a6b3c]" />
                  <h3 className="text-xl font-bold text-[#1c1917]">{model.title}</h3>
                </div>
                <ul className="space-y-2">
                  {model.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 text-sm text-[#57534e]">
                      <CheckCircle className="w-4 h-4 text-[#16a34a] mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Access Level Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#1a6b3c]/5 rounded-xl p-8 border border-[#1a6b3c]/20"
      >
        <h2 className="text-2xl font-bold mb-4 text-[#1c1917]">Your CSDP Access Level</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-[#e7e5e4] shadow-sm">
            <div className="text-sm text-[#57534e] mb-1">Current Level</div>
            <div className="text-2xl font-bold text-[#1a6b3c]">
              {csdpFeatures?.accessLevel?.toUpperCase() || 'BASIC'}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[#e7e5e4] shadow-sm">
            <div className="text-sm text-[#57534e] mb-1">Max Funding</div>
            <div className="text-2xl font-bold text-[#1c1917]">
              ${csdpFeatures?.maxFundingAmount?.toLocaleString() || '15,000'}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[#e7e5e4] shadow-sm">
            <div className="text-sm text-[#57534e] mb-1">Status</div>
            <div className="text-2xl font-bold text-[#16a34a]">Active</div>
          </div>
        </div>
        <button
          onClick={onStart}
          className="w-full md:w-auto px-8 py-4 bg-[#1a6b3c] hover:bg-[#155c33] text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
        >
          Start Eligibility Assessment <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  )
}
