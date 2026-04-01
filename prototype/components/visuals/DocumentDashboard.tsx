'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, CheckCircle, AlertTriangle, Upload, Eye, X } from 'lucide-react'

interface Document {
  id: string
  name: string
  category: 'income' | 'assets' | 'identity' | 'property' | 'other'
  status: 'missing' | 'uploaded' | 'verified' | 'needs-review'
  uploadedDate?: string
  issues?: string[]
}

interface DocumentDashboardProps {
  documents: Document[]
  onUpload?: (id: string, file: File) => void
  onView?: (id: string) => void
  showAIReview?: boolean
}

export default function DocumentDashboard({
  documents,
  onUpload,
  onView,
  showAIReview = false,
}: DocumentDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = [
    { id: 'income', label: 'Income', icon: '💰', color: 'from-blue-500 to-cyan-500' },
    { id: 'assets', label: 'Assets', icon: '💵', color: 'from-green-500 to-emerald-500' },
    { id: 'identity', label: 'Identity', icon: '🆔', color: 'from-purple-500 to-pink-500' },
    { id: 'property', label: 'Property', icon: '🏠', color: 'from-orange-500 to-red-500' },
    { id: 'other', label: 'Other', icon: '📄', color: 'from-gray-500 to-gray-600' },
  ]

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-[#50C878]" />
      case 'uploaded':
        return <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
      case 'needs-review':
        return <AlertTriangle className="w-5 h-5 text-[#FFBF00]" />
      default:
        return <FileText className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'verified':
        return 'border-[#50C878] bg-[#50C878]/10'
      case 'uploaded':
        return 'border-[#D4AF37] bg-[#D4AF37]/10'
      case 'needs-review':
        return 'border-[#FFBF00] bg-[#FFBF00]/10'
      default:
        return 'border-gray-700 bg-gray-800/50'
    }
  }

  const filteredDocs = selectedCategory
    ? documents.filter((doc) => doc.category === selectedCategory)
    : documents

  const categoryProgress = categories.map((cat) => {
    const catDocs = documents.filter((doc) => doc.category === cat.id)
    const verified = catDocs.filter((doc) => doc.status === 'verified').length
    return {
      ...cat,
      total: catDocs.length,
      verified,
      progress: catDocs.length > 0 ? (verified / catDocs.length) * 100 : 0,
    }
  })

  const overallProgress =
    documents.length > 0
      ? (documents.filter((doc) => doc.status === 'verified').length / documents.length) * 100
      : 0

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-2xl border border-[#50C878]/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Document Dashboard</h2>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#50C878]">{Math.round(overallProgress)}%</div>
            <div className="text-sm text-gray-400">Complete</div>
          </div>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 1 }}
            className="h-full bg-gradient-to-r from-[#50C878] to-[#228B22]"
          />
        </div>
      </div>

      {/* Category Progress */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categoryProgress.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedCategory === cat.id
                ? 'border-[#50C878] bg-[#50C878]/20'
                : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
            }`}
          >
            <div className="text-3xl mb-2">{cat.icon}</div>
            <div className="text-sm font-semibold mb-1">{cat.label}</div>
            <div className="text-xs text-gray-400">
              {cat.verified}/{cat.total} verified
            </div>
            <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#50C878] to-[#228B22]"
                style={{ width: `${cat.progress}%` }}
              />
            </div>
          </button>
        ))}
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {filteredDocs.map((doc) => {
          const category = categories.find((c) => c.id === doc.category)
          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border-2 ${getStatusColor(doc.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(doc.status)}
                  <div className="flex-1">
                    <div className="font-semibold text-white">{doc.name}</div>
                    <div className="text-xs text-gray-400">
                      {category?.label} • {doc.status.replace('-', ' ')}
                    </div>
                    {doc.issues && doc.issues.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {doc.issues.map((issue, idx) => (
                          <div key={idx} className="text-xs text-[#FFBF00] flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {issue}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.status === 'missing' && onUpload && (
                    <label className="px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] transition-colors text-white text-sm font-semibold cursor-pointer">
                      <Upload className="w-4 h-4 inline mr-1" />
                      Upload
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) onUpload(doc.id, file)
                        }}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </label>
                  )}
                  {doc.status !== 'missing' && onView && (
                    <button
                      onClick={() => onView(doc.id)}
                      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                    >
                      <Eye className="w-4 h-4 text-gray-300" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* AI Review Feature */}
      {showAIReview && (
        <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-[#06b6d4]/20 to-[#22d3ee]/20 border border-[#06b6d4]/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[#06b6d4] mb-1">
                🏆 Pro Feature: AI Document Pre-Scanner
              </h3>
              <p className="text-sm text-gray-300">
                Upload your documents and our AI will check for common issues before
                submission.
              </p>
            </div>
            <button className="px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] transition-colors text-white font-semibold text-sm">
              Scan All Documents
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
