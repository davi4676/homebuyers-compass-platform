'use client'

import { Suspense } from 'react'
import { ResultsPageContent, resultsPageFallback } from './ResultsPageContent'

export default function ResultsPage() {
  return (
    <Suspense fallback={resultsPageFallback}>
      <ResultsPageContent />
    </Suspense>
  )
}
