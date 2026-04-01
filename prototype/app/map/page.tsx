'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, ArrowLeft } from 'lucide-react'

export default function MapPage() {
  const [walk, setWalk] = useState(true)
  const [transit, setTransit] = useState(false)
  const [crime, setCrime] = useState(true)
  const selectedProperty = 'Sample listing — Austin, TX'

  return (
    <div className="min-h-screen bg-brand-cream text-brand-charcoal dark:bg-darkaccent-bg dark:text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-brand-forest dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6 flex justify-center">
          <MapPin className="h-14 w-14 text-brand-sage" />
        </div>
        <h1 className="mb-2 text-center text-2xl font-bold text-brand-forest dark:text-white">Neighborhood &amp; safety layers</h1>
        <p className="mx-auto mb-8 max-w-lg text-center text-slate-600 dark:text-slate-400">
          Toggle illustrative scores (Walk Score, Transit Score, Crime Index). Connect Walk Score / AreaVibes APIs in production for live data.
        </p>

        <div className="mb-6 flex flex-wrap justify-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium dark:border-slate-700 dark:bg-slate-800">
            <input type="checkbox" checked={walk} onChange={() => setWalk((v) => !v)} className="accent-brand-forest" />
            Walk Score
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium dark:border-slate-700 dark:bg-slate-800">
            <input type="checkbox" checked={transit} onChange={() => setTransit((v) => !v)} className="accent-brand-forest" />
            Transit Score
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium dark:border-slate-700 dark:bg-slate-800">
            <input type="checkbox" checked={crime} onChange={() => setCrime((v) => !v)} className="accent-brand-forest" />
            Crime Index
          </label>
        </div>

        <div className="mb-8 min-h-[200px] rounded-2xl border border-dashed border-brand-sage/40 bg-brand-mist/50 p-8 text-center dark:border-slate-600 dark:bg-slate-900/40">
          <p className="text-sm font-semibold text-brand-sage">Map placeholder</p>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Property search map hooks in here. Layers: {walk ? 'Walk · ' : ''}
            {transit ? 'Transit · ' : ''}
            {crime ? 'Crime' : ''}
            {!walk && !transit && !crime ? 'none selected' : ''}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Safety summary</p>
          <p className="mt-1 font-semibold text-slate-900 dark:text-white">{selectedProperty}</p>
          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-brand-mist/80 p-3 dark:bg-slate-800">
              <dt className="text-xs text-slate-500">Walk Score</dt>
              <dd className="text-xl font-bold text-brand-forest">{walk ? '62' : '—'}</dd>
            </div>
            <div className="rounded-lg bg-brand-mist/80 p-3 dark:bg-slate-800">
              <dt className="text-xs text-slate-500">Transit Score</dt>
              <dd className="text-xl font-bold text-brand-forest">{transit ? '48' : '—'}</dd>
            </div>
            <div className="rounded-lg bg-brand-mist/80 p-3 dark:bg-slate-800">
              <dt className="text-xs text-slate-500">Crime Index</dt>
              <dd className="text-xl font-bold text-brand-forest">{crime ? 'Safer than 58% of U.S. cities' : '—'}</dd>
            </div>
          </dl>
        </div>

        <Link href="/quiz" className="mt-8 block text-center text-sm font-semibold text-brand-terracotta hover:underline">
          Update location in assessment →
        </Link>
      </main>
    </div>
  )
}
