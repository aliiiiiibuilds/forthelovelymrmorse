'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AgentDashboard() {
  const [stats, setStats] = useState({ total: 0, locked: 0, free: 0, vip: 0, vvip: 0 })
  const [recentPlayers, setRecentPlayers] = useState<{ id: string; username: string; locked: boolean; status: string }[]>([])
  const [conversations, setConversations] = useState<{ id: string; user: { username: string; id: string }; messages: { content?: string; createdAt: string }[]; updatedAt: string }[]>([])

  useEffect(() => {
    fetch('/api/agent/players').then(r => r.json()).then(d => {
      const users = d.users || []
      setStats({ total: users.length, locked: users.filter((u: { locked: boolean }) => u.locked).length, free: users.filter((u: { status: string }) => u.status === 'FREE').length, vip: users.filter((u: { status: string }) => u.status === 'VIP').length, vvip: users.filter((u: { status: string }) => u.status === 'VVIP').length })
      setRecentPlayers(users.slice(0, 5))
    })
    fetch('/api/agent/chat').then(r => r.json()).then(d => setConversations((d.conversations || []).slice(0, 5)))
  }, [])

  const statCards = [
    { label: 'Total Players', value: stats.total, icon: '👥' },
    { label: 'Locked', value: stats.locked, icon: '🔒' },
    { label: 'FREE', value: stats.free, icon: '◦' },
    { label: 'VIP', value: stats.vip, icon: '⭐' },
    { label: 'VVIP', value: stats.vvip, icon: '💎' },
  ]

  return (
    <>
      <div className="page-header">
        <h1 className="page-title" style={{ background: 'linear-gradient(135deg, var(--pink-1), var(--purple-3))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Agent Dashboard
        </h1>
        <p className="page-subtitle">Platform overview and management</p>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
          {statCards.map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <span className="stat-value">{s.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid-2">
          {/* Recent players */}
          <div className="panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 800, fontSize: 18, margin: 0 }}>Recent Players</h2>
              <Link href="/agent/players" className="btn-secondary btn btn-sm">View all →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentPlayers.length === 0 && <p style={{ color: 'var(--white-2)', fontSize: 14 }}>No players yet.</p>}
              {recentPlayers.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #7e22ce, var(--pink-1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                    {p.username[0].toUpperCase()}
                  </div>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{p.username}</span>
                  <span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span>
                  {p.locked && <span className="badge badge-locked" style={{ fontSize: 10 }}>🔒</span>}
                  <Link href={`/agent/players/${p.id}`} className="btn-ghost btn btn-sm">View</Link>
                </div>
              ))}
            </div>
          </div>

          {/* Recent chats */}
          <div className="panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 800, fontSize: 18, margin: 0 }}>Recent Chats</h2>
              <Link href="/agent/chat" className="btn-secondary btn btn-sm">View all →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {conversations.length === 0 && <p style={{ color: 'var(--white-2)', fontSize: 14 }}>No conversations yet.</p>}
              {conversations.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--pink-1), #7e22ce)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                    {c.user.username[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{c.user.username}</div>
                    {c.messages[0] && <div style={{ fontSize: 12, color: 'var(--white-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.messages[0].content || '📎 Image'}</div>}
                  </div>
                  <Link href={`/agent/chat/${c.user.id}`} className="btn-ghost btn btn-sm">Open</Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="neon-divider" />
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { href: '/agent/players', label: '+ Create Player', icon: '👤' },
            { href: '/agent/payment-methods', label: 'Manage Payments', icon: '💳' },
            { href: '/agent/promos', label: 'Manage Promos', icon: '🎁' },
            { href: '/agent/settings', label: 'Site Settings', icon: '⚙️' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="btn-secondary btn">{l.icon} {l.label}</Link>
          ))}
        </div>
      </div>
    </>
  )
}
