'use client'

import Link from 'next/link'

export default function ProfessionalDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-bold text-compass-blue">
              🧭 NestQuest Pro
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lead Inbox</h1>
          <p className="text-gray-600">Manage and convert your qualified leads</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">New Leads</p>
            <p className="text-2xl font-bold">12</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Qualified</p>
            <p className="text-2xl font-bold">8</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">In Pipeline</p>
            <p className="text-2xl font-bold">5</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Closed</p>
            <p className="text-2xl font-bold">24</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold">Sarah Johnson</h3>
              <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800">🔥 Hot • Score: 87</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Budget:</span>
                <span className="font-medium ml-1">$350k-$450k</span>
              </div>
              <div>
                <span className="text-gray-600">Location:</span>
                <span className="font-medium ml-1">Seattle, WA</span>
              </div>
              <div>
                <span className="text-gray-600">Timeline:</span>
                <span className="font-medium ml-1">3 months</span>
              </div>
              <div>
                <span className="text-gray-600">Readiness:</span>
                <span className="font-medium ml-1">78/100</span>
              </div>
            </div>
            <button className="mt-4 px-4 py-2 bg-compass-blue text-white rounded-lg hover:bg-compass-dark">
              View Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

