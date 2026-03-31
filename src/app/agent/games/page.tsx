'use client'
import { useEffect, useState, useCallback } from 'react'

interface Game { id: string; title: string; description?: string; imageUrl?: string; link: string; active: boolean; sortOrder: number }
const emptyForm = { title: '', description: '', imageUrl: '', link: '', active: true, sortOrder: 0 }

export default function AgentGamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Game | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [imgUploading, setImgUploading] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/agent/games')
    const data = await res.json()
    setGames(data.games || []); setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setShowModal(true) }
  const openEdit = (g: Game) => {
    setEditing(g)
    setForm({ title: g.title, description: g.description || '', imageUrl: g.imageUrl || '', link: g.link, active: g.active, sortOrder: g.sortOrder })
    setShowModal(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) {
        await fetch(`/api/agent/games/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      } else {
        await fetch('/api/agent/games', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      }
      setShowModal(false); load()
    } finally { setSaving(false) }
  }

  const del = async (id: string) => {
    if (!confirm('Delete this game?')) return
    await fetch(`/api/agent/games/${id}`, { method: 'DELETE' }); load()
  }

  const uploadImage = async (file: File) => {
    setImgUploading(true)
    const fd = new FormData(); fd.append('file', file); fd.append('folder', 'chat')
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.url) setForm(f => ({ ...f, imageUrl: data.url }))
    setImgUploading(false)
  }

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div><h1 className="page-title">🎮 Games</h1><p className="page-subtitle">Manage games shown to players</p></div>
          <button onClick={openCreate} className="quick-btn btn">+ Add Game</button>
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : games.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', padding: 64 }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>🎮</div>
            <p style={{ color: 'var(--white-2)', fontSize: 15, marginBottom: 18 }}>No games added yet.</p>
            <button onClick={openCreate} className="quick-btn btn">+ Add First Game</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
            {games.map(g => (
              <div key={g.id} className="panel" style={{ padding: 0, overflow: 'hidden', opacity: g.active ? 1 : 0.55 }}>
                {/* Image */}
                <div style={{ height: 150, background: 'linear-gradient(135deg, rgba(126,34,206,0.3), rgba(244,114,182,0.2))', position: 'relative' }}>
                  {g.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={g.imageUrl} alt={g.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🎮</div>
                  )}
                  <div style={{ position: 'absolute', top: 10, right: 10 }}>
                    <span className={`badge badge-${g.active ? 'active' : 'inactive'}`}>{g.active ? 'Active' : 'Off'}</span>
                  </div>
                </div>
                {/* Info */}
                <div style={{ padding: '16px 18px' }}>
                  <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 4 }}>{g.title}</div>
                  {g.description && <p style={{ fontSize: 13, color: 'var(--white-2)', lineHeight: 1.4, marginBottom: 10 }}>{g.description}</p>}
                  <a href={g.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--purple-3)', display: 'block', marginBottom: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    🔗 {g.link}
                  </a>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEdit(g)} className="btn-secondary btn btn-sm">✏️ Edit</button>
                    <button onClick={() => del(g.id)} className="btn-danger btn btn-sm">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="modal" style={{ maxWidth: 540 }}>
            <h3 className="modal-title">{editing ? '✏️ Edit Game' : '🎮 Add Game'}</h3>
            <form onSubmit={save}>
              <label>Game Title</label>
              <input placeholder="e.g. Fire Kirin" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />

              <label>Description (optional)</label>
              <textarea placeholder="Short description of the game..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ minHeight: 70 }} />

              <label>Game Link / URL</label>
              <input placeholder="https://..." value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} required />

              <label>Game Image</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                <input placeholder="Image URL or upload →" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} style={{ flex: 1, marginBottom: 0 }} />
                <label className="btn-secondary btn btn-sm" style={{ cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {imgUploading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '📤 Upload'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f) }} />
                </label>
              </div>
              {form.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.imageUrl} alt="preview" style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 12, marginBottom: 12 }} />
              )}

              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <label>Status</label>
                  <select value={form.active ? 'active' : 'inactive'} onChange={e => setForm(f => ({ ...f, active: e.target.value === 'active' }))}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label>Sort Order</label>
                  <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" className="primary-btn btn" disabled={saving}>
                  {saving ? <><span className="spinner" />Saving...</> : editing ? '✓ Update' : '+ Add Game'}
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
