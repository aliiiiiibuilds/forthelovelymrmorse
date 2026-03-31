'use client'
import { useEffect, useRef, useState, use, useCallback } from 'react'
import Link from 'next/link'
import { useSSE } from '@/hooks/useSSE'

interface Message { id: string; sender: 'PLAYER' | 'AGENT'; content?: string; imageUrl?: string; isIdImage?: boolean; createdAt: string }
interface Player { id: string; username: string; locked: boolean; status: string }

export default function AgentChatPage({ params }: { params: Promise<{ playerId: string }> }) {
  const { playerId } = use(params)
  const [messages, setMessages] = useState<Message[]>([])
  const [player, setPlayer] = useState<Player | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    const res = await fetch(`/api/agent/chat/${playerId}`)
    const data = await res.json()
    if (data.conversation) {
      setMessages(data.conversation.messages)
      setPlayer(data.conversation.user)
      setConversationId(data.conversation.id)
    }
    setLoading(false)
  }, [playerId])

  useEffect(() => { load() }, [load])

  // SSE — get notified when player sends a message
  useSSE({
    new_message: (data: unknown) => {
      const d = data as { playerId?: string }
      if (d.playerId === playerId) load()
    },
  })

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (content?: string, imageUrl?: string) => {
    if ((!content && !imageUrl) || !conversationId) return
    setSending(true)

    // Optimistic update
    const temp: Message = {
      id: 'temp-' + Date.now(),
      sender: 'AGENT',
      content: content || undefined,
      imageUrl: imageUrl || undefined,
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, temp])
    setInput('')

    try {
      await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, content, imageUrl }),
      })
      await load()
    } finally { setSending(false) }
  }

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('folder', 'chat')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) await send(undefined, data.url)
    } finally { setUploading(false) }
  }

  const fmt = (d: string) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const openImg = (url: string) => {
    const w = window.open()
    if (w) w.document.write(`<html><body style="margin:0;background:#000"><img src="${url}" style="max-width:100%;display:block;"/></body></html>`)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.09)', background: 'rgba(8,2,18,0.85)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <Link href="/agent/chat" className="btn-secondary btn btn-sm" style={{ flexShrink: 0 }}>←</Link>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--pink-1), #7e22ce)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
          {player?.username[0].toUpperCase()}
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{player?.username}</div>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginTop: 2 }}>
            <span className={`badge badge-${player?.status?.toLowerCase()}`} style={{ fontSize: 10, padding: '1px 7px' }}>{player?.status}</span>
            {player?.locked && <span className="badge badge-locked" style={{ fontSize: 10, padding: '1px 7px' }}>🔒</span>}
          </div>
        </div>
        <Link href={`/agent/players/${playerId}`} className="btn-secondary btn btn-sm" style={{ flexShrink: 0, fontSize: 12 }}>Profile</Link>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--white-2)', marginTop: 60 }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>💬</div>
            <p style={{ fontWeight: 600 }}>No messages yet</p>
          </div>
        )}
        {messages.map(msg => {
          const isAgent = msg.sender === 'AGENT'
          const isTemp = msg.id.startsWith('temp-')
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isAgent ? 'flex-end' : 'flex-start', opacity: isTemp ? 0.7 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, flexDirection: isAgent ? 'row-reverse' : 'row' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: isAgent ? 'linear-gradient(135deg, var(--pink-1), #be185d)' : 'linear-gradient(135deg, #7e22ce, var(--pink-1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                  {isAgent ? '🛡️' : '👤'}
                </div>
                <div style={{ maxWidth: '75%' }}>
                  {msg.isIdImage && <div style={{ fontSize: 11, color: 'var(--gold-1)', marginBottom: 3, fontWeight: 700, textAlign: isAgent ? 'right' : 'left' }}>🪪 ID Image</div>}
                  {msg.imageUrl ? (
                    <div style={{ borderRadius: 12, overflow: 'hidden', maxWidth: 240, border: msg.isIdImage ? '2px solid var(--gold-1)' : '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}
                      onClick={() => openImg(msg.imageUrl!)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={msg.imageUrl} alt="attachment" style={{ width: '100%', display: 'block' }} />
                    </div>
                  ) : (
                    <div className={`chat-bubble ${isAgent ? 'chat-bubble-player' : 'chat-bubble-agent'}`}>{msg.content}</div>
                  )}
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 3, paddingInline: 33 }}>
                {isTemp ? 'Sending...' : fmt(msg.createdAt)}
              </span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.09)', background: 'rgba(8,2,18,0.85)', flexShrink: 0, paddingBottom: 'calc(10px + env(safe-area-inset-bottom))' }}>
        <form onSubmit={e => { e.preventDefault(); if (input.trim()) send(input.trim()) }} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="button" className="btn-secondary btn btn-sm" style={{ flexShrink: 0, minHeight: 42, padding: '0 12px' }}
            disabled={uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '📎'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />
          <input style={{ flex: 1, marginBottom: 0, padding: '11px 14px' }} placeholder={`Message ${player?.username ?? ''}...`} value={input} onChange={e => setInput(e.target.value)} disabled={sending} />
          <button type="submit" className="primary-btn btn" style={{ flexShrink: 0, padding: '0 16px', minHeight: 42, background: 'linear-gradient(135deg, #be185d, #7e22ce)' }}
            disabled={sending || !input.trim()}>
            {sending ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '➤'}
          </button>
        </form>
      </div>
    </div>
  )
}
