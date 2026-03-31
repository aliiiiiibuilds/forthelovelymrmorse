'use client'
import { useEffect, useState } from 'react'

export default function AgentSettingsPage() {
  const [form, setForm] = useState({ messageOfDay: '', depositTag: '', redeemTag: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/agent/settings').then(r => r.json()).then(d => {
      if (d.settings) setForm({ messageOfDay: d.settings.messageOfDay || '', depositTag: d.settings.depositTag || '', redeemTag: d.settings.redeemTag || '' })
      setLoading(false)
    })
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      await fetch('/api/agent/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      setSaved(true); setTimeout(() => setSaved(false), 3000)
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
    </div>
  )

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">⚙️ Site Settings</h1>
        <p className="page-subtitle">Control platform-wide messages and daily tags</p>
      </div>

      <div className="page-body">
        <div style={{ maxWidth: 620 }}>
          <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 26 }}>📢</span>
                <div>
                  <h2 style={{ fontWeight: 800, fontSize: 18, margin: 0 }}>Message of the Day</h2>
                  <p style={{ fontSize: 13, color: 'var(--white-2)', margin: '4px 0 0' }}>Shown prominently on player dashboard</p>
                </div>
              </div>
              <textarea rows={3} placeholder="Enter your message of the day..." value={form.messageOfDay} onChange={e => setForm(f => ({ ...f, messageOfDay: e.target.value }))} style={{ marginBottom: 0 }} />
            </div>

            <div className="panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 26 }}>🏷️</span>
                <div>
                  <h2 style={{ fontWeight: 800, fontSize: 18, margin: 0 }}>Daily Tags</h2>
                  <p style={{ fontSize: 13, color: 'var(--white-2)', margin: '4px 0 0' }}>Shown on player dashboard</p>
                </div>
              </div>
              <label>💰 Daily Deposit Tag</label>
              <input placeholder="e.g. $VaultDaily2024" value={form.depositTag} onChange={e => setForm(f => ({ ...f, depositTag: e.target.value }))} style={{ fontWeight: 700, color: '#7fffd4' }} />
              <label>🏆 Daily Redeem Tag</label>
              <input placeholder="e.g. $RedeemVault" value={form.redeemTag} onChange={e => setForm(f => ({ ...f, redeemTag: e.target.value }))} style={{ fontWeight: 700, color: 'var(--gold-1)', marginBottom: 0 }} />
            </div>

            {/* Preview */}
            <div className="panel" style={{ borderColor: 'rgba(182,109,255,0.3)', background: 'rgba(182,109,255,0.05)' }}>
              <h3 style={{ fontWeight: 800, fontSize: 15, color: 'var(--purple-3)', marginBottom: 12 }}>👁 Preview</h3>
              {form.messageOfDay && (
                <div className="alert-info alert" style={{ marginBottom: 12, fontSize: 14 }}>
                  <span>📢</span><span>{form.messageOfDay}</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {form.depositTag && (
                  <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 12, padding: '8px 14px', fontSize: 14 }}>
                    <span style={{ color: 'var(--white-2)', marginRight: 8, fontSize: 13 }}>Deposit Tag:</span>
                    <span style={{ fontWeight: 700, color: '#7fffd4' }}>{form.depositTag}</span>
                  </div>
                )}
                {form.redeemTag && (
                  <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 12, padding: '8px 14px', fontSize: 14 }}>
                    <span style={{ color: 'var(--white-2)', marginRight: 8, fontSize: 13 }}>Redeem Tag:</span>
                    <span style={{ fontWeight: 700, color: 'var(--gold-1)' }}>{form.redeemTag}</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button type="submit" className="primary-btn btn" disabled={saving}>
                {saving ? <><span className="spinner" />Saving...</> : '✓ Save Settings'}
              </button>
              {saved && <div className="message-box success" style={{ padding: '10px 16px' }}>✓ Settings saved!</div>}
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
