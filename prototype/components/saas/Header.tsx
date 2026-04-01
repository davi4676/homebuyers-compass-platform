'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'

export default function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">SaaS Admin</span>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-slate-600">{user.email}</span>
            <button
              type="button"
              onClick={() => signOut()}
              className="text-sm text-slate-500 hover:text-slate-900"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link href="/register" className="text-sm text-cyan-400 hover:text-cyan-300">
            Sign in
          </Link>
        )}
      </div>
    </header>
  )
}
