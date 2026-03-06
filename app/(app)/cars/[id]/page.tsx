import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { and, eq, desc, asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { cars, serviceRecords, maintenanceSchedules, carOwnershipHistory, recordPhotos } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import RecordsList from '@/components/records-list'
import CarActionsMenu from '@/components/car-actions-menu'
import ExportPdfButton from '@/components/export-pdf-button-wrapper'
import MaintenanceSchedules from '@/components/maintenance-schedules'
import CurrentMileage from '@/components/current-mileage'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { PlusIcon, ArrowLeftIcon, UsersIcon } from 'lucide-react'
import { formatLicensePlate } from '@/lib/utils'

import CostByTypeChart from '@/components/charts/cost-by-type-chart-wrapper'

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

  const [records, schedules, ownershipHistory, allRecordPhotos] = await Promise.all([
    db.select().from(serviceRecords).where(eq(serviceRecords.carId, id)).orderBy(desc(serviceRecords.date)),
    db.select().from(maintenanceSchedules).where(eq(maintenanceSchedules.carId, id)).orderBy(maintenanceSchedules.createdAt),
    db.select().from(carOwnershipHistory).where(eq(carOwnershipHistory.carId, id)).orderBy(asc(carOwnershipHistory.ownedFrom)),
    db.select().from(recordPhotos).innerJoin(serviceRecords, and(eq(recordPhotos.recordId, serviceRecords.id), eq(serviceRecords.carId, id))),
  ])

  const photosMap = allRecordPhotos.reduce<Record<string, string[]>>((acc, row) => {
    const key = row.record_photos.recordId
    if (!acc[key]) acc[key] = []
    acc[key].push(row.record_photos.url)
    return acc
  }, {})

  const totalCost = records.reduce((sum, r) => sum + (r.cost ? Number(r.cost) : 0), 0)
  const maxMileage = records.length > 0 ? Math.max(...records.map((r) => r.mileage)) : null
  const currentKm = car.currentMileage ?? maxMileage

  // Chart data — costs grouped by type
  const costByType = records.reduce<Record<string, number>>((acc, r) => {
    if (!r.cost || Number(r.cost) === 0) return acc
    acc[r.type] = (acc[r.type] ?? 0) + Number(r.cost)
    return acc
  }, {})
  const chartData = Object.entries(costByType)
    .map(([type, total]) => ({ type, total }))
    .sort((a, b) => b.total - a.total)

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        My Cars
      </Link>

      {/* Header: car info (left) + chart (right) */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 mb-6">
        {/* Left column — car info */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              {car.photoUrl && (
                <div className="relative w-14 h-14 rounded-lg overflow-hidden border shrink-0">
                  <Image src={car.photoUrl} alt={`${car.make} ${car.model}`} fill className="object-cover" sizes="56px" />
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-xl font-bold leading-tight">{car.make} {car.model}</h1>
                <p className="text-sm text-muted-foreground">{car.year}</p>
              </div>
            </div>
            <CarActionsMenu carId={car.id} />
          </div>

          {(car.licensePlate || car.vin) && (
            <div className="flex gap-2 flex-wrap">
              {car.licensePlate && <Badge variant="outline">{formatLicensePlate(car.licensePlate)}</Badge>}
              {car.vin && <Badge variant="secondary" className="font-mono text-xs uppercase">{car.vin}</Badge>}
            </div>
          )}

          {ownershipHistory.length > 0 && (
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
          )}

          <div className="mt-auto">
            <CurrentMileage carId={id} currentMileage={car.currentMileage ?? null} />
          </div>
        </div>

        {/* Right column — chart */}
        {chartData.length > 0
          ? <CostByTypeChart data={chartData} total={totalCost} />
          : <div className="hidden md:block" />
        }
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
          <RecordsList records={records} carId={id} photosMap={photosMap} />
        </div>
      </div>
    </div>
  )
}
