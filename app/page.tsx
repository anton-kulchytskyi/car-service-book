import Link from 'next/link'
import { getSession } from '@/lib/auth/session'
import { Button } from '@/components/ui/button'
import { CarIcon, ClipboardListIcon, ShieldCheckIcon, WrenchIcon } from 'lucide-react'

const features = [
  {
    icon: CarIcon,
    title: 'Multiple Cars',
    description: 'Keep track of all your vehicles in one place.',
  },
  {
    icon: WrenchIcon,
    title: 'Service Records',
    description: 'Log every oil change, inspection, and repair with date and mileage.',
  },
  {
    icon: ClipboardListIcon,
    title: 'Full History',
    description: 'See the complete service history of each car at a glance.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Your Data',
    description: 'Private and secure — only you can see your records.',
  },
]

export default async function LandingPage() {
  const session = await getSession()

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
            {session ? (
              <Button size="sm" asChild>
                <Link href="/dashboard">My Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Get started</Link>
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
          Your car's service history, always at hand
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-md">
          Service Book is a simple tool to log and track maintenance records for all your vehicles — oil changes, inspections, repairs, and more.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          {session ? (
            <Button size="lg" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button size="lg" asChild>
                <Link href="/register">Create free account</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign in</Link>
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

      {/* Footer */}
      <footer className="border-t px-4 py-6 text-center text-sm text-muted-foreground">
        Service Book — track what matters for your car
      </footer>
    </div>
  )
}
