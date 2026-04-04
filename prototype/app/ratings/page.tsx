'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'

function StarRow({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1" role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="rounded p-0.5 transition hover:scale-110"
          aria-label={`${n} stars`}
        >
          <Star
            className={`h-8 w-8 ${n <= value ? 'fill-[#f59e0b] text-[#f59e0b]' : 'text-[#e7e5e4]'}`}
            strokeWidth={n <= value ? 0 : 1.5}
          />
        </button>
      ))}
    </div>
  )
}

export default function RatingsPage() {
  const [agentStars, setAgentStars] = useState(0)
  const [agentText, setAgentText] = useState('')
  const [lenderStars, setLenderStars] = useState(0)
  const [lenderText, setLenderText] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const toastify = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 3200)
  }

  return (
    <div className="app-page-shell">
      <header className="sticky top-0 z-10 border-b border-[#e7e5e4] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-4">
          <BackToMyJourneyLink />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-[#1c1917]">Rate Your NestQuest Experience</h1>
        <p className="mt-2 text-[#57534e]">Share feedback on the professionals supporting your journey.</p>

        <section className="mt-10 rounded-xl border border-[#e7e5e4] bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold text-[#1c1917]">Rate Your Agent</h2>
          <p className="mt-1 text-sm text-[#57534e]">How satisfied were you with communication and guidance?</p>
          <div className="mt-4">
            <StarRow value={agentStars} onChange={setAgentStars} />
          </div>
          <label htmlFor="agent-review" className="mt-4 block text-sm font-semibold text-[#57534e]">
            Written review (optional)
          </label>
          <textarea
            id="agent-review"
            value={agentText}
            onChange={(e) => setAgentText(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-[#e7e5e4] px-3 py-2 text-[#1c1917] outline-none focus:ring-2 focus:ring-[#0d9488]/40"
            placeholder="What stood out?"
          />
          <button
            type="button"
            onClick={() => toastify('Thank you! Your review has been submitted.')}
            className="mt-4 rounded-xl bg-[#1a6b3c] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#155c33]"
          >
            Submit agent review
          </button>
        </section>

        <section className="mt-8 rounded-xl border border-[#e7e5e4] bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold text-[#1c1917]">Rate Your Lender</h2>
          <p className="mt-1 text-sm text-[#57534e]">Rate clarity of fees, responsiveness, and closing experience.</p>
          <div className="mt-4">
            <StarRow value={lenderStars} onChange={setLenderStars} />
          </div>
          <label htmlFor="lender-review" className="mt-4 block text-sm font-semibold text-[#57534e]">
            Written review (optional)
          </label>
          <textarea
            id="lender-review"
            value={lenderText}
            onChange={(e) => setLenderText(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-[#e7e5e4] px-3 py-2 text-[#1c1917] outline-none focus:ring-2 focus:ring-[#0d9488]/40"
            placeholder="What would you tell another buyer?"
          />
          <button
            type="button"
            onClick={() => toastify('Thank you! Your review has been submitted.')}
            className="mt-4 rounded-xl bg-[#1a6b3c] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#155c33]"
          >
            Submit lender review
          </button>
        </section>

        <section className="mt-8 rounded-xl border border-dashed border-[#e7e5e4] bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold text-[#1c1917]">Your Reviews</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#57534e]">
            Your reviews will appear here after you close on your home. Reviews help other buyers find trusted
            professionals.
          </p>
        </section>

        {toast ? (
          <div
            className="fixed bottom-6 left-1/2 z-50 max-w-sm -translate-x-1/2 rounded-xl border border-[#e7e5e4] bg-white px-4 py-3 text-sm font-medium text-[#1c1917] shadow-lg"
            role="status"
          >
            {toast}
          </div>
        ) : null}
      </main>
    </div>
  )
}
