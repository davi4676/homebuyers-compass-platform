'use client'

/**
 * Blink SDK + Auth hooks.
 * Use with useAuth() from @/lib/hooks/useAuth for full auth state.
 * Blink auth/session can be wired here when Blink SDK is integrated.
 */

import { useAuth } from './useAuth'

export function useBlinkAuth() {
  const auth = useAuth()
  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    // Blink-specific session can be added when SDK is connected
    blinkSession: null as unknown,
  }
}
