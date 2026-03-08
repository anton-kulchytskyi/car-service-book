import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { eq, count, max, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { cars, serviceRecords, maintenanceSchedules } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { Button } from '@/components/ui/button'
import CarCard from '@/components/cards/car-card'
import { PlusIcon, CarIcon } from 'lucide-react'
import { getMaintenanceStatus } from '@/lib/utils'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect(`/${await getLocale()}/login`)

  const userCars = await db
    .select()
    .from(cars)
    .where(eq(cars.userId, session.sub))
    .orderBy(cars.createdAt)

  const carIds = userCars.map((c) => c.id)

  const [recordStats, scheduleRows, mileageRows] =
    carIds.length > 0
      ? await Promise.all([
          db.select({ carId: serviceRecords.carId, recordCount: count(), lastDate: max(serviceRecords.date) })
            .from(serviceRecords).where(inArray(serviceRecords.carId, carIds)).groupBy(serviceRecords.carId),
          db.select().from(maintenanceSchedules).where(inArray(maintenanceSchedules.carId, carIds)),
          db.select({ carId: serviceRecords.carId, maxMileage: max(serviceRecords.mileage) })
            .from(serviceRecords).where(inArray(serviceRecords.carId, carIds)).groupBy(serviceRecords.carId),
        ])
      : [[], [], []]

  const mileageMap = new Map(mileageRows.map((r) => [r.carId, r.maxMileage]))

  const statsMap = new Map(recordStats.map((s) => {
    const car = userCars.find((c) => c.id === s.carId)
    const currentKm = car?.currentMileage ?? mileageMap.get(s.carId) ?? null
    const carSchedules = scheduleRows.filter((sc) => sc.carId === s.carId)
    const statuses = carSchedules.map((sc) => getMaintenanceStatus(sc, currentKm))
    return [s.carId, {
      ...s,
      maxMileage: currentKm,
      overdueCount: statuses.filter((st) => st === 'overdue').length,
      soonCount: statuses.filter((st) => st === 'soon').length,
    }]
  }))

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
