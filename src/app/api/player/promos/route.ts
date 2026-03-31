import { NextResponse } from 'next/server'
import { getTokenFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'PLAYER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: token.id } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const allPromos = await prisma.promo.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
  })

  const promos = allPromos.filter(p => {
    const statuses = p.statuses.split(',').map(s => s.trim())
    return statuses.includes(user.status)
  })

  return NextResponse.json(
    { promos },
    { headers: { 'Cache-Control': 's-maxage=120, stale-while-revalidate=60' } }
  )
}
