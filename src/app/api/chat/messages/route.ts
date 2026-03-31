import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sseManager } from '@/lib/sse'

const MESSAGE_PAGE_SIZE = 50

export async function GET() {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'PLAYER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let conversation = await prisma.conversation.findUnique({
    where: { userId: token.id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        take: MESSAGE_PAGE_SIZE, // last 50 messages
        skip: 0,
      },
    },
  })

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { userId: token.id },
      include: { messages: true },
    })
  }

  // Reset player unread when they view chat
  if (conversation.playerUnread > 0) {
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { playerUnread: 0 },
    })
  }

  return NextResponse.json(
    { messages: conversation.messages, conversationId: conversation.id, playerUnread: 0 },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}

export async function POST(req: NextRequest) {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'PLAYER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content, imageUrl, isIdImage } = await req.json()
  if (!content && !imageUrl) return NextResponse.json({ error: 'Content or image required' }, { status: 400 })

  let conversation = await prisma.conversation.findUnique({ where: { userId: token.id } })
  if (!conversation) {
    conversation = await prisma.conversation.create({ data: { userId: token.id } })
  }

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      sender: 'PLAYER',
      content: content || null,
      imageUrl: imageUrl || null,
      isIdImage: isIdImage || false,
    },
  })

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date(), agentUnread: { increment: 1 } },
  })

  // Push to all connected agents via SSE
  sseManager.sendToAgents('new_message', {
    conversationId: conversation.id,
    playerId: token.id,
    message,
  })

  return NextResponse.json({ message })
}
