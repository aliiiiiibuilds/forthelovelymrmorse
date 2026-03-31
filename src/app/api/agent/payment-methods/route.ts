import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'AGENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const methods = await prisma.paymentMethod.findMany({ orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }] })
  return NextResponse.json({ methods })
}

export async function POST(req: NextRequest) {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'AGENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { type, name, tag, qrCodeUrl, note, active, sortOrder } = body

  if (!type || !name || !tag) return NextResponse.json({ error: 'type, name, tag required' }, { status: 400 })

  const method = await prisma.paymentMethod.create({
    data: { type, name, tag, qrCodeUrl, note, active: active ?? true, sortOrder: sortOrder ?? 0 },
  })
  return NextResponse.json({ method })
}
