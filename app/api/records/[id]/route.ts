import { NextRequest, NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { cars, serviceRecords } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { updateRecordSchema } from '@/lib/validators'

type Params = { params: Promise<{ id: string }> }

async function getOwnedRecord(recordId: string, userId: string) {
  const [result] = await db
    .select({ record: serviceRecords })
    .from(serviceRecords)
    .innerJoin(cars, and(eq(serviceRecords.carId, cars.id), eq(cars.userId, userId)))
    .where(eq(serviceRecords.id, recordId))
    .limit(1)
  return result?.record ?? null
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const record = await getOwnedRecord(id, session.sub)
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ record })
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const record = await getOwnedRecord(id, session.sub)
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = updateRecordSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { date, ...rest } = parsed.data
  const [updated] = await db
    .update(serviceRecords)
    .set({ ...rest, ...(date ? { date: new Date(date) } : {}) })
    .where(eq(serviceRecords.id, id))
    .returning()

  return NextResponse.json({ record: updated })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const record = await getOwnedRecord(id, session.sub)
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.delete(serviceRecords).where(eq(serviceRecords.id, id))

  return NextResponse.json({ success: true })
}
