import { redirect } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { cars } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { ArrowLeftIcon } from 'lucide-react'
import CarForm from '@/components/forms/car-form'

type Props = { params: Promise<{ id: string }> }

export default async function EditCarPage({ params }: Props) {
  const session = await getSession()
  if (!session) redirect(`/${await getLocale()}/login`)

  const { id } = await params

  const [car] = await db
    .select()
    .from(cars)
    .where(and(eq(cars.id, id), eq(cars.userId, session.sub)))
    .limit(1)

  if (!car) notFound()
  const t = await getTranslations('editCarPage')

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
      <CarForm carId={id} defaultValues={car} />
    </div>
  )
}
