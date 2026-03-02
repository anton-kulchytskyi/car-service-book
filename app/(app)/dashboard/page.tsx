import { redirect } from 'next/navigation'
import Link from 'next/link'
import { eq, count, max, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { cars, serviceRecords } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { Button } from '@/components/ui/button'
import CarCard from '@/components/cards/car-card'
import { PlusIcon, CarIcon } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const userCars = await db
    .select()
    .from(cars)
    .where(eq(cars.userId, session.sub))
    .orderBy(cars.createdAt)

  const stats =
    userCars.length > 0
      ? await db
          .select({
            carId: serviceRecords.carId,
            recordCount: count(),
            lastDate: max(serviceRecords.date),
          })
          .from(serviceRecords)
          .where(inArray(serviceRecords.carId, userCars.map((c) => c.id)))
          .groupBy(serviceRecords.carId)
      : []

  const statsMap = new Map(stats.map((s) => [s.carId, s]))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Cars</h1>
        <Button asChild>
          <Link href="/cars/new">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Car
          </Link>
        </Button>
      </div>

      {userCars.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
          <CarIcon className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-lg font-medium mb-1">No cars yet</p>
          <p className="text-sm mb-6">Add your first car to start tracking service history</p>
          <Button asChild variant="outline">
            <Link href="/cars/new">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add your first car
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userCars.map((car) => (
            <CarCard key={car.id} car={car} stats={statsMap.get(car.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
