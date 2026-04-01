'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, CheckCircle, FileText, AlertCircle } from 'lucide-react'
import type { Campaign } from './csdp-types'

interface ComplianceDashboardProps {
  campaign: Campaign | Partial<Campaign> | null
}

const COMPLIANCE_ITEMS = [
  { id: 'identity', label: 'Identity verification', description: 'Government ID and address verified' },
  { id: 'documents', label: 'Document submission', description: 'Income and employment docs submitted' },
  { id: 'terms', label: 'Terms & disclosures', description: 'CSDP terms and regulatory disclosures accepted' },
]

export default function ComplianceDashboard({ campaign }: ComplianceDashboardProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const compliance = campaign?.complianceStatus ?? {
    identityVerified: false,
    documentsSubmitted: false,
    termsAccepted: false,
  }

  const items = [
    { ...COMPLIANCE_ITEMS[0], done: compliance.identityVerified },
    { ...COMPLIANCE_ITEMS[1], done: compliance.documentsSubmitted },
    { ...COMPLIANCE_ITEMS[2], done: compliance.termsAccepted || acceptedTerms },
  ]
  const completed = items.filter((i) => i.done).length
  const allComplete = completed === items.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-700 bg-gray-900/50 p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-[#06b6d4]" />
        <h2 className="text-2xl font-bold text-white">Compliance Dashboard</h2>
      </div>
      <p className="text-gray-400 mb-6">
        Stay compliant with SEC, FINRA, and state rules. Complete each step before accepting
        contributions.
      </p>

      {campaign && (
        <div className="mb-6 p-4 rounded-lg bg-gray-800/50 border border-gray-700">
          <p className="text-sm text-gray-500">Campaign</p>
          <p className="font-semibold text-white">{campaign.campaignName ?? 'Campaign'}</p>
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Compliance progress</span>
          <span className="text-white font-medium">{completed} / {items.length}</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completed / items.length) * 100}%` }}
            transition={{ duration: 0.4 }}
            className="h-full bg-[#06b6d4] rounded-full"
          />
        </div>
      </div>

      <ul className="space-y-4 mb-6">
        {items.map((item) => (
          <li
            key={item.id}
            className={`flex items-start gap-4 p-4 rounded-lg border ${
              item.done ? 'bg-green-500/5 border-green-500/30' : 'bg-gray-800/50 border-gray-700'
            }`}
          >
            {item.done ? (
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold text-white">{item.label}</p>
              <p className="text-sm text-gray-400">{item.description}</p>
              {item.id === 'terms' && !item.done && (
                <button
                  type="button"
                  onClick={() => setAcceptedTerms(true)}
                  className="mt-2 text-sm text-[#06b6d4] hover:underline"
                >
                  I accept terms & disclosures
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/30 p-4 flex items-start gap-3">
        <FileText className="w-5 h-5 text-[#06b6d4] flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-300">
          <p className="font-semibold text-white mb-1">Regulatory note</p>
          <p>
            Crowdsourced down payment programs must comply with securities and lending regulations.
            This dashboard helps you track required verification and disclosures. Consult a
            licensed professional for your situation.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
