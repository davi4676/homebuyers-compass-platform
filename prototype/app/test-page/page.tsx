'use client'

export default function TestPage() {
  return (
    <div style={{ padding: '50px', backgroundColor: '#0a0a0a', color: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>✅ Test Page Works!</h1>
      <p style={{ fontSize: '24px' }}>If you can see this, the server is working.</p>
      <p style={{ fontSize: '18px', marginTop: '20px', color: '#06b6d4' }}>
        Go back to <a href="/" style={{ color: '#f97316' }}>http://localhost:3002</a>
      </p>
    </div>
  )
}
