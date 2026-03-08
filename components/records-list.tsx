'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { SERVICE_TYPES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import RecordCard from '@/components/cards/record-card'
import { ClipboardListIcon, SearchIcon, XIcon, CalendarIcon } from 'lucide-react'
import type { ServiceRecord } from '@/lib/db/schema'

type Props = {
  records: ServiceRecord[]
  carId: string
  photosMap?: Record<string, string[]>
}

const PAGE_SIZE = 10

export default function RecordsList({ records, carId, photosMap }: Props) {
  const t = useTranslations('recordsList')
  const tTypes = useTranslations('serviceTypes')

  function typeLabel(type: string) {
    return (SERVICE_TYPES as readonly string[]).includes(type)
      ? tTypes(type as typeof SERVICE_TYPES[number])
      : type
  }
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const query = search.trim().toLowerCase()

  function resetVisible() {
    setVisibleCount(PAGE_SIZE)
  }

  const types = Array.from(new Set(records.map((r) => r.type)))

  const filtered = records.filter((r) => {
    if (activeFilter && r.type !== activeFilter) return false
    if (dateFrom && new Date(r.date) < new Date(dateFrom)) return false
    if (dateTo && new Date(r.date) > new Date(dateTo + 'T23:59:59')) return false
    if (!query) return true
    return (
      r.type.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query)
    )
  })

  const hasFilters = !!activeFilter || !!dateFrom || !!dateTo || !!search

  const visible = filtered.slice(0, visibleCount)
  const hasMore = filtered.length > visibleCount

  // Compute mileage warnings: sort by date ascending, flag records where mileage < previous
  const mileageWarnings = new Set<string>()
  const byDate = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  for (let i = 1; i < byDate.length; i++) {
    if (byDate[i].mileage < byDate[i - 1].mileage) {
      mileageWarnings.add(byDate[i].id)
    }
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center text-muted-foreground">
        <ClipboardListIcon className="w-10 h-10 mb-3 opacity-30" />
        <p className="font-medium mb-1">{t('emptyTitle')}</p>
        <p className="text-sm mb-5">{t('emptyDescription')}</p>
        <Button asChild variant="outline" size="sm">
          <Link href={`/cars/${carId}/records/new`}>{t('emptyAction')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Date range */}
      <div className="flex items-center gap-2 mb-3">
        <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); resetVisible() }}
          className="w-auto flex-1 text-sm"
        />
        <span className="text-muted-foreground text-sm shrink-0">—</span>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); resetVisible() }}
          className="w-auto flex-1 text-sm"
        />
      </div>

      {/* Search input */}
      <div className="relative mb-3">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); resetVisible() }}
          placeholder={t('searchPlaceholder')}
          className="pl-9 pr-9"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {types.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-4">
          <button
            onClick={() => { setActiveFilter(null); resetVisible() }}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeFilter === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('all')} ({records.length})
          </button>
          {types.map((type) => (
            <button
              key={type}
              onClick={() => { setActiveFilter(activeFilter === type ? null : type); resetVisible() }}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                activeFilter === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {typeLabel(type)} ({records.filter((r) => r.type === type).length})
            </button>
          ))}
        </div>
      )}

      {hasFilters && (
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground">{t('ofRecords', { filtered: filtered.length, total: records.length })}</p>
          <button
            onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setActiveFilter(null); resetVisible() }}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            {t('clearAll')}
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-center py-10 text-sm text-muted-foreground">
          {query ? t('noResultsFor', { query: search }) : t('noResults')}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {visible.map((record) => (
              <RecordCard key={record.id} record={record} carId={carId} mileageWarning={mileageWarnings.has(record.id)} photos={photosMap?.[record.id]} />
            ))}
          </div>
          {hasMore && (
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="mt-4 w-full py-2 text-sm text-muted-foreground hover:text-foreground border border-dashed rounded-lg transition-colors"
            >
              {t('loadMore', { remaining: filtered.length - visibleCount })}
            </button>
          )}
        </>
      )}
    </div>
  )
}
