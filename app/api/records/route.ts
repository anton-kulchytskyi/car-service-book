import { NextRequest, NextResponse } from 'next/server'
import { and, eq, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { cars, serviceRecords } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { createRecordSchema } from '@/lib/validators'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const carId = req.nextUrl.searchParams.get('carId')
  if (!carId) return NextResponse.json({ error: 'carId is required' }, { status: 400 })

  // Verify the car belongs to the user
  const [car] = await db
    .select({ id: cars.id })
    .from(cars)
    .where(and(eq(cars.id, carId), eq(cars.userId, session.sub)))
    .limit(1)

  if (!car) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const records = await db
    .select()
    .from(serviceRecords)
    .where(eq(serviceRecords.carId, carId))
    .orderBy(desc(serviceRecords.date))

  return NextResponse.json({ records })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createRecordSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { carId, date, ...rest } = parsed.data

  // Verify the car belongs to the user
  const [car] = await db
    .select({ id: cars.id })
    .from(cars)
    .where(and(eq(cars.id, carId), eq(cars.userId, session.sub)))
    .limit(1)

  if (!car) return NextResponse.json({ error: 'Car not found' }, { status: 404 })

  const [record] = await db
    .insert(serviceRecords)
    .values({ ...rest, carId, date: new Date(date) })
    .returning()

  return NextResponse.json({ record }, { status: 201 })
}
