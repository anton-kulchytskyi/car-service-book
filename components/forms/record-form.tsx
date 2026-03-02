'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SERVICE_TYPES } from '@/lib/constants'

type FieldErrors = Partial<Record<string, string[]>>

export default function RecordForm({ carId }: { carId: string }) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})

    const form = new FormData(e.currentTarget)
    const dateStr = form.get('date') as string
    const body = {
      carId,
      date: new Date(dateStr).toISOString(),
      mileage: Number(form.get('mileage')),
      type: form.get('type'),
      description: form.get('description'),
      cost: (form.get('cost') as string) || undefined,
    }

    startTransition(async () => {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        router.push(`/cars/${carId}`)
        router.refresh()
      } else {
        setFieldErrors(data.error || {})
      }
    })
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="date">Date *</Label>
        <Input id="date" name="date" type="date" defaultValue={today} max={today} required />
        {fieldErrors.date && <p className="text-sm text-destructive">{fieldErrors.date[0]}</p>}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="type">Service Type *</Label>
        <select
          id="type"
          name="type"
          required
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {SERVICE_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {fieldErrors.type && <p className="text-sm text-destructive">{fieldErrors.type[0]}</p>}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="mileage">Mileage (km) *</Label>
        <Input id="mileage" name="mileage" type="number" placeholder="50000" min={0} required />
        {fieldErrors.mileage && <p className="text-sm text-destructive">{fieldErrors.mileage[0]}</p>}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="description">Description *</Label>
        <Input id="description" name="description" placeholder="Changed engine oil and filter" required />
        {fieldErrors.description && <p className="text-sm text-destructive">{fieldErrors.description[0]}</p>}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="cost">Cost (UAH)</Label>
        <Input id="cost" name="cost" type="number" step="0.01" placeholder="1500.00" min={0} />
      </div>

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending ? 'Saving...' : 'Add Record'}
      </Button>
    </form>
  )
}
