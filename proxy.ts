import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'

const protectedRoutes = ['/dashboard', '/cars']
const authRoutes = ['/login', '/register']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('session')?.value

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r))
  const isAuth = authRoutes.some((r) => pathname.startsWith(r))

  if (isProtected) {
    if (!token) return NextResponse.redirect(new URL('/login', req.url))
    try {
      await verifyToken(token)
      return NextResponse.next()
    } catch {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  if (isAuth && token) {
    try {
      await verifyToken(token)
      return NextResponse.redirect(new URL('/dashboard', req.url))
    } catch {
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/cars/:path*', '/login', '/register'],
}
