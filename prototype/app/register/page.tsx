'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { UserPlus, ArrowLeft } from 'lucide-react'
import { AuthModal } from '@/components/auth/AuthModal'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const view = searchParams.get('view') === 'login' ? 'login' : 'signup'

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleClose = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--sky-light))] text-[rgb(var(--text-dark))] flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <UserPlus className="w-12 h-12 text-[rgb(var(--navy))]" />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-[rgb(var(--navy))]">Sign up</h1>
        <p className="text-slate-600 mb-6">
          Create an account to save your progress and access personalized features.
        </p>
        {mounted && (
          <AuthModal
            isOpen={true}
            onClose={handleClose}
            initialView={view}
            redirectTo="/"
          />
        )}
        <p className="mt-6 text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="text-[rgb(var(--coral))] hover:underline font-semibold">
            Log in
          </Link>
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-8 text-slate-600 hover:text-[rgb(var(--navy))] transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>
    </div>
  )
}
