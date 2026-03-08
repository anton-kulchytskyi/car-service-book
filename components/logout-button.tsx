'use client'

import { useTransition } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { LogOutIcon } from 'lucide-react'

export default function LogoutButton() {
  const t = useTranslations('header')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleLogout() {
    startTransition(async () => {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
      router.refresh()
    })
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} disabled={isPending}>
      <LogOutIcon className="w-4 h-4 mr-2" />
      {t('logout')}
    </Button>
  )
}
