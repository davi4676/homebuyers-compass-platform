import { Suspense, type ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="app-page-shell flex min-h-[50vh] flex-col items-center justify-center px-4 py-12 text-center">
          <p className="text-[var(--nq-ed-muted)]">Loading dashboard…</p>
        </div>
      }
    >
      {children}
    </Suspense>
  )
}
