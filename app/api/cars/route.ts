import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { cars } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { createCarSchema } from '@/lib/validators'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await db
    .select()
    .from(cars)
    .where(eq(cars.userId, session.sub))
    .orderBy(cars.createdAt)

  return NextResponse.json({ cars: result })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createCarSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const [car] = await db
    .insert(cars)
    .values({ ...parsed.data, userId: session.sub })
    .returning()

  return NextResponse.json({ car }, { status: 201 })
}
