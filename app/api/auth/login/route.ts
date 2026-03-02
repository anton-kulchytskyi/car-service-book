import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { verifyPassword } from '@/lib/auth/password'
import { signToken } from '@/lib/auth/jwt'
import { sessionCookieOptions } from '@/lib/auth/session'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { email, password } = parsed.data

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (!user) {
    return NextResponse.json({ error: { email: ['Invalid credentials'] } }, { status: 401 })
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: { email: ['Invalid credentials'] } }, { status: 401 })
  }

  const token = await signToken({ sub: user.id, email: user.email, name: user.name })
  const response = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
  response.cookies.set(sessionCookieOptions(token))
  return response
}
