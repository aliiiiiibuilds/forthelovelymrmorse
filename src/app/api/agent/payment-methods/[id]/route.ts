import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'AGENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const method = await prisma.paymentMethod.update({ where: { id }, data: body })
  return NextResponse.json({ method })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'AGENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.paymentMethod.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
