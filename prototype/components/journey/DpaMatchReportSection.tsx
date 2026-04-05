'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import BlurredPreview from '@/components/revenue/BlurredPreview'
import { trackRevenueEvent } from '@/lib/revenueTracking'
import {
  DPA_MATCH_REPORT_PROGRAMS,
  DPA_REPORT_PURCHASED_LS_KEY,
  programTypeBadgeClass,
  type DpaReportProgram,
} from '@/lib/dpa-match-report-data'
import { tierAtLeast, type UserTier } from '@/lib/tiers'

const DPA_SUCCESS_TRACKED_SS_KEY = 'nq_dpa_purchase_tracked_session'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildPrintableReportHtml(programs: DpaReportProgram[]): string {
  const rows = programs
    .map(
      (p) => `
    <section style="margin-bottom:1.25rem;page-break-inside:avoid;border:1px solid #e5e7eb;border-radius:8px;padding:12px;">
      <h2 style="margin:0 0 4px;font-size:16px;">${escapeHtml(p.name)}</h2>
      <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0d9488;">${escapeHtml(p.awardAmount)}</p>
      <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">${escapeHtml(p.incomeDescription)}</p>
      <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">${escapeHtml(p.locationDescription)}</p>
      <p style="margin:0 0 6px;font-size:12px;font-weight:600;">How to apply</p>
      <ol style="margin:0;padding-left:18px;font-size:12px;color:#374151;">
        ${p.howToApplySteps.map((s) => `<li style="margin-bottom:4px;">${escapeHtml(s)}</li>`).join('')}
      </ol>
      <p style="margin:8px 0 0;font-size:11px;"><a href="${escapeHtml(p.applyUrl)}">Apply link</a></p>
    </section>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>NestQuest — DPA Match Report</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 640px; margin: 24px auto; padding: 0 16px; color: #111; }
    h1 { font-size: 22px; margin-bottom: 8px; }
    .meta { font-size: 12px; color: #6b7280; margin-bottom: 20px; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>DPA Match Report</h1>
  <p class="meta">NestQuest · Generated ${escapeHtml(new Date().toLocaleDateString())}</p>
  ${rows}
</body>
</html>`
}

export default function DpaMatchReportSection({ userTier }: { userTier: UserTier }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isPaidTier = tierAtLeast(userTier, 'momentum')

  const [purchased, setPurchased] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const bannerViewed = useRef(false)

  useEffect(() => {
    if (bannerViewed.current) return
    bannerViewed.current = true
    trackRevenueEvent('dpa_report', 'banner_viewed')
  }, [])

  useEffect(() => {
    try {
      if (localStorage.getItem(DPA_REPORT_PURCHASED_LS_KEY) === 'true') {
        setPurchased(true)
      }
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (searchParams.get('dpa_report') !== 'success') return

    try {
      localStorage.setItem(DPA_REPORT_PURCHASED_LS_KEY, 'true')
      if (sessionStorage.getItem(DPA_SUCCESS_TRACKED_SS_KEY) !== '1') {
        sessionStorage.setItem(DPA_SUCCESS_TRACKED_SS_KEY, '1')
        trackRevenueEvent('dpa_report', 'purchased', 19)
      }
    } catch {
      /* ignore */
    }

    setPurchased(true)
    setToast('🎉 Your DPA Match Report is ready!')

    const next = `${pathname ?? '/customized-journey'}?tab=assistance`
    router.replace(next, { scroll: false })
  }, [searchParams, router, pathname])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 6000)
    return () => window.clearTimeout(t)
  }, [toast])

  const showFull = isPaidTier || purchased

  const startCheckout = useCallback(async () => {
    trackRevenueEvent('dpa_report', 'cta_clicked')
    setCheckoutError(null)
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/checkout/dpa-report', { method: 'POST' })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Could not start checkout')
      }
      trackRevenueEvent('dpa_report', 'checkout_initiated')
      window.location.assign(data.url)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Checkout failed'
      setCheckoutError(msg)
      setCheckoutLoading(false)
    }
  }, [])

  const handlePdfDownload = useCallback(() => {
    trackRevenueEvent('dpa_report', 'pdf_downloaded')
    const html = buildPrintableReportHtml(DPA_MATCH_REPORT_PROGRAMS)
    const w = window.open('', '_blank', 'noopener,noreferrer')
    if (!w) return
    w.document.open()
    w.document.write(html)
    w.document.close()
    w.focus()
    const closeLater = () => {
      try {
        w.print()
      } finally {
        window.setTimeout(() => w.close(), 300)
      }
    }
    if (w.document.readyState === 'complete') closeLater()
    else w.onload = closeLater
  }, [])

  return (
    <section className="space-y-6" aria-labelledby="dpa-match-report-heading">
      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[90] max-w-md -translate-x-1/2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-900 shadow-lg"
        >
          {toast}
        </div>
      ) : null}

      {!showFull ? (
        <>
          <div
            className="overflow-hidden rounded-2xl p-6 text-white shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
            }}
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-center">
              <div>
                <p className="text-xs font-semibold tracking-widest text-teal-100">
                  PERSONALIZED REPORT
                </p>
                <h2
                  id="dpa-match-report-heading"
                  className="mt-2 text-2xl font-bold text-white"
                >
                  You may qualify for up to $24,500 in assistance
                </h2>
                <p className="mt-2 text-sm text-teal-100">
                  Get every DPA program you qualify for — with application links, income limits, and step-by-step
                  guidance.
                </p>
                <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-3xl font-bold text-white">$19 one-time</span>
                  <span className="text-xs text-teal-200">• Instant delivery • PDF included</span>
                </div>
                <button
                  type="button"
                  disabled={checkoutLoading}
                  onClick={() => void startCheckout()}
                  className="mt-4 w-full rounded-xl bg-white px-6 py-3 font-semibold text-teal-700 shadow-md transition-colors hover:bg-teal-50 disabled:opacity-60 sm:w-auto"
                >
                  {checkoutLoading ? 'Redirecting…' : 'Get My Full Report →'}
                </button>
                <p className="mt-3 text-xs italic text-teal-200">
                  Included free in Momentum &amp; Navigator plans
                </p>
                {checkoutError ? (
                  <p className="mt-2 text-sm font-medium text-amber-100">{checkoutError}</p>
                ) : null}
              </div>

              <div className="hidden md:block">
                <div className="rounded-2xl bg-white p-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-gray-100 py-2.5">
                    <span className="text-sm font-medium text-gray-800">HomeFirst DPA Program</span>
                    <span className="text-sm font-bold text-teal-600">$40,000</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-100 py-2.5">
                    <span className="text-sm font-medium text-gray-800">State HFA Grant</span>
                    <span className="text-sm font-bold text-teal-600">$15,000</span>
                  </div>
                  <div className="relative flex items-center justify-between py-2.5">
                    <span className="text-sm font-medium text-gray-800">CSDP Community Fund</span>
                    <span
                      className="select-none text-sm font-bold text-gray-700"
                      style={{ filter: 'blur(5px)' }}
                      aria-hidden
                    >
                      $24,500
                    </span>
                    <span className="absolute bottom-1 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold text-teal-800 shadow-md">
                      🔒 Unlock Full Report
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Preview: Programs You May Qualify For
            </h3>
            <div className="mt-3">
              <BlurredPreview
                items={[
                  { label: 'HomeFirst DPA', value: '$40,000' },
                  { label: 'State HFA Grant', value: '$15,000' },
                  { label: 'CSDP Community Fund', value: '$24,500' },
                ]}
                unlockCta="Unlock your full personalized report"
                unlockPrice="$19 one-time"
                unlockBusy={checkoutLoading}
                onUnlock={() => void startCheckout()}
              />
            </div>
            {checkoutError ? (
              <p className="mt-2 text-sm text-red-600 md:hidden">{checkoutError}</p>
            ) : null}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <h3 id="dpa-match-report-heading" className="text-lg font-semibold text-gray-900">
                Your DPA Match Report
              </h3>
              {isPaidTier ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  Included in your plan ✓
                </span>
              ) : (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  ✓ Purchased
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handlePdfDownload}
              className="w-full shrink-0 rounded-xl border-2 border-teal-600 bg-transparent px-4 py-2.5 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-50 sm:w-auto"
            >
              Download PDF
            </button>
          </div>

          <ul className="space-y-4">
            {DPA_MATCH_REPORT_PROGRAMS.map((p) => (
              <li
                key={p.name}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    <span
                      className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${programTypeBadgeClass(p.programType)}`}
                    >
                      {p.programType}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-teal-600">{p.awardAmount}</p>
                </div>
                <p className="mt-3 text-sm text-gray-500">{p.incomeDescription}</p>
                <p className="text-sm text-gray-500">{p.locationDescription}</p>
                <a
                  href={p.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl border-2 border-teal-600 px-4 py-2.5 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-50 sm:w-auto"
                >
                  Apply Now →
                </a>
                <details className="group mt-3 rounded-lg border border-gray-200">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium text-teal-700 hover:bg-teal-50/50 [&::-webkit-details-marker]:hidden">
                    How to Apply
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <ol className="list-decimal space-y-2 border-t border-gray-100 px-6 py-3 text-sm text-gray-600">
                    {p.howToApplySteps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </details>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
