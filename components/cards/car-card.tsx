import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronRightIcon, ClipboardListIcon, CalendarIcon } from 'lucide-react'
import type { Car } from '@/lib/db/schema'

type Stats = {
  recordCount: number
  lastDate: Date | null
} | undefined

function formatLastDate(date: Date | null) {
  if (!date) return null
  return new Intl.DateTimeFormat('uk-UA', { month: 'short', year: 'numeric' }).format(new Date(date))
}

export default function CarCard({ car, stats }: { car: Car; stats?: Stats }) {
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
            {car.licensePlate && <Badge variant="outline">{car.licensePlate}</Badge>}
            {car.vin && (
              <Badge variant="secondary" className="font-mono text-xs">
                {car.vin}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ClipboardListIcon className="w-3 h-3" />
              {stats?.recordCount ?? 0} records
            </span>
            {stats?.lastDate && (
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                {formatLastDate(stats.lastDate)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
