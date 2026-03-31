'use client'
import { useEffect, useState } from 'react'

interface Promo { id: string; title: string; code: string; description: string; expiresAt?: string; statuses: string }

export default function PromoPage() {
  const [promos, setPromos] = useState<Promo[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/player/promos').then(r => r.json()).then(d => { setPromos(d.promos || []); setLoading(false) })
  }, [])

  const copy = (code: string) => { navigator.clipboard.writeText(code); setCopied(code); setTimeout(() => setCopied(null), 2000) }

  const statusColors: Record<string, string> = { FREE: 'rgba(255,255,255,0.6)', VIP: 'var(--gold-1)', VVIP: 'var(--purple-3)' }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
    </div>
  )

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">🎁 Promotions</h1>
        <p className="page-subtitle">Exclusive bonuses and offers for your membership tier</p>
      </div>
      <div className="page-body">
        {promos.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', padding: 48, color: 'var(--white-2)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎁</div>
            <p>No promotions available for your tier right now.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {promos.map(p => {
              const expired = p.expiresAt && new Date(p.expiresAt) < new Date()
              const tiers = p.statuses.split(',').map(s => s.trim())
              return (
                <div key={p.id} className="promo-card" style={{ opacity: expired ? 0.55 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                        <h3 style={{ fontWeight: 800, fontSize: 20, margin: 0 }}>{p.title}</h3>
                        {expired && <span className="badge badge-inactive">Expired</span>}
                        {tiers.map(t => (
                          <span key={t} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, border: `1px solid ${statusColors[t]}50`, color: statusColors[t], background: `${statusColors[t]}15` }}>{t}</span>
                        ))}
                      </div>
                      <p style={{ color: 'var(--white-2)', fontSize: 14, marginBottom: 10, lineHeight: 1.6 }}>{p.description}</p>
                      {p.expiresAt && (
                        <p style={{ fontSize: 12, color: expired ? 'var(--danger)' : 'var(--white-2)' }}>
                          {expired ? '⏰ Expired: ' : '⏳ Expires: '}{new Date(p.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 11, color: 'var(--white-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Promo Code</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 12, padding: '8px 16px' }}>
                        <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '0.1em', color: 'var(--purple-3)' }}>{p.code}</span>
                        <button onClick={() => copy(p.code)} className="quick-btn btn btn-sm" disabled={!!expired} style={{ padding: '5px 12px', fontSize: 12 }}>
                          {copied === p.code ? '✓' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
