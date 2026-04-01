'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { LogIn, UserPlus, ArrowLeft } from 'lucide-react'
import { AuthModal } from '@/components/auth/AuthModal'
import { useAuth } from '@/lib/hooks/useAuth'

/**
 * Authentication page: sign up or log in.
 * Used when user clicks "Get started" or "Get my free guide" — after success they are
 * sent to Results (if they have completed the quiz) or Quiz, with journey state in cookies/session.
 */
export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const view = searchParams.get('view') === 'signup' ? 'signup' : 'login'
  const transactionType = searchParams.get('transactionType') || undefined
  const redirectParam = searchParams.get('redirect')
  const safeRedirect = redirectParam && redirectParam.startsWith('/') ? redirectParam : null

  // If already logged in, redirect to intended destination or quiz/results
  useEffect(() => {
    if (!mounted || isLoading) return
    if (!isAuthenticated) return
    setIsRedirecting(true)
    if (safeRedirect) {
      window.location.href = safeRedirect
      return
    }
    const url = transactionType
      ? `/api/auth/post-login-redirect?transactionType=${encodeURIComponent(transactionType)}`
      : '/api/auth/post-login-redirect'
    fetch(url, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.redirect) window.location.href = data.redirect
        else router.push('/quiz')
      })
      .catch(() => router.push('/quiz'))
  }, [isAuthenticated, isLoading, mounted, transactionType, router, safeRedirect])

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleClose = () => {
    router.push('/')
  }

  const showAuthForm = mounted && !isLoading && !isAuthenticated && !isRedirecting

  if (!showAuthForm) {
    return (
      <div className="min-h-screen bg-[rgb(var(--sky-light))] flex items-center justify-center">
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--sky-light))] text-[rgb(var(--text-dark))] flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          {view === 'login' ? (
            <LogIn className="w-12 h-12 text-[rgb(var(--navy))]" />
          ) : (
            <UserPlus className="w-12 h-12 text-[rgb(var(--navy))]" />
          )}
        </div>
        <h1 className="text-2xl font-bold mb-2 text-[rgb(var(--navy))]">
          {view === 'login' ? 'Log in' : 'Create account'}
        </h1>
        <p className="text-slate-600 mb-6">
          {view === 'login'
            ? 'Sign in to access your free guide, results, and journey progress.'
            : 'Sign up to get your free guide and save your progress.'}
        </p>
        <AuthModal
          isOpen={true}
          onClose={handleClose}
          initialView={view}
          redirectTo={safeRedirect ?? '/'}
          usePostLoginRedirect={!safeRedirect}
          postLoginTransactionType={transactionType}
        />
        <p className="mt-6 text-sm text-slate-500">
          {view === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <Link href={safeRedirect ? `/auth?view=signup&redirect=${encodeURIComponent(safeRedirect)}` : '/auth?view=signup'} className="text-[rgb(var(--coral))] hover:underline font-semibold">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link href={safeRedirect ? `/auth?view=login&redirect=${encodeURIComponent(safeRedirect)}` : '/auth?view=login'} className="text-[rgb(var(--coral))] hover:underline font-semibold">
                Log in
              </Link>
            </>
          )}
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
