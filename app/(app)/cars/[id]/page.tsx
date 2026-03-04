import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { and, eq, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { cars, serviceRecords, maintenanceSchedules } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import RecordsList from '@/components/records-list'
import DeleteCarButton from '@/components/delete-car-button'
import MaintenanceSchedules from '@/components/maintenance-schedules'
import { PlusIcon, ArrowLeftIcon, ReceiptIcon, GaugeIcon, ListIcon, PencilIcon } from 'lucide-react'
import { formatLicensePlate } from '@/lib/utils'

type Props = { params: Promise<{ id: string }> }

export default async function CarPage({ params }: Props) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params

  const [car] = await db
    .select()
    .from(cars)
    .where(and(eq(cars.id, id), eq(cars.userId, session.sub)))
    .limit(1)

  if (!car) notFound()

  const [records, schedules] = await Promise.all([
    db.select().from(serviceRecords).where(eq(serviceRecords.carId, id)).orderBy(desc(serviceRecords.date)),
    db.select().from(maintenanceSchedules).where(eq(maintenanceSchedules.carId, id)).orderBy(maintenanceSchedules.createdAt),
  ])

  const totalCost = records.reduce((sum, r) => sum + (r.cost ? Number(r.cost) : 0), 0)
  const maxMileage = records.length > 0 ? Math.max(...records.map((r) => r.mileage)) : null

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        My Cars
      </Link>

      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold">{car.make} {car.model}</h1>
          <p className="text-muted-foreground">{car.year}</p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/cars/${id}/edit`}>
              <PencilIcon className="w-4 h-4" />
            </Link>
          </Button>
          <DeleteCarButton carId={car.id} />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {car.licensePlate && <Badge variant="outline">{formatLicensePlate(car.licensePlate)}</Badge>}
        {car.vin && <Badge variant="secondary" className="font-mono text-xs uppercase">{car.vin}</Badge>}
      </div>

      {records.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/40 py-3 px-2 text-center">
            <ListIcon className="w-4 h-4 text-muted-foreground mb-1" />
            <p className="text-lg font-bold">{records.length}</p>
            <p className="text-xs text-muted-foreground">records</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/40 py-3 px-2 text-center">
            <ReceiptIcon className="w-4 h-4 text-muted-foreground mb-1" />
            <p className="text-lg font-bold">
              {totalCost > 0
                ? totalCost.toLocaleString('uk-UA', { maximumFractionDigits: 0 })
                : '—'}
            </p>
            <p className="text-xs text-muted-foreground">UAH spent</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/40 py-3 px-2 text-center">
            <GaugeIcon className="w-4 h-4 text-muted-foreground mb-1" />
            <p className="text-lg font-bold">
              {maxMileage !== null ? maxMileage.toLocaleString('uk-UA') : '—'}
            </p>
            <p className="text-xs text-muted-foreground">km</p>
          </div>
        </div>
      )}

      <Separator className="mb-6" />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Service History</h2>
        <Button asChild size="sm">
          <Link href={`/cars/${id}/records/new`}>
            <PlusIcon className="w-4 h-4 mr-1" />
            Add Record
          </Link>
        </Button>
      </div>

      <RecordsList records={records} carId={id} />

      <Separator className="my-6" />

      <MaintenanceSchedules carId={id} schedules={schedules} currentKm={maxMileage} />
    </div>
  )
}
