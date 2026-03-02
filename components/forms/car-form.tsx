'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Combobox from '@/components/ui/combobox'
import { formatLicensePlate } from '@/lib/utils'
import { CAR_MAKES, getModels } from '@/lib/car-data'

type FieldErrors = Partial<Record<string, string[]>>

type DefaultValues = {
  make: string
  model: string
  year: number
  vin?: string | null
  licensePlate?: string | null
}

type Props = {
  carId?: string
  defaultValues?: DefaultValues
}

export default function CarForm({ carId, defaultValues }: Props) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isPending, startTransition] = useTransition()
  const [make, setMake] = useState(defaultValues?.make ?? '')
  const [model, setModel] = useState(defaultValues?.model ?? '')
  const [licensePlate, setLicensePlate] = useState(
    formatLicensePlate(defaultValues?.licensePlate ?? '')
  )
  const router = useRouter()
  const isEdit = !!carId

  const modelOptions = getModels(make)

  function handleMakeChange(newMake: string) {
    setMake(newMake)
    // Clear model only if the previous model isn't valid for the new make
    if (model && getModels(newMake).length > 0 && !getModels(newMake).includes(model)) {
      setModel('')
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})

    const form = new FormData(e.currentTarget)
    const body = {
      make,
      model,
      year: Number(form.get('year')),
      vin: ((form.get('vin') as string) || '').toUpperCase() || undefined,
      licensePlate: licensePlate.replace(/\s+/g, '') || undefined,
    }

    startTransition(async () => {
      const res = await fetch(isEdit ? `/api/cars/${carId}` : '/api/cars', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        router.push(`/cars/${isEdit ? carId : data.car.id}`)
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
          <Label>Make *</Label>
          <Combobox
            options={CAR_MAKES}
            value={make}
            onChange={handleMakeChange}
            placeholder="Toyota"
            searchPlaceholder="Search make..."
          />
          {fieldErrors.make && <p className="text-sm text-destructive">{fieldErrors.make[0]}</p>}
        </div>
        <div className="grid gap-1.5">
          <Label>Model *</Label>
          <Combobox
            options={modelOptions}
            value={model}
            onChange={setModel}
            placeholder={modelOptions.length ? 'Select model' : 'Type model'}
            searchPlaceholder="Search model..."
          />
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
          defaultValue={defaultValues?.year}
          required
        />
        {fieldErrors.year && <p className="text-sm text-destructive">{fieldErrors.year[0]}</p>}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="licensePlate">License Plate</Label>
        <Input
          id="licensePlate"
          name="licensePlate"
          placeholder="AA 1234 BB"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
          onBlur={(e) => setLicensePlate(formatLicensePlate(e.target.value))}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="vin">VIN</Label>
        <Input id="vin" name="vin" placeholder="1HGBH41JXMN109186" className="font-mono uppercase" defaultValue={defaultValues?.vin ?? ''} />
      </div>

      <Button type="submit" disabled={isPending || !make || !model} className="mt-2">
        {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Car'}
      </Button>
    </form>
  )
}
