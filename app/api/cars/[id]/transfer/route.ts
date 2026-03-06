import { NextRequest, NextResponse } from 'next/server'
import { and, eq, isNull } from 'drizzle-orm'
import { db } from '@/lib/db'
import { cars, users, carOwnershipHistory } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'

type Props = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Props) {
  try {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

  // Verify car belongs to current user
  const [car] = await db
    .select()
    .from(cars)
    .where(and(eq(cars.id, id), eq(cars.userId, session.sub)))
    .limit(1)

  if (!car) return NextResponse.json({ error: 'Car not found' }, { status: 404 })

  // Find current user info
  const [currentUser] = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, session.sub))
    .limit(1)

  // Find new owner by email
  const [newOwner] = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (!newOwner) return NextResponse.json({ error: 'No user with this email found' }, { status: 404 })
  if (newOwner.id === session.sub) return NextResponse.json({ error: 'Cannot transfer to yourself' }, { status: 400 })

  const now = new Date()

  // Check if there's already an open history record for current owner
  const [openRecord] = await db
    .select()
    .from(carOwnershipHistory)
    .where(and(eq(carOwnershipHistory.carId, id), isNull(carOwnershipHistory.ownedTo)))
    .limit(1)

  if (openRecord) {
    // Close it
    await db
      .update(carOwnershipHistory)
      .set({ ownedTo: now })
      .where(eq(carOwnershipHistory.id, openRecord.id))
  } else {
    // First ever transfer — backfill original owner
    await db.insert(carOwnershipHistory).values({
      carId: id,
      userId: currentUser.id,
      ownerName: currentUser.name,
      ownerEmail: currentUser.email,
      ownedFrom: car.createdAt,
      ownedTo: now,
    })
  }

  // Insert record for new owner
  await db.insert(carOwnershipHistory).values({
    carId: id,
    userId: newOwner.id,
    ownerName: newOwner.name,
    ownerEmail: newOwner.email,
    ownedFrom: now,
    ownedTo: null,
  })

  // Transfer the car
  await db.update(cars).set({ userId: newOwner.id }).where(eq(cars.id, id))

  return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[transfer]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
