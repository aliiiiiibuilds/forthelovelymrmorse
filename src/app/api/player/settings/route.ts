import { NextResponse } from 'next/server'
import { getTokenFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const token = await getTokenFromCookies()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } })

  return NextResponse.json(
    { settings },
    { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=15' } }
  )
}
