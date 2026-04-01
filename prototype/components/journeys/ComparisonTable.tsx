'use client'

import { motion } from 'framer-motion'

export interface ComparisonRow {
  label: string
  current?: string | number
  new?: string | number
  highlight?: 'savings' | 'cost' | 'neutral'
}

interface ComparisonTableProps {
  title?: string
  rows: ComparisonRow[]
  currentLabel?: string
  newLabel?: string
  className?: string
}

export default function ComparisonTable({
  title,
  rows,
  currentLabel = 'Current',
  newLabel = 'New',
  className = '',
}: ComparisonTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm ${className}`}
    >
      {title && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" role="table">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/80">
              <th scope="col" className="px-4 py-3 font-semibold text-gray-700 w-1/3">
                Metric
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-gray-700 text-right">
                {currentLabel}
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-gray-700 text-right">
                {newLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
              >
                <td className="px-4 py-3 text-gray-700">{row.label}</td>
                <td className="px-4 py-3 text-right tabular-nums text-gray-600">
                  {row.current ?? '—'}
                </td>
                <td
                  className={`px-4 py-3 text-right tabular-nums font-medium ${
                    row.highlight === 'savings' ? 'text-green-600' : ''
                  } ${row.highlight === 'cost' ? 'text-red-600' : ''} ${
                    row.highlight === 'neutral' ? 'text-blue-600' : 'text-gray-900'
                  }`}
                >
                  {row.new ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
