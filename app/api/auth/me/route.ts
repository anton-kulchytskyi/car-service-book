import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { getSession, sessionCookieOptions, clearSessionCookie } from '@/lib/auth/session'
import { verifyPassword, hashPassword } from '@/lib/auth/password'
import { signToken } from '@/lib/auth/jwt'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ user: { id: session.sub, email: session.email, name: session.name } })
}

const updateSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('name'),
    name: z.string().min(1).max(100),
  }),
  z.object({
    type: z.literal('password'),
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
  }),
])

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const result = updateSchema.safeParse(body)
  if (!result.success) return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 })

  const data = result.data

  if (data.type === 'name') {
    await db.update(users).set({ name: data.name }).where(eq(users.id, session.sub))
    const token = await signToken({ sub: session.sub, email: session.email, name: data.name })
    const cookieStore = await cookies()
    cookieStore.set(sessionCookieOptions(token))
    return NextResponse.json({ ok: true })
  }

  if (data.type === 'password') {
    const [user] = await db.select().from(users).where(eq(users.id, session.sub)).limit(1)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const valid = await verifyPassword(data.currentPassword, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: { currentPassword: ['Incorrect password'] } }, { status: 400 })
    }

    const passwordHash = await hashPassword(data.newPassword)
    await db.update(users).set({ passwordHash }).where(eq(users.id, session.sub))
    return NextResponse.json({ ok: true })
  }
}

export async function DELETE() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await db.delete(users).where(eq(users.id, session.sub))

  const cookieStore = await cookies()
  cookieStore.set(clearSessionCookie())

  return NextResponse.json({ ok: true })
}
