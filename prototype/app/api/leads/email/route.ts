import { NextResponse } from 'next/server'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'
import {
  htmlForTemplate,
  subjectForTemplate,
  type LeadEmailTemplate,
} from '@/lib/email/lead-magnets'
import { sendOnboardingStep } from '@/lib/email-sequences/onboarding'

const VALID_TEMPLATES: LeadEmailTemplate[] = [
  'closing-cost-checklist',
  'quiz-results-teaser',
  'pre-purchase-workbook',
]

function isValidTemplate(value: unknown): value is LeadEmailTemplate {
  return typeof value === 'string' && VALID_TEMPLATES.includes(value as LeadEmailTemplate)
}

/**
 * Lead capture — sends checklist or quiz follow-up when Resend is configured.
 * Always returns ok: true on valid input so UI is not blocked in dev without Resend.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const source = typeof body.source === 'string' ? body.source : 'unknown'
    const template = isValidTemplate(body.template) ? body.template : 'closing-cost-checklist'

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: 'Invalid email' }, { status: 400 })
    }

    if (template === 'quiz-results-teaser') {
      const onboardingResult = await sendOnboardingStep(email, 0)
      return NextResponse.json({
        ok: true,
        sent: onboardingResult.ok,
        message: onboardingResult.ok ? 'sent' : onboardingResult.message,
      })
    }

    const subject = subjectForTemplate(template)
    const html = htmlForTemplate(template)
    const sendResult = await sendTransactionalEmail({ to: email, subject, html })

    if (!sendResult.ok) {
      console.log('[nestquest-lead-email]', { email, source, template, note: sendResult.message })
    }

    return NextResponse.json({
      ok: true,
      sent: sendResult.ok,
      message: sendResult.ok ? 'sent' : sendResult.message,
    })
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 })
  }
}
