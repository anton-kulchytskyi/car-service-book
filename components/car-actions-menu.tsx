'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MoreHorizontalIcon, PencilIcon, ArrowRightLeftIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

type Props = { carId: string }

export default function CarActionsMenu({ carId }: Props) {
  const router = useRouter()
  const [transferOpen, setTransferOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [transferError, setTransferError] = useState('')
  const [isPending, setIsPending] = useState(false)

  async function handleTransfer() {
    setTransferError('')
    setIsPending(true)
    try {
      const res = await fetch(`/api/cars/${carId}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      let data: { error?: string } = {}
      try { data = await res.json() } catch {}
      if (!res.ok) { setTransferError(data.error ?? 'Something went wrong'); return }
      setTransferOpen(false)
      router.push('/dashboard')
      router.refresh()
    } finally {
      setIsPending(false)
    }
  }

  async function handleDelete() {
    setIsPending(true)
    try {
      const res = await fetch(`/api/cars/${carId}`, { method: 'DELETE' })
      if (res.ok) { router.push('/dashboard'); router.refresh() }
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <MoreHorizontalIcon className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/cars/${carId}/edit`} className="flex items-center gap-2">
              <PencilIcon className="w-4 h-4" /> Edit car
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() => { setEmail(''); setTransferError(''); setTransferOpen(true) }}
          >
            <ArrowRightLeftIcon className="w-4 h-4" /> Transfer ownership
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center gap-2 text-destructive focus:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2Icon className="w-4 h-4" /> Delete car
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Transfer dialog */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
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
            {transferError && <p className="text-sm text-destructive">{transferError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferOpen(false)}>Cancel</Button>
            <Button onClick={handleTransfer} disabled={isPending || !email.trim()}>
              {isPending ? 'Transferring…' : 'Transfer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this car?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            All service records, maintenance schedules and photos will be permanently deleted. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
