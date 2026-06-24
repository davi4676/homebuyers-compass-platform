'use client'

import Link from 'next/link'
import { Award, X, Printer } from 'lucide-react'
import CertificateShareButton from '@/components/journey/CertificateShareButton'
import {
  dismissPhaseCertificateModal,
  getPhaseCertificateTitle,
  phaseOrderToCertificateSlug,
} from '@/lib/phase-certificates'
import { trackActivity } from '@/lib/track-activity'

type PhaseCertificateModalProps = {
  phaseOrder: number
  userName?: string | null
  onClose: () => void
}

export default function PhaseCertificateModal({
  phaseOrder,
  userName,
  onClose,
}: PhaseCertificateModalProps) {
  const slug = phaseOrderToCertificateSlug(phaseOrder)
  if (!slug) return null

  const title = getPhaseCertificateTitle(slug)
  const displayName = userName?.trim() || 'NestQuest Buyer'

  const handleClose = () => {
    dismissPhaseCertificateModal(phaseOrder)
    onClose()
  }

  const handlePrint = () => {
    trackActivity('tool_used', { tool: 'phase_certificate_view', phaseOrder, slug })
  }

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="phase-cert-modal-title"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="text-center">
          <Award className="mx-auto h-12 w-12 text-amber-500" aria-hidden />
          <h2 id="phase-cert-modal-title" className="mt-3 font-display text-xl font-bold text-slate-900">
            Phase complete!
          </h2>
          <p className="mt-2 text-sm text-slate-600">{title}</p>
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
            Congratulations, <strong>{displayName}</strong> — you finished another milestone on your homebuying journey.
          </p>
          <p className="mt-3 text-xs text-slate-500">
            For personal progress tracking only. Not a HUD counseling certificate or lender approval.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href={`/certificate/${slug}`}
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
            >
              <Printer className="h-4 w-4" aria-hidden />
              View &amp; print certificate
            </Link>
            <CertificateShareButton slug={slug} title={title} />
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Keep going
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
