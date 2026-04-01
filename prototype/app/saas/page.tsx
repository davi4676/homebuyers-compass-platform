'use client'

import Link from 'next/link'
import { Bot, BookOpen, BarChart3 } from 'lucide-react'

export default function SaasDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          href="/saas/chatbots"
          className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-cyan-500/50 transition-colors"
        >
          <Bot className="w-8 h-8 text-cyan-400 mb-3" />
          <h2 className="font-semibold text-stone-900 mb-1">Chatbots</h2>
          <p className="text-sm text-stone-500">Create and manage chatbots</p>
        </Link>
        <Link
          href="/saas/knowledge"
          className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-cyan-500/50 transition-colors"
        >
          <BookOpen className="w-8 h-8 text-cyan-400 mb-3" />
          <h2 className="font-semibold text-stone-900 mb-1">Knowledge Base</h2>
          <p className="text-sm text-stone-500">Upload docs and RAG training</p>
        </Link>
        <Link
          href="/analytics-dashboard"
          className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-cyan-500/50 transition-colors"
        >
          <BarChart3 className="w-8 h-8 text-cyan-400 mb-3" />
          <h2 className="font-semibold text-stone-900 mb-1">Analytics</h2>
          <p className="text-sm text-stone-500">View analytics dashboard</p>
        </Link>
      </div>
    </div>
  )
}
