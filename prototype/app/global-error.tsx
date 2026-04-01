'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#0f172a', color: '#f1f5f9', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Something went wrong</h1>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem', maxWidth: '28rem' }}>
          {error.message || 'A critical error occurred. Please refresh the page.'}
        </p>
        <button
          onClick={reset}
          style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', background: '#0891b2', color: '#fff', border: 'none', fontWeight: 500, cursor: 'pointer' }}
        >
          Try again
        </button>
        <a href="/" style={{ marginTop: '1rem', color: '#22d3ee', textDecoration: 'underline' }}>Back to home</a>
      </body>
    </html>
  )
}
