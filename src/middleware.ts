import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = await getTokenFromRequest(req)

  const publicRoutes = ['/', '/login', '/signup', '/agent/login']
  if (publicRoutes.includes(pathname)) {
    if (token?.role === 'PLAYER' && (pathname === '/login' || pathname === '/signup'))
      return NextResponse.redirect(new URL('/dashboard', req.url))
    if (token?.role === 'AGENT' && pathname === '/agent/login')
      return NextResponse.redirect(new URL('/agent/dashboard', req.url))
    return NextResponse.next()
  }

  // Agent routes
  if (pathname.startsWith('/agent')) {
    if (!token || token.role !== 'AGENT')
      return NextResponse.redirect(new URL('/agent/login', req.url))
    return NextResponse.next()
  }

  // Player routes
  const playerRoutes = ['/dashboard', '/deposit', '/redeem', '/promo', '/chat', '/games']
  const isPlayerRoute = playerRoutes.some(r => pathname.startsWith(r))

  if (isPlayerRoute) {
    if (!token || token.role !== 'PLAYER')
      return NextResponse.redirect(new URL('/login', req.url))
    // Locked players can access /chat and /games but NOT deposit/redeem/promo/dashboard
    if (token.locked && (pathname.startsWith('/deposit') || pathname.startsWith('/redeem') || pathname.startsWith('/promo') || pathname.startsWith('/dashboard')))
      return NextResponse.redirect(new URL('/chat', req.url))
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard', '/deposit', '/redeem', '/promo', '/chat', '/games', '/agent/:path*', '/login', '/signup'],
}
