'use client'
import { useEffect, useState, use, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Player { id: string; username: string; locked: boolean; status: string; createdAt: string }
interface Message { id: string; sender: string; content?: string; imageUrl?: string; isIdImage?: boolean; createdAt: string }

export default function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [player, setPlayer] = useState<Player | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('FREE')
  const [locked, setLocked] = useState(true)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    const [pRes, cRes] = await Promise.all([fetch(`/api/agent/players/${id}`), fetch(`/api/agent/chat/${id}`)])
    const pData = await pRes.json(); const cData = await cRes.json()
    setPlayer(pData.user); setStatus(pData.user?.status || 'FREE'); setLocked(pData.user?.locked ?? true)
    setMessages(cData.conversation?.messages || []); setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const save = async () => {
    setSaving(true)
    await fetch(`/api/agent/players/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, locked }) })
    setSaving(false); load()
  }

  const handleDelete = async () => {
    if (!confirm(`Delete player "${player?.username}"? This cannot be undone.`)) return
    setDeleting(true)
    await fetch(`/api/agent/players/${id}`, { method: 'DELETE' })
    router.push('/agent/players')
  }

  const idImages = messages.filter(m => m.isIdImage)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
    </div>
  )

  if (!player) return <div className="page-body" style={{ paddingTop: 40 }}><div className="message-box error">Player not found.</div></div>

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/agent/players" className="btn-secondary btn btn-sm">← Back</Link>
          <div>
            <h1 className="page-title">{player.username}</h1>
            <p className="page-subtitle">Player detail & management</p>
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="grid-2" style={{ alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Info */}
            <div className="panel">
              <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 16 }}>Account Info</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Username', value: player.username },
                  { label: 'Joined', value: new Date(player.createdAt).toLocaleDateString() },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--white-2)', fontSize: 13 }}>{row.label}</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--white-2)', fontSize: 13 }}>Status</span>
                  <span className={`badge badge-${player.status.toLowerCase()}`}>{player.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--white-2)', fontSize: 13 }}>Access</span>
                  <span className={`badge badge-${player.locked ? 'locked' : 'unlocked'}`}>{player.locked ? '🔒 Locked' : '✓ Unlocked'}</span>
                </div>
              </div>
            </div>

            {/* Edit */}
            <div className="panel">
              <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 16 }}>Edit Account</h3>
              <label>Status Tier</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option>FREE</option><option>VIP</option><option>VVIP</option>
              </select>
              <label>Account Access</label>
              <select value={locked ? 'locked' : 'unlocked'} onChange={e => setLocked(e.target.value === 'locked')}>
                <option value="locked">🔒 Locked</option>
                <option value="unlocked">✓ Unlocked</option>
              </select>
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button className="primary-btn btn" onClick={save} disabled={saving}>
                  {saving ? <><span className="spinner" />Saving...</> : '✓ Save Changes'}
                </button>
                <Link href={`/agent/chat/${player.id}`} className="btn-cyan btn btn-sm">💬 Open Chat</Link>
              </div>
            </div>

            {/* Danger */}
            <div className="panel" style={{ borderColor: 'rgba(255,107,138,0.3)', background: 'rgba(255,107,138,0.05)' }}>
              <h3 style={{ fontWeight: 800, fontSize: 16, color: 'var(--danger)', marginBottom: 10 }}>⚠️ Danger Zone</h3>
              <p style={{ fontSize: 13, color: 'var(--white-2)', marginBottom: 14 }}>Permanently delete this account and all data.</p>
              <button className="btn-danger btn btn-sm" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : '🗑️ Delete Player'}
              </button>
            </div>
          </div>

          {/* ID Images */}
          <div className="panel">
            <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 16 }}>🪪 Submitted ID Images ({idImages.length})</h3>
            {idImages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--white-2)' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🪪</div>
                <p style={{ fontSize: 14 }}>No ID images submitted yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {idImages.map(img => (
                  <div key={img.id} style={{ border: '2px solid rgba(255,207,90,0.4)', borderRadius: 14, overflow: 'hidden' }}>
                    <div style={{ background: 'rgba(255,207,90,0.10)', padding: '6px 12px', fontSize: 12, color: 'var(--gold-1)', fontWeight: 700 }}>
                      📅 {new Date(img.createdAt).toLocaleString()}
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.imageUrl!} alt="ID" style={{ width: '100%', display: 'block', cursor: 'pointer' }} onClick={() => window.open(img.imageUrl, '_blank')} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
