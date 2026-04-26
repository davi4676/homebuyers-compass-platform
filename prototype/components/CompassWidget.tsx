'use client'

import { useCallback, useEffect, useState } from 'react'
import { Compass, Sparkle, X } from '@phosphor-icons/react'
import type { UseCompassReturn } from '@/lib/ai/useCompass'

export type CompassWidgetProps = {
  compass: UseCompassReturn
}

export function CompassWidget({ compass }: CompassWidgetProps) {
  const { isOpen, triggerData, dismiss, open, close } = compass

  const [bannerVisible, setBannerVisible] = useState(false)

  const showPulse =
    Boolean(triggerData?.shouldShow && triggerData.triggerType !== 'none') && !isOpen

  useEffect(() => {
    const active =
      Boolean(triggerData?.shouldShow && triggerData.triggerType !== 'none') && !isOpen
    if (!active) {
      setBannerVisible(false)
      return
    }
    setBannerVisible(true)
    const t = window.setTimeout(() => setBannerVisible(false), 12_000)
    return () => clearTimeout(t)
  }, [triggerData, isOpen])

  const onFabClick = useCallback(() => {
    if (isOpen) close()
    else open()
  }, [isOpen, close, open])

  const onAskCompass = useCallback(() => {
    setBannerVisible(false)
    open()
  }, [open])

  const onBannerDismiss = useCallback(() => {
    setBannerVisible(false)
    dismiss()
  }, [dismiss])

  const prompt = triggerData?.suggestedPrompt?.trim() ?? ''

  return (
    <div className="nq-compass-root">
      {bannerVisible && prompt ? (
        <div
          className="nq-compass-banner-enter pointer-events-auto fixed bottom-[88px] right-6 z-[1000] w-[280px] rounded-[14px] border border-black/[0.06] bg-[var(--white)] p-3 shadow-[var(--shadow-md)]"
          role="region"
          aria-label="Compass suggestion"
        >
          <div className="flex gap-2.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white"
              aria-hidden
            >
              <Compass weight="duotone" size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold leading-tight text-[var(--text)]">Compass</p>
              <p className="text-[11px] leading-tight text-[var(--muted)]">Your AI Guide</p>
              <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-[var(--text)]">{prompt}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onAskCompass}
              className="rounded-[10px] bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-95"
            >
              Ask Compass →
            </button>
            <button
              type="button"
              onClick={onBannerDismiss}
              className="px-2 py-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)]"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-auto fixed bottom-6 right-6 z-[1000]">
        {showPulse ? (
          <span
            className="nq-compass-pulse-ring pulseRing pointer-events-none absolute -inset-1 rounded-full"
            aria-hidden
          />
        ) : null}
        {showPulse ? (
          <span
            className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] shadow-sm ring-2 ring-white"
            aria-hidden
          >
            <Sparkle weight="fill" size={12} className="text-white" />
          </span>
        ) : null}
        <button
          type="button"
          onClick={onFabClick}
          aria-label={isOpen ? 'Close Compass' : 'Open Compass'}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white shadow-[var(--shadow-lg)] transition-transform duration-150 ease-out hover:scale-[1.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
        >
          <span
            className={`flex items-center justify-center transition-transform duration-200 ease-out ${
              isOpen ? 'rotate-45' : 'rotate-0'
            }`}
          >
            {isOpen ? <X weight="bold" size={24} /> : <Compass weight="duotone" size={24} />}
          </span>
        </button>
      </div>
    </div>
  )
}
