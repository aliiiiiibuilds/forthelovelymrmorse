import { NextResponse } from 'next/server'
import { getTokenFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'PLAYER') return NextResponse.json({ unread: 0 })

  const conv = await prisma.conversation.findUnique({
    where: { userId: token.id },
    select: { playerUnread: true },
  })

  return NextResponse.json({ unread: conv?.playerUnread || 0 })
}
