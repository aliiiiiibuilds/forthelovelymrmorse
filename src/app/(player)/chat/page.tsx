'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useSSE } from '@/hooks/useSSE'

interface Message { id: string; sender: 'PLAYER' | 'AGENT'; content?: string; imageUrl?: string; isIdImage?: boolean; createdAt: string }

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [uploadingId, setUploadingId] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const idFileRef = useRef<HTMLInputElement>(null)

  const fetchMessages = useCallback(async () => {
    const res = await fetch('/api/chat/messages')
    const data = await res.json()
    if (data.messages) setMessages(data.messages)
    setLoading(false)
  }, [])

  // Initial load
  useEffect(() => { fetchMessages() }, [fetchMessages])

  // SSE — receive new messages from agent in real time, no polling needed
  useSSE({
    new_message: () => {
      fetchMessages()
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (content?: string, imageUrl?: string, isIdImage = false) => {
    if (!content && !imageUrl) return
    setSending(true)

    // Optimistic update — show message instantly
    const temp: Message = {
      id: 'temp-' + Date.now(),
      sender: 'PLAYER',
      content: content || undefined,
      imageUrl: imageUrl || undefined,
      isIdImage,
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, temp])
    setInput('')

    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, imageUrl, isIdImage }),
      })
      await fetchMessages()
    } finally {
      setSending(false)
    }
  }

  const handleUpload = async (file: File, isId: boolean) => {
    if (isId) setUploadingId(true); else setUploadingImg(true)
    try {
      const fd = new FormData()
      fd.append('file', file); fd.append('folder', 'chat')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) await send(undefined, data.url, isId)
    } finally {
      if (isId) setUploadingId(false); else setUploadingImg(false)
    }
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
      <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.09)', background: 'rgba(8,2,18,0.85)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #7e22ce, var(--pink-1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🎧</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Vault Support</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
            <span style={{ fontSize: 12, color: 'var(--white-2)' }}>Online</span>
          </div>
        </div>
        <button onClick={() => idFileRef.current?.click()} className="quick-btn btn btn-sm" disabled={uploadingId}>
          {uploadingId ? <><span className="spinner" style={{ width: 13, height: 13 }} />Uploading...</> : '🪪 Submit ID'}
        </button>
        <input ref={idFileRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, true); e.target.value = '' }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--white-2)', marginTop: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Start a conversation</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Use <strong style={{ color: 'var(--purple-3)' }}>Submit ID</strong> to send your verification image</p>
          </div>
        )}
        {messages.map(msg => {
          const isPlayer = msg.sender === 'PLAYER'
          const isTemp = msg.id.startsWith('temp-')
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isPlayer ? 'flex-end' : 'flex-start', opacity: isTemp ? 0.7 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, flexDirection: isPlayer ? 'row-reverse' : 'row' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: isPlayer ? 'linear-gradient(135deg, #7e22ce, #c026d3)' : 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                  {isPlayer ? '👤' : '🎧'}
                </div>
                <div style={{ maxWidth: '75%' }}>
                  {msg.isIdImage && <div style={{ fontSize: 11, color: 'var(--gold-1)', marginBottom: 3, fontWeight: 700, textAlign: isPlayer ? 'right' : 'left' }}>🪪 ID Verification</div>}
                  {msg.imageUrl ? (
                    <div style={{ borderRadius: 12, overflow: 'hidden', maxWidth: 260, border: msg.isIdImage ? '2px solid var(--gold-1)' : '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}
                      onClick={() => openImg(msg.imageUrl!)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={msg.imageUrl} alt="attachment" style={{ width: '100%', display: 'block' }} />
                    </div>
                  ) : (
                    <div className={`chat-bubble ${isPlayer ? 'chat-bubble-player' : 'chat-bubble-agent'}`}>{msg.content}</div>
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
            disabled={uploadingImg} onClick={() => fileRef.current?.click()}>
            {uploadingImg ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '📎'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, false); e.target.value = '' }} />
          <input style={{ flex: 1, marginBottom: 0, padding: '11px 14px' }} placeholder="Type a message..." value={input} onChange={e => setInput(e.target.value)} disabled={sending} />
          <button type="submit" className="quick-btn btn" style={{ flexShrink: 0, padding: '0 16px', minHeight: 42 }} disabled={sending || !input.trim()}>➤</button>
        </form>
      </div>
    </div>
  )
}
