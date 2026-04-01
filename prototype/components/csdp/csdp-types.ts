/**
 * Shared types for Crowdsourced Down Payment (CSDP) platform components
 */

export interface FundingModel {
  id: string
  name: string
  description?: string
  maxAmount?: number
}

export interface CampaignContribution {
  id: string
  contributorName: string
  amount: number
  status: 'pledged' | 'received' | 'verified'
  date: string
}

export interface Campaign {
  id?: string
  fundingModel: FundingModel
  campaignName: string
  targetAmount: number
  timeline: string
  status: 'draft' | 'active' | 'funded' | 'closed'
  createdAt?: string
  shareLink?: string
  contributions?: CampaignContribution[]
  complianceStatus?: {
    identityVerified: boolean
    documentsSubmitted: boolean
    termsAccepted: boolean
  }
}
