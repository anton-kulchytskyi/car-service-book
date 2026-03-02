'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type FieldErrors = Partial<Record<string, string[]>>

export default function CarForm() {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})

    const form = new FormData(e.currentTarget)
    const body = {
      make: form.get('make'),
      model: form.get('model'),
      year: Number(form.get('year')),
      vin: (form.get('vin') as string) || undefined,
      licensePlate: (form.get('licensePlate') as string) || undefined,
    }

    startTransition(async () => {
      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        router.push(`/cars/${data.car.id}`)
        router.refresh()
      } else {
        setFieldErrors(data.error || {})
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="make">Make *</Label>
          <Input id="make" name="make" placeholder="Toyota" required />
          {fieldErrors.make && <p className="text-sm text-destructive">{fieldErrors.make[0]}</p>}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="model">Model *</Label>
          <Input id="model" name="model" placeholder="Corolla" required />
          {fieldErrors.model && <p className="text-sm text-destructive">{fieldErrors.model[0]}</p>}
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="year">Year *</Label>
        <Input
          id="year"
          name="year"
          type="number"
          placeholder="2020"
          min={1900}
          max={new Date().getFullYear() + 1}
          required
        />
        {fieldErrors.year && <p className="text-sm text-destructive">{fieldErrors.year[0]}</p>}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="licensePlate">License Plate</Label>
        <Input id="licensePlate" name="licensePlate" placeholder="AA 1234 BB" />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="vin">VIN</Label>
        <Input id="vin" name="vin" placeholder="1HGBH41JXMN109186" className="font-mono" />
      </div>

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending ? 'Saving...' : 'Add Car'}
      </Button>
    </form>
  )
}
