import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'AGENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  if (body.statuses && Array.isArray(body.statuses)) body.statuses = body.statuses.join(',')
  if (body.expiresAt) body.expiresAt = new Date(body.expiresAt)
  if (body.code) body.code = body.code.toUpperCase()

  const promo = await prisma.promo.update({ where: { id }, data: body })
  return NextResponse.json({ promo })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'AGENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.promo.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
