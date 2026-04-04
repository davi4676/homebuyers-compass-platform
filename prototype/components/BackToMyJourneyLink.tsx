import Link from 'next/link'

export default function BackToMyJourneyLink({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/customized-journey"
      className={`text-sm text-[#0d9488] hover:text-[#0b7a72] flex items-center gap-1 ${className}`}
    >
      <span aria-hidden>←</span> Back to My Journey
    </Link>
  )
}
