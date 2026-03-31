// Server-Sent Events broadcaster
// Keeps track of active connections and pushes events to them

type SSEClient = {
  id: string
  controller: ReadableStreamDefaultController
  userId: string
  role: 'PLAYER' | 'AGENT'
}

class SSEManager {
  private clients: Map<string, SSEClient> = new Map()

  addClient(client: SSEClient) {
    this.clients.set(client.id, client)
  }

  removeClient(id: string) {
    this.clients.delete(id)
  }

  // Send to a specific player
  sendToPlayer(userId: string, event: string, data: unknown) {
    this.clients.forEach(client => {
      if (client.role === 'PLAYER' && client.userId === userId) {
        this.send(client, event, data)
      }
    })
  }

  // Send to all agents
  sendToAgents(event: string, data: unknown) {
    this.clients.forEach(client => {
      if (client.role === 'AGENT') {
        this.send(client, event, data)
      }
    })
  }

  private send(client: SSEClient, event: string, data: unknown) {
    try {
      const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
      client.controller.enqueue(new TextEncoder().encode(payload))
    } catch {
      // Client disconnected
      this.clients.delete(client.id)
    }
  }

  getClientCount() {
    return this.clients.size
  }
}

// Singleton — shared across all requests in the same process
const globalSSE = globalThis as unknown as { sseManager: SSEManager }
if (!globalSSE.sseManager) globalSSE.sseManager = new SSEManager()
export const sseManager = globalSSE.sseManager
