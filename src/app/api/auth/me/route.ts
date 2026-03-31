import { NextResponse } from 'next/server'
import { getTokenFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const token = await getTokenFromCookies()
  if (!token) return NextResponse.json({ user: null })

  if (token.role === 'PLAYER') {
    const user = await prisma.user.findUnique({
      where: { id: token.id },
      select: { id: true, username: true, locked: true, status: true, createdAt: true },
    })
    if (!user) return NextResponse.json({ user: null })
    return NextResponse.json({ user: { ...user, role: 'PLAYER' } })
  }

  if (token.role === 'AGENT') {
    const agent = await prisma.agent.findUnique({
      where: { id: token.id },
      select: { id: true, username: true },
    })
    if (!agent) return NextResponse.json({ user: null })
    return NextResponse.json({ user: { ...agent, role: 'AGENT' } })
  }

  return NextResponse.json({ user: null })
}
