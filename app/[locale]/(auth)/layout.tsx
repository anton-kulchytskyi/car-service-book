import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { ArrowLeftIcon } from 'lucide-react'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('authLayout')

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          {t('backHome')}
        </Link>
        {children}
      </div>
    </div>
  )
}
