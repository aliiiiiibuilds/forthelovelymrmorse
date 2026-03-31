'use client'
import { useEffect, useState, useCallback } from 'react'

interface Method { id: string; type: string; name: string; tag: string; qrCodeUrl?: string; note?: string; active: boolean; sortOrder: number }
const emptyForm = { type: 'DEPOSIT', name: '', tag: '', qrCodeUrl: '', note: '', active: true, sortOrder: 0 }

export default function AgentPaymentMethodsPage() {
  const [methods, setMethods] = useState<Method[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Method | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [qrUploading, setQrUploading] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/agent/payment-methods')
    const data = await res.json()
    setMethods(data.methods || []); setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setShowModal(true) }
  const openEdit = (m: Method) => { setEditing(m); setForm({ type: m.type, name: m.name, tag: m.tag, qrCodeUrl: m.qrCodeUrl || '', note: m.note || '', active: m.active, sortOrder: m.sortOrder }); setShowModal(true) }

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) await fetch(`/api/agent/payment-methods/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      else await fetch('/api/agent/payment-methods', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      setShowModal(false); load()
    } finally { setSaving(false) }
  }

  const del = async (id: string) => {
    if (!confirm('Delete this payment method?')) return
    await fetch(`/api/agent/payment-methods/${id}`, { method: 'DELETE' }); load()
  }

  const uploadQR = async (file: File) => {
    setQrUploading(true)
    const fd = new FormData(); fd.append('file', file); fd.append('folder', 'qrcodes')
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.url) setForm(f => ({ ...f, qrCodeUrl: data.url }))
    setQrUploading(false)
  }

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div><h1 className="page-title">💳 Payment Methods</h1><p className="page-subtitle">Manage deposit and redeem payment instructions</p></div>
          <button onClick={openCreate} className="quick-btn btn">+ Add Method</button>
        </div>
      </div>

      <div className="page-body">
        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div> : (
          <>
            {[
              { label: '💰 Deposit Methods', data: methods.filter(m => m.type === 'DEPOSIT') },
              { label: '🏆 Redeem Methods', data: methods.filter(m => m.type === 'REDEEM') },
            ].map(group => (
              <div key={group.label} style={{ marginBottom: 32 }}>
                <h2 style={{ fontWeight: 800, fontSize: 18, marginBottom: 14, color: 'var(--white-2)' }}>{group.label}</h2>
                {group.data.length === 0 ? (
                  <div className="panel" style={{ textAlign: 'center', padding: 32, color: 'var(--white-2)' }}>No methods configured yet</div>
                ) : (
                  <div className="grid-3">
                    {group.data.map(m => (
                      <div key={m.id} className="panel" style={{ opacity: m.active ? 1 : 0.55 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 4 }}>{m.name}</div>
                            <span style={{ color: 'var(--purple-3)', fontSize: 14, fontWeight: 600 }}>{m.tag}</span>
                          </div>
                          <span className={`badge badge-${m.active ? 'active' : 'inactive'}`}>{m.active ? 'Active' : 'Off'}</span>
                        </div>
                        {m.note && <p style={{ fontSize: 13, color: 'var(--white-2)', marginBottom: 12, lineHeight: 1.5 }}>{m.note}</p>}
                        {m.qrCodeUrl && (
                          <div style={{ marginBottom: 12 }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={m.qrCodeUrl} alt="QR" style={{ width: 72, height: 72, background: 'white', padding: 4, borderRadius: 8, objectFit: 'contain' }} />
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => openEdit(m)} className="btn-secondary btn btn-sm">✏️ Edit</button>
                          <button onClick={() => del(m.id)} className="btn-danger btn btn-sm">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <h3 className="modal-title">{editing ? '✏️ Edit' : '+ Add'} Payment Method</h3>
            <form onSubmit={save}>
              <div className="grid-2" style={{ gap: 12 }}>
                <div><label>Type</label><select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}><option value="DEPOSIT">Deposit</option><option value="REDEEM">Redeem</option></select></div>
                <div><label>Active</label><select value={form.active ? 'yes' : 'no'} onChange={e => setForm(f => ({ ...f, active: e.target.value === 'yes' }))}><option value="yes">Active</option><option value="no">Inactive</option></select></div>
              </div>
              <label>Method Name</label>
              <input placeholder="e.g. Cash App" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              <label>Tag / Handle</label>
              <input placeholder="e.g. $VaultCash" value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} required />
              <label>Note (optional)</label>
              <input placeholder="Instructions for player" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
              <label>QR Code Image</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input placeholder="URL or upload →" value={form.qrCodeUrl} onChange={e => setForm(f => ({ ...f, qrCodeUrl: e.target.value }))} style={{ flex: 1, marginBottom: 0 }} />
                <label className="btn-secondary btn btn-sm" style={{ cursor: 'pointer', flexShrink: 0 }}>
                  {qrUploading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '📤 Upload'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadQR(f) }} />
                </label>
              </div>
              {form.qrCodeUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.qrCodeUrl} alt="QR Preview" style={{ width: 72, height: 72, marginTop: 8, background: 'white', padding: 4, borderRadius: 8, objectFit: 'contain' }} />
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="submit" className="primary-btn btn" disabled={saving}>
                  {saving ? <><span className="spinner" />Saving...</> : editing ? '✓ Update' : '+ Create'}
                </button>
                <button type="button" className="btn-secondary btn" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
