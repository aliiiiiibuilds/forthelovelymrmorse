import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'PLAYER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notifications = await prisma.notification.findMany({
    where: { userId: token.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  const unread = notifications.filter(n => !n.read).length
  return NextResponse.json({ notifications, unread })
}

export async function PATCH(req: NextRequest) {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'PLAYER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { markAllRead } = await req.json()
  if (markAllRead) {
    await prisma.notification.updateMany({ where: { userId: token.id, read: false }, data: { read: true } })
  }
  return NextResponse.json({ success: true })
}
