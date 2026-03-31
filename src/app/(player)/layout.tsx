import PlayerSidebar from '@/components/player/PlayerSidebar'

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout-with-sidebar">
      <PlayerSidebar />
      <main className="main-content">{children}</main>
    </div>
  )
}
