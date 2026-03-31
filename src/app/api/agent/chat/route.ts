import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sseManager } from '@/lib/sse'

export async function GET() {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'AGENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const conversations = await prisma.conversation.findMany({
    include: {
      user: { select: { id: true, username: true, locked: true, status: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(
    { conversations },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}

export async function POST(req: NextRequest) {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'AGENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { conversationId, content, imageUrl } = await req.json()
  if (!conversationId) return NextResponse.json({ error: 'conversationId required' }, { status: 400 })
  if (!content && !imageUrl) return NextResponse.json({ error: 'Content or image required' }, { status: 400 })

  const message = await prisma.message.create({
    data: {
      conversationId,
      sender: 'AGENT',
      content: content || null,
      imageUrl: imageUrl || null,
    },
  })

  const conversation = await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date(), playerUnread: { increment: 1 } },
    include: { user: true },
  })

  // Create notification for player
  await prisma.notification.create({
    data: {
      userId: conversation.userId,
      type: 'NEW_MESSAGE',
      title: 'New message from support',
      body: content
        ? content.length > 60 ? content.slice(0, 60) + '...' : content
        : '📎 Image received',
    },
  })

  // Push to the specific player via SSE
  sseManager.sendToPlayer(conversation.userId, 'new_message', { message })

  return NextResponse.json({ message })
}
