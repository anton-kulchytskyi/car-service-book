import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { hashPassword } from '@/lib/auth/password'
import { signToken } from '@/lib/auth/jwt'
import { sessionCookieOptions } from '@/lib/auth/session'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { name, email, password } = parsed.data

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
  if (existing.length > 0) {
    return NextResponse.json({ error: { email: ['Email already in use'] } }, { status: 409 })
  }

  const passwordHash = await hashPassword(password)
  const [user] = await db.insert(users).values({ name, email, passwordHash }).returning({
    id: users.id,
    email: users.email,
    name: users.name,
  })

  const token = await signToken({ sub: user.id, email: user.email, name: user.name })
  const response = NextResponse.json({ user }, { status: 201 })
  response.cookies.set(sessionCookieOptions(token))
  return response
}
