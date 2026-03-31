import { NextRequest } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth'
import { sseManager } from '@/lib/sse'
import { v4 as uuidv4 } from 'uuid'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const token = await getTokenFromRequest(req)
  if (!token) return new Response('Unauthorized', { status: 401 })

  const clientId = uuidv4()

  const stream = new ReadableStream({
    start(controller) {
      // Register this client
      sseManager.addClient({
        id: clientId,
        controller,
        userId: token.id,
        role: token.role as 'PLAYER' | 'AGENT',
      })

      // Send initial heartbeat
      const heartbeat = `event: connected\ndata: {"clientId":"${clientId}"}\n\n`
      controller.enqueue(new TextEncoder().encode(heartbeat))

      // Heartbeat every 25s to keep connection alive
      const interval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': heartbeat\n\n'))
        } catch {
          clearInterval(interval)
        }
      }, 25000)

      // Cleanup on disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(interval)
        sseManager.removeClient(clientId)
        try { controller.close() } catch {}
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // disable nginx buffering
    },
  })
}
