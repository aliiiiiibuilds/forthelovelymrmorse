'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import AgentChatBadge from '@/components/ui/AgentChatBadge'

export default function AgentSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/agent/login'
  }

  const sections = [
    { label: 'Overview', items: [{ href: '/agent/dashboard', label: 'Dashboard', icon: '⊞' }] },
    { label: 'Players', items: [
      { href: '/agent/players', label: 'All Players', icon: '👥' },
      { href: '/agent/chat',   label: 'Live Chat',   icon: '💬', badge: true },
    ]},
    { label: 'Content', items: [
      { href: '/agent/games',  label: 'Games',       icon: '🎮' },
      { href: '/agent/promos', label: 'Promotions',  icon: '🎁' },
    ]},
    { label: 'Finance', items: [{ href: '/agent/payment-methods', label: 'Payment Methods', icon: '💳' }] },
    { label: 'Settings', items: [{ href: '/agent/settings', label: 'Site Settings', icon: '⚙️' }] },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const SidebarContent = () => (
    <>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" style={{ background: 'linear-gradient(135deg, #be185d, #7e22ce)' }}>🛡️</div>
        <span className="sidebar-logo-text" style={{ background: 'linear-gradient(135deg, var(--pink-1), var(--purple-3))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AGENT</span>
      </div>

      <div style={{ padding: '10px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.09)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--pink-1)', display: 'inline-block', boxShadow: '0 0 6px var(--pink-1)' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '1px', textTransform: 'uppercase' }}>Agent Panel</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {sections.map(section => (
          <div key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map(item => (
              <Link key={item.href} href={item.href}
                className={`sidebar-item ${isActive(item.href) ? 'active' : ''}`}
                style={isActive(item.href) ? { color: 'var(--pink-1)', background: 'rgba(244,114,182,0.10)', borderLeftColor: 'var(--pink-1)' } : {}}>
                <span className="sidebar-item-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && <AgentChatBadge />}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', width: '100%', fontWeight: 500 }}>
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
          <span style={{ fontSize: 16 }}>🛡️</span>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '1px', background: 'linear-gradient(135deg, var(--pink-1), var(--purple-3))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AGENT</span>
        </div>
      </div>

      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 45, backdropFilter: 'blur(3px)' }} />
      )}

      <aside className="sidebar" style={{ transform: open ? 'translateX(0)' : undefined }}>
        <SidebarContent />
      </aside>
    </>
  )
}
