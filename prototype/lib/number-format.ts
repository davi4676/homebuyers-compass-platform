export function parseFormattedNumber(value: string): number {
  const normalized = value.replace(/,/g, '').trim()
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatNumberForInput(
  value: number | string | null | undefined,
  maxFractionDigits = 3
): string {
  if (value == null || value === '') return ''
  const numeric =
    typeof value === 'number' ? value : Number(String(value).replace(/,/g, '').trim())
  if (!Number.isFinite(numeric)) return ''
  return numeric.toLocaleString('en-US', { maximumFractionDigits: maxFractionDigits })
}
