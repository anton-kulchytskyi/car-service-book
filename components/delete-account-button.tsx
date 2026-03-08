'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export default function DeleteAccountButton() {
  const t = useTranslations('deleteAccount')
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(t('confirm'))) return

    setIsPending(true)
    try {
      const res = await fetch('/api/auth/me', { method: 'DELETE' })
      if (res.ok) {
        router.push('/')
        router.refresh()
      }
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
      {isPending ? t('deleting') : t('button')}
    </Button>
  )
}
