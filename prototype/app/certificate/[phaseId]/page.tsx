'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'
import CertificateShareButton from '@/components/journey/CertificateShareButton'
import {
  PHASE_CERTIFICATE_ORDER,
  PHASE_CERTIFICATE_SLUGS,
  getPhaseCertificateTitle,
  type PhaseCertificateSlug,
} from '@/lib/phase-certificates'

type PageProps = {
  params: { phaseId: string }
}

export default function PhaseCertificatePage({ params }: PageProps) {
  const slug = params.phaseId as PhaseCertificateSlug
  const valid = PHASE_CERTIFICATE_SLUGS.includes(slug)
  const [userName, setUserName] = useState('NestQuest Buyer')

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const quiz = JSON.parse(localStorage.getItem('quizData') || '{}') as { firstName?: string }
      const auth = localStorage.getItem('userName')
      setUserName(quiz.firstName?.trim() || auth?.trim() || 'NestQuest Buyer')
    } catch {
      /* ignore */
    }
  }, [])

  if (!valid) notFound()

  const phaseOrder = PHASE_CERTIFICATE_ORDER[slug]
  const title = getPhaseCertificateTitle(slug)
  const dateStr = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .cert-sheet {
            box-shadow: none !important;
            border: 2px solid #0f766e !important;
          }
        }
      `}</style>
      <div className="app-page-shell min-h-screen bg-slate-100 py-8 print:bg-white print:py-0">
        <div className="no-print mx-auto mb-6 max-w-2xl px-4 flex flex-wrap items-center gap-3">
          <BackToMyJourneyLink />
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-800"
          >
            Print certificate
          </button>
          <CertificateShareButton slug={slug} title={title} />
        </div>
        <div className="cert-sheet mx-auto max-w-2xl rounded-2xl border-2 border-teal-700/30 bg-gradient-to-br from-amber-50 via-white to-teal-50/40 p-8 shadow-lg sm:p-12">
          <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-teal-800">NestQuest</p>
          <h1 className="mt-4 text-center font-display text-2xl font-bold text-slate-900 sm:text-3xl">
            Certificate of Phase Completion
          </h1>
          <p className="mt-6 text-center text-lg text-slate-700">This certifies that</p>
          <p className="mt-2 text-center font-display text-3xl font-bold text-teal-800">{userName}</p>
          <p className="mt-6 text-center text-base text-slate-700">has completed</p>
          <p className="mt-2 text-center text-xl font-bold text-slate-900">{title}</p>
          <p className="mt-8 text-center text-sm text-slate-500">Date: {dateStr}</p>
          <div className="mt-10 border-t border-dashed border-teal-300/60 pt-6">
            <p className="text-center text-xs leading-relaxed text-slate-500">
              For personal progress tracking only. This is not a HUD-approved housing counseling certificate, lender
              approval, or legal document. NestQuest provides educational guidance — consult licensed professionals for
              financial and legal decisions.
            </p>
          </div>
        </div>
        <p className="no-print mx-auto mt-6 max-w-2xl px-4 text-center text-sm text-slate-600">
          <Link href="/customized-journey" className="font-semibold text-teal-700 hover:underline">
            Continue your journey →
          </Link>
        </p>
      </div>
    </>
  )
}
