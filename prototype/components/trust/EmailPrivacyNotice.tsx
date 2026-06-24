import Link from 'next/link'

type EmailPrivacyNoticeProps = {
  className?: string
}

/** Short privacy line for email capture forms. */
export default function EmailPrivacyNotice({ className = '' }: EmailPrivacyNoticeProps) {
  return (
    <p className={`text-xs leading-relaxed text-[var(--nq-ed-muted,#78716c)] ${className}`}>
      We use your email only for what you request — no selling lists. See our{' '}
      <Link href="/privacy" className="font-semibold text-[var(--nq-ed-accent,#0d9488)] hover:underline">
        Privacy Policy
      </Link>
      .
    </p>
  )
}
