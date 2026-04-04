'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, MessageSquare, Archive, CheckCircle } from 'lucide-react'
import { getLeadById, scoreBadgeClass } from '@/lib/professional-mock-leads'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'

const MSG_KEY = (id: string) => `nq_pro_lead_messages_${id}`

export default function ProfessionalLeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params?.id === 'string' ? params.id : ''
  const lead = id ? getLeadById(id) : undefined

  const [messageOpen, setMessageOpen] = useState(false)
  const [messageBody, setMessageBody] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [storedMessages, setStoredMessages] = useState<{ text: string; at: string }[]>([])

  useEffect(() => {
    if (!id || typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(MSG_KEY(id))
      if (raw) setStoredMessages(JSON.parse(raw) as { text: string; at: string }[])
    } catch {
      setStoredMessages([])
    }
  }, [id])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2800)
  }, [])

  const saveMessage = useCallback(() => {
    if (!id || !messageBody.trim()) return
    const next = [...storedMessages, { text: messageBody.trim(), at: new Date().toISOString() }]
    setStoredMessages(next)
    try {
      localStorage.setItem(MSG_KEY(id), JSON.stringify(next))
    } catch {
      // ignore
    }
    setMessageBody('')
    setMessageOpen(false)
    showToast('Message saved for this lead (demo).')
  }, [id, messageBody, storedMessages, showToast])

  if (!lead) {
    return (
      <div className="app-page-shell px-4 py-16 text-center">
        <p className="text-[#57534e]">Lead not found.</p>
        <Link href="/professional" className="mt-4 inline-block font-semibold text-[#1a6b3c] hover:underline">
          ← Back to inbox
        </Link>
      </div>
    )
  }

  const totalReadiness =
    lead.readiness.credit +
    lead.readiness.savings +
    lead.readiness.timeline +
    lead.readiness.motivation

  return (
    <div className="app-page-shell">
      <div className="border-b border-[#e7e5e4] bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/professional"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#57534e] hover:text-[#1c1917]"
            >
              <ArrowLeft className="h-4 w-4" />
              Lead Inbox
            </Link>
            <BackToMyJourneyLink className="font-semibold" />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#1c1917]">{lead.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${scoreBadgeClass(lead.score)}`}
              >
                Readiness {lead.score}
              </span>
              <span className="rounded-full bg-[#f5f5f4] px-2.5 py-0.5 text-xs font-semibold text-[#57534e]">
                {lead.buyerType}
              </span>
            </div>
          </div>
        </div>

        <section className="mt-8 rounded-xl border border-[#e7e5e4] bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-[#1c1917]">Buyer profile</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[#78716c]">Location</dt>
              <dd className="font-medium">{lead.location}</dd>
            </div>
            <div>
              <dt className="text-[#78716c]">Income range</dt>
              <dd className="font-medium">{lead.incomeRange}</dd>
            </div>
            <div>
              <dt className="text-[#78716c]">Credit score range</dt>
              <dd className="font-medium">{lead.creditRange}</dd>
            </div>
            <div>
              <dt className="text-[#78716c]">Timeline</dt>
              <dd className="font-medium">{lead.timeline}</dd>
            </div>
          </dl>
        </section>

        <section className="mt-6 rounded-xl border border-[#e7e5e4] bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-[#1c1917]">Quiz answers</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {Object.entries(lead.quizAnswers).map(([k, v]) => (
              <li key={k} className="border-b border-[#f5f5f4] pb-2 last:border-0">
                <span className="font-semibold text-[#1c1917]">{k}</span>
                <span className="text-[#57534e]"> — {v}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6 rounded-xl border border-[#e7e5e4] bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-[#1c1917]">Readiness score breakdown</h2>
          <p className="mt-1 text-sm text-[#57534e]">Total {totalReadiness}/100 (components sum to composite)</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex justify-between">
              <span>Credit</span>
              <span className="font-semibold tabular-nums">{lead.readiness.credit}/25</span>
            </li>
            <li className="flex justify-between">
              <span>Savings</span>
              <span className="font-semibold tabular-nums">{lead.readiness.savings}/25</span>
            </li>
            <li className="flex justify-between">
              <span>Timeline</span>
              <span className="font-semibold tabular-nums">{lead.readiness.timeline}/25</span>
            </li>
            <li className="flex justify-between">
              <span>Motivation</span>
              <span className="font-semibold tabular-nums">{lead.readiness.motivation}/25</span>
            </li>
          </ul>
        </section>

        <section className="mt-6 rounded-xl border border-[#e7e5e4] bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-[#1c1917]">Journey progress</h2>
          <p className="mt-2 text-sm">
            <span className="font-semibold text-[#1a6b3c]">Current phase:</span> {lead.journeyPhase}
          </p>
          <p className="mt-3 text-sm font-semibold text-[#57534e]">Tabs visited</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {lead.tabsVisited.map((t) => (
              <span key={t} className="rounded-lg bg-[#ecfdf5] px-2.5 py-1 text-xs font-medium text-[#0f766e]">
                {t}
              </span>
            ))}
          </div>
        </section>

        {storedMessages.length > 0 ? (
          <section className="mt-6 rounded-xl border border-[#e7e5e4] bg-white p-5 shadow-sm">
            <h2 className="font-display text-lg font-bold text-[#1c1917]">Saved messages (demo)</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {storedMessages.map((m, i) => (
                <li key={i} className="rounded-lg bg-[#fafaf9] px-3 py-2">
                  <p className="text-[#1c1917]">{m.text}</p>
                  <p className="text-xs text-[#78716c]">{new Date(m.at).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setMessageOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1a6b3c] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#155c33]"
          >
            <MessageSquare className="h-4 w-4" />
            Send Message
          </button>
          <button
            type="button"
            onClick={() =>
              showToast('Calendar sync is demo-only in this prototype—not connected to a real calendar.')
            }
            className="inline-flex items-center gap-2 rounded-xl border border-[#e7e5e4] bg-white px-4 py-2.5 text-sm font-semibold text-[#1c1917] shadow-sm hover:bg-[#fafaf9]"
          >
            <Calendar className="h-4 w-4" />
            Schedule Call
          </button>
          <button
            type="button"
            onClick={() => showToast('Lead marked as qualified.')}
            className="inline-flex items-center gap-2 rounded-xl border border-[#0d9488]/40 bg-[#ecfdf5] px-4 py-2.5 text-sm font-semibold text-[#0f766e] hover:bg-[#d1fae5]"
          >
            <CheckCircle className="h-4 w-4" />
            Mark as Qualified
          </button>
          <button
            type="button"
            onClick={() => {
              showToast('Lead archived.')
              router.push('/professional')
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-[#e7e5e4] bg-white px-4 py-2.5 text-sm font-semibold text-[#57534e] shadow-sm hover:bg-[#f5f5f4]"
          >
            <Archive className="h-4 w-4" />
            Archive
          </button>
        </div>
      </main>

      {messageOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="msg-title"
          onClick={() => setMessageOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-[#e7e5e4] bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="msg-title" className="font-display text-lg font-bold text-[#1c1917]">
              Message to {lead.name}
            </h2>
            <textarea
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              rows={5}
              className="mt-3 w-full rounded-lg border border-[#e7e5e4] px-3 py-2 text-sm text-[#1c1917] outline-none focus:ring-2 focus:ring-[#0d9488]/40"
              placeholder="Type your message…"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMessageOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-[#57534e] hover:bg-[#f5f5f4]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveMessage}
                className="rounded-lg bg-[#1a6b3c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#155c33]"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div
          className="fixed bottom-6 left-1/2 z-50 max-w-sm -translate-x-1/2 rounded-xl border border-[#e7e5e4] bg-white px-4 py-3 text-sm font-medium shadow-lg"
          role="status"
        >
          {toast}
        </div>
      ) : null}
    </div>
  )
}
