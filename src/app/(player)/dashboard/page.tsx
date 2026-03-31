'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface User { id: string; username: string; locked: boolean; status: string; createdAt: string }
interface Settings { messageOfDay: string; depositTag: string; redeemTag: string }

function LockedSection({ label, icon, reason }: { label: string; icon: string; reason?: string }) {
  return (
    <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,107,138,0.25)' }}>
      {/* Blurred content behind */}
      <div style={{ filter: 'blur(4px)', pointerEvents: 'none', padding: 24, background: 'rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
        <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 4 }}>{label}</div>
        <div style={{ height: 12, background: 'rgba(255,255,255,0.15)', borderRadius: 6, width: '60%', marginBottom: 8 }} />
        <div style={{ height: 12, background: 'rgba(255,255,255,0.10)', borderRadius: 6, width: '40%' }} />
      </div>
      {/* Lock overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,4,20,0.55)', backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, textAlign: 'center' }}>
        <span style={{ fontSize: 32 }}>🔒</span>
        <span style={{ fontWeight: 800, fontSize: 15, color: '#ff9eb5' }}>Account Locked</span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
          {reason || 'Contact agent in live chat to unlock'}
        </span>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/player/me').then(r => r.json()),
      fetch('/api/player/settings').then(r => r.json()),
    ]).then(([u, s]) => { setUser(u.user); setSettings(s.settings); setLoading(false) })
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
    </div>
  )

  const statusColor: Record<string, string> = { FREE: 'rgba(255,255,255,0.7)', VIP: 'var(--gold-1)', VVIP: 'var(--purple-3)' }
  const isLocked = user?.locked ?? true

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">
          Welcome, <span style={{ color: statusColor[user?.status || 'FREE'] }}>{user?.username}</span>
        </h1>
        <p className="page-subtitle">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="page-body">
        {/* Locked Banner */}
        {isLocked && (
          <div className="notice-box" style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>🔒</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'white', marginBottom: 6 }}>Account Locked</div>
              <p style={{ margin: '0 0 6px', fontSize: 14 }}>
                Contact an agent in <strong>Live Chat</strong> and submit your ID image to unlock full access.
              </p>
              <p style={{ margin: '0 0 12px', fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
                Note: If your account was previously unlocked and is now locked again, please contact support to resolve the issue.
              </p>
              <Link href="/chat" className="btn-danger btn btn-sm">💬 Open Live Chat</Link>
            </div>
          </div>
        )}

        {/* Message of the Day */}
        {settings?.messageOfDay && (
          <div className="alert-info alert" style={{ marginBottom: 20 }}>
            <span style={{ fontSize: 20 }}>📢</span>
            <span style={{ fontSize: 14 }}>{settings.messageOfDay}</span>
          </div>
        )}

        {/* Stats row */}
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-label">Status Tier</div>
            <div style={{ marginTop: 10 }}>
              <span className={`badge badge-${user?.status?.toLowerCase()}`} style={{ fontSize: 13, padding: '5px 14px' }}>{user?.status}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Account Access</div>
            <div style={{ marginTop: 10 }}>
              <span className={`badge badge-${isLocked ? 'locked' : 'unlocked'}`} style={{ fontSize: 13, padding: '5px 14px' }}>
                {isLocked ? '🔒 Locked' : '✓ Unlocked'}
              </span>
            </div>
          </div>
          {!isLocked && settings?.depositTag && (
            <div className="stat-card">
              <div className="stat-label">Today&apos;s Deposit Tag</div>
              <div style={{ marginTop: 8, fontWeight: 700, fontSize: 15, color: '#7fffd4', wordBreak: 'break-all' }}>{settings.depositTag}</div>
            </div>
          )}
          {!isLocked && settings?.redeemTag && (
            <div className="stat-card">
              <div className="stat-label">Today&apos;s Redeem Tag</div>
              <div style={{ marginTop: 8, fontWeight: 700, fontSize: 15, color: 'var(--gold-1)', wordBreak: 'break-all' }}>{settings.redeemTag}</div>
            </div>
          )}
        </div>

        {/* Quick Actions — blurred if locked */}
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--white-2)', marginBottom: 14 }}>Quick Actions</h2>
        <div className="grid-3" style={{ marginBottom: 24 }}>
          {isLocked ? (
            <>
              <LockedSection label="Deposit" icon="💰" reason="Account locked — contact agent in live chat" />
              <LockedSection label="Redeem"  icon="🏆" reason="Account locked — contact agent in live chat" />
              <LockedSection label="Promos"  icon="🎁" reason="Account locked — contact agent in live chat" />
            </>
          ) : (
            <>
              {[
                { href: '/deposit', icon: '💰', title: 'Deposit', desc: 'Add funds to your account' },
                { href: '/redeem',  icon: '🏆', title: 'Redeem',  desc: 'Withdraw your winnings' },
                { href: '/promo',   icon: '🎁', title: 'Promos',  desc: 'Claim exclusive bonuses' },
              ].map(a => (
                <Link key={a.href} href={a.href} style={{ textDecoration: 'none' }}>
                  <div className="panel" style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.13)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <div style={{ fontSize: 30, marginBottom: 10 }}>{a.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 4 }}>{a.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--white-2)' }}>{a.desc}</div>
                  </div>
                </Link>
              ))}
            </>
          )}
        </div>

        {/* Games shortcut */}
        <Link href="/games" style={{ textDecoration: 'none' }}>
          <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'all 0.2s', marginBottom: 16 }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.13)')}
            onMouseLeave={e => (e.currentTarget.style.background = '')}>
            <span style={{ fontSize: 32 }}>🎮</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17 }}>Games</div>
              <div style={{ fontSize: 13, color: 'var(--white-2)' }}>Browse available games</div>
            </div>
            <span style={{ marginLeft: 'auto', color: 'var(--white-2)', fontSize: 18 }}>→</span>
          </div>
        </Link>

        {/* Member since */}
        <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 26 }}>📅</span>
          <div>
            <div style={{ fontSize: 12, color: 'var(--white-2)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Member Since</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
