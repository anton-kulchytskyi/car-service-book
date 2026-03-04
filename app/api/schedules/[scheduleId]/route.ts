import { NextRequest, NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { cars, maintenanceSchedules } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { updateScheduleSchema } from '@/lib/validators'

type Props = { params: Promise<{ scheduleId: string }> }

async function getOwnedSchedule(scheduleId: string, userId: string) {
  const [row] = await db
    .select({ schedule: maintenanceSchedules, carId: cars.id })
    .from(maintenanceSchedules)
    .innerJoin(cars, and(eq(cars.id, maintenanceSchedules.carId), eq(cars.userId, userId)))
    .where(eq(maintenanceSchedules.id, scheduleId))
    .limit(1)
  return row
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { scheduleId } = await params
  const row = await getOwnedSchedule(scheduleId, session.sub)
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = updateScheduleSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { lastDoneDate, ...rest } = parsed.data

  const [updated] = await db
    .update(maintenanceSchedules)
    .set({
      ...rest,
      ...(lastDoneDate !== undefined
        ? { lastDoneDate: lastDoneDate ? new Date(lastDoneDate) : null }
        : {}),
    })
    .where(eq(maintenanceSchedules.id, scheduleId))
    .returning()

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { scheduleId } = await params
  const row = await getOwnedSchedule(scheduleId, session.sub)
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.delete(maintenanceSchedules).where(eq(maintenanceSchedules.id, scheduleId))

  return new NextResponse(null, { status: 204 })
}
