'use client'

import { useEffect } from 'react'

const REVEAL_SELECTORS = [
  '.nq-card:not(.nq-reveal)',
  '.nq-section:not(.nq-reveal)',
  '.nq-ed-soft-card:not(.nq-reveal)',
  '.nq-hub-panel:not(.nq-reveal)',
  '.nq-journey-tab-hero:not(.nq-reveal)',
].join(', ')

/**
 * Staggered entrance for marketing cards — skips dynamically swapped journey tab content.
 */
export default function JourneyTabReveal() {
  useEffect(() => {
    const root = document.querySelector('.nq-journey-ds')
    if (!root) return

    let seq = 0

    const revealOne = (node: HTMLElement) => {
      if (node.classList.contains('nq-reveal')) return
      if (node.closest('.nq-journey-roadmap-root')) return

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
      root.querySelectorAll<HTMLElement>(REVEAL_SELECTORS).forEach((el) => {
        revealOne(el)
      })
    }

    scan()
    const mo = new MutationObserver(() => scan())
    mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-active-tab'] })
    return () => mo.disconnect()
  }, [])

  return null
}
