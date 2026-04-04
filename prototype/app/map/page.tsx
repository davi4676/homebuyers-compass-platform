'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { MapPin, HelpCircle, Search } from 'lucide-react'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'

type ScoreBundle = {
  walk: number | null
  transit: number | null
  bike: number | null
  mock: boolean
}

function mockScores(seed: string): ScoreBundle {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const walk = 40 + (h % 51)
  const transit = 30 + ((h >> 3) % 51)
  const bike = 35 + ((h >> 6) % 51)
  return { walk, transit, bike, mock: true }
}

function ScoreBadge({
  label,
  value,
  colorClass,
  tooltip,
  active,
}: {
  label: string
  value: number | null
  colorClass: string
  tooltip: string
  active: boolean
}) {
  return (
    <div
      className={`relative rounded-xl border px-3 py-2 text-center ${
        active ? 'border-[#e7e5e4] bg-white' : 'border-[#f5f5f4] bg-[#fafaf9] opacity-50'
      }`}
    >
      <div className="flex items-center justify-center gap-1 text-xs font-semibold text-[#57534e]">
        {label}
        <span className="group relative inline-flex">
          <HelpCircle className="h-3.5 w-3.5 cursor-help text-[#a8a29e]" aria-hidden />
          <span
            className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden w-56 -translate-x-1/2 rounded-lg border border-[#e7e5e4] bg-[#1c1917] px-2 py-1.5 text-left text-[11px] font-normal leading-snug text-white shadow-lg group-hover:block"
            role="tooltip"
          >
            {tooltip}
          </span>
        </span>
      </div>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${active ? colorClass : 'text-[#a8a29e]'}`}>
        {active && value != null ? value : '—'}
      </p>
    </div>
  )
}

export default function MapPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locationLabel, setLocationLabel] = useState<string | null>(null)
  const [lat, setLat] = useState<number | null>(null)
  const [lon, setLon] = useState<number | null>(null)
  const [scores, setScores] = useState<ScoreBundle | null>(null)
  const [walk, setWalk] = useState(true)
  const [transit, setTransit] = useState(true)
  const [bikeOn, setBikeOn] = useState(true)
  const [crime, setCrime] = useState(true)

  const search = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault()
      const q = query.trim()
      if (!q) return
      setLoading(true)
      setError(null)
      try {
        const geoRes = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`)
        const geo = await geoRes.json()
        if (!geoRes.ok) {
          setError(geo.error === 'not_found' ? 'Location not found. Try a city or ZIP code.' : 'Search failed.')
          setLoading(false)
          return
        }
        setLat(geo.lat)
        setLon(geo.lon)
        setLocationLabel(geo.displayName)

        const wsRes = await fetch(
          `/api/walkscore?lat=${geo.lat}&lon=${geo.lon}&address=${encodeURIComponent(geo.displayName)}`
        )
        const ws = await wsRes.json()
        if (!ws.mock && ws.walkscore != null) {
          setScores({
            walk: ws.walkscore,
            transit: ws.transit ?? null,
            bike: ws.bike ?? null,
            mock: false,
          })
        } else {
          setScores(mockScores(geo.displayName))
        }
      } catch {
        setError('Something went wrong. Try again.')
      } finally {
        setLoading(false)
      }
    },
    [query]
  )

  const applyMock = useCallback(() => {
    const label = locationLabel || query || 'Demo area'
    setScores(mockScores(label))
    if (lat == null || lon == null) {
      setLat(30.2672)
      setLon(-97.7431)
      setLocationLabel(label)
    }
  }, [locationLabel, query, lat, lon])

  const embedSrc =
    lat != null && lon != null
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.03}%2C${lat - 0.02}%2C${lon + 0.03}%2C${lat + 0.02}&layer=mapnik&marker=${lat}%2C${lon}`
      : null

  const crimeLabel =
    locationLabel && scores
      ? `Safer than ${40 + (locationLabel.length % 45)}% of similar metro areas (illustrative)`
      : '—'

  return (
    <div className="app-page-shell">
      <header className="sticky top-0 z-10 border-b border-[#e7e5e4] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-4">
          <BackToMyJourneyLink />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6 flex justify-center">
          <MapPin className="h-12 w-12 text-[#0d9488]" aria-hidden />
        </div>
        <h1 className="mb-2 text-center font-display text-3xl font-bold text-[#1c1917]">
          Neighborhood walkability &amp; safety
        </h1>
        <p className="mx-auto mb-8 max-w-lg text-center text-[#57534e]">
          Search a location to center the map and load Walk Score data when an API key is configured. Use demo scores
          to explore the UI anytime.
        </p>

        <form onSubmit={search} className="mb-6 rounded-xl border border-[#e7e5e4] bg-white p-3 shadow-sm">
          <label htmlFor="map-search" className="sr-only">
            Search location
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a8a29e]" />
              <input
                id="map-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter a city, neighborhood, or ZIP code"
                className="w-full rounded-lg border border-[#e7e5e4] py-2.5 pl-10 pr-3 text-[#1c1917] outline-none ring-[#0d9488]/30 focus:ring-2"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="rounded-lg bg-[#1a6b3c] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#155c33] disabled:opacity-50"
            >
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>
        </form>

        {error ? <p className="mb-4 text-center text-sm text-red-600">{error}</p> : null}

        {!scores && !loading ? (
          <div className="mb-6 rounded-xl border border-dashed border-[#0d9488]/40 bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-semibold text-[#1a6b3c]">Connect your location to see real scores</p>
            <p className="mt-2 text-sm text-[#57534e]">
              Enter an address above. Without a Walk Score API key, we&apos;ll prompt you to use illustrative scores.
            </p>
            <button
              type="button"
              onClick={applyMock}
              className="mt-4 rounded-lg border border-[#e7e5e4] bg-[#fafaf9] px-4 py-2 text-sm font-semibold text-[#1c1917] hover:bg-[#f5f5f4]"
            >
              Use mock scores (demo)
            </button>
          </div>
        ) : null}

        {scores?.mock ? (
          <p className="mb-4 text-center text-xs font-medium text-[#c0622a]">
            Showing illustrative scores for demo — add{' '}
            <code className="rounded bg-[#f5f5f4] px-1">WALK_SCORE_API_KEY</code> for live Walk Score data.
          </p>
        ) : scores && !scores.mock ? (
          <p className="mb-4 text-center text-xs font-medium text-[#0d9488]">Live Walk Score data loaded.</p>
        ) : null}

        <div className="mb-6 flex flex-wrap justify-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-full border border-[#e7e5e4] bg-white px-4 py-2 text-sm font-medium shadow-sm">
            <input type="checkbox" checked={walk} onChange={() => setWalk((v) => !v)} className="accent-[#1a6b3c]" />
            Walk Score
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-full border border-[#e7e5e4] bg-white px-4 py-2 text-sm font-medium shadow-sm">
            <input type="checkbox" checked={transit} onChange={() => setTransit((v) => !v)} className="accent-[#1a6b3c]" />
            Transit Score
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-full border border-[#e7e5e4] bg-white px-4 py-2 text-sm font-medium shadow-sm">
            <input type="checkbox" checked={bikeOn} onChange={() => setBikeOn((v) => !v)} className="accent-[#1a6b3c]" />
            Bike Score
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-full border border-[#e7e5e4] bg-white px-4 py-2 text-sm font-medium shadow-sm">
            <input type="checkbox" checked={crime} onChange={() => setCrime((v) => !v)} className="accent-[#1a6b3c]" />
            Crime Index
          </label>
        </div>

        <div className="mb-8 overflow-hidden rounded-xl border border-[#e7e5e4] bg-white shadow-sm">
          {embedSrc ? (
            <iframe title="Map" className="h-[320px] w-full border-0" src={embedSrc} loading="lazy" />
          ) : (
            <div className="flex h-[320px] items-center justify-center bg-[#f5f5f4] text-sm text-[#57534e]">
              Search a location to center the map.
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[#e7e5e4] bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-[#78716c]">Location summary</p>
          <p className="mt-1 font-display text-lg font-semibold text-[#1c1917]">
            {locationLabel ?? 'Search for a neighborhood'}
          </p>
          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ScoreBadge
              label="Walk Score"
              value={scores?.walk ?? null}
              colorClass="text-[#1a6b3c]"
              active={walk}
              tooltip="How walkable daily errands are from this location. Higher scores mean less reliance on a car for groceries, schools, and parks."
            />
            <ScoreBadge
              label="Transit Score"
              value={scores?.transit ?? null}
              colorClass="text-[#0d9488]"
              active={transit}
              tooltip="Quality of nearby public transit for typical trips. Use it to compare commutes before you commit to a home."
            />
            <ScoreBadge
              label="Bike Score"
              value={scores?.bike ?? null}
              colorClass="text-[#c0622a]"
              active={bikeOn}
              tooltip="How suitable the area is for biking — lanes, traffic stress, and destinations within riding distance."
            />
          </dl>
          <div
            className={`mt-4 rounded-xl border px-3 py-3 ${crime ? 'border-[#e7e5e4] bg-[#fafaf9]' : 'opacity-50'}`}
          >
            <div className="flex items-center gap-1 text-xs font-semibold text-[#57534e]">
              Crime Index (illustrative)
              <span className="group relative inline-flex">
                <HelpCircle className="h-3.5 w-3.5 cursor-help text-[#a8a29e]" />
                <span className="pointer-events-none absolute bottom-full left-0 z-10 mb-1 hidden w-56 rounded-lg border border-[#e7e5e4] bg-[#1c1917] px-2 py-1.5 text-[11px] font-normal leading-snug text-white shadow-lg group-hover:block">
                  NestQuest does not provide legal or security guarantees. In production, connect a certified crime-data
                  provider; use this view with your agent to compare walkability and safety signals side by side.
                </span>
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-[#1c1917]">{crime ? crimeLabel : '—'}</p>
          </div>
        </div>

        <Link
          href="/quiz"
          className="mt-8 block text-center text-sm font-semibold text-[#c0622a] hover:underline"
        >
          Update location in assessment →
        </Link>
      </main>
    </div>
  )
}
