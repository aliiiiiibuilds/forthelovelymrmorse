import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'AGENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const convs = await prisma.conversation.findMany({ select: { agentUnread: true } })
  const total = convs.reduce((sum, c) => sum + c.agentUnread, 0)
  return NextResponse.json({ unread: total })
}

export async function PATCH(req: NextRequest) {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'AGENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { conversationId } = await req.json().catch(() => ({}))
  if (conversationId) {
    await prisma.conversation.update({ where: { id: conversationId }, data: { agentUnread: 0 } })
  } else {
    await prisma.conversation.updateMany({ data: { agentUnread: 0 } })
  }
  return NextResponse.json({ success: true })
}
