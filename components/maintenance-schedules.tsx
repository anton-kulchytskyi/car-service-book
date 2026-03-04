'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import ScheduleForm from '@/components/forms/schedule-form'
import { getMaintenanceStatus } from '@/lib/utils'
import type { MaintenanceSchedule } from '@/lib/db/schema'
import { PlusIcon, PencilIcon, Trash2Icon } from 'lucide-react'

const STATUS_CONFIG = {
  overdue: { label: 'Overdue',  className: 'bg-destructive/10 text-destructive border-destructive/20' },
  soon:    { label: 'Due soon', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800' },
  ok:      { label: 'OK',       className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800' },
  unknown: { label: 'No data',  className: 'bg-muted text-muted-foreground border-border' },
}

function nextServiceText(schedule: MaintenanceSchedule, currentKm: number | null) {
  const parts: string[] = []
  if (schedule.intervalKm && schedule.lastDoneKm != null) {
    const next = schedule.lastDoneKm + schedule.intervalKm
    const diff = next - (currentKm ?? 0)
    parts.push(diff > 0 ? `in ${diff.toLocaleString()} km` : `${Math.abs(diff).toLocaleString()} km overdue`)
  }
  if (schedule.intervalMonths && schedule.lastDoneDate) {
    const next = new Date(schedule.lastDoneDate)
    next.setMonth(next.getMonth() + schedule.intervalMonths)
    const diff = Math.floor((next.getTime() - Date.now()) / 86400000)
    parts.push(diff > 0 ? `in ${diff}d` : `${Math.abs(diff)}d overdue`)
  }
  return parts.join(' / ') || '—'
}

type Props = {
  carId: string
  schedules: MaintenanceSchedule[]
  currentKm: number | null
}

export default function MaintenanceSchedules({ carId, schedules, currentKm }: Props) {
  const router = useRouter()
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<MaintenanceSchedule | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MaintenanceSchedule | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function refresh() { router.refresh() }

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await fetch(`/api/schedules/${deleteTarget.id}`, { method: 'DELETE' })
      setDeleteTarget(null)
      refresh()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Maintenance Schedule</h2>
        <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
          <PlusIcon className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {schedules.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No maintenance schedules yet. Add one to track when services are due.
        </p>
      ) : (
        <div className="space-y-2">
          {schedules.map((s) => {
            const status = getMaintenanceStatus(s, currentKm)
            const cfg = STATUS_CONFIG[status]
            return (
              <div key={s.id} className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
                <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded border ${cfg.className}`}>
                  {cfg.label}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{s.serviceName}</p>
                  <p className="text-xs text-muted-foreground">{nextServiceText(s, currentKm)}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setEditTarget(s)}>
                    <PencilIcon className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(s)}>
                    <Trash2Icon className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ScheduleForm
        carId={carId}
        open={addOpen}
        onOpenChange={setAddOpen}
        onSaved={refresh}
      />

      {editTarget && (
        <ScheduleForm
          carId={carId}
          open={!!editTarget}
          onOpenChange={(o) => { if (!o) setEditTarget(null) }}
          initial={editTarget}
          onSaved={refresh}
        />
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete schedule?</DialogTitle>
            <DialogDescription>
              &ldquo;{deleteTarget?.serviceName}&rdquo; will be removed. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
