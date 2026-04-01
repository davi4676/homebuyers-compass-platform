'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function MoveUpGuidePage() {
  const [savingsBridge, setSavingsBridge] = useState<boolean | null>(null)
  const [sellerMarket, setSellerMarket] = useState<boolean | null>(null)
  const [bridgeOpen, setBridgeOpen] = useState(false)

  let sellOrBuyFirst: 'sell' | 'buy' | 'bridge' | null = null
  if (savingsBridge === true) sellOrBuyFirst = 'buy'
  else if (savingsBridge === false) {
    if (sellerMarket === true) sellOrBuyFirst = 'sell'
    else if (sellerMarket === false) sellOrBuyFirst = 'bridge'
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-slate-800">
      <Link href="/" className="text-sm font-semibold text-sky-700 hover:underline">
        ← Home
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-brand-forest">Sell First or Buy First?</h1>
      <p className="mt-2 text-slate-600">
        A simple decision tree for move-up buyers. This is educational only — not financial advice.
      </p>

      <div className="mt-10 space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="font-semibold text-slate-900">1. Do you have enough savings to carry two mortgages for 3–6 months?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSavingsBridge(true)}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                savingsBridge === true ? 'border-brand-forest bg-brand-mist' : 'border-slate-200'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setSavingsBridge(false)}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                savingsBridge === false ? 'border-brand-forest bg-brand-mist' : 'border-slate-200'
              }`}
            >
              No
            </button>
          </div>
          {savingsBridge === true ? (
            <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-900">
              Leaning <strong>buy first</strong> — you have cushion if the old home doesn&apos;t close immediately.
            </p>
          ) : null}
        </div>

        {savingsBridge === false ? (
          <div>
            <p className="font-semibold text-slate-900">2. Is your current market a seller&apos;s market?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSellerMarket(true)}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                  sellerMarket === true ? 'border-brand-forest bg-brand-mist' : 'border-slate-200'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setSellerMarket(false)}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                  sellerMarket === false ? 'border-brand-forest bg-brand-mist' : 'border-slate-200'
                }`}
              >
                No / uncertain
              </button>
            </div>
            {sellerMarket === true ? (
              <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm font-medium text-amber-950">
                Often <strong>sell first</strong> — your home may move quickly, giving you clearer cash for the next purchase.
              </p>
            ) : null}
            {sellerMarket === false ? (
              <p className="mt-4 rounded-lg bg-sky-50 p-3 text-sm font-medium text-sky-950">
                Consider a <strong>bridge loan</strong> or longer contingency — talk to a lender about timing risk.
              </p>
            ) : null}
          </div>
        ) : null}

        {sellOrBuyFirst ? (
          <p className="text-sm text-slate-600">
            Suggested direction:{' '}
            <strong>
              {sellOrBuyFirst === 'buy'
                ? 'Buy first (more flexibility, more overlap risk)'
                : sellOrBuyFirst === 'sell'
                  ? 'Sell first (clearer cash, timing pressure)'
                  : 'Bridge / contingency planning'}
            </strong>
            .
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => setBridgeOpen((v) => !v)}
        className="mt-8 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-brand-mist/50 px-4 py-3 text-left font-semibold text-brand-forest"
      >
        Bridge Loan Explainer
        {bridgeOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>
      {bridgeOpen ? (
        <div className="mt-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          A bridge loan uses equity in your current home as short-term financing for the next purchase. It can work when
          you need to buy before you sell, but fees and risk are higher — compare options with a mortgage professional.
        </div>
      ) : null}

      <Link
        href="/quiz?type=move-up&full=1"
        className="mt-10 inline-flex rounded-xl bg-brand-forest px-6 py-3 font-bold text-white hover:bg-brand-sage"
      >
        Start move-up assessment
      </Link>
    </div>
  )
}
