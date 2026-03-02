'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function DeleteAccountButton() {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (
      !confirm(
        'Are you sure you want to delete your account?\n\nThis will permanently delete all your cars and service records. This action cannot be undone.'
      )
    )
      return

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
      {isPending ? 'Deleting...' : 'Delete my account'}
    </Button>
  )
}
