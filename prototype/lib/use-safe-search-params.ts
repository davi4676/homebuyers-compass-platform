'use client'

import { useSearchParams } from 'next/navigation'

const EMPTY = new URLSearchParams()

/**
 * `useSearchParams()` is only safe under a React Suspense boundary; without it, some navigations
 * can yield a nullish internal state and crash on `.get` / `.toString`. This wrapper always
 * exposes a URLSearchParams-compatible object.
 */
export function useSafeSearchParams() {
  const sp = useSearchParams()
  return sp ?? EMPTY
}
