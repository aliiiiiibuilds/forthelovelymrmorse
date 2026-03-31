'use client'
import { useEffect, useRef, useState } from 'react'
import { useSSE } from '@/hooks/useSSE'

interface Notification {
  id: string; type: string; title: string; body: string; read: boolean; createdAt: string
}

const typeIcon: Record<string, string> = {
  NEW_MESSAGE: '💬', NEW_PROMO: '🎁', ACCOUNT_UNLOCKED: '🔓', ACCOUNT_LOCKED: '🔒',
}

function playSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator(); const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.28)
  } catch {}
}

export default function NotificationBell({ role }: { role: 'PLAYER' | 'AGENT' }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const initialized = useRef(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const fetchNotifs = async () => {
    if (role !== 'PLAYER') return
    try {
      const res = await fetch('/api/player/notifications')
      if (!res.ok) return
      const data = await res.json()
      setUnread(data.unread || 0)
      setNotifications(data.notifications || [])
      initialized.current = true
    } catch {}
  }

  // Initial load only — no polling at all
  useEffect(() => { fetchNotifs() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // SSE — get notified of new messages and account changes in real time
  useSSE({
    new_message: () => {
      if (initialized.current) {
        setUnread(prev => prev + 1)
        playSound()
        fetchNotifs() // refresh the list
      }
    },
    account_update: () => {
      playSound()
      fetchNotifs()
    },
  })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = async () => {
    await fetch('/api/player/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    })
    setUnread(0)
    setNotifications(n => n.map(x => ({ ...x, read: true })))
  }

  const handleOpen = () => {
    const next = !open
    setOpen(next)
    if (next && unread > 0) markAllRead()
  }

  const fmt = (d: string) => {
    const diff = Date.now() - new Date(d).getTime()
    if (diff < 60000) return 'just now'
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago'
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago'
    return new Date(d).toLocaleDateString()
  }

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      <button onClick={handleOpen} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '6px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 19 }}>🔔</span>
        {unread > 0 && (
          <span style={{ position: 'absolute', top: 2, right: 2, minWidth: 16, height: 16, background: '#ef4444', borderRadius: 99, fontSize: 10, fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 300, background: 'linear-gradient(160deg, rgba(25,8,45,0.99), rgba(15,4,28,0.99))', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 18, boxShadow: '0 20px 50px rgba(0,0,0,0.6)', zIndex: 200, overflow: 'hidden' }}>
          <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 800, fontSize: 14 }}>Notifications</span>
            {notifications.some(n => !n.read) && (
              <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--purple-3)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                Mark all read
              </button>
            )}
          </div>
          <div style={{ maxHeight: 340, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 28, textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                No notifications yet
              </div>
            ) : notifications.map(n => (
              <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: n.read ? 'transparent' : 'rgba(182,109,255,0.07)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{typeIcon[n.type] || '🔔'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'white', marginBottom: 2 }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{n.body}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>{fmt(n.createdAt)}</div>
                </div>
                {!n.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--purple-3)', flexShrink: 0, marginTop: 4 }} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
