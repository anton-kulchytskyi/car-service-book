'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
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
  const t = useTranslations('carActionsMenu')
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
      if (!res.ok) { setTransferError(data.error ?? t('transferError')); return }
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
              <PencilIcon className="w-4 h-4" /> {t('editCar')}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() => { setEmail(''); setTransferError(''); setTransferOpen(true) }}
          >
            <ArrowRightLeftIcon className="w-4 h-4" /> {t('transferOwnership')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center gap-2 text-destructive focus:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2Icon className="w-4 h-4" /> {t('deleteCar')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Transfer dialog */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('transferTitle')}</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-muted-foreground">
              {t('transferNote')}
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="transfer-email">{t('newOwnerEmail')}</Label>
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
            <Button variant="outline" onClick={() => setTransferOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleTransfer} disabled={isPending || !email.trim()}>
              {isPending ? t('transferring') : t('transfer')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            {t('deleteNote')}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>{t('cancel')}</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? t('deleting') : t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
