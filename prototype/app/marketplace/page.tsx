'use client'

import Link from 'next/link'
import { Star, ShieldCheck, Clock3 } from 'lucide-react'

export default function MarketplacePage() {
  const providers = [
    {
      id: 'inspection-abc',
      service: 'Standard Home Inspection',
      provider: 'ABC Inspection Services',
      rating: 4.8,
      reviews: 120,
      price: 450,
      turnaround: '24-48h',
      verified: true,
    },
    {
      id: 'title-first',
      service: 'Enhanced Title Insurance',
      provider: 'First Title Co.',
      rating: 4.9,
      reviews: 156,
      price: 1150,
      turnaround: '2-3 days',
      verified: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-bold text-compass-blue">
              🧭 NestQuest
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Closing Cost Marketplace</h1>
          <p className="text-gray-600">Compare and book services for your closing</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Get Personalized Estimates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Property Address"
              className="px-4 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Purchase Price"
              className="px-4 py-2 border rounded-lg"
            />
            <button className="bg-compass-blue text-white px-6 py-2 rounded-lg font-semibold hover:bg-compass-dark">
              Get Estimates
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Estimates are refreshed daily and include service fees + expected closing timeline.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <h2 className="text-lg font-semibold">Compare Top Matches</h2>
            <button className="bg-compass-blue text-white px-4 py-2 rounded-lg font-semibold hover:bg-compass-dark">
              Request 3 Quotes
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Provider</th>
                  <th className="py-2 pr-4">Service</th>
                  <th className="py-2 pr-4">Price</th>
                  <th className="py-2 pr-4">Turnaround</th>
                  <th className="py-2 pr-4">Trust</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((p) => (
                  <tr key={p.id} className="border-b last:border-b-0">
                    <td className="py-3 pr-4 font-medium text-gray-900">{p.provider}</td>
                    <td className="py-3 pr-4 text-gray-700">{p.service}</td>
                    <td className="py-3 pr-4 font-semibold text-compass-blue">${p.price.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-gray-700">{p.turnaround}</td>
                    <td className="py-3 pr-4">
                      {p.verified && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                          <ShieldCheck className="w-4 h-4" />
                          Verified
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {providers.map((provider) => (
          <div key={provider.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">{provider.service}</h3>
                <p className="text-sm text-gray-600 mb-2">{provider.provider}</p>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="ml-1 font-medium">{provider.rating}</span>
                  <span className="text-gray-500 text-sm ml-1">({provider.reviews} reviews)</span>
                </div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs text-gray-600">
                  <Clock3 className="w-3.5 h-3.5" />
                  Typical turnaround: {provider.turnaround}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-compass-blue">${provider.price.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="flex-1 bg-compass-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-compass-dark">
                View Details
              </button>
              <button className="flex-1 border border-compass-blue text-compass-blue px-4 py-2 rounded-lg font-medium hover:bg-blue-50">
                Get Quote
              </button>
            </div>
          </div>
          ))}
        </div>
      </div>
    </div>
  )
}

