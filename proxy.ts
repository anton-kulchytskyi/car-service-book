import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { verifyToken } from '@/lib/auth/jwt'
import { routing } from '@/i18n/routing'

const handleI18n = createMiddleware(routing)

const protectedRoutes = ['/dashboard', '/cars', '/profile']
const authRoutes = ['/login', '/register']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Strip locale prefix to determine the actual route
  const locale =
    routing.locales.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)) ??
    routing.defaultLocale
  const pathnameWithoutLocale = pathname.replace(new RegExp(`^/${locale}`), '') || '/'

  const token = req.cookies.get('session')?.value
  const isProtected = protectedRoutes.some((r) => pathnameWithoutLocale.startsWith(r))
  const isAuth = authRoutes.some((r) => pathnameWithoutLocale.startsWith(r))

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL(`/${locale}/login`, req.url))
    }
    try {
      await verifyToken(token)
    } catch {
      return NextResponse.redirect(new URL(`/${locale}/login`, req.url))
    }
  }

  if (isAuth && token) {
    try {
      await verifyToken(token)
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url))
    } catch {
      // invalid token — let through to login/register
    }
  }

  return handleI18n(req)
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
}
