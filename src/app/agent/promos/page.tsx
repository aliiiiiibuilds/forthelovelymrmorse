'use client'
import { useEffect, useState, useCallback } from 'react'

interface Promo { id: string; title: string; code: string; description: string; expiresAt?: string; statuses: string; active: boolean }
const emptyForm = { title: '', code: '', description: '', expiresAt: '', statuses: ['FREE', 'VIP', 'VVIP'], active: true }
const statusColors: Record<string, string> = { FREE: 'rgba(255,255,255,0.6)', VIP: 'var(--gold-1)', VVIP: 'var(--purple-3)' }

export default function AgentPromosPage() {
  const [promos, setPromos] = useState<Promo[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Promo | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/agent/promos')
    const data = await res.json()
    setPromos(data.promos || []); setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setShowModal(true) }
  const openEdit = (p: Promo) => {
    setEditing(p)
    setForm({ title: p.title, code: p.code, description: p.description, expiresAt: p.expiresAt ? p.expiresAt.split('T')[0] : '', statuses: p.statuses.split(',').map(s => s.trim()), active: p.active })
    setShowModal(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const body = { ...form, statuses: form.statuses.join(','), expiresAt: form.expiresAt || null }
      if (editing) await fetch(`/api/agent/promos/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      else await fetch('/api/agent/promos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      setShowModal(false); load()
    } finally { setSaving(false) }
  }

  const del = async (id: string) => {
    if (!confirm('Delete this promo?')) return
    await fetch(`/api/agent/promos/${id}`, { method: 'DELETE' }); load()
  }

  const toggleStatus = (s: string) => setForm(f => ({ ...f, statuses: f.statuses.includes(s) ? f.statuses.filter(x => x !== s) : [...f.statuses, s] }))

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div><h1 className="page-title">🎁 Promotions</h1><p className="page-subtitle">Manage promo codes and bonuses</p></div>
          <button onClick={openCreate} className="quick-btn btn">+ New Promo</button>
        </div>
      </div>

      <div className="page-body">
        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
          : promos.length === 0 ? (
            <div className="panel" style={{ textAlign: 'center', padding: 48, color: 'var(--white-2)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎁</div>
              <p>No promos created yet. Add your first one!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {promos.map(p => {
                const tiers = p.statuses.split(',').map(s => s.trim())
                const expired = p.expiresAt && new Date(p.expiresAt) < new Date()
                return (
                  <div key={p.id} className="promo-card" style={{ opacity: p.active && !expired ? 1 : 0.55 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                          <h3 style={{ fontWeight: 800, fontSize: 18, margin: 0 }}>{p.title}</h3>
                          <span className={`badge badge-${p.active ? 'active' : 'inactive'}`}>{p.active ? 'Active' : 'Off'}</span>
                          {expired && <span className="badge badge-locked">Expired</span>}
                          {tiers.map(t => <span key={t} style={{ fontSize: 11, padding: '2px 10px', borderRadius: 999, border: `1px solid ${statusColors[t]}50`, color: statusColors[t] }}>{t}</span>)}
                        </div>
                        <p style={{ color: 'var(--white-2)', fontSize: 14, marginBottom: 8, lineHeight: 1.5 }}>{p.description}</p>
                        {p.expiresAt && <span style={{ fontSize: 12, color: expired ? 'var(--danger)' : 'var(--white-2)' }}>⏳ {expired ? 'Expired' : 'Expires'}: {new Date(p.expiresAt).toLocaleDateString()}</span>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: '0.1em', color: 'var(--purple-3)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 12, padding: '6px 16px', marginBottom: 10 }}>{p.code}</div>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button onClick={() => openEdit(p)} className="btn-secondary btn btn-sm">✏️ Edit</button>
                          <button onClick={() => del(p.id)} className="btn-danger btn btn-sm">Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <h3 className="modal-title">{editing ? '✏️ Edit Promo' : '+ New Promo'}</h3>
            <form onSubmit={save}>
              <div className="grid-2" style={{ gap: 12 }}>
                <div><label>Title</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
                <div><label>Promo Code</label><input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required style={{ letterSpacing: '0.1em', fontWeight: 700 }} /></div>
              </div>
              <label>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
              <div className="grid-2" style={{ gap: 12 }}>
                <div><label>Expiry Date (optional)</label><input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} /></div>
                <div><label>Status</label><select value={form.active ? 'active' : 'inactive'} onChange={e => setForm(f => ({ ...f, active: e.target.value === 'active' }))}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
              </div>
              <label>Visible To</label>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                {['FREE', 'VIP', 'VVIP'].map(s => (
                  <button key={s} type="button" onClick={() => toggleStatus(s)}
                    className={form.statuses.includes(s) ? 'primary-btn btn btn-sm' : 'btn-secondary btn btn-sm'}
                    style={form.statuses.includes(s) ? { background: `linear-gradient(135deg, ${statusColors[s]}50, ${statusColors[s]}30)`, border: `1px solid ${statusColors[s]}60`, color: statusColors[s] } : {}}>
                    {s}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="primary-btn btn" disabled={saving || form.statuses.length === 0}>
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
