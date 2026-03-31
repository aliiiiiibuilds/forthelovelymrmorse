'use client'
import { useEffect, useRef, useState } from 'react'
import { useSSE } from '@/hooks/useSSE'

export default function PlayerChatBadge() {
  const [unread, setUnread] = useState(0)
  const initialized = useRef(false)

  // Initial load
  useEffect(() => {
    fetch('/api/player/unread').then(r => r.json()).then(d => {
      setUnread(d.unread || 0)
      initialized.current = true
    }).catch(() => {})
  }, [])

  // SSE — increment when agent sends message
  useSSE({
    new_message: () => {
      if (initialized.current) setUnread(prev => prev + 1)
    },
  })

  if (unread === 0) return null

  return (
    <span style={{ minWidth: 18, height: 18, background: '#ef4444', borderRadius: 99, fontSize: 11, fontWeight: 800, color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', marginLeft: 'auto', boxShadow: '0 0 6px rgba(239,68,68,0.5)' }}>
      {unread > 99 ? '99+' : unread}
    </span>
  )
}
