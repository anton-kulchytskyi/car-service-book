import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronRightIcon, ClipboardListIcon, CalendarIcon, AlertTriangleIcon } from 'lucide-react'
import type { Car } from '@/lib/db/schema'
import { formatLicensePlate } from '@/lib/utils'

type Stats = {
  recordCount: number
  lastDate: Date | null
  maxMileage: number | null
  overdueCount: number
  soonCount: number
} | undefined

function formatLastDate(date: Date | null) {
  if (!date) return null
  return new Intl.DateTimeFormat('uk-UA', { month: 'short', year: 'numeric' }).format(new Date(date))
}

export default async function CarCard({ car, stats }: { car: Car; stats?: Stats }) {
  const t = await getTranslations('carCard')
  const overdueCount = stats?.overdueCount ?? 0
  const soonCount = stats?.soonCount ?? 0

  return (
    <Link href={`/cars/${car.id}`} className="group block">
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{car.make} {car.model}</CardTitle>
              <CardDescription>{car.year}</CardDescription>
            </div>
            <ChevronRightIcon className="w-4 h-4 text-muted-foreground mt-1 transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex flex-col gap-2">
          <div className="flex gap-2 flex-wrap">
            {car.licensePlate && <Badge variant="outline">{formatLicensePlate(car.licensePlate)}</Badge>}
            {car.vin && (
              <Badge variant="secondary" className="font-mono text-xs uppercase">
                {car.vin}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ClipboardListIcon className="w-3 h-3" />
              {t('records', { count: stats?.recordCount ?? 0 })}
            </span>
            {stats?.lastDate && (
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                {formatLastDate(stats.lastDate)}
              </span>
            )}
          </div>
          {(overdueCount > 0 || soonCount > 0) && (
            <div className="flex gap-2 flex-wrap">
              {overdueCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded px-2 py-0.5">
                  <AlertTriangleIcon className="w-3 h-3" />
                  {t('overdue', { count: overdueCount })}
                </span>
              )}
              {soonCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-800">
                  {t('dueSoon', { count: soonCount })}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
