'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2Icon } from 'lucide-react'

export default function DeleteRecordButton({ recordId }: { recordId: string }) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Delete this service record?')) return
    setIsPending(true)
    try {
      const res = await fetch(`/api/records/${recordId}`, { method: 'DELETE' })
      if (res.ok) router.refresh()
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
      className="shrink-0 text-muted-foreground hover:text-destructive"
    >
      <Trash2Icon className="w-4 h-4" />
    </Button>
  )
}
