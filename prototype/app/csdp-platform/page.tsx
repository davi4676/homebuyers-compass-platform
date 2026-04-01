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
      <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Lock className="w-16 h-16 mx-auto mb-6 text-[#06b6d4]" />
            <h1 className="text-4xl font-bold mb-4">Crowdsourced Down Payment Platform</h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Transform your down payment from a barrier into a community investment opportunity.
              This exclusive Pro+ feature enables vetted homebuyers to safely access community funding.
            </p>
            <div className="bg-gradient-to-r from-[#06b6d4]/20 to-[#f97316]/20 rounded-lg p-8 border border-[#06b6d4]/30 max-w-2xl mx-auto mb-8">
              <h2 className="text-2xl font-bold mb-4">Pro+ Exclusive Feature</h2>
              <ul className="text-left space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#06b6d4]" />
                  <span>Up to $15,000 from verified friends & family</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#06b6d4]" />
                  <span>Extended CSDP: Up to $50,000 from expanded community</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#06b6d4]" />
                  <span>Professional CSDP: Unlimited with accredited investors</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#06b6d4]" />
                  <span>Full regulatory compliance automation</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#06b6d4]" />
                  <span>Campaign management & community activation tools</span>
                </li>
              </ul>
              <Link
                href="/upgrade?tier=navigator_plus&feature=crowdsourcedDownPayment"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#06b6d4] text-white rounded-lg font-semibold hover:bg-[#0891b2] transition-all"
              >
                Upgrade to Concierge+ <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5]">
      <UserJourneyTracker event="csdp_platform_viewed" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-12 h-12 text-[#06b6d4]" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Crowdsourced Down Payment Platform
            </h1>
          </div>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
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
                      ? 'bg-[#06b6d4] text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
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
            color: 'text-[#06b6d4]',
          },
          {
            icon: Users,
            title: 'Social Trust',
            description: 'Multi-layer verification and community accountability',
            color: 'text-[#f97316]',
          },
          {
            icon: TrendingUp,
            title: 'Financial Innovation',
            description: 'New models beyond simple gifts/loans',
            color: 'text-[#10b981]',
          },
        ].map((feature, idx) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-900/50 rounded-lg p-6 border border-gray-800"
            >
              <Icon className={`w-8 h-8 ${feature.color} mb-4`} />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Funding Models Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-900/50 rounded-lg p-8 border border-gray-800"
      >
        <h2 className="text-3xl font-bold mb-6">Available Funding Models</h2>
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
              <div key={idx} className="bg-gray-800/50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Icon className="w-6 h-6 text-[#06b6d4]" />
                  <h3 className="text-xl font-bold">{model.title}</h3>
                </div>
                <ul className="space-y-2">
                  {model.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 text-sm text-gray-400">
                      <CheckCircle className="w-4 h-4 text-[#06b6d4] mt-0.5 flex-shrink-0" />
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
        className="bg-gradient-to-r from-[#06b6d4]/20 to-[#f97316]/20 rounded-lg p-8 border border-[#06b6d4]/30"
      >
        <h2 className="text-2xl font-bold mb-4">Your CSDP Access Level</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Current Level</div>
            <div className="text-2xl font-bold text-[#06b6d4]">
              {csdpFeatures?.accessLevel?.toUpperCase() || 'BASIC'}
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Max Funding</div>
            <div className="text-2xl font-bold">
              ${csdpFeatures?.maxFundingAmount?.toLocaleString() || '15,000'}
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Status</div>
            <div className="text-2xl font-bold text-[#10b981]">Active</div>
          </div>
        </div>
        <button
          onClick={onStart}
          className="w-full md:w-auto px-8 py-4 bg-[#06b6d4] text-white rounded-lg font-semibold hover:bg-[#0891b2] transition-all flex items-center justify-center gap-2"
        >
          Start Eligibility Assessment <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  )
}
