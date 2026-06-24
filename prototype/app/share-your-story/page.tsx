'use client'

import { useState } from 'react'
import Link from 'next/link'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'
import EmailPrivacyNotice from '@/components/trust/EmailPrivacyNotice'

export default function ShareYourStoryPage() {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [quote, setQuote] = useState('')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, location, quote, email: email || undefined, consent }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string; message?: string }
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Something went wrong')
        return
      }
      setDone(true)
    } catch {
      setError('Could not submit — try again later')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="app-page-shell">
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <BackToMyJourneyLink />
        <h1 className="mt-6 font-display text-3xl font-bold text-[var(--nq-ed-text)]">Share your story</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--nq-ed-muted)]">
          Real buyer experiences help others feel less alone. We review every submission before featuring it — no paid
          endorsements.
        </p>

        {done ? (
          <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
            <p className="font-semibold">Thank you!</p>
            <p className="mt-1">We will email you if we feature your story on the site.</p>
            <Link href="/" className="mt-4 inline-block font-semibold text-teal-800 hover:underline">
              Back to home
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="story-name" className="block text-sm font-semibold text-[var(--nq-ed-text)]">
                First name or initials
              </label>
              <input
                id="story-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-[var(--nq-ed-line-soft)] px-4 py-3 text-sm"
                placeholder="Maria C."
              />
            </div>
            <div>
              <label htmlFor="story-location" className="block text-sm font-semibold text-[var(--nq-ed-text)]">
                City &amp; state
              </label>
              <input
                id="story-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-[var(--nq-ed-line-soft)] px-4 py-3 text-sm"
                placeholder="Phoenix, AZ"
              />
            </div>
            <div>
              <label htmlFor="story-quote" className="block text-sm font-semibold text-[var(--nq-ed-text)]">
                Your experience (2–4 sentences)
              </label>
              <textarea
                id="story-quote"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                required
                minLength={20}
                maxLength={600}
                rows={5}
                className="mt-1 w-full rounded-xl border border-[var(--nq-ed-line-soft)] px-4 py-3 text-sm"
                placeholder="What helped you most on NestQuest?"
              />
            </div>
            <div>
              <label htmlFor="story-email" className="block text-sm font-semibold text-[var(--nq-ed-text)]">
                Email (optional — if we feature you)
              </label>
              <input
                id="story-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--nq-ed-line-soft)] px-4 py-3 text-sm"
              />
              <EmailPrivacyNotice className="mt-2" />
            </div>
            <label className="flex items-start gap-2 text-sm text-[var(--nq-ed-muted)]">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
                className="mt-1"
              />
              <span>
                I consent to NestQuest displaying my first name/initials, city, and quote on the website. I confirm this
                is my honest experience.
              </span>
            </label>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-teal-700 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Submit story'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
