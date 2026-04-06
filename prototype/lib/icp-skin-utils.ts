/** Parse #RGB / #RRGGBB for inline ICP accent styling (P-06). */
export function hexToRgba(hex: string, alpha: number): string {
  let h = hex.trim().replace(/^#/, '')
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('')
  }
  if (h.length !== 6) {
    return `rgba(100, 116, 139, ${alpha})`
  }
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  if ([r, g, b].some((n) => Number.isNaN(n))) {
    return `rgba(100, 116, 139, ${alpha})`
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
