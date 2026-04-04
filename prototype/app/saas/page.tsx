'use client'

import Link from 'next/link'
import { Bot, BookOpen, BarChart3 } from 'lucide-react'

export default function SaasDashboardPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-2 text-stone-900">Dashboard</h1>
      <p className="text-sm text-stone-500 mb-6">Manage chatbots, knowledge, and tenant analytics.</p>
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          href="/saas/chatbots"
          className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-cyan-500/50 transition-colors"
        >
          <Bot className="w-8 h-8 text-cyan-500 mb-3" />
          <h2 className="font-semibold text-stone-900 mb-1">Chatbots</h2>
          <p className="text-sm text-stone-500">Create and manage chatbots</p>
        </Link>
        <Link
          href="/saas/knowledge-base"
          className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-cyan-500/50 transition-colors"
        >
          <BookOpen className="w-8 h-8 text-cyan-500 mb-3" />
          <h2 className="font-semibold text-stone-900 mb-1">Knowledge Base</h2>
          <p className="text-sm text-stone-500">Articles and help content</p>
        </Link>
        <Link
          href="/saas/analytics"
          className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-cyan-500/50 transition-colors"
        >
          <BarChart3 className="w-8 h-8 text-cyan-500 mb-3" />
          <h2 className="font-semibold text-stone-900 mb-1">Analytics</h2>
          <p className="text-sm text-stone-500">Usage and conversion metrics</p>
        </Link>
      </div>
    </div>
  )
}
