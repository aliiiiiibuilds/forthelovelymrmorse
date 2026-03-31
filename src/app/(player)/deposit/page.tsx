'use client'
import { useEffect, useState } from 'react'

interface PaymentMethod { id: string; name: string; tag: string; qrCodeUrl?: string; note?: string }

export default function DepositPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [selected, setSelected] = useState<PaymentMethod | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/player/payment-methods?type=DEPOSIT').then(r => r.json())
      .then(d => { setMethods(d.methods || []); setLoading(false) })
  }, [])

  const copy = (text: string) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">💰 Deposit</h1>
        <p className="page-subtitle">Choose a payment method to fund your account</p>
      </div>
      <div className="page-body">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : methods.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🚧</div>
            <p style={{ color: 'var(--white-2)' }}>No deposit methods available right now.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {methods.map(m => (
              <div key={m.id} className="panel" onClick={() => setSelected(m)} style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.borderColor = 'rgba(182,109,255,0.5)' }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = '' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg, #7e22ce, #c026d3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, boxShadow: '0 6px 18px rgba(126,34,206,0.35)' }}>💳</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 17 }}>{m.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--purple-3)' }}>{m.tag}</div>
                  </div>
                </div>
                {m.note && <p style={{ fontSize: 13, color: 'var(--white-2)', lineHeight: 1.5, marginBottom: 14 }}>{m.note}</p>}
                <button className="quick-btn btn btn-full btn-sm">View Details →</button>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div className="modal-title" style={{ marginBottom: 0 }}>💰 {selected.name}</div>
                <button className="btn-ghost btn btn-sm" onClick={() => setSelected(null)}>✕</button>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 16, padding: '16px 20px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: 'var(--white-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>Tag / Handle</div>
                <div style={{ fontWeight: 800, fontSize: 24, color: 'var(--purple-3)', marginBottom: 12 }}>{selected.tag}</div>
                <button className="btn-secondary btn btn-sm" onClick={() => copy(selected.tag)}>
                  {copied ? '✓ Copied!' : '📋 Copy Tag'}
                </button>
              </div>

              {selected.qrCodeUrl && (
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--white-2)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>QR Code</div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selected.qrCodeUrl} alt="QR Code" style={{ maxWidth: 200, borderRadius: 14, background: 'white', padding: 8 }} />
                </div>
              )}

              {selected.note && (
                <div className="alert-info alert" style={{ fontSize: 13 }}>ℹ️ {selected.note}</div>
              )}

              <button className="btn-secondary btn btn-full" style={{ marginTop: 16 }} onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
