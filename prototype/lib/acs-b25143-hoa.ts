/**
 * ACS 5-year table B25143 — Median monthly homeowners association and/or condominium fee ($)
 * by mortgage status. Universe: owner-occupied units paying an HOA/condo fee.
 *
 * Geography must match Census ACS 5-year `for` / `in` (see `census-geography-table.ts`).
 *
 * Note: The Census Data API may not list `groups/B25143.json` for every release; this module
 * probes recent years and fails clearly until the table is published for API access.
 */

import type { Acs5Geography } from '@/lib/census-acs-geography'
import { acs5GeographyToForIn } from '@/lib/census-acs-geography'

export const ACS_B25143_TABLE_ID = 'B25143' as const

/** Census Data API dataset path segment, e.g. `/data/2023/acs/acs5/...` */
const ACS_ACS5_PATH = 'acs/acs5'
const PROBE_YEARS_DESC = [2024, 2023, 2022, 2021, 2020] as const

/** Census “no estimate” / suppressed codes */
function parseEstimate(raw: string | undefined): number | null {
  if (raw == null || raw === '') return null
  const n = Number(raw)
  if (!Number.isFinite(n)) return null
  if (n < 0 || n > 1_000_000) return null
  return Math.round(n)
}

type GroupVarMeta = Record<string, { label?: string; concept?: string }>

function medianFeeLabelScore(label: string): number {
  const L = label.toLowerCase()
  if (!L.includes('median')) return 0
  if (!L.includes('association') && !L.includes('condominium')) return 0
  if (L.includes('total')) return 3
  if (L.includes('mortgage') && !L.includes('without')) return 2
  if (L.includes('without') && L.includes('mortgage')) return 2
  return 1
}

function pickMedianColumns(meta: GroupVarMeta): {
  total?: string
  withMortgage?: string
  withoutMortgage?: string
} {
  const candidates: { id: string; label: string; score: number }[] = []
  for (const [id, v] of Object.entries(meta)) {
    if (!id.endsWith('E') || !id.startsWith(`${ACS_B25143_TABLE_ID}_`)) continue
    const label = v?.label ?? ''
    const s = medianFeeLabelScore(label)
    if (s > 0) candidates.push({ id, label, score: s })
  }
  candidates.sort((a, b) => b.score - a.score)

  let total: string | undefined
  let withMortgage: string | undefined
  let withoutMortgage: string | undefined

  for (const c of candidates) {
    const L = c.label.toLowerCase()
    if (!total && /\btotal\b/.test(L)) total = c.id
    else if (!withMortgage && L.includes('with a mortgage') && !L.includes('without')) {
      withMortgage = c.id
    } else if (!withoutMortgage && L.includes('without a mortgage')) {
      withoutMortgage = c.id
    }
  }

  // Fallback: first three median-like columns by table order (001E, 002E, 003E) if labels differ
  if (!total || !withMortgage || !withoutMortgage) {
    const medians = candidates.filter((c) => c.score >= 1).map((c) => c.id)
    total = total ?? medians[0]
    withMortgage = withMortgage ?? medians[1]
    withoutMortgage = withoutMortgage ?? medians[2]
  }

  return { total, withMortgage, withoutMortgage }
}

export async function findLatestAcs5YearWithB25143(): Promise<number | null> {
  for (const year of PROBE_YEARS_DESC) {
    const url = `https://api.census.gov/data/${year}/${ACS_ACS5_PATH}/groups/${ACS_B25143_TABLE_ID}.json`
    const r = await fetch(url, { next: { revalidate: 86_400 } })
    if (r.ok) return year
  }
  return null
}

export interface B25143HoaResult {
  acsYear: number
  tableId: typeof ACS_B25143_TABLE_ID
  geography: Acs5Geography
  /** Parsed medians (dollars/mo), when columns resolve */
  medians: {
    total: number | null
    withMortgage: number | null
    withoutMortgage: number | null
  }
  /** Variable ids used for the three medians */
  variableIds: {
    total?: string
    withMortgage?: string
    withoutMortgage?: string
  }
  name: string | null
  raw: Record<string, string | null>
}

export async function fetchB25143HoaMedians(
  geography: Acs5Geography,
  options?: { year?: number; censusApiKey?: string }
): Promise<B25143HoaResult> {
  const year = options?.year ?? (await findLatestAcs5YearWithB25143())
  if (year == null) {
    throw new Error(
      `ACS 5-year table ${ACS_B25143_TABLE_ID} is not available from the Census Data API in probed years (${PROBE_YEARS_DESC.join(', ')}).`
    )
  }

  const groupUrl = `https://api.census.gov/data/${year}/${ACS_ACS5_PATH}/groups/${ACS_B25143_TABLE_ID}.json`
  const groupRes = await fetch(groupUrl, { next: { revalidate: 86_400 } })
  if (!groupRes.ok) {
    throw new Error(
      `Table ${ACS_B25143_TABLE_ID} metadata not found for ${year} (${groupRes.status}).`
    )
  }
  const groupJson = (await groupRes.json()) as { variables?: GroupVarMeta }
  const meta = groupJson.variables ?? {}
  const picked = pickMedianColumns(meta)

  const { forValue, inValue } = acs5GeographyToForIn(geography)
  const getList = ['NAME']
  if (picked.total) getList.push(picked.total)
  if (picked.withMortgage) getList.push(picked.withMortgage)
  if (picked.withoutMortgage) getList.push(picked.withoutMortgage)

  const params = new URLSearchParams()
  params.set('get', getList.join(','))
  params.set('for', forValue)
  if (inValue) params.set('in', inValue)
  if (options?.censusApiKey) params.set('key', options.censusApiKey)

  const dataUrl = `https://api.census.gov/data/${year}/${ACS_ACS5_PATH}?${params.toString()}`
  const dataRes = await fetch(dataUrl, { next: { revalidate: 86_400 } })
  if (!dataRes.ok) {
    const errText = await dataRes.text()
    throw new Error(`Census ACS request failed (${dataRes.status}): ${errText.slice(0, 500)}`)
  }

  const rows = (await dataRes.json()) as string[][]
  if (!Array.isArray(rows) || rows.length < 2) {
    throw new Error('Unexpected Census ACS response shape.')
  }
  const headers = rows[0]
  const values = rows[1]
  const raw: Record<string, string | null> = {}
  for (let i = 0; i < headers.length; i++) {
    raw[headers[i]] = values[i] ?? null
  }

  const name = raw['NAME'] ?? null
  const total = picked.total ? parseEstimate(raw[picked.total] ?? undefined) : null
  const withM = picked.withMortgage ? parseEstimate(raw[picked.withMortgage] ?? undefined) : null
  const withoutM = picked.withoutMortgage
    ? parseEstimate(raw[picked.withoutMortgage] ?? undefined)
    : null

  return {
    acsYear: year,
    tableId: ACS_B25143_TABLE_ID,
    geography,
    medians: {
      total,
      withMortgage: withM,
      withoutMortgage: withoutM,
    },
    variableIds: {
      total: picked.total,
      withMortgage: picked.withMortgage,
      withoutMortgage: picked.withoutMortgage,
    },
    name,
    raw,
  }
}
