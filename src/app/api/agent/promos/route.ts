import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'AGENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const promos = await prisma.promo.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ promos })
}

export async function POST(req: NextRequest) {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'AGENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, code, description, expiresAt, statuses, active } = body

  if (!title || !code || !description) return NextResponse.json({ error: 'title, code, description required' }, { status: 400 })

  const existing = await prisma.promo.findUnique({ where: { code } })
  if (existing) return NextResponse.json({ error: 'Promo code already exists' }, { status: 409 })

  const promo = await prisma.promo.create({
    data: {
      title,
      code: code.toUpperCase(),
      description,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      statuses: Array.isArray(statuses) ? statuses.join(',') : statuses || 'FREE,VIP,VVIP',
      active: active ?? true,
    },
  })
  return NextResponse.json({ promo })
}
