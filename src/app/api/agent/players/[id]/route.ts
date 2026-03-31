import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sseManager } from '@/lib/sse'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'AGENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, username: true, locked: true, status: true, createdAt: true },
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ user })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'AGENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()

  const currentUser = await prisma.user.findUnique({ where: { id } })
  if (!currentUser) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updateData: { locked?: boolean; status?: string } = {}
  if (body.locked !== undefined) updateData.locked = body.locked
  if (body.status !== undefined) updateData.status = body.status

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, username: true, locked: true, status: true },
  })

  // Notify player if lock status changed
  if (body.locked !== undefined && body.locked !== currentUser.locked) {
    const notif = await prisma.notification.create({
      data: {
        userId: id,
        type: body.locked ? 'ACCOUNT_LOCKED' : 'ACCOUNT_UNLOCKED',
        title: body.locked ? '🔒 Account Locked' : '🔓 Account Unlocked!',
        body: body.locked
          ? 'Your account has been locked. Contact support in live chat.'
          : '🎉 Your account is now unlocked! You have full access to Deposit, Redeem, and Promotions.',
      },
    })
    // Push via SSE to the player instantly
    sseManager.sendToPlayer(id, 'account_update', { notif, locked: body.locked })
  }

  // Notify if status upgraded
  if (body.status && body.status !== currentUser.status) {
    const notif = await prisma.notification.create({
      data: {
        userId: id,
        type: 'NEW_PROMO',
        title: `⭐ Status upgraded to ${body.status}!`,
        body: `Your account has been upgraded to ${body.status}. New promotions may now be available for you.`,
      },
    })
    sseManager.sendToPlayer(id, 'account_update', { notif, status: body.status })
  }

  return NextResponse.json({ user })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'AGENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.message.deleteMany({ where: { conversation: { userId: id } } })
  await prisma.conversation.deleteMany({ where: { userId: id } })
  await prisma.notification.deleteMany({ where: { userId: id } })
  await prisma.uploadedFile.deleteMany({ where: { userId: id } })
  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
