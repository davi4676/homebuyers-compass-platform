'use client'

import { useEffect } from 'react'

/**
 * Staggered entrance for `.nq-card` / `.nq-section` inside `.nq-journey-ds` (Phase 5 DS).
 */
export default function JourneyTabReveal() {
  useEffect(() => {
    const root = document.querySelector('.nq-journey-ds')
    if (!root) return

    let seq = 0

    const revealOne = (node: HTMLElement) => {
      if (node.classList.contains('nq-reveal')) return
      const reduce =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) {
        node.classList.add('nq-reveal')
        return
      }
      const i = seq++
      node.style.transitionDelay = `${i * 80}ms`
      requestAnimationFrame(() => {
        node.classList.add('nq-reveal')
      })
    }

    const scan = () => {
      root.querySelectorAll<HTMLElement>('.nq-card:not(.nq-reveal), .nq-section:not(.nq-reveal)').forEach((el) => {
        revealOne(el)
      })
    }

    scan()
    const mo = new MutationObserver(() => scan())
    mo.observe(root, { childList: true, subtree: true })
    return () => mo.disconnect()
  }, [])

  return null
}
