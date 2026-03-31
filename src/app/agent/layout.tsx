import AgentSidebar from '@/components/agent/AgentSidebar'

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout-with-sidebar">
      <AgentSidebar />
      <main className="main-content">{children}</main>
    </div>
  )
}
