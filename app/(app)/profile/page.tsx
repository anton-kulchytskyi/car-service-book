import { redirect } from 'next/navigation'
import Link from 'next/link'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { Separator } from '@/components/ui/separator'
import { ArrowLeftIcon } from 'lucide-react'
import ProfileForm from '@/components/forms/profile-form'
import DeleteAccountButton from '@/components/delete-account-button'

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [user] = await db.select().from(users).where(eq(users.id, session.sub)).limit(1)
  if (!user) redirect('/login')

  return (
    <div className="max-w-lg mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Dashboard
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
      </div>

      <ProfileForm name={user.name} />

      <Separator className="my-8" />

      <div>
        <h2 className="text-base font-semibold text-destructive mb-1">Danger zone</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Deleting your account will permanently remove all your cars and service records. This action cannot be undone.
        </p>
        <DeleteAccountButton />
      </div>
    </div>
  )
}
