'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface Player { id: string; username: string; locked: boolean; status: string; createdAt: string }

export default function AgentPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ username: '', password: '', status: 'FREE', locked: true })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/agent/players?search=${encodeURIComponent(search)}`)
    const data = await res.json()
    setPlayers(data.users || []); setLoading(false)
  }, [search])

  useEffect(() => { load() }, [load])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setCreateError(''); setCreating(true)
    try {
      const res = await fetch('/api/agent/players', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(createForm) })
      const data = await res.json()
      if (!res.ok) { setCreateError(data.error); return }
      setShowCreate(false); setCreateForm({ username: '', password: '', status: 'FREE', locked: true }); load()
    } finally { setCreating(false) }
  }

  const toggleLock = async (id: string, locked: boolean) => {
    await fetch(`/api/agent/players/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ locked: !locked }) })
    load()
  }

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">Players</h1>
            <p className="page-subtitle">{players.length} total accounts</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="quick-btn btn">+ Create Player</button>
        </div>
      </div>

      <div className="page-body">
        <div style={{ marginBottom: 18 }}>
          <input placeholder="🔍 Search players by username..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 380, marginBottom: 0 }} />
        </div>

        <div className="table-wrapper">
          <table>
            <thead><tr><th>Player</th><th>Status</th><th>Access</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--white-2)' }}>Loading...</td></tr>
              ) : players.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--white-2)' }}>No players found</td></tr>
              ) : players.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #7e22ce, var(--pink-1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                        {p.username[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: 'white' }}>{p.username}</span>
                    </div>
                  </td>
                  <td><span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span></td>
                  <td><span className={`badge badge-${p.locked ? 'locked' : 'unlocked'}`}>{p.locked ? '🔒 Locked' : '✓ Unlocked'}</span></td>
                  <td style={{ fontSize: 13 }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => toggleLock(p.id, p.locked)} className={`btn btn-sm ${p.locked ? 'btn-cyan' : 'btn-ghost'}`}>
                        {p.locked ? '🔓 Unlock' : '🔒 Lock'}
                      </button>
                      <Link href={`/agent/players/${p.id}`} className="btn-ghost btn btn-sm">Details →</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowCreate(false) }}>
          <div className="modal">
            <h3 className="modal-title">+ Create Player Account</h3>
            <form onSubmit={handleCreate}>
              <label>Username</label>
              <input value={createForm.username} onChange={e => setCreateForm(f => ({ ...f, username: e.target.value }))} required autoFocus />
              <label>Password / PIN</label>
              <input type="password" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} required />
              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <label>Status</label>
                  <select value={createForm.status} onChange={e => setCreateForm(f => ({ ...f, status: e.target.value }))}>
                    <option>FREE</option><option>VIP</option><option>VVIP</option>
                  </select>
                </div>
                <div>
                  <label>Access</label>
                  <select value={createForm.locked ? 'locked' : 'unlocked'} onChange={e => setCreateForm(f => ({ ...f, locked: e.target.value === 'locked' }))}>
                    <option value="locked">Locked</option><option value="unlocked">Unlocked</option>
                  </select>
                </div>
              </div>
              {createError && <div className="message-box error">⚠️ {createError}</div>}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" className="primary-btn btn" disabled={creating}>
                  {creating ? <><span className="spinner" />Creating...</> : 'Create Account'}
                </button>
                <button type="button" className="btn-secondary btn" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
