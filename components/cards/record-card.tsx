'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { CalendarIcon, GaugeIcon, TriangleAlertIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import type { ServiceRecord } from '@/lib/db/schema'

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

type Props = {
  record: ServiceRecord
  carId: string
  mileageWarning?: boolean
  photos?: string[]
}

export default function RecordCard({ record, carId, mileageWarning, photos }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setIsPending(true)
    try {
      const res = await fetch(`/api/records/${record.id}`, { method: 'DELETE' })
      if (res.ok) {
        setDeleteOpen(false)
        router.refresh()
      }
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
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
                  {mileageWarning && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TriangleAlertIcon className="w-4 h-4 text-amber-500 fill-amber-100 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Mileage is lower than the previous record by date
                      </TooltipContent>
                    </Tooltip>
                  )}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-0.5 -mr-1 -mt-1">
                <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-foreground" asChild>
                  <Link href={`/cars/${carId}/records/${record.id}/edit`}>
                    <PencilIcon className="w-3.5 h-3.5" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2Icon className="w-3.5 h-3.5" />
                </Button>
              </div>
              {record.cost && (
                <p className="font-semibold text-sm">
                  {Number(record.cost).toLocaleString('uk-UA', { maximumFractionDigits: 0 })} грн
                </p>
              )}
              {photos && photos.length > 0 && (
                <div className="flex gap-1">
                  {photos.slice(0, 3).map((url) => (
                    <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                      <div className="relative w-10 h-10 rounded overflow-hidden border">
                        <Image src={url} alt="" fill className="object-cover" sizes="40px" />
                      </div>
                    </a>
                  ))}
                  {photos.length > 3 && (
                    <div className="w-10 h-10 rounded border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      +{photos.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete service record?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isPending}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
