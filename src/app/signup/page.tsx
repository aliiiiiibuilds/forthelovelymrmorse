'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: form.username, password: form.password }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Signup failed'); return }
      router.push('/chat')
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-wrapper">
      <div className="glass-card auth-card fade-in">
        <div className="brand-top">
          <div className="mini-badge">🚀 Join Vault</div>
          <h1>Create Account</h1>
          <p className="subtitle">Start your journey today</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label>Username</label>
          <input type="text" placeholder="e.g. player_one" value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required autoFocus />

          <label>Password / PIN</label>
          <input type="password" placeholder="Min 4 characters" value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />

          <label>Confirm Password</label>
          <input type="password" placeholder="Repeat password" value={form.confirm}
            onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required />

          {error && <div className="message-box error" style={{ marginTop: 8 }}>⚠️ {error}</div>}

          <div className="message-box warning" style={{ marginTop: 8, fontSize: 13 }}>
            🔒 New accounts start locked. Submit your ID via live chat to unlock.
          </div>

          <button className="primary-btn glow-btn btn-full" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <><span className="spinner" /> Creating...</> : '🚀 Create Account'}
          </button>
        </form>

        <div className="neon-divider" />
        <p style={{ textAlign: 'center', color: 'var(--white-2)', fontSize: 14 }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--purple-3)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
