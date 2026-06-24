import { NQ_ROADMAP_PHASE_LINE } from '@/lib/nq-guided-steps'

/** Slug used in /certificate/[phaseId] URLs */
export type PhaseCertificateSlug =
  | 'preparation'
  | 'pre-approval'
  | 'house-hunting'
  | 'negotiation'
  | 'underwriting'
  | 'closing'
  | 'post-closing'

export const PHASE_CERTIFICATE_SLUGS: PhaseCertificateSlug[] = [
  'preparation',
  'pre-approval',
  'house-hunting',
  'negotiation',
  'underwriting',
  'closing',
  'post-closing',
]

export const PHASE_CERTIFICATE_ORDER: Record<PhaseCertificateSlug, number> = {
  preparation: 1,
  'pre-approval': 2,
  'house-hunting': 3,
  negotiation: 4,
  underwriting: 5,
  closing: 6,
  'post-closing': 7,
}

export function getPhaseCertificateTitle(slug: PhaseCertificateSlug): string {
  const order = PHASE_CERTIFICATE_ORDER[slug]
  const line = NQ_ROADMAP_PHASE_LINE[order]
  return line ? `Phase ${order} Complete: ${line}` : `Phase ${order} Complete`
}

export function phaseOrderToCertificateSlug(phaseOrder: number): PhaseCertificateSlug | null {
  const entry = Object.entries(PHASE_CERTIFICATE_ORDER).find(([, o]) => o === phaseOrder)
  return entry ? (entry[0] as PhaseCertificateSlug) : null
}

export const PHASE_CERTIFICATE_DISMISSED_PREFIX = 'nq_phase_cert_modal_dismissed:'

export function isPhaseCertificateModalDismissed(phaseOrder: number): boolean {
  if (typeof window === 'undefined') return true
  try {
    return localStorage.getItem(`${PHASE_CERTIFICATE_DISMISSED_PREFIX}${phaseOrder}`) === '1'
  } catch {
    return true
  }
}

export function dismissPhaseCertificateModal(phaseOrder: number): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`${PHASE_CERTIFICATE_DISMISSED_PREFIX}${phaseOrder}`, '1')
  } catch {
    /* ignore */
  }
}
