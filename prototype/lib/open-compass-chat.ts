/** Opens the journey Compass panel (single AI entry point on My Journey). */
export function openCompassChat(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('nestquest-open-compass'))
}
