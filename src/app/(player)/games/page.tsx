'use client'
import { useEffect, useState } from 'react'

interface Game { id: string; title: string; description?: string; imageUrl?: string; link: string }

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/player/games').then(r => r.json()).then(d => { setGames(d.games || []); setLoading(false) })
  }, [])

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">🎮 Games</h1>
        <p className="page-subtitle">Browse and play available games</p>
      </div>
      <div className="page-body">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          </div>
        ) : games.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', padding: 64 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎮</div>
            <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 8 }}>No Games Yet</h2>
            <p style={{ color: 'var(--white-2)', fontSize: 15 }}>Games will appear here once the agent adds them.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
            {games.map(game => (
              <a key={game.id} href={game.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                <div className="panel" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.22s ease', height: '100%' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(182,109,255,0.5)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(126,34,206,0.25)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }}>
                  {/* Game image */}
                  <div style={{ height: 160, background: 'linear-gradient(135deg, rgba(126,34,206,0.4), rgba(244,114,182,0.2))', position: 'relative', overflow: 'hidden' }}>
                    {game.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={game.imageUrl} alt={game.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>🎮</div>
                    )}
                    {/* Play overlay */}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.4)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}>
                      <span style={{ fontSize: 42, opacity: 0, transition: 'opacity 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>▶️</span>
                    </div>
                  </div>
                  {/* Info */}
                  <div style={{ padding: '16px 18px' }}>
                    <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6, color: 'white' }}>{game.title}</div>
                    {game.description && <p style={{ fontSize: 13, color: 'var(--white-2)', lineHeight: 1.5, marginBottom: 12 }}>{game.description}</p>}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--purple-3)' }}>
                      Play Now →
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
