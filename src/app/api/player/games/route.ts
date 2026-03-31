import { NextResponse } from 'next/server'
import { getTokenFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'PLAYER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const games = await prisma.game.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json(
    { games },
    { headers: { 'Cache-Control': 's-maxage=120, stale-while-revalidate=60' } }
  )
}
