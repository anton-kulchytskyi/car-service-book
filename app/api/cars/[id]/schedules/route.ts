import { NextRequest, NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { cars, maintenanceSchedules } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { createScheduleSchema } from '@/lib/validators'
import { syncMaintenanceSchedules } from '@/lib/maintenance-sync'

type Props = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Props) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const [car] = await db
    .select({ id: cars.id })
    .from(cars)
    .where(and(eq(cars.id, id), eq(cars.userId, session.sub)))
    .limit(1)

  if (!car) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const schedules = await db
    .select()
    .from(maintenanceSchedules)
    .where(eq(maintenanceSchedules.carId, id))
    .orderBy(maintenanceSchedules.createdAt)

  return NextResponse.json(schedules)
}

export async function POST(req: NextRequest, { params }: Props) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const [car] = await db
    .select({ id: cars.id })
    .from(cars)
    .where(and(eq(cars.id, id), eq(cars.userId, session.sub)))
    .limit(1)

  if (!car) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = createScheduleSchema.safeParse({ ...body, carId: id })
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { carId, ...rest } = parsed.data

  const [schedule] = await db
    .insert(maintenanceSchedules)
    .values({ ...rest, carId, lastDoneKm: null, lastDoneDate: null })
    .returning()

  // Sync all schedules for this car from service history
  await syncMaintenanceSchedules(carId)

  // Return the freshly synced schedule
  const [synced] = await db
    .select()
    .from(maintenanceSchedules)
    .where(eq(maintenanceSchedules.id, schedule.id))
    .limit(1)

  return NextResponse.json(synced, { status: 201 })
}
