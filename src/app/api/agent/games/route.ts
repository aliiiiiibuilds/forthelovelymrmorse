import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'AGENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const games = await prisma.game.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json({ games })
}

export async function POST(req: NextRequest) {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'AGENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, description, imageUrl, link, active, sortOrder } = await req.json()
  if (!title || !link) return NextResponse.json({ error: 'Title and link required' }, { status: 400 })

  const game = await prisma.game.create({
    data: { title, description: description || '', imageUrl, link, active: active !== false, sortOrder: sortOrder || 0 },
  })
  return NextResponse.json({ game })
}
