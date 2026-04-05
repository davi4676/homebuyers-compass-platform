import { Lock } from 'lucide-react'

export type BlurredPreviewItem = {
  label: string
  value: string
}

export type BlurredPreviewProps = {
  items: BlurredPreviewItem[]
  unlockCta: string
  unlockPrice: string
  onUnlock: () => void
  /** Disables the unlock control while checkout is starting */
  unlockBusy?: boolean
}

export default function BlurredPreview({
  items,
  unlockCta,
  unlockPrice,
  onUnlock,
  unlockBusy,
}: BlurredPreviewProps) {
  const rows = items.slice(0, 3)

  return (
    <div className="relative rounded-xl border border-gray-200 bg-white p-4">
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
          >
            <span className="text-sm text-gray-700">{row.label}</span>
            <span
              className="select-none text-sm font-medium text-gray-900"
              style={{ filter: 'blur(5px)' }}
              aria-hidden
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
        <div
          className="pointer-events-auto w-full max-w-xs rounded-xl border border-gray-200/80 bg-white/80 px-5 py-6 text-center shadow-lg backdrop-blur-sm"
          role="region"
          aria-label="Unlock preview"
        >
          <Lock
            className="mx-auto h-8 w-8 text-teal-600"
            strokeWidth={1.75}
            aria-hidden
          />
          <p className="mt-3 text-sm font-medium text-gray-900">{unlockCta}</p>
          <span className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            {unlockPrice}
          </span>
          <button
            type="button"
            disabled={unlockBusy}
            onClick={onUnlock}
            className="mt-4 w-full rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-60"
          >
            {unlockBusy ? 'Redirecting…' : 'Unlock'}
          </button>
        </div>
      </div>
    </div>
  )
}
