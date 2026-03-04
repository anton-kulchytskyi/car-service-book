'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import RecordCard from '@/components/cards/record-card'
import DeleteRecordButton from '@/components/delete-record-button'
import { ClipboardListIcon, PencilIcon, SearchIcon, XIcon, CalendarIcon } from 'lucide-react'
import type { ServiceRecord } from '@/lib/db/schema'

type Props = {
  records: ServiceRecord[]
  carId: string
}

export default function RecordsList({ records, carId }: Props) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const query = search.trim().toLowerCase()

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
        <p className="font-medium mb-1">No records yet</p>
        <p className="text-sm mb-5">Start tracking service history for this car</p>
        <Button asChild variant="outline" size="sm">
          <Link href={`/cars/${carId}/records/new`}>Add first record</Link>
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
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-auto flex-1 text-sm"
        />
        <span className="text-muted-foreground text-sm shrink-0">—</span>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="w-auto flex-1 text-sm"
        />
      </div>

      {/* Search input */}
      <div className="relative mb-3">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by type or description..."
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
            onClick={() => setActiveFilter(null)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeFilter === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({records.length})
          </button>
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setActiveFilter(activeFilter === type ? null : type)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                activeFilter === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {type} ({records.filter((r) => r.type === type).length})
            </button>
          ))}
        </div>
      )}

      {hasFilters && (
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground">{filtered.length} of {records.length} records</p>
          <button
            onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setActiveFilter(null) }}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            Clear all
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-center py-10 text-sm text-muted-foreground">
          No records found{query ? ` for "${search}"` : activeFilter ? ` for "${activeFilter}"` : ''}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((record) => (
            <div key={record.id} className="flex items-start gap-1">
              <div className="flex-1 min-w-0">
                <RecordCard record={record} mileageWarning={mileageWarnings.has(record.id)} />
              </div>
              <Button variant="ghost" size="icon" asChild className="shrink-0 text-muted-foreground hover:text-foreground mt-0.5">
                <Link href={`/cars/${carId}/records/${record.id}/edit`}>
                  <PencilIcon className="w-4 h-4" />
                </Link>
              </Button>
              <DeleteRecordButton recordId={record.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
