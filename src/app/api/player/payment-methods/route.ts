import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'PLAYER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  const methods = await prisma.paymentMethod.findMany({
    where: { active: true, ...(type ? { type } : {}) },
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json(
    { methods },
    { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=30' } }
  )
}
