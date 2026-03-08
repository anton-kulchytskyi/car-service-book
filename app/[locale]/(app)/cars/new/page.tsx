import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { ArrowLeftIcon } from 'lucide-react'
import CarForm from '@/components/forms/car-form'

export default async function NewCarPage() {
  const t = await getTranslations('newCarPage')
  return (
    <div className="max-w-lg mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        {t('backToCars')}
      </Link>
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
      <CarForm />
    </div>
  )
}
