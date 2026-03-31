'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import NotificationBell from '@/components/ui/NotificationBell'
import PlayerChatBadge from '@/components/ui/PlayerChatBadge'

interface User { id: string; username: string; locked: boolean; status: string }

export default function PlayerSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch('/api/player/me').then(r => r.json()).then(d => setUser(d.user))
  }, [])

  // Close sidebar on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const isLocked = user?.locked ?? true
  const statusColor: Record<string, string> = { FREE: 'var(--white-2)', VIP: 'var(--gold-1)', VVIP: 'var(--purple-3)' }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard',  icon: '⊞', locked: false },
    { href: '/games',     label: 'Games',       icon: '🎮', locked: false },
    { href: '/deposit',   label: 'Deposit',     icon: '💰', locked: true },
    { href: '/redeem',    label: 'Redeem',      icon: '🏆', locked: true },
    { href: '/promo',     label: 'Promotions',  icon: '🎁', locked: true },
    { href: '/chat',      label: 'Live Chat',   icon: '💬', locked: false, badge: true },
  ]

  const SidebarContent = () => (
    <>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🔐</div>
        <span className="sidebar-logo-text">VAULT</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          <NotificationBell role="PLAYER" />
          {/* Close button — mobile only */}
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 20, padding: '4px 6px', display: 'none' }} className="sidebar-close">✕</button>
        </div>
      </div>

      {user && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.09)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #7e22ce, var(--pink-1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
              {user.username[0].toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.username}</div>
              <div style={{ display: 'flex', gap: 4, marginTop: 1 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: statusColor[user.status] }}>{user.status}</span>
                {user.locked && <span style={{ fontSize: 11, color: 'var(--danger)' }}>· 🔒</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Menu</div>
        {navItems.map(item => {
          const isDisabled = item.locked && isLocked
          const isActive = pathname === item.href
          if (isDisabled) {
            return (
              <div key={item.href} className="sidebar-item" style={{ opacity: 0.3, cursor: 'not-allowed' }}>
                <span className="sidebar-item-icon">{item.icon}</span>
                <span>{item.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11 }}>🔒</span>
              </div>
            )
          }
          return (
            <Link key={item.href} href={item.href} className={`sidebar-item ${isActive ? 'active' : ''}`}>
              <span className="sidebar-item-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && <PlayerChatBadge />}
            </Link>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', width: '100%', fontWeight: 500 }}>
          ⏎ Sign Out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* ── MOBILE TOP BAR ── */}
      <div className="mobile-topbar">
        <button className="hamburger-btn" onClick={() => setOpen(true)}>☰</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>🔐</span>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '1px', background: 'linear-gradient(135deg, white, var(--purple-3))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>VAULT</span>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <NotificationBell role="PLAYER" />
        </div>
      </div>

      {/* ── OVERLAY ── */}
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 45, backdropFilter: 'blur(3px)' }} />
      )}

      {/* ── SIDEBAR (desktop fixed, mobile drawer) ── */}
      <aside className="sidebar" style={{ transform: open ? 'translateX(0)' : undefined }}>
        <SidebarContent />
      </aside>
    </>
  )
}
