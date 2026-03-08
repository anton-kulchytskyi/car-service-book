'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GaugeIcon, PencilIcon, CheckIcon, XIcon } from 'lucide-react'

type Props = {
  carId: string
  currentMileage: number | null
}

export default function CurrentMileage({ carId, currentMileage }: Props) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(currentMileage?.toString() ?? '')
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function handleSave() {
    const km = Number(value)
    if (!value || isNaN(km) || km < 0) return
    setIsPending(true)
    try {
      await fetch(`/api/cars/${carId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentMileage: km }),
      })
      setEditing(false)
      router.refresh()
    } finally {
      setIsPending(false)
    }
  }

  function handleCancel() {
    setValue(currentMileage?.toString() ?? '')
    setEditing(false)
  }

  const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/40 py-3 px-3">
      <GaugeIcon className="w-4 h-4 text-muted-foreground shrink-0" />
      {editing ? (
        <>
          <Input
            type="number"
            min="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel() }}
            className="h-7 text-sm w-32"
            autoFocus
          />
          <span className="text-sm text-muted-foreground">km</span>
          <Button size="icon" variant="ghost" className="w-6 h-6" onClick={handleSave} disabled={isPending}>
            <CheckIcon className="w-3.5 h-3.5 text-green-600" />
          </Button>
          <Button size="icon" variant="ghost" className="w-6 h-6" onClick={handleCancel}>
            <XIcon className="w-3.5 h-3.5" />
          </Button>
        </>
      ) : (
        <>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {currentMileage != null ? `${fmt(currentMileage)} km` : '—'}
            </p>
            <p className="text-xs text-muted-foreground">Current mileage</p>
          </div>
          <Button size="icon" variant="ghost" className="w-6 h-6" onClick={() => setEditing(true)}>
            <PencilIcon className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </>
      )}
    </div>
  )
}
