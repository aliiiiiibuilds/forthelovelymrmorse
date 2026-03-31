'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface PaymentMethod { id: string; name: string; tag: string; note?: string }

export default function RedeemPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [selected, setSelected] = useState<PaymentMethod | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/player/payment-methods?type=REDEEM').then(r => r.json())
      .then(d => { setMethods(d.methods || []); setLoading(false) })
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
    </div>
  )

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">🏆 Redeem</h1>
        <p className="page-subtitle">Withdraw your winnings via your preferred method</p>
      </div>
      <div className="page-body">
        {selected ? (
          <div className="fade-in" style={{ maxWidth: 520 }}>
            <button onClick={() => setSelected(null)} className="btn-secondary btn btn-sm" style={{ marginBottom: 20 }}>← Back to methods</button>
            <div className="panel" style={{ padding: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: 'linear-gradient(135deg, var(--gold-1), #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🏆</div>
                <div>
                  <h2 style={{ fontWeight: 800, fontSize: 22, margin: 0 }}>{selected.name}</h2>
                  <p style={{ color: 'var(--white-2)', fontSize: 13, margin: '4px 0 0' }}>Contact support with your {selected.name} tag</p>
                </div>
              </div>

              <div className="alert-warning alert" style={{ marginBottom: 16 }}>
                <span>⚠️</span>
                <span style={{ fontSize: 13 }}>To redeem, open <strong>Live Chat</strong> and provide your {selected.name} tag to the agent.</span>
              </div>

              {selected.note && (
                <div className="alert-info alert" style={{ marginBottom: 16 }}>
                  <span>ℹ️</span>
                  <span style={{ fontSize: 13 }}>{selected.note}</span>
                </div>
              )}

              <Link href="/chat" className="quick-btn btn btn-full" style={{ marginTop: 8 }}>💬 Open Live Chat</Link>
            </div>
          </div>
        ) : methods.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', padding: 48, color: 'var(--white-2)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏦</div>
            <p>No redeem methods available at the moment.</p>
          </div>
        ) : (
          <div className="grid-3">
            {methods.map(m => (
              <div key={m.id} className="panel" onClick={() => setSelected(m)} style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,207,90,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.background = '' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🏆</div>
                <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>{m.name}</h3>
                <p style={{ color: 'var(--white-2)', fontSize: 13, marginBottom: 16 }}>Tap to see instructions</p>
                <span style={{ color: 'var(--gold-1)', fontSize: 13, fontWeight: 700 }}>Select →</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
