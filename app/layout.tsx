import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { TooltipProvider } from '@/components/ui/tooltip'
import ThemeProvider from '@/components/theme-provider'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'Car Service Book',
  description: 'Track your car service history',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans antialiased`}>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
