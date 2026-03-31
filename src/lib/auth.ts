import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-32-characters!!'
)

export type TokenPayload = {
  id: string
  username: string
  role: 'PLAYER' | 'AGENT'
  locked?: boolean
  status?: string
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(secret)
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as TokenPayload
  } catch {
    return null
  }
}

export async function getTokenFromCookies(): Promise<TokenPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('vault-token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function getTokenFromRequest(req: NextRequest): Promise<TokenPayload | null> {
  const token = req.cookies.get('vault-token')?.value
  if (!token) return null
  return verifyToken(token)
}
