import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold text-gray-100 mb-2">404</h1>
      <p className="text-gray-400 mb-6">This page could not be found.</p>
      <Link
        href="/"
        className="px-4 py-2 rounded-lg bg-cyan-600 text-white font-medium hover:bg-cyan-700 transition"
      >
        Back to home
      </Link>
    </div>
  )
}
