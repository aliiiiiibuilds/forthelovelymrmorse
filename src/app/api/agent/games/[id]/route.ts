import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'AGENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const game = await prisma.game.update({ where: { id }, data: { title: body.title, description: body.description, imageUrl: body.imageUrl, link: body.link, active: body.active, sortOrder: body.sortOrder } })
  return NextResponse.json({ game })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'AGENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.game.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
