'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { SERVICE_TYPES, MAINTENANCE_DEFAULTS } from '@/lib/constants'
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

function toFormValues(
  s: MaintenanceSchedule | undefined,
  tTypes: (key: typeof SERVICE_TYPES[number]) => string,
): FormValues {
  if (!s) return { serviceName: '', intervalKm: '', intervalMonths: '', notes: '' }
  const isKnown = (SERVICE_TYPES as readonly string[]).includes(s.serviceName)
  return {
    serviceName: isKnown ? tTypes(s.serviceName as typeof SERVICE_TYPES[number]) : s.serviceName,
    intervalKm: s.intervalKm?.toString() ?? '',
    intervalMonths: s.intervalMonths?.toString() ?? '',
    notes: s.notes ?? '',
  }
}

export default function ScheduleForm({ carId, open, onOpenChange, initial, onSaved }: Props) {
  const t = useTranslations('scheduleForm')
  const tTypes = useTranslations('serviceTypes')
  const [values, setValues] = useState<FormValues>(() => toFormValues(initial, tTypes))
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)

  function set(field: keyof FormValues, value: string) {
    setValues((v) => ({ ...v, [field]: value }))
  }

  // When user picks a suggestion (translated name), auto-fill intervals
  function applyDefault(displayName: string) {
    const def = MAINTENANCE_DEFAULTS.find((d) => tTypes(d.name) === displayName)
    if (!def) return
    setValues((v) => ({
      ...v,
      intervalKm: def.intervalKm?.toString() ?? '',
      intervalMonths: def.intervalMonths?.toString() ?? '',
    }))
  }

  // Convert display name back to key for storage, or keep as-is for custom names
  function resolveServiceKey(displayName: string): string {
    const def = MAINTENANCE_DEFAULTS.find((d) => tTypes(d.name) === displayName)
    return def ? def.name : displayName
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!values.intervalKm && !values.intervalMonths) {
      setError(t('intervalRequired'))
      return
    }
    setError('')
    setIsPending(true)
    try {
      const body = {
        serviceName: resolveServiceKey(values.serviceName),
        intervalKm: values.intervalKm ? Number(values.intervalKm) : null,
        intervalMonths: values.intervalMonths ? Number(values.intervalMonths) : null,
        notes: values.notes || null,
      }

      const res = initial
        ? await fetch(`/api/schedules/${initial.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await fetch(`/api/cars/${carId}/schedules`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

      if (!res.ok) {
        setError(t('saveError'))
        return
      }

      onOpenChange(false)
      onSaved()
    } finally {
      setIsPending(false)
    }
  }

  function handleOpenChange(o: boolean) {
    if (o) setValues(toFormValues(initial, tTypes))
    setError('')
    onOpenChange(o)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? t('editTitle') : t('addTitle')}</DialogTitle>
          <DialogDescription>
            {t('syncNote')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t('serviceLabel')}</Label>
            <Input
              value={values.serviceName}
              onChange={(e) => {
                set('serviceName', e.target.value)
                applyDefault(e.target.value)
              }}
              placeholder={t('servicePlaceholder')}
              required
              list="maintenance-defaults"
            />
            <datalist id="maintenance-defaults">
              {MAINTENANCE_DEFAULTS.map((d) => (
                <option key={d.name} value={tTypes(d.name)} />
              ))}
            </datalist>
            <p className="text-xs text-muted-foreground">
              {t('suggestionsNote')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t('intervalKmLabel')}</Label>
              <Input
                type="number"
                min="1"
                value={values.intervalKm}
                onChange={(e) => set('intervalKm', e.target.value)}
                placeholder="e.g. 10000"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('intervalMonthsLabel')}</Label>
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
            <Label>{t('notesLabel')}</Label>
            <Input
              value={values.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="e.g. use 5W-30 Mobil"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('saving') : t('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
