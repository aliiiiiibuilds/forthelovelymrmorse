'use client'
import { useEffect, useRef, useState } from 'react'
import { useSSE } from '@/hooks/useSSE'

function playSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator(); const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(660, ctx.currentTime)
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3)
  } catch {}
}

export default function AgentChatBadge() {
  const [unread, setUnread] = useState(0)
  const initialized = useRef(false)

  // Initial load
  useEffect(() => {
    fetch('/api/agent/chat/unread').then(r => r.json()).then(d => {
      setUnread(d.unread || 0)
      initialized.current = true
    }).catch(() => {})
  }, [])

  // SSE — increment badge when player sends message (no polling!)
  useSSE({
    new_message: () => {
      if (initialized.current) {
        setUnread(prev => prev + 1)
        playSound()
      }
    },
  })

  if (unread === 0) return null

  return (
    <span style={{ minWidth: 18, height: 18, background: '#ef4444', borderRadius: 99, fontSize: 11, fontWeight: 800, color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', marginLeft: 'auto', boxShadow: '0 0 6px rgba(239,68,68,0.5)' }}>
      {unread > 99 ? '99+' : unread}
    </span>
  )
}
