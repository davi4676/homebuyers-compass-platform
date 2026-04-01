'use client'

import { motion } from 'framer-motion'
import { Heart, Building2, Zap, CheckCircle, ArrowRight } from 'lucide-react'
import type { FundingModel } from './csdp-types'

interface FundingModelSelectorProps {
  onSelect: (model: FundingModel) => void
}

const MODELS: FundingModel[] = [
  {
    id: 'social-contribution',
    name: 'Social Contribution',
    description: 'Gift-with-benefits, micro-loans ($100–$5,000), employer matching',
    maxAmount: 15000,
  },
  {
    id: 'community-investment',
    name: 'Community Investment',
    description: 'Revenue sharing notes, neighborhood funds, pay-it-forward',
    maxAmount: 50000,
  },
  {
    id: 'hybrid',
    name: 'Hybrid',
    description: 'Rent-to-equity, skill-based exchange, future value sharing',
    maxAmount: 25000,
  },
]

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'social-contribution': Heart,
  'community-investment': Building2,
  hybrid: Zap,
}

export default function FundingModelSelector({ onSelect }: FundingModelSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-700 bg-gray-900/50 p-8"
    >
      <h2 className="text-2xl font-bold text-white mb-2">Choose Your Funding Model</h2>
      <p className="text-gray-400 mb-6">
        Select how you want to structure your crowdsourced down payment campaign.
      </p>
      <div className="grid md:grid-cols-3 gap-4">
        {MODELS.map((model, idx) => {
          const Icon = ICONS[model.id] ?? Zap
          return (
            <motion.button
              key={model.id}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              onClick={() => onSelect(model)}
              className="text-left rounded-xl border-2 border-gray-700 bg-gray-800/50 p-6 hover:border-[#06b6d4] hover:bg-gray-800 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-[#06b6d4]/20 text-[#06b6d4] group-hover:bg-[#06b6d4]/30">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">{model.name}</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">{model.description}</p>
              {model.maxAmount != null && (
                <p className="text-xs text-gray-500 mb-4">
                  Up to ${model.maxAmount.toLocaleString()} (tier-dependent)
                </p>
              )}
              <span className="inline-flex items-center gap-1 text-sm font-medium text-[#06b6d4] group-hover:gap-2 transition-all">
                Select <ArrowRight className="w-4 h-4" />
              </span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
