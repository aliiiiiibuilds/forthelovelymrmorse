import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'AGENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } })
  return NextResponse.json({ settings })
}

export async function PATCH(req: NextRequest) {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'AGENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { messageOfDay, depositTag, redeemTag } = body

  const settings = await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: { messageOfDay, depositTag, redeemTag },
    create: { id: 'singleton', messageOfDay, depositTag, redeemTag },
  })

  return NextResponse.json({ settings })
}
