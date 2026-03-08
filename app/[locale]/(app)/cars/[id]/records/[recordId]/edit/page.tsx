import { redirect } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { cars, serviceRecords, recordPhotos } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { ArrowLeftIcon } from 'lucide-react'
import RecordForm from '@/components/forms/record-form'

type Props = { params: Promise<{ id: string; recordId: string }> }

export default async function EditRecordPage({ params }: Props) {
  const session = await getSession()
  if (!session) redirect(`/${await getLocale()}/login`)

  const { id, recordId } = await params

  const [result] = await db
    .select({ record: serviceRecords, car: { make: cars.make, model: cars.model } })
    .from(serviceRecords)
    .innerJoin(cars, and(eq(serviceRecords.carId, cars.id), eq(cars.userId, session.sub)))
    .where(and(eq(serviceRecords.id, recordId), eq(cars.id, id)))
    .limit(1)

  if (!result) notFound()
  const t = await getTranslations('editRecordPage')

  const photos = await db
    .select({ url: recordPhotos.url, publicId: recordPhotos.publicId })
    .from(recordPhotos)
    .where(eq(recordPhotos.recordId, recordId))

  return (
    <div className="max-w-lg mx-auto">
      <Link
        href={`/cars/${id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        {t('back')}
      </Link>
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
      <RecordForm
        carId={id}
        recordId={recordId}
        defaultValues={{ ...result.record, photos: photos.filter((p) => p.publicId).map((p) => ({ url: p.url, publicId: p.publicId! })) }}
      />
    </div>
  )
}
