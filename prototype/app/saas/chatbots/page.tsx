'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bot, ArrowLeft } from 'lucide-react'

const SAMPLE_BOTS = [
  {
    id: 'sample-ftb',
    name: 'First-Time Buyer Bot',
    status: 'Active' as const,
    conversations: 847,
  },
  {
    id: 'sample-faq',
    name: 'Mortgage FAQ Bot',
    status: 'Draft' as const,
    conversations: 0,
  },
]

export default function ChatbotsPage() {
  const [toast, setToast] = useState<string | null>(null)

  return (
    <div>
      <Link
        href="/saas"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold text-stone-900">Chatbots</h1>
        <button
          type="button"
          onClick={() => {
            setToast('New bots are created in your tenant console in production; this demo keeps sample bots only.')
            window.setTimeout(() => setToast(null), 3000)
          }}
          className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
        >
          Create New Bot
        </button>
      </div>

      <ul className="grid gap-4 md:grid-cols-2">
        {SAMPLE_BOTS.map((cb) => (
          <li key={cb.id}>
            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <Bot className="h-8 w-8 shrink-0 text-teal-600" aria-hidden />
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-stone-900">{cb.name}</h2>
                  <p className="mt-2 text-sm text-stone-600">
                    Status:{' '}
                    <span className={cb.status === 'Active' ? 'font-semibold text-emerald-700' : 'font-semibold text-amber-700'}>
                      {cb.status}
                    </span>
                    {' · '}
                    <span className="text-stone-500">{cb.conversations} conversations this month</span>
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {toast ? (
        <div
          className="fixed bottom-6 left-1/2 z-50 max-w-sm -translate-x-1/2 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-900 shadow-lg"
          role="status"
        >
          {toast}
        </div>
      ) : null}
    </div>
  )
}
