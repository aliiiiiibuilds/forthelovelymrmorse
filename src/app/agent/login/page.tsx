'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function AgentLoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/agent-login', {
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
      // Use window.location for hard redirect — ensures middleware re-reads the cookie
      window.location.href = '/agent/dashboard'
    } catch {
      setError('Network error')
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="glass-card auth-card fade-in">
        <div className="brand-top">
          <div className="mini-badge">🛡️ Authorized Personnel Only</div>
          <h1>Agent Panel</h1>
          <p className="subtitle">Vault Platform Management</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label>Agent Username</label>
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            required
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
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
            style={{ marginTop: 12, background: 'linear-gradient(135deg, #be185d, #7e22ce)' }}
          >
            {loading ? <><span className="spinner" /> Signing in...</> : '🛡️ Access Dashboard'}
          </button>
        </form>

        <div className="neon-divider" />
        <p style={{ textAlign: 'center' }}>
          <Link href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>← Back to player portal</Link>
        </p>
      </div>
    </div>
  )
}
