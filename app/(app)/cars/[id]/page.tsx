import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { and, eq, desc, asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { cars, serviceRecords, maintenanceSchedules, carOwnershipHistory } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import RecordsList from '@/components/records-list'
import DeleteCarButton from '@/components/delete-car-button'
import TransferCarButton from '@/components/transfer-car-button'
import ExportPdfButton from '@/components/export-pdf-button-wrapper'
import MaintenanceSchedules from '@/components/maintenance-schedules'
import CurrentMileage from '@/components/current-mileage'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { PlusIcon, ArrowLeftIcon, ReceiptIcon, ListIcon, PencilIcon, UsersIcon } from 'lucide-react'
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

  const [records, schedules, ownershipHistory] = await Promise.all([
    db.select().from(serviceRecords).where(eq(serviceRecords.carId, id)).orderBy(desc(serviceRecords.date)),
    db.select().from(maintenanceSchedules).where(eq(maintenanceSchedules.carId, id)).orderBy(maintenanceSchedules.createdAt),
    db.select().from(carOwnershipHistory).where(eq(carOwnershipHistory.carId, id)).orderBy(asc(carOwnershipHistory.ownedFrom)),
  ])

  const totalCost = records.reduce((sum, r) => sum + (r.cost ? Number(r.cost) : 0), 0)
  const maxMileage = records.length > 0 ? Math.max(...records.map((r) => r.mileage)) : null
  const currentKm = car.currentMileage ?? maxMileage

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        My Cars
      </Link>

      {/* Car header */}
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
          <TransferCarButton carId={car.id} />
          <DeleteCarButton carId={car.id} />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {car.licensePlate && <Badge variant="outline">{formatLicensePlate(car.licensePlate)}</Badge>}
        {car.vin && <Badge variant="secondary" className="font-mono text-xs uppercase">{car.vin}</Badge>}
      </div>

      {ownershipHistory.length > 0 && (
        <div className="mb-4">
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-default">
              <UsersIcon className="w-3.5 h-3.5" />
              {ownershipHistory.length} {ownershipHistory.length === 1 ? 'owner' : 'owners'}
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start" className="p-3 max-w-xs">
              <ol className="space-y-1.5">
                {ownershipHistory.map((entry, i) => (
                  <li key={entry.id} className="text-xs">
                    <span className="font-medium">{entry.ownerName}</span>
                    <span className="text-muted-foreground">
                      {' — '}
                      {new Date(entry.ownedFrom).toLocaleDateString('uk-UA')}
                      {entry.ownedTo
                        ? ` → ${new Date(entry.ownedTo).toLocaleDateString('uk-UA')}`
                        : ' → now'}
                    </span>
                    {i === ownershipHistory.length - 1 && (
                      <span className="ml-1 text-primary">(current)</span>
                    )}
                  </li>
                ))}
              </ol>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

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
        <CurrentMileage carId={id} currentMileage={car.currentMileage ?? null} />
      </div>

      <Separator className="mb-6" />

      {/* Two-column on desktop, maintenance above history on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
        {/* Maintenance — order-1 on mobile (top), order-2 on desktop (right) */}
        <div className="order-1 lg:order-2 pb-6 border-b lg:border-b-0 lg:border-l lg:pl-10">
          <MaintenanceSchedules carId={id} schedules={schedules} currentKm={currentKm} />
        </div>

        {/* Service History — order-2 on mobile (bottom), order-1 on desktop (left) */}
        <div className="order-2 lg:order-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Service History</h2>
            <div className="flex gap-2">
              <ExportPdfButton
                car={car}
                records={records}
                ownershipHistory={ownershipHistory}
                totalCost={totalCost}
                currentKm={currentKm}
              />
              <Button asChild size="sm">
                <Link href={`/cars/${id}/records/new`}>
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add Record
                </Link>
              </Button>
            </div>
          </div>
          <RecordsList records={records} carId={id} />
        </div>
      </div>
    </div>
  )
}
