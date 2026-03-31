'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }
      // Hard redirect so middleware re-reads cookie correctly
      window.location.href = data.user?.locked ? '/chat' : '/dashboard'
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="glass-card auth-card fade-in">
        <div className="brand-top">
          <div className="mini-badge">🔐 Player Portal</div>
          <h1>Welcome Back</h1>
          <p className="subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label>Username</label>
          <input
            type="text"
            placeholder="Your username"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            required
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
          />

          <label>Password / PIN</label>
          <input
            type="password"
            placeholder="Your password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
          />

          {error && (
            <div className="message-box error" style={{ marginTop: 8 }}>⚠️ {error}</div>
          )}

          <button
            className="primary-btn glow-btn btn-full"
            type="submit"
            disabled={loading}
            style={{ marginTop: 12 }}
          >
            {loading ? <><span className="spinner" /> Signing in...</> : '→ Sign In'}
          </button>
        </form>

        <div className="neon-divider" />
        <p style={{ textAlign: 'center', color: 'var(--white-2)', fontSize: 14 }}>
          New here?{' '}
          <Link href="/signup" style={{ color: 'var(--purple-3)', fontWeight: 600 }}>Create account</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 8 }}>
          <Link href="/agent/login" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Agent login →</Link>
        </p>
      </div>
    </div>
  )
}
