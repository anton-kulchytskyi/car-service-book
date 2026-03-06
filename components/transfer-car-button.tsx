'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ArrowRightLeftIcon } from 'lucide-react'

export default function TransferCarButton({ carId }: { carId: string }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function handleTransfer() {
    setError('')
    setIsPending(true)
    try {
      const res = await fetch(`/api/cars/${carId}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      let data: { error?: string } = {}
      try { data = await res.json() } catch {}
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        return
      }
      setOpen(false)
      router.push('/dashboard')
      router.refresh()
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => { setEmail(''); setError(''); setOpen(true) }}
        className="text-muted-foreground hover:text-foreground"
        title="Transfer ownership"
      >
        <ArrowRightLeftIcon className="w-4 h-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Car Ownership</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-muted-foreground">
              The car will be permanently transferred to the new owner. You will lose access to it.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="transfer-email">New owner&apos;s email</Label>
              <Input
                id="transfer-email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTransfer()}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleTransfer} disabled={isPending || !email.trim()}>
              {isPending ? 'Transferring…' : 'Transfer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
