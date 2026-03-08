import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { getMessages } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { TooltipProvider } from '@/components/ui/tooltip'
import ThemeProvider from '@/components/theme-provider'
import '../globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'Car Service Book',
  description: 'Track your car service history',
}

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geist.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
