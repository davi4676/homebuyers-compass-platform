'use client'

import {
  Target,
  FileText,
  Home,
  DollarSign,
  Eye,
  TrendingUp,
  Shield,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react'

/**
 * Single source of truth for "Plan Your Journey" step names and styling.
 * Edit this file to adjust steps; both the horizontal tile section and the
 * vertical top-to-bottom section use this config.
 */
export type PlanYourJourneyPhaseId =
  | 'preparation'
  | 'pre-approval'
  | 'house-hunting'
  | 'negotiation'
  | 'underwriting'
  | 'closing'
  | 'post-closing'

export interface PlanYourJourneyStep {
  id: number
  title: string
  duration: string
  color: string
  borderColor: string
  phaseId: PlanYourJourneyPhaseId
  icon: React.ComponentType<{ className?: string; size?: number }>
}

export const PLAN_YOUR_JOURNEY_STEPS: PlanYourJourneyStep[] = [
  { id: 1, title: 'Preparation & Credit', duration: '2-4 weeks', color: 'from-teal-500 to-cyan-500', borderColor: 'border-teal-500/50', phaseId: 'preparation', icon: Target },
  { id: 2, title: 'Pre-Approval', duration: '1-3 days', color: 'from-blue-500 to-cyan-500', borderColor: 'border-blue-500/50', phaseId: 'pre-approval', icon: FileText },
  { id: 3, title: 'House Hunting', duration: '2-12 weeks', color: 'from-purple-500 to-pink-500', borderColor: 'border-purple-500/50', phaseId: 'house-hunting', icon: Home },
  { id: 4, title: 'Make an Offer', duration: '1-3 days', color: 'from-green-500 to-emerald-500', borderColor: 'border-green-500/50', phaseId: 'house-hunting', icon: DollarSign },
  { id: 5, title: 'Inspection', duration: '1-2 weeks', color: 'from-orange-500 to-red-500', borderColor: 'border-orange-500/50', phaseId: 'negotiation', icon: Eye },
  { id: 6, title: 'Appraisal', duration: '1-2 weeks', color: 'from-yellow-500 to-amber-500', borderColor: 'border-yellow-500/50', phaseId: 'underwriting', icon: TrendingUp },
  { id: 7, title: 'Underwriting', duration: '2-4 weeks', color: 'from-millennial-cta-primary to-purple-500', borderColor: 'border-teal-500/50', phaseId: 'underwriting', icon: Shield },
  { id: 8, title: 'Closing', duration: '1 day', color: 'from-green-600 to-emerald-600', borderColor: 'border-green-600/50', phaseId: 'closing', icon: CheckCircle },
  {
    id: 9,
    title: 'Post-Closing & Beyond',
    duration: 'Ongoing',
    color: 'from-emerald-600 to-green-700',
    borderColor: 'border-emerald-600/50',
    phaseId: 'post-closing',
    icon: ShieldCheck,
  },
]
