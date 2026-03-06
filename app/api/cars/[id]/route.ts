import { NextRequest, NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { cars, serviceRecords, recordPhotos } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { updateCarSchema } from '@/lib/validators'
import { destroyImages } from '@/lib/cloudinary'

type Params = { params: Promise<{ id: string }> }

async function getOwnedCar(carId: string, userId: string) {
  const [car] = await db
    .select()
    .from(cars)
    .where(and(eq(cars.id, carId), eq(cars.userId, userId)))
    .limit(1)
  return car ?? null
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const car = await getOwnedCar(id, session.sub)
  if (!car) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ car })
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const car = await getOwnedCar(id, session.sub)
  if (!car) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = updateCarSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const [updated] = await db
    .update(cars)
    .set(parsed.data)
    .where(eq(cars.id, id))
    .returning()

  return NextResponse.json({ car: updated })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const car = await getOwnedCar(id, session.sub)
  if (!car) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { currentMileage } = await req.json()
  if (typeof currentMileage !== 'number' || currentMileage < 0) {
    return NextResponse.json({ error: 'Invalid mileage' }, { status: 400 })
  }

  const [updated] = await db
    .update(cars)
    .set({ currentMileage })
    .where(eq(cars.id, id))
    .returning()

  return NextResponse.json({ car: updated })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const car = await getOwnedCar(id, session.sub)
  if (!car) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const allPhotos = await db
    .select({ publicId: recordPhotos.publicId })
    .from(recordPhotos)
    .innerJoin(serviceRecords, eq(recordPhotos.recordId, serviceRecords.id))
    .where(eq(serviceRecords.carId, id))

  await destroyImages([car.photoPublicId, ...allPhotos.map((p) => p.publicId)])
  await db.delete(cars).where(eq(cars.id, id))

  return NextResponse.json({ success: true })
}
