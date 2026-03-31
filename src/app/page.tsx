'use client'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="auth-wrapper">
      <div style={{ width: '100%', maxWidth: 600, textAlign: 'center' }}>
        <div className="glass-card auth-card" style={{ maxWidth: 600, padding: '48px 40px' }}>
          {/* Badge */}
          <div className="mini-badge">🔐 Premium Gaming Platform</div>

          {/* Logo */}
          <h1 style={{ fontSize: 52, fontWeight: 800, letterSpacing: 2, marginBottom: 12,
            textShadow: '0 0 30px rgba(182,109,255,0.5)',
            background: 'linear-gradient(135deg, white 40%, var(--purple-3) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            VAULT
          </h1>
          <p className="subtitle" style={{ fontSize: 16, marginBottom: 36 }}>
            Secure, fast, and exclusive. Built for winners.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
            <Link href="/signup" className="btn-primary btn btn-lg" style={{ minWidth: 160 }}>
              🚀 Create Account
            </Link>
            <Link href="/login" className="btn-secondary btn btn-lg" style={{ minWidth: 140 }}>
              Sign In →
            </Link>
          </div>

          {/* Features */}
          <div className="grid-3" style={{ gap: 12, marginBottom: 32 }}>
            {[
              { icon: '⚡', title: 'Instant Access', desc: 'Get started in seconds' },
              { icon: '🛡️', title: 'Secure & Private', desc: 'Bank-level security' },
              { icon: '💎', title: 'VIP Benefits', desc: 'Exclusive member perks' },
            ].map(f => (
              <div key={f.title} style={{ padding: '18px 14px', borderRadius: 18, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', textAlign: 'center' }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: 'var(--white-2)' }}>{f.desc}</div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
            Agent?{' '}
            <Link href="/agent/login" style={{ color: 'var(--purple-3)' }}>Access Dashboard →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
