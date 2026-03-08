import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { getSession } from '@/lib/auth/session'
import Header from '@/components/header'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect(`/${await getLocale()}/login`)

  return (
    <div className="min-h-screen bg-background">
      <Header name={session.name} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
