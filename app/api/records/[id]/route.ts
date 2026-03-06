import { NextRequest, NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { cars, serviceRecords, recordPhotos } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { updateRecordSchema } from '@/lib/validators'
import { syncMaintenanceSchedules } from '@/lib/maintenance-sync'
import { destroyImages } from '@/lib/cloudinary'

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
  const { photos, ...recordBody } = body
  const parsed = updateRecordSchema.safeParse(recordBody)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { date, ...rest } = parsed.data
  const [updated] = await db
    .update(serviceRecords)
    .set({ ...rest, ...(date ? { date: new Date(date) } : {}) })
    .where(eq(serviceRecords.id, id))
    .returning()

  if (Array.isArray(photos)) {
    const existing = await db.select({ publicId: recordPhotos.publicId }).from(recordPhotos).where(eq(recordPhotos.recordId, id))
    const removedIds = existing.map((r) => r.publicId).filter((pid) => !photos.some((p: { publicId: string }) => p.publicId === pid))
    await destroyImages(removedIds)
    await db.delete(recordPhotos).where(eq(recordPhotos.recordId, id))
    if (photos.length > 0) {
      await db.insert(recordPhotos).values(
        photos.map((p: { url: string; publicId: string }) => ({ recordId: id, url: p.url, publicId: p.publicId }))
      )
    }
  }

  await syncMaintenanceSchedules(record.carId)

  return NextResponse.json({ record: updated })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const record = await getOwnedRecord(id, session.sub)
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const photos = await db.select({ publicId: recordPhotos.publicId }).from(recordPhotos).where(eq(recordPhotos.recordId, id))
  await destroyImages(photos.map((p) => p.publicId))
  await db.delete(serviceRecords).where(eq(serviceRecords.id, id))
  await syncMaintenanceSchedules(record.carId)

  return NextResponse.json({ success: true })
}
