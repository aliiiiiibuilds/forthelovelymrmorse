import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ playerId: string }> }) {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'AGENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { playerId } = await params

  let conversation = await prisma.conversation.findUnique({
    where: { userId: playerId },
    include: {
      messages: { orderBy: { createdAt: 'asc' }, take: 50 },
      user: { select: { id: true, username: true, locked: true, status: true } },
    },
  })

  if (!conversation) {
    const user = await prisma.user.findUnique({ where: { id: playerId } })
    if (!user) return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    conversation = await prisma.conversation.create({
      data: { userId: playerId },
      include: {
        messages: { orderBy: { createdAt: 'asc' }, take: 50 },
        user: { select: { id: true, username: true, locked: true, status: true } },
      },
    })
  }

  // Reset agent unread for this conversation
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { agentUnread: 0 },
  })

  return NextResponse.json(
    { conversation },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
