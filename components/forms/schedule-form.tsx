'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { MAINTENANCE_DEFAULTS } from '@/lib/constants'
import type { MaintenanceSchedule } from '@/lib/db/schema'

type FormValues = {
  serviceName: string
  intervalKm: string
  intervalMonths: string
  notes: string
}

type Props = {
  carId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: MaintenanceSchedule
  onSaved: () => void
}

function toFormValues(s?: MaintenanceSchedule): FormValues {
  if (!s) return { serviceName: '', intervalKm: '', intervalMonths: '', notes: '' }
  return {
    serviceName: s.serviceName,
    intervalKm: s.intervalKm?.toString() ?? '',
    intervalMonths: s.intervalMonths?.toString() ?? '',
    notes: s.notes ?? '',
  }
}

export default function ScheduleForm({ carId, open, onOpenChange, initial, onSaved }: Props) {
  const [values, setValues] = useState<FormValues>(() => toFormValues(initial))
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)

  function set(field: keyof FormValues, value: string) {
    setValues((v) => ({ ...v, [field]: value }))
  }

  function applyDefault(name: string) {
    const def = MAINTENANCE_DEFAULTS.find((d) => d.name === name)
    if (!def) return
    setValues((v) => ({
      ...v,
      serviceName: def.name,
      intervalKm: def.intervalKm?.toString() ?? '',
      intervalMonths: def.intervalMonths?.toString() ?? '',
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!values.intervalKm && !values.intervalMonths) {
      setError('At least one interval (km or months) is required')
      return
    }
    setError('')
    setIsPending(true)
    try {
      const body = {
        serviceName: values.serviceName,
        intervalKm: values.intervalKm ? Number(values.intervalKm) : null,
        intervalMonths: values.intervalMonths ? Number(values.intervalMonths) : null,
        notes: values.notes || null,
      }

      const res = initial
        ? await fetch(`/api/schedules/${initial.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await fetch(`/api/cars/${carId}/schedules`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

      if (!res.ok) {
        setError('Failed to save. Please try again.')
        return
      }

      onOpenChange(false)
      onSaved()
    } finally {
      setIsPending(false)
    }
  }

  function handleOpenChange(o: boolean) {
    if (o) setValues(toFormValues(initial))
    setError('')
    onOpenChange(o)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Maintenance Schedule' : 'Add Maintenance Schedule'}</DialogTitle>
          <DialogDescription>
            Last done date and mileage are synced automatically from your service history.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Service</Label>
            <Input
              value={values.serviceName}
              onChange={(e) => {
                set('serviceName', e.target.value)
                applyDefault(e.target.value)
              }}
              placeholder="e.g. Oil Change"
              required
              list="maintenance-defaults"
            />
            <datalist id="maintenance-defaults">
              {MAINTENANCE_DEFAULTS.map((d) => (
                <option key={d.name} value={d.name} />
              ))}
            </datalist>
            <p className="text-xs text-muted-foreground">
              Pick from suggestions to auto-fill intervals
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Every (km)</Label>
              <Input
                type="number"
                min="1"
                value={values.intervalKm}
                onChange={(e) => set('intervalKm', e.target.value)}
                placeholder="e.g. 10000"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Every (months)</Label>
              <Input
                type="number"
                min="1"
                value={values.intervalMonths}
                onChange={(e) => set('intervalMonths', e.target.value)}
                placeholder="e.g. 6"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Input
              value={values.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="e.g. use 5W-30 Mobil"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
