import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type MaintenanceStatus = 'ok' | 'soon' | 'overdue' | 'unknown'

export function getMaintenanceStatus(schedule: {
  intervalKm?: number | null
  intervalMonths?: number | null
  lastDoneKm?: number | null
  lastDoneDate?: Date | string | null
}, currentKm: number | null): MaintenanceStatus {
  const statuses: MaintenanceStatus[] = []

  if (schedule.intervalKm && schedule.lastDoneKm != null) {
    const nextKm = schedule.lastDoneKm + schedule.intervalKm
    const remaining = nextKm - (currentKm ?? 0)
    if (remaining <= 0) statuses.push('overdue')
    else if (remaining <= 1000) statuses.push('soon')
    else statuses.push('ok')
  }

  if (schedule.intervalMonths && schedule.lastDoneDate) {
    const last = new Date(schedule.lastDoneDate)
    const next = new Date(last)
    next.setMonth(next.getMonth() + schedule.intervalMonths)
    const now = new Date()
    const daysLeft = Math.floor((next.getTime() - now.getTime()) / 86400000)
    if (daysLeft <= 0) statuses.push('overdue')
    else if (daysLeft <= 30) statuses.push('soon')
    else statuses.push('ok')
  }

  if (statuses.length === 0) return 'unknown'
  if (statuses.includes('overdue')) return 'overdue'
  if (statuses.includes('soon')) return 'soon'
  return 'ok'
}

export function formatLicensePlate(plate: string): string {
  const clean = plate.toUpperCase().replace(/\s+/g, '')
  if (!clean) return ''
  // Insert spaces on letter↔digit transitions: "AA1234BB" → "AA 1234 BB"
  return clean.split(/(?<=\p{L})(?=\d)|(?<=\d)(?=\p{L})/u).join(' ')
}
