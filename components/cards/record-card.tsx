import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, GaugeIcon } from 'lucide-react'
import type { ServiceRecord } from '@/lib/db/schema'

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export default function RecordCard({ record }: { record: ServiceRecord }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant="secondary">{record.type}</Badge>
            </div>
            <p className="text-sm text-foreground">{record.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                {formatDate(record.date)}
              </span>
              <span className="flex items-center gap-1">
                <GaugeIcon className="w-3 h-3" />
                {record.mileage.toLocaleString('uk-UA')} km
              </span>
            </div>
          </div>
          {record.cost && (
            <div className="text-right shrink-0">
              <p className="font-semibold text-sm">
                {Number(record.cost).toLocaleString('uk-UA', {
                  style: 'currency',
                  currency: 'UAH',
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
