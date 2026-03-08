'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Combobox from '@/components/ui/combobox'
import PhotoUpload, { type PhotoItem } from '@/components/photo-upload'
import { uploadFiles } from '@/lib/upload-files'
import { formatLicensePlate } from '@/lib/utils'
import { CAR_MAKES, getModels } from '@/lib/car-data'

type FieldErrors = Partial<Record<string, string[]>>

type DefaultValues = {
  make: string
  model: string
  year: number
  vin?: string | null
  licensePlate?: string | null
  photoUrl?: string | null
  photoPublicId?: string | null
}

type Props = {
  carId?: string
  defaultValues?: DefaultValues
}

export default function CarForm({ carId, defaultValues }: Props) {
  const t = useTranslations('carForm')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isPending, startTransition] = useTransition()
  const [make, setMake] = useState(defaultValues?.make ?? '')
  const [model, setModel] = useState(defaultValues?.model ?? '')
  const [licensePlate, setLicensePlate] = useState(
    formatLicensePlate(defaultValues?.licensePlate ?? '')
  )
  const [photo, setPhoto] = useState<PhotoItem[]>(
    defaultValues?.photoUrl && defaultValues?.photoPublicId
      ? [{ url: defaultValues.photoUrl, publicId: defaultValues.photoPublicId }]
      : []
  )
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
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
      photoUrl: photo[0]?.url ?? null,
      photoPublicId: photo[0]?.publicId ?? null,
    }

    startTransition(async () => {
      let uploaded = photo
      if (pendingFiles.length > 0) {
        try {
          const newItems = await uploadFiles(pendingFiles)
          uploaded = [...photo, ...newItems]
        } catch {
          setFieldErrors({ _: [t('photoError')] })
          return
        }
      }
      body.photoUrl = uploaded[0]?.url ?? null
      body.photoPublicId = uploaded[0]?.publicId ?? null

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
          <Label>{t('makeLabel')}</Label>
          <Combobox
            options={CAR_MAKES}
            value={make}
            onChange={handleMakeChange}
            placeholder={t('makePlaceholder')}
            searchPlaceholder={t('makeSearchPlaceholder')}
          />
          {fieldErrors.make && <p className="text-sm text-destructive">{fieldErrors.make[0]}</p>}
        </div>
        <div className="grid gap-1.5">
          <Label>{t('modelLabel')}</Label>
          <Combobox
            options={modelOptions}
            value={model}
            onChange={setModel}
            placeholder={modelOptions.length ? t('modelSelectPlaceholder') : t('modelTypePlaceholder')}
            searchPlaceholder={t('modelSearchPlaceholder')}
          />
          {fieldErrors.model && <p className="text-sm text-destructive">{fieldErrors.model[0]}</p>}
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="year">{t('yearLabel')}</Label>
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
        <Label htmlFor="licensePlate">{t('licensePlateLabel')}</Label>
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
        <Label htmlFor="vin">{t('vinLabel')}</Label>
        <Input id="vin" name="vin" placeholder="1HGBH41JXMN109186" className="font-mono uppercase" defaultValue={defaultValues?.vin ?? ''} />
      </div>

      <div className="grid gap-1.5">
        <Label>{t('photoLabel')}</Label>
        <PhotoUpload value={photo} onChange={setPhoto} onPendingFiles={setPendingFiles} max={1} label={t('addPhotoLabel')} hint={t('photoHint')} />
      </div>

      <Button type="submit" disabled={isPending || !make || !model} className="mt-2">
        {isPending ? t('saving') : isEdit ? t('saveChanges') : t('addCar')}
      </Button>
    </form>
  )
}
