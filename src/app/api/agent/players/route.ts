import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'AGENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''

  const users = await prisma.user.findMany({
    where: search ? { username: { contains: search } } : {},
    select: { id: true, username: true, locked: true, status: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  // Return as BOTH keys so nothing ever breaks regardless of which the frontend uses
  return NextResponse.json({ users, players: users })
}

export async function POST(req: NextRequest) {
  const token = await getTokenFromCookies()
  if (!token || token.role !== 'AGENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { username, password, status, locked } = await req.json()

  if (!username || !password) return NextResponse.json({ error: 'Username and password required' }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) return NextResponse.json({ error: 'Username taken' }, { status: 409 })

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { username, passwordHash, status: status || 'FREE', locked: locked ?? true },
  })
  await prisma.conversation.create({ data: { userId: user.id } })

  return NextResponse.json({ user, success: true })
}
