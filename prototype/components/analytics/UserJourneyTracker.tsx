/**
 * User Journey Tracker Component
 * Tracks user behavior and journey progression for analytics
 */

'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface JourneyEvent {
  event: string
  timestamp: number
  path: string
  metadata?: Record<string, any>
}

interface UserJourneyTrackerProps {
  event?: string
}

export default function UserJourneyTracker({ event }: UserJourneyTrackerProps = {}) {
  const pathname = usePathname()

  useEffect(() => {
    if (event) {
      trackEvent(event)
    }
    // Track page views
    const trackPageView = () => {
      const event: JourneyEvent = {
        event: 'page_view',
        timestamp: Date.now(),
        path: pathname,
      }

      // Store in localStorage for analytics
      const journey = JSON.parse(localStorage.getItem('user_journey') || '[]')
      journey.push(event)
      
      // Keep last 100 events
      if (journey.length > 100) {
        journey.shift()
      }
      
      localStorage.setItem('user_journey', JSON.stringify(journey))

      // Send to analytics service (placeholder)
      if (typeof window !== 'undefined' && (window as any).analytics) {
        ;(window as any).analytics.track('Page Viewed', {
          path: pathname,
          timestamp: Date.now(),
        })
      }
    }

    trackPageView()
  }, [pathname, event])

  return null // This component doesn't render anything
}

// Helper functions for tracking specific events
export const trackEvent = (eventName: string, metadata?: Record<string, any>) => {
  const event: JourneyEvent = {
    event: eventName,
    timestamp: Date.now(),
    path: typeof window !== 'undefined' ? window.location.pathname : '',
    metadata,
  }

  const journey = JSON.parse(localStorage.getItem('user_journey') || '[]')
  journey.push(event)
  
  if (journey.length > 100) {
    journey.shift()
  }
  
  localStorage.setItem('user_journey', JSON.stringify(journey))

  // Send to analytics service
  if (typeof window !== 'undefined' && (window as any).analytics) {
    ;(window as any).analytics.track(eventName, metadata)
  }
}

export const getJourneyData = (): JourneyEvent[] => {
  if (typeof window === 'undefined') return []
  return JSON.parse(localStorage.getItem('user_journey') || '[]')
}

export const clearJourneyData = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('user_journey')
}
