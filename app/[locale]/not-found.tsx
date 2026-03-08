import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { CarIcon } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Page not found | Service Book',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-6">
        <CarIcon className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-2">404</p>
      <h1 className="text-2xl font-bold mb-2">Page not found</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">My Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
