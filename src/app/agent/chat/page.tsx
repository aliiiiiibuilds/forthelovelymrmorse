'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSSE } from '@/hooks/useSSE'

interface Conversation {
  id: string
  user: { id: string; username: string; locked: boolean; status: string }
  messages: { content?: string; createdAt: string; sender: string; isIdImage?: boolean }[]
  updatedAt: string
  agentUnread: number
}

export default function AgentChatListPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await fetch('/api/agent/chat')
    const data = await res.json()
    setConversations(data.conversations || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // SSE — refresh list when any player sends a message
  useSSE({ new_message: () => load() })

  const fmt = (d: string) => {
    const date = new Date(d); const now = new Date()
    return date.toDateString() === now.toDateString()
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString()
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">💬 Live Chat</h1>
        <p className="page-subtitle">All player conversations</p>
      </div>
      <div className="page-body">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <span className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : conversations.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', padding: 48, color: 'var(--white-2)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
            <p>No conversations yet.</p>
          </div>
        ) : (
          <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
            {conversations.map((c, i) => {
              const last = c.messages[0]
              const hasId = c.messages.some(m => m.isIdImage)
              const hasUnread = c.agentUnread > 0
              return (
                <Link key={c.id} href={`/agent/chat/${c.user.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 18px', borderBottom: i < conversations.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none', background: hasUnread ? 'rgba(182,109,255,0.06)' : 'transparent', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = hasUnread ? 'rgba(182,109,255,0.06)' : 'transparent')}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--pink-1), #7e22ce)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, flexShrink: 0, position: 'relative' }}>
                      {c.user.username[0].toUpperCase()}
                      {hasId && <span style={{ position: 'absolute', top: -2, right: -2, width: 16, height: 16, background: 'var(--gold-1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, border: '2px solid rgba(8,2,18,0.9)' }}>🪪</span>}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                        <span style={{ fontWeight: hasUnread ? 800 : 600, fontSize: 15, color: hasUnread ? 'white' : 'var(--white-1)' }}>{c.user.username}</span>
                        <span className={`badge badge-${c.user.status.toLowerCase()}`} style={{ fontSize: 10, padding: '1px 7px' }}>{c.user.status}</span>
                        {c.user.locked && <span className="badge badge-locked" style={{ fontSize: 10, padding: '1px 7px' }}>🔒</span>}
                      </div>
                      <div style={{ fontSize: 13, color: hasUnread ? 'var(--white-2)' : 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: hasUnread ? 600 : 400 }}>
                        {last ? (last.sender === 'AGENT' ? '↩ You: ' : '') + (last.content || '📎 Image') : 'No messages yet'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{last ? fmt(last.createdAt) : fmt(c.updatedAt)}</span>
                      {hasUnread && (
                        <span style={{ minWidth: 20, height: 20, background: '#ef4444', borderRadius: 99, fontSize: 11, fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                          {c.agentUnread > 99 ? '99+' : c.agentUnread}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
