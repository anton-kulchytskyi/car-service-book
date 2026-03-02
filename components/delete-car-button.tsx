'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2Icon } from 'lucide-react'

export default function DeleteCarButton({ carId }: { carId: string }) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Delete this car? All service records will also be deleted.')) return
    setIsPending(true)
    try {
      const res = await fetch(`/api/cars/${carId}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/dashboard')
        router.refresh()
      }
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isPending}
      className="text-muted-foreground hover:text-destructive"
    >
      <Trash2Icon className="w-4 h-4" />
    </Button>
  )
}
