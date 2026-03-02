'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import RecordCard from '@/components/cards/record-card'
import DeleteRecordButton from '@/components/delete-record-button'
import { ClipboardListIcon, PlusIcon, PencilIcon } from 'lucide-react'
import type { ServiceRecord } from '@/lib/db/schema'

type Props = {
  records: ServiceRecord[]
  carId: string
}

export default function RecordsList({ records, carId }: Props) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const types = Array.from(new Set(records.map((r) => r.type)))
  const filtered = activeFilter ? records.filter((r) => r.type === activeFilter) : records

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

      {filtered.length === 0 ? (
        <p className="text-center py-10 text-sm text-muted-foreground">
          No records for &quot;{activeFilter}&quot;
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((record) => (
            <div key={record.id} className="flex items-start gap-1">
              <div className="flex-1 min-w-0">
                <RecordCard record={record} />
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
