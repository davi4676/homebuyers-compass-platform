'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Copy, Check, Gift } from 'lucide-react'
import {
  REFERRAL_PROGRAM_HEADLINE,
  referralProgramUrl,
} from '@/lib/referral-program'

export type ReferralProgramMilestone = 'quiz' | 'preapproval' | 'phase7'

const MILESTONE_COPY: Record<
  ReferralProgramMilestone,
  { title: string; description?: string }
> = {
  quiz: {
    title: 'Nice work on your plan',
    description: 'Share NestQuest with a friend whenever you’re ready.',
  },
  preapproval: {
    title: 'Pre-approval phase complete',
    description: 'You’re officially ahead of most shoppers — pass the savings on.',
  },
  phase7: {
    title: 'You’ve wrapped Post-Closing',
    description: 'One last milestone before the Homeowner Hub — invite a friend and stack the reward.',
  },
}

export default function ReferralProgramModal({
  open,
  onClose,
  referralSlug,
  milestone,
  storageKeyOnDismiss,
}: {
  open: boolean
  onClose: () => void
  referralSlug: string
  milestone: ReferralProgramMilestone
  /** Persist “seen” so we don’t re-open for this milestone. */
  storageKeyOnDismiss: string
}) {
  const url = referralProgramUrl(referralSlug)
  const [copied, setCopied] = useState(false)
  const milestoneText = MILESTONE_COPY[milestone]

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(storageKeyOnDismiss, '1')
    } catch {
      /* ignore */
    }
    onClose()
  }, [onClose, storageKeyOnDismiss])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, dismiss])

  useEffect(() => {
    if (!open) setCopied(false)
  }, [open])

  const copy = useCallback(() => {
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [url])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
          aria-hidden={!open}
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"
            aria-label="Close dialog"
            onClick={dismiss}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="referral-modal-title"
            aria-describedby="referral-modal-desc"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-teal-200/90 bg-white shadow-2xl shadow-teal-900/15"
          >
            <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 px-5 py-4 text-white sm:px-6 sm:py-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <Gift className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p
                      id="referral-modal-title"
                      className="text-xs font-semibold uppercase tracking-wide text-teal-100"
                    >
                      {milestoneText.title}
                    </p>
                    <p className="mt-1 text-lg font-bold leading-snug sm:text-xl">{REFERRAL_PROGRAM_HEADLINE}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={dismiss}
                  className="shrink-0 rounded-lg p-1.5 text-white/90 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="space-y-4 px-5 py-5 sm:px-6">
              {milestoneText.description ? (
                <p id="referral-modal-desc" className="text-sm text-slate-600">
                  {milestoneText.description}
                </p>
              ) : (
                <span id="referral-modal-desc" className="sr-only">
                  {REFERRAL_PROGRAM_HEADLINE}
                </span>
              )}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <code className="min-w-0 flex-1 truncate rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 sm:text-sm">
                  {url}
                </code>
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied' : 'Copy link'}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Credits apply at checkout when your friend subscribes — prototype demo link.
              </p>
              <button
                type="button"
                onClick={dismiss}
                className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
