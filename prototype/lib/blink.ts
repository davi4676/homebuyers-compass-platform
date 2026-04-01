/**
 * Blink SDK initialization and configuration.
 * Initialize in your app root (e.g. layout or provider) and use useBlinkAuth() for auth-aware Blink.
 * Does not modify existing useAuth from lib/hooks/useAuth.
 */

export type BlinkConfig = {
  apiKey?: string
  environment?: 'development' | 'staging' | 'production'
}

let blinkInitialized = false

export function initBlinkSDK(config: BlinkConfig = {}): void {
  if (typeof window === 'undefined') return
  const apiKey = config.apiKey ?? process.env.NEXT_PUBLIC_BLINK_API_KEY
  if (apiKey) {
    // Placeholder: wire to actual Blink SDK when available
    blinkInitialized = true
  }
}

export function isBlinkInitialized(): boolean {
  return blinkInitialized
}
