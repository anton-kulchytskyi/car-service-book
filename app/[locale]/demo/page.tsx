import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import RecordsList from '@/components/records-list'
import CostByTypeChart from '@/components/charts/cost-by-type-chart-wrapper'
import OwnersPopover from '@/components/owners-popover'
import { GaugeIcon, SparklesIcon, ArrowLeftIcon } from 'lucide-react'
import { getMaintenanceStatus } from '@/lib/utils'
import type { ServiceRecord, MaintenanceSchedule } from '@/lib/db/schema'

const DEMO_CAR_ID = 'demo'
const CURRENT_KM = 87500

const RECORDS: ServiceRecord[] = [
  {
    id: 'r1', carId: DEMO_CAR_ID, createdAt: new Date(),
    date: new Date('2025-12-15'), mileage: 87500, type: 'Oil Change',
    description: 'Castrol Edge 5W-30 5L, replaced oil filter',
    cost: '1800',
  },
  {
    id: 'r2', carId: DEMO_CAR_ID, createdAt: new Date(),
    date: new Date('2025-10-01'), mileage: 85200, type: 'Tire Replacement',
    description: 'Michelin CrossClimate2 205/55R16 — all four tires',
    cost: '12400',
  },
  {
    id: 'r3', carId: DEMO_CAR_ID, createdAt: new Date(),
    date: new Date('2025-06-20'), mileage: 82000, type: 'Brake Service',
    description: 'Replaced front brake pads and discs',
    cost: '4500',
  },
  {
    id: 'r4', carId: DEMO_CAR_ID, createdAt: new Date(),
    date: new Date('2025-03-10'), mileage: 78500, type: 'Oil Change',
    description: 'Castrol Edge 5W-30 5L, replaced oil filter',
    cost: '1800',
  },
  {
    id: 'r5', carId: DEMO_CAR_ID, createdAt: new Date(),
    date: new Date('2024-11-15'), mileage: 74000, type: 'Filters',
    description: 'Replaced engine air filter and cabin pollen filter',
    cost: '850',
  },
  {
    id: 'r6', carId: DEMO_CAR_ID, createdAt: new Date(),
    date: new Date('2024-07-22'), mileage: 70000, type: 'Oil Change',
    description: 'Castrol Magnatec 5W-30 5L',
    cost: '1750',
  },
  {
    id: 'r7', carId: DEMO_CAR_ID, createdAt: new Date(),
    date: new Date('2024-01-10'), mileage: 65000, type: 'Technical Inspection',
    description: 'Annual technical inspection — passed',
    cost: '1500',
  },
]

const SCHEDULES: MaintenanceSchedule[] = [
  {
    id: 's1', carId: DEMO_CAR_ID, createdAt: new Date(), notes: null,
    serviceName: 'Oil Change',
    intervalKm: 10000, intervalMonths: 6,
    lastDoneKm: 87500, lastDoneDate: new Date('2025-12-15'),
  },
  {
    id: 's2', carId: DEMO_CAR_ID, createdAt: new Date(), notes: null,
    serviceName: 'Tire Rotation',
    intervalKm: 10000, intervalMonths: null,
    lastDoneKm: 85200, lastDoneDate: new Date('2025-10-01'),
  },
  {
    id: 's3', carId: DEMO_CAR_ID, createdAt: new Date(), notes: null,
    serviceName: 'Air Filter',
    intervalKm: 15000, intervalMonths: 12,
    lastDoneKm: 74000, lastDoneDate: new Date('2024-11-15'),
  },
  {
    id: 's4', carId: DEMO_CAR_ID, createdAt: new Date(), notes: null,
    serviceName: 'Technical Inspection',
    intervalKm: null, intervalMonths: 12,
    lastDoneKm: null, lastDoneDate: new Date('2024-01-10'),
  },
]

const OWNERS = [
  {
    id: 'o1', carId: DEMO_CAR_ID, userId: null, ownerEmail: '',
    ownerName: 'Ivan Petrenko',
    ownedFrom: new Date('2019-05-12'),
    ownedTo: new Date('2022-03-20'),
    createdAt: new Date(),
  },
  {
    id: 'o2', carId: DEMO_CAR_ID, userId: null, ownerEmail: '',
    ownerName: 'Olena Koval',
    ownedFrom: new Date('2022-03-20'),
    ownedTo: null,
    createdAt: new Date(),
  },
]

const chartData = [
  { type: 'Tire Replacement', total: 12400 },
  { type: 'Oil Change', total: 5350 },
  { type: 'Brake Service', total: 4500 },
  { type: 'Technical Inspection', total: 1500 },
  { type: 'Filters', total: 850 },
]
const totalCost = chartData.reduce((s, d) => s + d.total, 0)

const STATUS_CLASS = {
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
  soon:    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
  ok:      'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
  unknown: 'bg-muted text-muted-foreground border-border',
}

type TFn = (key: string, values?: Record<string, string | number>) => string

function nextServiceText(s: MaintenanceSchedule, t: TFn) {
  const parts: string[] = []
  if (s.intervalKm && s.lastDoneKm != null) {
    const diff = s.lastDoneKm + s.intervalKm - CURRENT_KM
    const fmt = (n: number) => String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    parts.push(diff > 0 ? t('nextInKm', { km: fmt(diff) }) : t('kmOverdue', { km: fmt(diff) }))
  }
  if (s.intervalMonths && s.lastDoneDate) {
    const next = new Date(s.lastDoneDate)
    next.setMonth(next.getMonth() + s.intervalMonths)
    const diff = Math.floor((next.getTime() - Date.now()) / 86400000)
    parts.push(diff > 0 ? t('nextInDays', { days: diff }) : t('daysOverdue', { days: Math.abs(diff) }))
  }
  return parts.join(' / ') || '—'
}

export default async function DemoPage() {
  const t = await getTranslations('demoPage')
  return (
    <div className="min-h-screen bg-background">
      {/* Demo banner */}
      <div className="bg-primary text-primary-foreground py-3 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-primary-foreground/70 hover:text-primary-foreground">
              <ArrowLeftIcon className="w-4 h-4" />
              {t('backHome')}
            </Link>
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <SparklesIcon className="w-4 h-4 shrink-0" />
              {t('banner')}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button size="sm" variant="secondary" asChild>
              <Link href="/register">{t('createAccount')}</Link>
            </Button>
            <Link href="/login" className="text-sm text-primary-foreground/80 hover:text-primary-foreground underline underline-offset-4">
              {t('signIn')}
            </Link>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">

          {/* Header: car info (left) + chart (right) */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 mb-6">
            {/* Left column */}
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h1 className="text-xl font-bold leading-tight">Toyota Camry</h1>
                  <p className="text-sm text-muted-foreground">2019</p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">AA 1234 BB</Badge>
                <Badge variant="secondary" className="font-mono text-xs uppercase">4T1BF1FK5HU123456</Badge>
              </div>

              <OwnersPopover owners={OWNERS} />

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-auto">
                <GaugeIcon className="w-4 h-4" />
                <span className="font-medium text-foreground">
                  {String(CURRENT_KM).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} km
                </span>
              </div>
            </div>

            {/* Right column — chart */}
            <CostByTypeChart data={chartData} total={totalCost} />
          </div>

          <Separator className="mb-6" />

          {/* Two columns: service history + maintenance */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">

            {/* Maintenance — top on mobile, right on desktop */}
            <div className="order-1 lg:order-2 pb-6 border-b lg:border-b-0 lg:border-l lg:pl-10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{t('maintenanceSchedule')}</h2>
              </div>
              <div className="space-y-2">
                {SCHEDULES.map((s) => {
                  const status = getMaintenanceStatus(s, CURRENT_KM)
                  return (
                    <div key={s.id} className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
                      <span className={`shrink-0 w-18 text-center text-xs font-medium px-2 py-0.5 rounded border ${STATUS_CLASS[status]}`}>
                        {t(`status${status.charAt(0).toUpperCase() + status.slice(1)}` as 'statusOverdue' | 'statusSoon' | 'statusOk' | 'statusUnknown')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{s.serviceName}</p>
                        <p className="text-xs text-muted-foreground">{nextServiceText(s, t)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Service history — bottom on mobile, left on desktop */}
            <div className="order-2 lg:order-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{t('serviceHistory')}</h2>
              </div>
              <RecordsList records={RECORDS} carId={DEMO_CAR_ID} />
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
