import { Link } from '@/i18n/navigation'
import { getSession } from '@/lib/auth/session'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/theme-toggle'
import LocaleSwitcher from '@/components/locale-switcher'
import { CarIcon, ClipboardListIcon, ShieldCheckIcon, WrenchIcon } from 'lucide-react'

export default async function LandingPage() {
  const [session, t] = await Promise.all([getSession(), getTranslations('landing')])

  const features = [
    { icon: CarIcon,           title: t('features.multipleCars.title'),    description: t('features.multipleCars.description') },
    { icon: WrenchIcon,        title: t('features.serviceRecords.title'),   description: t('features.serviceRecords.description') },
    { icon: ClipboardListIcon, title: t('features.fullHistory.title'),      description: t('features.fullHistory.description') },
    { icon: ShieldCheckIcon,   title: t('features.yourData.title'),         description: t('features.yourData.description') },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <CarIcon className="w-5 h-5" />
            Service Book
          </div>
          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle />
            {session ? (
              <Button size="sm" asChild>
                <Link href="/dashboard">{t('nav.dashboard')}</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">{t('nav.signIn')}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">{t('nav.getStarted')}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-6">
          <CarIcon className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4 max-w-lg">
          {t('hero.title')}
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-md">
          {t('hero.description')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          {session ? (
            <Button size="lg" asChild>
              <Link href="/dashboard">{t('hero.ctaDashboard')}</Link>
            </Button>
          ) : (
            <>
              <Button size="lg" asChild>
                <Link href="/register">{t('hero.cta')}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/demo">{t('hero.ctaDemo')}</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/40 px-4 py-16">
        <div className="container mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-background border">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo CTA */}
      {!session && (
        <section className="border-t px-4 py-16">
          <div className="container mx-auto max-w-xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              {t('demo.eyebrow')}
            </p>
            <h2 className="text-2xl font-bold mb-3">{t('demo.title')}</h2>
            <p className="text-muted-foreground mb-6">{t('demo.description')}</p>
            <Button size="lg" variant="outline" asChild>
              <Link href="/demo">{t('demo.button')}</Link>
            </Button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t px-4 py-6 text-center text-sm text-muted-foreground">
        {t('footer')}
      </footer>
    </div>
  )
}
