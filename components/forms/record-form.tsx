'use client'

import { useState, useTransition } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import PhotoUpload, { type PhotoItem } from '@/components/photo-upload'
import { uploadFiles } from '@/lib/upload-files'
import { SERVICE_TYPES } from '@/lib/constants'

type FieldErrors = Partial<Record<string, string[]>>

type DefaultValues = {
  date: Date | string
  mileage: number
  type: string
  description: string
  cost?: string | null
  photos?: PhotoItem[]
}

type Props = {
  carId: string
  recordId?: string
  defaultValues?: DefaultValues
}

export default function RecordForm({ carId, recordId, defaultValues }: Props) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isPending, startTransition] = useTransition()
  const [photos, setPhotos] = useState<PhotoItem[]>(defaultValues?.photos ?? [])
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [type, setType] = useState(defaultValues?.type ?? SERVICE_TYPES[0])
  const router = useRouter()
  const isEdit = !!recordId

  const today = new Date().toISOString().slice(0, 10)
  const defaultDate = defaultValues?.date
    ? new Date(defaultValues.date).toISOString().slice(0, 10)
    : today

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})

    const form = new FormData(e.currentTarget)
    const body = {
      ...(isEdit ? {} : { carId }),
      date: new Date(form.get('date') as string).toISOString(),
      mileage: Number(form.get('mileage')),
      type,
      description: form.get('description'),
      cost: (form.get('cost') as string) || undefined,
      photos,
    }

    startTransition(async () => {
      let allPhotos = photos
      if (pendingFiles.length > 0) {
        try {
          const newItems = await uploadFiles(pendingFiles)
          allPhotos = [...photos, ...newItems]
        } catch {
          setFieldErrors({ _: ['Photo upload failed. Please try again.'] })
          return
        }
      }
      body.photos = allPhotos

      const res = await fetch(isEdit ? `/api/records/${recordId}` : '/api/records', {
        method: isEdit ? 'PUT' : 'POST',
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="date">Date *</Label>
        <Input id="date" name="date" type="date" defaultValue={defaultDate} max={today} required />
        {fieldErrors.date && <p className="text-sm text-destructive">{fieldErrors.date[0]}</p>}
      </div>

      <div className="grid gap-1.5">
        <Label>Service Type *</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors.type && <p className="text-sm text-destructive">{fieldErrors.type[0]}</p>}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="mileage">Mileage (km) *</Label>
        <Input id="mileage" name="mileage" type="number" placeholder="50000" min={0} defaultValue={defaultValues?.mileage} required />
        {fieldErrors.mileage && <p className="text-sm text-destructive">{fieldErrors.mileage[0]}</p>}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="description">Description *</Label>
        <Input id="description" name="description" placeholder="Changed engine oil and filter" defaultValue={defaultValues?.description} required />
        {fieldErrors.description && <p className="text-sm text-destructive">{fieldErrors.description[0]}</p>}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="cost">Cost (UAH)</Label>
        <Input id="cost" name="cost" type="number" step="0.01" placeholder="1500.00" min={0} defaultValue={defaultValues?.cost ?? ''} />
      </div>

      <div className="grid gap-1.5">
        <Label>Photos</Label>
        <PhotoUpload value={photos} onChange={setPhotos} onPendingFiles={setPendingFiles} max={5} label="Add photos (receipts, parts, etc.)" />
      </div>

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Record'}
      </Button>
    </form>
  )
}
